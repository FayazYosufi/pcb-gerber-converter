// src/Components/PCB-View/LayerToggler.tsx
import { useMemo, useState } from "react";
import type { RenderLayersResult } from "@tracespace/core";
import { toHtml } from "hast-util-to-html";

interface Props {
  layersMap: RenderLayersResult;
}

export default function LayerToggler({ layersMap }: Props) {
  const { layers, rendersById } = layersMap;

  

  /* ------------- split by side ------------- */
  const topLayers    = useMemo(() => layers.filter((l) => l.side === "top"),   [layers]);
  const bottomLayers = useMemo(() => layers.filter((l) => l.side === "bottom"),[layers]);

  /* ------------- visibility state ------------- */
 const [visible, setVisible] = useState<Record<string, boolean>>(() =>
  Object.fromEntries(layers.map((L) => [L.id, true as boolean]))
);

  /* ------------- helpers ------------- */
  const toggleOne  = (id: string) =>
    setVisible((v) => ({ ...v, [id]: !v[id] }));

  const toggleSide = (sideLayers: typeof layers) => {
    const next = !sideLayers.every((l) => visible[l.id]);
    setVisible((v) => {
      const copy = { ...v };
      sideLayers.forEach((l) => (copy[l.id] = next));
      return copy;
    });
  };

  /* ------------- render SVG ------------- */
  const renderSvg = (id: string) => (
    <div
      key={id}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      dangerouslySetInnerHTML={{
        __html: toHtml(JSON.parse(JSON.stringify(rendersById[id]))),
      }}
    />
  );

  /* ------------- UI ------------- */
  return (
    <>
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
      <div style={{ position: "relative", minHeight: 300, marginTop: 12 }}>
        {layers.map((l) => visible[l.id] && renderSvg(l.id))}
      </div>
    </>
  );
}