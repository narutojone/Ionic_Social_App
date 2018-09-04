import { PathTimeObject } from "./pathtime-object";
import { TranslateService } from "ng2-translate";
import { appInjector } from "../shared/app-injector";
import { Injector } from '@angular/core';

export class PathtimeNotification implements PathTimeObject {
  public id: number;
  public title_en: String;
  public title_fr: String;
  public message_en: String;
  public message_fr: String;
  public image: String;
  public event_id: number;
  public group_id: number;
  public path_id: number;
  public place_id: number;
  public notifiation_type: String;
  public read: boolean;

  private translate: TranslateService;

  constructor() {
      let injector: Injector = appInjector(); // get the stored reference to the injector
      this.translate = injector.get(TranslateService);
  }

  from(notif: PathtimeNotification): void {
    this.id = notif.id;
    this.image = notif.image;
    this.title_en = notif.title_en;
    this.title_fr = notif.title_fr;
    this.message_en = notif.message_en;
    this.message_fr = notif.message_fr;
    this.event_id = notif.event_id;
    this.group_id = notif.group_id;
    this.path_id = notif.path_id;
    this.place_id = notif.place_id;
    this.notifiation_type = notif.notifiation_type;
    this.read = notif.read;
  }

  getTitle() {
    if (this.translate.currentLang == "en") {
      return this.title_en;
    }
    else {
      return this.title_fr;
    }
  }

  getMessage() {
    if (this.translate.currentLang == "en") {
      return this.message_en;
    }
    else {
      return this.message_fr;
    }
  }
}
