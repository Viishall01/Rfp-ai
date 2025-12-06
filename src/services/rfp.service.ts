import type { RFP, Stats, ParsedEmail, Recipient } from "../types/rfp.types";

const API_BASE_URL = "http://localhost:5000/api";

export const rfpService = {
  // Fetch all RFPs from MongoDB
  async fetchRFPs(): Promise<{
    success: boolean;
    data?: RFP[];
    error?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/rfps`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching RFPs:", err);
      return { success: false, error: "Failed to fetch RFPs" };
    }
  },

  // Fetch stats from MongoDB
  async fetchStats(): Promise<{
    success: boolean;
    data?: Stats;
    error?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/rfps/stats/summary`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching stats:", err);
      return { success: false, error: "Failed to fetch stats" };
    }
  },

  // Award RFP to a vendor
  async awardRFP(
    rfpId: string,
    awardedTo: Recipient
  ): Promise<{ success: boolean; data?: RFP; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/rfps/${rfpId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "awarded",
          awardedTo,
        }),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error awarding RFP:", err);
      return { success: false, error: "Failed to award RFP" };
    }
  },

  // Close an RFP
  async closeRFP(
    rfpId: string
  ): Promise<{ success: boolean; data?: RFP; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/rfps/${rfpId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error closing RFP:", err);
      return { success: false, error: "Failed to close RFP" };
    }
  },

  // Fetch email replies for an RFP
  async fetchRFPReplies(
    rfpId: string
  ): Promise<{ success: boolean; messages?: ParsedEmail[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/rfp-emails/${rfpId}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching RFP replies:", err);
      return { success: false, error: "Failed to fetch RFP replies" };
    }
  },
};
