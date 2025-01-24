import { AudioService, LocalStorage } from "@/services/audio.service";
import { onBeforeMount, onBeforeUnmount, ref } from "vue";

export function useAudio() {
    const audioService = new AudioService();
    const settings = ref({
        music: 100,
        effects: 100,
        musicMute: false,
        effectsMute: false,
    });

    const turnVolume = (type: 'music' | 'effects', volume: number) => {
        console.log(volume);
        const newVolume = volume / 100;
        localStorage.setItem(type, `${newVolume}`);
    
        // recalculate settings
        settings.value[type] = newVolume;
        audioService.stopBackgroundMusic();
        audioService.playBackgroundMusic();
    }
    
    const setMute = (type: 'musicMute' | 'effectsMute', checked: boolean) => {
        localStorage.setItem(type, JSON.stringify(checked));
        settings.value[type] = checked;
        audioService.stopBackgroundMusic();
        audioService.playBackgroundMusic();
    }

    onBeforeMount(() => {
        settings.value = {
            music: Number.parseFloat(LocalStorage.getItem('music')),
            effects: Number.parseFloat(LocalStorage.getItem('effects')),
            musicMute: LocalStorage.getItem('musicMute') === true,
            effectsMute: LocalStorage.getItem('effectsMute'),
        }
    })

    onBeforeUnmount(() => {
        audioService.stopBackgroundMusic();
    })

    return {
        settings,
        turnVolume,
        setMute,
    }
}