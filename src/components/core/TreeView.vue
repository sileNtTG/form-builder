<script setup lang="ts">
import { computed, ref } from "vue";
import { useFormBuilderStore } from "@/stores/formBuilder";
import type { FormElement, FieldsetElement } from "@/models/FormElement";
import { SvgIcon, ElementIcon } from "@/components/common";

const formBuilderStore = useFormBuilderStore();

// Track which nodes are expanded
const expandedNodes = ref<Set<string>>(new Set());

// Tree structure with element hierarchy
const treeData = computed(() => {
  return buildTreeStructure(formBuilderStore.elements);
});

interface TreeNode {
  element: FormElement;
  children: TreeNode[];
  level: number;
  isRoot: boolean;
}

function buildTreeStructure(elements: FormElement[], level = 0): TreeNode[] {
  return elements.map((element) => ({
    element,
    children:
      element.type === "fieldset" && (element as FieldsetElement).children
        ? buildTreeStructure((element as FieldsetElement).children!, level + 1)
        : [],
    level,
    isRoot: level === 0,
  }));
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
</script>

<template>
  <div class="tree-view">
    <div class="tree-view__header">
      <h3 class="tree-view__title">Structure</h3>
      <div class="tree-view__actions">
        <button
          class="tree-action-btn"
          @click="expandedNodes.clear()"
          title="Collapse All"
        >
          <SvgIcon name="fold-vertical" :size="14" />
        </button>
        <button
          class="tree-action-btn"
          @click="
            treeData.forEach((node) => expandedNodes.add(node.element.dataId))
          "
          title="Expand All"
        >
          <SvgIcon name="unfold-vertical" :size="14" />
        </button>
      </div>
    </div>

    <div class="tree-view__content">
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
  background-color: var(--theme-bg-surface);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-md $spacing-lg;
    border-bottom: 1px solid var(--theme-border);
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
}

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
  }

  svg {
    stroke-width: 2;
  }
}

.tree-node-container {
  margin-bottom: $spacing-xs;
}
</style>
