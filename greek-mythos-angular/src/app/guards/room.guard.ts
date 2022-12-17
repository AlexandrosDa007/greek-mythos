import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalsService } from '../services/modals.service';
import { RoomComponent } from '../views/room/room.component';

@Injectable({
    providedIn: 'root'
})
export class RoomGuard implements CanDeactivate<RoomComponent> {
    constructor(
        private modalsService: ModalsService,
    ){}
    canDeactivate(
        component: RoomComponent,
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        const res = this.modalsService.openLeaveRoomModal();
        return from(res).pipe(
            map(res => {
                console.log(res);
                return res;
            })
        );
    }
}