<template>
  <div
    :style="style"
    class="button-node form-element"
    :class="{ 'form-element--selected': selected }"
    @click="handleClick"
  >
    <Handle
      type="target"
      :position="Position.Top"
      :style="{ background: 'transparent', border: 'none' }"
    />
    <button :type="data.element?.buttonType || 'button'" class="form-button">
      {{ data.element?.label || "Button" }}
    </button>
    <Handle
      type="source"
      :position="Position.Bottom"
      :style="{ background: 'transparent', border: 'none' }"
    />
  </div>
</template>

<script setup>
import { Handle, Position } from "@vue-flow/core";
import { computed } from "vue";

const props = defineProps({
  id: String,
  type: String,
  data: Object, // Expects data.element to be our ButtonElement
  selected: Boolean,
});

const style = computed(() => ({
  // width: `${props.data.element?.width || 150}px`, // Buttons often size to content + padding
  // height: `${props.data.element?.height || 40}px`, // Or use fixed height
  border: props.selected
    ? "2px solid var(--theme-primary)"
    : "1px solid transparent", // Show selection
  borderRadius: "4px",
  // display: 'inline-block', // To allow width to be determined by content if not fixed
}));

// Log to see if the node and its data are received
console.log("[ButtonNode] Props:", props);

// Add this click handler
const handleClick = () => {
  if (props.data?.onSelect) {
    props.data.onSelect();
  }
};
</script>

<style scoped>
.button-node {
  /* The node itself can be minimal, letting the button style it */
  background: transparent; /* Node itself is transparent */
  padding: 0; /* No padding on the node wrapper */
  overflow: visible; /* Ensure shadows/outlines on button aren't clipped */
}

.form-button {
  background-color: var(--theme-button-bg, #4caf50);
  color: var(--theme-button-text, white);
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  min-width: 100px; /* Minimum width for consistency */
  width: 100%; /* Make button take full width of node container */
  height: 100%; /* Make button take full height of node container */
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box; /* Ensure padding/border are inside width/height */
}

.form-button:hover {
  background-color: var(--theme-button-hover-bg, #45a049);
}

/* Handle styles can be made less intrusive for content-focused nodes */
:deep(.vue-flow__handle) {
  width: 8px;
  height: 8px;
}
</style>
