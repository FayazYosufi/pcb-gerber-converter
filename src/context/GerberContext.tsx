import React, { createContext, useContext, useReducer } from "react";
import { plot, read, renderLayers, stringifySvg } from "@tracespace/core";
import type { RenderLayersResult } from "@tracespace/core";
import JSZip from "jszip";

interface State {
  layersMap: RenderLayersResult;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: RenderLayersResult }
  | { type: "LOAD_ERROR"; payload: string };

const initialState: State = {
  layersMap: { layers: [], rendersById: {}, boardShapeRender: { viewBox: [0, 0, 0, 0] } },
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
    default:
      return state;
  }
}

const GerberContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  loadGerbers: (files: FileList | null) => Promise<void>;
} | null>(null);

export const GerberProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(gerberReducer, initialState);

  const loadGerbers = async (files: FileList | null) => {
    if (!files) return;
    dispatch({ type: "LOAD_START" });
    try {
      const zip = await JSZip.loadAsync(files[0]);
      const zipFiles = await Promise.all(
        Object.values(zip.files)
          .filter(entry => !entry.dir)
          .map(async entry => new File([await entry.async("arraybuffer")], entry.name.split("/").pop() || "file"))
      );
      const layersMap = await renderLayers(plot(await read(zipFiles)));
      dispatch({ type: "LOAD_SUCCESS", payload: layersMap });
    } catch (err: any) {
      dispatch({ type: "LOAD_ERROR", payload: err.message });
    }
  };

  return (
    <GerberContext.Provider value={{ state, dispatch, loadGerbers }}>
      {children}
    </GerberContext.Provider>
  );
};

export const useGerber = () => {
  const ctx = useContext(GerberContext);
  if (!ctx) throw new Error("useGerber must be used within GerberProvider");
  return ctx;
};