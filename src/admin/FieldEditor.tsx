import { templates } from "../data/profile";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const LABELS: Record<string, string> = {
  name: "Full name",
  headline: "Hero line",
  journeyLead: "Missions intro",
  projectsLead: "Projects intro",
  skillsLead: "Skills intro",
  summonLead: "Contact intro",
  quests: "Missions",
  points: "Details",
  repo: "Source / frontend repo URL",
  repo2: "Backend repo URL",
  demo: "Live demo URL",
  href: "Link (https:// or mailto:)",
  id: "ID (short, unique)",
  kind: "Type",
  items: "Skills",
};

const LONG = new Set(["summary", "description", "note", "headline", "points", "journeyLead", "projectsLead", "skillsLead", "summonLead"]);

const humanize = (key: string) =>
  LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

function blank(value: Json): Json {
  if (typeof value === "string") return "";
  if (Array.isArray(value)) return [];
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blank(v)]));
  return value;
}

function newItem(key: string, list: Json[]): Json {
  const template = templates[key] as Json | undefined;
  if (template !== undefined) return structuredClone(template);
  return list.length ? blank(list[0]) : "";
}

function itemTitle(item: Json, index: number) {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const label = item.title ?? item.label ?? item.key ?? item.degree;
    if (typeof label === "string" && label.trim()) return label;
  }
  return `Item ${index + 1}`;
}

function move<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}

type Props = { name: string; value: Json; onChange: (value: Json) => void; long?: boolean };

export function FieldEditor({ name, value, onChange, long }: Props) {
  if (typeof value === "string") {
    if (name === "status") {
      return (
        <label className="admin-field">
          <span>{humanize(name)}</span>
          <select value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="active">Active mission (current job)</option>
            <option value="complete">Mission complete (past job)</option>
          </select>
        </label>
      );
    }
    const isLong = long || LONG.has(name);
    return (
      <label className="admin-field">
        {name ? <span>{humanize(name)}</span> : null}
        {isLong ? (
          <textarea value={value} rows={Math.min(8, Math.max(2, Math.ceil(value.length / 70)))} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)} />
        )}
      </label>
    );
  }

  if (Array.isArray(value)) {
    const objects = value.some((item) => item && typeof item === "object");
    const update = (index: number, item: Json) => onChange(value.map((old, i) => (i === index ? item : old)));
    const controls = (index: number) => (
      <span className="admin-item-actions">
        <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => onChange(move(value, index, index - 1))}>↑</button>
        <button type="button" aria-label="Move down" disabled={index === value.length - 1} onClick={() => onChange(move(value, index, index + 1))}>↓</button>
        <button type="button" aria-label="Remove" className="admin-danger" onClick={() => onChange(value.filter((_, i) => i !== index))}>✕</button>
      </span>
    );

    return (
      <fieldset className={name ? "admin-list" : "admin-list admin-list--bare"}>
        {name ? <legend>{humanize(name)}</legend> : null}
        {value.map((item, index) =>
          objects ? (
            <details key={index} className="admin-card">
              <summary>
                <span>{itemTitle(item, index)}</span>
                {controls(index)}
              </summary>
              <FieldEditor name="" value={item} onChange={(next) => update(index, next)} />
            </details>
          ) : (
            <div key={index} className="admin-row">
              <FieldEditor name="" value={item} long={LONG.has(name)} onChange={(next) => update(index, next)} />
              {controls(index)}
            </div>
          ),
        )}
        <button type="button" className="admin-add" onClick={() => onChange([...value, newItem(name, value)])}>
          + Add {objects || templates[name] ? "item" : "line"}
        </button>
      </fieldset>
    );
  }

  if (value && typeof value === "object") {
    const fields = (
      <div className="admin-fields">
        {Object.entries(value).map(([key, field]) => (
          <FieldEditor key={key} name={key} value={field} onChange={(next) => onChange({ ...value, [key]: next })} />
        ))}
      </div>
    );
    return name ? (
      <fieldset className="admin-group">
        <legend>{humanize(name)}</legend>
        {fields}
      </fieldset>
    ) : fields;
  }

  return null;
}

export type { Json };
