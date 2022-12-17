<template>
    <div class="tw-flex tw-flex-col tw-p-n">
        <h2 class="tw-text-l tw-mb-s">{{ title }}</h2>
        <slot />
        <hr class="tw-mt-xl tw-w-full" />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    title: { type: String, default: '' },
})
</script>
