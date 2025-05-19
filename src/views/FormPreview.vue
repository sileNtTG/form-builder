<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const formId = route.params.id as string;
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Form Preview</h1>
    <div class="bg-white p-6 rounded shadow">
      <p class="text-center text-gray-500">Form ID: {{ formId }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
// Styles will go here
</style>
