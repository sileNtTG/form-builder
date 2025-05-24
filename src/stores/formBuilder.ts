import { defineStore } from "pinia";
import type {
  FormElement,
  TextInputElement,
  TextareaElement,
  ButtonElement,
  FieldsetElement,
  CheckboxElement,
  SelectElement, // Add other specific types if your createElement supports them
} from "../models/FormElement";
import { v4 as uuidv4 } from "uuid";
import { useServerFormImporter } from "@/composables/useServerFormImporter";

// @ts-ignore
import responseJson from "@/test-files/user/Response.json";
// @ts-ignore
import responseWithAddedElementsJson from "@/test-files/user/Response-with-added-elements.json";

interface ServerElement {
  fqn: string;
  attributes?: Record<string, unknown>;
  children?: ServerElement[];
  html?: string;
  processors?: Array<{ fqn: string; [key: string]: unknown }>;
}

export interface ServerRawDataFormat {
  version: string;
  fqn: string;
  attributes: {
    name: string;
    [key: string]: string | number | boolean | null | undefined;
  };
  processors?: Array<{ fqn: string; [key: string]: unknown }>;
  children: ServerElement[];
}

export interface ManagedForm {
  id: string;
  name: string;
  rawServerData: ServerRawDataFormat;
  visualElements: FormElement[];
  filePath?: string;
}

// NEW: Interface for the result of finding an element, its parent, and container
interface FoundElementInfo {
  element: FormElement;
  parent: FieldsetElement | null;
  container: FormElement[];
  indexInContainer: number;
}

// NEW: Interface for the result of extracting an element
interface ExtractOperationResult {
  extractedElement: FormElement | null;
  remainingElements: FormElement[]; // The tree after extraction
}

export const useFormBuilderStore = defineStore("formBuilder", {
  state: () => ({
    forms: [] as ManagedForm[],
    activeFormId: null as string | null,
    elements: [] as FormElement[],
    selectedElementId: null as string | null,
    isDragging: false as boolean, // Global flag for active drag operation
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
        const element = elements.find((el) => el.dataId === id);
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
    setDragging(isDragging: boolean) {
      this.isDragging = isDragging;
    },
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
            `Form with name "${newManagedForm.name}" from ${fileData.fileName} already exists. Skipping.`
          );
        }
      });

      if (this.forms.length === 0) {
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
        // Tiefe Kopie erstellen, um sicherzustellen, dass die Referenzen unterschiedlich sind
        const elementsCopy = JSON.parse(JSON.stringify(this.elements));

        // Sicherstellen, dass alle Elemente korrekte Ordnungszahlen haben
        elementsCopy.forEach((element: FormElement, index: number) => {
          element.order = index;
        });

        // Aktives Formular aktualisieren mit der korrigierten Kopie
        this.activeForm.visualElements = elementsCopy;
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
        dataId: uuidv4(),
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
        this.selectElement(newElement.dataId);
        return newElement;
      }

      return null;
    },

    updateElement(elementId: string, updates: Partial<FormElement>) {
      // Rekursiv Element finden und aktualisieren
      const updateElementRecursive = (elements: FormElement[]): boolean => {
        // Element in aktueller Ebene suchen
        const index = elements.findIndex((el) => el.dataId === elementId);
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
      const element = this.elements.find((el) => el.dataId === elementId);
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
        const directIndex = elements.findIndex((el) => el.dataId === elementId);
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
      if (!elementId) {
        this.selectedElementId = null;
        return;
      }

      // Zunächst prüfen, ob Element existiert
      if (this.elements && this.elements.length > 0) {
        // Funktion für rekursive Suche nach Element-ID
        const findElementById = (
          elements: FormElement[],
          id: string
        ): FormElement | null => {
          for (const element of elements) {
            if (element.dataId === id) {
              return element;
            }

            // Bei Fieldset auch in children suchen
            if (element.type === "fieldset" && element.children) {
              const found = findElementById(element.children, id);
              if (found) return found;
            }
          }
          return null;
        };

        const foundElement = findElementById(this.elements, elementId);
        if (foundElement) {
          this.selectedElementId = elementId;
        } else {
          this.selectedElementId = null;
        }
      } else {
        this.selectedElementId = null;
      }
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
          if (el.dataId === fieldsetId && el.type === "fieldset") {
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
        this.selectElement(element.dataId);
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

        this.setFormElementsAndSelect(elementsCopy, element.dataId);
      }
    },

    // --- REFACTORED HELPER FUNCTIONS FOR moveElementToPosition ---

    // _findAndExtractElementRecursive:
    // - Operates on a DEEP COPY of the elements array.
    // - Returns an object: { extractedElement: FormElement | null, remainingElements: FormElement[] }
    // - 'remainingElements' is the DEEP COPY of the tree *after* extraction.
    // - Does NOT mutate the original store state.
    _findAndExtractElementRecursive(
      elementsToSearch: FormElement[], // This should be a deep copy
      elementIdToExtract: string
    ): ExtractOperationResult {
      const result: ExtractOperationResult = {
        extractedElement: null,
        remainingElements: [], // Will be populated with the modified copy
      };

      let foundAndExtracted = false;

      function findAndExtract(
        currentElements: FormElement[],
        path: FormElement[]
      ): FormElement[] {
        const newArray: FormElement[] = [];
        for (let i = 0; i < currentElements.length; i++) {
          const el = JSON.parse(JSON.stringify(currentElements[i])); // Deep copy current element

          if (el.dataId === elementIdToExtract && !foundAndExtracted) {
            result.extractedElement = el;
            foundAndExtracted = true;
            // Don't add 'el' to newArray, effectively extracting it
          } else {
            if (el.type === "fieldset" && el.children) {
              el.children = findAndExtract(el.children, [...path, el]);
            }
            newArray.push(el);
          }
        }
        return newArray;
      }

      result.remainingElements = findAndExtract(elementsToSearch, []);
      return result;
    },

    // _findTargetContainerRecursive:
    // - Operates on a DEEP COPY of the elements array (the one potentially modified by extraction).
    // - Returns an object: { targetContainer: FormElement[] | null, targetParent: FieldsetElement | null, success: boolean }
    // - 'targetContainer' is a DIRECT REFERENCE to the children array within the DEEP COPY where the element should be inserted.
    // - 'targetParent' is a DIRECT REFERENCE to the parent fieldset in the DEEP COPY.
    // - Does NOT mutate the original store state.
    _findTargetContainerRecursive(
      elementsToSearchIn: FormElement[], // This should be the (potentially modified) deep copy
      targetParentId: string | null
    ): {
      targetContainer: FormElement[] | null;
      targetParent: FieldsetElement | null;
      success: boolean;
    } {
      if (!targetParentId) {
        // Target is root
        return {
          targetContainer: elementsToSearchIn, // The root of the deep copy
          targetParent: null,
          success: true,
        };
      }

      for (const el of elementsToSearchIn) {
        if (el.dataId === targetParentId && el.type === "fieldset") {
          if (!el.children) el.children = []; // Ensure children array exists
          return {
            targetContainer: el.children,
            targetParent: el as FieldsetElement,
            success: true,
          };
        }
        if (el.type === "fieldset" && el.children) {
          const foundInChildren = this._findTargetContainerRecursive(
            el.children,
            targetParentId
          );
          if (foundInChildren.success) {
            return foundInChildren;
          }
        }
      }
      return { targetContainer: null, targetParent: null, success: false };
    },

    // _insertElementIntoContainer:
    // - DIRECTLY MUTATES the 'targetContainer' (which is part of the deep copy).
    // - Inserts 'elementToMove' at 'insertAtIndex'.
    _insertElementIntoContainer(
      targetContainer: FormElement[], // Direct reference to a children array in the deep copy
      elementToMove: FormElement,
      insertAtIndex: number
    ): void {
      // Clamp insertAtIndex to be within valid bounds
      const safeIndex = Math.max(
        0,
        Math.min(insertAtIndex, targetContainer.length)
      );
      targetContainer.splice(safeIndex, 0, elementToMove);
    },

    // _reorderAllElementsRecursive:
    // - Operates on a DEEP COPY of the elements array.
    // - MUTATES the 'order' property of elements within this deep copy.
    _reorderAllElementsRecursive(elements: FormElement[]): void {
      // Now mutates the copy directly
      elements.forEach((el, index) => {
        el.order = index;
        if (el.type === "fieldset" && el.children) {
          this._reorderAllElementsRecursive(el.children);
        }
      });
    },

    moveElementToPosition(
      elementId: string,
      toPosition: number, // This is the desired *visual* index in the target container
      toParentId: string | null = null
    ) {
      // Tiefe Kopie erstellen, um sicherzustellen, dass Modifikationen isoliert sind
      const workingCopy = JSON.parse(JSON.stringify(this.elements));

      // Schritt 1: Element aus ursprünglicher Position extrahieren
      const extractResult = this._findAndExtractElementRecursive(
        workingCopy,
        elementId
      );

      if (!extractResult.extractedElement) {
        return;
      }

      // Schritt 2: Ziel-Container finden
      const targetContainerResult = this._findTargetContainerRecursive(
        extractResult.remainingElements,
        toParentId
      );

      if (
        !targetContainerResult.success ||
        !targetContainerResult.targetContainer
      ) {
        return;
      }

      // Schritt 3: Element in Ziel-Container einfügen
      this._insertElementIntoContainer(
        targetContainerResult.targetContainer,
        extractResult.extractedElement,
        toPosition
      );

      // Schritt 4: Alle Ordnungszahlen rekursiv neu zuweisen
      this._reorderAllElementsRecursive(extractResult.remainingElements);

      // Schritt 5: Arbeitsversion zurück ins Store setzen
      this.setFormElementsAndSelect(
        extractResult.remainingElements,
        extractResult.extractedElement.dataId
      );
    },

    findElementWithParent(elementId: string): FoundElementInfo | null {
      const search = (
        elements: FormElement[],
        currentParent: FieldsetElement | null,
        containerArr: FormElement[]
      ): FoundElementInfo | null => {
        for (let i = 0; i < elements.length; i++) {
          const currentElement = elements[i];
          if (currentElement.dataId === elementId) {
            return {
              element: currentElement,
              parent: currentParent,
              indexInContainer: i,
              container: containerArr,
            };
          }
          if (currentElement.type === "fieldset" && currentElement.children) {
            const found = search(
              currentElement.children,
              currentElement as FieldsetElement,
              currentElement.children
            );
            if (found) return found;
          }
        }
        return null;
      };
      return search(this.elements, null, this.elements);
    },

    updateElementProperty(elementId: string, key: string, value: unknown) {
      const info = this.findElementWithParent(elementId);
      if (info && info.element) {
        (info.element as unknown as Record<string, unknown>)[key] = value;
        this.syncActiveFormVisualsFromCanvas();
      }
    },

    createElement(elementType: string): FormElement {
      const commonFields = {
        dataId: uuidv4(),
        required: false,
        order: 0,
        x: 0,
        y: 0,
        width: 200,
        height: 40,
        validation: [],
      };

      switch (elementType) {
        case "input":
          return {
            ...commonFields,
            type: "input",
            label: "Text Input",
            placeholder: "Enter text...",
            defaultValue: "",
          } as TextInputElement;
        case "textarea":
          return {
            ...commonFields,
            type: "textarea",
            label: "Text Area",
            placeholder: "Enter long text...",
            defaultValue: "",
            rows: 3,
          } as TextareaElement;
        case "button":
          return {
            ...commonFields,
            type: "button",
            label: "Button",
            buttonType: "submit",
          } as ButtonElement;
        case "fieldset":
          return {
            ...commonFields,
            width: 400,
            height: 100,
            type: "fieldset",
            label: "Fieldset",
            children: [],
          } as FieldsetElement;
        case "checkbox":
          return {
            ...commonFields,
            type: "checkbox",
            label: "Checkbox",
            checked: false,
          } as CheckboxElement;
        case "select":
          return {
            ...commonFields,
            type: "select",
            label: "Select Menu",
            options: [
              { value: "opt1", label: "Option 1" },
              { value: "opt2", label: "Option 2" },
            ],
            defaultValue: "opt1",
          } as SelectElement;
        default:
          console.warn(
            `createElement: Unknown element type "${elementType}". Defaulting to input.`
          );
          return {
            ...commonFields,
            type: "input",
            label: "Text Input (Default)",
            placeholder: "Enter text...",
            defaultValue: "",
          } as TextInputElement;
      }
    },
  },
});
