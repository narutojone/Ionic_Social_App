import { Component, Input } from '@angular/core';
import { NavController, NavParams, ViewController, LoadingController, AlertController } from 'ionic-angular';

import { Comment } from '../../models/comment';

import { ServerService, ServerGetResponse } from '../../shared/server.service';
import { UserService } from '../../shared/user.service';
import { User } from "../../models/user";
import { ProfilePage } from "../profile/profile";
import { Path } from "../../models/path";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";

@Component({
  selector: 'page-comment-path',
  templateUrl: 'comment-path.html'
})

export class CommentPathPage {
  @Input() path: Path;
  private comment: Comment<Path>;

  constructor(private user: UserService, public navCtrl: NavController,
    private server: ServerService, public params: NavParams, 
    private viewCtrl: ViewController, private loadingCtrl: LoadingController,
    private alertCtrl: AlertController, private analyticsService: AnalyticsService) {
    this.path = this.params.get("path");
    if (this.params.get("comment")){
      this.comment = this.params.get("comment");
      this.comment.object = this.path;
    }
    else {
      this.comment = new Comment<Path>();
      this.comment.object = this.path;
      this.comment.user = this.user.getUser();
    }
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreenPath(SegmentEvents.CommentPath, this.path);
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  back() {
    this.viewCtrl.dismiss(null);
  }

  sendComment() {
    if (this.comment.rate || this.comment.text && this.comment.text !== "") {
      this.dismiss();
    }
    else {
      this.showPathAlert();
    }
  }

  dismiss() {
    let data = { path: this.path };
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent('Upload ...'),
      dismissOnPageChange: true
    });
    loading.present();
    this.analyticsService.trackEvent(SegmentEvents.sendPathComment, {comment: this.analyticsService.trackComment(this.comment)});
    this.server.sendPathComment(this.comment)
      .subscribe(comment => {
          loading.dismiss();
          let data = { comment: comment };
          this.viewCtrl.dismiss(data);
      }, error => {
          loading.dismiss();
      });
  }

  showPathAlert() {
    let alert = this.alertCtrl.create({
      title: 'Not so fast!',
      subTitle: 'You must at least rate or comment this path.',
      buttons: ['OK']
    });
    alert.present();
  }
}
