import { Component, Input } from '@angular/core';
import { NavController, LoadingController, NavParams } from "ionic-angular";
import { UserService } from "../../shared/user.service";
import { ServerService } from "../../shared/server.service";
import { AnalyticsService } from "../../shared/analytics.service";
import { User } from "../../models/user";
import { SegmentEvents } from "../../shared/analytics.model";
import { ProfilePage } from "../profile/profile";
import { PathtimeNotification } from "../../models/notification";
import { EventDetailPage } from "../event/event-detail";


@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class NotificationsPage {


  constructor(private user: UserService, public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private server: ServerService, public params: NavParams, private analyticsService: AnalyticsService) {
  }

  ionViewDidEnter() {
    this.analyticsService.trackScreen(SegmentEvents.NotificationsPage, {});
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  openNotif(notif) {
    if (notif.event_id) {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent(''),
      });
      loading.present();

      this.server.getEvent(notif.event_id)
        .subscribe(event => {
          this.navCtrl.push(EventDetailPage, { event: event });
          loading.dismiss();
        });
    }
  }

  ionViewWillLeave() {
    this.server.markNotificationsAsDone().subscribe();
  }

  refresh$(event): void {
    this.server.refreshNotifications().subscribe(res => {
      event.complete();
    })
  }
}
