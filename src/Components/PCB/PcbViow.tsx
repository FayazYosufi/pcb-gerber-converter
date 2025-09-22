import { useState } from "react";
import type { RenderLayersResult } from "@tracespace/core";
import LayerToggler from "./LayerToggler";
import PcbRenderer from "./PcbRenderer";

interface Props {
  layersMap: RenderLayersResult;
}

export default function PcbVieow({ layersMap }: Props) {
  const [activeSide, setActiveSide] = useState<'top' | 'bottom'>('top');
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  console.log(layersMap)
  return (
    <div className="flex min-h-[600px] gap-5 font-sans">
      <LayerToggler
        layersMap={layersMap}
        visible={visible}
        setVisible={setVisible}
      />
      
      <PcbRenderer
        layersMap={layersMap}
        visible={visible}
        activeSide={activeSide}
        setActiveSide={setActiveSide}
        setVisible={setVisible}
      />
    </div>
  );
}