<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { FormElement } from "@/models/FormElement";
import { useDragAndDrop } from "@/composables";
import { useFormBuilderStore } from "@/stores/formBuilder";
import { SvgIcon } from "@/components/common";
import SpacerWrapper from "./SpacerWrapper.vue";

interface Props {
  element: FormElement;
  isDragging?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [];
  "fieldset-drop": [
    data: {
      position: "before" | "after";
      siblingId?: string;
      parentId?: string;
      elementId?: string;
      elementType?: string;
    }
  ];
  insert: [data: { index: number; fieldsetId?: string }];
}>();

const { startInternalDrag, endDrag } = useDragAndDrop();
const formBuilderStore = useFormBuilderStore();

// Use computed property for selection state
const isSelected = computed(() => {
  return formBuilderStore.selectedElementId === props.element.dataId;
});

const elementTitle = computed(() => {
  const type =
    props.element.type.charAt(0).toUpperCase() + props.element.type.slice(1);
  const label = props.element.label ? `: ${props.element.label}` : "";
  return `${type}${label}`;
});

// Dynamic component mapping für Node components
const getNodeComponent = (elementType: string) => {
  const componentMap: Record<string, () => Promise<any>> = {
    text: () => import("@/components/common/nodes/TextInputNode.vue"),
    password: () => import("@/components/common/nodes/PasswordInputNode.vue"),
    email: () => import("@/components/common/nodes/EmailInputNode.vue"),
    textarea: () => import("@/components/common/nodes/TextareaNode.vue"),
    checkbox: () => import("@/components/common/nodes/CheckboxNode.vue"),
    select: () => import("@/components/common/nodes/SingleSelectNode.vue"),
    fieldset: () => import("@/components/common/nodes/FieldsetNode.vue"),
  };

  return componentMap[elementType]
    ? defineAsyncComponent(componentMap[elementType])
    : null;
};

function handleDragStart(event: DragEvent) {
  const elementId = props.element.dataId;
  const elementType = props.element.type;

  event.stopPropagation();

  const target = event.target as HTMLElement;
  target.classList.add("dragging");

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "all";
    event.dataTransfer.setData("application/x-element-id", elementId);
    event.dataTransfer.setData("text/plain", elementType);
  }

  startInternalDrag(elementId, elementType);
}

function handleDragEnd(event: DragEvent) {
  event.stopPropagation();

  const target = event.target as HTMLElement;
  const elementId = target.getAttribute("data-element-id");

  target.classList.remove("dragging");

  if (elementId === props.element.dataId) {
    endDrag();
  }
}

function handleClick() {
  formBuilderStore.selectElement(props.element.dataId);
}

function handleEdit(e: Event) {
  e.stopPropagation();
  formBuilderStore.selectElement(props.element.dataId);
}

function handleDelete(e: Event) {
  e.stopPropagation();
  formBuilderStore.removeElement(props.element.dataId);
}

function handleInsertPointClick(data: { index: number; fieldsetId?: string }) {
  emit("insert", data);
}

function handleFieldsetDropZoneDrop(data: {
  position: "before" | "after";
  siblingId?: string;
  parentId?: string;
  elementId?: string;
  elementType?: string;
}) {
  const eventData = {
    ...data,
    parentId: props.element.dataId,
  };

  emit("fieldset-drop", eventData);
}
</script>

<template>
  <!-- Regular form elements (non-fieldset) -->
  <div
    v-if="element.type !== 'fieldset'"
    class="element-card"
    :class="{ selected: isSelected }"
    draggable="true"
    :data-element-id="element.dataId"
    :data-element-type="element.type"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click.stop="handleClick"
  >
    <!-- Card Header mit Drag Handle und Actions -->
    <div class="element-card__header">
      <div class="element-card__drag-handle">
        <SvgIcon name="grip-vertical" :size="16" />
      </div>
      <span class="element-card__title">{{ elementTitle }}</span>
      <div class="element-card__actions">
        <button class="icon-btn" @click.stop="handleEdit" title="Edit">
          <SvgIcon name="edit" :size="14" />
        </button>
        <button class="icon-btn" @click.stop="handleDelete" title="Delete">
          <SvgIcon name="trash" :size="14" />
        </button>
      </div>
    </div>

    <!-- Card Body mit sauberem Node-Component -->
    <div class="element-card__body">
      <component
        :is="getNodeComponent(element.type)"
        :element="element as any"
        mode="preview"
      />
    </div>
  </div>

  <!-- Fieldset elements - separate structure -->
  <div
    v-else
    class="fieldset-container"
    :class="{ selected: isSelected }"
    :data-element-id="element.dataId"
    :data-element-type="element.type"
    @click="handleClick"
  >
    <!-- Fieldset Header -->
    <div
      class="fieldset-header"
      draggable="true"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
    >
      <div class="fieldset-drag-handle">
        <SvgIcon name="grip-vertical" :size="16" />
      </div>
      <h3 class="fieldset-title">{{ element.label || "Untitled Fieldset" }}</h3>
      <div class="fieldset-actions">
        <button class="icon-btn" @click.stop="handleEdit" title="Edit Fieldset">
          <SvgIcon name="edit" :size="14" />
        </button>
        <button
          class="icon-btn"
          @click.stop="handleDelete"
          title="Delete Fieldset"
        >
          <SvgIcon name="trash" :size="14" />
        </button>
      </div>
    </div>

    <!-- Fieldset Content mit SpacerWrapper -->
    <div class="fieldset-content">
      <template v-if="element.children && element.children.length > 0">
        <SpacerWrapper
          :index="0"
          :fieldset-id="element.dataId"
          :is-dragging="isDragging"
          position="before"
          :sibling-id="element.children[0]?.dataId"
          @insert="handleInsertPointClick"
          @drop="handleFieldsetDropZoneDrop"
        />

        <template
          v-for="(child, childIndex) in element.children"
          :key="child.dataId"
        >
          <FormElementRenderer
            :element="child"
            :is-dragging="isDragging"
            @fieldset-drop="handleFieldsetDropZoneDrop"
            @insert="handleInsertPointClick"
          />

          <SpacerWrapper
            :index="childIndex + 1"
            :fieldset-id="element.dataId"
            :is-dragging="isDragging"
            position="after"
            :sibling-id="child.dataId"
            @insert="handleInsertPointClick"
            @drop="handleFieldsetDropZoneDrop"
          />
        </template>
      </template>

      <template v-else>
        <SpacerWrapper
          :index="0"
          :fieldset-id="element.dataId"
          :is-dragging="isDragging"
          position="before"
          @insert="handleInsertPointClick"
          @drop="handleFieldsetDropZoneDrop"
        />
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/abstracts" as *;

.element-card {
  background: var(--theme-bg-surface);
  border-radius: $border-radius;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border);
  @include transition(all, $transition-normal);
  width: 100%;
  overflow: hidden;
  cursor: pointer;

  &.selected {
    border: 1px solid var(--theme-primary);
    box-shadow: 0 0 0 1px rgba(26, 188, 156, 0.4);
  }

  &.dragging {
    opacity: 0.5;
    border: 1px dashed var(--theme-primary);
    position: relative;
    z-index: 1;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(to right, #2c313c, #343b48);
    padding: $spacing-sm $spacing-md;
    font-weight: 500;
    color: var(--theme-text);
  }

  &__drag-handle {
    cursor: grab;
    color: #a0aec0;
    @include transition(color, $transition-fast);

    &:hover {
      color: var(--theme-primary);
    }
  }

  &__title {
    @include text-small;
    font-weight: 500;
    flex: 1;
    margin-left: $spacing-sm;
  }

  &__actions {
    display: flex;
    gap: $spacing-xs;
  }

  &__body {
    padding: $spacing-md;
    min-height: 40px;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }
}

.icon-btn {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: $spacing-xs;
  border-radius: $border-radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  @include transition(all, $transition-fast);

  &:hover {
    color: var(--theme-primary);
    background: rgba(26, 188, 156, 0.1);
  }
}

.fieldset-container {
  border: 1px solid var(--theme-border);
  border-radius: $border-radius-lg;
  background: var(--theme-bg-surface);
  min-height: 100px;
  @include transition(all, $transition-normal);
  width: 100%;
  overflow: hidden;

  &:hover {
    border-color: var(--theme-border-hover, #4a5568);
  }

  &.selected {
    border: 1px solid var(--theme-primary);
    box-shadow: 0 0 0 1px rgba(26, 188, 156, 0.4);
  }

  &.dragging {
    opacity: 0.5;
    border: 1px dashed var(--theme-primary);
    position: relative;
    z-index: 1;
  }
}

.fieldset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #2c313c, #343b48);
  padding: $spacing-sm $spacing-lg;
  font-weight: 500;
  color: var(--theme-text);
  border-bottom: 1px solid var(--theme-border);
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.fieldset-drag-handle {
  cursor: grab;
  color: #a0aec0;
  @include transition(color, $transition-fast);
  margin-right: $spacing-sm;

  &:hover {
    color: var(--theme-primary);
  }
}

.fieldset-title {
  @include text-small;
  font-weight: 500;
  flex: 1;
  margin: 0;
}

.fieldset-actions {
  display: flex;
  gap: $spacing-xs;
}

.fieldset-content {
  position: relative;
  width: 100%;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: $spacing-lg;
  padding-left: $spacing-xl;

  &::before {
    content: "";
    position: absolute;
    left: 8px;
    top: $spacing-lg;
    bottom: $spacing-lg;
    width: 2px;
    background: rgba(26, 188, 156, 0.3);
    border-radius: 1px;
  }

  > .element-card {
    margin-bottom: 0;
    margin-left: 0;
    border-left: none;
    position: relative;

    &::before {
      display: none;
    }
  }
}
</style>
