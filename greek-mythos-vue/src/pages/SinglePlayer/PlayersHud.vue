<template>
    <div class="tw-flex tw-flex-col tw-absolute hud" :class="{
        'tw-w-[300px]': expanded,
        'tw-w-[100px]': !expanded
    }">
    <span>Στόχος: {{minPoints}}</span>
    <div class="tw-mt-s tw-flex tw-items-center tw-w-full"
        v-for="player of players"
        :key="player.uid"
        :class="{
            'tw-underline': player.uid === user.uid,
        }">
        <img class="tw-mr-s" :src="'assets/heroes/'+player.hero.name+'.png'" width="25px" height="25px">
        <span v-if="expanded">{{player.displayName}} : {{player.points ? player.points : 0}}</span>
        <span v-esle> {{player.points}} </span>
    </div>
    <button @click="expanded = !expanded">
        <i>{{ expanded ? 'minimize' : 'open_in_full' }}</i>
    </button>
</div>
</template>
<script setup>
import { ref } from 'vue';
const expanded = ref(false);
defineProps({
    players: {
        type: Array,
        default: () => ({}),
    },
    minPoints: {
        type: Number,
        required: true,
        default: 0,
    },
    user: {
        type: Object,
        default: () => ({})
    }
})
</script>