import { Geolocation } from '@ionic-native/geolocation';
import { Injectable } from '@angular/core';

@Injectable()
export class GeolocationService {

  private lastLocation: Coordinates;
  private lastTime: number;

  constructor(private geolocation: Geolocation) {
  }

  init() {
    this.getCurrentLocation();
  }

  getCurrentLocation() {
    this.geolocation.getCurrentPosition().then(location => {
        this.lastLocation = location.coords;
        this.lastTime = location.timestamp;
    })
  }

  getLastLocation(): Coordinates {
    if (Math.round((Date.now() - this.lastTime) / 1000) >= 30 || !this.lastLocation)
      this.getCurrentLocation();
    return this.lastLocation;
  }
}
