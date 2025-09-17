// src/Components/PCB-View/LayerToggler.tsx
import { useMemo, useState, useEffect } from "react";
import { read } from "@tracespace/core";
import type { Layer } from "@tracespace/core";
import { toHtml } from "hast-util-to-html";

interface Props {
  files: File[];
}

export default function LayerToggler({ files }: Props) {
  /* ----------  ①  read() → layers  ---------- */
  const [layers, setLayers] = useState<Layer[]>([]);

  useEffect(() => {
    if (!files.length) return;
    read(files)
      .then((res) => {
        console.log("read() result:", res);
        console.log("individual layers:", res.layers);
        setLayers(res.layers);
      })
      .catch((err) => console.error("read() error:", err));
  }, [files]);

  /* ----------  ②  split & early exit  ---------- */
  const topLayers    = useMemo(() => layers.filter((l) => l.side === "top"),   [layers]);
  const bottomLayers = useMemo(() => layers.filter((l) => l.side === "bottom"),[layers]);

  if (layers.length === 0) return null;

  /* ----------  ③  one checkbox = one layer  ---------- */
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(layers.map((L) => [L.id, true]))
  );

  const toggle = (id: string) => setVisible((v) => ({ ...v, [id]: !v[id] }));

  /* ----------  ④  inject “original” CSS exactly like handleColorChange  ---------- */
/* ----------  inject “original” CSS  ---------- */
const ORIGINAL_CSS = `
  .{id}_fr4 {color: #666666  !important;}
  .{id}_cu {color: #cccccc !important;}
  .{id}_cf {color: #cc9933 !important;}
  .{id}_sm {color: #004200 !important; opacity: 0.75 !important;}
  .{id}_ss {color: #ffffff !important;}
  .{id}_sp {color: #999999 !important;}
  .{id}_out {color: #000000 !important;}
`;

/* ----------  colour + render a single layer  ---------- */
const colourLayer = (layer: Layer) => {
  const prefix = `${layer.side}_${layer.type}`.replace(/_/g, "");
  const css = `
    .${prefix}_fr4 {color: #666666  !important;}
    .${prefix}_cu {color: #cccccc !important;}
    .${prefix}_cf {color: #cc9933 !important;}
    .${prefix}_sm {color: #004200 !important; opacity: 0.75 !important;}
    .${prefix}_ss {color: #ffffff !important;}
    .${prefix}_sp {color: #999999 !important;}
    .${prefix}_out {color: #000000 !important;}
  `;

  /* clone the parse-tree that read() already gives us */
  const bare = JSON.parse(JSON.stringify(layer.parseTree)); // Hast node
  if (bare.type === "element" && bare.tagName === "g") {
    bare.properties = { ...bare.properties, class: prefix };
  }

  const html = toHtml(bare);

  /* wrap in a tiny SVG document with the style block */
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <style>${css}</style>
      ${html}
    </svg>
  `;
};
  /* ----------  ⑤  render only checked layers  ---------- */
  return (
    <>
      <section style={{ marginBottom: 12 }}>
        <h3>Top Side</h3>
        <div style={{ paddingLeft: 16 }}>
          {topLayers.map((l) => (
            <label key={l.id} style={{ marginRight: 10 }}>
              <input
                type="checkbox"
                checked={visible[l.id]}
                onChange={() => toggle(l.id)}
              />
              {l.type} <small>({l.filename})</small>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3>Bottom Side</h3>
        <div style={{ paddingLeft: 16 }}>
          {bottomLayers.map((l) => (
            <label key={l.id} style={{ marginRight: 10 }}>
              <input
                type="checkbox"
                checked={visible[l.id]}
                onChange={() => toggle(l.id)}
              />
              {l.type} <small>({l.filename})</small>
            </label>
          ))}
        </div>
      </section>

      {/* ----------  only checked layers, stacked  ---------- */}
      <div style={{ position: "relative", minHeight: 300, marginTop: 12 }}>
        {layers.map((l) =>
          visible[l.id] ? (
            <div
  key={l.id}
  style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
  dangerouslySetInnerHTML={{ __html: colourLayer(l) }}
/>
          ) : null
        )}
      </div>
    </>
  );
}