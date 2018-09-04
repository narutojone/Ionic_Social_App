import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import * as firebase from 'firebase/storage';
import { Camera } from '@ionic-native/camera';

/***
    PictureUtils.ts a provider picture manipulating methods with :
      - openCamera() return a promise with the image taken from the camera
      - openGallery() return a promise with the image picked from the gallery
      - uploadProfilPicture(imgData:any) upload to firebase storage current user picture
***/

@Injectable()
export class PictureUtils {
  storageRef: any;
  profilAvatarRef: any;
  objectToSave: Array<any> = new Array;


  takePictureOptions: any = {
    allowEdit: true,
    saveToPhotoAlbum: true,
    quality: 100,
    targetWidth: 720,
    targetHeight: 720,
    cameraDirection: this.camera.Direction.BACK,
    sourceType: this.camera.PictureSourceType.CAMERA,
    mediaType: this.camera.MediaType.PICTURE,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG
  }

  galleryOptions: any = {
    allowEdit: true,
    saveToPhotoAlbum: false,
    quality: 100,
    targetWidth: 720,
    targetHeight: 720,
    sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
    mediaType: this.camera.MediaType.PICTURE,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG
  }

  constructor(private camera: Camera) {
    this.storageRef = firebase.storage().ref();//Firebase storage main path
  }

  upload(captureDataUrl: any, filename: any) {
    const imageRef = this.storageRef.child(`images/${filename}.jpg`);
    return imageRef.putString(captureDataUrl, firebase.storage.StringFormat.DATA_URL);
  }

  delete(url: any) {
      let storageRefDelete = firebase.storage().refFromURL(url);
      storageRefDelete.delete().then(function() {
      }).catch(function(error) {
      });
  }

  //Take a picture and return a promise with the image data
  openCamera() {
    return new Promise((resolve, reject) => {
      this.camera.getPicture(this.takePictureOptions).then((imageData) => {
        return resolve(imageData);
      }), (err) => {
        console.log('Cant take the picture', err);
        return reject(err);
      }
    });
  }

  //open the gallery and Return a promise with the image data
  openGallery() {
    return new Promise((resolve, reject) => {
      this.camera.getPicture(this.galleryOptions).then((imageData) => {
        return resolve(imageData);
      }), (err) => {
        console.log('Cant access to gallery', err);
        return reject(err);
      }
    });
  }
}
