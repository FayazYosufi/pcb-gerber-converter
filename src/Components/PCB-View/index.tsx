import { useMemo, useState, useEffect } from "react";
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
  
  /* ------------- categorize layers ------------- */
  const categorizedLayers = useMemo(() => {
    const commonLayers: Layer[] = [];
    const topLayers: Layer[] = [];
    const bottomLayers: Layer[] = [];
    
    layers.forEach(layer => {
      // Don't include copper layers in common layers
      if (layer.type && COMMON_LAYER_TYPES.includes(layer.type) && layer.type !== 'copper') {
        commonLayers.push(layer);
      } else if (layer.side === 'top') {
        topLayers.push(layer);
      } else if (layer.side === 'bottom') {
        bottomLayers.push(layer);
      } else {
        // Fallback for any unclassified layers (excluding copper)
        if (layer.type !== 'copper') {
          commonLayers.push(layer);
        }
      }
    });
    console.log({ commonLayers, topLayers, bottomLayers });
    return { commonLayers, topLayers, bottomLayers };
  }, [layers]);

  /* ------------- visibility state ------------- */
  const [activeSide, setActiveSide] = useState<'top' | 'bottom'>('top');
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  // Initialize visibility when layers change
  useEffect(() => {
    if (layers.length > 0) {
      const initialVisibility: Record<string, boolean> = {};
      
      layers.forEach(layer => {
        const isCommonLayer = layer.type && COMMON_LAYER_TYPES.includes(layer.type) && layer.type !== 'copper';
        const isTopLayer = layer.side === 'top';
        
        // Show common layers and top layers by default
        initialVisibility[layer.id] = isCommonLayer || isTopLayer;
      });
      
      setVisible(initialVisibility);
    }
  }, [layers]);

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
    
    // Hide all layers first, then show only the active side and common layers
    setVisible((prevVisible) => {
      const newVisibility: Record<string, boolean> = {};
      
      layers.forEach(layer => {
        const isCommonLayer = layer.type && COMMON_LAYER_TYPES.includes(layer.type) && layer.type !== 'copper';
        const isActiveSideLayer = layer.side === side;
        
        // Show common layers and layers from active side
        newVisibility[layer.id] = isCommonLayer || isActiveSideLayer;
      });
      
      return newVisibility;
    });
  };

  const renderSvg = (id: string) => {
    const svgContent = toHtml(JSON.parse(JSON.stringify(rendersById[id])));
    const layer = layers.find(l => l.id === id);
    
    const layerClass = `${layer?.type || 'unknown'} ${layer?.side || 'common'}`;
    
    const styledSvg = svgContent
      .replace('<svg', `<svg class="${layerClass}"`)

    return (
      <div
        key={id}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.8
        }}
        dangerouslySetInnerHTML={{ __html: styledSvg }}
      />
    );
  };

  /* ------------- UI ------------- */
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '600px', 
      gap: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* ---------- SIDEBAR FOR LAYER SELECTION ---------- */}
      <div style={{ 
        width: '250px', 
        backgroundColor: '#f5f5f5', 
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        {/* ---------- COMMON LAYERS ---------- */}
        {categorizedLayers.commonLayers.length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              margin: "0 0 12px 0", 
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Common Layers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categorizedLayers.commonLayers.map((l) => (
                <label key={l.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  backgroundColor: visible[l.id] ? '#e3f2fd' : 'transparent',
                  transition: 'background-color 0.2s',
                  // ':hover': {
                  //   backgroundColor: '#f0f0f0'
                  // }
                }}>
                  <input
                    type="checkbox"
                    checked={Boolean(visible[l.id])}
                    onChange={() => toggleOne(l.id)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '13px' }}>{l.type}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* ---------- TOP LAYERS ---------- */}
        {activeSide === 'top' && categorizedLayers.topLayers.length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              margin: "0 0 12px 0", 
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Top Layers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categorizedLayers.topLayers.map((l) => (
                <label key={l.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  backgroundColor: visible[l.id] ? '#e3f2fd' : 'transparent',
                  transition: 'background-color 0.2s',
                  // ':hover': {
                  //   backgroundColor: '#f0f0f0'
                  // }
                }}>
                  <input
                    type="checkbox"
                    checked={Boolean(visible[l.id])}
                    onChange={() => toggleOne(l.id)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '13px' }}>{l.type}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* ---------- BOTTOM LAYERS ---------- */}
        {activeSide === 'bottom' && categorizedLayers.bottomLayers.length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              margin: "0 0 12px 0", 
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Bottom Layers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categorizedLayers.bottomLayers.map((l) => (
                <label key={l.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  backgroundColor: visible[l.id] ? '#e3f2fd' : 'transparent',
                  transition: 'background-color 0.2s',
                  // ':hover': {
                  //   backgroundColor: '#f0f0f0'
                  // }
                }}>
                  <input
                    type="checkbox"
                    checked={Boolean(visible[l.id])}
                    onChange={() => toggleOne(l.id)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '13px' }}>{l.type}</span>
                </label>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ---------- MAIN CONTENT AREA ---------- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* ---------- SIDE SELECTOR (above PCB) ---------- */}
        <div style={{ 
          marginBottom: '20px', 
          display: 'flex', 
          gap: '10px',
          justifyContent: 'center'
        }}>
          <button 
            onClick={() => switchSide('top')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeSide === 'top' ? '#007acc' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Top Side
          </button>
          <button 
            onClick={() => switchSide('bottom')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeSide === 'bottom' ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Bottom Side
          </button>
        </div>

        {/* ---------- CANVAS ---------- */}
        <div style={{ 
          position: "relative", 
          flex: 1,
          minHeight: '500px', 
          transform: activeSide === 'bottom' ? 'rotate(180deg)' : 'none',
          backgroundColor: activeSide === 'top' ? '#000000' : '#0b2708', // Black for top, green for bottom
          border: '2px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          {layers.map((l) => visible[l.id] && renderSvg(l.id))}
        </div>
      </div>
    </div>
  );
}

export default function ViewPCB() {
  const { state, loadGerbers } = useGerber();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Upload PCB ZIP</h2>
      <input 
        type="file" 
        accept=".zip" 
        onChange={(e) => loadGerbers(e.target.files)}
        style={{ marginBottom: '20px' }}
      />

      {state.error && <p style={{ color: "red" }}>{state.error}</p>}
      {state.loading && <p>Loading…</p>}

      {state.layersMap.layers.length > 0 && <LayerToggler layersMap={state.layersMap} />}
    </div>
  );
}