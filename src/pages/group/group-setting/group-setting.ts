import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';

import { UserService } from "../../../shared/user.service";
import { NavController, LoadingController, NavParams, AlertController } from "ionic-angular";
import { Group } from "../../../models/group";
import { ServerService } from "../../../shared/server.service";
import { AnalyticsService } from "../../../shared/analytics.service";
import { SegmentEvents } from "../../../shared/analytics.model";
import { ProfilePage } from "../../profile/profile";
import { User } from "../../../models/user";
import { PtTap } from "../../../shared/ptTap.model";
import { CompleteFeedService } from "../../../shared/complete-feed.service";
import { GroupDetailPage } from "../group-detail/group-detail";
import { CameraOptions, Camera } from "@ionic-native/camera";

import * as firebase from 'firebase/app'
import 'firebase/storage'
import { StatusBar } from "@ionic-native/status-bar";

@Component({
  selector: 'page-setting-group',
  templateUrl: 'group-setting.html'
})

export class GroupSettingPage {
  @Input() group: Group;
  private ptTap: PtTap;
  private pathers: Array<User>;
  private patherSearch: string = '';
  private search_pather: boolean = false;
  private delete_whos: boolean = false;
  private captureDataUrl: string;
  private deleteImages: Array<string>;

  constructor(private user: UserService, public navCtrl: NavController, private loadingCtrl: LoadingController,
    private server: ServerService, public params: NavParams, private alertCtrl: AlertController,
    private analyticsService: AnalyticsService, private completeFeedService: CompleteFeedService,
    private camera: Camera, public statusBar: StatusBar) {
    this.group = this.params.get("group");
    this.deleteImages = new Array();
  }

  ionViewWillEnter() {
    this.analyticsService.trackScreenGroup(SegmentEvents.GroupSetting, this.group);
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

  updateGroup() {
    if (!this.group.name || this.group.name == ''){
      this.showGroupAlert();
    }
    else {
      this.deleteImage();
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Update Group'),
        dismissOnPageChange: true
      });

      loading.present()

      this.server.updateGroup(this.group)
        .subscribe(group => {
          loading.dismiss();
          this.navCtrl.pop();
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
      subTitle: 'You just updated your group.',
      buttons: ['OK']
    });
    alert.present();
  }

  showGroupAlert() {
    let alert = this.alertCtrl.create({
      title: 'Not so fast!',
      subTitle: "You can't have an empty name.",
      buttons: ['OK']
    });
    alert.present();
  }

  showPermissionAlert() {
    let alert = this.alertCtrl.create({
      title: 'Not so fast!',
      subTitle: "You don't have the permission to do this.",
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
      this.statusBar.overlaysWebView(false);
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
    this.statusBar.overlaysWebView(true);
    this.camera.getPicture(cameraOptions).then((imageData) => {
      this.captureDataUrl = 'data:image/jpeg;base64,' + imageData;
      this.upload();
      this.statusBar.overlaysWebView(false);
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

  leaveGroup() {
    let alert = this.alertCtrl.create({
      title: 'Are you sure',
      message: 'Do you really want to leave this group?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.server.deleteGroup(this.group.id).subscribe();
            this.navCtrl.pop();
            this.navCtrl.pop();
          }
        }
      ]
    });
    alert.present();
  }

  deleteGroup() {
    let alert = this.alertCtrl.create({
      title: 'Are you sure',
      message: 'Do you really want to delete this group?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.server.deleteGroup(this.group.id).subscribe();
            this.navCtrl.pop();
            this.navCtrl.pop();
          }
        }
      ]
    });
    alert.present();
  }
}
