<script setup lang="ts">
import { ref, computed } from "vue";
import { RouterLink } from "vue-router";

// Props
interface SidebarProps {
  initialOpen?: boolean;
}

const props = withDefaults(defineProps<SidebarProps>(), {
  initialOpen: true,
});

// Emits
const emit = defineEmits<{
  (e: "toggle", value: boolean): void;
}>();

// State
const isOpen = ref(props.initialOpen);
const sectionsOpen = ref({
  forms: true,
  account: false,
  settings: true,
});

const settingsOptions = ref([
  { name: "Themes", path: "/settings/themes" },
  {
    name: "Preferences",
    action: () => console.log("Preferences clicked (placeholder)"),
  },
  {
    name: "API Keys",
    action: () => console.log("API Keys clicked (placeholder)"),
  },
]);

// Computed
const sidebarWidth = computed(() =>
  isOpen.value ? "var(--sidebar-width)" : "var(--sidebar-width-collapsed)"
);

// Methods
const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  emit("toggle", isOpen.value);
};

const toggleSection = (section: "forms" | "account" | "settings") => {
  if (!isOpen.value) {
    isOpen.value = true;
    emit("toggle", isOpen.value);
  }
  sectionsOpen.value[section] = !sectionsOpen.value[section];
};
</script>

<template>
  <aside
    class="sidebar"
    :class="{ collapsed: !isOpen }"
    :style="{ width: sidebarWidth }"
  >
    <!-- Toggle Button -->
    <button
      @click="toggleSidebar"
      class="sidebar__toggle"
      :title="isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'"
    >
      <svg
        v-if="isOpen"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Menu content - only show when open -->
    <div v-if="isOpen" class="sidebar__content panel-scroll">
      <h2>Form Builder</h2>

      <!-- My Forms -->
      <div class="sidebar__section">
        <button @click="toggleSection('forms')" class="sidebar__section-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>My Forms</span>
          <svg
            class="arrow"
            :class="{ expanded: sectionsOpen.forms }"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div v-if="sectionsOpen.forms" class="sidebar__section-content">
          <div
            v-for="form in ['Contact Form', 'Survey', 'Registration']"
            :key="form"
            class="item"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            {{ form }}
          </div>
        </div>
      </div>

      <!-- Account -->
      <div class="sidebar__section">
        <button
          @click="toggleSection('account')"
          class="sidebar__section-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Account</span>
          <svg
            class="arrow"
            :class="{ expanded: sectionsOpen.account }"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div v-if="sectionsOpen.account" class="sidebar__section-content">
          <div
            v-for="option in ['Profile', 'Settings', 'Logout']"
            :key="option"
            class="item"
          >
            {{ option }}
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div class="sidebar__section">
        <button
          @click="toggleSection('settings')"
          class="sidebar__section-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Settings</span>
          <svg
            class="arrow"
            :class="{ expanded: sectionsOpen.settings }"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div v-if="sectionsOpen.settings" class="sidebar__section-content">
          <template v-for="option in settingsOptions" :key="option.name">
            <router-link
              v-if="option.path"
              :to="option.path"
              custom
              v-slot="{ navigate, isActive }"
            >
              <div
                class="item"
                :class="{ 'item--active': isActive }"
                @click="navigate"
                role="link"
              >
                {{ option.name }}
              </div>
            </router-link>
            <div
              v-else-if="option.action"
              @click="option.action"
              class="item"
              role="button"
            >
              {{ option.name }}
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- If sidebar is collapsed, show only icons -->
    <div v-if="!isOpen" class="sidebar__collapsed-icons">
      <button
        class="sidebar__collapsed-icon"
        @click="toggleSidebar"
        title="My Forms"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </button>
      <button
        class="sidebar__collapsed-icon"
        @click="toggleSidebar"
        title="Account"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
      <button
        class="sidebar__collapsed-icon"
        @click="toggleSidebar"
        title="Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    </div>
  </aside>
</template>

<style lang="scss">
/* Component-specific styles for Sidebar */
/* These styles are directly in the component rather than in a separate file */

.sidebar {
  background-color: var(--theme-sidebar-bg);
  width: $sidebar-width;
  height: 100%;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(var(--theme-shadow-color-rgb), 0.12),
    0 4px 6px -2px rgba(var(--theme-shadow-color-rgb), 0.08);
  @include transition(width);

  &.collapsed {
    width: $sidebar-width-collapsed;
  }

  &__toggle {
    width: 100%;
    padding: $spacing-sm;
    background-color: var(--theme-bg-surface);
    color: var(--theme-text);
    @include flex-center;
    border: none;
    cursor: pointer;

    &:hover {
      background-color: var(--theme-item-hover-bg);
    }

    svg {
      height: 0.75rem;
      width: 0.75rem;
    }
  }

  &__content {
    padding: $spacing-md;
    overflow-y: auto;
    height: calc(100% - 2.5rem);

    h2 {
      @include heading-2;
      color: var(--theme-text);
      margin-bottom: $spacing-md;
      padding: 0 $spacing-sm;
    }
  }

  &__section {
    margin-bottom: $spacing-md;

    &-button {
      @include flex(row, flex-start, center);
      width: 100%;
      padding: $spacing-sm $spacing-sm;
      border-radius: $border-radius;
      text-align: left;
      background: transparent;
      border: none;
      cursor: pointer;

      &:hover {
        background-color: var(--theme-item-hover-bg);
      }

      svg {
        height: 0.75rem;
        width: 0.75rem;
        margin-right: $spacing-sm;
        color: var(--theme-text-muted);

        &.arrow {
          margin-left: auto;
          margin-right: 0;
          @include transition(transform);

          &.expanded {
            transform: rotate(180deg);
          }
        }
      }

      span {
        font-size: $font-size-sm;
        font-weight: 600;
        color: var(--theme-text-muted);
      }
    }

    &-content {
      margin-top: $spacing-xs;
      padding-left: $spacing-lg;
      overflow: hidden;

      .item {
        padding: $spacing-sm $spacing-sm;
        border-radius: $border-radius;
        @include flex(row, flex-start, center);
        cursor: pointer;
        color: var(--theme-text);
        text-decoration: none;

        &:hover {
          background-color: var(--theme-item-hover-bg);
        }

        &--active {
          background-color: var(--theme-primary-dark);
          color: var(--theme-text-inverse);
          font-weight: $font-weight-semibold;
        }

        svg {
          height: 0.75rem;
          width: 0.75rem;
          margin-right: $spacing-sm;
          color: var(--theme-text-muted);
        }
      }
    }
  }

  &__collapsed-icons {
    @include flex(column, flex-start, center);
    padding: $spacing-md 0;
    gap: $spacing-md;
  }

  &__collapsed-icon {
    @include flex-center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: var(--theme-text-muted);

    &:hover {
      background-color: var(--theme-item-hover-bg);
      color: var(--theme-text);
    }

    svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
}
</style>
