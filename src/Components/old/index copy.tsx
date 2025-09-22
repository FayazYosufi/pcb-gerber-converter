import { useMemo, useState, useEffect } from "react";
import { useGerber } from "../../context/GerberContext";
import type { RenderLayersResult, Layer } from "@tracespace/core";
import { stringifySvg } from "@tracespace/core";

const COMMON_LAYER_TYPES = ['outline', 'drill'];

function LayerToggler({ layersMap }: { layersMap: RenderLayersResult }) {
  const { layers, rendersById } = layersMap;
  const [activeSide, setActiveSide] = useState<'top' | 'bottom'>('top');
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  const categorizedLayers = useMemo(() => {
    const common: Layer[] = [];
    const top: Layer[] = [];
    const bottom: Layer[] = [];
    const inner: Layer[] = [];
    
    layers.forEach(layer => {
      if (layer.type && COMMON_LAYER_TYPES.includes(layer.type)) {
        common.push(layer);
      } else if (layer.side === 'top') {
        top.push(layer);
      } else if (layer.side === 'bottom') {
        bottom.push(layer);
      } else if (layer.type === 'copper' && !layer.side) {
        inner.push(layer);
      } else {
        common.push(layer);
      }
    });
    return { common, top, bottom, inner };
  }, [layers]);

  useEffect(() => {
    const initialVisibility: Record<string, boolean> = {};
    layers.forEach(layer => {
      const isCommon = layer.type && COMMON_LAYER_TYPES.includes(layer.type);
      const isInner = layer.type === 'copper' && !layer.side;
      initialVisibility[layer.id] = isCommon || layer.side === 'top' || isInner;
    });
    setVisible(initialVisibility);
  }, [layers]);

  const toggleOne = (id: string) => setVisible(v => ({ ...v, [id]: !v[id] }));

  const switchSide = (side: 'top' | 'bottom') => {
    setActiveSide(side);
    setVisible(prev => {
      const newVis: Record<string, boolean> = {};
      layers.forEach(layer => {
        const isCommon = layer.type && COMMON_LAYER_TYPES.includes(layer.type);
        const isInner = layer.type === 'copper' && !layer.side;
        newVis[layer.id] = isCommon || layer.side === side || isInner;
      });
      return newVis;
    });
  };

  const renderSvg = (id: string) => {
    const layer = layers.find(l => l.id === id);
    const layerClass = `${layer?.type || 'unknown'} ${layer?.side || 'common'}`;
    let svgContent = stringifySvg(rendersById[id]).replace('<svg', `<svg class="${layerClass}"`);
    
    if (layer?.type === 'silkscreen' && layer?.side === 'bottom') {
      svgContent = svgContent.replace('<svg', `<svg style="transform: rotate(0deg)"`);
    }

    return (
      <div
        key={id}
        className="absolute inset-0 pointer-events-none opacity-80"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  };

  return (
    <div className="flex min-h-[600px] gap-5 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 rounded-lg border border-gray-300">
        {/* Common Layers */}
        {categorizedLayers.common.length > 0 && (
          <section className="mb-5">
            <h3 className="m-0 mb-3 text-sm font-bold text-gray-800">Common Layers</h3>
            <div className="flex flex-col gap-2">
              {categorizedLayers.common.map(l => (
                <label
                  key={l.id}
                  className={`flex items-center px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    visible[l.id] ? 'bg-blue-50' : 'bg-transparent'
                  } hover:bg-gray-100`}
                >
                  <input
                    type="checkbox"
                    checked={!!visible[l.id]}
                    onChange={() => toggleOne(l.id)}
                    className="mr-2"
                  />
                  <span className="text-sm">{l.type}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Inner Layers */}
        {categorizedLayers.inner.length > 0 && (
          <section className="mb-5">
            <h3 className="m-0 mb-3 text-sm font-bold text-gray-800">Inner Layers</h3>
            <div className="flex flex-col gap-2">
              {categorizedLayers.inner.map(l => (
                <label
                  key={l.id}
                  className={`flex items-center px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    visible[l.id] ? 'bg-blue-50' : 'bg-transparent'
                  } hover:bg-gray-100`}
                >
                  <input
                    type="checkbox"
                    checked={!!visible[l.id]}
                    onChange={() => toggleOne(l.id)}
                    className="mr-2"
                  />
                  <span className="text-sm">Inner</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Top Layers */}
        {categorizedLayers.top.length > 0 && (
          <section className="mb-5">
            <h3 className="m-0 mb-3 text-sm font-bold text-gray-800">Top Layers</h3>
            <div className="flex flex-col gap-2">
              {categorizedLayers.top.map(l => (
                <label
                  key={l.id}
                  className={`flex items-center px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    visible[l.id] ? 'bg-blue-50' : 'bg-transparent'
                  } hover:bg-gray-100`}
                >
                  <input
                    type="checkbox"
                    checked={!!visible[l.id]}
                    onChange={() => toggleOne(l.id)}
                    className="mr-2"
                  />
                  <span className="text-sm">{l.type}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Layers */}
        {categorizedLayers.bottom.length > 0 && (
          <section className="mb-5">
            <h3 className="m-0 mb-3 text-sm font-bold text-gray-800">Bottom Layers</h3>
            <div className="flex flex-col gap-2">
              {categorizedLayers.bottom.map(l => (
                <label
                  key={l.id}
                  className={`flex items-center px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    visible[l.id] ? 'bg-blue-50' : 'bg-transparent'
                  } hover:bg-gray-100`}
                >
                  <input
                    type="checkbox"
                    checked={!!visible[l.id]}
                    onChange={() => toggleOne(l.id)}
                    className="mr-2"
                  />
                  <span className="text-sm">{l.type}</span>
                </label>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Side Selector */}
        <div className="mb-5 flex gap-3 justify-center">
          <button
            onClick={() => switchSide('top')}
            className={`px-6 py-3 rounded-lg font-bold text-white transition-colors ${
              activeSide === 'top' ? 'bg-blue-600' : 'bg-gray-600'
            } hover:bg-blue-700 shadow-sm`}
          >
            Top Side
          </button>
          <button
            onClick={() => switchSide('bottom')}
            className={`px-6 py-3 rounded-lg font-bold text-white transition-colors ${
              activeSide === 'bottom' ? 'bg-green-600' : 'bg-gray-600'
            } hover:bg-green-700 shadow-sm`}
          >
            Bottom Side
          </button>
        </div>

        {/* Canvas */}
        <div
          className={`relative min-h-[450px] min-w-[710px] ${
            activeSide === 'bottom' ? 'rotate-180' : ''
          } ${activeSide === 'top' ? 'bg-gray-600' : 'bg-green-900'}`}
        >
          {layers.map(l => visible[l.id] && renderSvg(l.id))}
        </div>
      </div>
    </div>
  );
}

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