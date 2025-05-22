<script setup lang="ts">
const props = defineProps<{
  index: number;
  fieldsetId?: string;
}>();

const emit = defineEmits(["insert"]);

function handleInsert() {
  emit("insert", { index: props.index, fieldsetId: props.fieldsetId });
}
</script>

<template>
  <div class="insertion-point-container">
    <div class="insertion-point">
      <div class="insertion-line"></div>
      <button
        class="insertion-button"
        title="Element einfügen"
        @click="handleInsert"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 5v14M5 12h14" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.insertion-point-container {
  padding: 2px 0;
  display: flex;
  justify-content: center;
  position: relative;
  width: 100%;
  pointer-events: all;
  opacity: 0;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;

    .insertion-button {
      transform: translate(-50%, -50%) scale(1);
    }
  }

  .insertion-point {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;

    .insertion-line {
      flex: 1;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--theme-primary) 15%,
        var(--theme-primary) 85%,
        transparent 100%
      );
    }

    .insertion-button {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) scale(0.7);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background-color: var(--theme-primary);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(26, 188, 156, 0.5);
      transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      z-index: 5;
      color: white;

      svg {
        width: 18px;
        height: 18px;
        stroke: white;
        fill: none;
        stroke-width: 2;
        transition: transform 0.2s;
      }

      &:hover {
        transform: translate(-50%, -50%) scale(1.15);
        box-shadow: 0 3px 8px rgba(26, 188, 156, 0.7);

        svg {
          transform: rotate(90deg);
        }
      }
    }
  }
}

// Hover-Effekte auf Container-Ebene
.canvas-stack {
  &:hover {
    .insertion-point-container {
      opacity: 0;

      &:hover {
        opacity: 1;
      }
    }
  }
}

.fieldset-content {
  &:hover {
    .insertion-point-container {
      opacity: 0;

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
