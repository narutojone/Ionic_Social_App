import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController, FabContainer, ToastController } from 'ionic-angular';

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
import { TranslateService } from "ng2-translate";
import { PathMapPage } from "./path-map";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";
import { PathSettingPage } from "./path-setting";
import { PerformPathPage } from "../perform/perform-path";
import { SelectGroupPage } from "../group/select-group/select-group";
import { ChatCardPage } from "../chat-card/chat-card";

@Component({
  selector: 'page-path-detail',
  templateUrl: 'path-detail.html'
})

export class PathDetailPage {
  @Input() path: Path;
  @Input() parentPage: any;
  private userComment: Comment<Path>;

  constructor(private user: UserService, public navCtrl: NavController, private loadingCtrl: LoadingController, private translate: TranslateService,
    private server: ServerService, public params: NavParams, private alertCtrl: AlertController, private modalCtrl: ModalController, private toastCtrl: ToastController,
    private analyticsService: AnalyticsService) {
    this.path = this.params.get("path");
    this.parentPage = this.params.get("parentPage");
    this.userComment = this.path.user_comment;
    if (!this.userComment){
      this.userComment = new Comment<Path>();
      this.userComment.object = this.path;
      this.userComment.user = this.user.getUser();
    }
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreenPath(SegmentEvents.PathDetail, this.path);
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

  back() {
    this.navCtrl.pop();
  }

  showLikedAlert() {
    if (!this.path.isLiked()) {
      let toast = this.toastCtrl.create({
        message: 'Path disliked',
        duration: 1000
      });
      toast.present();
    }
    else {
      let toast = this.toastCtrl.create({
        message: 'Path liked',
        duration: 1000
      });
      toast.present();
    }
  }

  showFavoriteAlert() {
    if (!this.path.isFavorite()) {
      let toast = this.toastCtrl.create({
        message: 'Path removed from your Todo',
        duration: 1000
      });
      toast.present();
    }
    else {
      let toast = this.toastCtrl.create({
        message: 'Path added to your Todo',
        duration: 1000
      });
      toast.present();
    }
  }

  closeFab(fab: FabContainer){
    fab.close();
  }

  goPath() {
    this.navCtrl.push(PerformPathPage, { path: this.path });
  }

  goToPathSetting() {
    let pathModal = this.modalCtrl.create(PathSettingPage, { path: this.path });
    pathModal.onDidDismiss(data => {
      if (data) {
        if (data.delete) {
          if (this.parentPage) {
            this.parentPage.refreshPaths();
          }
          this.navCtrl.pop();
        }
        else {
          this.path = data.path;
          if (this.parentPage) {
            this.parentPage.refreshPaths();
          }
        }
      }
    })
    pathModal.present();
  }

  sharePath() {
    let pathModal = this.modalCtrl.create(SelectGroupPage, { pto: this.path });
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
        this.server.getPathChats(this.path.id, 10, 0)
          .subscribe(res => {
            this.navCtrl.push(ChatCardPage, { chats: res, path_id: this.path.id });
          }, error => {
            //FIXME: Dislplay Toast
            loading.dismiss();
          });
  }

  editComment(c: Comment<Path>, path: Path): void {
      let commentModal = this.modalCtrl.create(CommentPathPage, { path: this.path, comment: c });
      commentModal.onDidDismiss(data => {
        if (data) {
         if (this.includeComment(data.comment, this.path.comments)){
           this.path.comments.forEach(comment => {
             if (comment.user.id = this.user.getUserId()){
               comment = data.comment;
             }
           });
         }
         else {
           this.path.comments.push(data.comment);
         }
         this.path.user_comment = data.comment;
         this.userComment = data.comment;
       }
      });
      commentModal.present();
  }

  includeComment(comment: Comment<Path>, comments: Array<Comment<Path>>): boolean {
    if (!comment || !comment.id){
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
