<template>
  <div class="editable-title" :class="{ 'editable-title--editing': isEditing }">
    <input
      v-if="isEditing"
      ref="inputRef"
      v-model="localValue"
      class="editable-title__input"
      @blur="handleBlur"
      @keyup.enter="handleEnter"
      @keyup.escape="handleEscape"
    />
    <div v-else class="editable-title__display">
      <span class="editable-title__text">{{ value || placeholder }}</span>
      <button
        class="editable-title__edit-btn"
        @click="startEditing"
        :title="editTooltip"
      >
        <SvgIcon name="edit" :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { SvgIcon } from "@/components/common";

interface Props {
  value: string;
  placeholder?: string;
  editTooltip?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Untitled",
  editTooltip: "Namen bearbeiten",
});

const emit = defineEmits<{
  update: [value: string];
}>();

const isEditing = ref(false);
const localValue = ref(props.value);
const inputRef = ref<HTMLInputElement>();

const startEditing = async () => {
  localValue.value = props.value;
  isEditing.value = true;

  await nextTick();
  if (inputRef.value) {
    inputRef.value.focus();
    const length = inputRef.value.value.length;
    inputRef.value.setSelectionRange(length, length);
  }
};

const handleEnter = () => {
  saveChanges();
};

const handleEscape = () => {
  cancelEdit();
};

const handleBlur = () => {
  saveChanges();
};

const saveChanges = () => {
  if (localValue.value.trim() !== props.value) {
    emit("update", localValue.value.trim() || props.placeholder);
  }
  isEditing.value = false;
};

const cancelEdit = () => {
  localValue.value = props.value;
  isEditing.value = false;
};
</script>

<style lang="scss" scoped>
@use "@/assets/scss/abstracts" as *;

.editable-title {
  display: flex;
  align-items: center;
  min-width: 0;

  &__display {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    border-radius: $border-radius;
    min-width: 0;
    @include transition(all, $transition-fast);
    cursor: pointer;
  }

  &__text {
    @include text-small;
    font-weight: 500;
    min-width: 0;
    @include text-ellipsis;
  }

  &__edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--theme-text-muted);
    cursor: pointer;
    border-radius: $border-radius-sm;
    opacity: 0;
    @include transition(all, $transition-fast);

    &:hover {
      color: var(--theme-primary); // Green hover like other icons
      background: rgba(26, 188, 156, 0.1); // Green background on hover
    }
  }

  &__display:hover &__edit-btn {
    opacity: 1;
  }

  &__input {
    width: 100%;
    max-width: 200px;
    padding: 0 4px;
    margin: 0;
    background-color: var(--theme-bg-input);
    border: 1px solid var(--theme-primary);
    border-radius: $border-radius;
    color: var(--theme-text);
    @include text-small;
    font-weight: 500;
    line-height: 1.5;
    height: 1.3125rem; // 21px - exact height for text-small with line-height 1.5
    box-sizing: border-box;

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(var(--theme-primary-rgb), 0.2);
    }
  }

  &--editing {
    .editable-title__display {
      display: none;
    }
  }
}
</style>
