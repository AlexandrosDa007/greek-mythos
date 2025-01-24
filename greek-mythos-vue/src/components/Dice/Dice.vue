<template>
    <div class="outside-container">
    <span v-if="isMyDice" class="tw-mb-auto tw-mt-s"> Έριξες {{diceResult}}</span>
    <span v-else class="tw-mb-auto tw-mt-s"> Ο χρήστης {{playerName}} έριξε {{diceResult}}</span>
    <div class="dice-container">
        <div id="mpla" >
        </div>
    </div>
</div>
</template>

<script setup>
import rollADie from 'roll-a-die';
import { useAudio } from '@/pages/SinglePlayer/use-audio';
import { onMounted } from 'vue';
const props = defineProps({
    isMyDice: {
        type: Boolean,
    },
    playerName: {
        type: String,
        default: '',
    },
    diceResult: {
        type: Number,
        required: true,
    },
});
const emits = defineEmits(['done']);
const {settings} = useAudio();

onMounted(() => {

    rollADie({
        element: document.getElementById('mpla'), numberOfDice: 1,
        callback: () => {
            console.log('callback from dice: :)')
        },
        noSound: !!settings.value.effectsMute,
        delay: 3000,
        values: [props.diceResult],
        soundVolume: settings.value.effects,
    });
    setTimeout(() => {
        console.log('callback set timeout: :)')
         emits('done');
       }, 3000);
})


</script>

<style scoped>
.dice-container {
  transform: scale(1.5);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.outside-container {
  height: 500px;

}

span {
  color: #3f99ec;
  line-height: 50px;
}

</style>