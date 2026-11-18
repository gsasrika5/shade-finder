// Reads a product barcode from the phone's camera. Android's Chrome can read
// barcodes on its own; iPhones can't, so there the free barcode-detector
// library (MIT license) is loaded from jsDelivr the first time Scan is tapped.
const LIBRARY_URL = "https://cdn.jsdelivr.net/npm/barcode-detector@3.2.3/pure/+esm";
const PRODUCT_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e"];
const SCAN_EVERY_MS = 250;

async function createDetector() {
  if ("BarcodeDetector" in window) {
    const supported = await window.BarcodeDetector.getSupportedFormats();
    if (PRODUCT_FORMATS.every((format) => supported.includes(format))) {
      return new window.BarcodeDetector({ formats: PRODUCT_FORMATS });
    }
  }
  const { BarcodeDetector } = await import(LIBRARY_URL);
  return new BarcodeDetector({ formats: PRODUCT_FORMATS });
}

// Why scanning couldn't start, in words a user can act on.
export function cameraProblem(error) {
  if (error?.name === "NotAllowedError") {
    return "The camera is blocked. Allow camera access for this site in your browser settings, or type the number instead.";
  }
  if (error?.name === "NotFoundError" || error?.name === "OverconstrainedError") {
    return "No camera was found on this device. Type the barcode number instead.";
  }
  return "The barcode scanner couldn't start. Type the barcode number instead.";
}

// Starts the back camera in the video element and calls onCode with the first
// barcode it reads. Returns a stop function. Throws if the camera or the
// barcode reader can't start.
export async function startScanning(video, onCode) {
  // The reader loads first, so a failed download never leaves the camera on.
  const detector = await createDetector();
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
  video.srcObject = stream;
  try {
    await video.play();
  } catch (error) {
    stream.getTracks().forEach((track) => track.stop());
    throw error;
  }

  let stopped = false;
  let timer = null;
  const stop = () => {
    stopped = true;
    clearTimeout(timer);
    stream.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  };
  const scan = async () => {
    if (stopped) {
      return;
    }
    try {
      const [barcode] = await detector.detect(video);
      if (barcode && !stopped) {
        stop();
        onCode(barcode.rawValue);
        return;
      }
    } catch {
      // A frame that can't be read yet (the video is still starting) is skipped.
    }
    timer = setTimeout(scan, SCAN_EVERY_MS);
  };
  scan();
  return stop;
}
