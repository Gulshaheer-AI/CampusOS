/* Run CPython/WASM away from the UI; the caller terminates slow or runaway programs. */
self.onmessage = async ({ data }) => {
  try {
    const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
    importScripts(indexURL + "pyodide.js");
    const py = await loadPyodide({
      indexURL,
      stdout: (text) => self.postMessage({ type: "stdout", text }),
      stderr: (text) => self.postMessage({ type: "stderr", text }),
    });
    await py.loadPackagesFromImports(data.code);
    await py.runPythonAsync(data.code);
    self.postMessage({ type: "done" });
  } catch (error) {
    self.postMessage({ type: "error", text: String(error) });
  }
};
