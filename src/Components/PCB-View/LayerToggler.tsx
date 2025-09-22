import { useMemo } from "react";
import type { RenderLayersResult, Layer } from "@tracespace/core";

const COMMON_LAYER_TYPES = ['outline', 'drill'];

interface SidebarProps {
  layersMap: RenderLayersResult;
  visible: Record<string, boolean>;
  setVisible: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  activeSide: 'top' | 'bottom';
}

export default function Sidebar({ layersMap, visible, setVisible, activeSide }: SidebarProps) {
  const { layers } = layersMap;

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

  const toggleOne = (id: string) => {
    setVisible(v => ({ ...v, [id]: !v[id] }));
  };

  return (
    <div className="w-64 bg-gray-100 p-4 rounded-lg border border-gray-300">
      {/* Common Layers */}
      {categorizedLayers.common.length > 0 && (
        <section className="mb-5">
          <h3 className="m-0 mb-3 text-sm font-bold text-gray-800">Common Layers</h3>
          <div className="flex flex-col gap-2">
            {categorizedLayers.common.map(l => (
              <label
                key={l.id}
                className="flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors hover:bg-gray-200 group"
              >
                <span className="text-sm text-gray-700">{l.type}</span>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={!!visible[l.id]}
                    onChange={() => toggleOne(l.id)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${
                    visible[l.id] ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                  <div className={`absolute left-0.5 top-0.5 bg-white border border-gray-300 rounded-full h-4 w-4 transition-transform ${
                    visible[l.id] ? 'transform translate-x-5' : ''
                  }`} />
                </div>
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
                className="flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors hover:bg-gray-200 group"
              >
                <span className="text-sm text-gray-700">Inner</span>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={!!visible[l.id]}
                    onChange={() => toggleOne(l.id)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${
                    visible[l.id] ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                  <div className={`absolute left-0.5 top-0.5 bg-white border border-gray-300 rounded-full h-4 w-4 transition-transform ${
                    visible[l.id] ? 'transform translate-x-5' : ''
                  }`} />
                </div>
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
                className="flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors hover:bg-gray-200 group"
              >
                <span className="text-sm text-gray-700">{l.type}</span>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={!!visible[l.id]}
                    onChange={() => toggleOne(l.id)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${
                    visible[l.id] ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                  <div className={`absolute left-0.5 top-0.5 bg-white border border-gray-300 rounded-full h-4 w-4 transition-transform ${
                    visible[l.id] ? 'transform translate-x-5' : ''
                  }`} />
                </div>
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
                className="flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors hover:bg-gray-200 group"
              >
                <span className="text-sm text-gray-700">{l.type}</span>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={!!visible[l.id]}
                    onChange={() => toggleOne(l.id)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${
                    visible[l.id] ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                  <div className={`absolute left-0.5 top-0.5 bg-white border border-gray-300 rounded-full h-4 w-4 transition-transform ${
                    visible[l.id] ? 'transform translate-x-5' : ''
                  }`} />
                </div>
              </label>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}