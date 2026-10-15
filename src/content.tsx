import { createContext, useContext, useState, type ReactNode } from "react";
import { defaultContent, type Content } from "./data/profile";

type ContentState = {
  content: Content;
  /** Bumped on every change, so animated sections remount with the new text. */
  revision: number;
  setContent: (next: Content) => void;
};

const ContentContext = createContext<ContentState | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ content: defaultContent, revision: 0 });
  const setContent = (content: Content) => setState((prev) => ({ content, revision: prev.revision + 1 }));
  return (
    <ContentContext.Provider value={{ ...state, setContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const value = useContext(ContentContext);
  if (!value) throw new Error("useContent must be used inside ContentProvider");
  return value;
}
