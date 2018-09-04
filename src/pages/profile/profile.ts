import { Component, Input } from '@angular/core';

import { UserService } from '../../shared/user.service';
import { ServerService } from '../../shared/server.service';
import { NavController, LoadingController, NavParams, AlertController } from 'ionic-angular';


import { FollowerListPage } from './followerlist/followerlist';
import { HistoricPage } from './historic/historic';
import { PathListPage } from './pathlist/pathlist';
import { FollowListPage } from './followlist/followlist';
import { PhotosPage } from './photos/photos';
import { RecordsPage } from './records/records';
import { TodosPage } from './todos/todos';
import { SpiderPage } from './spider/spider';
import { User } from "../../models/user";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
@Input() u: User;

  constructor(private user: UserService, public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private server: ServerService, public params: NavParams, private analyticsService: AnalyticsService,
     private alertCtrl: AlertController) {
      this.u = this.params.get("u");
      if (!this.u) {
        this.u = user.getUser();
      }
  }

  ionViewDidEnter() {
    let payload = {
      userCheckedFBID: this.u.facebook_id
    }
    this.analyticsService.trackScreen(SegmentEvents.Profile, payload);
  }

  goToPathList() {
    if (this.u.pathList.length > 0) {
      this.navCtrl.push(PathListPage, { u: this.u });
    }
    else {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Download Pathlist'),
        dismissOnPageChange: true
      });

      loading.present();
      this.server.getPathList(this.u)
        .subscribe(user => {
          this.u = user;
          this.navCtrl.push(PathListPage, { u: this.u });
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
    }
  }

  goToRecords() {
    if (this.u.records.length > 0) {
      this.navCtrl.push(RecordsPage, { u: this.u });
    }
    else {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Download Records'),
        dismissOnPageChange: true
      });

      loading.present();
      this.server.getRecords(this.u)
        .subscribe(user => {
          this.u = user;
          this.navCtrl.push(RecordsPage, { u: this.u });
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
    }
  }

  goToTodos() {
    if (this.u.todos.length > 0) {
      this.navCtrl.push(TodosPage, { u: this.u });
    }
    else {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Download Todos'),
        dismissOnPageChange: true
      });

      loading.present();
      this.server.getTodos(this.u)
        .subscribe(user => {
          this.u = user;
          this.navCtrl.push(TodosPage, { u: this.u });
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
    }
  }

  goToHistoric() {
    if (this.u.historic.length > 0) {
      this.navCtrl.push(HistoricPage, { u: this.u });
    }
    else {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Download Historic'),
        dismissOnPageChange: true
      });

      loading.present();
      this.server.getHistoric(this.u)
        .subscribe(user => {
          this.u = user;
          this.navCtrl.push(HistoricPage, { u: this.u });
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
    }
  }

  goToFollowList() {
    if (this.u.followList.length > 0) {
      this.navCtrl.push(FollowListPage, { u: this.u });
    }
    else {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Download FollowList'),
        dismissOnPageChange: true
      });

      loading.present();
      this.server.getAllFollowsList(this.u)
        .subscribe(user => {
          this.u = user;
          this.navCtrl.push(FollowListPage, { u: this.u });
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
    }
  }

  goToGroupList() {
    let alert = this.alertCtrl.create({
      title: 'Coming soon!',
      subTitle: 'Check out our new updates to find this feature.',
      buttons: ['OK']
    });
    alert.present();
  }

  goToPhotoList() {
    if (this.u.photoList.length > 0) {
      this.navCtrl.push(PhotosPage, { u: this.u });
    }
    else {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Download Photos'),
        dismissOnPageChange: true
      });

      loading.present();
      this.server.getPhotoList(this.u)
        .subscribe(user => {
          this.u = user;
          this.navCtrl.push(PhotosPage, { u: this.u });
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
    }
  }

}
