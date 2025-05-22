import { defineStore } from "pinia";
import type { FormElement } from "../models/FormElement";
import { v4 as uuidv4 } from "uuid";
import { useServerFormImporter } from "@/composables/useServerFormImporter";

// @ts-ignore
import responseJson from "@/test-files/user/Response.json";
// @ts-ignore
import responseWithAddedElementsJson from "@/test-files/user/Response-with-added-elements.json";

export interface ServerRawDataFormat {
  version: string;
  fqn: string;
  attributes: {
    name: string;
    [key: string]: any;
  };
  processors?: any[];
  children: any[];
}

export interface ManagedForm {
  id: string;
  name: string;
  rawServerData: ServerRawDataFormat;
  visualElements: FormElement[];
  filePath?: string;
}

export const useFormBuilderStore = defineStore("formBuilder", {
  state: () => ({
    forms: [] as ManagedForm[],
    activeFormId: null as string | null,
    elements: [] as FormElement[],
    selectedElementId: null as string | null,
    canvasConfig: {
      // Flagged for potential unused state
      width: 1200,
      height: 800,
      zoom: 1,
    },
  }),

  getters: {
    activeForm(state): ManagedForm | null {
      if (!state.activeFormId) return null;
      return state.forms.find((form) => form.id === state.activeFormId) || null;
    },
    selectedElement(state): FormElement | null {
      if (!state.selectedElementId || !this.elements) return null;

      // Rekursive Funktion zum Finden eines Elements nach ID
      const findElementById = (
        elements: FormElement[],
        id: string
      ): FormElement | null => {
        // Zunächst in der aktuellen Ebene suchen
        const element = elements.find((el) => el.id === id);
        if (element) return element;

        // Falls nicht gefunden, in Fieldset-Kindern suchen
        for (const el of elements) {
          if (el.type === "fieldset" && el.children && el.children.length > 0) {
            const found = findElementById(el.children, id);
            if (found) return found;
          }
        }

        return null;
      };

      return findElementById(this.elements, state.selectedElementId);
    },
    formList(state): { id: string; name: string }[] {
      return state.forms.map((f) => ({ id: f.id, name: f.name }));
    },
  },

  actions: {
    async loadInitialForms() {
      const { transformServerFormToVisual } = useServerFormImporter();

      const initialFilesToLoad = [
        {
          fileName: "Response.json",
          data: responseJson as ServerRawDataFormat,
        },
        {
          fileName: "Response-with-added-elements.json",
          data: responseWithAddedElementsJson as ServerRawDataFormat,
        },
      ];

      initialFilesToLoad.forEach((fileData) => {
        const formName =
          fileData.data.attributes?.name ||
          fileData.fileName.replace(".json", "");
        const visualElements = transformServerFormToVisual(fileData.data);

        const newManagedForm: ManagedForm = {
          id: uuidv4(),
          name: formName,
          rawServerData: fileData.data,
          visualElements: visualElements,
          filePath: `src/test-files/user/${fileData.fileName}`,
        };

        if (!this.forms.some((f) => f.name === newManagedForm.name)) {
          this.forms.push(newManagedForm);
        } else {
          console.warn(
            `Form with name "${newManagedForm.name}" from ${fileData.fileName} already exists or was loaded. Skipping.`
          );
        }
      });

      if (this.forms.length === 0) {
        console.log("No JSON forms loaded, creating a default blank form.");
        this.createBlankForm("My First Form");
      }

      if (this.activeFormId) {
        const currentActiveForm = this.forms.find(
          (f) => f.id === this.activeFormId
        );
        if (currentActiveForm) {
          this.elements = [...currentActiveForm.visualElements];
        } else {
          console.warn(
            `Previously active formId ${this.activeFormId} not found in loaded forms. Clearing active form.`
          );
          this.activeFormId = null;
          this.elements = [];
        }
      }
    },

    createBlankForm(name?: string) {
      const newFormId = uuidv4();
      const formName = name || "Untitled Form";
      const newManagedForm: ManagedForm = {
        id: newFormId,
        name: formName,
        rawServerData: {
          version: "0.0.1",
          fqn: "Easy\\Form",
          attributes: { name: formName, class: "formi", method: "post" },
          processors: [
            { fqn: "Easy\\Form\\Support\\Processor\\FormIdentifier" },
            { fqn: "Easy\\Form\\Support\\Processor\\CsrfToken" },
          ],
          children: [],
        },
        visualElements: [],
      };
      this.forms.push(newManagedForm);
      this.setActiveForm(newFormId);
      return newFormId;
    },

    setActiveForm(formId: string | null) {
      if (!formId) {
        this.activeFormId = null;
        this.elements = [];
        this.selectedElementId = null;
        return;
      }
      const formToActivate = this.forms.find((f) => f.id === formId);
      if (formToActivate) {
        this.activeFormId = formId;
        this.elements = [...formToActivate.visualElements]; // Ensure deep copy if visualElements can be complex
        this.selectedElementId = null;
      } else {
        console.warn(
          `Store: Form with id ${formId} not found. Cannot activate.`
        );
        if (this.forms.length > 0) {
          this.setActiveForm(this.forms[0].id);
        } else {
          this.activeFormId = null;
          this.elements = [];
        }
      }
    },

    deleteForm(formId: string) {
      const formIndex = this.forms.findIndex((f) => f.id === formId);
      if (formIndex !== -1) {
        this.forms.splice(formIndex, 1);
        if (this.activeFormId === formId) {
          if (this.forms.length > 0) {
            this.setActiveForm(this.forms[0].id);
          } else {
            this.setActiveForm(null);
          }
        }
      } else {
        console.warn(`Form with id ${formId} not found for deletion.`);
      }
    },

    updateActiveFormName(newName: string) {
      const form = this.activeForm;
      if (form) {
        form.name = newName;
        form.rawServerData.attributes.name = newName;
        const formIndex = this.forms.findIndex(
          (f) => f.id === this.activeFormId
        );
        if (formIndex !== -1) {
          this.forms.splice(formIndex, 1, { ...form });
        }
      }
    },

    updateActiveFormVisualElements(newVisualElements: FormElement[]) {
      const form = this.activeForm;
      if (form) {
        form.visualElements = [...newVisualElements];
        this.elements = [...newVisualElements];
      }
    },

    syncActiveFormVisualsFromCanvas() {
      if (this.activeForm) {
        this.activeForm.visualElements = [...this.elements];
      }
    },

    getRawActiveFormData(): ServerRawDataFormat | null {
      const form = this.activeForm;
      if (!form) return null;
      // TODO: Implement reverse transformation from form.visualElements to form.rawServerData.children
      return form.rawServerData;
    },

    setFormElements(elements: FormElement[]) {
      this.elements = elements;
      this.selectedElementId = null;
      this.syncActiveFormVisualsFromCanvas();
    },

    addElement(element: FormElement) {
      this.elements.push(element);
      this.syncActiveFormVisualsFromCanvas();
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
        case "radio":
          newElement = {
            ...baseElementProps,
            type: "radio",
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
            ],
            defaultValue: "option1",
            width: 250,
            height: 80,
          } as FormElement;
          break;
        case "fieldset":
          newElement = {
            ...baseElementProps,
            type: "fieldset",
            children: [],
            width: 400,
            height: 200,
          } as FormElement;
          break;
        default:
          console.warn(`Unknown element type: ${elementType}`);
          return null;
      }

      if (newElement) {
        this.elements.push(newElement);
        this.syncActiveFormVisualsFromCanvas();
        this.selectElement(newElement.id);
        return newElement;
      }

      return null;
    },

    updateElement(elementId: string, updates: Partial<FormElement>) {
      // Rekursiv Element finden und aktualisieren
      const updateElementRecursive = (elements: FormElement[]): boolean => {
        // Element in aktueller Ebene suchen
        const index = elements.findIndex((el) => el.id === elementId);
        if (index !== -1) {
          elements[index] = {
            ...elements[index],
            ...updates,
          } as FormElement;
          return true;
        }

        // In Fieldset-Kindern suchen
        for (const el of elements) {
          if (el.type === "fieldset" && el.children && el.children.length > 0) {
            if (updateElementRecursive(el.children)) {
              return true;
            }
          }
        }

        return false;
      };

      // Aktualisieren ausführen
      const wasUpdated = updateElementRecursive(this.elements);

      if (wasUpdated) {
        this.syncActiveFormVisualsFromCanvas();
      } else {
        console.warn(`Element with id ${elementId} not found for update.`);
      }
    },

    updateElementPosition(elementId: string, x: number, y: number) {
      const element = this.elements.find((el) => el.id === elementId);
      if (element) {
        element.x = x;
        element.y = y;
        this.syncActiveFormVisualsFromCanvas();
      }
    },

    removeElement(elementId: string) {
      // Funktion zum rekursiven Löschen von Elementen (auch in verschachtelten Fieldsets)
      const removeFromChildren = (elements: FormElement[]): boolean => {
        // Direkt in diesem Array suchen
        const directIndex = elements.findIndex((el) => el.id === elementId);
        if (directIndex !== -1) {
          elements.splice(directIndex, 1);
          return true;
        }

        // In Kindern von Fieldsets suchen
        for (const el of elements) {
          if (el.type === "fieldset" && el.children && el.children.length > 0) {
            if (removeFromChildren(el.children)) {
              return true;
            }
          }
        }

        return false;
      };

      // Zuerst versuchen, in verschachtelten Elementen zu löschen
      const wasRemoved = removeFromChildren(this.elements);

      // Falls das Element nicht in verschachtelten Fieldsets gefunden wurde,
      // war es wahrscheinlich schon auf Root-Ebene und wurde gelöscht

      // Die Auswahl zurücksetzen, wenn das gelöschte Element ausgewählt war
      if (this.selectedElementId === elementId) {
        this.selectedElementId = null;
      }

      this.syncActiveFormVisualsFromCanvas();
    },

    selectElement(elementId: string | null) {
      this.selectedElementId = elementId;
    },

    async saveForm() {
      const activeFormData = this.getRawActiveFormData();
      if (activeFormData) {
      } else {
        console.warn("No active form to save.");
      }
    },

    addElementToFieldset(
      fieldsetId: string,
      element: FormElement,
      atIndex: number = 0
    ) {
      function findAndAdd(elements: FormElement[]): boolean {
        for (const el of elements) {
          if (el.type === "fieldset" && el.id === fieldsetId) {
            if (!el.children) el.children = [];

            // Add at specified index or default to beginning (index 0)
            if (atIndex >= 0 && atIndex <= el.children.length) {
              el.children.splice(atIndex, 0, element);
            } else {
              // Fallback to adding at the beginning if index is invalid
              el.children.unshift(element);
            }
            return true;
          } else if (el.type === "fieldset" && el.children) {
            if (findAndAdd(el.children)) return true;
          }
        }
        return false;
      }
      if (findAndAdd(this.elements)) {
        this.syncActiveFormVisualsFromCanvas();
        this.selectElement(element.id);
      } else {
        console.warn(`Fieldset with id ${fieldsetId} not found.`);
      }
    },

    // Update a specific property of an element
    updateElementProperty(elementId: string, key: string, value: any) {
      const element = this.elements.find((el) => el.id === elementId);
      if (!element) return;

      (element as any)[key] = value;
    },
  },
});
