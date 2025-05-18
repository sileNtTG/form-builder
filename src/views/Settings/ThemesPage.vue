<script setup lang="ts">
import { defineEmits } from "vue";

const emit = defineEmits<{
  (e: "change-theme", themeName: "light" | "dark"): void;
}>();

interface ThemeOption {
  id: "light" | "dark";
  displayName: string;
  // Potentially add a preview color or icon here later
}

const availableThemes: ThemeOption[] = [
  {
    id: "dark",
    displayName: "Dark Theme",
  },
  {
    id: "light",
    displayName: "Light Theme",
  },
];

const selectTheme = (themeName: "light" | "dark") => {
  emit("change-theme", themeName);
};
</script>

<template>
  <div class="themes-page">
    <h2 class="themes-page__title">Select a Theme</h2>
    <div class="themes-page__tiles-container">
      <div
        v-for="theme in availableThemes"
        :key="theme.id"
        class="theme-tile"
        :class="`theme-tile--${theme.id}`"
        @click="selectTheme(theme.id)"
        role="button"
        tabindex="0"
      >
        <span class="theme-tile__name">{{ theme.displayName }}</span>
        <!-- We can add a visual preview of the theme here later -->
        <div class="theme-tile__preview">
          <div class="preview__bg"></div>
          <div class="preview__surface"></div>
          <div class="preview__primary"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/abstracts" as *; // For SASS variables
@use "sass:math"; // Add sass:math for math.div

.themes-page {
  padding: $spacing-xl;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__title {
    @include heading-2; // Assuming you have a heading-2 mixin
    color: var(--theme-text);
    margin-bottom: $spacing-xl;
  }

  &__tiles-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-lg;
    width: 100%;
    max-width: 600px; // Adjust as needed
  }
}

.theme-tile {
  padding: $spacing-lg;
  border: 2px solid var(--theme-border);
  border-radius: $border-radius-lg; // Assuming a larger radius for tiles
  cursor: pointer;
  text-align: center;
  background-color: var(--theme-bg-surface);
  @include transition(all, $transition-fast);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 150px; // Ensure tiles have some height

  &:hover,
  &:focus {
    border-color: var(--theme-primary);
    box-shadow: $shadow-lg; // Use a larger shadow on hover/focus
    transform: translateY(-2px);
  }

  &__name {
    font-size: $font-size-lg;
    font-weight: $font-weight-medium;
    color: var(--theme-text);
    margin-bottom: $spacing-md;
  }

  // Basic preview styles - these should be themed per tile ideally
  // For simplicity, just showing structural elements
  &__preview {
    display: flex;
    gap: $spacing-xs;
    width: 80%;
    height: 40px; // Example height
    border: 1px solid var(--theme-border);
    border-radius: $border-radius-sm;
    padding: $spacing-xs;
    background-color: var(--theme-bg); // Preview background

    .preview__bg,
    .preview__surface,
    .preview__primary {
      flex: 1;
      border-radius: math.div($border-radius-sm, 2);
    }
  }

  // Specific preview colors for dark tile
  &--dark {
    .preview__bg {
      background-color: $bg-main;
    } // from _variables for dark
    .preview__surface {
      background-color: $bg-surface;
    }
    .preview__primary {
      background-color: $primary;
    }
  }

  // Specific preview colors for light tile
  &--light {
    // These should use light theme variable equivalents defined in _variables.scss or _themes.scss
    // Example: use light theme's actual colors for preview
    .preview__bg {
      background-color: $white;
    } // Using a SASS var for white
    .preview__surface {
      background-color: $gray-100;
    } // SASS var for light gray
    .preview__primary {
      background-color: $primary;
    } // Primary is often the same
  }
}
</style>
