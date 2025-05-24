<script setup lang="ts">
import { computed, ref } from "vue";
import { useFormBuilderStore } from "@/stores/formBuilder";
import { useToastStore } from "@/stores/toast";
import { useCanvasNavigation } from "@/composables/useCanvasNavigation";
import type { FormElement, FieldsetElement } from "@/models/FormElement";
import {
  SvgIcon,
  ElementIcon,
  EditableTitle,
  OrangeIndicator,
} from "@/components/common";
import TreeNode from "./TreeNode.vue";

const formBuilderStore = useFormBuilderStore();
const toastStore = useToastStore();
const { scrollToElement, scrollToElementById } = useCanvasNavigation();

// Track which nodes are expanded
const expandedNodes = ref<Set<string>>(new Set());

// Tree structure with element hierarchy
const treeData = computed(() => {
  const data = buildTreeStructure(formBuilderStore.elements);

  // Auto-expand fieldsets on first load
  if (expandedNodes.value.size === 0 && data.length > 0) {
    data.forEach((node) => {
      if (node.element.type === "fieldset") {
        expandedNodes.value.add(node.element.dataId);
      }
    });
  }

  return data;
});

interface TreeNode {
  element: FormElement;
  children: TreeNode[];
  level: number;
  isRoot: boolean;
}

function buildTreeStructure(elements: FormElement[], level = 0): TreeNode[] {
  // Sort elements by their order property before building tree structure
  const sortedElements = [...elements].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  return sortedElements.map((element) => {
    let children: TreeNode[] = [];

    // Check for different types of containers that can have children
    if (element.type === "fieldset" && (element as FieldsetElement).children) {
      children = buildTreeStructure(
        (element as FieldsetElement).children!,
        level + 1
      );
    }
    // Add support for grid containers and other potential containers
    else if (
      (element as any).children &&
      Array.isArray((element as any).children)
    ) {
      children = buildTreeStructure((element as any).children, level + 1);
    }

    return {
      element,
      children,
      level,
      isRoot: level === 0,
    };
  });
}

function toggleNode(elementId: string) {
  if (expandedNodes.value.has(elementId)) {
    expandedNodes.value.delete(elementId);
  } else {
    expandedNodes.value.add(elementId);
  }
}

function selectElement(elementId: string) {
  formBuilderStore.selectElement(elementId);

  // Scroll to element in canvas using VueUse
  scrollToElementById(elementId);
}

function isExpanded(elementId: string): boolean {
  return expandedNodes.value.has(elementId);
}

function isSelected(elementId: string): boolean {
  return formBuilderStore.selectedElementId === elementId;
}

function getElementIcon(elementType: string): string {
  const iconMap: Record<string, string> = {
    fieldset: "folder",
    text: "type",
    textarea: "file-text",
    checkbox: "check-square",
    select: "chevron-down",
    radio: "circle",
    button: "square",
    date: "calendar",
    number: "hash",
    email: "at-sign",
    password: "key",
    file: "upload",
    hidden: "eye-off",
    static: "file-text",
  };
  return iconMap[elementType] || "circle";
}

function hasChildren(node: TreeNode): boolean {
  return node.children.length > 0;
}

function handleFormNameUpdate(newName: string) {
  formBuilderStore.updateActiveFormName(newName);
  toastStore.showInfo("Formular wurde geändert. Vergiss nicht zu speichern!");
}
</script>

<template>
  <div class="tree-view">
    <div class="tree-view__header">
      <div class="tree-view__header-content">
        <EditableTitle
          :value="formBuilderStore.activeForm?.name || 'No Form Selected'"
          placeholder="Neues Formular"
          edit-tooltip="Formularnamen bearbeiten"
          @update="handleFormNameUpdate"
          class="tree-view__title-editable"
        />
        <OrangeIndicator :show="formBuilderStore.activeFormNameChanged" />
      </div>
    </div>

    <div class="tree-view__content">
      <!-- Debug info -->
      <div
        v-if="false && treeData.length > 0"
        style="
          font-size: 10px;
          opacity: 0.5;
          padding: 4px;
          border: 1px solid #333;
          margin: 4px;
        "
      >
        <div>
          Elements: {{ formBuilderStore.elements.length }}, Tree nodes:
          {{ treeData.length }}
        </div>
        <div>Active Form: {{ formBuilderStore.activeFormId }}</div>
        <div>
          Form List:
          {{ formBuilderStore.formList.map((f) => f.name).join(", ") }}
        </div>
        <div>
          Active Form Name: {{ formBuilderStore.activeForm?.name || "None" }}
        </div>
        <div>
          Element types:
          {{ formBuilderStore.elements.map((e) => e.type).join(", ") }}
        </div>
        <div>
          Element labels:
          {{
            formBuilderStore.elements
              .map((e) => e.label || "No label")
              .join(", ")
          }}
        </div>
      </div>

      <template v-if="treeData.length === 0">
        <div class="tree-view__empty">
          <SvgIcon name="folder-open" :size="32" />
          <span>No elements in form</span>
        </div>
      </template>

      <template v-else>
        <div
          v-for="node in treeData"
          :key="node.element.dataId"
          class="tree-node-container"
        >
          <TreeNode
            :node="node"
            :expanded="isExpanded(node.element.dataId)"
            :selected="isSelected(node.element.dataId)"
            :expanded-nodes="expandedNodes"
            :selected-element-id="formBuilderStore.selectedElementId"
            @toggle="toggleNode"
            @select="selectElement"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/abstracts" as *;

.tree-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--theme-bg-surface);

  &__header {
    padding: $spacing-md $spacing-lg;
    border-bottom: 1px solid var(--theme-border);
    background: var(--theme-bg-elevated);
    @include transition(all, $transition-fast);
  }

  &__header-content {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__title-editable {
    flex: 1;
  }

  &__title {
    @include text-small;
    font-weight: 600;
    margin: 0;
    color: var(--theme-text);
  }

  &__actions {
    display: flex;
    gap: $spacing-xs;
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-sm;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--theme-text-muted);
    gap: $spacing-md;

    svg {
      opacity: 0.5;
    }

    span {
      @include text-small;
      font-style: italic;
    }
  }

  // Tree action buttons (if we still need them)
  .tree-action-btn {
    background: none;
    border: none;
    color: var(--theme-text-muted);
    cursor: pointer;
    padding: $spacing-xs;
    border-radius: $border-radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    @include transition(all, $transition-fast);

    &:hover {
      background: var(--theme-bg-alt);
      color: var(--theme-primary);

      svg {
        stroke-width: 2;
      }
    }
  }

  // Tree node containers
  .tree-node-container {
    margin-bottom: $spacing-xs;
  }
}
</style>
