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
        console.log(`Syncing ${this.elements.length} elements to active form`);

        // Tiefe Kopie erstellen, um sicherzustellen, dass die Referenzen unterschiedlich sind
        const elementsCopy = JSON.parse(JSON.stringify(this.elements));

        // Sicherstellen, dass alle Elemente korrekte Ordnungszahlen haben
        elementsCopy.forEach((element: FormElement, index: number) => {
          element.order = index;
        });

        // Aktives Formular aktualisieren mit der korrigierten Kopie
        this.activeForm.visualElements = elementsCopy;

        // Debug-Info für ausgewähltes Element
        if (this.selectedElementId) {
          console.log(`Current selected element: ${this.selectedElementId}`);
        }
      } else {
        console.warn("No active form to sync visual elements to");
      }
    },

    getRawActiveFormData(): ServerRawDataFormat | null {
      const form = this.activeForm;
      if (!form) return null;
      // TODO: Implement reverse transformation from form.visualElements to form.rawServerData.children
      return form.rawServerData;
    },

    setFormElements(elements: FormElement[]) {
      // Klare Zuweisung, um sicherzustellen, dass die Änderungen überall übernommen werden
      console.log(`Store: Setting ${elements.length} elements`);

      // Tiefe Kopie der Elemente erstellen, um sicherzustellen, dass es eine neue Referenz ist
      this.elements = JSON.parse(JSON.stringify(elements));

      // Selection zurücksetzen
      this.selectedElementId = null;

      // Mit aktivem Formular synchronisieren
      this.syncActiveFormVisualsFromCanvas();
    },

    resetElementsCache() {
      // Temporär leeres Array setzen, um sicherzustellen, dass Vue die Änderungen erkennt
      this.elements = [];

      // Selection zurücksetzen
      this.selectedElementId = null;
    },

    setFormElementsAndSelect(
      elements: FormElement[],
      elementToSelectId: string
    ) {
      console.log(
        `Store: Setting ${elements.length} elements and selecting ${elementToSelectId}`
      );

      // ID des zu selektierenden Elements merken
      const idToSelect = elementToSelectId;

      // Erst alle Elemente zurücksetzen
      this.resetElementsCache();

      // Warten bis Vue den DOM aktualisiert hat
      setTimeout(() => {
        // Dann die Elemente aktualisieren (mit korrekter Reihenfolge)
        const sortedElements = [...elements];
        sortedElements.forEach((el, idx) => {
          el.order = idx;
        });

        this.elements = JSON.parse(JSON.stringify(sortedElements));

        // Mit aktivem Formular synchronisieren
        this.syncActiveFormVisualsFromCanvas();

        // Sicherstellen, dass die Auswahl nach der Synchronisierung gesetzt wird
        setTimeout(() => {
          console.log(`Ensuring selection of ${idToSelect} is maintained`);
          this.selectedElementId = idToSelect;
        }, 50);
      }, 0);
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
      console.log(`Selecting element: ${elementId}`);

      // Clear current selection first
      this.selectedElementId = null;

      // Use setTimeout to ensure the selection happens after UI updates
      setTimeout(() => {
        // Set the new selection
        this.selectedElementId = elementId;

        // If element ID is provided, let's try to find it to confirm it exists
        if (elementId) {
          const findElementById = (
            elements: FormElement[],
            id: string
          ): FormElement | null => {
            const element = elements.find((el) => el.id === id);
            if (element) return element;

            // Check in fieldset children
            for (const el of elements) {
              if (
                el.type === "fieldset" &&
                el.children &&
                el.children.length > 0
              ) {
                const found = findElementById(el.children, id);
                if (found) return found;
              }
            }

            return null;
          };

          const foundElement = findElementById(this.elements, elementId);
          if (foundElement) {
            console.log(
              `Selected element found: ${foundElement.type} (${elementId})`
            );
          } else {
            console.warn(`Selected element not found: ${elementId}`);
          }
        }
      }, 0);
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
          if (el.id === fieldsetId && el.type === "fieldset") {
            if (!el.children) {
              el.children = [];
            }

            // Calculate safe position and insert element
            const safeIndex = Math.max(
              0,
              Math.min(atIndex, el.children.length)
            );
            el.children.splice(safeIndex, 0, element);

            // Update order indices for all children
            el.children.forEach((child, index) => {
              child.order = index;
            });

            return true;
          }

          // Recursively search in nested fieldsets
          if (el.type === "fieldset" && el.children && el.children.length > 0) {
            if (findAndAdd(el.children)) {
              return true;
            }
          }
        }
        return false;
      }

      const success = findAndAdd(this.elements);
      if (success) {
        this.syncActiveFormVisualsFromCanvas();
        this.selectElement(element.id);
      } else {
        console.error(`Fieldset with id ${fieldsetId} not found`);
      }
    },

    // Add element at specific position (root or within fieldset)
    addElementAtPosition(
      element: FormElement,
      position: number,
      parentId: string | null = null
    ) {
      if (parentId) {
        // Add to fieldset
        this.addElementToFieldset(parentId, element, position);
      } else {
        // Add to root level
        const elementsCopy = [...this.elements];

        const safePosition = Math.max(
          0,
          Math.min(position, elementsCopy.length)
        );
        elementsCopy.splice(safePosition, 0, element);

        // Update order indices
        elementsCopy.forEach((elem, index) => {
          elem.order = index;
        });

        this.setFormElementsAndSelect(elementsCopy, element.id);
      }
    },

    // Move element to new position (with parent support)
    moveElementToPosition(
      elementId: string,
      toPosition: number,
      toParentId: string | null = null
    ) {
      // Find and remove element from source
      const sourceResult = this.findElementWithParent(elementId);
      if (!sourceResult) {
        console.error(`Element ${elementId} not found`);
        return;
      }

      const {
        element: movedElement,
        parent: sourceParent,
        index: sourceIndex,
      } = sourceResult;

      // Remove from source array
      let sourceArray: FormElement[];
      if (
        sourceParent &&
        sourceParent.type === "fieldset" &&
        sourceParent.children
      ) {
        sourceArray = sourceParent.children;
      } else {
        sourceArray = this.elements;
      }

      sourceArray.splice(sourceIndex, 1);

      // Insert at target position
      if (toParentId) {
        // Move to fieldset
        const targetFieldset = this.findElementWithParent(toParentId);
        if (!targetFieldset || targetFieldset.element.type !== "fieldset") {
          console.error(`Target fieldset ${toParentId} not found`);
          // Restore element to source
          sourceArray.splice(sourceIndex, 0, movedElement);
          return;
        }

        const targetElement = targetFieldset.element;
        if (targetElement.type === "fieldset") {
          if (!targetElement.children) {
            targetElement.children = [];
          }

          const targetArray = targetElement.children;
          const safePosition = Math.max(
            0,
            Math.min(toPosition, targetArray.length)
          );
          targetArray.splice(safePosition, 0, movedElement);

          // Update order indices
          targetArray.forEach((elem, index) => {
            elem.order = index;
          });
        }
      } else {
        // Move to root level
        const elementsCopy = [...this.elements];
        const safePosition = Math.max(
          0,
          Math.min(toPosition, elementsCopy.length)
        );
        elementsCopy.splice(safePosition, 0, movedElement);

        // Update order indices
        elementsCopy.forEach((elem, index) => {
          elem.order = index;
        });

        this.setFormElements(elementsCopy);
      }

      this.syncActiveFormVisualsFromCanvas();
      this.selectElement(elementId);
    },

    // Find element with parent information for hierarchical operations
    findElementWithParent(elementId: string): {
      element: FormElement;
      parent: FormElement | null;
      index: number;
    } | null {
      // Search in root level
      const rootIndex = this.elements.findIndex((el) => el.id === elementId);
      if (rootIndex !== -1) {
        return {
          element: this.elements[rootIndex],
          parent: null,
          index: rootIndex,
        };
      }

      // Recursively search in fieldsets
      const searchInChildren = (
        elements: FormElement[],
        parent: FormElement | null = null
      ): {
        element: FormElement;
        parent: FormElement | null;
        index: number;
      } | null => {
        for (const element of elements) {
          if (element.type === "fieldset" && element.children) {
            // Search in direct children
            const childIndex = element.children.findIndex(
              (child) => child.id === elementId
            );
            if (childIndex !== -1) {
              return {
                element: element.children[childIndex],
                parent: element,
                index: childIndex,
              };
            }

            // Search deeper levels recursively
            const deepResult = searchInChildren(element.children, element);
            if (deepResult) {
              return deepResult;
            }
          }
        }
        return null;
      };

      return searchInChildren(this.elements);
    },

    updateElementProperty(elementId: string, key: string, value: any) {
      const element = this.elements.find((el) => el.id === elementId);
      if (!element) return;

      (element as any)[key] = value;
    },
  },
});
