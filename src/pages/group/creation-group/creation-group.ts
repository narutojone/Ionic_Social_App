import { Component, Input } from '@angular/core';
import { NavController, NavParams, ViewController, LoadingController, AlertController } from 'ionic-angular';

import { ServerService, ServerGetResponse } from '../../../shared/server.service';
import { ProfilePage } from "../../profile/profile";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../../shared/analytics.service";
import { Group } from "../../../models/group";
import { UserService } from "../../../shared/user.service";
import { User } from "../../../models/user";
import { PtTap } from "../../../shared/ptTap.model";
import { CompleteFeedService } from "../../../shared/complete-feed.service";
import { CameraOptions, Camera } from "@ionic-native/camera";

import * as firebase from 'firebase/app'
import 'firebase/storage'
import { GroupDetailPage } from "../group-detail/group-detail";
import { StatusBar } from "@ionic-native/status-bar";

@Component({
  selector: 'page-creation-group',
  templateUrl: 'creation-group.html'
})

export class CreationGroupPage {
  private group: Group;
  private ptTap: PtTap;
  private pathers: Array<User>;
  private patherSearch: string = '';
  private search_pather: boolean = false;
  private delete_whos: boolean = false;
  private captureDataUrl: string;
  private deleteImages: Array<string>;

  constructor(private user: UserService, public navCtrl: NavController,
    private server: ServerService, public params: NavParams, 
    private viewCtrl: ViewController, private loadingCtrl: LoadingController,
    private alertCtrl: AlertController, private analyticsService: AnalyticsService,
    public completeFeedService: CompleteFeedService, private camera: Camera, public statusBar: StatusBar) {
    this.group = new Group();
    this.group.members.push(this.user.getUser());
    this.pathers = new Array<User>();
    this.deleteImages = new Array();
  }

  ionViewWillEnter() {
    //this.analyticsService.trackScreenPlace(SegmentEvents.CommentPlace, this.group);
    //this.pathers = new Array<User>();
  }

  goProfile(u: User): void {
    this.navCtrl.push(ProfilePage, { u: u });
  }

   addUser(user: User) {
    var u = this.group.members.find(x => x.id == user.id);
    if (u) {
      this.showPatherError();
    }
    else {
      this.group.members.push(user);
      this.pathers = new Array<User>();
      this.patherSearch = '';
      this.search_pather = false;
    }
  }

  addPather() {
    this.search_pather = !this.search_pather;
    this.pathers = new Array<User>();
    this.patherSearch = '';
  }

  setFilteredItems() {
    if (this.patherSearch.length < 1){
      this.pathers = new Array<User>();
    }
    else {
    this.completeFeedService.getResults(this.patherSearch)
    .subscribe(users => {
      this.pathers = users;
    });
  }
  }

  touchStartPtTap($event) {
    this.ptTap = new PtTap(event);
  }

  touchEndPtTap($event) {
    return this.ptTap.needFire(event);
  }

  removePather(p: any): void {
    if (this.delete_whos) {
      var index = this.group.members.indexOf(p, 0);
      if (index > -1) {
        this.group.members.splice(index, 1);
      }
      this.delete_whos = false;
    } else {
      this.delete_whos = true;
    }
  }

  createGroup() {
    if (!this.group.name || this.group.name == ''){
      this.showGroupAlert();
    }
    else {
      this.deleteImage();
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Create Path'),
        dismissOnPageChange: true
      });

      loading.present()

      this.server.createGroup(this.group)
        .subscribe(group => {
          loading.dismiss();
          this.navCtrl.pop();
          this.goToGroupPage(group);
          this.showCreatedGroupAlert();
        }, error => {
              //FIXME: Dislplay Toast
              loading.dismiss();
              this.showErrorAlert(error);
        });
    }
  }

  goToGroupPage(g: Group): void {
    this.navCtrl.push(GroupDetailPage, { group: g });
  }

  showCreatedGroupAlert() {
    let alert = this.alertCtrl.create({
      title: 'Good job !',
      subTitle: 'You just created a new group.',
      buttons: ['OK']
    });
    alert.present();
  }

  showGroupAlert() {
    let alert = this.alertCtrl.create({
      title: 'Not so fast!',
      subTitle: 'You must at least give a name',
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

  showPatherError() {
    let alert = this.alertCtrl.create({
      title: 'This user is already a member of your crew!',
      buttons: ['OK']
    });
    alert.present();
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
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.statusBar.overlaysWebView(true);
    this.camera.getPicture(cameraOptions).then((imageData) => {
      this.captureDataUrl = 'data:image/jpeg;base64,' + imageData;
      this.upload();
      this.statusBar.overlaysWebView(false);
    }, (err) => {
      // Handle error
    });
  }

  captureFromCamera() {
    const cameraOptions: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };
    this.camera.getPicture(cameraOptions).then((imageData) => {
      this.captureDataUrl = 'data:image/jpeg;base64,' + imageData;
      this.upload();
    }, (err) => {
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
     this.group.images.push(snapshot.metadata.downloadURLs[0]);
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
    var index = this.group.images.indexOf(url, 0);
    if (index > -1) {
      this.group.images.splice(index, 1);
    }
    this.deleteImages.push(url);
  }

}
