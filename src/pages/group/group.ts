import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NavController, LoadingController, Slides } from 'ionic-angular';

import { ServerService, ServerGetResponse } from '../../shared/server.service';
import { UserService } from '../../shared/user.service';
import { CompleteFeedService } from '../../shared/complete-feed.service';
import { User } from "../../models/user";
import { ProfilePage } from "../profile/profile";

import { AutoCompleteComponent } from "ionic2-auto-complete";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";
import { PtTap } from "../../shared/ptTap.model";
import { Keyboard } from "@ionic-native/keyboard";
import { CreationGroupPage } from "./creation-group/creation-group";
import { Group } from "../../models/group";
import { GroupDetailPage } from "./group-detail/group-detail";
import { PushProvider } from "../../shared/pushprovider.service";
import { NotificationsPage } from "../notifications/notifications";

@Component({
  selector: 'page-group',
  templateUrl: 'group.html'
})
export class GroupPage implements AfterViewInit {
  @ViewChild('slides')
  private slides: Slides;

  public groups: Array<Group>;
  public allGroups: Array<Group>;
  private limitGroups: number;
  private offsetGroups: number;
  private ptTap: PtTap;
  private searchInput: String;

  private lastGroups: Array<Group>;

  constructor(private server: ServerService, private navCtrl: NavController, private loadingCtrl: LoadingController, private keyboard: Keyboard,
    private user: UserService, private analyticsService: AnalyticsService, public pushProvider: PushProvider) {
    this.searchInput = '';
    this.allGroups = new Array<Group>();
  }

  ngAfterViewInit(): void {
  }

  goGroupCreationPage(): void {
    this.navCtrl.push(CreationGroupPage);
  }

  onSearchInputChange(event) {
    this.groups = this.allGroups.filter(g => g.name.toLowerCase().indexOf(this.searchInput.toLowerCase()) > -1);
  }

  onCancel(event) {
    this.groups = Array.from(new Set(this.groups.concat(this.allGroups)));
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
        this.groups = Array.from(new Set(this.groups.concat(groups)));
        this.allGroups = Array.from(new Set(this.allGroups.concat(this.groups)));
        this.lastGroups = groups;
        if (this.slides)
          this.slides.slideTo(0);
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
        this.groups = Array.from(new Set(this.groups.concat(groups)));
        this.lastGroups = groups;
        this.allGroups = Array.from(new Set(this.allGroups.concat(this.groups)));
        if (this.slides)
          this.slides.slideTo(0);
        if (this.pushProvider.event_id != undefined) {
          var event_id = this.pushProvider.event_id;
          this.pushProvider.event_id = undefined;
          this.navCtrl.push(NotificationsPage);
          //this.navCtrl.push('offerzonePage', { from_tab: this.pushProvider.event_id });
        }
        loading.dismiss();
      });
  }

  // goProfile(u: User): void {
  //   this.navCtrl.push(ProfilePage, { u: u });
  // }

  goGroupDetail(g: Group): void {
    this.navCtrl.push(GroupDetailPage, { group: g });
  }

  // goPlaceDetail(p: Place): void {
  //   if (p.opening_hours) {
  //     this.navCtrl.push(PlaceDetailPage, { place: p });
  //   }
  //   else {
  //     let loading = this.loadingCtrl.create({
  //       spinner: 'hide',
  //       content: this.server.getLoadingContent('Download Place Infos'),
  //       dismissOnPageChange: true
  //     });
  //     loading.present();
  //     this.server.getPlace(p.google_id)
  //       .subscribe(place => {
  //         p = place;
  //         this.navCtrl.push(PlaceDetailPage, { place: p });
  //       }, error => {
  //         //FIXME: Dislplay Toast
  //         loading.dismiss();
  //       });
  //   }
  // }

}
