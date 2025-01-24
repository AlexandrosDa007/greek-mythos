import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-img',
  templateUrl: './profile-img.component.html',
  styleUrls: ['./profile-img.component.scss']
})
export class ProfileImgComponent implements OnInit, OnChanges {

  @Input() size: { width: number, height: number } = {
    width: 100,
    height: 100,
  };
  @Input() imgUrl?: string;

  fallBackImage = 'assets/account.png';
  constructor() { }

  ngOnInit(): void {
    if (!this.imgUrl) {
      this.imgUrl = this.fallBackImage;
    }
  }

  ngOnChanges(): void {
    if (!this.imgUrl) {
      this.imgUrl = this.fallBackImage;
    }
  }
}
