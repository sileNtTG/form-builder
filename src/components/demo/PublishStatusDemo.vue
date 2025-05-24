<script setup lang="ts">
import { ref } from "vue";
import PublishStatus from "@/components/common/PublishStatus.vue";
import PublishActions from "@/components/common/PublishActions.vue";

// Demo states
const draftForm = ref({
  id: "form-1",
  name: "Contact Form",
  published: false,
  publishedAt: undefined as string | undefined,
});

const publishedForm = ref({
  id: "form-2",
  name: "Newsletter Signup",
  published: true,
  publishedAt: "2024-01-15T10:30:00.000Z" as string | undefined,
});

const isLoading = ref(false);

// Demo actions
const handlePublish = async () => {
  console.log("Publishing form...");
  isLoading.value = true;

  // Simulate API call
  setTimeout(() => {
    draftForm.value.published = true;
    draftForm.value.publishedAt = new Date().toISOString();
    isLoading.value = false;
    console.log("Form published!");
  }, 1000);
};

const handleUnpublish = async () => {
  console.log("Unpublishing form...");
  isLoading.value = true;

  // Simulate API call
  setTimeout(() => {
    publishedForm.value.published = false;
    publishedForm.value.publishedAt = undefined;
    isLoading.value = false;
    console.log("Form unpublished!");
  }, 1000);
};
</script>

<template>
  <div class="publish-demo">
    <div class="demo-section">
      <h2>Publish Status Component</h2>

      <div class="demo-grid">
        <div class="demo-item">
          <h3>Draft Status</h3>
          <PublishStatus :published="false" size="md" :show-text="true" />
        </div>

        <div class="demo-item">
          <h3>Published Status</h3>
          <PublishStatus
            :published="true"
            :published-at="publishedForm.publishedAt"
            size="md"
            :show-text="true"
            :show-date="false"
          />
        </div>

        <div class="demo-item">
          <h3>Published with Date</h3>
          <PublishStatus
            :published="true"
            :published-at="publishedForm.publishedAt"
            size="md"
            :show-text="true"
            :show-date="true"
          />
        </div>

        <div class="demo-item">
          <h3>Small Size</h3>
          <PublishStatus :published="true" size="sm" :show-text="true" />
        </div>

        <div class="demo-item">
          <h3>Large Size</h3>
          <PublishStatus :published="false" size="lg" :show-text="true" />
        </div>

        <div class="demo-item">
          <h3>Icon Only</h3>
          <PublishStatus :published="true" size="md" :show-text="false" />
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>Publish Actions Component</h2>

      <div class="demo-grid">
        <div class="demo-item">
          <h3>Draft Form Actions</h3>
          <div class="actions-group">
            <PublishActions
              :published="draftForm.published"
              :loading="isLoading"
              variant="button"
              size="md"
              @publish="handlePublish"
            />
          </div>
        </div>

        <div class="demo-item">
          <h3>Published Form Actions</h3>
          <div class="actions-group">
            <PublishActions
              :published="publishedForm.published"
              :loading="isLoading"
              variant="button"
              size="md"
              @unpublish="handleUnpublish"
            />
          </div>
        </div>

        <div class="demo-item">
          <h3>Icon Variant</h3>
          <div class="actions-group">
            <PublishActions
              :published="false"
              variant="icon"
              size="md"
              @publish="handlePublish"
            />
            <PublishActions
              :published="true"
              variant="icon"
              size="md"
              @unpublish="handleUnpublish"
            />
          </div>
        </div>

        <div class="demo-item">
          <h3>Minimal Variant</h3>
          <div class="actions-group">
            <PublishActions
              :published="false"
              variant="minimal"
              size="md"
              @publish="handlePublish"
            />
            <PublishActions
              :published="true"
              variant="minimal"
              size="md"
              @unpublish="handleUnpublish"
            />
          </div>
        </div>

        <div class="demo-item">
          <h3>Different Sizes</h3>
          <div class="actions-group">
            <PublishActions
              :published="false"
              variant="button"
              size="sm"
              @publish="handlePublish"
            />
            <PublishActions
              :published="false"
              variant="button"
              size="md"
              @publish="handlePublish"
            />
            <PublishActions
              :published="false"
              variant="button"
              size="lg"
              @publish="handlePublish"
            />
          </div>
        </div>

        <div class="demo-item">
          <h3>Disabled State</h3>
          <div class="actions-group">
            <PublishActions
              :published="false"
              variant="button"
              size="md"
              :disabled="true"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>Combined Usage</h2>

      <div class="form-card">
        <div class="form-header">
          <h3>{{ draftForm.name }}</h3>
          <PublishStatus
            :published="draftForm.published"
            :published-at="draftForm.publishedAt"
            size="sm"
            :show-text="true"
            :show-date="true"
          />
        </div>
        <div class="form-actions">
          <PublishActions
            :published="draftForm.published"
            :loading="isLoading"
            variant="button"
            size="sm"
            @publish="handlePublish"
            @unpublish="
              () => {
                draftForm.published = false;
                draftForm.publishedAt = undefined;
              }
            "
          />
        </div>
      </div>

      <div class="form-card">
        <div class="form-header">
          <h3>{{ publishedForm.name }}</h3>
          <PublishStatus
            :published="publishedForm.published"
            :published-at="publishedForm.publishedAt"
            size="sm"
            :show-text="true"
            :show-date="true"
          />
        </div>
        <div class="form-actions">
          <PublishActions
            :published="publishedForm.published"
            :loading="isLoading"
            variant="button"
            size="sm"
            @publish="
              () => {
                publishedForm.published = true;
                publishedForm.publishedAt = new Date().toISOString();
              }
            "
            @unpublish="handleUnpublish"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.publish-demo {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: 3rem;

  h2 {
    margin-bottom: 1.5rem;
    color: var(--theme-text);
    border-bottom: 2px solid var(--theme-border);
    padding-bottom: 0.5rem;
  }
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.demo-item {
  padding: 1.5rem;
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  background: var(--theme-bg-surface);

  h3 {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    color: var(--theme-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.actions-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.form-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  background: var(--theme-bg-surface);
  margin-bottom: 1rem;

  .form-header {
    display: flex;
    align-items: center;
    gap: 1rem;

    h3 {
      margin: 0;
      color: var(--theme-text);
    }
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
  }
}
</style>
