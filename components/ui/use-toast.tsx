"use client";

import * as React from "react";

export type ToastTone = "default" | "success" | "warn";

export type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  tone?: ToastTone;
};

type State = { toasts: ToastItem[] };

type Action =
  | { type: "ADD"; toast: ToastItem }
  | { type: "DISMISS"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD":
      return { toasts: [action.toast, ...state.toasts].slice(0, 3) };
    case "DISMISS":
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

const ToastStateContext = React.createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function ToastProviderState({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] });
  return <ToastStateContext.Provider value={{ state, dispatch }}>{children}</ToastStateContext.Provider>;
}

export function useToast() {
  const ctx = React.useContext(ToastStateContext);
  if (!ctx) throw new Error("useToast must be used within ToastProviderState");
  const { state, dispatch } = ctx;
  function toast(input: Omit<ToastItem, "id">) {
    const id = crypto.randomUUID();
    dispatch({ type: "ADD", toast: { id, ...input } });
    return { id, dismiss: () => dispatch({ type: "DISMISS", id }) };
  }
  return { ...state, toast, dismiss: (id: string) => dispatch({ type: "DISMISS", id }) };
}

