<template>
  <div
    :style="style"
    class="fieldset-node form-element"
    :class="{ 'form-element--selected': selected }"
    @click="handleClick"
  >
    <Handle type="target" :position="Position.Top" />
    <div
      v-if="data.label && data.label !== 'Untitled Fieldset'"
      class="fieldset-label"
    >
      {{ data.label }}
    </div>
    <!-- Child nodes are rendered by VueFlow itself based on their x, y, and parentNode referring to this node's ID -->
    <!-- We don't need a slot for children here, as VueFlow handles that -->
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup>
import { Handle, Position } from "@vue-flow/core";
import { computed } from "vue";

const props = defineProps({
  id: String,
  type: String,
  data: Object, // Contains label, width, height, etc. from our FormElement
  selected: Boolean,
  // VueFlow also injects width & height if the node has these dimensions
  // and a resizer is not active, or if dimensions are set initially.
  // We are calculating width/height in useServerFormImporter
});

const style = computed(() => ({
  width: `${props.data.width || 250}px`,
  height: `${props.data.height || 150}px`,
  border: "1px solid #555",
  borderRadius: "5px",
  padding: "10px 15px",
  background: "rgba(255, 255, 255, 0.05)",
  boxSizing: "border-box",
}));

// Log to see if the node and its data are received
console.log("[FieldsetNode] Props:", props);

// Add this click handler
const handleClick = () => {
  if (props.data?.onSelect) {
    props.data.onSelect();
  }
};
</script>

<style scoped>
.fieldset-node {
  /* Add any specific styling for the fieldset node itself */
  display: flex;
  flex-direction: column;
}
.fieldset-label {
  font-weight: bold;
  padding: 2px 5px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  color: #eee;
  align-self: flex-start;
  margin-bottom: var(--spacing-sm, 8px);
}
</style>
