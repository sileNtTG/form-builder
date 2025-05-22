<script setup lang="ts">
// Diese Komponente lädt den HTML-Test als iFrame
</script>

<template>
  <div class="fieldset-test-view">
    <iframe
      src="/test-fieldset-nesting.html"
      class="fieldset-test-frame"
    ></iframe>
  </div>
</template>

<style lang="scss" scoped>
.fieldset-test-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 0;
}

.fieldset-test-frame {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
}
</style>
