import { ref } from "vue";
import { useFormBuilderStore } from "../stores/formBuilder";
import type { FormElement } from "../models/FormElement";
import { v4 as uuidv4 } from "uuid";

export function useDragDrop() {
  const isDragging = ref(false);
  const formBuilderStore = useFormBuilderStore();

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    isDragging.value = true;

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  };

  const onDragLeave = () => {
    isDragging.value = false;
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    isDragging.value = false;

    if (!event.dataTransfer) return;

    const elementType = event.dataTransfer.getData("elementType");
    if (!elementType) return;

    // Get mouse position relative to the target element
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Create a new element based on the type
    const newElement = createElementByType(elementType, x, y);
    if (newElement) {
      formBuilderStore.addElement(newElement);
      formBuilderStore.selectElement(newElement.id);
    }
  };

  // Helper function to create new element object
  const createElementByType = (
    type: string,
    x: number,
    y: number
  ): FormElement | null => {
    const baseElement = {
      id: uuidv4(),
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      required: false,
      order: formBuilderStore.elements.length + 1,
      x,
      y,
      width: 300,
      height: 70,
    };

    switch (type) {
      case "input":
        return {
          ...baseElement,
          type: "input",
          placeholder: "Enter text",
        };
      case "textarea":
        return {
          ...baseElement,
          type: "textarea",
          placeholder: "Enter text",
          rows: 4,
        };
      case "checkbox":
        return {
          ...baseElement,
          type: "checkbox",
          checked: false,
        };
      case "select":
        return {
          ...baseElement,
          type: "select",
          options: [
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Option 2" },
          ],
          multiple: false,
        };
      case "number":
        return {
          ...baseElement,
          type: "number",
          min: 0,
          max: 100,
        };
      case "date":
        return {
          ...baseElement,
          type: "date",
        };
      case "file":
        return {
          ...baseElement,
          type: "file",
          accept: "*/*",
          multiple: false,
        };
      default:
        return null;
    }
  };

  return {
    isDragging,
    onDragOver,
    onDragLeave,
    onDrop,
  };
}
