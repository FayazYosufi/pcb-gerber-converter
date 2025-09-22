import { useGerber } from "../../context/GerberContext";
import LayerToggler from "./PcbViow";

export default function ViewPCB() {
  const { state, loadGerbers } = useGerber();

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <h2 className="mb-5 text-2xl font-semibold text-gray-800">Upload PCB ZIP</h2>
      <input
        type="file"
        accept=".zip"
        onChange={e => loadGerbers(e.target.files)}
        className="mb-5"
      />
      {state.error && <p className="text-red-600">{state.error}</p>}
      {state.loading && <p>Loading…</p>}
      {state.layersMap.layers.length > 0 && <LayerToggler layersMap={state.layersMap} />}
    </div>
  );
}