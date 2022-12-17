<template>
    <div class="tw-mt-auto tw-flex tw-flex-col tw-self-start tw-text-s">
        <span>Δεν είσαι χρήστης;
            <span class="tw-text-blue-500 tw-cursor-pointer hover:tw-text-blue-700"
                @click="emits('showRegister')">Εγγραφή</span>
        </span>
        <span class="tw-text-blue-500 tw-cursor-pointer  hover:tw-text-blue-700" @click="emits('showReset')">
            Ξέχασες τον κωδικό σου;
        </span>
    </div>
</template>

<script lang="ts" setup>
const emits = defineEmits(['showRegister', 'showReset']);
</script>
