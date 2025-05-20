<template>
  <div class="preferences-view">
    <h2>Preferences</h2>
    <p>Manage your application preferences here.</p>

    <div class="themes-section">
      <h3 class="themes-section__title">Select a Theme</h3>
      <div class="themes-section__tiles-container">
        <div
          v-for="theme in availableThemes"
          :key="theme.id"
          class="theme-tile"
          :class="`theme-tile--${theme.id}`"
          @click="changeTheme(theme.id)"
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
    <!-- Add more preference options here as needed -->
  </div>
</template>

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

const changeTheme = (themeName: "light" | "dark") => {
  emit("change-theme", themeName);
};
</script>

<style scoped lang="scss">
@use "@/assets/scss/abstracts" as *; // For SASS variables
@use "@/assets/scss/themes/dark" as dark_theme; // For dark theme specific palette variables
@use "@/assets/scss/themes/light" as light_theme; // For light theme specific palette variables
@use "sass:math"; // For math.div

.preferences-view {
  padding: $spacing-xl; // Use consistent padding
}

// Styles for the copied theme selection section (scoped to this component)
.themes-section {
  margin-top: $spacing-xl;
  padding: $spacing-lg;
  border: 1px solid var(--theme-border-color);
  border-radius: $border-radius-lg;
  background-color: var(--theme-bg-surface);

  &__title {
    @include heading-3; // Use a smaller heading for a subsection
    color: var(--theme-text);
    margin-top: 0;
    margin-bottom: $spacing-lg;
    text-align: center;
  }

  &__tiles-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-lg;
    width: 100%;
    max-width: 500px; // Adjusted max-width for a preferences page section
    margin: 0 auto; // Center the tiles
  }
}

.theme-tile {
  padding: $spacing-lg;
  border: 2px solid var(--theme-border);
  border-radius: $border-radius-lg;
  cursor: pointer;
  text-align: center;
  background-color: var(--theme-bg-offset);
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

  // Specific theme preview colors - these use direct theme variables from imported files
  // Ensure these SCSS files and variables are correctly pathed and defined.
  &--dark {
    .preview__bg {
      background-color: dark_theme.$bg-main-dark;
    }
    .preview__surface {
      background-color: dark_theme.$bg-surface-dark;
    }
    .preview__primary {
      background-color: $primary;
    } // Assuming $primary is defined in abstracts or globally
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
    } // Assuming $primary is defined in abstracts or globally
  }
}
</style>
