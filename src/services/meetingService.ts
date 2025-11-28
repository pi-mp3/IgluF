/**
 * Meeting REST service.
 * Uses Fetch API to interact with the meeting backend.
 */

import { MeetingInfo } from "../types/meeting";
import { ENV } from "../config/env";

export const createMeeting = async (uid: string): Promise<MeetingInfo> => {
  const res = await fetch(`${ENV.USER_SERVER_URL}/api/meeting/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid }),
  });

  if (!res.ok) throw new Error("Error creating meeting");
  return res.json();
};
