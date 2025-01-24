import { Injectable } from '@angular/core';
import { Settings } from '@app/models/settings';

class SafeLocalStorage {
    static getStringItem(key: string): string {
        const item = localStorage.getItem(key);
        return item ?? '';
    }

    static getFloatItem(key: string): number {
        const item = localStorage.getItem(key);
        
        if (!item) {
            return 0;
        }

        try {
            return parseFloat(item);
        } catch (error) {
            return -999;
        }
    }

    static getBoolean(key: string): boolean {
        const item = localStorage.getItem(key);
        
        if (!item) {
            return false;
        }

        return item === 'true';
    }
}

@Injectable({
    providedIn: 'root'
})
export class AudioService {


    // muteSoundEffects: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(JSON.parse(localStorage.getItem('effectsMute')));

    constructor() { }

    playMoveSound(): void {
        const effectsMute = SafeLocalStorage.getBoolean('effectsMute');
        if (effectsMute) {
            return;
        }
        const effectsVol = SafeLocalStorage.getFloatItem('effects');
        const moveAudio = document.getElementById('move') as HTMLAudioElement;
        moveAudio.volume = effectsVol ?? 0.5;
        moveAudio.play();
    }

    playBackgroundMusic(): void {
        const musicMute = SafeLocalStorage.getBoolean('musicMute');
        if (musicMute) {
            return;
        }
        const musicVol = SafeLocalStorage.getFloatItem('music');

        const moveAudio = document.getElementById('music') as HTMLAudioElement;
        moveAudio.loop = true;
        moveAudio.volume = musicVol ?? 0.5;
        moveAudio.play();
    }

    stopBackgroundMusic(): void {
        const moveAudio = document.getElementById('music') as HTMLAudioElement;
        moveAudio.pause();
    }

    getEffectsVolume(): number {
        return  SafeLocalStorage.getFloatItem('effects');
    }
    

    getAudioSettings(): Settings {
        const effects = SafeLocalStorage.getFloatItem('effects');
        const music = SafeLocalStorage.getFloatItem('music');
        const effectsMute = SafeLocalStorage.getBoolean('effectsMute');
        const musicMute = SafeLocalStorage.getBoolean('musicMute');

        return {
            effects,
            music,
            effectsMute,
            musicMute,
        }
    }

}