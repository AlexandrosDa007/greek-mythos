<template>
    <div class="tw-mt-auto tw-flex tw-flex-col tw-self-start tw-text-s">
        <span>Έχεις ήδη λογαριασμό; <span class="tw-text-blue-500 tw-cursor-pointer hover:tw-text-blue-700"
                @click="emits('showLogin')"> Σύνδεση</span></span>
    </div>
</template>

<script lang="ts" setup>
const emits = defineEmits(['showLogin']);
</script>