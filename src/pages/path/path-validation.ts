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
  selector: 'page-path-validation',
  templateUrl: 'path-validation.html'
})

export class PathValidationPage {
  @Input() path: Path;
  @Input() uniqueSection: boolean;

  constructor(private user: UserService, public navCtrl: NavController, public params: NavParams, 
    private viewCtrl: ViewController, private modalCtrl: ModalController, private filter: FilterService,
    private alertCtrl: AlertController, private server: ServerService, private loadingCtrl: LoadingController,
    private analyticsService: AnalyticsService) {
    this.path = this.params.get("path");
    this.uniqueSection = this.params.get("unique") ? this.params.get("unique") : false;
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreenPath(SegmentEvents.PathValidation, this.path);
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  back() {
    this.viewCtrl.dismiss(null);
  }

  addWith(who: Companion): any {
    this.path.addWith(who);
  }

  removeWith(who: Companion): any {
    this.path.removeWith(who);
  }

  createPath() {
    if (this.path.name && this.path.name != "" && ( this.uniqueSection || this.path.getFirstMood())){
      this.dismiss();
    }
    else {
      this.showPathAlert();
    }
  }

  dismiss() {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent('Create Path'),
      dismissOnPageChange: true
    });

    loading.present();
    if (this.uniqueSection) {
      this.analyticsService.trackEvent(SegmentEvents.createUndonePath, {path: this.analyticsService.trackPathWithoutUser(this.path)});
      this.server.createUndonePath(this.path)
      .subscribe(path => {
        let data = {path: path};
        loading.dismiss();
        this.viewCtrl.dismiss(data);
      }, error => {
            //FIXME: Dislplay Toast
            loading.dismiss();
            this.showErrorAlert(error);
      });
    } else {
      if (this.path.undone) {
        this.analyticsService.trackEvent(SegmentEvents.createPathFromUndone, {place: this.analyticsService.trackPathWithoutUser(this.path)});
        this.server.createPathFromUndone(this.path, this.path.id )
        .subscribe(path => {
          let data = {path: path};
          loading.dismiss();
          this.viewCtrl.dismiss(data);
          this.showCreatedPathAlert();
        }, error => {
              //FIXME: Dislplay Toast
              loading.dismiss();
              this.showErrorAlert(error);
        });
      }
      else {
        this.analyticsService.trackEvent(SegmentEvents.createPath, {place: this.analyticsService.trackPathWithoutUser(this.path)});
        this.server.createPath(this.path)
        .subscribe(path => {
          let data = {path: path};
          loading.dismiss();
          this.viewCtrl.dismiss(data);
        }, error => {
              //FIXME: Dislplay Toast
              loading.dismiss();
              this.showErrorAlert(error);
        });
      }
    }
  }

  showCreatedPathAlert() {
    let alert = this.alertCtrl.create({
      title: 'Good job !',
      subTitle: 'You just earned 30 points by creating this path. You can find this path in your PathList',
      buttons: ['OK']
    });
    alert.present();
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
