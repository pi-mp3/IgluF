/**
 * useMedia.ts
 *
 * Custom hook to manage microphone and camera streams.
 * Provides start, stop, and mute functionality for both audio and video.
 *
 * User-facing text is in Spanish, internal docs in English.
 */

import { useRef, useState } from "react";

export const useMedia = () => {
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);

  /**
   * Starts user media stream (audio and video)
   * @param {boolean} audio - enable microphone
   * @param {boolean} video - enable camera
   * @returns {Promise<MediaStream|null>}
   */
  const startMedia = async (audio = true, video = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
      mediaStreamRef.current = stream;
      setVideoEnabled(video);
      setIsMuted(false);
      return stream;
    } catch (err) {
      console.error("❌ Error accessing media devices:", err);
      alert("No se pudo acceder a micrófono o cámara. Verifica los permisos.");
      return null;
    }
  };

  /**
   * Stops all tracks in the media stream
   */
  const stopMedia = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
      setIsMuted(false);
      setVideoEnabled(false);
    }
  };

  /**
   * Toggles microphone mute state
   */
  const toggleMute = () => {
    if (!mediaStreamRef.current) return;
    mediaStreamRef.current.getAudioTracks().forEach(track => (track.enabled = isMuted));
    setIsMuted(!isMuted);
  };

  /**
   * Toggles camera state
   */
  const toggleVideo = () => {
    if (!mediaStreamRef.current) return;
    mediaStreamRef.current.getVideoTracks().forEach(track => (track.enabled = !videoEnabled));
    setVideoEnabled(!videoEnabled);
  };

  return { mediaStreamRef, isMuted, videoEnabled, startMedia, stopMedia, toggleMute, toggleVideo };
};
