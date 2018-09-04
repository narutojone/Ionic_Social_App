import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { NavController, NavParams, ViewController, LoadingController, ModalController, AlertController, FabContainer, ToastController } from 'ionic-angular';

import { PathTimeObject } from '../../models/pathtime-object';
import { Place } from '../../models/place';
import { Comment } from '../../models/comment';

import { ServerService, ServerGetResponse } from '../../shared/server.service';
import { UserService } from '../../shared/user.service';
import { CompleteFeedService } from '../../shared/complete-feed.service';
import { User } from "../../models/user";
import { ProfilePage } from "../profile/profile";
import { AutoCompleteComponent } from "ionic2-auto-complete";
import { CommentPlacePage } from "../comment/comment-place";
import { PlaceValidationPage } from "./place-validation";
import { PlaceMapPage } from "./place-map";
import { TranslateService } from "ng2-translate";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";
import { SelectGroupPage } from "../group/select-group/select-group";
import { ChatCardPage } from "../chat-card/chat-card";

@Component({
  selector: 'page-place-detail',
  templateUrl: 'place-detail.html'
})

export class PlaceDetailPage {
  @Input() place: Place;
  @Input() hideAlertSuccess: boolean;
  private timetable: boolean;
  private createSection: boolean;
  private userComment: Comment<Place>;
  private uniqueSection: boolean;

  constructor(private user: UserService, public navCtrl: NavController,
    private server: ServerService, public params: NavParams, private modalCtrl: ModalController, private alertCtrl: AlertController,
    private viewCtrl: ViewController, private toastCtrl: ToastController, private loadingCtrl: LoadingController, translate: TranslateService, private analyticsService: AnalyticsService) {
    this.place = this.params.get("place");
    this.userComment = this.place.user_comment;
    if (!this.userComment) {
      this.userComment = new Comment<Place>();
      this.userComment.object = this.place;
      this.userComment.user = this.user.getUser();
    }
    this.createSection = this.params.get("creation");
    this.hideAlertSuccess = this.params.get("hideAlertSuccess");
    this.uniqueSection = this.params.get("unique") ? this.params.get("unique") : false;
    this.timetable = false;
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreenPlace(SegmentEvents.PlaceDetail, this.place);
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  goPlaceMap(): void {
    this.navCtrl.push(PlaceMapPage, { place: this.place });
  }

  timetableClick(): void {
    this.timetable = !this.timetable;
  }

  goComment() {

  }

  back() {
    this.viewCtrl.dismiss(null);
  }

  showLikedAlert() {
    if (!this.place.isLiked()) {
      let toast = this.toastCtrl.create({
        message: 'Place disliked',
        duration: 1000
      });
      toast.present();
    }
    else {
      let toast = this.toastCtrl.create({
        message: 'Place liked',
        duration: 1000
      });
      toast.present();
    }
  }

  closeFab(fab: FabContainer){
    fab.close();
  }

  showFavoriteAlert() {
    if (!this.place.isFavorite()) {
      let toast = this.toastCtrl.create({
        message: 'Place removed from your Todo',
        duration: 1000
      });
      toast.present();
    }
    else {
      let toast = this.toastCtrl.create({
        message: 'Place added to your Todo',
        duration: 1000
      });
      toast.present();
    }
  }

  sharePlace() {
    let pathModal = this.modalCtrl.create(SelectGroupPage, { pto: this.place });
    pathModal.onDidDismiss(data => {
      if (data) {
      }
    })
    pathModal.present();
  }

  goChatPage() {
    let loading = this.loadingCtrl.create({
          spinner: 'hide',
          content: this.server.getLoadingContent('Download Comments'),
          dismissOnPageChange: true
        });
        loading.present();
        this.server.getPlaceChats(this.place.id, 10, 0)
          .subscribe(res => {
            this.navCtrl.push(ChatCardPage, { chats: res, place_id: this.place.id });
          }, error => {
            //FIXME: Dislplay Toast
            loading.dismiss();
          });
  }

  dismiss() {
    if (!this.place.created) {
      let validateModal = this.modalCtrl.create(PlaceValidationPage, { place: this.place });
      validateModal.onDidDismiss(data => {
        if (data) {
          this.viewCtrl.dismiss(data);
          this.showCreatedPlaceAlert();
        }
      });
      validateModal.present();
    }
    else {
      if (this.uniqueSection || this.place.user_comment) {
        let data = { place: this.place };
        this.viewCtrl.dismiss(data);
        this.showPlaceAlert();
      }
      else {
        let commentModal = this.modalCtrl.create(CommentPlacePage, { place: this.place });
        commentModal.onDidDismiss(data => {
          if (data) {
            this.viewCtrl.dismiss(data);
            this.showPlaceAlert();
          }
        });
        commentModal.present();
      }
    }
  }

  showCreatedPlaceAlert() {
    if (!this.hideAlertSuccess) {
      let alert = this.alertCtrl.create({
        title: 'Good job !',
        subTitle: 'You just earned 20 points by creating this place. Your place will now be available for every Pathers.',
        buttons: ['OK']
      });
      alert.present();
    }
  }

  showPlaceAlert() {
    if (!this.hideAlertSuccess) {
      let alert = this.alertCtrl.create({
        title: 'Good job !',
        subTitle: 'You just added a place to your current path!',
        buttons: ['OK']
      });
      alert.present();
    }
  }



  editComment(c: Comment<Place>, place: Place): void {
    let commentModal = this.modalCtrl.create(CommentPlacePage, { place: this.place, comment: c });
    commentModal.onDidDismiss(data => {
      if (data) {
        if (this.includeComment(data.comment, this.place.comments)) {
          this.place.comments.forEach(comment => {
            if (comment.user.id = this.user.getUserId()) {
              comment = data.comment;
            }
          });
        }
        else {
          this.place.comments.push(data.comment);
        }
        this.place.user_comment = data.comment;
        this.userComment = data.comment;
      }
    });
    commentModal.present();
  }

  includeComment(comment: Comment<Place>, comments: Array<Comment<Place>>): boolean {
    if (!comment || !comment.id) {
      return false;
    }
    let include = false;
    comments.forEach(c => {
      if (c.id === comment.id) {
        include = true;
      }
    });
    return include;
  }

}
