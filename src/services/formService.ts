import axios from "axios";
import type { FormElement } from "../models/FormElement";

// This would be the actual API URL in a real application
const API_URL = "http://localhost:3000/api";

export interface Form {
  id: string;
  name: string;
  description?: string;
  elements: FormElement[];
  createdAt: string;
  updatedAt: string;
}

export const formService = {
  // Get all forms
  async getForms(): Promise<Form[]> {
    try {
      // In a real app, this would be an actual API call
      // const response = await axios.get(`${API_URL}/forms`);
      // return response.data;

      // For now, return mock data
      return [
        {
          id: "1",
          name: "Contact Form",
          description: "A simple contact form",
          elements: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Registration Form",
          description: "User registration form",
          elements: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    } catch (error) {
      console.error("Error fetching forms:", error);
      throw error;
    }
  },

  // Get a single form by ID
  async getFormById(id: string): Promise<Form> {
    try {
      // const response = await axios.get(`${API_URL}/forms/${id}`);
      // return response.data;

      // Mock data
      return {
        id,
        name: "Contact Form",
        description: "A simple contact form",
        elements: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error fetching form ${id}:`, error);
      throw error;
    }
  },

  // Create a new form
  async createForm(
    form: Omit<Form, "id" | "createdAt" | "updatedAt">
  ): Promise<Form> {
    try {
      // const response = await axios.post(`${API_URL}/forms`, form);
      // return response.data;

      // Mock response
      return {
        ...form,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error creating form:", error);
      throw error;
    }
  },

  // Update an existing form
  async updateForm(id: string, form: Partial<Form>): Promise<Form> {
    try {
      // const response = await axios.put(`${API_URL}/forms/${id}`, form);
      // return response.data;

      // Mock response
      return {
        ...form,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Form;
    } catch (error) {
      console.error(`Error updating form ${id}:`, error);
      throw error;
    }
  },

  // Delete a form
  async deleteForm(id: string): Promise<void> {
    try {
      // await axios.delete(`${API_URL}/forms/${id}`);
      // Form deleted successfully
    } catch (error) {
      console.error(`Error deleting form ${id}:`, error);
      throw error;
    }
  },
};
