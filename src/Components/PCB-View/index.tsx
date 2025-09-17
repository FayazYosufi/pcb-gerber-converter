import { useMemo, useState } from "react";
import { useGerber } from "../../context/GerberContext";

import type { RenderLayersResult } from "@tracespace/core";
import { toHtml } from "hast-util-to-html";

interface Props {
  layersMap: RenderLayersResult;
}

export function LayerToggler({ layersMap }: Props) {
  const { layers, rendersById } = layersMap;
  console.log(layers)
  /* ------------- split by side ------------- */
  const topLayers = useMemo(() => layers.filter((l) => l.side === "top"), [layers]);
  const bottomLayers = useMemo(() => layers.filter((l) => l.side === "bottom"), [layers]);

  /* ------------- visibility state ------------- */
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(layers.map((L) => [L.id, true as boolean]))
  );

  /* ------------- helpers ------------- */
  const toggleOne = (id: string) =>
    setVisible((v) => ({ ...v, [id]: !v[id] }));

  const toggleSide = (sideLayers: typeof layers) => {
    const next = !sideLayers.every((l) => visible[l.id]);
    setVisible((v) => {
      const copy = { ...v };
      sideLayers.forEach((l) => (copy[l.id] = next));
      return copy;
    });
  };

const renderSvg = (id: string) => {
  const svgContent = toHtml(JSON.parse(JSON.stringify(rendersById[id])));
  // Add class names based on layer type
  const layerClass = `${layers.find(l => l.id === id)?.type} ${layers.find(l => l.id === id)?.side}` || '';
  console.log(layerClass)
  
  const styledSvg = svgContent.replace(
    '<svg',
    `<svg class="gerber-layer ${layerClass}"`
  );

  return (
    <div
      key={id}
      className="board"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      dangerouslySetInnerHTML={{ __html: styledSvg }}
    />
  );
};

  /* ------------- UI ------------- */
  return (
    <div style={{minHeight:'500px'}}>
      {/* ---------- TOP SIDE ---------- */}
      <section style={{ marginBottom: 12 }}>
        <h3 style={{ margin: "4px 0" }}>
          <label>
            <input
              type="checkbox"
              key={`top-${topLayers.length}`}          // stable key
              checked={topLayers.length > 0 && topLayers.every((l) => visible[l.id])}
              ref={(el) => {
                if (!topLayers.length || !el) return;
                el.indeterminate =
                  !topLayers.every((l) => visible[l.id]) &&
                  !topLayers.every((l) => !visible[l.id]);
              }}
              onChange={() => toggleSide(topLayers)}
            />
            {" Top Side"}
          </label>
        </h3>
        <div style={{ paddingLeft: 16 }}>
          {topLayers.map((l) => (
            <label key={l.id} style={{ marginRight: 10 }}>
              <input
                type="checkbox"
                checked={Boolean(visible[l.id])}   // ← always boolean
                onChange={() => toggleOne(l.id)}
              />
              {l.type}
            </label>
          ))}
        </div>
      </section>

      {/* ---------- BOTTOM SIDE ---------- */}
      <section>
        <h3 style={{ margin: "4px 0" }}>
          <label>
            <input
              type="checkbox"
              key={`bot-${bottomLayers.length}`}
              checked={bottomLayers.length > 0 && bottomLayers.every((l) => visible[l.id])}
              ref={(el) => {
                if (!bottomLayers.length || !el) return;
                el.indeterminate =
                  !bottomLayers.every((l) => visible[l.id]) &&
                  !bottomLayers.every((l) => !visible[l.id]);
              }}
              onChange={() => toggleSide(bottomLayers)}
            />
            {" Bottom Side"}
          </label>
        </h3>
        <div style={{ paddingLeft: 16 }}>
          {bottomLayers.map((l) => (
            <label key={l.id} style={{ marginRight: 10 }}>
              <input
                type="checkbox"
                checked={Boolean(visible[l.id])}   // ← always boolean
                onChange={() => toggleOne(l.id)}
              />
              {l.type}
            </label>
          ))}
        </div>
      </section>

      {/* ---------- CANVAS ---------- */}
      <div style={{ position: "relative", minHeight: 500, aspectRatio:'14/9', marginTop: 20 }}>
        {layers.map((l) => visible[l.id] && renderSvg(l.id))}
      </div>
    </div>
  );
}

export default function ViewPCB() {
  const { state, loadGerbers } = useGerber();

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload PCB ZIP</h2>
      <input type="file" accept=".zip" onChange={(e) => loadGerbers(e.target.files)} />

      {state.error && <p style={{ color: "red" }}>{state.error}</p>}
      {state.loading && <p>Loading…</p>}

      <LayerToggler layersMap={state.layersMap} />
    </div>
  );
}