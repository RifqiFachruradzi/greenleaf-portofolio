// The site is static, so the admin "backend" is the GitHub repository itself: logging in means
// pasting a GitHub token that can push to this repo, and saving commits content.json to main.
// The host (e.g. Vercel) rebuilds the site from that commit.
import type { Content } from "../data/profile";

export const REPO = { owner: "RifqiFachruradzi", name: "souls-portofolio", branch: "main", path: "src/data/content.json" };

const API = `https://api.github.com/repos/${REPO.owner}/${REPO.name}`;
const TOKEN_KEY = "souls-admin-token";

export function loadToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // private mode: the session still works until the tab closes
  }
}

async function request(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw Object.assign(new Error(body.message ?? `GitHub answered ${res.status}`), { status: res.status });
  }
  return res.json();
}

/** Checks that the token can push to the repository. */
export async function verifyToken(token: string) {
  let repo: { permissions?: { push?: boolean } };
  try {
    repo = await request(token, "");
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 401) throw new Error("Token tidak valid atau sudah kedaluwarsa.");
    if (status === 404) throw new Error("Token ini tidak punya akses ke repository portfolio.");
    throw error;
  }
  if (!repo.permissions?.push) throw new Error("Token ini hanya bisa membaca. Beri izin Contents: Read and write.");
}

function fromBase64(b64: string) {
  const bytes = Uint8Array.from(atob(b64.replace(/\n/g, "")), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function toBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

type FileInfo = { sha: string; content: string };

async function readFile(token: string) {
  return (await request(token, `/contents/${REPO.path}?ref=${REPO.branch}&t=${Date.now()}`)) as FileInfo;
}

/** The content as committed on main, which can be newer than this build. */
export async function fetchContent(token: string) {
  return JSON.parse(fromBase64((await readFile(token)).content)) as Content;
}

/** Commits the content to main and returns the commit URL. */
export async function saveContent(token: string, content: Content, message: string) {
  const { sha } = await readFile(token);
  const res = (await request(token, `/contents/${REPO.path}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      branch: REPO.branch,
      sha,
      content: toBase64(`${JSON.stringify(content, null, 2)}\n`),
    }),
  })) as { commit: { html_url: string } };
  return res.commit.html_url;
}
