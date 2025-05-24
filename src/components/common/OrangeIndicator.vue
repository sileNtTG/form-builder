<template>
  <div
    v-if="show"
    class="orange-indicator"
    :class="{ 'orange-indicator--large': size === 'large' }"
  >
    <div class="orange-indicator__dot" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean;
  size?: "small" | "large";
}

withDefaults(defineProps<Props>(), {
  size: "small",
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/abstracts" as *;

.orange-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &__dot {
    width: 6px;
    height: 6px;
    background: #ff8c00; // Orange color
    border-radius: 50%;
    @include transition(all, $transition-fast);
  }

  &--large &__dot {
    width: 8px;
    height: 8px;
  }

  // Pulse animation for attention
  &__dot {
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 140, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(255, 140, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 140, 0, 0);
  }
}
</style>
