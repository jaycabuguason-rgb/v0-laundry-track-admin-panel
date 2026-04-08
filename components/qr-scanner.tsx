"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CameraOff } from "lucide-react";

interface QRScannerProps {
  onScan: (value: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const videoRef   = useRef<HTMLVideoElement | null>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const rafRef     = useRef<number | null>(null);
  const canvasRef  = useRef<HTMLCanvasElement | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const stopScanner = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  const startScanner = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);

      // Use BarcodeDetector if available (Chrome 83+, Edge, Safari 17+)
      const BD = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => { detect: (src: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
      if (!BD) {
        setError("QR scanning is not supported in this browser. Try Chrome or Edge. You can still use Manual Lookup below.");
        stopScanner();
        return;
      }
      const detector = new BD({ formats: ["qr_code"] });

      const tick = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        try {
          const results = await detector.detect(videoRef.current);
          if (results.length > 0) {
            const raw = results[0].rawValue;
            const match = raw.match(/ticket\/([A-Z0-9-]+)/i);
            const ticketId = match ? match[1].toUpperCase() : raw;
            onScan(ticketId);
            stopScanner();
            return;
          }
        } catch { /* continue scanning */ }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied")
          ? "Camera permission denied. Please allow camera access and try again."
          : "Could not start camera. Check your device and browser permissions."
      );
    }
  }, [onScan, stopScanner]);

  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  return (
    <div className="space-y-3">
      {/* Scanner viewport */}
      <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Hidden canvas used if needed */}
        <canvas ref={canvasRef} className="hidden" />

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
              <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-sm" />
              <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-sm" />
              <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-sm" />
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
