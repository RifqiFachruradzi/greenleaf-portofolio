import { useEffect, useRef, useState, type FormEvent } from "react";
import { useContent } from "../content";
import type { Content } from "../data/profile";
import { FieldEditor, type Json } from "./FieldEditor";
import { fetchContent, loadToken, REPO, saveContent, storeToken, verifyToken } from "./github";

const TABS: { key: keyof Content; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "quests", label: "Missions" },
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "education", label: "Education" },
  { key: "contacts", label: "Contacts" },
  { key: "sections", label: "Section text" },
];

const TOKEN_URL =
  "https://github.com/settings/personal-access-tokens/new?name=Portfolio+admin&description=Edit+souls-portofolio+content";

/** The admin entry in the nav: a login dialog, then the content editor. */
export function AdminButton({ onOpen }: { onOpen?: () => void }) {
  const [token, setToken] = useState(loadToken);
  const [view, setView] = useState<"closed" | "login" | "editor">("closed");

  const open = () => {
    onOpen?.();
    setView(token ? "editor" : "login");
  };

  return (
    <>
      <button type="button" className="nav-admin" onClick={open}>
        {token ? "Edit" : "Login"}
      </button>
      {view === "login" ? (
        <LoginDialog
          onCancel={() => setView("closed")}
          onLogin={(value) => {
            storeToken(value);
            setToken(value);
            setView("editor");
          }}
        />
      ) : null}
      {view === "editor" && token ? (
        <Editor
          token={token}
          onClose={() => setView("closed")}
          onLogout={() => {
            storeToken(null);
            setToken(null);
            setView("closed");
          }}
        />
      ) : null}
    </>
  );
}

function useModal(onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    if (!dialog.open) dialog.showModal();
    const cancel = (event: Event) => {
      event.preventDefault();
      close.current();
    };
    dialog.addEventListener("cancel", cancel);
    return () => dialog.removeEventListener("cancel", cancel);
  }, []);
  return ref;
}

function LoginDialog({ onLogin, onCancel }: { onLogin: (token: string) => void; onCancel: () => void }) {
  const ref = useModal(onCancel);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await verifyToken(value.trim());
      onLogin(value.trim());
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <dialog ref={ref} className="admin-dialog" aria-labelledby="admin-login-title">
      <form onSubmit={submit}>
        <p className="admin-kicker">Admin</p>
        <h2 id="admin-login-title">Login</h2>
        <p className="admin-help">
          Masuk dengan GitHub token yang punya akses tulis ke <code>{REPO.owner}/{REPO.name}</code>. Perubahan disimpan
          sebagai commit ke branch <code>{REPO.branch}</code>, lalu situs ter-deploy ulang otomatis.
        </p>
        <label className="admin-field">
          <span>GitHub token</span>
          <input
            type="password"
            autoComplete="current-password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="github_pat_…"
            required
            autoFocus
          />
        </label>
        <p className="admin-help admin-small">
          Belum punya? <a href={TOKEN_URL} target="_blank" rel="noreferrer">Buat fine-grained token</a>, pilih repository{" "}
          <code>{REPO.name}</code> saja, dan beri izin <strong>Contents: Read and write</strong>.
        </p>
        {error ? <p className="admin-error" role="alert">{error}</p> : null}
        <div className="admin-actions">
          <button type="button" onClick={onCancel}>Batal</button>
          <button type="submit" className="admin-primary" disabled={busy || !value.trim()}>
            {busy ? "Memeriksa…" : "Login"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

type Status = { kind: "idle" | "busy" | "ok" | "error"; text: string; link?: string };

function Editor({ token, onClose, onLogout }: { token: string; onClose: () => void; onLogout: () => void }) {
  const ref = useModal(onClose);
  const { content, setContent } = useContent();
  const [draft, setDraft] = useState<Content>(() => structuredClone(content));
  const [tab, setTab] = useState<keyof Content | "json">("profile");
  const [json, setJson] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle", text: "" });
  const [message, setMessage] = useState("");

  // main can hold a commit the running build doesn't have yet; start from it
  useEffect(() => {
    let live = true;
    fetchContent(token)
      .then((latest) => {
        if (live && JSON.stringify(latest) !== JSON.stringify(content)) {
          setDraft(latest);
          setStatus({ kind: "ok", text: "Memuat versi terbaru dari GitHub (belum ter-deploy)." });
        }
      })
      .catch((err: Error & { status?: number }) => {
        if (live && err.status === 401) setStatus({ kind: "error", text: "Token kedaluwarsa. Logout lalu login lagi." });
      });
    return () => {
      live = false;
    };
  }, [token]);

  const switchTab = (next: keyof Content | "json") => {
    if (next === "json") setJson(JSON.stringify(draft, null, 2));
    setTab(next);
  };

  const applyJson = () => {
    try {
      const parsed = JSON.parse(json) as Content;
      setDraft(parsed);
      setStatus({ kind: "ok", text: "JSON diterapkan ke draft." });
      return parsed;
    } catch (err) {
      setStatus({ kind: "error", text: `JSON tidak valid: ${(err as Error).message}` });
      return null;
    }
  };

  const current = () => (tab === "json" ? applyJson() : draft);

  const preview = () => {
    const next = current();
    if (!next) return;
    setContent(next);
    setStatus({ kind: "ok", text: "Preview diterapkan di halaman ini saja. Klik Publish untuk menyimpan." });
  };

  const publish = async () => {
    const next = current();
    if (!next) return;
    setStatus({ kind: "busy", text: "Menyimpan ke GitHub…" });
    try {
      const link = await saveContent(token, next, message.trim() || "Update portfolio content");
      setContent(next);
      setMessage("");
      setStatus({ kind: "ok", text: "Tersimpan. Situs akan ter-update setelah deploy selesai (±1–2 menit).", link });
    } catch (err) {
      setStatus({ kind: "error", text: `Gagal menyimpan: ${(err as Error).message}` });
    }
  };

  return (
    <dialog ref={ref} className="admin-dialog admin-editor" aria-labelledby="admin-editor-title">
      <header className="admin-head">
        <div>
          <p className="admin-kicker">Admin</p>
          <h2 id="admin-editor-title">Edit portfolio</h2>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={onLogout}>Logout</button>
          <button type="button" onClick={onClose} aria-label="Close editor">✕</button>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Content sections">
        {TABS.map((t) => (
          <button key={t.key} type="button" aria-current={tab === t.key} onClick={() => switchTab(t.key)}>
            {t.label}
          </button>
        ))}
        <button type="button" aria-current={tab === "json"} onClick={() => switchTab("json")}>JSON</button>
      </nav>

      <div className="admin-body">
        {tab === "json" ? (
          <label className="admin-field">
            <span>Semua konten (JSON)</span>
            <textarea className="admin-json" value={json} spellCheck={false} onChange={(e) => setJson(e.target.value)} />
          </label>
        ) : (
          <FieldEditor
            key={tab}
            name=""
            value={draft[tab] as unknown as Json}
            onChange={(value) => setDraft({ ...draft, [tab]: value })}
          />
        )}
      </div>

      <footer className="admin-foot">
        {status.text ? (
          <p className={`admin-status admin-status--${status.kind}`} role="status">
            {status.text}{" "}
            {status.link ? <a href={status.link} target="_blank" rel="noreferrer">Lihat commit</a> : null}
          </p>
        ) : null}
        <div className="admin-actions">
          <input
            className="admin-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Catatan perubahan (opsional)"
            aria-label="Commit message"
          />
          <button type="button" onClick={() => setDraft(structuredClone(content))}>Reset</button>
          <button type="button" onClick={preview}>Preview</button>
          <button type="button" className="admin-primary" disabled={status.kind === "busy"} onClick={publish}>
            Publish
          </button>
        </div>
      </footer>
    </dialog>
  );
}
