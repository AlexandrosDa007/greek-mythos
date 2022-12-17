<template>
    <VerifiedWrapper>
        <VerifiedHeader :email="userProfile?.email" />
        <VerifiedResendEmail :can-send-verification="canSendVerification" :click-handler="sendVerification" />

        <RaisedButton class="tw-ml-auto" @click.native="logoutUser" text="Αποσύνδεση" />
    </VerifiedWrapper>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import RaisedButton from '@/components/common/RaisedButton.vue';
import { useUserStore } from '@/store/user';
import { onMounted, onBeforeUnmount } from 'vue';
import VerifiedWrapper from './VerifiedWrapper.vue';
import VerifiedHeader from './VerifiedHeader.vue';
import VerifiedResendEmail from './VerifiedResendEmail.vue';

const userStore = useUserStore();
const { logoutUser, sendVerification, checkForVerification } = userStore;
const { userProfile, canSendVerification } = storeToRefs(userStore);

let interval: any = null;

function startTimer() {
    interval = setInterval(() => {
        checkForVerification();
    }, 3000);
}

onMounted(() => {
    sendVerification();
    startTimer();
});

onBeforeUnmount(() => {
    clearInterval(interval);
});

</script>