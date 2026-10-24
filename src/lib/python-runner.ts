export function runPython(
  code: string,
  onOutput: (text: string, error: boolean) => void,
  timeoutMs = 60000,
): { cancel: () => void; done: Promise<void> } {
  const worker = new Worker("/python-worker.js");
  let finish: () => void = () => {};
  const done = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const stop = () => {
    clearTimeout(timer);
    worker.terminate();
    finish();
  };
  const timer = setTimeout(() => {
    onOutput(
      "Python execution timed out. Check for an infinite loop or unavailable runtime download.",
      true,
    );
    stop();
  }, timeoutMs);
  worker.onmessage = ({ data }) => {
    if (data.type === "done") {
      stop();
      return;
    }
    onOutput(data.text, data.type !== "stdout");
    if (data.type === "error") stop();
  };
  worker.onerror = (event) => {
    onOutput(
      event.message || "Python runtime failed to load. Check your connection.",
      true,
    );
    stop();
  };
  worker.postMessage({ code });
  return { cancel: stop, done };
}
