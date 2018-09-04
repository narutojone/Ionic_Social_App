import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController } from 'ionic-angular';


import { ServerService, ServerGetResponse } from '../../shared/server.service';
import { UserService } from '../../shared/user.service';
import { User } from "../../models/user";
import { ProfilePage } from "../profile/profile";
import { PlaceDetailPage } from "../place/place-detail";
import { CommentPathPage } from "../comment/comment-path";
import { TranslateService } from "ng2-translate";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";
import { Place } from "../../models/place";
import { Event } from "../../models/event";
import { PathDetailPage } from "../path/path-detail";
import { PathMapPage } from "../path/path-map";
import { PathTimeObject } from "../../models/pathtime-object";
import { PlaceMapPage } from "../place/place-map";
import { EventSettingPage } from "./event-settings/event-setting";
import { EventSelectionModal } from "../../components/cards/event/modal-event-selection";
import { SimpleComment } from "../../models/simple-comment";

@Component({
  selector: 'page-event-detail',
  templateUrl: 'event-detail.html'
})

export class EventDetailPage {
  @Input() event: Event<PathTimeObject>;
  commentText: String;


  constructor(private user: UserService, public navCtrl: NavController, private loadingCtrl: LoadingController, private translate: TranslateService,
    private server: ServerService, public params: NavParams, private alertCtrl: AlertController, private modalCtrl: ModalController,
    private analyticsService: AnalyticsService) {
    this.event = this.params.get("event");
    this.commentText = '';
  }

  back() {
    this.navCtrl.pop();
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreenEvent(SegmentEvents.EventDetail, this.event);
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  goPathMap(): void {
    this.navCtrl.push(PathMapPage, { path: this.event.activity });
  }

  goPlaceMap(): void {
    this.navCtrl.push(PlaceMapPage, { place: this.event.activity });
  }
  
  goPathDetail(): void {
    this.navCtrl.push(PathDetailPage, { path: this.event.activity });
  }

  goToEventSettings(): void {
    this.navCtrl.push(EventSettingPage, { event: this.event });
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

  showFullComment(comment: SimpleComment) {
    let alert = this.alertCtrl.create({
      title: comment.user.firstname + ' ' + comment.user.lastname,
      subTitle: comment.text.toString(),
      buttons: ['Ok']
    });
    alert.present();
  }

  sendComment() {
    if (this.commentText != "") {
      let textToSend = this.commentText;
      this.commentText = "";
      this.server.sendEventComment(this.event.id, textToSend).subscribe(
        event => {
          this.event = event;
        }
      )
    }
  }

  changeOpinionModal() {
    let modal = this.modalCtrl.create(EventSelectionModal, {}, { showBackdrop: true, enableBackdropDismiss: true });
    modal.onDidDismiss(data => {
      if (data) {
        this.event.user_response = +data;
        this.server.postEventChoice(this.event.id, this.event.user_response).subscribe(
          e => {
            this.event = e;
          }
        );
      }
    });
    modal.present();
  }
}
