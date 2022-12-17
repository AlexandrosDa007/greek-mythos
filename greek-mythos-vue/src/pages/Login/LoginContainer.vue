<template>
    <LoginControlWrapper>
        <Input :value="email" :label="'Το email σου'" :input-handler="(ev: Event) => handleInput(ev, 'email')"
            :has-error="errors.email" is-required :type="'email'" :autocomplete="'email'" />
        <Input :value="password" :label="'Ο κωδικός σου'" :input-handler="(ev: Event) => handleInput(ev, 'password')"
            :type="'password'" :has-error="errors.password" is-required />

        <RaisedButton autofocus class="tw-mt-xl " :text="'Σύνδεση'"
            @click.native="emits('login', { email, password })" />
    </LoginControlWrapper>
</template>

<script lang="ts" setup>
import Input from '@/components/Input/Input.vue';
import RaisedButton from '@/components/common/RaisedButton.vue';
import { ref } from 'vue';
import LoginControlWrapper from './LoginControlWrapper.vue';

const emits = defineEmits(['login']);

const email = ref('');
const password = ref('');
const errors = ref({ email: true, password: true });


function handleInput(ev: Event, property: 'email' | 'password') {
    if (property === 'email') {
        email.value = (<HTMLInputElement>ev.target).value;
    } else {
        password.value = (<HTMLInputElement>ev.target).value;
    }
    calculateError(property);
}

function calculateError(property: 'email' | 'password') {
    if (property === 'email') {
        const hasError = email.value.trim().length < 1;
        errors.value.email = hasError;
    } else {
        const hasError = password.value.trim().length < 1;
        errors.value.password = hasError;
    }
}
</script>
