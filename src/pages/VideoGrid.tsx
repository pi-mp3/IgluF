/**
 * VideoGrid.tsx
 *
 * Component to render participant video streams in a grid.
 * Automatically attaches MediaStreams to video elements.
 *
 * User sees participant names and video; internal logic in English.
 */

import React, { useEffect, useRef } from "react";

interface VideoTileProps {
  stream: MediaStream;
  name?: string;
  muted?: boolean;
}

export const VideoTile: React.FC<VideoTileProps> = ({ stream, name, muted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="video-tile">
      <video ref={videoRef} autoPlay playsInline muted={muted} />
      <div className="video-label">{name || "Desconocido"}</div>
    </div>
  );
};
