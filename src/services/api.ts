// Backend API always runs on port 3000
const API_BASE = "http://localhost:3000/api";

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include', // Include cookies for session persistence
    });
    if (!response.ok) throw new Error(`GET ${endpoint} failed`);
    return response.json();
  },
  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: 'include', // Include cookies for session persistence
    });
    if (!response.ok) throw new Error(`POST ${endpoint} failed`);
    return response.json();
  },
};
