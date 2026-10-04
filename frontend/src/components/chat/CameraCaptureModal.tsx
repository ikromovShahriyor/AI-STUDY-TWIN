"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, X, RotateCcw, Check, RefreshCw, AlertCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  // Stop camera tracks cleanly
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start camera stream
  const startCamera = async (mode: "environment" | "user") => {
    setIsLoading(true);
    setErrorMsg(null);
    stopStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Kamera API ushbu brauzerda qo'llab-quvvatlanmaydi.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsLoading(false);
    } catch (err: any) {
      console.warn("Camera start error:", err);
      // Fallback try without facingMode constraints
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
        }
        setIsLoading(false);
      } catch (fallbackErr: any) {
        setIsLoading(false);
        setErrorMsg(t.chat.cameraPermissionDenied);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedDataUrl(null);
      setCapturedBlob(null);
      startCamera(facingMode);
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  // Flip camera between front and back
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Snap photo from video feed onto canvas
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedDataUrl(dataUrl);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
        }
      },
      "image/jpeg",
      0.92
    );
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedDataUrl(null);
    setCapturedBlob(null);
    if (!streamRef.current) {
      startCamera(facingMode);
    }
  };

  // Confirm photo and send back to Chat
  const handleConfirm = () => {
    if (capturedBlob) {
      const file = new File([capturedBlob], `camera_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      onCapture(file);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "640px",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          border: "1px solid var(--border-glass)",
          backgroundColor: "#080c16",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(139, 92, 246, 0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-glass)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "var(--gradient-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <Camera size={18} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
                {t.chat.camera}
              </div>
              <div style={{ fontSize: "11px", color: "var(--accent-cyan)" }}>
                {t.chat.photoTeacherBadge}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {!capturedDataUrl && !errorMsg && (
              <button
                onClick={handleToggleFacingMode}
                className="btn-secondary"
                style={{ padding: "6px 10px", fontSize: "12px" }}
                title={t.chat.switchCamera}
              >
                <RefreshCw size={14} />
                <span>{t.chat.switchCamera}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="btn-icon"
              style={{ width: "32px", height: "32px", borderRadius: "8px" }}
              title={t.chat.closeCamera}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Viewfinder / Preview Body */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "380px",
            backgroundColor: "#000",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {errorMsg ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px",
                maxWidth: "400px",
                color: "var(--text-secondary)",
              }}
            >
              <AlertCircle size={40} color="var(--accent-rose)" style={{ marginBottom: "12px" }} />
              <div style={{ fontSize: "14px", color: "var(--accent-rose)", marginBottom: "8px", fontWeight: 600 }}>
                {errorMsg}
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Kameradan foydalanish uchun brauzer ruxsatini yoqing yoki oddiy Galereya/Fayl orqali rasm yuklang.
              </p>
            </div>
          ) : capturedDataUrl ? (
            // Captured photo preview
            <img
              src={capturedDataUrl}
              alt="Captured"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            // Live Video Stream with Viewfinder Guides
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Viewfinder Target Framing Guides */}
              <div
                style={{
                  position: "absolute",
                  inset: "30px",
                  pointerEvents: "none",
                  boxSizing: "border-box",
                }}
              >
                {/* Top-Left Corner */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "28px",
                    height: "28px",
                    borderTop: "3px solid var(--accent-cyan)",
                    borderLeft: "3px solid var(--accent-cyan)",
                    borderRadius: "4px 0 0 0",
                  }}
                />
                {/* Top-Right Corner */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "28px",
                    height: "28px",
                    borderTop: "3px solid var(--accent-cyan)",
                    borderRight: "3px solid var(--accent-cyan)",
                    borderRadius: "0 4px 0 0",
                  }}
                />
                {/* Bottom-Left Corner */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "28px",
                    height: "28px",
                    borderBottom: "3px solid var(--accent-cyan)",
                    borderLeft: "3px solid var(--accent-cyan)",
                    borderRadius: "0 0 0 4px",
                  }}
                />
                {/* Bottom-Right Corner */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "28px",
                    height: "28px",
                    borderBottom: "3px solid var(--accent-cyan)",
                    borderRight: "3px solid var(--accent-cyan)",
                    borderRadius: "0 0 4px 0",
                  }}
                />
              </div>

              {isLoading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    gap: "8px",
                  }}
                >
                  <RefreshCw size={16} className="animate-spin" />
                  <span>{t.chat.cameraStarting}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--border-glass)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            background: "rgba(255, 255, 255, 0.02)",
          }}
        >
          {capturedDataUrl ? (
            <>
              <button
                onClick={handleRetake}
                className="btn-secondary"
                style={{ padding: "10px 20px", fontSize: "14px", borderRadius: "var(--radius-md)" }}
              >
                <RotateCcw size={16} />
                <span>{t.chat.retake}</span>
              </button>

              <button
                onClick={handleConfirm}
                className="btn-primary"
                style={{ padding: "10px 24px", fontSize: "14px", borderRadius: "var(--radius-md)" }}
              >
                <Check size={16} />
                <span>{t.chat.confirmPhoto}</span>
              </button>
            </>
          ) : !errorMsg ? (
            <button
              onClick={handleSnap}
              disabled={isLoading}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)",
                border: "4px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.6)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                transition: "all 0.2s ease",
              }}
              title={t.chat.takePhoto}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                }}
              />
            </button>
          ) : (
            <button onClick={onClose} className="btn-secondary" style={{ padding: "8px 20px" }}>
              {t.common.cancel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
