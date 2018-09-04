import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController, ViewController } from 'ionic-angular';

import { New } from '../../models/new';
import { PathTimeObject } from '../../models/pathtime-object';
import { Place } from '../../models/place';
import { Path } from '../../models/path';
import { Comment } from '../../models/comment';

import { ServerService, ServerGetResponse } from '../../shared/server.service';
import { UserService } from '../../shared/user.service';
import { CompleteFeedService } from '../../shared/complete-feed.service';
import { User } from "../../models/user";
import { ProfilePage } from "../profile/profile";
import { AutoCompleteComponent } from "ionic2-auto-complete";
import { PlaceDetailPage } from "../place/place-detail";
import { CommentPathPage } from "../comment/comment-path";
import { PathValidationPage } from "./path-validation";
import { PathDetailPage } from "./path-detail";
import { PerformPathPage } from "../perform/perform-path";
import { PathMapPage } from "./path-map";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";

@Component({
  selector: 'page-undone-path-detail',
  templateUrl: 'undone-path-detail.html'
})

export class UndonePathDetailPage {
  @Input() path: Path;
  @Input() u: User;

  constructor(private user: UserService, public navCtrl: NavController, private loadingCtrl: LoadingController,
    private server: ServerService, public params: NavParams, private alertCtrl: AlertController,
    private modalCtrl: ModalController, private viewCtrl: ViewController, private analyticsService: AnalyticsService) {
    this.path = this.params.get("path");
    this.u = this.params.get("user");
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreenPath(SegmentEvents.UndonePath, this.path);
  }


  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  goPathMap(): void {
    this.navCtrl.push(PathMapPage, { path: this.path });
  }

  goPlaceDetail(p: Place): void {
    if (p.opening_hours) {
      this.navCtrl.push(PlaceDetailPage, { place: p });
    }
    else {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Download Place Infos'),
        dismissOnPageChange: true
      });

      loading.present();
      this.server.getPlace(p.google_id)
        .subscribe(place => {
          p = place;
          this.navCtrl.push(PlaceDetailPage, { place: p });
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
    }
  }

  validatePath(path: Path): void {
    this.navCtrl.push(PerformPathPage, { path: path });
  }

  goPathDetail(path: Path): void {
    this.navCtrl.push(PathDetailPage, { path: path })
    .then(() => {
        const index = this.viewCtrl.index;
        this.navCtrl.remove(index);
        this.navCtrl.remove(index - 1);
        this.user.getUser().pathList = new Array<Path>();
        this.u.pathList = new Array<Path>();
    });
  }
}
