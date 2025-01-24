<template>
    <div class="question-container">

    <template v-if="question.state === 'waitingAns'">
        <h1 class="tw-text-center tw-mt-s">{{ question.question.text }}</h1>
        <div class="tw-flex tw-flex-col tw-p-n tw-w-full tw-mb-auto">
            <div class="tw-flex tw-justify-between tw-mb-s">
                <button :disabled="!isMyQuestion || !canDoAction || (question.question.answer !== undefined && question.question.answers.length === 4)" @click="answerQuestion(question.question.answers[0])">
                    {{question.question.answers[0]}}
                </button>
                <button :disabled="!isMyQuestion || !canDoAction || (question.question.answer !== undefined && question.question.answers.length === 4)" @click="answerQuestion(question.question.answers[1])">
                    {{question.question.answers[1]}}
                </button>
            </div>
            <div v-if="question.question.answers.length === 4" class="tw-flex tw-justify-between">
                <button :disabled="!isMyQuestion || !canDoAction || (question.question.answer !== undefined && question.question.answers.length === 4)" @click="answerQuestion(question.question.answers[2])">
                    {{question.question.answers[2]}}
                </button>
                <button :disabled="!isMyQuestion || !canDoAction || (question.question.answer !== undefined && question.question.answers.length === 4)" @click="answerQuestion(question.question.answers[3])">
                    {{question.question.answers[3]}}
                </button>
            </div>
            <div class="tw-flex tw-flex-col tw-items-center tw-mt-xs"
                v-if="isMyQuestion && question.question.answers.length == 4">
                <h1>Βοήθειες</h1>
                <div class="tw-flex tw-w-full tw-justify-between">
                    <button :disabled="!canGetHelp('help_50')" @click="getHelp('help_50')">50/50
                        <span style="color: #c12c2c;">(-{{HELPS.help_50}} πόντους)</span> <br>
                        {{game.player.helpUsed.help_50}} / {{game.maxHelps.help_50}}
                    </button>
                    <button :disabled="!canGetHelp('help_skip')"
                        @click="getHelp('help_skip')">Πάσο
                        <span style="color: #c12c2c;">(-{{HELPS.skip}} πόντους)</span> <br>
                        {{game.player.helpUsed.skip}} / {{game.maxHelps.skip}}
                    </button>
                </div>
            </div>
            <h1 v-if="question.question.answers.length !== 4" class="tw-text-center tw-mt-xs" style="color: #3f99ec;">Χρησιμοποιήθηκε η βοήθεια 50/50</h1>
        </div>
        <div v-if="!isMyQuestion" class="tw-p-s tw-mb-s" style="color: #3f99ec; font-size: 14pt;">
            Αναμένεται απάντηση απο {{IS_SINGLE ? 'τον Υπολογιστή' :  'τον '+game.player.displayName}}
        </div>
        <div v-if="qTimer && (isMyQuestion || IS_SINGLE)" class="tw-w-3/4">
            progress bar {{ qTimer }}
           <!-- <mat-progress-bar class="mb-3" mode="determinate" [value]="qTimer"></mat-progress-bar> -->
        </div>
    </template>
    <template v-else-if="question.state === 'answered'">

        <h1 class="tw-text-center tw-mt-s">{{ question.question.text }}</h1>
        <div class="tw-flex tw-flex-col tw-p-s tw-w-full tw-mb-auto">
            <div class="tw-flex tw-justify-between tw-mb-s">
                <button disabled
                :class="question.question.answers[0] === question.question.answer ? 'correct' : ''">
                    {{question.question.answers[0]}}
                </button>
                <button disabled
                :class="question.question.answers[1] === question.question.answer ? 'correct' : ''">
                    {{question.question.answers[1]}}
                </button>
            </div>
            <div v-if="question.question.answers.length === 4" class="tw-flex tw-justify-between">
                <button disabled
                :class="question.question.answers[2] === question.question.answer ? 'correct' : ''">
                    {{question.question.answers[2]}}
                </button>
                <button disabled
                :class="question.question.answers[3] === question.question.answer ? 'correct' : ''">
                    {{question.question.answers[3]}}
                </button>
            </div>
                <h1 v-if="isMyQuestion" class="tw-text-center tw-mt-xs" style="color: green;">
                    Απάντησες σωστά
                </h1>
                <h1 v-if="!isMyQuestion" class="tw-text-center tw-mt-s" style="color: #3f99ec;">
                    Ο {{game.player.displayName}} απάντησε σωστά την ερώτηση,
                    αναμένεται επιλογή κίνησης
                </h1>
            <div v-if="isMyQuestion" class="tw-flex tw-w-full tw-justify-between">
                <button :disabled="!canDoAction " @click="getReward('move')">Πάνε {{diffToStepsMap[question.question.diff]}} μπροστά</button>
                <button :disabled="!canDoAction " @click="getReward('points')">Πάρε
                    {{question.question.qPoints}}
                    πόντους</button>
            </div>
        </div>
    </template>

    <template v-else-if="question.state === 'failed'">
        <h1 class="tw-text-center tw-mt-s">{{ question.question.text }}</h1>
        <div class="tw-flex tw-flex-col tw-p-s tw-w-full tw-mb-auto">

            <div class="tw-flex tw-justify-between tw-mb-s">
                <button disabled @click="answerQuestion(question.question.answers[0])"
                :class="question.question.answer === question.question.answers[0] ? 'wrong' : question.question.answers[0] === question.question.correct ? 'correct' : ''">
                    {{question.question.answers[0]}}
                </button>
                <button disabled @click="answerQuestion(question.question.answers[1])"
                :class="question.question.answer === question.question.answers[1] ? 'wrong' : question.question.answers[1] === question.question.correct ? 'correct' : ''">
                    {{question.question.answers[1]}}
                </button>
            </div>
            <div v-if="question.question.answers.length === 4" class="tw-flex tw-justify-between">
                <button disabled @click="answerQuestion(question.question.answers[2])"
                    :class="question.question.answer === question.question.answers[2] ? 'wrong' : question.question.answers[2] === question.question.correct ? 'correct' : ''">
                    {{question.question.answers[2]}}
                </button>
                <button disabled @click="answerQuestion(question.question.answers[3])"
                :class="question.question.answer === question.question.answers[3] ? 'wrong' : question.question.answers[3] === question.question.correct ? 'correct' : ''">
                    {{question.question.answers[3]}}
                </button>
            </div>
                <h1 class="tw-text-center tw-mt-s" v-if="isMyQuestion" style="color: #c12c2c;">Απάντησες λάθος</h1>
                <h1 class="tw-text-center tw-mt-s" v-if="!isMyQuestion" style="color: #c12c2c;">
                    Ο {{game.player.displayName}} απάντησε λάθος
                </h1>
            <div v-if="isMyQuestion" class="tw-flex tw-items-center tw-justify-between tw-w-full tw-mt-xs">
                <button :disabled="!canDoAction " @click="getReward('go_back')">Πάνε πίσω </button>
                <button :disabled="!canDoAction || (game.player.points < question.question.qPoints)"
                    @click="getReward('remove_points')">- {{question.question.qPoints}}
                    πόντους</button>
            </div>
        </div>
    </template>

    <template v-else-if="question.state === 'skipped'">
        <h1 v-if="isMyQuestion" class="tw-text-center tw-mt-s" style="color: #3f99ec;">
            Χρησιμοποίησες πάσο
        </h1>
        <h1 v-if="!isMyQuestion" class="tw-text-center tw-mt-s" style="color: #3f99ec;">
            Ο {{game.player.displayName}} χρησιμοποίησε πάσο
        </h1>
    </template>

    <template v-else-if="question.state === 'finishedM'">
        <h1 class="tw-text-center tw-mt-s">{{ question.question.text }}</h1>
        <div class="tw-flex tw-flex-col tw-p-s tw-w-full tw-mb-auto">

            <div class="tw-flex tw-justify-between tw-mb-s">
                <button disabled @click="answerQuestion(question.question.answers[0])"
                :class="question.question.answers[0] === question.question.answer ? 'correct' : ''">
                    {{question.question.answers[0]}}
                </button>
                <button disabled @click="answerQuestion(question.question.answers[1])"
                :class="question.question.answers[1] === question.question.answer ? 'correct' : ''">
                    {{question.question.answers[1]}}
                </button>
            </div>
            <div v-if="question.question.answers.length === 4" class="tw-flex tw-justify-between">
                <button disabled @click="answerQuestion(question.question.answers[2])"
                :class="question.question.answers[2] === question.question.answer ? 'correct' : ''">
                    {{question.question.answers[2]}}
                </button>
                <button disabled @click="answerQuestion(question.question.answers[3])"
                :class="question.question.answers[3] === question.question.answer ? 'correct' : ''">
                    {{question.question.answers[3]}}
                </button>
            </div>

            <h1 v-if="isMyQuestion" class="tw-text-center tw-mt-s" style="color: green;">Πήγες {{diffToStepsMap[question.question.diff]}} μπροστά</h1>
            <h1 v-if="!isMyQuestion" class="tw-text-center tw-mt-s" style="color: #3f99ec;">
                Ο {{game.player.displayName}} πήγε {{diffToStepsMap[question.question.diff]}} μπροστά
            </h1>
        </div>
    </template>

    <template v-else-if="question.state === 'finishedP'">
        <h1 class="tw-text-center tw-mt-s">{{ question.question.text }}</h1>
        <div class="tw-flex tw-flex-col tw-p-s tw-w-full tw-mb-auto">

            <div class="tw-flex tw-justify-between tw-mb-s">
                <button disabled @click="answerQuestion(question.question.answers[0])"
                :class="question.question.answers[0] === question.question.answer ? 'correct' : ''">
                    {{question.question.answers[0]}}
                </button>
                <button disabled @click="answerQuestion(question.question.answers[1])"
                :class="question.question.answers[1] === question.question.answer ? 'correct' : ''">
                    {{question.question.answers[1]}}
                </button>
            </div>
            <div v-if="question.question.answers.length === 4" class="tw-flex tw-justify-between">
                <button disabled @click="answerQuestion(question.question.answers[2])"
                :class="question.question.answers[2] === question.question.answer ? 'correct' : ''">
                    {{question.question.answers[2]}}
                </button>
                <button disabled @click="answerQuestion(question.question.answers[3])"
                :class="question.question.answers[3] === question.question.answer ? 'correct' : ''">
                    {{question.question.answers[3]}}
                </button>
            </div>

            <h1 v-if="isMyQuestion" class="tw-text-center tw-mt-s" style="color: green;">Έλαβες {{question.question.qPoints}} πόντους</h1>
            <h1 v-if="!isMyQuestion" class="tw-text-center tw-mt-s" style="color: #3f99ec;">
                Ο {{game.player.displayName}} έλαβε {{question.question.qPoints}} πόντους
            </h1>
        </div>
    </template>

    <template v-else-if="question.state === 'failedM'">
        <h1 class="tw-text-center tw-mt-s">{{ question.question.text }}</h1>
        <div class="tw-flex tw-flex-col tw-p-s tw-w-full tw-mb-auto">
            <div class="tw-flex tw-justify-between tw-mb-s">
                <button disabled @click="answerQuestion(question.question.answers[0])"
                :class="question.question.answer === question.question.answers[0] ? 'wrong' : question.question.answers[0] === question.question.correct ? 'correct' : ''">
                    {{question.question.answers[0]}}
                </button>
                <button disabled @click="answerQuestion(question.question.answers[1])"
                :class="question.question.answer === question.question.answers[1] ? 'wrong' : question.question.answers[1] === question.question.correct ? 'correct' : ''">
                    {{question.question.answers[1]}}
                </button>
            </div>
            <div v-if="question.question.answers.length === 4" class="tw-flex tw-justify-between">
                <button disabled @click="answerQuestion(question.question.answers[2])"
                    :class="question.question.answer === question.question.answers[2] ? 'wrong' : question.question.answers[2] === question.question.correct ? 'correct' : ''">
                    {{question.question.answers[2]}}
                </button>
                <button disabled @click="answerQuestion(question.question.answers[3])"
                :class="question.question.answer === question.question.answers[3] ? 'wrong' : question.question.answers[3] === question.question.correct ? 'correct' : ''">
                    {{question.question.answers[3]}}
                </button>
            </div>
            <h1 v-if="isMyQuestion" class="tw-text-center tw-mt-s" style="color: #3f99ec;">
                Διάλεξες να πας πίσω
            </h1>
            <h1 v-if="!isMyQuestion" class="tw-text-center tw-mt-s" style="color: #3f99ec;">
                Ο {{game.player.displayName}} διάλεξε να πάει πίσω
            </h1>
        </div>
    </template>

    <template v-else-if="question.state === 'failedP'">
        <h1 class="tw-text-center tw-mt-s">{{ question.question.text }}</h1>
        <div class="tw-flex tw-flex-col tw-p-s tw-w-full tw-mb-auto">
            <div class="tw-flex tw-justify-between tw-mb-s">
                <button disabled @click="answerQuestion(question.question.answers[0])"
                :class="question.question.answer === question.question.answers[0] ? 'wrong' : question.question.answers[0] === question.question.correct ? 'correct' : ''">
                    {{question.question.answers[0]}}
                </button>
                <button disabled @click="answerQuestion(question.question.answers[1])"
                :class="question.question.answer === question.question.answers[1] ? 'wrong' : question.question.answers[1] === question.question.correct ? 'correct' : ''">
                    {{question.question.answers[1]}}
                </button>
            </div>
            <div v-if="question.question.answers.length === 4" class="tw-flex tw-justify-between">
                <button disabled @click="answerQuestion(question.question.answers[2])"
                    :class="question.question.answer === question.question.answers[2] ? 'wrong' : question.question.answers[2] === question.question.correct ? 'correct' : ''">
                    {{question.question.answers[2]}}
                </button>
                <button disabled @click="answerQuestion(question.question.answers[3])"
                :class="question.question.answer === question.question.answers[3] ? 'wrong' : question.question.answers[3] === question.question.correct ? 'correct' : ''">
                    {{question.question.answers[3]}}
                </button>
            </div>
            <h1 v-if="isMyQuestion" class="tw-text-center tw-mt-s" style="color: #3f99ec;">
                Έχασες {{question.question.qPoints}} πόντους
            </h1>
            <h1 v-if="!isMyQuestion" class="tw-text-center tw-mt-s" style="color: #3f99ec;">
                Ο {{game.player.displayName}} έχασε {{question.question.qPoints}} πόντους
            </h1>
        </div>
    </template>


</div>
</template>

<script setup lang="ts">
import { timer } from '@/services/timer.service';
import { onMounted, onUnmounted, ref } from 'vue';
import { HELPS } from '@/environment';

const emits = defineEmits([
  'answer',
  'getHelp',
  'getReward',
  'qTurnFinished',
]);
const props = defineProps({
    question: {
        type: Object,
        required: true,
    },
    isMyQuestion: {
        type: Boolean,
    },
    canDoAction: {
        type: Boolean,
    },
    IS_SINGLE: {
        type: Boolean,
    },
    game: {
        type: Object,
        required: true,
    },
    player: {
        type: Object,
        required: true,
        default: () => ({}),
    }
});
const diffToStepsMap: any = {
    'easy': `1 βήμα`,
    'medium': `2 βήματα`,
    'hard': `3 βήματα`,
};
const _timer = timer(0, 100, 150);
const qTimer = ref<number | null>(100);
const answerQuestion = (answer: string) => {
    _timer.reset();
    qTimer.value = null;
    emits('answer', answer);
}
const canGetHelp = (help: 'help_50' | 'help_skip') => {
    const player = props.player;
    const maxHelps = help === 'help_50' ? props.game.maxHelps.help_50 : props.game.maxHelps.skip;
    const userHelps = help === 'help_50' ? player.helpUsed.help_50 : player.helpUsed.skip;
    const pointsNeeded = HELPS[help as keyof typeof HELPS];
    const userPoints = player.points;

    const hasEnoughHelps = userHelps < maxHelps;
    const hasEnoughPoints = userPoints >= pointsNeeded;
 
    return (props.isMyQuestion && props.canDoAction && hasEnoughPoints && hasEnoughHelps);
};
const getHelp = (help: 'help_50' | 'help_skip') => {
    _timer.reset();
    qTimer.value = 100;
    if (help === 'help_50') {
        startQuestionTimer();
    }
    emits('getHelp', help);
}
const getReward = (rewardType: 'points' | 'move' | 'go_back' | 'remove_points') => emits('getReward', rewardType);

const startQuestionTimer = () => {
    if ((props.isMyQuestion || props.IS_SINGLE) && props.question.state === 'waitingAns') {
        _timer.subscribe(v => {
            if (v === -999) {
                emits('qTurnFinished');
                return;
            }
            const rel = ((100 * v) / 50);
            qTimer.value = rel;
        });
    }
}

onMounted(() => {
   startQuestionTimer();
});
onUnmounted(() => {
    _timer.stop();
});

</script>

<style scoped>
.question-container {
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
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    height: 600px;
}

h1 {
    word-break: break-word;
}


.question-text {
    font-size: 20pt;
    font-weight: 500;
    text-align: center;
    margin-top: 1rem;
}

button {
    width: 48%;
    outline: 0;
    white-space: pre-wrap !important;
    height: 100px;
}

.wrong { 
    background: red !important;
    color: black !important;
}

.correct {
    background: green !important;
    color: black !important;
}

.ball {
    background: blue;
    border-radius: 50%;
    width: 10px;
    height: 10px;
}
</style>