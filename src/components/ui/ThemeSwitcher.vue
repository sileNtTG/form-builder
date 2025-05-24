<template>
  <div class="theme-switcher">
    <label class="theme-label">Theme:</label>
    <div class="theme-dropdown" @click="isOpen = !isOpen">
      <div class="current-theme">
        {{ getThemeLabel(theme) }}
        <SvgIcon
          name="arrow-up"
          :size="16"
          :class="'dropdown-icon' + (isOpen ? ' open' : '')"
        />
      </div>
      <div v-show="isOpen" class="dropdown-menu">
        <div
          v-for="themeOption in themes"
          :key="themeOption"
          @click.stop="selectTheme(themeOption)"
          class="dropdown-item"
          :class="{ active: theme === themeOption }"
        >
          {{ getThemeLabel(themeOption) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useTheme, type Theme } from "../../composables/useTheme";
import { SvgIcon } from "@/components/common";

const { theme, setTheme, getThemeLabel } = useTheme();
const isOpen = ref(false);

const themes: Theme[] = ["dark", "light", "original"];

const selectTheme = (newTheme: Theme) => {
  setTheme(newTheme);
  isOpen.value = false;
};

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".theme-dropdown")) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style lang="scss" scoped>
.theme-switcher {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.theme-label {
  @include text-small;
  color: var(--theme-text-muted);
  font-weight: $font-weight-medium;
}

.theme-dropdown {
  position: relative;
  cursor: pointer;
}

.current-theme {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: var(--theme-bg-surface);
  border: 1px solid var(--theme-border);
  border-radius: $border-radius;
  @include text-small;
  color: var(--theme-text);
  @include transition(all, $transition-fast);
  min-width: 120px;

  &:hover {
    border-color: var(--theme-border-hover);
    background: var(--theme-bg-elevated);
  }
}

.dropdown-icon {
  color: var(--theme-text-muted);
  @include transition(transform, $transition-fast);
  flex-shrink: 0;
  transform: rotate(180deg);

  &.open {
    transform: rotate(0deg);
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: $spacing-xs;
  background: var(--theme-bg-surface);
  border: 1px solid var(--theme-border);
  border-radius: $border-radius;
  box-shadow: $shadow-lg;
  z-index: $z-index-dropdown;
  overflow: hidden;
}

.dropdown-item {
  padding: $spacing-md;
  @include text-small;
  color: var(--theme-text);
  cursor: pointer;
  @include transition(background-color, $transition-fast);

  &:hover {
    background: var(--theme-bg-elevated);
  }

  &.active {
    background: rgba($primary, 0.2);
    color: var(--theme-primary);
  }
}
</style>
