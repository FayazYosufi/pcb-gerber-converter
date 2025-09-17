// src/Components/PCB-View/index.tsx
import { useGerber } from "../../context/GerberContext";
// import LayerToggler from "./LayerToggler";
import LayerToggler from "./deepseek";

export default function ViewPCB() {
  const { state, loadGerbers } = useGerber();

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload PCB ZIP</h2>
      <input type="file" accept=".zip" onChange={(e) => loadGerbers(e.target.files)} />

      {state.error && <p style={{ color: "red" }}>{state.error}</p>}
      {state.loading && <p>Loading…</p>}

      {/* <LayerToggler layersMap={state.layersMap} /> */}
      {/* <LayerToggler files={Array.from(files)} /> */}
      <LayerToggler layersMap={Array.from(state.layersMap)} />
    </div>
  );
}