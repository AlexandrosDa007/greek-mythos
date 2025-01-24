import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ProfileImgComponent } from './profile-img/profile-img.component';


const svgUrls: Record<string, string> = {
    back_button: 'assets/back.svg',
    plus: 'assets/plus.svg',
    crown: 'assets/crown.svg',
    out: 'assets/out.svg',
    invite: 'assets/invite.svg',
    check: 'assets/check.svg',
    upload: 'assets/upload.svg',
    die: 'assets/die.svg',
    settings1: 'assets/settings.svg',
    settings2: 'assets/settings2.svg',
};

const materialComponents = [
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSliderModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatMenuModule,
    MatCardModule,
    MatSnackBarModule,
    MatTableModule,
    MatListModule,
    MatProgressBarModule,
    MatCheckboxModule,
];

@NgModule({
    declarations: [ProfileImgComponent],
    imports: [
        ...materialComponents,
        HttpClientModule
    ],
    exports: [
        ...materialComponents,
        ProfileImgComponent
    ],
    providers: [],
})
export class MaterialModule {
    constructor(
        iconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer,
    ) {
        Object.keys(svgUrls).forEach(id => {
            const url = svgUrls[id];
            iconRegistry.addSvgIcon(id, sanitizer.bypassSecurityTrustResourceUrl(url));
        });
    }
}