import { Component, Input } from '@angular/core';
import { NavController, NavParams, ViewController, LoadingController, AlertController } from 'ionic-angular';

import { Comment } from '../../models/comment';

import { ServerService, ServerGetResponse } from '../../shared/server.service';
import { UserService } from '../../shared/user.service';
import { User } from "../../models/user";
import { ProfilePage } from "../profile/profile";
import { Event } from "../../models/event";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";
import { PathTimeObject } from "../../models/pathtime-object";

@Component({
  selector: 'page-comment-event',
  templateUrl: 'comment-event.html'
})

export class CommentEventPage {
  @Input() event: Event<PathTimeObject>;
  private comment: Comment<Event<PathTimeObject>>;

  constructor(private user: UserService, public navCtrl: NavController,
    private server: ServerService, public params: NavParams, 
    private viewCtrl: ViewController, private loadingCtrl: LoadingController,
    private alertCtrl: AlertController, private analyticsService: AnalyticsService) {
    this.event = this.params.get("event");
    if (this.params.get("comment")){
      this.comment = this.params.get("comment");
      this.comment.object = this.event;
    }
    else {
      this.comment = new Comment<Event<PathTimeObject>>();
      this.comment.object = this.event;
      this.comment.user = this.user.getUser();
    }
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreenEvent(SegmentEvents.CommentEvent, this.event);
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
      this.showEventAlert();
    }
  }

  dismiss() {
    let data = { event: this.event };
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent('Upload ...'),
      dismissOnPageChange: true
    });
    loading.present();
    this.analyticsService.trackEvent(SegmentEvents.sendEventComment, {comment: this.analyticsService.trackComment(this.comment)});
    this.server.sendEventOpinion(this.comment)
      .subscribe(comment => {
          loading.dismiss();
          let data = { comment: comment };
          this.viewCtrl.dismiss(data);
      }, error => {
          loading.dismiss();
      });
  }

  showEventAlert() {
    let alert = this.alertCtrl.create({
      title: 'Not so fast!',
      subTitle: 'You must at least rate or comment this event.',
      buttons: ['OK']
    });
    alert.present();
  }
}
