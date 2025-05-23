<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useFormBuilderStore } from "@/stores/formBuilder";
import FormElementRenderer from "./FormElementRenderer.vue";
import InsertionPoint from "./InsertionPoint.vue";
import DropZone from "./DropZone.vue";
import SpacerWrapper from "./SpacerWrapper.vue";
import { v4 as uuidv4 } from "uuid";
import type { FormElement } from "@/models/FormElement";

const formBuilderStore = useFormBuilderStore();

// Sorted elements for rendering
const elements = computed(() => {
  const elemsCopy = [...formBuilderStore.elements];
  elemsCopy.sort((a, b) => a.order - b.order);
  return elemsCopy;
});

const canvasRef = ref<HTMLElement | null>(null);

// Drag and drop state
const dragging = ref(false);
const draggedElementId = ref<string | null>(null);
const dropTargetIndex = ref(-1);
const externalDragType = ref<string | null>(null);

// NEW: Additional tracking refs for debugging
const dragStartTime = ref<number>(0);
const lastDragOverTime = ref<number>(0);
const dragEventCounter = ref<number>(0);

function handleElementClick(id: string) {
  formBuilderStore.selectElement(id);
}

function handleElementDragStart(id: string) {
  // console.log(`📦 DRAG START: ${id.slice(-8)}`);
  draggedElementId.value = id;
  dragging.value = true;
  externalDragType.value = null;
}

function handleElementDragEnd(id: string) {
  // console.log(`📦 DRAG END: ${id.slice(-8)}`);
  setTimeout(() => {
    resetDragState();
  }, 50); // Small delay to allow drop events to complete
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();

  dragEventCounter.value++;
  lastDragOverTime.value = Date.now();

  const index = getDropIndex(e.clientY);
  const previousIndex = dropTargetIndex.value;
  dropTargetIndex.value = index;

  // Only log if index changed or every 10th event to avoid spam
  // if (index !== previousIndex || dragEventCounter.value % 10 === 0) {
  //   console.log(
  //     `FormCanvas: DragOver #${
  //       dragEventCounter.value
  //     } - Index: ${previousIndex} -> ${index}, Y: ${e.clientY}, draggedId: ${
  //       draggedElementId.value?.slice(-8) || "none"
  //     }`
  //   );
  // }

  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = draggedElementId.value ? "move" : "copy";
  }
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  // console.log(
  //   `FormCanvas: DragEnter - dragging: ${dragging.value}, draggedElementId: ${
  //     draggedElementId.value?.slice(-8) || "none"
  //   }`
  // );

  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = draggedElementId.value ? "move" : "copy";

    // Only set dragging state for external drags if not already set
    if (!dragging.value && !draggedElementId.value) {
      dragging.value = true;
      // console.log(
      //   `FormCanvas: External drag detected (will identify in drop event)`
      // );
    }
  }
}

function handleDragEnd(event: DragEvent) {
  const dragDuration = Date.now() - dragStartTime.value;
  // console.log(
  //   `FormCanvas: *** LOCAL DRAG END *** - Duration: ${dragDuration}ms, Events: ${dragEventCounter.value}, defaultPrevented: ${event.defaultPrevented}`
  // );
  // console.log(`FormCanvas: DragEnd event target:`, event.target);
  // console.log(`FormCanvas: DragEnd event currentTarget:`, event.currentTarget);

  // Only reset if drag lasted more than 100ms to avoid immediate cancellation
  if (dragDuration > 100) {
    // console.log(`FormCanvas: Normal drag end - resetting state`);
    setTimeout(() => {
      resetDragState();
    }, 50);
  } else {
    // console.log(`FormCanvas: Ignoring premature drag end (${dragDuration}ms)`);
  }
}

// Add a new function to handle dropping outside the drop zone
function handleGlobalDragEnd(event: DragEvent) {
  const dragDuration = Date.now() - dragStartTime.value;
  // console.log(
  //   `FormCanvas: Global drag end detected - Duration: ${dragDuration}ms, defaultPrevented: ${event.defaultPrevented}`
  // );

  // Only reset if drag lasted a reasonable time and wasn't successful
  if (dragDuration > 100 && !event.defaultPrevented) {
    // console.log(
    //   `FormCanvas: Long drag ended globally without drop - resetting state`
    // );
    setTimeout(() => {
      resetDragState();
    }, 50);
  } else if (dragDuration <= 100) {
    // console.log(
    //   `FormCanvas: Ignoring premature global drag end (${dragDuration}ms)`
    // );
  }
}

function handleDrop(e: DragEvent) {
  // console.log(
  //   `FormCanvas: *** DROP EVENT TRIGGERED *** - IGNORING - DropZones handle all drops now`
  // );

  // All drops should be handled by DropZones now
  // This handler is disabled to prevent conflicts
  return;

  // const dragDuration = Date.now() - dragStartTime.value;
}

function resetDragState() {
  dragging.value = false;
  draggedElementId.value = null;
  dropTargetIndex.value = -1;
  externalDragType.value = null;
}

function getDropIndex(mouseY: number): number {
  if (!canvasRef.value) {
    // console.log(`FormCanvas: getDropIndex - No canvas ref, returning -1`);
    return -1;
  }

  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  const relativeY = mouseY - rect.top + canvas.scrollTop;

  const contentContainer = canvas.querySelector(".form-canvas__content");
  if (!contentContainer) {
    // console.log(`FormCanvas: getDropIndex - No content container, returning 0`);
    return 0;
  }

  // Only find direct children elements (not nested in fieldsets)
  const directChildren = Array.from(contentContainer.children).filter(
    (child) => {
      const element = child as HTMLElement;
      return element.classList.contains("form-canvas-element");
    }
  );

  // console.log(
  //   `FormCanvas: getDropIndex - mouseY: ${mouseY}, relativeY: ${relativeY}, directChildren: ${directChildren.length}`
  // );

  if (directChildren.length === 0) {
    // console.log(`FormCanvas: getDropIndex - No direct children, returning 0`);
    return 0;
  }

  // Iterate through all direct children and check mouse position
  for (let i = 0; i < directChildren.length; i++) {
    const card = directChildren[i] as HTMLElement;
    const cardRect = card.getBoundingClientRect();
    const cardTop = cardRect.top - rect.top + canvas.scrollTop;
    const cardMiddle = cardTop + cardRect.height / 2;

    // console.log(
    //   `FormCanvas: getDropIndex - Card ${i}: top=${cardTop}, middle=${cardMiddle}, relativeY=${relativeY}`
    // );

    if (relativeY < cardMiddle) {
      // console.log(`FormCanvas: getDropIndex - Returning index ${i}`);
      return i;
    }
  }

  // If mouse is below all cards, return index after the last card
  // console.log(
  //   `FormCanvas: getDropIndex - Returning end index ${directChildren.length}`
  // );
  return directChildren.length;
}

function getDropIndicatorPosition(): number {
  if (!canvasRef.value || dropTargetIndex.value < 0) return 0;

  const canvas = canvasRef.value;

  const contentContainer = canvas.querySelector(".form-canvas__content");
  if (!contentContainer) return 20;

  const directChildren = Array.from(contentContainer.children).filter(
    (child) => {
      const element = child as HTMLElement;
      return element.classList.contains("form-canvas-element");
    }
  );

  if (directChildren.length === 0) return 20;

  if (dropTargetIndex.value >= directChildren.length) {
    // After the last element
    const lastCard = directChildren[directChildren.length - 1] as HTMLElement;
    const lastRect = lastCard.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    return lastRect.bottom - canvasRect.top + canvas.scrollTop + 8;
  }

  // Before the indexed element
  const card = directChildren[dropTargetIndex.value] as HTMLElement;
  const cardRect = card.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  return cardRect.top - canvasRect.top + canvas.scrollTop - 8;
}

function moveElement(id: string, toIndex: number) {
  // console.log(
  //   `FormCanvas: *** CALLING MOVE ELEMENT *** ${id.slice(
  //     -8
  //   )} to index ${toIndex}`
  // );
  // console.log(
  //   `FormCanvas: Store elements before move:`,
  //   formBuilderStore.elements.map((el) => ({
  //     id: el.id.slice(-8),
  //     type: el.type,
  //     order: el.order,
  //   }))
  // );

  formBuilderStore.moveElementToPosition(id, toIndex, null);

  // console.log(
  //   `FormCanvas: Store elements after move:`,
  //   formBuilderStore.elements.map((el) => ({
  //     id: el.id.slice(-8),
  //     type: el.type,
  //     order: el.order,
  //   }))
  // );
}

function handleInsertPointClick({ index }: { index: number }) {
  const event = new CustomEvent("openCommandPalette", {
    detail: {
      insertPosition: index,
      mode: "insert",
    },
  });
  window.dispatchEvent(event);
}

function createAndAddElement(type: string, position: number) {
  // console.log(
  //   `FormCanvas: *** CREATING AND ADDING ELEMENT *** type: ${type}, position: ${position}`
  // );
  // console.log(
  //   `FormCanvas: Store elements before creation:`,
  //   formBuilderStore.elements.map((el) => ({
  //     id: el.id.slice(-8),
  //     type: el.type,
  //     order: el.order,
  //   }))
  // );

  const element = createElementByType(type, position);

  if (element) {
    // console.log(`FormCanvas: Created element:`, {
    //   id: element.id.slice(-8),
    //   type: element.type,
    //   order: element.order,
    // });
    formBuilderStore.addElementAtPosition(element, position, null);
    // console.log(
    //   `FormCanvas: Store elements after creation:`,
    //   formBuilderStore.elements.map((el) => ({
    //     id: el.id.slice(-8),
    //     type: el.type,
    //     order: el.order,
    //   }))
    // );
    return element;
  } else {
    // console.error(`FormCanvas: Failed to create element of type ${type}`);
  }

  return null;
}

function createElementByType(
  type: string,
  position: number
): FormElement | null {
  const baseProps = {
    id: uuidv4(),
    label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    required: false,
    order: position,
    x: 0,
    y: 0,
    width: 250,
    height: 48,
  };

  switch (type) {
    case "input":
      return {
        ...baseProps,
        type: "input",
        placeholder: "Enter text",
      } as FormElement;
    case "textarea":
      return {
        ...baseProps,
        type: "textarea",
        placeholder: "Enter text",
        rows: 4,
        width: 300,
        height: 120,
      } as FormElement;
    case "checkbox":
      return {
        ...baseProps,
        type: "checkbox",
        checked: false,
        width: 200,
        height: 40,
      } as FormElement;
    case "select":
      return {
        ...baseProps,
        type: "select",
        options: [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
        ],
        width: 250,
        height: 48,
      } as FormElement;
    case "radio":
      return {
        ...baseProps,
        type: "radio",
        options: [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
        ],
        defaultValue: "option1",
        width: 250,
        height: 80,
      } as FormElement;
    case "button":
      return {
        ...baseProps,
        type: "button",
        buttonType: "button",
        width: 150,
        height: 48,
      } as FormElement;
    case "number":
      return {
        ...baseProps,
        type: "number",
        min: 0,
        max: 100,
        width: 150,
        height: 48,
      } as FormElement;
    case "date":
      return {
        ...baseProps,
        type: "date",
        width: 200,
        height: 48,
      } as FormElement;
    case "fieldset":
      return {
        ...baseProps,
        type: "fieldset",
        children: [],
        width: 400,
        height: 200,
      } as FormElement;
    default:
      // console.warn(`Unknown element type: ${type}`);
      return null;
  }
}

function handleDragLeave(e: DragEvent) {
  // console.log(
  //   `FormCanvas: Drag leave detected (not resetting to avoid false positives)`
  // );
  // Do not reset dragging.value here as it might be a false positive
  // e.g. when dragging over a child element within the canvas.
  // The global dragend listener is more reliable for this.
}

// NEW: Add dedicated drop zone click handler for debugging
function handleDropZoneMouseDown(e: MouseEvent) {
  // console.log(`FormCanvas: DropZone MouseDown - target:`, e.target);
}

function handleDropZoneMouseUp(e: MouseEvent) {
  // console.log(`FormCanvas: DropZone MouseUp - target:`, e.target);
}

function handleDropZoneDrop(data: {
  position: "before" | "after";
  siblingId?: string;
  parentId?: string;
  elementId?: string;
  elementType?: string;
}) {
  // console.log(
  //   `🎯 DROP: ${data.elementId?.slice(-8) || data.elementType} ${
  //     data.position
  //   } ${data.siblingId?.slice(-8) || "end"} on parent ${
  //     data.parentId?.slice(-8) || 'root'
  //   }`
  // );

  // Detailed log of incoming data
  // console.log(`DEBUG: handleDropZoneDrop received data:`, JSON.parse(JSON.stringify(data)));

  // Handle moving existing elements
  if (data.elementId) {
    let targetIndex: number;
    let operationValid = true;

    if (data.parentId) {
      // Moving within or to a fieldset
      const targetParentSearchResult = formBuilderStore.findElementWithParent(
        data.parentId
      );

      if (
        !targetParentSearchResult ||
        targetParentSearchResult.element.type !== "fieldset"
      ) {
        // console.error(
        //   `DEBUG: Target parent fieldset ${data.parentId.slice(
        //     -8
        //   )} not found or not a fieldset.`
        // );
        operationValid = false;
        targetIndex = 0; // Fallback, should not be used
      } else {
        const targetParentElement = targetParentSearchResult.element;
        const targetParentChildren = targetParentElement.children || [];

        const originalIndexInTargetChildren = targetParentChildren.findIndex(
          (el) => el.id === data.elementId
        );

        const effectiveTargetChildren = targetParentChildren.filter(
          (el) => el.id !== data.elementId
        );

        if (data.siblingId) {
          const siblingIndexInEffectiveList = effectiveTargetChildren.findIndex(
            (el) => el.id === data.siblingId
          );
          if (siblingIndexInEffectiveList === -1) {
            // console.error(
            //   `DEBUG: Sibling ${data.siblingId.slice(
            //     -8
            //   )} not found in effective children list of parent ${data.parentId.slice(
            //     -8
            //   )}. Effective list:`,
            //   JSON.parse(JSON.stringify(effectiveTargetChildren.map(c => ({id: c.id, type: c.type}))))
            // );
            operationValid = false;
            targetIndex = effectiveTargetChildren.length; // Default to end
          } else {
            targetIndex =
              data.position === "before"
                ? siblingIndexInEffectiveList
                : siblingIndexInEffectiveList + 1;
            // console.log(
            //   `DEBUG: Fieldset Move - Sibling ${data.siblingId.slice(
            //     -8
            //   )} found at effective index ${siblingIndexInEffectiveList}. Target Index: ${targetIndex} (${data.position})`
            // );
          }
        } else {
          // Dropping at the end of the fieldset
          targetIndex = effectiveTargetChildren.length;
          // console.log(
          //   `DEBUG: Fieldset Move - No sibling, Target Index in effective list: ${targetIndex} (end of list)`
          // );
        }

        // if (operationValid) {
        //   console.log(
        //     `PRE-STORE-MOVE (Fieldset): Moving element ${data.elementId.slice(
        //       -8
        //     )} to fieldset ${data.parentId.slice(
        //       -8
        //     )} at targetIndex ${targetIndex}.`
        //   );
        //   console.log(
        //     `PRE-STORE-MOVE (Fieldset): Target fieldset children before store call:`,
        //     JSON.parse(JSON.stringify(targetParentChildren.map(c => ({id: c.id, type: c.type}))))
        //   );
        // }
      }
    } else {
      // Moving to root level
      const effectiveRootElements = elements.value.filter(
        (el) => el.id !== data.elementId
      );

      if (data.siblingId) {
        const siblingIndexInEffectivList = effectiveRootElements.findIndex(
          (el) => el.id === data.siblingId
        );
        if (siblingIndexInEffectivList === -1) {
          // console.error(
          //   `DEBUG: Sibling ${data.siblingId.slice(
          //     -8
          //   )} not found in effective root list. Effective list:`,
          //   JSON.parse(JSON.stringify(effectiveRootElements.map(c => ({id: c.id, type: c.type}))))
          // );
          operationValid = false;
          targetIndex = effectiveRootElements.length; // Default to end
        } else {
          targetIndex =
            data.position === "before"
              ? siblingIndexInEffectivList
              : siblingIndexInEffectivList + 1;
          // console.log(
          //   `DEBUG: Root Move - Sibling ${data.siblingId.slice(
          //     -8
          //   )} found at effective index ${siblingIndexInEffectivList}. Target Index: ${targetIndex} (${data.position})`
          // );
        }
      } else {
        // Dropping at the end of the root
        targetIndex = effectiveRootElements.length;
        // console.log(
        //   `DEBUG: Root Move - No sibling, Target Index in effective list: ${targetIndex} (end of list)`
        // );
      }
      // if (operationValid) {
      //   console.log(
      //     `PRE-STORE-MOVE (Root): Moving element ${data.elementId.slice(
      //       -8
      //     )} to root at targetIndex ${targetIndex}.`
      //   );
      //   console.log(
      //     `PRE-STORE-MOVE (Root): Root elements before store call:`,
      //     JSON.parse(JSON.stringify(elements.value.map(c => ({id: c.id, type: c.type}))))
      //   );
      // }
    }

    if (operationValid) {
      formBuilderStore.moveElementToPosition(
        data.elementId,
        targetIndex,
        data.parentId || null
      );
    } else {
      // console.error(
      //   `Operation for moving element ${data.elementId.slice(
      //     -8
      //   )} deemed invalid. Aborting store call.`
      // );
      // Potentially reset or sync UI if needed, but usually the store is the source of truth
    }
  } else if (data.elementType) {
    // Handle creating new elements
    let targetIndex: number;
    const newElement = formBuilderStore.createElement(
      data.elementType as string
    ); // Assuming ElementType is string here for simplicity

    if (!newElement) {
      // console.error(`Failed to create element of type ${data.elementType}. Aborting add operation.`);
      return;
    }

    if (data.parentId) {
      const parentSearchResult = formBuilderStore.findElementWithParent(
        data.parentId
      );
      if (
        parentSearchResult &&
        parentSearchResult.element.type === "fieldset"
      ) {
        const parentElement = parentSearchResult.element;
        const children = parentElement.children || [];
        if (data.siblingId) {
          const siblingIndex = children.findIndex(
            (el) => el.id === data.siblingId
          );
          targetIndex =
            data.position === "before" ? siblingIndex : siblingIndex + 1;
        } else {
          targetIndex = children.length;
        }
        // console.log(
        //   `PRE-STORE-ADD (Fieldset): Adding new ${newElement.type} (${newElement.id.slice(
        //     -8
        //   )}) to fieldset ${parentElement.id.slice(
        //     -8
        //   )} at targetIndex ${targetIndex}. Sibling: ${data.siblingId?.slice(-8) || 'none'}, Position: ${data.position}`
        // );
        formBuilderStore.addElementToFieldset(
          data.parentId,
          newElement,
          targetIndex
        );
      } else {
        // console.error(`Target parent fieldset ${data.parentId} not found for new element. Adding to root.`);
        // Fallback to root if parent fieldset not found (should ideally not happen if data is correct)
        if (data.siblingId) {
          const siblingIndex = elements.value.findIndex(
            (el) => el.id === data.siblingId
          );
          targetIndex =
            data.position === "before" ? siblingIndex : siblingIndex + 1;
        } else {
          targetIndex = elements.value.length;
        }
        // console.log(
        //   `PRE-STORE-ADD (Root - Fallback): Adding new ${newElement.type} (${newElement.id.slice(
        //     -8
        //   )}) to root at targetIndex ${targetIndex}. Sibling: ${data.siblingId?.slice(-8) || 'none'}, Position: ${data.position}`
        // );
        formBuilderStore.addElementAtPosition(newElement, targetIndex, null);
      }
    } else {
      // Adding new element to root
      if (data.siblingId) {
        const siblingIndex = elements.value.findIndex(
          (el) => el.id === data.siblingId
        );
        targetIndex =
          data.position === "before" ? siblingIndex : siblingIndex + 1;
      } else {
        targetIndex = elements.value.length;
      }
      // console.log(
      //   `PRE-STORE-ADD (Root): Adding new ${newElement.type} (${newElement.id.slice(
      //     -8
      //   )}) to root at targetIndex ${targetIndex}. Sibling: ${data.siblingId?.slice(-8) || 'none'}, Position: ${data.position}`
      // );
      formBuilderStore.addElementAtPosition(newElement, targetIndex, null);
    }
  }

  resetDragState();
}

// Sidebar drag handling
function handleSidebarDragStart(event: DragEvent, elementType: string) {
  // console.log(`SIDEBAR DRAG START: Type: ${elementType}`);
  if (event.dataTransfer) {
    event.dataTransfer.setData("text/plain", elementType);
    event.dataTransfer.effectAllowed = "copy";
    externalDragType.value = elementType; // Track the type of element being dragged from sidebar
    dragging.value = true; // Set dragging state for visual feedback (DropZones)
    draggedElementId.value = null; // No specific element ID yet
  }
}

function handleSidebarDragEnd(event: DragEvent) {
  // console.log(`SIDEBAR DRAG END: Type: ${externalDragType.value}`);
  // Important to reset externalDragType and dragging state if the drag didn't result in a drop
  // However, DropZone.vue's drop handler OR the global dragend listener should more reliably reset dragging state.
  // This is more of a fallback.
  if (!event.defaultPrevented) {
    // if drop was not successful
    // console.log("Sidebar drag ended without a successful drop. Resetting external drag type.");
    // externalDragType.value = null;
    // dragging.value = false; // reset if not dropped on a valid target
  }
}

onMounted(() => {
  formBuilderStore.loadInitialForms();
  const formIdToLoad = formBuilderStore.formList[0]?.id || null;
  if (formIdToLoad) {
    formBuilderStore.setActiveForm(formIdToLoad);
  }

  // Initialize drag event counter
  dragEventCounter.value = 0;
  dragStartTime.value = 0;
  lastDragOverTime.value = 0;

  // Global drag end listener to catch drops outside of any specific drop zone
  // or when dragging stops abruptly.
  window.addEventListener("dragend", handleGlobalDragEnd);
  // console.log("FormCanvas: Mounted without global drag end listener");
});

onUnmounted(() => {
  window.removeEventListener("dragend", handleGlobalDragEnd);
  // console.log("FormCanvas: Unmounted and removed global drag end listener");
});
</script>

<template>
  <div class="canvas-container">
    <div
      class="form-canvas"
      :class="{ 'dragging-active': dragging }"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      ref="canvasRef"
    >
      <!-- Debug Info -->
      <div v-if="dragging" class="debug-info">
        <div><strong>DRAG DEBUG INFO</strong></div>
        <div v-if="draggedElementId">
          Moving Internal: {{ draggedElementId.slice(-8) }} →
          {{ dropTargetIndex }}
        </div>
        <div v-else-if="externalDragType">
          New External: {{ externalDragType }} → {{ dropTargetIndex }}
        </div>
        <div v-else>Dragging: waiting... ({{ dropTargetIndex }})</div>
        <div class="debug-stats">
          Duration: {{ Date.now() - dragStartTime }}ms | Events:
          {{ dragEventCounter }} | Elements: {{ elements.length }}
        </div>
        <div class="debug-elements">
          Elements:
          {{
            elements.map((el) => el.id.slice(-8) + ":" + el.order).join(", ")
          }}
        </div>
        <div class="debug-tip">💡 Try dragging elements into fieldsets!</div>
      </div>

      <!-- Empty state -->
      <div v-if="elements.length === 0" class="form-canvas__empty">
        Drag elements from the sidebar here to create your form
      </div>

      <div
        class="form-canvas__content"
        @dragover="handleDragOver"
        @drop="handleDrop"
      >
        <template v-if="elements.length > 0">
          <!-- First spacer -->
          <SpacerWrapper
            :index="0"
            :is-dragging="dragging"
            :sibling-id="elements[0]?.id"
            @insert="handleInsertPointClick"
            @drop="handleDropZoneDrop"
          />

          <!-- Elements with spacers between them -->
          <template v-for="(element, index) in elements" :key="element.id">
            <FormElementRenderer
              :element="element"
              :is-dragging="dragging"
              class="form-canvas-element"
              @drag-start="handleElementDragStart"
              @click="() => handleElementClick(element.id)"
              @drag-end="handleElementDragEnd"
              @fieldset-drop="handleDropZoneDrop"
              @insert="handleInsertPointClick"
            />

            <!-- Spacer after each element (except the last) -->
            <SpacerWrapper
              v-if="index < elements.length - 1"
              :index="index + 1"
              :is-dragging="dragging"
              :sibling-id="elements[index + 1]?.id"
              @insert="handleInsertPointClick"
              @drop="handleDropZoneDrop"
            />
          </template>

          <!-- Final spacer at the end -->
          <SpacerWrapper
            :index="elements.length"
            :is-dragging="dragging"
            @insert="handleInsertPointClick"
            @drop="handleDropZoneDrop"
          />
        </template>

        <!-- Empty state -->
        <template v-else>
          <SpacerWrapper
            :index="0"
            :is-dragging="dragging"
            @insert="handleInsertPointClick"
            @drop="handleDropZoneDrop"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.canvas-container {
  padding: 0.8rem;
  flex: 1;
  overflow: auto;
}

.form-canvas {
  max-width: 850px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  min-height: calc(100vh - 160px);
  border: 2px dashed #3a3f4a;
  border-radius: 8px;
  padding: 1.5rem;

  /* Ensure drop zone can receive events */
  pointer-events: auto;

  &__content {
    display: flex;
    flex-direction: column;
    gap: 0; /* No gap - SpacerWrapper handles spacing */
    padding: 1rem;
    min-height: 200px;
    position: relative;
  }

  &.dragging-active {
    background-color: rgba(26, 188, 156, 0.05);
    border: 2px dashed rgba(26, 188, 156, 0.7);
    /* Ensure drop zone is highlighted and ready */
    pointer-events: auto;
  }
}

.debug-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #ff0;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 9999;
  pointer-events: none;
}

.form-canvas__empty {
  text-align: center;
  padding: 3rem;
  color: var(--theme-text-muted, #aaa);
  font-style: italic;
  font-size: 0.9em;
}
</style>
