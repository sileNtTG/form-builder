<script setup lang="ts">
import { defineEmits } from "vue";

const emit = defineEmits<{
  (e: "change-theme", themeName: "light" | "dark"): void;
}>();

interface ThemeOption {
  id: "light" | "dark";
  displayName: string;
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
@use "../../assets/scss/abstracts" as *; // For SASS variables like spacing, radius, base colors
@use "../../assets/scss/themes/dark" as dark_theme; // For dark theme specific palette variables
@use "../../assets/scss/themes/light" as light_theme; // For light theme specific palette variables
@use "sass:math"; // Add sass:math for math.div

.themes-page {
  padding: $spacing-xl;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__title {
    @include heading-2;
    color: var(--theme-text);
    margin-bottom: $spacing-xl;
  }

  &__tiles-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-lg;
    width: 100%;
    max-width: 600px;
  }
}

.theme-tile {
  padding: $spacing-lg;
  border: 2px solid var(--theme-border);
  border-radius: $border-radius-lg;
  cursor: pointer;
  text-align: center;
  background-color: var(--theme-bg-surface);
  @include transition(all, $transition-fast);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 150px;

  &:hover,
  &:focus {
    border-color: var(--theme-primary);
    box-shadow: $shadow-lg;
    transform: translateY(-2px);
  }

  &__name {
    font-size: $font-size-lg;
    font-weight: $font-weight-medium;
    color: var(--theme-text);
    margin-bottom: $spacing-md;
  }

  &__preview {
    display: flex;
    gap: $spacing-xs;
    width: 80%;
    height: 40px;
    border: 1px solid var(--theme-border);
    border-radius: $border-radius-sm;
    padding: $spacing-xs;
    background-color: var(--theme-bg);

    .preview__bg,
    .preview__surface,
    .preview__primary {
      flex: 1;
      border-radius: math.div($border-radius-sm, 2);
    }
  }

  &--dark {
    .preview__bg {
      background-color: dark_theme.$bg-main-dark;
    }
    .preview__surface {
      background-color: dark_theme.$bg-surface-dark;
    }
    .preview__primary {
      background-color: $primary;
    }
  }

  &--light {
    .preview__bg {
      background-color: light_theme.$bg-main-light;
    }
    .preview__surface {
      background-color: light_theme.$bg-surface-light;
    }
    .preview__primary {
      background-color: $primary;
    }
  }
}
</style>
