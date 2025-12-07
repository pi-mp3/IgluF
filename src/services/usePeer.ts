/**
 * usePeer.ts
 *
 * Provides Peer.js instance for WebRTC connections.
 * Each participant can send/receive audio/video streams.
 *
 * Internal docs in English, UI interactions in Spanish.
 */

import Peer from "peerjs";

let peer: Peer | null = null;

/**
 * Returns a Peer instance, creating one if it doesn't exist
 * @param id optional user id
 */
export const getPeer = (id?: string) => {
  if (!peer) {
    peer = new Peer(id, { host: "/", port: 9000, path: "/peerjs" }); // adjust backend config
  }
  return peer;
};
