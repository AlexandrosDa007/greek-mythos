<template>
    <div class="tw-m-auto tw-flex tw-flex-col tw-items-center">
        <span>Αν δεν έχετε λάβει το email, πατήστε το κουμπί για επαναποστολή</span>
        <RaisedButton class="tw-mt-m" :is-disabled="!canSendVerification"
            @click.native="canSendVerification && clickHandler()" text="Στείλε email επιβεβαίωσης" />
    </div>
</template>

<script lang="ts" setup>
import RaisedButton from '@/components/common/RaisedButton.vue';
const props = defineProps({
    canSendVerification: { type: Boolean },
    clickHandler: { type: Function, default: () => { } }
})
</script>
