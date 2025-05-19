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
      const baseElementProps = {
        id: uuidv4(),
        label: `New ${
          elementType.charAt(0).toUpperCase() + elementType.slice(1)
        }`,
        required: false,
        order: this.elements.length + 1,
        x,
        y,
      };

      let newElement: FormElement | null = null;

      switch (elementType) {
        case "input":
          newElement = {
            ...baseElementProps,
            type: "input",
            placeholder: "Enter text",
            width: 250,
            height: 48,
          } as FormElement;
          break;
        case "textarea":
          newElement = {
            ...baseElementProps,
            type: "textarea",
            placeholder: "Enter text",
            rows: 4,
            width: 300,
            height: 120,
          } as FormElement;
          break;
        case "checkbox":
          newElement = {
            ...baseElementProps,
            type: "checkbox",
            checked: false,
            width: 200,
            height: 40,
          } as FormElement;
          break;
        case "select":
          newElement = {
            ...baseElementProps,
            type: "select",
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
            ],
            multiple: false,
            width: 250,
            height: 48,
          } as FormElement;
          break;
        case "number":
          newElement = {
            ...baseElementProps,
            type: "number",
            min: 0,
            max: 100,
            width: 150,
            height: 48,
          } as FormElement;
          break;
        case "date":
          newElement = {
            ...baseElementProps,
            type: "date",
            width: 200,
            height: 48,
          } as FormElement;
          break;
        case "file":
          newElement = {
            ...baseElementProps,
            type: "file",
            accept: "*/*",
            multiple: false,
            width: 300,
            height: 48,
          } as FormElement;
          break;
        default:
          console.warn(`Unknown element type: ${elementType}`);
          return null;
      }

      if (newElement) {
        this.addElement(newElement);
        this.selectElement(newElement.id);
        return newElement;
      }

      return null;
    },

    updateElement(elementId: string, updates: Partial<FormElement>) {
      const index = this.elements.findIndex((el) => el.id === elementId);
      if (index !== -1) {
        this.elements[index] = {
          ...this.elements[index],
          ...updates,
        } as FormElement;
        if (this.selectedElementId === elementId) {
          // selectedElement is computed, so updating elements[index] and selectedElementId is enough
          // If selectedElementId itself needs to trigger re-computation of selectedElement, ensure it does.
        }
      }
    },

    updateElementPosition(elementId: string, x: number, y: number) {
      const element = this.elements.find((el) => el.id === elementId);
      if (element) {
        element.x = x;
        element.y = y;
        // No need to update selectedElement directly, it's computed from selectedElementId
        // If the currently selected element is moved, its details in PropertyPanel will update
        // because PropertyPanel watches selectedElement, which recomputes if its source (elements array) changes.
      }
    },

    removeElement(elementId: string) {
      this.elements = this.elements.filter((el) => el.id !== elementId);
      if (this.selectedElementId === elementId) {
        this.selectedElementId = null;
      }
    },

    selectElement(elementId: string | null) {
      this.selectedElementId = elementId;
    },

    async saveForm() {
      // Save to backend via API service
      console.log("Saving form...");
    },
  },
});
