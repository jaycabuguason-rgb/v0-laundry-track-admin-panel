"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { CameraOff } from "lucide-react";

interface QRScannerProps {
  onScan: (value: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const containerId = "qr-reader-container";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScanner = async () => {
    setError(null);
    try {
      const scanner = new Html5Qrcode(containerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          // Extract ticket ID from URL or use raw value
          const match = decodedText.match(/ticket\/([A-Z0-9-]+)/);
          const ticketId = match ? match[1] : decodedText;
          onScan(ticketId);
          stopScanner();
        },
        () => { /* ignore non-match frames */ }
      );
      setActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes("Permission") || msg.includes("permission")
        ? "Camera permission denied. Please allow camera access and try again."
        : "Could not start camera. Please check your device and browser permissions.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // already stopped
      }
      scannerRef.current = null;
    }
    setActive(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      {/* Scanner viewport */}
      <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <div id={containerId} className="w-full h-full" />

        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/60 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CameraOff className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Camera is off</p>
          </div>
        )}

        {/* Corner guides when active */}
        {active && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-48 h-48">
              {/* Top-left */}
              <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-sm" />
              {/* Top-right */}
              <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-sm" />
              {/* Bottom-left */}
              <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-sm" />
              {/* Bottom-right */}
              <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-sm" />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
      )}

      <Button
        size="sm"
        variant={active ? "destructive" : "default"}
        className="w-full min-h-[44px]"
        onClick={active ? stopScanner : startScanner}
      >
        {active ? "Stop Camera" : "Start Camera"}
      </Button>

      {active && (
        <p className="text-xs text-center text-muted-foreground">
          Point the QR code at the camera to scan automatically.
        </p>
      )}
    </div>
  );
}
