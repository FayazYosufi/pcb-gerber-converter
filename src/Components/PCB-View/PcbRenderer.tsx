import { useEffect } from "react";
import type { RenderLayersResult } from "@tracespace/core";
import { stringifySvg } from "@tracespace/core";

const COMMON_LAYER_TYPES = ['outline', 'drill'];

interface PCBViewProps {
  layersMap: RenderLayersResult;
  visible: Record<string, boolean>;
  activeSide: 'top' | 'bottom';
  setActiveSide: (side: 'top' | 'bottom') => void;
  setVisible: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export default function PCBView({ layersMap, visible, activeSide, setActiveSide, setVisible }: PCBViewProps) {
  const { layers, rendersById } = layersMap;

  useEffect(() => {
    const initialVisibility: Record<string, boolean> = {};
    layers.forEach(layer => {
      const isCommon = layer.type && COMMON_LAYER_TYPES.includes(layer.type);
      const isInner = layer.type === 'copper' && !layer.side;
      initialVisibility[layer.id] = isCommon || layer.side === 'top' || isInner;
    });
    setVisible(initialVisibility);
  }, [layers, setVisible]);

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
        className="absolute inset-0 pointer-events-none opacity-80 w-fit"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  };

  return (
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
        className={`relative min-h-[450px] min-w-[710px] w-fit ${
          activeSide === 'bottom' ? 'rotate-180' : ''
        } ${activeSide === 'top' ? 'bg-[#464646]' : 'bg-[#184913]'}`}
      >
        {layers.map(l => visible[l.id] && renderSvg(l.id))}
      </div>
    </div>
  );
}