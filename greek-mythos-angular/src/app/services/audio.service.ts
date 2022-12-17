import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AudioService {


    // muteSoundEffects: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(JSON.parse(localStorage.getItem('effectsMute')));

    constructor() { }

    playMoveSound(): void {
        const effectsMute = JSON.parse(localStorage.getItem('effectsMute'));
        if (effectsMute) {
            return;
        }
        const effectsVol = Number.parseFloat(localStorage.getItem('effects'));
        const moveAudio = document.getElementById('move') as HTMLAudioElement;
        moveAudio.volume = effectsVol ?? 0.5;
        moveAudio.play();
    }

    playBackgroundMusic(): void {
        const musicMute = JSON.parse(localStorage.getItem('musicMute')) === true;
        if (musicMute) {
            return;
        }
        const musicVol = Number.parseFloat(localStorage.getItem('music'));

        const moveAudio = document.getElementById('music') as HTMLAudioElement;
        moveAudio.loop = true;
        moveAudio.volume = musicVol ?? 0.5;
        moveAudio.play();
    }

    stopBackgroundMusic(): void {
        const moveAudio = document.getElementById('music') as HTMLAudioElement;
        moveAudio.pause();
    }

}