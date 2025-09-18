import { useMemo, useState } from "react";
import { useGerber } from "../../context/GerberContext";
import type { RenderLayersResult, Layer } from "@tracespace/core";
import { toHtml } from "hast-util-to-html";

interface Props {
  layersMap: RenderLayersResult;
}

// Define common layer types
const COMMON_LAYER_TYPES = ['outline', 'drill'];
const TOP_BOTTOM_LAYER_TYPES = ['copper', 'silkscreen', 'soldermask', 'paste'];

export function LayerToggler({ layersMap }: Props) {
  const { layers, rendersById } = layersMap;
  console.log(layersMap)
  
  /* ------------- categorize layers ------------- */
  const categorizedLayers = useMemo(() => {
    const commonLayers: Layer[] = [];
    const topLayers: Layer[] = [];
    const bottomLayers: Layer[] = [];
    
    layers.forEach(layer => {
      if (layer.type && COMMON_LAYER_TYPES.includes(layer.type)) {
        commonLayers.push(layer);
      } else if (layer.side === 'top') {
        topLayers.push(layer);
      } else if (layer.side === 'bottom') {
        bottomLayers.push(layer);
      } else {
        // Fallback for any unclassified layers
        commonLayers.push(layer);
      }
    });
    
    return { commonLayers, topLayers, bottomLayers };
  }, [layers]);

  /* ------------- visibility state ------------- */
  const [activeSide, setActiveSide] = useState<'top' | 'bottom'>('top');
  const [visible, setVisible] = useState<Record<string, boolean>>(() => {
    const initialVisibility: Record<string, boolean> = {};
    
    layers.forEach(layer => {
      // Show common layers and top layers by default
      if (layer.type && COMMON_LAYER_TYPES.includes(layer.type) || layer.side === 'top') {
        initialVisibility[layer.id] = true;
      } else {
        initialVisibility[layer.id] = false;
      }
    });
    
    return initialVisibility;
  });

  /* ------------- helpers ------------- */
  const toggleOne = (id: string) =>
    setVisible((v) => ({ ...v, [id]: !v[id] }));

  const toggleGroup = (groupLayers: Layer[]) => {
    const next = !groupLayers.every((l) => visible[l.id]);
    setVisible((v) => {
      const copy = { ...v };
      groupLayers.forEach((l) => (copy[l.id] = next));
      return copy;
    });
  };

  const switchSide = (side: 'top' | 'bottom') => {
    setActiveSide(side);
    
    // Hide all layers first
    const newVisibility: Record<string, boolean> = {};
    layers.forEach(layer => {
      newVisibility[layer.id] = false;
    });
    
    // Show common layers and the selected side's layers
    layers.forEach(layer => {
      if (layer.type && COMMON_LAYER_TYPES.includes(layer.type) || layer.side === side) {
        newVisibility[layer.id] = true;
      }
    });
    
    setVisible(newVisibility);
  };

  function colorFilliing(layer:any) {
    if (layer.side == 'top') {
      return '#cc9933'
    }else if (layer.side == 'bottom' || layer.side == 'inner'){
      return '#206b19'
    }
  }

  const renderSvg = (id: string) => {
    const svgContent = toHtml(JSON.parse(JSON.stringify(rendersById[id])));
    const layer = layers.find(l => l.id === id);
    const layerClass = `${layer?.type} ${layer?.side}` || '';
    
    // const styledSvg = svgContent.replace(
    //   '<svg',
    //   `<svg 
    //   fill=${colorFilliing(layer)} 
    //   stroke=${ activeSide == 'top' ? '#cc9933' : '#1b5316ff'}
    //   class="gerber-layer ${layerClass}"`
    // );
    const styledSvg = svgContent.replace(
      '<svg',
      `<svg 
      class="gerber-layer ${layerClass}"`
    );

    return (
      <div
        id="layer"
        key={id}
        style={{border:'1px solid' ,position: "absolute", inset: 0, pointerEvents: "none" , width:'fit-content', height:'-webkit-fill-available'}}
        dangerouslySetInnerHTML={{ __html: styledSvg }}
      />
    );
  };

  /* ------------- UI ------------- */
  return (
    <div style={{minHeight:'500px'}}>
      {/* ---------- SIDE SELECTOR ---------- */}
      <div style={{ marginBottom: 20 }}>
        <button 
          onClick={() => switchSide('top')}
          style={{
            padding: '8px 16px',
            marginRight: 10,
            backgroundColor: activeSide === 'top' ? '#007acc' : '#f0f0f0',
            color: activeSide === 'top' ? 'white' : 'black',
            border: '1px solid #ccc',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Top Side
        </button>
        <button 
          onClick={() => switchSide('bottom')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeSide === 'bottom' ? '#007acc' : '#f0f0f0',
            color: activeSide === 'bottom' ? 'white' : 'black',
            border: '1px solid #ccc',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Bottom Side
        </button>
      </div>

      {/* ---------- COMMON LAYERS ---------- */}
      {categorizedLayers.commonLayers.length > 0 && (
        <section style={{ marginBottom: 12 }}>
          <h3 style={{ margin: "4px 0" }}>
            <label>
              <input
                type="checkbox"
                checked={categorizedLayers.commonLayers.every((l) => visible[l.id])}
                ref={(el) => {
                  if (!categorizedLayers.commonLayers.length || !el) return;
                  el.indeterminate =
                    !categorizedLayers.commonLayers.every((l) => visible[l.id]) &&
                    !categorizedLayers.commonLayers.every((l) => !visible[l.id]);
                }}
                onChange={() => toggleGroup(categorizedLayers.commonLayers)}
              />
              {" Common Layers"}
            </label>
          </h3>
          <div style={{ paddingLeft: 16 }}>
            {categorizedLayers.commonLayers.map((l) => (
              <label key={l.id} style={{ marginRight: 10, display: 'block' }}>
                <input
                  type="checkbox"
                  checked={Boolean(visible[l.id])}
                  onChange={() => toggleOne(l.id)}
                />
                {l.type}
              </label>
            ))}
          </div>
        </section>
      )}

      {/* ---------- ACTIVE SIDE LAYERS ---------- */}
      {activeSide === 'top' && categorizedLayers.topLayers.length > 0 && (
        <section style={{ marginBottom: 12 }}>
          <h3 style={{ margin: "4px 0" }}>
            <label>
              <input
                type="checkbox"
                checked={categorizedLayers.topLayers.every((l) => visible[l.id])}
                ref={(el) => {
                  if (!categorizedLayers.topLayers.length || !el) return;
                  el.indeterminate =
                    !categorizedLayers.topLayers.every((l) => visible[l.id]) &&
                    !categorizedLayers.topLayers.every((l) => !visible[l.id]);
                }}
                onChange={() => toggleGroup(categorizedLayers.topLayers)}
              />
              {" Top Side Layers"}
            </label>
          </h3>
          <div style={{ paddingLeft: 16 }}>
            {categorizedLayers.topLayers.map((l) => (
              <label key={l.id} style={{ marginRight: 10, display: 'block' }}>
                <input
                  type="checkbox"
                  checked={Boolean(visible[l.id])}
                  onChange={() => toggleOne(l.id)}
                />
                {l.type}
              </label>
            ))}
          </div>
        </section>
      )}

      {activeSide === 'bottom' && categorizedLayers.bottomLayers.length > 0 && (
        <section style={{ marginBottom: 12 }}>
          <h3 style={{ margin: "4px 0" }}>
            <label>
              <input
                type="checkbox"
                checked={categorizedLayers.bottomLayers.every((l) => visible[l.id])}
                ref={(el) => {
                  if (!categorizedLayers.bottomLayers.length || !el) return;
                  el.indeterminate =
                    !categorizedLayers.bottomLayers.every((l) => visible[l.id]) &&
                    !categorizedLayers.bottomLayers.every((l) => !visible[l.id]);
                }}
                onChange={() => toggleGroup(categorizedLayers.bottomLayers)}
              />
              {" Bottom Side Layers"}
            </label>
          </h3>
          <div style={{ paddingLeft: 16 }}>
            {categorizedLayers.bottomLayers.map((l) => (
              <label key={l.id} style={{ marginRight: 10, display: 'block' }}>
                <input
                  type="checkbox"
                  checked={Boolean(visible[l.id])}
                  onChange={() => toggleOne(l.id)}
                />
                {l.type}
              </label>
            ))}
          </div>
        </section>
      )}

      {/* ---------- CANVAS ---------- */}
      <div style={{ position: "relative", minHeight: 500, marginTop: 20,  
        transform: activeSide === 'bottom' ? 'rotate(180deg)' : 'none' 
        }}>
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