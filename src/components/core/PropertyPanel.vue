<script setup lang="ts">
import { computed } from "vue";
import { useFormBuilderStore } from "../../stores/formBuilder";
import Button from "../../components/common/Button.vue";

const formBuilderStore = useFormBuilderStore();
const selectedElement = computed(() => formBuilderStore.selectedElement);

const updateProperty = (property: string, value: any) => {
  if (!selectedElement.value) return;

  const updates = { [property]: value };
  formBuilderStore.updateElement(selectedElement.value.id, updates);
};

const handleInputValue = (event: Event, propertyName: string) => {
  const target = event.target as HTMLInputElement | null;
  if (target) {
    updateProperty(propertyName, target.value);
  }
};

const handleNumberInputValue = (event: Event, propertyName: string) => {
  const target = event.target as HTMLInputElement | null;
  if (target) {
    const numValue = Number(target.value);
    if (!isNaN(numValue)) {
      updateProperty(propertyName, numValue);
    }
  }
};

const handleCheckboxChange = (event: Event, propertyName: string) => {
  const target = event.target as HTMLInputElement | null;
  if (target) {
    updateProperty(propertyName, target.checked);
  }
};
</script>

<template>
  <div class="panel panel-properties">
    <h2 class="panel-properties__header-title">
      <svg
        class="panel-properties__icon"
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
      Properties
    </h2>

    <div v-if="selectedElement" class="panel-properties__body panel-scroll">
      <div class="property-group">
        <h3 class="property-group__title">General</h3>
        <div class="property-group__fields">
          <div class="form__group">
            <label class="form__label">Label</label>
            <input
              type="text"
              class="form__input"
              :value="selectedElement.label"
              @input="handleInputValue($event, 'label')"
            />
          </div>

          <div class="form__checkbox">
            <input
              type="checkbox"
              id="selectedElementRequired"
              :checked="selectedElement.required"
              @change="handleCheckboxChange($event, 'required')"
            />
            <label for="selectedElementRequired">Required field</label>
          </div>
        </div>
      </div>

      <div class="property-group" v-if="selectedElement.type === 'input'">
        <h3 class="property-group__title">Text Input Properties</h3>
        <div class="property-group__fields">
          <div class="form__group">
            <label class="form__label">Placeholder</label>
            <input
              type="text"
              class="form__input"
              :value="selectedElement.placeholder"
              @input="handleInputValue($event, 'placeholder')"
            />
          </div>

          <div class="property-group__fields-row">
            <div class="form__group">
              <label class="form__label">Min Length</label>
              <input
                type="number"
                class="form__input"
                :value="selectedElement.minLength"
                @input="handleNumberInputValue($event, 'minLength')"
              />
            </div>
            <div class="form__group">
              <label class="form__label">Max Length</label>
              <input
                type="number"
                class="form__input"
                :value="selectedElement.maxLength"
                @input="handleNumberInputValue($event, 'maxLength')"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="property-group">
        <h3 class="property-group__title">Layout</h3>
        <div class="property-group__fields-row">
          <div class="form__group">
            <label class="form__label">Width</label>
            <input
              type="number"
              class="form__input"
              :value="selectedElement.width"
              @input="handleNumberInputValue($event, 'width')"
            />
          </div>
          <div class="form__group">
            <label class="form__label">Height</label>
            <input
              type="number"
              class="form__input"
              :value="selectedElement.height"
              @input="handleNumberInputValue($event, 'height')"
            />
          </div>
        </div>
      </div>

      <div class="panel-properties__actions">
        <Button
          variant="danger"
          :fullWidth="true"
          @click="formBuilderStore.removeElement(selectedElement.id)"
        >
          Delete Element
        </Button>
      </div>
    </div>

    <div v-else class="panel-properties__empty">
      <svg
        class="panel-properties__empty-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
      <p>Select an element to see its properties</p>
    </div>
  </div>
</template>

<style lang="scss">
.panel-properties {
  &__header-title {
    @include heading-3;
    display: flex;
    align-items: center;
    padding: $spacing-lg;
    border-bottom: 1px solid var(--theme-border);
  }

  &__icon {
    height: 1.125rem;
    width: 1.125rem;
    margin-right: $spacing-sm;
    color: var(--theme-primary-light);
  }

  &__body {
    padding: $spacing-lg;
    flex-grow: 1;
  }

  &__empty {
    @include flex(column, center, center);
    flex-grow: 1;
    color: var(--theme-text-muted);
    text-align: center;
    padding: $spacing-xl;

    &-icon {
      width: 3rem;
      height: 3rem;
      margin-bottom: $spacing-md;
      color: var(--theme-text-muted);
    }

    p {
      @include text-regular;
      margin: 0;
      color: var(--theme-text-muted);
    }
  }

  &__actions {
    padding: $spacing-lg;
    border-top: 1px solid var(--theme-border);
  }
}

.property-group {
  margin-bottom: $spacing-lg;

  &__title {
    @include heading-4;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-md;
    color: var(--theme-text);
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }
}

.property-group__fields-row {
  display: flex;
  gap: $spacing-md;
  align-items: end;

  > .form__group {
    flex: 1;
    min-width: 0;
  }
}
</style>
