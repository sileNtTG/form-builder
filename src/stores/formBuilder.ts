import { defineStore } from "pinia";
import type { FormElement } from "../models/FormElement";
import { v4 as uuidv4 } from "uuid";

export const useFormBuilderStore = defineStore("formBuilder", {
  state: () => ({
    elements: [] as FormElement[],
    selectedElementId: null as string | null,
    canvasConfig: {
      width: 1200,
      height: 800,
      zoom: 1,
    },
  }),

  getters: {
    selectedElement: (state) =>
      state.selectedElementId
        ? state.elements.find(
            (el: FormElement) => el.id === state.selectedElementId
          )
        : null,
  },

  actions: {
    addElement(element: FormElement) {
      this.elements.push(element);
    },

    createAndAddElement(elementType: string, x: number, y: number) {
      const baseElement = {
        id: uuidv4(),
        label: `New ${
          elementType.charAt(0).toUpperCase() + elementType.slice(1)
        }`,
        required: false,
        order: this.elements.length + 1,
        x,
        y,
        width: 300,
        height: 70,
      };

      let newElement: FormElement | null = null;

      switch (elementType) {
        case "input":
          newElement = {
            ...baseElement,
            type: "input",
            placeholder: "Enter text",
          } as FormElement;
          break;
        case "textarea":
          newElement = {
            ...baseElement,
            type: "textarea",
            placeholder: "Enter text",
            rows: 4,
          } as FormElement;
          break;
        case "checkbox":
          newElement = {
            ...baseElement,
            type: "checkbox",
            checked: false,
          } as FormElement;
          break;
        case "select":
          newElement = {
            ...baseElement,
            type: "select",
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
            ],
            multiple: false,
          } as FormElement;
          break;
        case "number":
          newElement = {
            ...baseElement,
            type: "number",
            min: 0,
            max: 100,
          } as FormElement;
          break;
        case "date":
          newElement = {
            ...baseElement,
            type: "date",
          } as FormElement;
          break;
        case "file":
          newElement = {
            ...baseElement,
            type: "file",
            accept: "*/*",
            multiple: false,
          } as FormElement;
          break;
        default:
          return null;
      }

      if (newElement) {
        this.addElement(newElement);
        this.selectElement(newElement.id);
        return newElement;
      }

      return null;
    },

    updateElement(id: string, updates: Partial<FormElement>) {
      const index = this.elements.findIndex((el: FormElement) => el.id === id);
      if (index !== -1) {
        this.elements[index] = { ...this.elements[index], ...updates };
      }
    },

    updateElementPosition(id: string, x: number, y: number) {
      const index = this.elements.findIndex((el: FormElement) => el.id === id);
      if (index !== -1) {
        this.elements[index] = {
          ...this.elements[index],
          x,
          y,
        };
      }
    },

    removeElement(id: string) {
      this.elements = this.elements.filter((el: FormElement) => el.id !== id);
      if (this.selectedElementId === id) {
        this.selectedElementId = null;
      }
    },

    selectElement(id: string | null) {
      this.selectedElementId = id;
    },

    async saveForm() {
      // Save to backend via API service
      console.log("Saving form...");
    },
  },
});
