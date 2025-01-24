import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { GameService } from '../services/game.service';
import { ModalsService } from '../services/modals.service';
import { GameComponent } from '../views/game/game.component';

@Injectable({
    providedIn: 'root'
})
export class GameGuard implements CanDeactivate<GameComponent> {

    constructor(
        private modalsService: ModalsService,
        private gameService: GameService,
    ) { }
    canDeactivate(
        component: GameComponent,
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        return true; //TODO
    }
}
