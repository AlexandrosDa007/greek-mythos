<template>
    <Card v-if="!started" is-large>
        <div class="tw-w-1/2 tw-flex tw-flex-col tw-h-full">
            <h1 class="tw-text-xl tw-text-center tw-mb-n">Το παιχνίδι σου</h1>
            <hr class="tw-w-full tw-mb-n" />
            <SinglePlayerCardSection title="Μέγεθος παιχνιδού">
                <div class="tw-flex tw-items-center tw-p-n tw-pl-0 tw-gap-n">
                    <label class="tw-text-s tw-cursor-pointer" for="small">Μικρό</label>
                    <input class="tw-cursor-pointer" id="small" name="gameType"
                        :checked="options.isSmall" @change="options.isSmall = true"
                        type="radio">
                    <label class="tw-text-s tw-cursor-pointer" for="big">Μεγάλο</label>
                    <input class="tw-cursor-pointer" :checked="!options.isSmall"
                        @change="options.isSmall = false" id="big" name="gameType" type="radio">
                </div>
            </SinglePlayerCardSection>
            <SinglePlayerCardSection title="">
                <Input label="Πόντοι-Στόχος" :value="options.minPoints" :type="'number'"
                    :input-handler="(ev: Event) => options.minPoints = Number((ev.target as HTMLInputElement).value)"
                    :min="50" />
            </SinglePlayerCardSection>

            <SinglePlayerCardSection title="Μέγιστος αριθμός βοηθειών">
                <Input label="Βοήθεια 50/50" :value="options.maxHelps.help_50" :type="'number'"
                    :input-handler="(ev: Event) => options.maxHelps.help_50 = Number((ev.target as HTMLInputElement).value)" />

                <Input class="tw-mt-n" label="Βοήθεια πάσο" :value="options.maxHelps.skip" :type="'number'"
                    :input-handler="(ev: Event) => options.maxHelps.skip = Number((ev.target as HTMLInputElement).value)" />
            </SinglePlayerCardSection>


            <RaisedButton class="tw-mt-n" text="Παίξε" @click.native="startGame(options)" />

        </div>
    </Card>
    <div v-else>
      <PlayersHud :players="board.game.players" :minPoints="board.game.minPoints" :user="userProfile"/>

<div v-if="board && board.game" class="tw-w-full tw-h-full tw-text-xxl tw-text-[#c8c8c8] tw-flex">
    <div class="tw-flex tw-flex-col tw-items-center tw-m-auto tw-min-w-[80%] tw-h-full tw-justify-evenly">
        <div v-for="(row, rowIndex) of board.rows" :key="rowIndex"
            class="tw-h-full tw-my-xs tw-mx-0 tw-flex tw-w-full tw-items-center tw-justify-evenly">
            <div v-for="(cell, cellIndex) of row.cells" :key="cellIndex" class="tw-flex tw-bg-gray-400 tw-m-auto tw-items-center tw-justify-center tw-rounded-s"
                :class="{
                    'tw-h-[100px] tw-w-[100px]': board.game.isSmall,
                    'tw-h-[70px] tw-w-[70px]': !board.game.isSmall
                }">

                <div v-if="gameEventsMap[cell.index] || gameQuestionsMap[cell.index]">
                    <img class="tw-w-[50px] tw-h-[50px] tw-opacity-60" :src="gameEventsMap[cell.index] ? './assets/ex.png' : gameQuestionsMap[cell.index] ? './assets/q.png' : ''"
                        alt="">
                </div>
                <span v-else>{{ cell.index }}</span>

                <div class="tw-flex tw-flex-wrap tw-absolute">
                    <div v-for="p in board.game.players" :key="p.uid" class="tw-z-[100] tw-flex-grow-0 tw-flex-shrink-[40%]">
                        <img v-if="p.position === cell.index" :alt="p.hero!.name"
                            :src="'assets/heroes/' +p.hero!.name + '.png'" class="tw-w-[30px] tw-h-[30px] tw-object-cover">
                    </div>
                </div>
            </div>
        </div>

        <div v-if="canShowDiceAnimation" class="event-container">
            <Dice :dice-result="diceResult" @done="canShowDiceAnimation = false"
            :is-my-dice="isMyDice" :player-name="userProfile!.displayName"/>
            <!-- <app-dice isSinglePlayer :game="board.game" :no-sound="settings.effectsMute"
                :dice-result="diceResult" @changeSomething="canShowDiceAnimation = false">
            </app-dice> -->
        </div>
    </div>
</div>
<div class="turnname-container">
    <span v-if="turnPlayer === userProfile!.displayName">Είναι η σειρά σου</span>
    <span v-if="turnPlayer === 'Υπολογιστής'">Είναι η σειρά του Υπολογιστή</span>
</div>
<div class="dice">
    <button class="tw-w-[70px] tw-h-[70px]" :disabled="!canRoll" @click="rollDice(userProfile!.uid)">
        <i class="tw-w-[70px] tw-h-[70px]">die-icon</i>
    </button>
</div>
<QuestionModal v-if="activeQuestion" :game="board.game " :question="board.game.question"
 :is-my-question="isMyQuestion" :can-do-action="canDoAction" @answer="answerQuestion" @getHelp="getHelp" @getReward="getReward"/>

<app-question-modal v-if="activeQuestion" :game="board.game" :question="board.game.question" :user="userProfile"
    :canDoAction="canDoAction" @getHelpEvent="getHelp($event)" @getRewardEvent="getReward($event)"
    @answeringQuestion="answerQuestion($event)" @qTurnFinished="qTurnFinished()" IS_SINGLE>

</app-question-modal>


<div v-if="gameOverPlayer" class="event-container">
    <h2>  {{gameOverPlayer === 'Υπολογιστής' ? 'Ο Υπολογιστής κέρδισε!' : 'Κέρδισες!'}}</h2>
    <button @click="quitGame()">Έξοδος</button>
</div>

<div v-if="activeGameEvent" class="event-container">
    <div class="tw-text-center tw-mb-s" style="font-size: 14pt;" v-if="!isMyGameEvent">
        Ο {{activeGameEvent.playerUid === 'bot' ? 'Υπολογιστής' : ' χρήστης '+board.game.players[activeGameEvent.playerUid].displayName}} έπεσε σε γεγονός
    </div>
    <h1 class="tw-text-center tw-mt-s">{{!isMyGameEvent ? '"'+activeGameEvent.text+'"' : activeGameEvent.text }}
    </h1>
    <div v-if="isMyGameEvent" class="w-75">
      progress bar {{ fiveSecondTimer }}
        <!-- <mat-progress-bar mode="determinate" [value]="fiveSecondTimer" style="height: 10px;">
        </mat-progress-bar> -->
    </div>
    <!-- <button *ngIf="isMyGameEvent" (click)="answerGameEvent()">Ok</button> -->
</div>

<div class="settings-container">
    <button mat-icon-button class="settings-btn" @click="showSettings = !showSettings"
    :style="{backgroundColor: showSettings ? '#3f99ec' : '#3f99ec80'}">
        <i class="settings-icon">settings2</i>
        <!-- <mat-icon class="settings-icon" svgIcon="settings2"></mat-icon> -->
    </button>
</div>

<div v-if="showSettings" class="event-container">
    <h1 class="text-center mb-auto mt-3">Ρυθμίσεις</h1>

    <div class="d-flex flex-column w-75 mb-auto">
        <!-- MUSIC -->
        <h2 class="text-center">Μουσική</h2>
        <Slider :slider-value="settings.music * 100" @change="turnVolume('music',$event.value)"/>
        <!-- <mat-slider [value]="settings.music * 100" (change)="turnVolume('music',$event.value)"></mat-slider> -->
        <!-- SOUND EFFECTS -->
        <h2 class="text-center">Ηχητικά εφέ</h2>
        <Slider :slider-value="settings.effects * 100" @change="turnVolume('effects',$event.value)"/>
        <!-- <mat-slider [value]="settings.effects * 100" (change)="turnVolume('effects',$event.value)"></mat-slider> -->

        <Checkbox :check-box-value="settings.musicMute" @change="setMute('musicMute', $event.checked)">Σίγαση μουσικής</Checkbox>
        <!-- <mat-checkbox [checked]="settings.musicMute" (change)="setMute('musicMute', $event.checked)">Σίγαση μουσικής
        </mat-checkbox> -->
        <Checkbox :check-box-value="settings.effectsMute" @change="setMute('effectsMute', $event.checked)">Σίγαση
            ηχητικών
            εφέ</Checkbox>
        <!-- <mat-checkbox [checked]="settings.effectsMute" (change)="setMute('effectsMute', $event.checked)">Σίγαση
            ηχητικών
            εφέ</mat-checkbox> -->
    </div>
</div>

    </div>
</template>

<script lang="ts" setup>
import Card from '@/components/common/Card.vue';
import SinglePlayerCardSection from './SinglePlayerCardSection.vue';
import Input from '@/components/Input/Input.vue';
import { computed, ref } from 'vue';
import RaisedButton from '@/components/common/RaisedButton.vue';
import { useSinglePlayer } from './use-single-player';
import { useUserStore } from '@/store/user';
import { storeToRefs } from 'pinia';
import PlayersHud from './PlayersHud.vue';
import { useAudio } from './use-audio';
import Slider from '@/components/common/Slider.vue';
import Checkbox from '@/components/common/Checkbox.vue';
import Dice from '@/components/Dice/Dice.vue';
import QuestionModal from '@/components/QuestionModal/QuestionModal.vue';


const options = ref({
  isSmall: false,
  minPoints: 150,
  maxHelps: {
    help_50: 3,
    skip: 2,
  }
});

const userStore = useUserStore();
const { userProfile } = storeToRefs(userStore);



const {
  started,
  startGame,
  board,
  gameEventsMap,
  gameQuestionsMap,
  canShowDiceAnimation,
  diceResult,
  turnPlayer,
  canRoll,
  rollDice,
  canDoAction,
  getHelp,
  getReward,
  answerQuestion,
  qTurnFinished,
  activeQuestion,
  gameOverPlayer,
  quitGame,
  activeGameEvent,
  isMyGameEvent,
  fiveSecondTimer,
  showSettings,
} = useSinglePlayer();

const {
  settings,
  turnVolume,
  setMute,
} = useAudio();
const isMyDice = computed(() => {
    const myUid = userProfile.value?.uid;
    if (!myUid) {
        throw new Error('Single player you must be logged in');
    }
    return board.value.game.players[myUid].turnIndex === board.value.game.turnIndex;
})
</script>

<style>
.event-container {
    width: 50%;
    position: absolute;
    z-index: 100;
    left: 25%;
    top: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #ffffffe8;
    right: 25%;
    bottom: 25%;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    height: 600px;
}

.turnname-container {
    position: absolute;
    top: 95%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #d5d5d5bd;
    font-size: 28pt;
    color: #3f99ec;
    height: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.dice {
    position: absolute;
    top: 85%;
    left: 5%;
    color: rgb(0, 0, 0);
}

.settings-container {
    position: absolute;
    top: 87%;
    left: 90%;
    color: rgb(0, 0, 0);
}
.settings-icon {
    width: 40px;
    height: 40px;
}

.settings-btn {
    width: 50px;
    height: 50px;
    background: #3f99ec80;
    box-shadow: 0px 0px 4px 2px rgba(0, 0, 0, 0.3);
}
</style>