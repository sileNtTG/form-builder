<script setup lang="ts">
defineProps<{
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "info";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}>();

defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const getVariantClasses = (variant: string) => {
  switch (variant) {
    case "primary":
      return "bg-blue-500 hover:bg-blue-600 text-white";
    case "secondary":
      return "bg-gray-200 hover:bg-gray-300 text-gray-800";
    case "danger":
      return "bg-red-500 hover:bg-red-600 text-white";
    case "success":
      return "bg-green-500 hover:bg-green-600 text-white";
    case "warning":
      return "bg-yellow-500 hover:bg-yellow-600 text-white";
    case "info":
      return "bg-blue-400 hover:bg-blue-500 text-white";
    default:
      return "bg-blue-500 hover:bg-blue-600 text-white";
  }
};

const getSizeClasses = (size: string) => {
  switch (size) {
    case "sm":
      return "px-2 py-1 text-sm";
    case "lg":
      return "px-6 py-3 text-lg";
    default:
      return "px-4 py-2 text-base";
  }
};
</script>

<template>
  <button
    :type="type || 'button'"
    :disabled="disabled"
    :class="[
      'rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
      getVariantClasses(variant || 'primary'),
      getSizeClasses(size || 'md'),
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ]"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>
