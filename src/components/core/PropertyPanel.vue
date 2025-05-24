<script setup lang="ts">
import { computed, watch, ref } from "vue";
import { useFormBuilderStore } from "@/stores/formBuilder";
import type {
  FormElement,
  FormElementOption,
  SelectOption,
  RadioElementOption,
} from "@/models/FormElement";
import { SvgIcon } from "@/components/common";

const formBuilderStore = useFormBuilderStore();
const selectedElement = computed(() => formBuilderStore.selectedElement);

// Handle updates to the selected element
function updateElementProperty(
  key: string,
  value: string | number | boolean | null
) {
  if (selectedElement.value) {
    formBuilderStore.updateElementProperty(
      selectedElement.value.dataId,
      key,
      value
    );
  }
}

// Special handler for options (select, radio)
function updateElementOptions(options: FormElementOption[]) {
  if (!selectedElement.value) return;
  formBuilderStore.updateElementProperty(
    selectedElement.value.dataId,
    "options",
    options as any
  );
}

// Delete element
function deleteElement() {
  if (!selectedElement.value) return;
  formBuilderStore.removeElement(selectedElement.value.dataId);
}

// Options management for select/radio elements
const tempOptions = ref<FormElementOption[]>([]);

// Initialize tempOptions when the selected element changes
watch(
  selectedElement,
  (newVal) => {
    if (newVal && (newVal.type === "select" || newVal.type === "radio")) {
      tempOptions.value = [...(newVal.options || [])] as FormElementOption[];
    } else {
      tempOptions.value = [];
    }
  },
  { immediate: true }
);

// Add a new option
function addOption() {
  const newOption = {
    value: `option${tempOptions.value.length + 1}`,
    label: `Option ${tempOptions.value.length + 1}`,
  };
  tempOptions.value.push(newOption);
  updateElementOptions([...tempOptions.value]);
}

// Update an option at a specific index
function updateOption(index: number, key: string, value: string) {
  if (index < 0 || index >= tempOptions.value.length) return;
  tempOptions.value[index][key] = value;
  updateElementOptions([...tempOptions.value]);
}

// Remove an option at a specific index
function removeOption(index: number) {
  if (index < 0 || index >= tempOptions.value.length) return;
  tempOptions.value.splice(index, 1);
  updateElementOptions([...tempOptions.value]);
}
</script>

<template>
  <div class="property-panel">
    <div v-if="!selectedElement" class="property-panel__empty">
      <div class="property-panel__empty-icon">
        <SvgIcon name="info" :size="32" />
      </div>
      <div class="property-panel__empty-text">
        Wähle ein Element aus, um seine Eigenschaften zu bearbeiten
      </div>
    </div>

    <div v-else class="property-panel__content">
      <!-- General Properties Section -->
      <div class="property-section">
        <h3 class="property-section__title">General</h3>
        <div class="property-fields">
          <!-- Label Field -->
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

          <!-- Required Field -->
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
            <label for="required-field" class="form-field__checkbox-label"
              >Required field</label
            >
          </div>
        </div>
      </div>

      <!-- Type-specific Properties -->
      <div v-if="selectedElement.type === 'text'" class="property-section">
        <h3 class="property-section__title">Text Input Properties</h3>
        <div class="property-fields">
          <!-- Placeholder Field -->
          <div class="form-field">
            <label class="form-field__label">Placeholder</label>
            <input
              type="text"
              class="form-field__input"
              :value="(selectedElement as any).placeholder"
              @input="
                updateElementProperty(
                  'placeholder',
                  ($event.target as HTMLInputElement).value
                )
              "
            />
          </div>

          <!-- Min/Max Length Fields -->
          <div class="form-field-row">
            <div class="form-field form-field--half">
              <label class="form-field__label">Min Length</label>
              <input
                type="number"
                class="form-field__input"
                :value="(selectedElement as any).minLength"
                @input="
                  updateElementProperty(
                    'minLength',
                    Number(($event.target as HTMLInputElement).value)
                  )
                "
                min="0"
              />
            </div>
            <div class="form-field form-field--half">
              <label class="form-field__label">Max Length</label>
              <input
                type="number"
                class="form-field__input"
                :value="(selectedElement as any).maxLength"
                @input="
                  updateElementProperty(
                    'maxLength',
                    Number(($event.target as HTMLInputElement).value)
                  )
                "
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="selectedElement.type === 'textarea'"
        class="property-section"
      >
        <h3 class="property-section__title">Textarea Properties</h3>
        <div class="property-fields">
          <!-- Placeholder Field -->
          <div class="form-field">
            <label class="form-field__label">Placeholder</label>
            <input
              type="text"
              class="form-field__input"
              :value="(selectedElement as any).placeholder"
              @input="
                updateElementProperty(
                  'placeholder',
                  ($event.target as HTMLInputElement).value
                )
              "
            />
          </div>

          <!-- Rows Field -->
          <div class="form-field">
            <label class="form-field__label">Rows</label>
            <input
              type="number"
              class="form-field__input"
              :value="(selectedElement as any).rows"
              @input="
                updateElementProperty(
                  'rows',
                  Number(($event.target as HTMLInputElement).value)
                )
              "
              min="2"
            />
          </div>
        </div>
      </div>

      <div
        v-else-if="selectedElement.type === 'checkbox'"
        class="property-section"
      >
        <h3 class="property-section__title">Checkbox Properties</h3>
        <div class="property-fields">
          <!-- Default Checked -->
          <div class="form-field form-field--checkbox">
            <input
              type="checkbox"
              id="default-checked"
              class="form-field__checkbox"
              :checked="(selectedElement as any).checked"
              @change="
                updateElementProperty(
                  'checked',
                  ($event.target as HTMLInputElement).checked
                )
              "
            />
            <label for="default-checked" class="form-field__checkbox-label"
              >Default checked</label
            >
          </div>
        </div>
      </div>

      <div
        v-else-if="
          selectedElement.type === 'select' || selectedElement.type === 'radio'
        "
        class="property-section"
      >
        <h3 class="property-section__title">
          {{ selectedElement.type === "select" ? "Dropdown" : "Radio Group" }}
          Options
        </h3>
        <div class="property-fields">
          <!-- Options List -->
          <div class="options-list">
            <div
              v-for="(option, index) in tempOptions"
              :key="index"
              class="option-item"
            >
              <div class="option-item__fields">
                <input
                  type="text"
                  class="form-field__input option-item__input"
                  :value="option.label"
                  @input="
                    updateOption(
                      index,
                      'label',
                      ($event.target as HTMLInputElement).value
                    )
                  "
                  placeholder="Label"
                />
                <input
                  type="text"
                  class="form-field__input option-item__input"
                  :value="option.value"
                  @input="
                    updateOption(
                      index,
                      'value',
                      ($event.target as HTMLInputElement).value
                    )
                  "
                  placeholder="Value"
                />
              </div>
              <button
                type="button"
                class="option-item__remove"
                @click="removeOption(index)"
                title="Remove option"
              >
                <SvgIcon name="x" :size="16" />
              </button>
            </div>
            <button type="button" class="add-option-btn" @click="addOption">
              <SvgIcon name="plus" :size="16" />
              <span>Add Option</span>
            </button>
          </div>

          <div v-if="selectedElement.type === 'radio'" class="form-field">
            <label class="form-field__label">Default Value</label>
            <select
              class="form-field__select"
              :value="selectedElement.defaultValue"
              @change="
                updateElementProperty(
                  'defaultValue',
                  ($event.target as HTMLSelectElement).value
                )
              "
            >
              <option value="">None</option>
              <option
                v-for="option in tempOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div
        v-else-if="selectedElement.type === 'button'"
        class="property-section"
      >
        <h3 class="property-section__title">Button Properties</h3>
        <div class="property-fields">
          <!-- Button Type -->
          <div class="form-field">
            <label class="form-field__label">Button Type</label>
            <select
              class="form-field__select"
              :value="selectedElement.buttonType || 'button'"
              @change="
                updateElementProperty(
                  'buttonType',
                  ($event.target as HTMLSelectElement).value
                )
              "
            >
              <option value="button">Button</option>
              <option value="submit">Submit</option>
              <option value="reset">Reset</option>
            </select>
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
</template>

<style lang="scss" scoped>
.property-panel {
  background-color: var(--theme-bg-surface, #232834);
  border-left: 1px solid var(--theme-border, #3a3f4a);
  display: flex;
  flex-direction: column;
  width: 280px;
  color: var(--theme-text, #fff);
  font-size: 0.9rem;

  &__header {
    padding: 0.7rem 1rem;
    border-bottom: 1px solid var(--theme-border, #3a3f4a);
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(to right, #2c313c, #343b48);

    h3 {
      margin: 0;
      font-size: 1rem;
    }

    .type-badge {
      font-size: 0.7rem;
      background-color: var(--theme-primary, #1abc9c);
      color: white;
      padding: 0.1rem 0.4rem;
      border-radius: 3px;
      font-weight: 500;
      text-transform: capitalize;
    }
  }

  &__content {
    padding: 0.8rem;
    overflow-y: auto;
    flex: 1;

    .property-group {
      margin-bottom: 0.8rem;

      &__header {
        font-weight: 600;
        font-size: 0.8rem;
        margin-bottom: 0.4rem;
        color: var(--theme-text-muted, #999);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding-bottom: 0.2rem;
        border-bottom: 1px solid var(--theme-border, #3a3f4a);
      }

      &__fields {
        display: grid;
        gap: 0.6rem;
      }
    }

    .field-row {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;

      &.inline {
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;

        label {
          flex: 0 0 auto;
          margin-bottom: 0;
        }

        .field-input {
          flex: 1;
        }
      }

      label {
        font-size: 0.8rem;
        margin-bottom: 0.1rem;
        color: var(--theme-text, #fff);
      }

      .field-input {
        input,
        select,
        textarea {
          width: 100%;
          padding: 0.3rem 0.5rem;
          background-color: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--theme-border, #3a3f4a);
          border-radius: 3px;
          color: var(--theme-text, #fff);
          font-size: 0.85rem;
          transition: border-color 0.2s;

          &:focus {
            border-color: var(--theme-primary, #1abc9c);
            outline: none;
          }
        }

        textarea {
          min-height: 5rem;
          resize: vertical;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 0.4rem;

          input[type="checkbox"] {
            accent-color: var(--theme-primary, #1abc9c);
            width: 0.9rem;
            height: 0.9rem;
          }
        }
      }
    }

    .options-section {
      margin-top: 0.5rem;

      .option-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.4rem;

        h4 {
          margin: 0;
          font-size: 0.85rem;
        }

        button {
          background: var(--theme-primary, #1abc9c);
          color: white;
          border: none;
          border-radius: 3px;
          padding: 0.2rem 0.4rem;
          font-size: 0.7rem;
          cursor: pointer;
          transition: background-color 0.2s;

          &:hover {
            background-color: color.adjust(#1abc9c, $lightness: -10%);
          }
        }
      }

      .option-item {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        align-items: center;

        input {
          flex: 1;
        }

        button {
          background: transparent;
          color: var(--theme-text-muted, #999);
          border: none;
          padding: 0.2rem;
          cursor: pointer;
          font-size: 0.8rem;
          border-radius: 3px;

          &:hover {
            color: #e74c3c;
            background: rgba(231, 76, 60, 0.1);
          }
        }
      }
    }
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 1rem;
    text-align: center;

    &-icon {
      width: 80px;
      height: 80px;
      margin-bottom: 1rem;
      color: var(--theme-text-muted, #999);
      opacity: 0.5;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    &-text {
      font-size: 0.9rem;
      color: var(--theme-text-muted, #999);
      font-style: italic;
      max-width: 200px;
      line-height: 1.4;
    }
  }

  &__no-selection {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
    color: var(--theme-text-muted, #999);
    font-style: italic;
    padding: 1rem;
    text-align: center;
  }
}

.property-section {
  margin-bottom: 1rem;
  background-color: var(--theme-bg-alt);
  border-radius: 8px;
  overflow: hidden;

  &__title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--theme-text);
    margin: 0;
    padding: 0.5rem 0.75rem;
    background: rgba(0, 0, 0, 0.15);
    border-bottom: 1px solid var(--theme-border);
  }
}

.property-fields {
  padding: 0.75rem;
}

.form-field {
  margin-bottom: 0.6rem;

  &:last-child {
    margin-bottom: 0;
  }

  &__label {
    display: block;
    font-size: 0.8rem;
    color: var(--theme-text-muted);
    margin-bottom: 0.25rem;
  }

  &__input,
  &__select {
    width: 100%;
    padding: 0.4rem 0.5rem;
    border: 1px solid var(--theme-border);
    background-color: var(--theme-bg-surface);
    color: var(--theme-text);
    border-radius: 4px;
    font-size: 0.9rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: var(--theme-primary);
    }
  }

  &--checkbox {
    display: flex;
    align-items: center;
    margin-top: 0.3rem;
  }

  &__checkbox {
    margin: 0;
    margin-right: 0.5rem;
    accent-color: var(--theme-primary);
  }

  &__checkbox-label {
    font-size: 0.85rem;
    color: var(--theme-text);
  }

  &--half {
    width: calc(50% - 0.25rem);
  }
}

.form-field-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &__fields {
    flex: 1;
    display: flex;
    gap: 0.5rem;
  }

  &__input {
    margin-bottom: 0;
  }

  &__remove {
    background: none;
    border: none;
    color: var(--theme-text-muted);
    padding: 0.25rem;
    cursor: pointer;
    display: flex;
    border-radius: 4px;

    &:hover {
      color: #ff5757;
      background: rgba(255, 87, 87, 0.1);
    }

    svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      stroke-width: 2;
    }
  }
}

.add-option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px dashed var(--theme-border);
  padding: 0.4rem;
  color: var(--theme-text-muted);
  border-radius: 4px;
  cursor: pointer;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.25rem;
  transition: all 0.2s;

  svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2;
  }

  span {
    font-size: 0.85rem;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--theme-primary);
    border-color: var(--theme-primary);
  }
}

.delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: rgba(255, 87, 87, 0.1);
  border: 1px solid rgba(255, 87, 87, 0.3);
  color: #ff5757;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2;
  }

  &:hover {
    background-color: rgba(255, 87, 87, 0.2);
    border-color: rgba(255, 87, 87, 0.5);
  }
}
</style>
