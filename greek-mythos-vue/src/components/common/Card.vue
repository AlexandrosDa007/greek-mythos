<template>
    <section class="tw-shadow-positive-elevation-2
    tw-bg-white tw-rounded-s tw-shadow-2xl tw-z-10 tw-flex
    tw-flex-col tw-items-center tw-p-xxxl" :class="classes">
        <slot />
    </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
const props = defineProps({
    isLarge: { type: Boolean },
});

const classes = computed(() => {
    return {
        'tw-h-[400px]': !props.isLarge,
        'tw-w-[350px] md:tw-w-[400px]': !props.isLarge,
        'tw-h-[600px]': props.isLarge,
        'tw-w-[400px] md:tw-w-[600px]': props.isLarge,
    }
})
</script>