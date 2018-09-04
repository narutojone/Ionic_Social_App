import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Category } from '../models/category';
import { Companion } from '../models/companion';
import { Mood } from '../models/mood';
import { ServerService } from './server.service';


@Injectable()
export class FilterService {
  moods: Array<Mood> = [
//    { text: "EXPLORATION.MOODS.ADVENTURER", value: Mood.Adventurer, icon: 'md-pt-adventurer', icon_outline: 'md-pt-adventurer-outline' },
//    { text: "EXPLORATION.MOODS.CHILL", value: Mood.Chill, icon: 'md-pt-chill', icon_outline: 'md-pt-chill-outline' },
//    { text: "EXPLORATION.MOODS.FESTIVE", value: Mood.Festive, icon: 'md-pt-festive', icon_outline: 'md-pt-festive-outline' }
  ];

  categories: Array<Category> = [
//    { text: "EXPLORATION.CATEGORIES.BAR", value: <Category>{id: 1, name: "FIX"}, icon: 'md-pt-logo', icon_outline: 'md-pt-logo-outline' },
//    { text: "EXPLORATION.CATEGORIES.RESTAURANT", value: <Category>{id: 52, name: "ME"}, icon: 'md-pt-shot', icon_outline: 'md-pt-shot-outline' },
//    { text: "EXPLORATION.CATEGORIES.NIGHTCLUB", value: <Category>{id: 95, name: "!!"}, icon: 'md-pt-coktail', icon_outline: 'md-pt-coktail-outline' }
  ];

  whos: Array<Companion> = [
    new Companion("EXPLORATION.WHOS.PATHER", 'md-pt-logo'),
    new Companion("EXPLORATION.WHOS.FRIEND", 'md-pt-friends'),
    new Companion("EXPLORATION.WHOS.SOLO", 'md-pt-solo'),
    new Companion("EXPLORATION.WHOS.COUPLE", 'md-pt-couple'),
    new Companion("EXPLORATION.WHOS.FAMILY", 'md-pt-circles')
  ];

  whosWithoutPather: Array<Companion> = [
    new Companion("EXPLORATION.WHOS.FRIEND", 'md-pt-friends'),
    new Companion("EXPLORATION.WHOS.SOLO", 'md-pt-solo'),
    new Companion("EXPLORATION.WHOS.COUPLE", 'md-pt-couple'),
    new Companion("EXPLORATION.WHOS.FAMILY", 'md-pt-circles')
  ];


  constructor(plateform: Platform, private server: ServerService) {
  }

  init() {
    this.server.getCategories()
    .subscribe(categories => {
      this.categories = new Array<Category>();
      for (var i = 0; i < categories.length; ++i) {
        let c = categories[i];
        let new_c = new Category();
        new_c.from(c);
        this.categories.push(new_c);
      }
    })

    this.server.getMoods()
    .subscribe(moods => {
      this.moods = new Array<Mood>();
      for (var i = 0; i < moods.length; ++i) {
        let m = moods[i];
        let new_m = new Mood();
        new_m.from(m);
        this.moods.push(new_m);
      }
    })
  }


}
