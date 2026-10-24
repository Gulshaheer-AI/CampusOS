/** Store original uploads as Blobs, outside the small synchronous localStorage quota. */
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("campusos-files", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("materials");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("File storage unavailable"));
  });
}
export async function saveMaterialFile(key: string, file: Blob): Promise<void> {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("materials", "readwrite");
      tx.objectStore("materials").put(file, key);
      tx.oncomplete = () => resolve();
      tx.onerror = tx.onabort = () =>
        reject(tx.error || new Error("Unable to save file"));
    });
  } finally {
    db.close();
  }
}
export async function readMaterialFile(key: string): Promise<Blob> {
  const db = await database();
  try {
    return await new Promise<Blob>((resolve, reject) => {
      const request = db
        .transaction("materials")
        .objectStore("materials")
        .get(key);
      request.onsuccess = () =>
        request.result instanceof Blob
          ? resolve(request.result)
          : reject(
              new Error(
                "The original file is missing from this browser. Ask the teacher to upload it again.",
              ),
            );
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}
