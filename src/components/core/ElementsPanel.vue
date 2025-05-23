<script setup lang="ts">
import { ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useFormBuilderStore } from "@/stores/formBuilder";
import type { FormElement } from "@/models/FormElement";
import { SvgIcon, ElementIcon } from "@/components/common";

const formBuilderStore = useFormBuilderStore();
const searchQuery = ref("");
const activeCategory = ref("all");

// Categories
const categories = [
  { id: "all", label: "Alle" },
  { id: "basic", label: "Basis" },
  { id: "advanced", label: "Erweitert" },
  { id: "layout", label: "Layout" },
];

// All element definitions with category information
const elementDefinitions = [
  {
    type: "input",
    category: "basic",
    label: "Text Input",
    description: "Einfaches Textfeld",
  },
  {
    type: "textarea",
    category: "basic",
    label: "Textbereich",
    description: "Mehrzeiliges Textfeld",
  },
  {
    type: "checkbox",
    category: "basic",
    label: "Checkbox",
    description: "Ja/Nein Auswahl",
  },
  {
    type: "select",
    category: "advanced",
    label: "Dropdown",
    description: "Auswahl aus einer Liste",
  },
  {
    type: "radio",
    category: "advanced",
    label: "Radio Gruppe",
    description: "Einzelauswahl",
  },
  {
    type: "fieldset",
    category: "layout",
    label: "Gruppe",
    description: "Gruppieren von Elementen",
  },
  {
    type: "button",
    category: "basic",
    label: "Button",
    description: "Klickbarer Button",
  },
];

// Filtered elements based on search and category
const filteredElements = computed(() => {
  let result = elementDefinitions;

  // Filter by category
  if (activeCategory.value !== "all") {
    result = result.filter((elem) => elem.category === activeCategory.value);
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (elem) =>
        elem.label.toLowerCase().includes(query) ||
        elem.description.toLowerCase().includes(query) ||
        elem.type.toLowerCase().includes(query)
    );
  }

  return result;
});

// Insert element directly (without drag)
function insertElement(elementType: string) {
  // Create the element
  const baseElementProps = {
    id: uuidv4(),
    label: `Neues ${
      elementType.charAt(0).toUpperCase() + elementType.slice(1)
    }`,
    required: false,
    order: 0,
    x: 20,
    y: 20,
  };

  let newElement: FormElement | null = null;

  // Create element based on type
  switch (elementType) {
    case "input":
      newElement = {
        ...baseElementProps,
        type: "input",
        placeholder: "Text eingeben",
        width: 250,
        height: 48,
      } as FormElement;
      break;
    case "textarea":
      newElement = {
        ...baseElementProps,
        type: "textarea",
        placeholder: "Text eingeben",
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
  }

  if (newElement) {
    // Add the element
    formBuilderStore.addElement(newElement);
    // Select the new element
    formBuilderStore.selectElement(newElement.id);
  }
}

// Start drag for an element
function startDrag(event: DragEvent, elementType: string) {
  if (event.dataTransfer) {
    formBuilderStore.setDragging(true);
    // Setze die Drag-Operation
    event.dataTransfer.effectAllowed = "copy";

    // Konsistente MIME-Typen für Drag & Drop
    try {
      // Hauptformat: text/plain (am besten unterstützt)
      event.dataTransfer.setData("text/plain", elementType);

      // Zusätzliche Backup-Formate für mehr Kompatibilität
      event.dataTransfer.setData("application/element-type", elementType);
      event.dataTransfer.setData("text", elementType);
    } catch (e) {
      console.error("Fehler beim Setzen der Drag-Daten:", e);
      // Einfacher Fallback
      event.dataTransfer.setData("text", elementType);
    }

    // Visuelles Feedback für den Benutzer
    const elementCard = event.currentTarget as HTMLElement;
    if (elementCard) {
      // Klone die Karte für ein besseres Drag-Bild
      elementCard.classList.add("dragging");

      // Ein besseres Drag-Image erstellen
      const cardClone = elementCard.cloneNode(true) as HTMLElement;
      cardClone.style.transform = "scale(0.8)";
      cardClone.style.opacity = "0.8";
      cardClone.style.position = "absolute";
      cardClone.style.top = "-1000px";
      cardClone.style.left = "-1000px";
      cardClone.style.zIndex = "9999";
      cardClone.style.boxShadow = "0 5px 10px rgba(0,0,0,0.5)";
      cardClone.style.border = "1px solid #1abc9c";

      document.body.appendChild(cardClone);

      // Setze das Drag-Image mit passendem Offset
      event.dataTransfer.setDragImage(cardClone, 20, 20);

      // Entferne das Element nach kurzer Verzögerung
      setTimeout(() => {
        document.body.removeChild(cardClone);
      }, 100);

      // Event, um Drag-End zu verarbeiten
      const handleDragEnd = () => {
        elementCard.classList.remove("dragging");
        formBuilderStore.setDragging(false);
        document.removeEventListener("dragend", handleDragEnd);
      };

      document.addEventListener("dragend", handleDragEnd);
    }
  }
}
</script>

<template>
  <div class="elements-panel">
    <div class="elements-panel__header">
      <h2 class="elements-panel__title">Formular Elemente</h2>
      <div class="elements-panel__search">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Elemente suchen..."
          class="elements-panel__search-input"
        />
        <SvgIcon
          v-if="!searchQuery"
          name="search"
          :size="14"
          class="elements-panel__search-icon"
        />
        <button
          v-else
          class="elements-panel__search-clear"
          @click="searchQuery = ''"
        >
          <SvgIcon name="x" :size="14" />
        </button>
      </div>
    </div>

    <div class="elements-panel__categories">
      <button
        v-for="category in categories"
        :key="category.id"
        class="category-button"
        :class="{ active: activeCategory === category.id }"
        @click="activeCategory = category.id"
      >
        {{ category.label }}
      </button>
    </div>

    <div class="elements-panel__content">
      <div
        v-for="element in filteredElements"
        :key="element.type"
        class="element-card"
        draggable="true"
        @dragstart="startDrag($event, element.type)"
        @click="insertElement(element.type)"
      >
        <div class="element-card__icon">
          <ElementIcon :type="element.type" :size="32" />
        </div>
        <div class="element-card__content">
          <div class="element-card__title">{{ element.label }}</div>
          <div class="element-card__description">{{ element.description }}</div>
        </div>
        <div class="element-card__actions">
          <div class="drag-handle" title="Ziehen zum Hinzufügen">
            <SvgIcon name="menu" :size="16" />
          </div>
        </div>
      </div>

      <div v-if="filteredElements.length === 0" class="elements-panel__empty">
        <SvgIcon name="sad-face" :size="40" />
        <span>Keine Elemente gefunden</span>
        <button
          @click="
            searchQuery = '';
            activeCategory = 'all';
          "
        >
          Filter zurücksetzen
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.elements-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--theme-bg-surface);
  color: var(--theme-text);

  &__header {
    padding: 1rem 1.2rem 0.8rem;
    border-bottom: 1px solid var(--theme-border);
  }

  &__title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.8rem 0;
    color: var(--theme-text);
  }

  &__search {
    position: relative;

    &-input {
      width: 100%;
      padding: 0.6rem 0.6rem 0.6rem 2rem;
      background-color: var(--theme-bg-alt);
      border: 1px solid var(--theme-border);
      border-radius: 6px;
      color: var(--theme-text);
      font-size: 0.85rem;

      &:focus {
        outline: none;
        border-color: var(--theme-primary);
        box-shadow: 0 0 0 2px rgba(26, 188, 156, 0.25);
      }

      &::placeholder {
        color: var(--theme-text-muted);
      }
    }

    &-icon {
      position: absolute;
      left: 0.6rem;
      top: 50%;
      transform: translateY(-50%);
      width: 0.9rem;
      height: 0.9rem;
      stroke: var(--theme-text-muted);
      fill: none;
      stroke-width: 2;
    }

    &-clear {
      position: absolute;
      right: 0.6rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;

      svg {
        width: 100%;
        height: 100%;
        stroke: var(--theme-text-muted);
        fill: none;
        stroke-width: 2;
      }

      &:hover svg {
        stroke: var(--theme-text);
      }
    }
  }

  &__categories {
    display: flex;
    padding: 0.5rem 0.8rem;
    border-bottom: 1px solid var(--theme-border);
    background-color: var(--theme-bg-alt);
    overflow-x: auto;

    &::-webkit-scrollbar {
      height: 3px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--theme-border);
      border-radius: 4px;
    }

    .category-button {
      flex: 0 0 auto;
      padding: 0.3rem 0.6rem;
      background: none;
      border: none;
      border-radius: 4px;
      color: var(--theme-text-muted);
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;

      &:hover {
        color: var(--theme-text);
        background-color: rgba(255, 255, 255, 0.05);
      }

      &.active {
        background-color: var(--theme-primary);
        color: white;
      }
    }
  }

  &__content {
    flex: 1;
    padding: 0.8rem;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.8rem;
    align-content: start;
  }

  &__empty {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    color: var(--theme-text-muted);

    svg {
      width: 2.5rem;
      height: 2.5rem;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.5;
      margin-bottom: 0.8rem;
    }

    span {
      font-size: 0.9rem;
      margin-bottom: 0.8rem;
    }

    button {
      background: none;
      border: 1px solid var(--theme-border);
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      color: var(--theme-text);
      cursor: pointer;
      font-size: 0.8rem;

      &:hover {
        background-color: var(--theme-bg-alt);
        border-color: var(--theme-primary);
      }
    }
  }
}

.element-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  background-color: var(--theme-bg-alt);
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &::after {
    content: "Hinzufügen";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(26, 188, 156, 0.9);
    color: white;
    font-weight: 500;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: var(--theme-primary, #1abc9c);

    &::after {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &__icon {
    flex: 0 0 auto;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--theme-primary, #1abc9c);

    svg {
      width: 100%;
      height: 100%;
      stroke-width: 1.5;
    }
  }

  &__content {
    flex: 1;
  }

  &__title {
    font-weight: 500;
    margin-bottom: 0.2rem;
    font-size: 0.9rem;
    color: var(--theme-text);
  }

  &__description {
    font-size: 0.8rem;
    color: var(--theme-text-muted);
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.8rem;
  }

  &__drag-handle {
    cursor: move;
    color: var(--theme-text-muted);
    transition: color 0.2s;

    &:hover {
      color: var(--theme-text);
    }
  }
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  cursor: grab;
  color: var(--theme-text-muted);
  transition: color 0.2s;

  &:hover {
    color: var(--theme-primary);
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
}
</style>
