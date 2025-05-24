<template>
  <div class="user-menu">
    <div class="user-avatar" @click="isOpen = !isOpen">
      <SvgIcon name="user" :size="20" />
      <SvgIcon
        name="arrow-up"
        :size="12"
        :class="'dropdown-arrow' + (isOpen ? ' open' : '')"
      />
    </div>

    <div v-show="isOpen" class="user-dropdown">
      <div class="user-info">
        <div class="user-name">Max Mustermann</div>
        <div class="user-email">max@example.com</div>
      </div>
      <div class="dropdown-divider"></div>
      <div class="dropdown-section">
        <button @click="handleMenuItem('profile')" class="dropdown-item">
          <SvgIcon name="user" :size="16" /> Profile
        </button>
        <button @click="handleMenuItem('settings')" class="dropdown-item">
          <SvgIcon name="settings" :size="16" /> Einstellungen
        </button>
        <button @click="handleMenuItem('help')" class="dropdown-item">
          <SvgIcon name="info" :size="16" /> Hilfe
        </button>
      </div>
      <div class="dropdown-divider"></div>
      <div class="dropdown-section">
        <button @click="handleMenuItem('publish-demo')" class="dropdown-item">
          <SvgIcon name="eye" :size="16" /> Publish Demo
        </button>
        <button @click="handleMenuItem('logout')" class="dropdown-item danger">
          <SvgIcon name="x" :size="16" /> Abmelden
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { SvgIcon } from "@/components/common";

const isOpen = ref(false);
const router = useRouter();

const handleMenuItem = (action: string) => {
  // Handle action logic here
  isOpen.value = false;

  // Hier könntest du die entsprechenden Aktionen implementieren
  switch (action) {
    case "profile":
      // Profile öffnen
      break;
    case "settings":
      // Settings öffnen
      break;
    case "help":
      // Hilfe öffnen
      break;
    case "publish-demo":
      router.push("/publish-demo");
      break;
    case "logout":
      // Logout
      break;
  }
};

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".user-menu")) {
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
.user-menu {
  position: relative;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm;
  border-radius: $border-radius;
  cursor: pointer;
  @include transition(background-color, $transition-fast);
  color: var(--theme-text-muted);

  &:hover {
    background: var(--theme-bg-elevated);
    color: var(--theme-text);
  }
}

.dropdown-arrow {
  @include transition(transform, $transition-fast);
  transform: rotate(180deg);

  &.open {
    transform: rotate(0deg);
  }
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: $spacing-sm;
  min-width: 240px;
  background: var(--theme-bg-surface);
  border: 1px solid var(--theme-border);
  border-radius: $border-radius-md;
  box-shadow: $shadow-xl;
  z-index: $z-index-dropdown;
  overflow: hidden;
}

.user-info {
  padding: $spacing-lg;
  background: var(--theme-bg-elevated);
}

.user-name {
  @include text-small;
  font-weight: $font-weight-semibold;
  color: var(--theme-text);
  margin-bottom: $spacing-xs;
}

.user-email {
  font-size: $font-size-xs;
  color: var(--theme-text-muted);
}

.dropdown-divider {
  height: 1px;
  background: var(--theme-border);
}

.dropdown-section {
  padding: $spacing-sm 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  width: 100%;
  padding: $spacing-md $spacing-lg;
  background: none;
  border: none;
  color: var(--theme-text);
  @include text-small;
  cursor: pointer;
  @include transition(background-color, $transition-fast);
  text-align: left;

  &:hover {
    background: var(--theme-bg-elevated);
  }

  &.danger {
    color: var(--theme-danger);

    &:hover {
      background: rgba($danger, 0.1);
    }
  }

  svg {
    flex-shrink: 0;
  }
}
</style>
