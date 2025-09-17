// src/Components/PCB-View/LayerToggler.tsx
import { useMemo, useState, useEffect } from "react";
import type { RenderLayersResult } from "@tracespace/core";
import { renderBoard } from "@tracespace/core";
import { toHtml } from "hast-util-to-html";

interface Props {
  layersMap: RenderLayersResult;
}

export default function LayerToggler({ layersMap }: Props) {
  const { layers } = layersMap;

  const { top, bottom } = useMemo(() => renderBoard(layersMap), [layersMap]);
  const topLayers = useMemo(() => layers.filter((l) => l.side === "top"), [layers]);
  const bottomLayers = useMemo(() => layers.filter((l) => l.side === "bottom"), [layers]);

  const [sideVisible, setSideVisible] = useState({ top: true, bottom: true });
  const [layerVisible, setLayerVisible] = useState<Record<string, boolean>>({});

  // Initialize layer visibility
  useEffect(() => {
    if (layers.length > 0 && Object.keys(layerVisible).length === 0) {
      const initialVisibility = Object.fromEntries(
        layers.map(layer => [layer.id, true])
      );
      setLayerVisible(initialVisibility);
    }
  }, [layers, layerVisible]);

  // Apply visibility to SVG elements
  useEffect(() => {
    layers.forEach((layer) => {
      const elements = document.querySelectorAll(`g[data-layer-id="${layer.id}"]`);
      elements.forEach(element => {
        (element as SVGGElement).style.display = layerVisible[layer.id] ? "" : "none";
      });
    });
  }, [layerVisible, layers]);

  const toggleSide = (side: "top" | "bottom") => {
    setSideVisible(prev => ({ ...prev, [side]: !prev[side] }));
  };

  const toggleLayer = (id: string) => {
    setLayerVisible(prev => ({ ...prev, [id]: !prev[id] }));
    
    // Log layer information for debugging
    const layer = layers.find(l => l.id === id);
    if (layer) {
      console.log("Toggled layer:", layer);
    }
  };

  const renderSvg = (node: any, side: "top" | "bottom") => {
    if (!node) return null;
    
    const processedNode = JSON.parse(JSON.stringify(node));
    if (processedNode.children) {
      processedNode.children = processedNode.children.map((child: any) => {
        if (child.type === "element" && child.tagName === "g" && child.properties?.id) {
          const layerId = child.properties.id;
          return {
            ...child,
            properties: {
              ...child.properties,
              "data-layer-id": layerId,
            },
          };
        }
        return child;
      });
    }

    return (
      <div
        style={{ 
          position: "absolute", 
          inset: 0, 
          pointerEvents: "none",
          display: sideVisible[side] ? "block" : "none"
        }}
        dangerouslySetInnerHTML={{
          __html: toHtml(processedNode),
        }}
      />
    );
  };

  if (layers.length === 0) return null;

  return (
    <>
      {/* Top Side Controls */}
      <section style={{ marginBottom: 12 }}>
        <h3 style={{ margin: "4px 0" }}>
          <label>
            <input
              type="checkbox"
              checked={sideVisible.top}
              onChange={() => toggleSide("top")}
            />
            {" Top Side"}
          </label>
        </h3>
        <div style={{ paddingLeft: 16 }}>
          {topLayers.map((layer) => (
            <label key={layer.id} style={{ marginRight: 10, display: "block" }}>
              <input
                type="checkbox"
                checked={layerVisible[layer.id] || false}
                onChange={() => toggleLayer(layer.id)}
              />
              {layer.type}
            </label>
          ))}
        </div>
      </section>

      {/* Bottom Side Controls */}
      <section>
        <h3 style={{ margin: "4px 0" }}>
          <label>
            <input
              type="checkbox"
              checked={sideVisible.bottom}
              onChange={() => toggleSide("bottom")}
            />
            {" Bottom Side"}
          </label>
        </h3>
        <div style={{ paddingLeft: 16 }}>
          {bottomLayers.map((layer) => (
            <label key={layer.id} style={{ marginRight: 10, display: "block" }}>
              <input
                type="checkbox"
                checked={layerVisible[layer.id] || false}
                onChange={() => toggleLayer(layer.id)}
              />
              {layer.type}
            </label>
          ))}
        </div>
      </section>

      {/* SVG Render */}
      <div style={{ position: "relative", minHeight: 300, marginTop: 12 }}>
        {renderSvg(top, "top")}
        {renderSvg(bottom, "bottom")}
      </div>
    </>
  );
}