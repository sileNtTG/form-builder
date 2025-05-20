import { ref } from "vue";
import { useFormBuilderStore } from "../stores/formBuilder";
// FormElement import might not be needed if createElementByType is removed
// import type { FormElement } from "../models/FormElement";
// uuidv4 might not be needed if createElementByType is removed
// import { v4 as uuidv4 } from "uuid";

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

    const targetElement = event.target as HTMLElement;
    // Ensure target is part of the canvas/dropzone you intend.
    // May need to adjust if event.target is a child of the intended drop surface.
    const rect = targetElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Call the store's method to create and add the element
    formBuilderStore.createAndAddElement(elementType, x, y);
    // The store's method already handles adding to elements array and selecting.
  };

  // Removed local createElementByType function

  return {
    isDragging,
    onDragOver,
    onDragLeave,
    onDrop,
  };
}
