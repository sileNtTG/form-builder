<script setup lang="ts">
import { computed } from "vue";
import type { FormElement } from "@/models/FormElement";
import { SvgIcon, ElementIcon } from "@/components/common";

interface TreeNode {
  element: FormElement;
  children: TreeNode[];
  level: number;
  isRoot: boolean;
}

interface Props {
  node: TreeNode;
  expanded: boolean;
  selected: boolean;
  expandedNodes: Set<string>;
  selectedElementId: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [elementId: string];
  select: [elementId: string];
}>();

const hasChildren = computed(() => props.node.children.length > 0);

const indentStyle = computed(() => ({
  marginLeft: `${props.node.level * 1.5}rem`,
}));

const nodeLabel = computed(() => {
  const element = props.node.element;
  return element.label || `Untitled ${element.type}`;
});

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

function handleToggle() {
  if (hasChildren.value) {
    emit("toggle", props.node.element.dataId);
  }
}

function handleSelect() {
  emit("select", props.node.element.dataId);
}
</script>

<template>
  <div class="tree-node">
    <!-- Current Node -->
    <div
      class="tree-node__item"
      :class="{
        'tree-node__item--selected': selected,
        'tree-node__item--expandable': hasChildren,
      }"
      :style="indentStyle"
      @click="handleSelect"
    >
      <!-- Expand/Collapse Button -->
      <button
        v-if="hasChildren"
        class="tree-node__toggle"
        @click.stop="handleToggle"
      >
        <SvgIcon
          :name="expanded ? 'chevron-down' : 'chevron-right'"
          :size="14"
        />
      </button>

      <!-- Spacer for nodes without children -->
      <div v-else class="tree-node__spacer"></div>

      <!-- Element Icon -->
      <div class="tree-node__icon">
        <SvgIcon :name="getElementIcon(node.element.type)" :size="16" />
      </div>

      <!-- Element Label -->
      <span class="tree-node__label">{{ nodeLabel }}</span>

      <!-- Element Type Badge -->
      <span class="tree-node__type">{{ node.element.type }}</span>
    </div>

    <!-- Children Nodes (recursive) -->
    <div v-if="hasChildren && expanded" class="tree-node__children">
      <TreeNode
        v-for="child in node.children"
        :key="child.element.dataId"
        :node="child"
        :expanded="expandedNodes.has(child.element.dataId)"
        :selected="selectedElementId === child.element.dataId"
        :expanded-nodes="expandedNodes"
        :selected-element-id="selectedElementId"
        @toggle="(id) => $emit('toggle', id)"
        @select="(id) => $emit('select', id)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/abstracts" as *;

.tree-node {
  &__item {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-sm;
    cursor: pointer;
    @include transition(all, $transition-fast);
    min-height: 2rem;

    &:hover {
      background-color: var(--theme-bg-hover);
    }

    &--selected {
      background-color: var(--theme-primary);
      color: white;

      .tree-node__type {
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
      }
    }

    &--expandable {
      .tree-node__icon {
        color: var(--theme-warning);
      }
    }
  }

  &__toggle {
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
    width: 1.25rem;
    height: 1.25rem;

    &:hover {
      background-color: var(--theme-bg-alt);
      color: var(--theme-text);
    }

    svg {
      stroke-width: 2;
    }
  }

  &__spacer {
    width: 1.25rem;
    height: 1.25rem;
  }

  &__icon {
    color: var(--theme-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;

    svg {
      stroke-width: 2;
    }
  }

  &__label {
    @include text-small;
    color: var(--theme-text);
    flex: 1;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__type {
    @include text-xs;
    background-color: var(--theme-bg-alt);
    color: var(--theme-text-muted);
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-sm;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;
  }

  &__children {
    position: relative;

    // Connection lines
    &::before {
      content: "";
      position: absolute;
      left: calc(#{$spacing-sm} + 0.625rem); // Align with toggle button center
      top: 0;
      bottom: 0;
      width: 1px;
      background-color: var(--theme-border);
      opacity: 0.5;
    }
  }
}

// Selected state overrides
.tree-node__item--selected {
  .tree-node__label {
    color: white;
  }

  .tree-node__icon {
    color: white;
  }

  .tree-node__toggle {
    color: rgba(255, 255, 255, 0.8);

    &:hover {
      color: white;
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
