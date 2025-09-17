// src/context/GerberContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { convertGerberFiles } from "../helper/convertGerberFiles";
import type { RenderLayersResult } from "@tracespace/core";

type State = {
  layersMap: RenderLayersResult;
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: RenderLayersResult }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "RESET" };

const EMPTY_LAYERS: RenderLayersResult = {
  layers: [],
  rendersById: {},
  boardShapeRender: { viewBox: [0, 0, 0, 0] },
};

const initialState: State = {
  layersMap: EMPTY_LAYERS,
  loading: false,
  error: null,
};

function gerberReducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: null };
    case "LOAD_SUCCESS":
      return { ...state, loading: false, layersMap: action.payload };
    case "LOAD_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

type Ctx = { state: State; dispatch: React.Dispatch<Action>; loadGerbers: (f: FileList | null) => Promise<void> };
const GerberContext = createContext<Ctx | null>(null);

export const GerberProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gerberReducer, initialState);
  const loadGerbers = async (files: FileList | null) => {
    if (!files) return;
    dispatch({ type: "LOAD_START" });
    try {
      const layersMap = await convertGerberFiles(files);
      dispatch({ type: "LOAD_SUCCESS", payload: layersMap });
    } catch (err: any) {
      dispatch({ type: "LOAD_ERROR", payload: err.message ?? "Failed to load" });
    }
  };
  return <GerberContext.Provider value={{ state, dispatch, loadGerbers }}>{children}</GerberContext.Provider>;
};

export const useGerber = () => {
  const ctx = useContext(GerberContext);
  if (!ctx) throw new Error("useGerber must be used within GerberProvider");
  return ctx;
};