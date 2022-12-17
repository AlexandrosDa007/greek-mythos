<template>
    <button :disabled="isDisabled" class="tw-inline-block tw-bg-white tw-w-1/2 tw-self-center tw-p-n tw-rounded-s
    tw-shadow-positive-elevation active:tw-shadow-positive-elevation-2">
        {{ text }}
    </button>
</template>

<script lang="ts" setup>
const props = defineProps({
    text: { type: String, default: '' },
    isDisabled: { type: Boolean },
});

</script>
