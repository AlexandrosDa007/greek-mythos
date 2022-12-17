<template>
    <RouterLink class="tw-w-full hover:tw-bg-navy hover:tw-text-white" v-slot="{ isActive }" :to="link.url">
        <li class="tw-w-full tw-text-center tw-text-l tw-font-semibold tw-p-xl" :class="{
            'tw-border-b tw-border-solid tw-border-black': !isLast,
            'tw-bg-navy tw-text-white': isActive,
        }">
            {{ link.name }}
        </li>
    </RouterLink>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { MenuItem } from '@/models/menu-item';

const props = defineProps({
    link: { type: Object as PropType<MenuItem>, required: true },
    isLast: { type: Boolean },
});
</script>
