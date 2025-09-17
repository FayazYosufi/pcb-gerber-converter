// src/helper/convertGerberFiles.ts
import { plot, read, renderLayers } from "@tracespace/core";
import handleZipUpload from "./handleZipUpload";
import type { RenderLayersResult } from "@tracespace/core";

export async function convertGerberFiles(fileList: FileList | null): Promise<RenderLayersResult> {
  if (!fileList?.length) throw new Error("No file");
  const files   = await handleZipUpload(fileList[0]);
  const readRes = await read(files);
  const plotRes = plot(readRes);
  return renderLayers(plotRes);
}