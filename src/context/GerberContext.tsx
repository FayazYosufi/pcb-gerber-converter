// src/context/GerberContext.tsx
import React, { createContext, useContext, useReducer, ReactNode, } from "react";
import { plot, read, renderLayers } from "@tracespace/core";
// import handleZipUpload from "./handleZipUpload";

import JSZip from "jszip";

async function handleZipUpload(file: File | null): Promise<File[]> {
  if (!file) throw new Error("no file");
  const zip = await JSZip.loadAsync(file);
  return Promise.all(
    Object.values(zip.files)
      .filter((entry) => !entry.dir)
      .map(async (entry) => {
        const buf = await entry.async("arraybuffer");
        const name = entry.name.split("/").pop() || "file";
        return new File([buf], name, { type: "application/octet-stream" });
      })
  );
}

import type { RenderLayersResult } from "@tracespace/core";

async function convertGerberFiles(fileList: FileList | null): Promise<RenderLayersResult> {
  if (!fileList?.length) throw new Error("No file");
  const files   = await handleZipUpload(fileList[0]);
  const readRes = await read(files);
  const plotRes = plot(readRes);
  return renderLayers(plotRes);   // ← entire map
}


type State = {
  layersMap:  RenderLayersResult; // map id -> rendered layer
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
  boardShapeRender: { viewBox: [0, 0, 0, 0] }, // ✅ only required field
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

/* ----------------- CONTEXT ----------------- */
type Ctx = {
  state: State;
  dispatch: React.Dispatch<Action>;
  loadGerbers: (files: FileList | null) => Promise<void>;
};

const GerberContext = createContext<Ctx | null>(null);

/* ----------------- PROVIDER ----------------- */
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

  return (
    <GerberContext.Provider value={{ state, dispatch, loadGerbers }}>
      {children}
    </GerberContext.Provider>
  );
};

/* ----------------- HOOK ----------------- */
export const useGerber = () => {
  const ctx = useContext(GerberContext);
  if (!ctx) throw new Error("useGerber must be used within GerberProvider");
  return ctx;
};