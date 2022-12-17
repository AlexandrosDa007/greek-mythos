<template>
    <div class="tw-relative tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center">
        <div class="tw-w-full tw-h-full tw-bg-no-repeat
            tw-bg-fixed tw-bg-center tw-bg-[url('assets/login.png')] tw-absolute">
        </div>
        <Card>
            <LoginContainer v-if="!showRegister" @login="loginUser" />
            <RegisterContainer v-else @register="registerUser" />
            <LoginMoreActions v-if="!showRegister" @show-register="(showRegister = true)"
                @show-reset="(showReset = true)" />
            <RegisterMoreActions v-else @show-login="(showRegister = false)" />
        </Card>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { NewUser } from '@/models/new-user';
import LoginContainer from '@/pages/Login/LoginContainer.vue';
import RegisterContainer from '@/pages/Login/Register/RegisterContainer.vue';
import LoginMoreActions from '@/pages/Login/LoginMoreActions.vue';
import RegisterMoreActions from '@/pages/Login/Register/RegisterMoreActions.vue';
import Card from '@/components/common/Card.vue';
import { useUserStore } from '@/store/user';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();
const { loginUser, registerUser } = userStore;


const showRegister = ref(false);
const showReset = ref(false);


</script>