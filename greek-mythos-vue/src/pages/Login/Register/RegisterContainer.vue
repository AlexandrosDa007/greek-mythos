<template>
    <LoginControlWrapper>
        <Input :value="newUser.email" :label="'Το email σου'" is-required
            :input-handler="(ev: Event) => updateUser(ev, 'email')" />
        <Input :value="newUser.name" :label="'Το όνομα σου'" is-required
            :input-handler="(ev: Event) => updateUser(ev, 'name')" />
        <Input :value="newUser.pass" :label="'Ο κωδικός σου'" is-required :type="'password'"
            :input-handler="(ev: Event) => updateUser(ev, 'pass')" />
        <Input :value="newUser.confirmPass" :label="'Επιβεβαίωση κωδικού'" is-required :type="'password'"
            :input-handler="(ev: Event) => updateUser(ev, 'confirmPass')" />
        <RaisedButton :text="'Εγγραφή'" @click.native="emits('register', newUser)" />
    </LoginControlWrapper>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import RaisedButton from '@/components/common/RaisedButton.vue';
import Input from '@/components/Input/Input.vue';
import { NewUser } from '@/models/new-user';
import LoginControlWrapper from '@/pages/Login/LoginControlWrapper.vue';



const newUser = ref<NewUser>({ email: '', name: '', pass: '', confirmPass: '' });

function updateUser(ev: Event, property: keyof NewUser) {
    newUser.value[property] = (<HTMLInputElement>ev.target).value;
}

const emits = defineEmits(['register']);

</script>