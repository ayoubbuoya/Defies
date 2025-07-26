import axios from "axios";
import { env } from "../../config/env.js";

export class RestClient {
  constructor(baseURL = env.backendUrl) {
    this.client = axios.create({
      baseURL,
      timeout: 10000, // optional timeout
      headers: {
        "Content-Type": "application/json",
        // Add auth token or custom headers here if needed
      },
    });
  }

  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(`${this.client.defaults.baseUR}${endpoint}`, { params });
      return { isError: false, data: response.data };
    } catch (error) {
      return {
        isError: true,
        error: error?.response?.data?.message || error.message,
      };
    }
  }

  async post(endpoint, body = {}) {
    try {
      const response = await this.client.post(endpoint, body);
      return { isError: false, data: response.data };
    } catch (error) {
      return {
        isError: true,
        error: error?.response?.data?.message || error.message,
      };
    }
  }

  async disconnect() {
  }
}
