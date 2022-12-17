<template>
    <Card is-large>
        <div class="tw-w-1/2 tw-flex tw-flex-col tw-h-full">
            <h1 class="tw-text-xl tw-text-center tw-mb-n">Το παιχνίδι σου</h1>
            <hr class="tw-w-full tw-mb-n" />
            <SinglePlayerCardSection title="Μέγεθος παιχνιδού">
                <div class="tw-flex tw-items-center tw-p-n tw-pl-0 tw-gap-n">
                    <label class="tw-text-s tw-cursor-pointer" for="small">Μικρό</label>
                    <input class="tw-cursor-pointer" id="small" name="gameType"
                        :checked="options.gameType === GameType.SMALL" @change="options.gameType = GameType.SMALL"
                        type="radio">
                    <label class="tw-text-s tw-cursor-pointer" for="big">Μεγάλο</label>
                    <input class="tw-cursor-pointer" :checked="options.gameType === GameType.BIG"
                        @change="options.gameType = GameType.BIG" id="big" name="gameType" type="radio">
                </div>
            </SinglePlayerCardSection>
            <SinglePlayerCardSection title="">
                <Input label="Πόντοι-Στόχος" :value="options.scoreTarget" :type="'number'"
                    :input-handler="(ev: Event) => options.scoreTarget = Number((ev.target as HTMLInputElement).value)"
                    :min="50" />
            </SinglePlayerCardSection>

            <SinglePlayerCardSection title="Μέγιστος αριθμός βοηθειών">
                <Input label="Βοήθεια 50/50" :value="options.maxHelps.help50" :type="'number'"
                    :input-handler="(ev: Event) => options.maxHelps.help50 = Number((ev.target as HTMLInputElement).value)" />

                <Input class="tw-mt-n" label="Βοήθεια πάσο" :value="options.maxHelps.helpSkip" :type="'number'"
                    :input-handler="(ev: Event) => options.maxHelps.helpSkip = Number((ev.target as HTMLInputElement).value)" />
            </SinglePlayerCardSection>


            <RaisedButton class="tw-mt-n" text="Παίξε" @click.native="startSinglePlayer()" />

        </div>
    </Card>
</template>

<script lang=ts setup>
import Card from '@/components/common/Card.vue';
import SinglePlayerCardSection from './SinglePlayerCardSection.vue';
import Input from '@/components/Input/Input.vue';
import { ref } from 'vue';
import { GameType } from '@/models/game';
import RaisedButton from '@/components/common/RaisedButton.vue';

const options = ref<{
    gameType: GameType,
    scoreTarget: number,
    maxHelps: {
        help50: number,
        helpSkip: number,
    }
}>({
    gameType: GameType.SMALL,
    scoreTarget: 150,
    maxHelps: {
        help50: 3,
        helpSkip: 2,
    },
});

function startSinglePlayer() {
    alert('starting single player')
}

</script>
