<template>
    <div v-if="showMainContent" class="tw-flex tw-h-full">
        <Header v-if="isUserLoggedIn" :menu-items="menuItems" @logout="logoutUser" />
        <main class="tw-flex tw-flex-1 tw-h-full tw-items-center tw-justify-center">
            <router-view></router-view>
        </main>
    </div>
    <Verified v-else-if="showVerifiedScreen" />
    <div v-else>
        TODO: create loader
    </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import Verified from './pages/Login/Verified/Verified.vue';
import { RouterView } from 'vue-router';
import Header from './components/Header/Header.vue';
import { MenuItem } from './models/menu-item';
import { useUserStore } from './store/user';
import { onBeforeUnmount } from 'vue';
import { log } from './utilities/log';
import { computed } from 'vue';

const menuItems: MenuItem[] = [
    { name: 'Αρχική', url: '/' },
    { name: 'Παιχνίδι με Η/Υ', url: '/single-player' },
    { name: 'Δωμάτια', url: '/rooms' },
    { name: 'Προφίλ', url: '/profile' },
    { name: 'Φίλοι', url: '/friends' },
];

const userStore = useUserStore();
const { initializeUserSubscription, logoutUser } = userStore;
const { isUserLoggedIn } = storeToRefs(userStore);
const unsubscribe = initializeUserSubscription();

onBeforeUnmount(() => {
    log('Unsubing');
    unsubscribe();
});

const showMainContent = computed(() => {
    const isUserAndVerified = !!userStore.userRecord && userStore.getIsUserVerified;
    const isNotUser = !userStore.userRecord;
    return !userStore.getIsLoading && (isUserAndVerified || isNotUser);
});
const showVerifiedScreen = computed(() => {
    const isUserAndNotVerified = !!userStore.userRecord && !userStore.getIsUserVerified;
    return isUserAndNotVerified;
});
</script>
