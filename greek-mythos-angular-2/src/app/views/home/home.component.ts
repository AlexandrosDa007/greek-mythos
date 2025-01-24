import { Component, OnInit } from '@angular/core';
import { TEXTS } from '@env/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  heroes = [
    { name: 'Αχχιλέας', image: '../../../assets/achilles.png', description: TEXTS.descriptions.achilles },
    { name: 'Περσέας', image: '../../../assets/perseus.png', description: TEXTS.descriptions.perseus },
    { name: 'Ιππολύτη', image: '../../../assets/hippo.png', description: TEXTS.descriptions.hippo },
    { name: 'Ηρακλής', image: '../../../assets/hercules.png', description: TEXTS.descriptions.hercules },
  ]
  constructor() { }

  ngOnInit(): void { }

}
