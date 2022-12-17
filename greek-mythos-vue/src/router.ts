import { createRouter, createWebHistory, RouterOptions } from 'vue-router';
import Home from './pages/Home/Home.vue';
import Login from './pages/Login/Login.vue';
import { useUserStore } from './store/user';
import { storeToRefs } from 'pinia';
import SinglePlayer from '@/pages/SinglePlayer/SinglePlayer.vue';

const routes: RouterOptions['routes'] = [
    {
        path: '/',
        component: Home,
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: '/single-player',
        component: SinglePlayer,
        meta: {
            requiresAuth: true,
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from) => {
    const userStore = useUserStore();

    if (to.meta.requiresAuth && !userStore.isUserLoggedIn && !userStore.getIsLoading) {
        return '/login';
    }
    if (to.name === 'Login' && userStore.isUserLoggedIn) {
        return '/';
    }
});

export default router;
