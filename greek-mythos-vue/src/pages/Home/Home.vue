<template>
    <section class="tw-flex tw-flex-col tw-w-full tw-h-full tw-relative tw-items-center tw-text-white tw-text-s">
        <div class="tw-h-full tw-bg-[url('assets/background.jpg')] tw-blur-md tw-absolute tw-w-full">
        </div>
        <section class="tw-p-s tw-z-0 tw-flex tw-h-full tw-flex-col tw-items-center tw-w-full">
            <h2 class="tw-font-bold tw-text-xl">Καλως ήρθατε στο Greek-Mythos</h2>
            <p class="tw-mt-xl">
                Το πιο διαδραστικό παιχνίδι εκμάθησης της Ελληνικής Μυθολογίας.
            </p>
            <h3 class="tw-font-bold tw-my-xl">Οι ήρωές μας</h3>
            <ul class="tw-flex tw-flex-col tw-h-full tw-w-full tw-items-center">
                <li v-for="hero of heroes" :key="hero.name"
                    class="tw-w-[75%] tw-flex tw-items-center tw-m-auto tw-content-around">
                    <img :src="hero.image" class="tw-w-[100px] tw-h-[100px] tw-mr-s" width="100px" height="100px"
                        alt="">
                    <h4>{{ hero.name }}</h4>
                    <p class="tw-max-w-[400px] tw-my-0 tw-mx-auto">{{ hero.description }}</p>
                </li>
            </ul>

            <p class="tw-mt-auto tw-w-full tw-flex tw-text-s tw-font-serif">
                Αυτό το παιχνίδι δημιουργήθηκε για την πτυχιακή εργασία του φοιτητή <span
                    class="tw-font-semibold tw-text-black tw-ml-n">Αλέξανδρου Δάλτση</span>
                <a class="tw-ml-auto" href="mailto:info.alexdaltsis@gmail.com?subject=Bug Report">Πρόβλημα? Επικοινώνησε
                    μαζί μου</a>
            </p>
        </section>
    </section>
</template>

<script lang="ts" setup>
import { TEXTS } from '@/environment';
import achilles from '@/assets/achilles.png';
import perseus from '@/assets/perseus.png';
import hippo from '@/assets/hippo.png';
import hercules from '@/assets/hercules.png';

const heroes = [
    { name: 'Αχχιλέας', image: achilles, description: TEXTS.descriptions.achilles },
    { name: 'Περσέας', image: perseus, description: TEXTS.descriptions.perseus },
    { name: 'Ιππολύτη', image: hippo, description: TEXTS.descriptions.hippo },
    { name: 'Ηρακλής', image: hercules, description: TEXTS.descriptions.hercules },
];
</script>