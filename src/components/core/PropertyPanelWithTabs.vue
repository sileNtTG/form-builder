<script setup lang="ts">
import { computed, ref } from "vue";
import { useFormBuilderStore } from "@/stores/formBuilder";
import { SvgIcon } from "@/components/common";
import TreeView from "./TreeView.vue";

const formBuilderStore = useFormBuilderStore();
const selectedElement = computed(() => formBuilderStore.selectedElement);

// Tab management
const activeTab = ref("structure");

const tabs = [
  { id: "properties", label: "Properties", icon: "settings" },
  { id: "structure", label: "Structure", icon: "folder" },
];

function setActiveTab(tabId: string) {
  activeTab.value = tabId;
}

// Handle updates to the selected element
function updateElementProperty(key: string, value: unknown) {
  if (selectedElement.value) {
    formBuilderStore.updateElementProperty(
      selectedElement.value.dataId,
      key,
      value
    );
  }
}

// Delete element
function deleteElement() {
  if (!selectedElement.value) return;
  formBuilderStore.removeElement(selectedElement.value.dataId);
}
</script>

<template>
  <div class="property-panel">
    <!-- Tab Navigation -->
    <div class="property-panel__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-button"
        :class="{ 'tab-button--active': activeTab === tab.id }"
        @click="setActiveTab(tab.id)"
      >
        <SvgIcon :name="tab.icon" :size="16" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="property-panel__content">
      <!-- Structure Tab -->
      <div v-if="activeTab === 'structure'" class="tab-content">
        <TreeView />
      </div>

      <!-- Properties Tab -->
      <div v-else-if="activeTab === 'properties'" class="tab-content">
        <div v-if="!selectedElement" class="property-panel__empty">
          <div class="property-panel__empty-icon">
            <SvgIcon name="info" :size="32" />
          </div>
          <div class="property-panel__empty-text">
            Select an element to edit its properties
          </div>
        </div>

        <div v-else class="properties-content">
          <!-- Basic Element Info -->
          <div class="property-section">
            <h3 class="property-section__title">General</h3>
            <div class="property-fields">
              <div class="form-field">
                <label class="form-field__label">Label</label>
                <input
                  type="text"
                  class="form-field__input"
                  :value="selectedElement.label"
                  @input="
                    updateElementProperty(
                      'label',
                      ($event.target as HTMLInputElement).value
                    )
                  "
                />
              </div>

              <div class="form-field form-field--checkbox">
                <input
                  type="checkbox"
                  id="required-field"
                  class="form-field__checkbox"
                  :checked="selectedElement.required"
                  @change="
                    updateElementProperty(
                      'required',
                      ($event.target as HTMLInputElement).checked
                    )
                  "
                />
                <label for="required-field" class="form-field__checkbox-label">
                  Required field
                </label>
              </div>
            </div>
          </div>

          <!-- Layout Properties -->
          <div class="property-section">
            <h3 class="property-section__title">Layout</h3>
            <div class="property-fields">
              <div class="form-field-row">
                <div class="form-field form-field--half">
                  <label class="form-field__label">Width</label>
                  <input
                    type="number"
                    class="form-field__input"
                    :value="selectedElement.width"
                    @input="
                      updateElementProperty(
                        'width',
                        Number(($event.target as HTMLInputElement).value)
                      )
                    "
                    min="50"
                  />
                </div>
                <div class="form-field form-field--half">
                  <label class="form-field__label">Height</label>
                  <input
                    type="number"
                    class="form-field__input"
                    :value="selectedElement.height"
                    @input="
                      updateElementProperty(
                        'height',
                        Number(($event.target as HTMLInputElement).value)
                      )
                    "
                    min="20"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Delete Button -->
          <div class="property-panel__actions">
            <button type="button" class="delete-button" @click="deleteElement">
              <SvgIcon name="trash" :size="18" />
              <span>Delete Element</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/abstracts" as *;

.property-panel {
  background-color: var(--theme-bg-surface);
  border-left: 1px solid var(--theme-border);
  display: flex;
  flex-direction: column;
  width: 280px;
  color: var(--theme-text);
  @include text-small;

  &__tabs {
    display: flex;
    border-bottom: 1px solid var(--theme-border);
    background-color: var(--theme-bg-alt);
  }

  &__content {
    flex: 1;
    overflow-y: auto;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    padding: $spacing-lg;
    text-align: center;

    &-icon {
      width: 80px;
      height: 80px;
      margin-bottom: $spacing-lg;
      color: var(--theme-text-muted);
      opacity: 0.5;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    &-text {
      @include text-small;
      color: var(--theme-text-muted);
      font-style: italic;
      max-width: 200px;
      line-height: 1.4;
    }
  }

  &__actions {
    padding: $spacing-lg;
    border-top: 1px solid var(--theme-border);
  }
}

.tab-button {
  flex: 1;
  background: none;
  border: none;
  padding: $spacing-sm $spacing-md;
  color: var(--theme-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  @include transition(all, $transition-fast);
  border-bottom: 2px solid transparent;

  &:hover {
    background-color: var(--theme-bg-hover);
    color: var(--theme-text);
  }

  &--active {
    color: var(--theme-primary);
    border-bottom-color: var(--theme-primary);
    background-color: var(--theme-bg-surface);
  }

  span {
    @include text-small;
    font-weight: 500;
  }
}

.tab-content {
  height: 100%;
}

.properties-content {
  padding: $spacing-lg;
}

.property-section {
  margin-bottom: $spacing-lg;
  background-color: var(--theme-bg-alt);
  border-radius: $border-radius-lg;
  overflow: hidden;

  &__title {
    @include text-small;
    font-weight: 600;
    color: var(--theme-text);
    margin: 0;
    padding: $spacing-sm $spacing-md;
    background: rgba(0, 0, 0, 0.15);
    border-bottom: 1px solid var(--theme-border);
  }
}

.property-fields {
  padding: $spacing-md;
}

.form-field {
  margin-bottom: $spacing-md;

  &:last-child {
    margin-bottom: 0;
  }

  &__label {
    display: block;
    @include text-xs;
    color: var(--theme-text-muted);
    margin-bottom: $spacing-xs;
  }

  &__input {
    width: 100%;
    padding: $spacing-sm;
    border: 1px solid var(--theme-border);
    background-color: var(--theme-bg-surface);
    color: var(--theme-text);
    border-radius: $border-radius;
    @include text-small;
    @include transition(border-color, $transition-fast);

    &:focus {
      outline: none;
      border-color: var(--theme-primary);
    }
  }

  &--checkbox {
    display: flex;
    align-items: center;
    margin-top: $spacing-sm;
  }

  &__checkbox {
    margin: 0;
    margin-right: $spacing-sm;
    accent-color: var(--theme-primary);
  }

  &__checkbox-label {
    @include text-small;
    color: var(--theme-text);
  }

  &--half {
    width: calc(50% - #{$spacing-xs});
  }
}

.form-field-row {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  background-color: rgba(255, 87, 87, 0.1);
  border: 1px solid rgba(255, 87, 87, 0.3);
  color: #ff5757;
  padding: $spacing-sm $spacing-lg;
  @include text-small;
  border-radius: $border-radius;
  cursor: pointer;
  @include transition(all, $transition-fast);
  width: 100%;

  svg {
    stroke-width: 2;
  }

  &:hover {
    background-color: rgba(255, 87, 87, 0.2);
    border-color: rgba(255, 87, 87, 0.5);
  }
}
</style>
