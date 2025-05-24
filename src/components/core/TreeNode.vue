<script setup lang="ts">
import { computed } from "vue";
import type { FormElement } from "@/models/FormElement";
import { SvgIcon, ElementIcon, OrangeIndicator } from "@/components/common";
import { useFormBuilderStore } from "@/stores/formBuilder";

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

const formBuilderStore = useFormBuilderStore();

const hasChildren = computed(() => props.node.children.length > 0);

const indentStyle = computed(() => ({
  marginLeft: `${props.node.level * 0.75}rem`,
}));

const nodeLabel = computed(() => {
  const element = props.node.element;
  return element.label || `Untitled ${element.type}`;
});

function getElementIcon(elementType: string): string {
  const iconMap: Record<string, string> = {
    fieldset: "fieldset",
    text: "input",
    input: "input",
    textarea: "textarea",
    checkbox: "checkbox",
    select: "select",
    radio: "radio",
    button: "button",
    date: "input",
    number: "input",
    email: "input",
    password: "key",
    file: "input",
    hidden: "input",
    static: "input",
  };
  return iconMap[elementType] || "input";
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
        <span class="tree-node__arrow">
          {{ expanded ? "▼" : "▶" }}
        </span>
      </button>

      <!-- Spacer for nodes without children -->
      <div v-else class="tree-node__spacer"></div>

      <!-- Element Icon -->
      <div class="tree-node__icon">
        <SvgIcon :name="getElementIcon(node.element.type)" :size="12" />
      </div>

      <!-- Element Label -->
      <span class="tree-node__label">{{ nodeLabel }}</span>

      <!-- Orange Indicator for unsaved changes -->
      <OrangeIndicator
        :show="formBuilderStore.elementHasUnsavedChanges(node.element.dataId)"
      />

      <!-- Element Type Badge -->
      <!-- <span class="tree-node__type">{{ node.element.type }}</span> -->
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
    padding: 2px 0;
    border-radius: $border-radius-sm;
    cursor: pointer;
    @include transition(all, $transition-fast);
    min-height: 1.5rem;

    &:hover {
      background-color: var(--theme-bg-hover);
    }

    &--selected {
      background-color: var(--theme-primary);
      color: white;

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
    padding: 0;
    border-radius: $border-radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    @include transition(all, $transition-fast);
    width: 1rem;
    height: 1rem;

    &:hover {
      background-color: var(--theme-bg-alt);
      color: var(--theme-text);
    }
  }

  &__arrow {
    font-size: 8px;
    font-weight: bold;
    color: var(--theme-text-muted);
    @include transition(color, $transition-fast);
  }

  &__spacer {
    width: 1rem;
    height: 1rem;
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
    font-size: 12px;
    color: var(--theme-text);
    flex: 1;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 4px;
  }

  &__children {
    position: relative;
    margin-left: 0.75rem;
    padding-left: 4px;
    border-left: 1px solid var(--theme-border);
    opacity: 0.7;

    &::before {
      content: "";
      position: absolute;
      left: -1px;
      top: -4px;
      width: 1px;
      height: 4px;
      background-color: var(--theme-border);
    }
  }
}
</style>
