"use client";

import React, { useEffect } from "react";
import { X, Download, ExternalLink } from "lucide-react";
import { getFileUrl } from "@/lib/api";

interface ImageLightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  const fullUrl = getFileUrl(imageUrl);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls bar */}
        <div
          style={{
            position: "absolute",
            top: "-48px",
            right: 0,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="btn-icon"
            style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.1)" }}
            title="Yuklab olish"
          >
            <Download size={18} />
          </a>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.1)" }}
            title="Yopish"
          >
            <X size={20} />
          </button>
        </div>

        {/* Full Image */}
        <img
          src={fullUrl}
          alt="Vision attachment"
          style={{
            maxWidth: "100%",
            maxHeight: "85vh",
            objectFit: "contain",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-glass)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)",
          }}
        />
      </div>
    </div>
  );
};
