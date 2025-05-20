<template>
  <div class="api-key-view">
    <h2>API Key Management</h2>
    <p>Use the API key below to integrate with our services.</p>

    <div class="api-key-display">
      <input type="text" :value="apiKey" readonly ref="apiKeyInput" />
      <button @click="copyApiKey">Copy Key</button>
    </div>

    <p v-if="copySuccess" class="copy-success-message">
      API Key copied to clipboard!
    </p>
    <p v-if="copyError" class="copy-error-message">Failed to copy API Key.</p>

    <div class="api-instructions">
      <h3>Usage Instructions:</h3>
      <p>
        Please include this API key in the 'X-API-KEY' header of your requests.
      </p>
      <pre>
curl -H "X-API-KEY: {{ apiKey }}" https://api.example.com/data
      </pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const apiKey = ref("test-api-key-12345-abcdef"); // Dummy API key
const apiKeyInput = ref<HTMLInputElement | null>(null);
const copySuccess = ref(false);
const copyError = ref(false);

const copyApiKey = async () => {
  copySuccess.value = false;
  copyError.value = false;

  if (apiKeyInput.value) {
    try {
      apiKeyInput.value.select();
      await navigator.clipboard.writeText(apiKey.value);
      copySuccess.value = true;
      setTimeout(() => (copySuccess.value = false), 3000); // Hide message after 3s
    } catch (err) {
      console.error("Failed to copy API key: ", err);
      copyError.value = true;
      setTimeout(() => (copyError.value = false), 3000); // Hide message after 3s
    }
  }
};
</script>

<style scoped lang="scss">
.api-key-view {
  padding: 20px;
}

.api-key-display {
  display: flex;
  align-items: center;
  margin-top: 15px;
  margin-bottom: 15px;

  input[type="text"] {
    flex-grow: 1;
    padding: 10px;
    font-family: monospace;
    background-color: var(--theme-input-bg);
    color: var(--theme-input-text);
    border: 1px solid var(--theme-border-color);
    border-radius: 4px;
    margin-right: 10px;
  }

  button {
    padding: 10px 15px;
    cursor: pointer;
    background-color: var(--theme-button-bg);
    color: var(--theme-button-text);
    border: 1px solid var(--theme-button-border);
    border-radius: 4px;

    &:hover {
      background-color: var(--theme-button-hover-bg);
    }
  }
}

.copy-success-message {
  color: var(--theme-success-text);
  margin-top: 5px;
}

.copy-error-message {
  color: var(--theme-error-text);
  margin-top: 5px;
}

.api-instructions {
  margin-top: 30px;
  padding: 15px;
  background-color: var(--theme-bg-surface);
  border: 1px solid var(--theme-border-color);
  border-radius: 8px;

  h3 {
    margin-top: 0;
  }

  pre {
    background-color: var(--theme-code-bg);
    color: var(--theme-code-text);
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
  }
}
</style>
