import { ref, reactive, computed, readonly, watch } from "vue";
import type { FormElement } from "@/models/FormElement";

export interface DragState {
  isDragging: boolean;
  draggedElementId: string | null;
  draggedElementType: string | null;
  dragSource: "internal" | "external" | null;
}

export interface DropTarget {
  position: "before" | "after";
  siblingId?: string;
  parentId?: string;
  elementId?: string;
  elementType?: string;
}

// SINGLETON STATE - nur eine Instanz für die ganze App
const dragState = reactive<DragState>({
  isDragging: false,
  draggedElementId: null,
  draggedElementType: null,
  dragSource: null,
});

// Drop callbacks - auch global
const dropCallbacks = ref<{
  onMove?: (elementId: string, target: DropTarget) => void;
  onCreate?: (elementType: string, target: DropTarget) => void;
}>({});

export const useDragAndDrop = () => {
  // Simple computed getters
  const isDragging = computed(() => dragState.isDragging);
  const isInternalDrag = computed(() => dragState.dragSource === "internal");
  const isExternalDrag = computed(() => dragState.dragSource === "external");

  // Start drag operations
  const startInternalDrag = (elementId: string, elementType: string) => {
    dragState.isDragging = true;
    dragState.draggedElementId = elementId;
    dragState.draggedElementType = elementType;
    dragState.dragSource = "internal";
  };

  const startExternalDrag = (elementType: string) => {
    // console.log("🎯 useDragAndDrop: startExternalDrag called for", elementType);
    dragState.isDragging = true;
    dragState.draggedElementId = null;
    dragState.draggedElementType = elementType;
    dragState.dragSource = "external";
    // console.log(
    //   "🎯 useDragAndDrop: isDragging state set to",
    //   dragState.isDragging
    // );
  };

  // End drag
  const endDrag = () => {
    dragState.isDragging = false;
    dragState.draggedElementId = null;
    dragState.draggedElementType = null;
    dragState.dragSource = null;
  };

  // Handle drop
  const handleDrop = (target: DropTarget) => {
    if (!dragState.isDragging) return;

    if (target.elementId && dragState.dragSource === "internal") {
      dropCallbacks.value.onMove?.(target.elementId, target);
    } else if (target.elementType && dragState.dragSource === "external") {
      dropCallbacks.value.onCreate?.(target.elementType, target);
    }

    endDrag();
  };

  // Register callbacks
  const registerCallbacks = (callbacks: typeof dropCallbacks.value) => {
    dropCallbacks.value = callbacks;
  };

  // watch(dragState, (newValue) => {
  //   console.log("%cuseDragAndDrop", "color: blue; font-weight: bold;");
  //   console.log("🎯 useDragAndDrop: dragState changed to", newValue);
  //   console.log("%cuseDragAndDrop", "color: blue; font-weight: bold;");
  // });

  return {
    // State
    dragState: readonly(dragState),
    isDragging,
    isInternalDrag,
    isExternalDrag,

    // Actions
    startInternalDrag,
    startExternalDrag,
    endDrag,
    handleDrop,
    registerCallbacks,
  };
};
