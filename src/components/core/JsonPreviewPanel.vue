<script setup lang="ts">
import { computed, ref } from "vue";
import { useFormBuilderStore } from "@/stores/formBuilder";
import { SvgIcon } from "@/components/common";

const formBuilderStore = useFormBuilderStore();
const copySuccess = ref(false);
const showServerFormat = ref(false);
const isMaximized = ref(false);

const formJson = computed(() => {
  if (showServerFormat.value) {
    // Server format
    const serverFormat = {
      version: "0.0.1",
      fqn: "Easy\\Form",
      attributes: {
        name: "form",
        class: "formi",
        method: "post",
      },
      processors: [
        {
          fqn: "Easy\\Form\\Support\\Processor\\FormIdentifier",
        },
        {
          fqn: "Easy\\Form\\Support\\Processor\\CsrfToken",
        },
      ],
      children: formBuilderStore.elements.map(transformToServerFormat),
    };
    return JSON.stringify(serverFormat, null, 2);
  }
  // Internal format
  return JSON.stringify(formBuilderStore.elements, null, 2);
});

function transformToServerFormat(
  element: FormElement
): Record<string, unknown> {
  let serverElement: Record<string, unknown> = {
    fqn:
      element.serverFqn ||
      `Easy\\Form\\Item\\${
        element.type.charAt(0).toUpperCase() + element.type.slice(1)
      }`,
    attributes: {
      name: element.label?.toLowerCase().replace(/\s+/g, "_") || element.type,
      label: element.label,
      required: element.required,
    },
  };

  // Handle common attributes
  if (element.placeholder) {
    serverElement.attributes.placeholder = element.placeholder;
  }

  // Type specific transformations
  switch (element.type) {
    case "input":
      serverElement.attributes.type = "text";
      break;
    case "textarea":
      if (element.rows) {
        serverElement.attributes.rows = element.rows;
      }
      break;
    case "checkbox":
      serverElement.attributes.type = "checkbox";
      if (element.checked) {
        serverElement.attributes.checked = "checked";
      }
      break;
    case "fieldset":
      if (element.children && element.children.length > 0) {
        serverElement.children = element.children.map(transformToServerFormat);
      }
      break;
    case "button":
      serverElement.children = [
        {
          fqn: "Easy\\Form\\Markup",
          html: element.label || "Button",
        },
      ];
      break;
  }

  return serverElement;
}

function getServerFqn(type: string): string {
  const fqnMap: { [key: string]: string } = {
    input: "Easy\\Form\\Item\\Input\\Text",
    textarea: "Easy\\Form\\Item\\Textarea",
    checkbox: "Easy\\Form\\Item\\Input\\Checkbox",
    select: "Easy\\Form\\Item\\Select",
    radio: "Easy\\Form\\Item\\Radio",
    button: "Easy\\Form\\Item\\Button",
    fieldset: "Easy\\Form\\Fieldset",
  };
  return fqnMap[type] || `Easy\\Form\\Item\\${type}`;
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(formJson.value);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
}

function toggleMaximize() {
  isMaximized.value = !isMaximized.value;
}
</script>

<template>
  <div class="json-preview-panel">
    <div class="panel__header">
      <div class="panel__actions">
        <label class="format-switch">
          <input type="checkbox" v-model="showServerFormat" />
          <span class="format-switch__label">Server Format</span>
        </label>
        <button
          class="icon-button"
          @click="toggleMaximize"
          :title="isMaximized ? 'Minimize' : 'Maximize'"
        >
          <SvgIcon name="maximize" :size="18" />
        </button>
        <button
          class="icon-button"
          @click="copyToClipboard"
          :class="{ 'copy-success': copySuccess }"
          :title="copySuccess ? 'Copied!' : 'Copy to clipboard'"
        >
          <SvgIcon v-if="!copySuccess" name="copy" :size="18" />
          <SvgIcon v-else name="check" :size="18" />
        </button>
      </div>
    </div>
    <div class="panel__body">
      <pre><code>{{ formJson }}</code></pre>
    </div>

    <!-- Full screen modal -->
    <div
      v-if="isMaximized"
      class="json-modal-overlay"
      @click.self="toggleMaximize"
    >
      <div class="json-modal">
        <div class="json-modal__header">
          <h2>
            JSON Preview
            {{ showServerFormat ? "(Server Format)" : "(Internal Format)" }}
          </h2>
          <div class="json-modal__actions">
            <label class="format-switch format-switch--light">
              <input type="checkbox" v-model="showServerFormat" />
              <span class="format-switch__label">Server Format</span>
            </label>
            <button
              class="icon-button"
              @click="copyToClipboard"
              :class="{ 'copy-success': copySuccess }"
              :title="copySuccess ? 'Copied!' : 'Copy to clipboard'"
            >
              <SvgIcon v-if="!copySuccess" name="copy" :size="18" />
              <SvgIcon v-else name="check" :size="18" />
            </button>
            <button
              class="icon-button icon-button--close"
              @click="toggleMaximize"
              title="Close"
            >
              <SvgIcon name="x" :size="18" />
            </button>
          </div>
        </div>
        <div class="json-modal__body">
          <pre><code>{{ formJson }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/abstracts" as *;

.json-preview-panel {
  display: flex;
  flex-direction: column;
  background: var(--theme-bg-surface);
  width: 100%;
  height: 100%;
}

.panel__header {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--theme-border);
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.panel__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.format-switch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--theme-text-muted);
  font-size: 0.875rem;
  cursor: pointer;

  input[type="checkbox"] {
    appearance: none;
    width: 2.5rem;
    height: 1.25rem;
    background-color: var(--theme-bg-alt);
    border-radius: 999px;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid var(--theme-border);

    &:checked {
      background-color: var(--theme-primary);
      border-color: var(--theme-primary);
    }

    &::before {
      content: "";
      position: absolute;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background-color: white;
      top: 1px;
      left: 2px;
      transition: transform 0.3s ease;
    }

    &:checked::before {
      transform: translateX(1.25rem);
    }
  }

  &__label {
    user-select: none;
  }

  &--light {
    color: #fff;
  }
}

.panel__body {
  padding: 0;
  flex-grow: 1;
  overflow: auto;
  background-color: var(--theme-bg-alt);
  height: 500px;

  pre {
    margin: 0;
    padding: 1rem;
    font-family: $font-mono;
    font-size: $font-size-sm;
    color: var(--theme-text-code);
    white-space: pre-wrap;
    word-break: break-all;

    code {
      font-family: inherit;
    }
  }
}

.icon-button {
  background: none;
  border: none;
  color: var(--theme-text-muted);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: var(--theme-bg-alt);
    color: var(--theme-primary);
  }

  &.copy-success {
    color: var(--theme-success, #10b981);
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
    stroke-width: 2;
  }

  &--close {
    &:hover {
      color: #f43f5e;
    }
  }
}

/* Modal styles */
.json-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.json-modal {
  width: 90%;
  max-width: 1200px;
  height: 80%;
  background-color: var(--theme-bg-surface);
  border-radius: $border-radius-lg;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;

  &__header {
    padding: $spacing-lg;
    border-bottom: 1px solid var(--theme-border);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      @include heading-3;
      margin: 0;
      color: var(--theme-text);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__body {
    flex: 1;
    overflow: auto;
    padding: $spacing-lg;
    background-color: var(--theme-bg-alt);

    pre {
      margin: 0;
      font-family: $font-mono;
      font-size: 1rem;
      color: var(--theme-text-code);
      white-space: pre-wrap;
      word-break: break-all;

      code {
        font-family: inherit;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
