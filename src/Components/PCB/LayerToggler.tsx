import { useMemo } from "react";
import type { RenderLayersResult, Layer } from "@tracespace/core";
import { Eye, EyeOff } from "lucide-react";

const COMMON_LAYER_TYPES = ['outline', 'drill'];

// Array of background colors for eye icons
// Array of bold background colors for eye icons
// Array of bold darker background colors for eye icons
const EYE_BG_COLORS = [
  'bg-blue-400',
  'bg-green-400',
  'bg-red-400',
  'bg-purple-400',
];

interface SidebarProps {
  layersMap: RenderLayersResult;
  visible: Record<string, boolean>;
  setVisible: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  activeSide?: 'top' | 'bottom';
}

interface LayerToggleItemProps {
  layer: Layer;
  isVisible: boolean;
  onToggle: (id: string) => void;
  label?: string;
  colorIndex: number;
}

interface LayerSectionProps {
  title: string;
  layers: Layer[];
  visible: Record<string, boolean>;
  onToggle: (id: string) => void;
  getLabel?: (layer: Layer) => string;
  startColorIndex: number;
}

// Reusable toggle item component
function LayerToggleItem({ layer, isVisible, onToggle, label, colorIndex }: LayerToggleItemProps) {
  const eyeBgColor = EYE_BG_COLORS[colorIndex % EYE_BG_COLORS.length];

  return (
    <div
      className="flex items-center justify-between rounded-md  overflow-hidden cursor-pointer hover:bg-gray-200 group min-h-[32px]"
      onClick={() => onToggle(layer.id)}
    >
      <span className="text-sm text-gray-700">{label || layer.type}</span>
      <button
        type="button"
        className={`p-1 ${eyeBgColor}`}
        aria-label={isVisible ? "Hide layer" : "Show layer"}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(layer.id);
        }}
      >
        {isVisible ? (
          <Eye className="h-3.5 w-3.5 " />
        ) : (
          <EyeOff className="h-3.5 w-3.5 " />
        )}
      </button>
    </div>
  );
}

// Reusable section component
function LayerSection({ title, layers, visible, onToggle, getLabel, startColorIndex }: LayerSectionProps) {
  if (layers.length === 0) return null;

  return (
    <section className="mb-4">
      <h3 className="m-0 mb-2 text-xs font-bold text-black uppercase tracking-wide">{title}</h3>
      <div className="flex flex-col gap-1">
        {layers.map((layer, index) => (
          <LayerToggleItem
            key={layer.id}
            layer={layer}
            isVisible={!!visible[layer.id]}
            onToggle={onToggle}
            label={getLabel ? getLabel(layer) : undefined}
            colorIndex={startColorIndex + index}
          />
        ))}
      </div>
    </section>
  );
}

export default function LayerToggler({ layersMap, visible, setVisible }: SidebarProps) {
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

  // Calculate starting color indices for each section
  let colorIndex = 0;

  return (
    <div className="w-56 bg-gray-50 p-3 border border-gray-200 text-xs">
      <LayerSection
        title="Common Layers"
        layers={categorizedLayers.common}
        visible={visible}
        onToggle={toggleOne}
        startColorIndex={colorIndex}
      />
      {colorIndex += categorizedLayers.common.length}

      <LayerSection
        title="Inner Layers"
        layers={categorizedLayers.inner}
        visible={visible}
        onToggle={toggleOne}
        getLabel={() => "Inner"}
        startColorIndex={colorIndex}
      />
      {colorIndex += categorizedLayers.inner.length}

      <LayerSection
        title="Top Layers"
        layers={categorizedLayers.top}
        visible={visible}
        onToggle={toggleOne}
        startColorIndex={colorIndex}
      />
      {colorIndex += categorizedLayers.top.length}

      <LayerSection
        title="Bottom Layers"
        layers={categorizedLayers.bottom}
        visible={visible}
        onToggle={toggleOne}
        startColorIndex={colorIndex}
      />
    </div>
  );
}