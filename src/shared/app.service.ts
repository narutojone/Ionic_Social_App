import { Injectable } from '@angular/core';

import { FilterService } from './filter.service';
import { LoginResponse } from '../models/login';
import { GeolocationService } from './geolocation.service';
import { ServerService } from './server.service';
import { UserService } from './user.service';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { AnalyticsService } from "./analytics.service";
import { Platform } from "ionic-angular";

@Injectable()
export class AppService {

  constructor(private filter: FilterService,
              private geolocation: GeolocationService,
              private server: ServerService,
              private analytics: AnalyticsService,
              private user: UserService,
              private platform: Platform) {}

  initialize(response: LoginResponse): Promise<void> {
    /** FIXME: We should use a progration bar to show the initialization status.
    *          And we still need to init GPS and make server call to connect
    */

    this.platform.ready().then(() => {
      this.filter.init();
      this.geolocation.init();
      }
    );
    
    return this.server.connect(response)
           .map(result => {
             this.user.init(result);
             this.analytics.trackUser(this.user.getUser());
           })
           .toPromise();

  }
}
