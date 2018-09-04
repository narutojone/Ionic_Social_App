import { Component, OnInit } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version';
import { Toast } from '@ionic-native/toast';
import { App, MenuController, ModalController, LoadingController, Platform } from 'ionic-angular';

import { AppService } from '../../shared/app.service';
import { FilterService } from '../../shared/filter.service';
import { GeolocationService } from '../../shared/geolocation.service';
import { LoginResponse } from '../../models/login';
import { PolicyModal } from './policy';
import { TabsPage } from '../tabs/tabs';
import { UserService } from '../../shared/user.service';
import { TutorialPage } from "../tutorial/tutorial";
import { ServerService } from "../../shared/server.service";
import { OneSignal } from "@ionic-native/onesignal";
import { Facebook } from "@ionic-native/facebook";
import { StatusBar } from "@ionic-native/status-bar";


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage implements OnInit {
  private appName$: string;
  private appVersion$: number;
  className: string = 'app-root';


  constructor(private modalCtrl: ModalController,
    private user: UserService,
    private appService: AppService,
    private app: App,
    private menu: MenuController,
    private loadingCtrl: LoadingController,
    private server: ServerService,
    private appVersion: AppVersion,
    private oneSignal: OneSignal,
    private toast: Toast,
    private statusBar: StatusBar,
    private platform: Platform,
    private facebook: Facebook) {
    menu.close();
    menu.enable(false);
  }

  ngOnInit() {
    this.appVersion.getVersionNumber()
      .then(v => this.appVersion$ = v)

    this.appVersion.getAppName()
      .then(n => this.appName$ = n)
  }

  facebookLogin$(): void {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.server.getLoadingContent(''),
    });
    loading.present();
    //var height = this.platform.height();
    this.statusBar.overlaysWebView(true);
    this.user.FBLogin()
      .then(response => {
        this.statusBar.overlaysWebView(false);
        // FIXME TEMPORARY FIX BECAUSE OF A FACEBOOK BUG AFTER LOGIN!!
        // if (this.platform.is('ios')) {
        //   if (height >= 812) { // = IPHONE X OR BIGGER
        //     this.app._appRoot.setElementStyle("height", (height - 45) + 'px');
        //     this.app._appRoot.setElementStyle("top", '45px');
        //   } else {
        //     this.app._appRoot.setElementStyle("height", (height - 20) + 'px');
        //     this.app._appRoot.setElementStyle("top", '20px');
        //   }
        // }
        // END OF THE FIX
        this.appService.initialize(response)
          .then(() => {
            this.oneSignal.getIds().then(res => {
              if (res) {
                this.server.updateClientId(res.userId).subscribe();
              }
            })
            if (this.user.isTutotialCompleted()) {
              this.menu.enable(true);
              this.app.getRootNav().setRoot(TabsPage);
            }
            else {
              this.app.getRootNav().setRoot(TutorialPage);
            }
            loading.dismiss();
          });
        console.log(response);
      })
      .catch(error => {
        this.toast.showLongBottom("Error, make sure to be connected to internet...")
          .subscribe();
        loading.dismiss();
      });
  }

  showPolicy$(): void {
    let modal = this.modalCtrl.create(PolicyModal);
    modal.present();
  }



}
