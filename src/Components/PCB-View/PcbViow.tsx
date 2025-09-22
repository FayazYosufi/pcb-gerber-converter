import { useState } from "react";
import type { RenderLayersResult } from "@tracespace/core";
import Sidebar from "./LayerToggler";
import PCBView from "./PcbRenderer";

interface Props {
  layersMap: RenderLayersResult;
}

export default function LayerToggler({ layersMap }: Props) {
  const [activeSide, setActiveSide] = useState<'top' | 'bottom'>('top');
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  return (
    <div className="flex min-h-[600px] gap-5 font-sans">
      <Sidebar
        layersMap={layersMap}
        visible={visible}
        setVisible={setVisible}
        activeSide={activeSide}
      />
      
      <PCBView
        layersMap={layersMap}
        visible={visible}
        activeSide={activeSide}
        setActiveSide={setActiveSide}
        setVisible={setVisible}
      />
    </div>
  );
}