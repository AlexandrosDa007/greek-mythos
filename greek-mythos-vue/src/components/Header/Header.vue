<template>
    <header class="tw-flex tw-w-[200px] tw-bg-cerulean tw-h-full">
        <nav class="tw-flex tw-w-full">
            <ul class="tw-flex tw-flex-col tw-items-center tw-w-full">
                <HeaderItem v-for="item of menuItems" :link="item" />
                <li class="tw-mt-auto tw-p-xl tw-text-l
                    tw-font-semibold tw-border-t tw-border-solid
                    tw-border-black tw-w-full tw-text-center hover:tw-bg-navy hover:tw-text-white">
                    <button @click="emits('logout')">Αποσύνδεση</button>
                </li>
            </ul>
        </nav>
    </header>
</template>

<script lang="ts" setup>
import { MenuItem } from '@/models/menu-item';
import HeaderItem from './HeaderItem.vue';
defineProps({
    menuItems: { type: Array<MenuItem>, required: true },
});


const emits = defineEmits(['logout']);


</script>