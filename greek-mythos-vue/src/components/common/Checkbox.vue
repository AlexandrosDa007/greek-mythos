<template>
    <label for="ch"><slot/></label>
    <input name="ch" type="checkbox" :value="checkBoxValue" @change="$emit('change', $event)"/>
</template>

<script setup>
const props = defineProps({
    checkBoxValue: {
        type: Boolean,
        required: true,
    },
})
</script>