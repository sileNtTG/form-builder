<script setup lang="ts">
import { SvgIcon } from "@/components/common";

interface Props {
  type: string;
  size?: number | string;
  color?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
  color: "currentColor",
  class: "",
});

// Map element types to icon names
const iconMap: Record<string, string> = {
  input: "input",
  textarea: "textarea",
  checkbox: "checkbox",
  select: "select",
  radio: "radio",
  fieldset: "fieldset",
  button: "button",
  number: "input", // Use input icon for number
  date: "input", // Use input icon for date
};

const iconName = iconMap[props.type] || "input";
</script>

<template>
  <SvgIcon
    :name="iconName"
    :size="props.size"
    :color="props.color"
    :class="props.class"
  />
</template>
