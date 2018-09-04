import { Component, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { NavController, NavParams, ViewController, LoadingController, AlertController } from 'ionic-angular';

import { Place } from '../../models/place';
import { Comment } from '../../models/comment';

import * as firebase from 'firebase/app'
import 'firebase/storage'

import { ServerService, ServerGetResponse } from '../../shared/server.service';
import { UserService } from '../../shared/user.service';
import { User } from "../../models/user";
import { ProfilePage } from "../profile/profile";
import { CameraOptions, Camera } from "@ionic-native/camera";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";
import { StatusBar } from "@ionic-native/status-bar";

@Component({
  selector: 'page-comment-place',
  templateUrl: 'comment-place.html'
})

export class CommentPlacePage implements OnChanges{
  @Input() place: Place;
  @Input() resetComment;
  @Output() onChangeComment: EventEmitter<object> = new EventEmitter<object>();
  private comment: Comment<Place>;
  captureDataUrl: string;
  deleteImages: Array<string>;

  constructor(private user: UserService, public navCtrl: NavController,
    private server: ServerService, public params: NavParams, 
    private viewCtrl: ViewController, private loadingCtrl: LoadingController, public statusBar: StatusBar,
    private alertCtrl: AlertController, private analyticsService: AnalyticsService, private camera: Camera) {
    // this.place = this.params.get("place");
    if (this.params.get("comment")){
      this.comment = this.params.get("comment");
      this.comment.object = this.place;
    }
    else {
      this.comment = new Comment<Place>();
      this.comment.object = this.place;
      this.comment.user = this.user.getUser();
    }
    this.deleteImages = new Array();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.place) {
      this.comment.object = changes.place.currentValue;
    }
    if (changes.resetComment.currentValue !== changes.resetComment.previousValue) {
      this.comment.rate = 0;
      this.comment.text = '';
      this.comment.images = [];
      this.deleteImage();
    }
  }

  onRateChange(event) {
    this.onChangeComment.emit({ commentChanged: true });
  }

  onCommentTextChange() {
    this.onChangeComment.emit({ commentChanged: true });
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreenPlace(SegmentEvents.CommentPlace, this.place);
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

  back() {
    this.viewCtrl.dismiss(null);
  }

  sendComment() {
    if (this.place.hasCategories() && this.place.hasMoods()) {
      if (this.comment.rate || this.comment.text && this.comment.text !== "") {
        this.dismiss();
      }
      else {
        this.showPlaceAlert();
      }
    }
    else {
      this.showPlaceAlertCategoryAndMood();
    }
  }

  presentConfirm() {
  let alert = this.alertCtrl.create({
    title: 'Add a photo',
    message: 'Chose or take',
    buttons: [
      {
        text: 'From your gallery',
        handler: () => {
          this.captureFromGallery();
        }
      },
      {
        text: 'With your camera',
        handler: () => {
          this.captureFromCamera();
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ]
  });
  alert.present();
}

  captureFromGallery() {
    const cameraOptions: CameraOptions = {
      quality: 50,
      targetHeight: 600,
      targetWidth: 600,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };
    this.statusBar.overlaysWebView(true);

    this.camera.getPicture(cameraOptions).then((imageData) => {
      this.captureDataUrl = 'data:image/jpeg;base64,' + imageData;
      this.statusBar.overlaysWebView(false);
      this.upload();
      this.onChangeComment.emit({ commentChanged: true });
    }, (err) => {
      this.statusBar.overlaysWebView(false);
      // Handle error
    });
  }

  captureFromCamera() {
    const cameraOptions: CameraOptions = {
      quality: 50,
      targetHeight: 600,
      targetWidth: 600,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };
    this.statusBar.overlaysWebView(true);

    this.camera.getPicture(cameraOptions).then((imageData) => {
      this.captureDataUrl = 'data:image/jpeg;base64,' + imageData;
      this.upload();
      this.statusBar.overlaysWebView(false);
      this.onChangeComment.emit({ commentChanged: true });
    }, (err) => {
      this.statusBar.overlaysWebView(false);
      // Handle error
    });
  }

  upload() {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent('Upload Image'),
      dismissOnPageChange: true
    });
    loading.present();
    let storageRef = firebase.storage().ref();
    // Create a timestamp as filename
    const filename = 'user_' + this.user.getUserId() + '_at_' + Math.floor(Date.now() / 1000);

    // Create a reference to 'images/todays-date.jpg'
    const imageRef = storageRef.child(`images/${filename}.jpg`);

    imageRef.putString(this.captureDataUrl, firebase.storage.StringFormat.DATA_URL).then((snapshot)=> {
     this.comment.images.push(snapshot.metadata.downloadURLs[0]);
     loading.dismiss();
    });
  }

  deleteImage() {
    this.deleteImages.forEach(url => {
      let storageRef = firebase.storage().refFromURL(url);
      storageRef.delete().then(function() {
      }).catch(function(error) {
      });
    });

  }

  AddImageToRemove(url){
    var index = this.comment.images.indexOf(url, 0);
    if (index > -1) {
      this.comment.images.splice(index, 1);
    }
    this.deleteImages.push(url);
  }

  dismiss() {
    let data = { place: this.place };
    this.deleteImage();
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent('Upload ...'),
      dismissOnPageChange: true
    });
    loading.present();
    if (this.place.created){
      this.analyticsService.trackEvent(SegmentEvents.sendPlaceComment, {comment: this.analyticsService.trackComment(this.comment)});
      this.server.sendPlaceComment(this.comment)
      .subscribe(comment => {
          loading.dismiss();
          let data = { comment: comment };
          this.viewCtrl.dismiss(data);
      }, error => {
          loading.dismiss();
      });
    }
    else {
      this.analyticsService.trackEvent(SegmentEvents.createPlaceAndComment, 
      {
        place: this.analyticsService.trackPlace(this.place),
        comment: this.analyticsService.trackComment(this.comment)
      });
      this.server.createPlaceAndComment(this.place, this.comment)
      .subscribe(place => {
          let data = { place: place };
          loading.dismiss();
          this.viewCtrl.dismiss(data);
      }, error => {
          loading.dismiss();
      });
    }
  }

  showPlaceAlert() {
    let alert = this.alertCtrl.create({
      title: 'Not so fast!',
      subTitle: 'You must at least rate or comment this place.',
      buttons: ['OK']
    });
    alert.present();
  }

  showPlaceAlertCategoryAndMood() {
    let alert = this.alertCtrl.create({
      title: 'Not so fast!',
      subTitle: 'You must choose at least one category and one mood.',
      buttons: ['OK']
    });
    alert.present();
  }
}
