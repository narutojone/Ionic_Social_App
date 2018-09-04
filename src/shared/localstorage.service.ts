import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { NativeStorage } from '@ionic-native/native-storage';
import { Path } from "../models/path";
import { ServerService } from "./server.service";
import { Place } from "../models/place";


@Injectable()
export class Localstorage {

  constructor(public http: Http, private storage: NativeStorage, private server: ServerService) {
  }

  setPendingPath(path: Path) {
    var placeIds = new Array();
    path.places.forEach(place => {
      placeIds.push(place.id);
    });
    this.storage.setItem('pendingPath', JSON.stringify(placeIds));
  }

  getPendingPath() {
    return this.storage.getItem('pendingPath');
  }

  removePendingPath() {
    this.storage.remove('pendingPath').then(() => {
    });
  }

  //clear the whole local storage
  clearStorage() {
    this.storage.clear().then(() => {
    });
  }

}
