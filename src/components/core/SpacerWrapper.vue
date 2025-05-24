<script setup lang="ts">
import InsertionPoint from "./InsertionPoint.vue";
import DropZone from "./DropZone.vue";
import { watch } from "vue";

const props = defineProps<{
  index: number;
  fieldsetId?: string;
  isDragging?: boolean;
  siblingId?: string; // For DropZone positioning
  position?: "before" | "after"; // Position relative to sibling
}>();

const emit = defineEmits<{
  insert: [data: { index: number; fieldsetId?: string }];
  drop: [
    data: {
      position: "before" | "after";
      siblingId?: string;
      parentId?: string;
      elementId?: string;
      elementType?: string;
    }
  ];
}>();

// watch(props, (newValue) => {
//   console.log(`%c##### File: SpaceWrapper.vue | Line 24 ####`, 'color: lightblue;');
//   console.log(`isDragging ||  ||`, newValue);
//   console.log(`%c#####################################`, 'color: lightblue;');
// });
</script>

<template>
  <div class="spacer-wrapper">
    <!-- When dragging: show DropZone -->
    <DropZone
      v-if="props.isDragging"
      :position="props.position || 'before'"
      :sibling-id="props.siblingId"
      :parent-id="props.fieldsetId"
      @drop="emit('drop', $event)"
    />

    <!-- When not dragging: show InsertionPoint -->
    <InsertionPoint
      v-else
      :index="props.index"
      :fieldset-id="props.fieldsetId"
      :is-dragging="props.isDragging"
      @insert="emit('insert', $event)"
    />
  </div>
</template>

<style lang="scss" scoped>
.spacer-wrapper {
  height: 24px; // Exact height - no layout shifts
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0;
  padding: 0;
}
</style>
