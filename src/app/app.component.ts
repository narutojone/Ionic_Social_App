import { Component, ViewChild, Injector } from '@angular/core';
import { Platform, Nav, Config, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { Keyboard } from '@ionic-native/keyboard';
import { SplashScreen } from '@ionic-native/splash-screen';
import { initializeApp } from 'firebase/app';

import { TranslateService } from 'ng2-translate';
import { OneSignal } from '@ionic-native/onesignal';


import { appInjector } from '../shared/app-injector';
import { AppService } from '../shared/app.service';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { ServerService } from '../shared/server.service';
import { UserService } from '../shared/user.service';
import { TutorialPage } from "../pages/tutorial/tutorial";
import { AnalyticsService } from "../shared/analytics.service";
import { TopPatherPage } from "../pages/top-pather/top-pather";
import { RecommendedPatherPage } from "../pages/recommended-pather/recommended-pather";
import { User } from "../models/user";
import { PushProvider } from "../shared/pushprovider.service";
import { NotificationsPage } from "../pages/notifications/notifications";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage$: any;
  @ViewChild("rootNav") nav: Nav;
  topPather: Array<User>;
  recommendedPather: Array<User>;

  constructor(private user: UserService,
    private server: ServerService,
    private analytics: AnalyticsService,
    private translate: TranslateService,
    private oneSignal: OneSignal,
    public pushProvider: PushProvider,
    private app: AppService, private config: Config,
    injector: Injector, private loadingCtrl: LoadingController,
    platform: Platform, statusBar: StatusBar, splashscreen: SplashScreen, keyboard: Keyboard) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //statusBar.styleDefault();
      statusBar.overlaysWebView(false);
      statusBar.backgroundColorByHexString('#F43A50');

      this.config.set('backButtonText', '');
      this.config.set('backButtonIcon', 'md-arrow-back');
      this.config.set('iconMode', 'md');
      this.config.set('swipeBackEnabled', 'false');

      keyboard.hideKeyboardAccessoryBar(false);
      this.topPather = new Array<User>();
      this.recommendedPather = new Array<User>();

      //Initialize the injector global variable to use it in models.
      appInjector(injector);
      const firebaseConfig = {
        apiKey: "AIzaSyBH9YBhNuXsr6MkwihFU6cxTYVcmJl11xk",
        authDomain: "pathtime-1360.firebaseapp.com",
        databaseURL: "https://pathtime-1360.firebaseio.com",
        storageBucket: "pathtime-1360.appspot.com",
        messagingSenderId: "874360001878"

      };
      initializeApp(firebaseConfig);

      // OneSignal Code start:
      // Enable to debug issues:
      // window["plugins"].OneSignal.setLogLevel({logLevel: 4, visualLevel: 4})


      this.oneSignal.startInit('05f16497-5648-4081-8147-cb19904f7b7c', '874360001878');

      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

      this.oneSignal.handleNotificationReceived().subscribe(() => {
        // do something when notification is received
      });

      this.oneSignal.handleNotificationOpened().subscribe((data) => {
        if (data.notification.payload.additionalData.event_id != undefined && data.notification.payload.additionalData.event_id != '') {
          this.pushProvider.event_id = data.notification.payload.additionalData.event_id;
        }
        this.server.refreshNotifications().subscribe();
      });

      this.oneSignal.endInit();

      //Splashscreen.hide();
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent(''),
      });

      loading.present();
      user.isFBLogged()
        .then((res) => {
          if (res.logged) {
            app.initialize(res.loginResponse)
              .then(() => {

                this.oneSignal.getIds().then(resids => {
                  if (resids) {
                    this.server.updateClientId(resids.userId).subscribe();
                  }
                })

                if (this.user.isTutotialCompleted()) {
                  this.nav.setRoot(TabsPage);
                }
                else {
                  this.nav.setRoot(TutorialPage);
                }
                //this.nav.setRoot(TabsPage);
                splashscreen.hide();
                loading.dismiss();
              })
              .catch(error => {
                //FIXME
                console.error("Error: Can't initialize application: ", error);
              });
          } else {
            this.nav.setRoot(LoginPage);
            splashscreen.hide();
            loading.dismiss();
          }
        });
      translate.setDefaultLang('en');
      translate.use("en");
    });
  }


  /***** Menu function *****/
  language$(): void {
    if (this.translate.currentLang == "en")
      this.translate.use("fr");
    else
      this.translate.use("en");
  }

  policy$(): void {

  }

  topPather$(): void {
    if (this.topPather && this.topPather.length > 0) {
      this.nav.push(TopPatherPage, { pathers: this.topPather });
    }
    else {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Update Top Pathers'),
        dismissOnPageChange: true
      });

      loading.present();
      this.server.getTopPather()
        .subscribe(pathers => {
          this.topPather = pathers;
          this.nav.push(TopPatherPage, { pathers: this.topPather });
        }, error => {
          loading.dismiss();
        });
    }
  }

  recommendedPather$(): void {
    if (this.recommendedPather && this.recommendedPather.length > 0) {
      this.nav.push(RecommendedPatherPage, { pathers: this.recommendedPather });
    }
    else {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Update Recommended Pathers'),
        dismissOnPageChange: true
      });

      loading.present();
      this.server.getRecommendedPather()
        .subscribe(pathers => {
          this.recommendedPather = pathers;
          this.nav.push(RecommendedPatherPage, { pathers: this.recommendedPather });
        }, error => {
          loading.dismiss();
        });
    }
  }

  notifications$(): void {
    this.nav.push(NotificationsPage);
  }

  tutorial$(): void {
    this.nav.setRoot(TutorialPage);
  }

  logout$(): void {
    this.user.logout()
      //.then(() => this.server.logout().subscribe(() => this.nav.setRoot(LoginPage)));
      .then(() => this.nav.setRoot(LoginPage));
  }
}
