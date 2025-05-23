<script setup lang="ts">
import InsertionPoint from "./InsertionPoint.vue";
import DropZone from "./DropZone.vue";

const props = defineProps<{
  index: number;
  fieldsetId?: string;
  isDragging?: boolean;
  siblingId?: string; // For DropZone positioning
}>();

const emit = defineEmits<{
  insert: [data: { index: number; fieldsetId?: string }];
  drop: [data: any];
}>();

// Debug: Log the props to understand the positioning
console.log(
  `SpacerWrapper DEBUG - index: ${props.index}, siblingId: ${
    props.siblingId?.slice(-8) || "none"
  }, fieldsetId: ${props.fieldsetId?.slice(-8) || "none"}`
);
</script>

<template>
  <div class="spacer-wrapper">
    <!-- When dragging: show DropZone -->
    <DropZone
      v-if="isDragging"
      position="before"
      :sibling-id="siblingId"
      :parent-id="fieldsetId"
      :is-dragging="isDragging"
      @drop="emit('drop', $event)"
    />

    <!-- When not dragging: show InsertionPoint -->
    <InsertionPoint
      v-else
      :index="index"
      :fieldset-id="fieldsetId"
      :is-dragging="isDragging"
      @insert="emit('insert', $event)"
    />
  </div>
</template>

<style lang="scss" scoped>
.spacer-wrapper {
  height: 10px; /* Fixed height - no layout shift */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0;
  padding: 0;
}
</style>
