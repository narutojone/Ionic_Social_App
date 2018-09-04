import { Component, Input, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController, LoadingController, AlertController, DateTime } from 'ionic-angular';

import { Event } from '../../../models/event';
import { PathTimeObject } from '../../../models/pathtime-object';
import { UserService } from "../../../shared/user.service";
import { ServerService } from "../../../shared/server.service";
import { AnalyticsService } from "../../../shared/analytics.service";
import { SegmentEvents } from "../../../shared/analytics.model";
import { Path } from "../../../models/path";
import { Place } from "../../../models/place";
import * as moment from 'moment';

@Component({
  selector: 'page-event-creation',
  templateUrl: 'event-creation.html'
})

export class EventCreationPage{
  @ViewChild('dateTime') dateTime;
  @Input() event: Event<PathTimeObject>;

  constructor(private user: UserService, public navCtrl: NavController,
    private server: ServerService, public params: NavParams,
    private viewCtrl: ViewController, private loadingCtrl: LoadingController,
    private alertCtrl: AlertController, private analyticsService: AnalyticsService) {
    this.event = this.params.get("event");
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreen(SegmentEvents.EventCreation, {});
  }

  ionViewDidEnter() {
    setTimeout(_ => {
      this.dateTime.setValue(new Date().toISOString());
    });
  }

  back() {
    this.viewCtrl.dismiss(null);
  }

  createEvent() {
    if (this.event.date) {
      this.dismiss();
    } else {
      if (this.event.name) {
        this.dismiss();
      } else {
        this.showEventAlert();
      }
    }
  }

  dismiss() {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent('Upload ...'),
      dismissOnPageChange: true
    });
    loading.present();
    if (!this.event.name || this.event.name == "") {
      let date = new Date(this.event.date);
      if (this.event.activity instanceof Path) {
        this.event.name = this.event.activity.getFirstActivityTypeName() + ' ' + date.toLocaleString();
      } else if (this.event.activity instanceof Place) {
        this.event.name = this.event.activity.getFirstActivityTypeName() + ' ' + date.toLocaleString();
      }
    }
    let data = { event: this.event };
    //this.analyticsService.trackEvent(SegmentEvents.sendPathComment, {comment: this.analyticsService.trackComment(this.comment)});
    this.server.createEvent(this.event)
      .subscribe(event => {
        loading.dismiss();
        let data = { event: event };
        this.viewCtrl.dismiss(data);
      }, error => {
        loading.dismiss();
      });
  }

  showEventAlert() {
    let alert = this.alertCtrl.create({
      title: 'Not so fast!',
      subTitle: 'You must at least chose a date or a name for your event!',
      buttons: ['OK']
    });
    alert.present();
  }
}
