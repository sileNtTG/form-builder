<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useFormBuilderStore } from "../../stores/formBuilder";
import { v4 as uuidv4 } from "uuid";
import type { FormElement } from "../../models/FormElement";

const formBuilderStore = useFormBuilderStore();

// State management
const isVisible = ref(false);
const searchQuery = ref("");
const selectedIndex = ref(0);
const recentElements = ref(["input", "textarea", "checkbox", "select"]);

interface ElementDefinition {
  type: string;
  label: string;
  description: string;
  icon: string;
  tags: string[];
  isSmartSuggestion?: boolean;
}

// All available elements
const allElements: ElementDefinition[] = [
  {
    type: "input",
    label: "Text Input",
    description: "Single line text input",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="element-icon__svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>`,
    tags: ["text", "input", "field", "single", "line", "textfield"],
  },
  {
    type: "textarea",
    label: "Textarea",
    description: "Multi-line text area",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="element-icon__svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /></svg>`,
    tags: ["text", "area", "field", "multi", "line", "paragraph"],
  },
  {
    type: "checkbox",
    label: "Checkbox",
    description: "True/false selection",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="element-icon__svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`,
    tags: ["check", "box", "boolean", "toggle", "true", "false"],
  },
  {
    type: "select",
    label: "Dropdown",
    description: "Select from options",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="element-icon__svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>`,
    tags: ["dropdown", "select", "options", "menu", "choice"],
  },
  {
    type: "radio",
    label: "Radio Group",
    description: "Select one from multiple options",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="element-icon__svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    tags: ["radio", "button", "option", "exclusive", "choice"],
  },
  {
    type: "fieldset",
    label: "Fieldset",
    description: "Group related form elements",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="element-icon__svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>`,
    tags: ["group", "container", "section", "fieldset", "collection"],
  },
  {
    type: "button",
    label: "Button",
    description: "Clickable button element",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="element-icon__svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>`,
    tags: ["button", "submit", "action", "click"],
  },
];

// Intelligence - suggest based on existing form structure
const smartSuggestions = computed(() => {
  const elements = formBuilderStore.elements;
  const suggestions: ElementDefinition[] = [];

  // If form has name field but no email
  if (
    elements.some((e) => e.label?.toLowerCase().includes("name")) &&
    !elements.some((e) => e.label?.toLowerCase().includes("email"))
  ) {
    const inputIcon = allElements.find((e) => e.type === "input")?.icon || "";
    suggestions.push({
      type: "input",
      label: "Email Field",
      description: "Add email input for contact",
      icon: inputIcon,
      isSmartSuggestion: true,
      tags: ["email", "contact"],
    });
  }

  // If form has multiple fields but no submit button
  if (elements.length > 2 && !elements.some((e) => e.type === "button")) {
    const buttonIcon = allElements.find((e) => e.type === "button")?.icon || "";
    suggestions.push({
      type: "button",
      label: "Submit Button",
      description: "Add form submission button",
      icon: buttonIcon,
      isSmartSuggestion: true,
      tags: ["submit", "send", "finish"],
    });
  }

  return suggestions;
});

// Filtered elements based on search query
const filteredElements = computed(() => {
  if (!searchQuery.value.trim()) {
    // Show recents and smart suggestions when no search
    const recents = recentElements.value
      .map((type) => allElements.find((e) => e.type === type))
      .filter((e): e is ElementDefinition => e !== undefined);

    return [...smartSuggestions.value, ...recents];
  }

  const query = searchQuery.value.toLowerCase();

  // Full text search in type, label, description and tags
  return allElements.filter((element) => {
    return (
      element.type.includes(query) ||
      element.label.toLowerCase().includes(query) ||
      element.description.toLowerCase().includes(query) ||
      element.tags.some((tag) => tag.includes(query))
    );
  });
});

// Track insertion position and mode
const currentInsertPosition = ref<number | null>(null);
const insertMode = ref(false);
const currentFieldsetId = ref<string | null>(null);

// Define interface for command palette options
interface CommandPaletteOptions {
  insertPosition?: number;
  mode?: string;
  fieldsetId?: string;
}

// Open the command palette
function openCommandPalette(event?: MouseEvent): void;
function openCommandPalette(options?: CommandPaletteOptions): void;
function openCommandPalette(
  eventOrOptions?: MouseEvent | CommandPaletteOptions
): void {
  isVisible.value = true;
  searchQuery.value = "";
  selectedIndex.value = 0;

  // Check if the parameter is a CommandPaletteOptions object
  const options =
    eventOrOptions && !(eventOrOptions instanceof MouseEvent)
      ? (eventOrOptions as CommandPaletteOptions)
      : undefined;

  // Store insertion position if provided
  if (options?.insertPosition !== undefined) {
    currentInsertPosition.value = options.insertPosition;
    insertMode.value = options.mode === "insert";
    currentFieldsetId.value = options.fieldsetId || null;
  }

  // Focus the input after a short delay to ensure the component is rendered
  setTimeout(() => {
    const input = document.querySelector(".command-palette__input");
    if (input) {
      (input as HTMLInputElement).focus();
    }
  }, 50);
}

// Close the command palette
function closeCommandPalette() {
  isVisible.value = false;
}

// Handle keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  if (!isVisible.value) {
    // Check for command palette activation shortcut (Ctrl+K or /)
    if ((event.ctrlKey && event.key === "k") || event.key === "/") {
      event.preventDefault();
      openCommandPalette();
    }
    return;
  }

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      selectedIndex.value =
        (selectedIndex.value + 1) % filteredElements.value.length;
      break;
    case "ArrowUp":
      event.preventDefault();
      selectedIndex.value =
        selectedIndex.value <= 0
          ? filteredElements.value.length - 1
          : selectedIndex.value - 1;
      break;
    case "Enter":
      event.preventDefault();
      if (filteredElements.value[selectedIndex.value]) {
        insertElement(filteredElements.value[selectedIndex.value].type);
      }
      break;
    case "Escape":
      event.preventDefault();
      closeCommandPalette();
      break;
  }
}

// Insert the selected element type
function insertElement(elementType: string) {
  // Update recents list
  if (!recentElements.value.includes(elementType)) {
    recentElements.value.unshift(elementType);
    recentElements.value = recentElements.value.slice(0, 4); // Keep only 4 most recent
  } else {
    // Move to front if already exists
    recentElements.value = [
      elementType,
      ...recentElements.value.filter((type) => type !== elementType),
    ].slice(0, 4);
  }

  // Create the element
  const baseElementProps = {
    dataId: uuidv4(),
    label: `New ${elementType.charAt(0).toUpperCase() + elementType.slice(1)}`,
    required: false,
    order: 0,
    x: 20,
    y: 0,
  };

  let newElement: FormElement | null = null;

  // Create element based on type
  switch (elementType) {
    case "input":
      newElement = {
        ...baseElementProps,
        type: "input",
        placeholder: "Enter text",
        width: 250,
        height: 48,
      } as FormElement;
      break;
    case "textarea":
      newElement = {
        ...baseElementProps,
        type: "textarea",
        placeholder: "Enter text",
        rows: 4,
        width: 300,
        height: 120,
      } as FormElement;
      break;
    case "checkbox":
      newElement = {
        ...baseElementProps,
        type: "checkbox",
        checked: false,
        width: 200,
        height: 40,
      } as FormElement;
      break;
    case "select":
      newElement = {
        ...baseElementProps,
        type: "select",
        options: [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
        ],
        multiple: false,
        width: 250,
        height: 48,
      } as FormElement;
      break;
    case "radio":
      newElement = {
        ...baseElementProps,
        type: "radio",
        options: [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
        ],
        defaultValue: "option1",
        width: 250,
        height: 80,
      } as FormElement;
      break;
    case "fieldset":
      newElement = {
        ...baseElementProps,
        type: "fieldset",
        children: [],
        width: 400,
        height: 200,
      } as FormElement;
      break;
    case "button":
      newElement = {
        ...baseElementProps,
        type: "button",
        buttonType: "button",
        width: 150,
        height: 48,
      } as FormElement;
      break;
    default:
      // For other types, create a basic element
      newElement = {
        ...baseElementProps,
        type: "input", // Default to input as a fallback
        placeholder: "Enter text",
        width: 250,
        height: 48,
      } as FormElement;
  }

  if (newElement) {
    // Use the new store function for consistent positioning
    if (insertMode.value && currentInsertPosition.value !== null) {
      // Insert at specific position (root or fieldset)
      formBuilderStore.addElementAtPosition(
        newElement,
        currentInsertPosition.value,
        currentFieldsetId.value
      );
    } else {
      // Add at the end of the main canvas
      formBuilderStore.addElement(newElement);
    }

    // Select the new element
    formBuilderStore.selectElement(newElement.dataId);
  }

  // Reset insertion state
  currentInsertPosition.value = null;
  insertMode.value = false;
  currentFieldsetId.value = null;

  closeCommandPalette();
}

// Listen for custom event to open the command palette
onMounted(() => {
  window.addEventListener("keydown", handleKeydown);

  // Listen for the custom event from FormCanvas
  window.addEventListener("openCommandPalette", ((event: CustomEvent) => {
    const { insertPosition, mode, fieldsetId } = event.detail;
    openCommandPalette({ insertPosition, mode, fieldsetId });
  }) as EventListener);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("openCommandPalette", ((
    event: CustomEvent
  ) => {}) as EventListener);
});

// Add this function inside the script section
function handleInputKeydown(event: KeyboardEvent) {
  // Handle keydown events in the input field
  // This function is called for all keys except Escape
  // We're still forwarding the keyboard events to the main handler
  handleKeydown(event);
}
</script>

<template>
  <div>
    <!-- Command palette overlay -->
    <div
      v-if="isVisible"
      class="command-palette-overlay"
      @click="closeCommandPalette"
    >
      <div class="command-palette" @click.stop>
        <div class="command-palette__header">
          <div class="command-palette__search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            class="command-palette__input"
            v-model="searchQuery"
            placeholder="Search elements or type a command..."
          />
          <div class="command-palette__shortcuts">
            <span class="shortcut">
              <kbd>↑</kbd><kbd>↓</kbd>
              <span>to navigate</span>
            </span>
            <span class="shortcut">
              <kbd>Enter</kbd>
              <span>to select</span>
            </span>
            <span class="shortcut">
              <kbd>Esc</kbd>
              <span>to close</span>
            </span>
          </div>
        </div>

        <div class="command-palette__results">
          <div
            v-if="smartSuggestions.length && !searchQuery"
            class="command-palette__group"
          >
            <div class="command-palette__group-title">Suggestions</div>
            <div
              v-for="(element, index) in smartSuggestions"
              :key="`smart-${index}`"
              class="command-palette__item"
              :class="{
                'is-selected':
                  filteredElements.indexOf(element) === selectedIndex,
              }"
              @click="insertElement(element.type)"
              @mouseenter="selectedIndex = filteredElements.indexOf(element)"
            >
              <div
                class="command-palette__item-icon"
                v-html="element.icon"
              ></div>
              <div class="command-palette__item-content">
                <div class="command-palette__item-title">
                  {{ element.label }}
                </div>
                <div class="command-palette__item-description">
                  {{ element.description }}
                </div>
              </div>
              <div class="command-palette__item-badge">Smart</div>
            </div>
          </div>

          <div class="command-palette__group">
            <div class="command-palette__group-title" v-if="!searchQuery">
              Recent Elements
            </div>
            <div class="command-palette__group-title" v-else>
              Search Results
            </div>

            <div
              v-for="(element, index) in filteredElements.filter(
                (e) => !e.isSmartSuggestion
              )"
              :key="`element-${index}`"
              class="command-palette__item"
              :class="{
                'is-selected':
                  filteredElements.indexOf(element) === selectedIndex,
              }"
              @click="insertElement(element.type)"
              @mouseenter="selectedIndex = filteredElements.indexOf(element)"
            >
              <div
                class="command-palette__item-icon"
                v-html="element.icon"
              ></div>
              <div class="command-palette__item-content">
                <div class="command-palette__item-title">
                  {{ element.label }}
                </div>
                <div class="command-palette__item-description">
                  {{ element.description }}
                </div>
              </div>
            </div>

            <div
              v-if="filteredElements.length === 0"
              class="command-palette__empty"
            >
              No elements found matching "{{ searchQuery }}"
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/abstracts" as *;

.command-palette-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fade-in 0.2s ease;
}

.command-palette {
  width: 600px;
  max-width: 90vw;
  max-height: 70vh;
  background-color: var(--theme-bg-surface);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  animation: scale-in 0.2s ease;

  &__header {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--theme-border);
    position: relative;
  }

  &__search-icon {
    color: var(--theme-text-muted);
    margin-right: 12px;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &__input {
    flex: 1;
    background: none;
    border: none;
    color: var(--theme-text);
    font-size: 16px;
    outline: none;
    padding: 0;

    &::placeholder {
      color: var(--theme-text-muted);
    }
  }

  &__shortcuts {
    display: flex;
    gap: 12px;
    margin-left: 12px;

    .shortcut {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--theme-text-muted);
      font-size: 12px;

      kbd {
        background: var(--theme-bg-alt);
        border: 1px solid var(--theme-border);
        border-radius: 4px;
        padding: 2px 5px;
        font-family: inherit;
        font-size: 11px;
        color: var(--theme-text);
      }

      span {
        font-size: 11px;
      }
    }
  }

  &__results {
    flex: 1;
    overflow-y: auto;
    max-height: calc(70vh - 70px);
  }

  &__group {
    padding: 8px;

    &-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--theme-text-muted);
      padding: 8px 8px 4px 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 12px;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.15s;

    &:hover,
    &.is-selected {
      background-color: var(--theme-bg-alt);
    }

    &-icon {
      width: 32px;
      height: 32px;
      margin-right: 12px;
      color: var(--theme-primary);
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 24px;
        height: 24px;
        stroke: currentColor;
      }
    }

    &-content {
      flex: 1;
      min-width: 0;
    }

    &-title {
      font-weight: 500;
      color: var(--theme-text);
      margin-bottom: 2px;
    }

    &-description {
      font-size: 13px;
      color: var(--theme-text-muted);
    }

    &-badge {
      background-color: var(--theme-primary);
      color: white;
      font-size: 11px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 10px;
      margin-left: 12px;
    }
  }

  &__empty {
    padding: 24px;
    text-align: center;
    color: var(--theme-text-muted);
    font-style: italic;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scale-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
