<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useFormBuilderStore } from "../../stores/formBuilder";

const formBuilderStore = useFormBuilderStore();
const router = useRouter();

// Formularübersicht
const formNameInputRefs = ref<Record<string, HTMLInputElement>>({});
const newlyCreatedFormId = ref<string | null>(null);
const forms = computed(() => formBuilderStore.formList);
const activeFormId = computed(() => formBuilderStore.activeFormId);
const isDropdownOpen = ref(false);

// Formular-Funktionen
const handleCreateForm = async () => {
  const newId = formBuilderStore.createBlankForm("Untitled Form");
  newlyCreatedFormId.value = newId;
  await nextTick();
  if (formNameInputRefs.value[newId]) {
    formNameInputRefs.value[newId].focus();
    formNameInputRefs.value[newId].select();
  }
};

const handleFormNameChange = (formId: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  formBuilderStore.updateActiveFormName(target.value);
};

const handleFormNameEnter = (formId: string) => {
  if (formNameInputRefs.value[formId]) {
    formNameInputRefs.value[formId].blur();
  }
  newlyCreatedFormId.value = null;
};

const selectForm = (formId: string) => {
  formBuilderStore.setActiveForm(formId);
  newlyCreatedFormId.value = null;
  isDropdownOpen.value = false;
  router.push({ name: "FormBuilder" });
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Dropdown außerhalb schließen
const closeDropdownOnClickOutside = (event: MouseEvent) => {
  const dropdown = document.querySelector(".nav-forms__dropdown");
  const button = document.querySelector(".nav-forms__current");

  if (
    isDropdownOpen.value &&
    dropdown &&
    button &&
    !dropdown.contains(event.target as Node) &&
    !button.contains(event.target as Node)
  ) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeDropdownOnClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdownOnClickOutside);
});

function setFormNameInputRef(id: string, el: any) {
  if (el) {
    formNameInputRefs.value[id] = el as HTMLInputElement;
  }
}
</script>

<template>
  <nav class="app-nav">
    <div class="app-nav__main-menu">
      <div class="nav-forms">
        <button @click="toggleDropdown" class="nav-forms__current">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
            <path d="M10 9H8" />
          </svg>
          <span>{{
            activeFormId
              ? forms.find((f) => f.id === activeFormId)?.name ||
                "Untitled Form"
              : "Select Form"
          }}</span>
          <svg
            class="arrow-down"
            :class="{ 'arrow-up': isDropdownOpen }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div v-show="isDropdownOpen" class="nav-forms__dropdown">
          <button @click="handleCreateForm" class="dropdown-action">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Neues Formular</span>
          </button>
          <div
            v-if="!forms.length && newlyCreatedFormId === null"
            class="dropdown-empty"
          >
            Keine Formulare vorhanden
          </div>
          <div class="dropdown-items">
            <div
              v-for="form in forms"
              :key="form.id"
              class="dropdown-item"
              :class="{ 'dropdown-item--active': form.id === activeFormId }"
              @click="selectForm(form.id)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              <input
                v-if="form.id === newlyCreatedFormId"
                type="text"
                :ref="el => setFormNameInputRef(form.id as string, el)"
                :value="form.name"
                @input="handleFormNameChange(form.id, $event)"
                @keyup.enter="handleFormNameEnter(form.id)"
                @blur="handleFormNameEnter(form.id)"
                class="dropdown-item-input"
                placeholder="Formularname"
              />
              <span v-else>{{ form.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="app-nav__secondary-links">
      <router-link
        to="/preferences"
        class="nav-link"
        active-class="nav-link--active"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path
            d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
          ></path>
        </svg>
        <span>Preferences</span>
      </router-link>
      <router-link
        to="/api-key"
        class="nav-link"
        active-class="nav-link--active"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 010-10h10a5 5 0 010 10v4"></path>
        </svg>
        <span>API Key</span>
      </router-link>
      <router-link
        to="/fieldset-test"
        class="nav-link"
        active-class="nav-link--active"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 3v18" />
        </svg>
        <span>Fieldset Test</span>
      </router-link>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.app-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 auto;
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  border-bottom: 1px solid var(--theme-border);
  background: var(--theme-bg-alt);

  &__main-menu {
    display: flex;
    align-items: center;
  }

  &__secondary-links {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--theme-text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;

  &:hover {
    color: var(--theme-text);
    background-color: rgba(255, 255, 255, 0.05);
  }

  &--active {
    color: var(--theme-primary);
    font-weight: 500;
  }

  svg {
    width: 1rem;
    height: 1rem;
    stroke-width: 2;
  }
}

.nav-forms {
  position: relative;

  &__current {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--theme-border);
    border-radius: 4px;
    padding: 0.3rem 0.6rem;
    color: var(--theme-text);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    svg {
      width: 16px;
      height: 16px;
    }

    .arrow-down {
      width: 14px;
      height: 14px;
      margin-left: 0.3rem;
      transition: transform 0.2s ease;

      &.arrow-up {
        transform: rotate(180deg);
      }
    }
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.3rem;
    width: 220px;
    background: var(--theme-bg-surface);
    border: 1px solid var(--theme-border);
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
  }
}

.dropdown-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.8rem;
  background: linear-gradient(
    to right,
    rgba(26, 188, 156, 0.1),
    rgba(26, 188, 156, 0.05)
  );
  border: none;
  border-bottom: 1px solid var(--theme-border);
  color: var(--theme-primary);
  font-size: 0.85rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: linear-gradient(
      to right,
      rgba(26, 188, 156, 0.2),
      rgba(26, 188, 156, 0.1)
    );
  }

  svg {
    width: 16px;
    height: 16px;
    stroke: var(--theme-primary);
  }
}

.dropdown-empty {
  padding: 0.8rem;
  color: var(--theme-text-muted);
  font-size: 0.85rem;
  font-style: italic;
  text-align: center;
}

.dropdown-items {
  max-height: 240px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  color: var(--theme-text);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &--active {
    background: rgba(26, 188, 156, 0.1);
    color: var(--theme-primary);

    svg {
      stroke: var(--theme-primary);
    }
  }

  svg {
    width: 16px;
    height: 16px;
    stroke: var(--theme-text-muted);
  }
}

.dropdown-item-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--theme-border);
  border-radius: 3px;
  padding: 0.2rem 0.4rem;
  color: var(--theme-text);
  font-size: 0.85rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--theme-primary);
  }
}
</style>
