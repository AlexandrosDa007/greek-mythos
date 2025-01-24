<template>
    <input type="range" min="1" max="100" :value="sliderValue" @change="$emit('change', $event)"/>
</template>
<script setup>
const props = defineProps({
    sliderValue: {
        type: Number,
        default: 1,
    }
})
</script>