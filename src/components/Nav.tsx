import { useEffect, useState } from "react";
import { FrogMark } from "./FrogMark";
import { AdminButton } from "../admin/AdminPanel";

const LINKS = [
  { href: "#bonfire", label: "About" },
  { href: "#journey", label: "Missions" },
  { href: "#relics", label: "Projects" },
  { href: "#attributes", label: "Jutsu" },
  { href: "#summon", label: "Summon" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`nav${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <a className="nav-brand" href="#top" onClick={() => setOpen(false)}>
        <FrogMark className="nav-frog" size={24} />
        <span className="nav-wordmark">Portofolio</span>
      </a>
      <AdminButton onOpen={() => setOpen(false)} />
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="nav-links"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Menu"}
      </button>
      <nav id="nav-links" aria-label="Sections">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
