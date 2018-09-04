import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NavController, LoadingController, NavParams, ModalController, ViewController } from 'ionic-angular';

import { ServerService, ServerGetResponse } from '../../../shared/server.service';
import { UserService } from '../../../shared/user.service';
import { CompleteFeedService } from '../../../shared/complete-feed.service';
import { User } from "../../../models/user";
import { ProfilePage } from "../../profile/profile";

import { AutoCompleteComponent } from "ionic2-auto-complete";
import { SegmentEvents } from "../../../shared/analytics.model";
import { AnalyticsService } from "../../../shared/analytics.service";
import { Keyboard } from "@ionic-native/keyboard";
import { CreationGroupPage } from "../creation-group/creation-group";
import { GroupDetailPage } from "../group-detail/group-detail";
import { Group } from "../../../models/group";
import { Event } from "../../../models/event";
import { PtTap } from "../../../shared/ptTap.model";
import { PathTimeObject } from "../../../models/pathtime-object";
import { Path } from "../../../models/path";
import { EventType } from "../../../models/enum";
import { EventCreationPage } from "../../event/event-creation/event-creation";

@Component({
  selector: 'page-select-group',
  templateUrl: 'select-group.html'
})
export class SelectGroupPage {
  public groups: Array<Group>;
  private limitGroups: number;
  private offsetGroups: number;
  private ptTap: PtTap;
  private pto: PathTimeObject;


  private lastGroups: Array<Group>;

  constructor(private server: ServerService, private navCtrl: NavController, public params: NavParams, private loadingCtrl: LoadingController, private keyboard: Keyboard,
    private user: UserService, private analyticsService: AnalyticsService, private modalCtrl: ModalController, private viewCtrl: ViewController) {
      this.pto = this.params.get("pto");
  }

  back() {
    this.viewCtrl.dismiss();
  }

  goGroupCreationPage(): void {
    this.navCtrl.push(CreationGroupPage);
  }

  ionViewWillEnter() {
    this.limitGroups = 5;
    this.offsetGroups = 0
    this.newGroups();
  }

  touchStartPtTap($event) {
    this.ptTap = new PtTap(event);
  }

  touchEndPtTap($event) {
    return this.ptTap.needFire(event);
  }

  getMoreGroups(event: any): void {
    this.offsetGroups = this.offsetGroups + this.limitGroups;
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent(''),
    });
    loading.present();

    this.server.getGroups(this.limitGroups, this.offsetGroups)
      .subscribe(groups => {
        this.groups = this.groups.concat(groups);
        this.lastGroups = groups;
        loading.dismiss();
      });
  }

  refresh$(event): void {
    this.limitGroups = 5;
    this.offsetGroups = 0;
    this.newGroups();

    setTimeout(() => {
      event.complete();
    }, 1000);
  }

  newGroups(): void {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent(''),
    });
    loading.present();

    this.server.getGroups(this.limitGroups, this.offsetGroups)
      .subscribe(groups => {
        this.groups = new Array<Group>();
        this.groups = this.groups.concat(groups);
        this.lastGroups = groups;
        loading.dismiss();
      });
  }

  selectGroup(group){
    let event = new Event<PathTimeObject>();
    event.group = group;
    event.activity = this.pto;
    if (this.pto instanceof Path) {
      event.event_type = EventType.Path;
    } else {
      event.event_type = EventType.Place;
    }
    let createEventModal = this.modalCtrl.create(EventCreationPage, { event: event });
    createEventModal.onDidDismiss(data => {
      if (data)
      {
        this.viewCtrl.dismiss(data);
      }
    });
    createEventModal.present();
  }

}
