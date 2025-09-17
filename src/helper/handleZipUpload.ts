import JSZip from "jszip";

export default async function handleZipUpload(file: File | null): Promise<File[]> {
  if (!file) throw new Error("no file");
  const zip = await JSZip.loadAsync(file);
  return Promise.all(
    Object.values(zip.files)
      .filter((entry) => !entry.dir)
      .map(async (entry) => {
        const buf = await entry.async("arraybuffer");
        const name = entry.name.split("/").pop() || "file";
        return new File([buf], name, { type: "application/octet-stream" });
      })
  );
}