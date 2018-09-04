import { Component, Input } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController, AlertController, LoadingController } from 'ionic-angular';

import { Place } from '../../models/place';

import { UserService } from '../../shared/user.service';
import { User } from "../../models/user";
import { ProfilePage } from "../profile/profile";
import { Category } from "../../models/category";
import { FilterService } from "../../shared/filter.service";
import { Mood } from "../../models/mood";
import { Path } from "../../models/path";
import { Companion } from "../../models/companion";
import { PlaceDetailPage } from "../place/place-detail";
import { ServerService } from "../../shared/server.service";
import { AnalyticsService } from "../../shared/analytics.service";
import { SegmentEvents } from "../../shared/analytics.model";

@Component({
  selector: 'page-path-setting',
  templateUrl: 'path-setting.html'
})

export class PathSettingPage {
  @Input() path: Path;

  constructor(private user: UserService, public navCtrl: NavController, public params: NavParams,
    private viewCtrl: ViewController, private modalCtrl: ModalController, private filter: FilterService,
    private alertCtrl: AlertController, private server: ServerService, private loadingCtrl: LoadingController,
    private analyticsService: AnalyticsService) {
    this.path = this.params.get("path");
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreenPath(SegmentEvents.PathSetting, this.path);
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  back() {
    this.viewCtrl.dismiss(null);
  }

  updatePath() {
    if (this.path.name && this.path.name != "" && (this.path.getFirstMood())) {
      this.dismiss();
    }
    else {
      this.showPathAlert();
    }
  }

  deletePath() {
    let alert = this.alertCtrl.create({
      title: 'Are you sure',
      message: 'Do you really want to delete this path?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.server.deletePath(this.path.id).subscribe();
            let data = { delete: true };
            this.viewCtrl.dismiss(data);
          }
        }
      ]
    });
    alert.present();
  }

  dismiss() {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent('Update Path'),
      dismissOnPageChange: true
    });

    loading.present();
    this.analyticsService.trackEvent(SegmentEvents.updatePath, { place: this.analyticsService.trackPathWithoutUser(this.path) });
    this.server.updatePath(this.path)
      .subscribe(path => {
        let data = { path: path };
        loading.dismiss();
        this.viewCtrl.dismiss(data);
      }, error => {
        //FIXME: Dislplay Toast
        loading.dismiss();
        this.showErrorAlert(error);
      });
  }

  addMood(mood: Mood): any {
    this.path.addMood(mood);
  }

  removeMood(mood: Mood): any {
    this.path.removeMood(mood);
  }

  goPlaceDetail(p: Place) {
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
          loading.dismiss();
          this.navCtrl.push(PlaceDetailPage, { place: p });
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
    }
  }

  showPathAlert() {
    let alert = this.alertCtrl.create({
      title: 'Not so fast!',
      subTitle: 'You must fill every informations of the path and choose at least one mood.',
      buttons: ['OK']
    });
    alert.present();
  }

  showErrorAlert(error: any) {
    let alert = this.alertCtrl.create({
      title: 'Oops something went wrong!',
      subTitle: error,
      buttons: ['OK']
    });
    alert.present();
  }
}
