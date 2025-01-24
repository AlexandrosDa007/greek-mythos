

export const LocalStorage = {
    getItem: (item: string) => {
        const _ = localStorage.getItem(item);
        try {
            if (!_)
                return '';
            return JSON.parse(_);
        } catch (error) {
            return '';
        }
    }
}

function getItemAsNumber(item: string) {
    const _ = LocalStorage.getItem(item);
    if (!_) {
        return 0;
    } else {
        return Number.parseFloat(_);
    }
}

export class AudioService {

    
    // muteSoundEffects: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(JSON.parse(localStorage.getItem('effectsMute')));

    constructor() { }

    playMoveSound(): void {
        const effectsMute = LocalStorage.getItem('effectsMute');
        if (effectsMute) {
            return;
        }
        const effectsVol = getItemAsNumber('effects');
        const moveAudio = document.getElementById('move') as HTMLAudioElement;
        moveAudio.volume = effectsVol ?? 0.5;
        moveAudio.play();
    }

    playBackgroundMusic(): void {
        const musicMute = LocalStorage.getItem('musicMute') === true;
        if (musicMute) {
            return;
        }
        const musicVol =getItemAsNumber('music');

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