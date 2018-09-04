import { NgModule, ErrorHandler, Injectable } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicApp, IonicModule, IonicErrorHandler, Platform } from 'ionic-angular';
import { Globalization } from '@ionic-native/globalization';
import { Geolocation } from '@ionic-native/geolocation';
import { Keyboard } from '@ionic-native/keyboard';
import { NativeStorage } from '@ionic-native/native-storage';
import { MyApp } from './app.component';
import { CategoryPopover } from '../pages/exploration/category-popover';
import { PatherPopover } from '../pages/exploration/pather-popover';
import { CommunityPage } from '../pages/community/community';
import { Creation2Page } from '../pages/creation2/creation2';
import { AroundMePage } from '../pages/around-me/around-me';
import { CreationPage } from '../pages/creation2/creation';
import { CreationPlacePage } from '../pages/creation2/creation-place';
import { ExplorationPage } from '../pages/exploration/exploration';
import { FeedPage } from '../pages/feed/feed';
import { FollowerListPage } from '../pages/profile/followerlist/followerlist';
import { HistoricPage } from '../pages/profile/historic/historic';
import { LoginPage } from '../pages/login/login';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { RecommendedPatherPage } from '../pages/recommended-pather/recommended-pather';
import { NotificationsPage } from '../pages/notifications/notifications';
import { TopPatherPage } from '../pages/top-pather/top-pather';
import { PathListPage } from '../pages/profile/pathlist/pathlist';
import { FollowListPage } from '../pages/profile/followlist/followlist';
import { PhotosPage } from '../pages/profile/photos/photos';
import { PlanificationPage } from '../pages/planification/planification';
import { PlanificationPlacesPage } from '../pages/planification/planification-places';
import { InspirationPage } from '../pages/inspiration/inspiration';
import { PlanificationPopover } from '../pages/planification/planification-popover';
import { EmptyPage } from '../components/empty-page/empty-page';
import { SubBarIconTitle } from '../components/sub-bar-icon-title/sub-bar-icon-title.component';
import { SimpleCommentSection } from '../components/simple-comment-section/simple-comment-section.component';
import { Follow } from '../components/follow/follow.component';
import { PolicyModal } from '../pages/login/policy';
import { ProfilePage } from '../pages/profile/profile';
import { PathDetailPage } from '../pages/path/path-detail';
import { UndonePathDetailPage } from '../pages/path/undone-path-detail';
import { PathMapPage } from '../pages/path/path-map';
import { PlaceDetailPage } from '../pages/place/place-detail';
import { PlaceMapPage } from '../pages/place/place-map';
import { PlaceValidationPage } from '../pages/place/place-validation';
import { PathValidationPage } from '../pages/path/path-validation';

import { PerformPathPage } from '../pages/perform/perform-path';
import { CommentPlacePage } from '../pages/comment/comment-place';
import { CommentPathPage } from '../pages/comment/comment-path';

import { RecordsPage } from '../pages/profile/records/records';
import { TodosPage } from '../pages/profile/todos/todos';
import { SpiderPage } from '../pages/profile/spider/spider';
import { TabsPage } from '../pages/tabs/tabs';

import { GroupPage } from '../pages/group/group';
import { CreationGroupPage } from '../pages/group/creation-group/creation-group';
import { GroupDetailPage } from '../pages/group/group-detail/group-detail';
import { EventDetailPage } from '../pages/event/event-detail';
import { AddEventModal } from '../pages/event/add-event-modal/add-event-modal';

import { AppService } from '../shared/app.service';
import { CompleteFeedService } from '../shared/complete-feed.service';
import { FilterService } from '../shared/filter.service';
import { GeolocationService } from '../shared/geolocation.service';
import { MapService } from '../shared/map.service';
import { ServerService } from '../shared/server.service';
import { AnalyticsService } from '../shared/analytics.service';

import { UserService } from '../shared/user.service';

import { HeaderComponent } from '../components/header/header.component';
import { StarRatingComponent } from '../components/star-rating/star-rating.component'

import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateStaticLoader, TranslateLoader, TranslateService } from 'ng2-translate/ng2-translate';
import { AutoCompleteModule } from 'ionic2-auto-complete';
import { NativeGeocoder } from "@ionic-native/native-geocoder";
import { Facebook } from "@ionic-native/facebook";
import { AppVersion } from "@ionic-native/app-version";
import { Device } from "@ionic-native/device";
import { Network } from "@ionic-native/network";
import { OneSignal } from '@ionic-native/onesignal';
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { Toast } from "@ionic-native/toast";
import { Camera } from "@ionic-native/camera";
import { Localstorage } from "../shared/localstorage.service";
import { DragulaModule } from 'ng2-dragula'
import { ElasticModule } from 'angular2-elastic';
import { PickActivityPage } from "../pages/event/pick-activity/pick-activity";
import { EventCreationPage } from "../pages/event/event-creation/event-creation";
import { AutoresizeDirective } from "../shared/autoresize";
import { GroupSettingPage } from "../pages/group/group-setting/group-setting";
import { EventSettingPage } from "../pages/event/event-settings/event-setting";
import { CommentEventPage } from "../pages/comment/comment-event";
import { PathSettingPage } from "../pages/path/path-setting";
import { SelectGroupPage } from "../pages/group/select-group/select-group";
import { PushProvider } from "../shared/pushprovider.service";
import { PathCard } from "../components/cards/path/path-card";
import { PlaceCard } from "../components/cards/place/place-card";
import { NewFollowCard } from "../components/cards/new-follow-card/new-follow-card";
import { GroupCard } from "../components/cards/group/group-card";
import { EventCard } from "../components/cards/event/event-card";
import { EventSelectionModal } from "../components/cards/event/modal-event-selection";
import { NewEventModal } from "../components/cards/event/modal-new-event";
import { ChatCardPage } from "../pages/chat-card/chat-card";
import { CreationModal } from "../pages/creation2/creation-modal/creation-modal";


export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, 'assets/i18n', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    CategoryPopover,
    PatherPopover,
    CommunityPage,
    AroundMePage,
    Creation2Page,
    CreationPlacePage,
    CreationPage,
    FeedPage,
    GroupPage,
    CreationGroupPage,
    EventCreationPage,
    EventSettingPage,
    GroupDetailPage,
    GroupSettingPage,
    FollowerListPage,
    HistoricPage,
    LoginPage,
    TutorialPage,
    TopPatherPage,
    RecommendedPatherPage,
    NotificationsPage,
    ExplorationPage,
    PathListPage,
    FollowListPage,
    PhotosPage,
    ChatCardPage,
    PlanificationPage,
    PlanificationPlacesPage,
    InspirationPage,
    PlanificationPopover,
    EmptyPage,
    SubBarIconTitle,
    SimpleCommentSection,
    PathCard,
    PlaceCard,
    GroupCard,
    EventCard,
    NewFollowCard,
    Follow,
    PolicyModal,
    AddEventModal,
    NewEventModal,
    CreationModal,
    EventSelectionModal,
    ProfilePage,
    PathDetailPage,
    PathSettingPage,
    EventDetailPage,
    PickActivityPage,
    SelectGroupPage,
    PathMapPage,
    UndonePathDetailPage,
    PlaceDetailPage,
    PlaceValidationPage,
    PlaceMapPage,
    PathValidationPage,
    PerformPathPage,
    CommentPlacePage,
    CommentPathPage,
    CommentEventPage,
    RecordsPage,
    TodosPage,
    SpiderPage,
    StarRatingComponent,
    TabsPage,
    HeaderComponent,
    AutoresizeDirective
  ],
  imports: [
    BrowserAnimationsModule,
    HttpModule,
    AutoCompleteModule,
    IonicModule.forRoot(MyApp, {
      autoFocusAssist: false,
      scrollAssist: false
    }),
    DragulaModule,
    ElasticModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    CommunityPage,
    AroundMePage,
    Creation2Page,
    CreationPage,
    CreationPlacePage,
    EventCreationPage,
    EventSettingPage,
    FeedPage,
    GroupPage,
    CreationGroupPage,
    GroupDetailPage,
    GroupSettingPage,
    EventDetailPage,
    PickActivityPage,
    SelectGroupPage,
    FollowerListPage,
    HistoricPage,
    LoginPage,
    TutorialPage,
    TopPatherPage,
    RecommendedPatherPage,
    NotificationsPage,
    ExplorationPage,
    PathListPage,
    FollowListPage,
    PhotosPage,
    ChatCardPage,
    PlanificationPage,
    PlanificationPlacesPage,
    InspirationPage,
    PolicyModal,
    AddEventModal,
    NewEventModal,
    CreationModal,
    EventSelectionModal,
    ProfilePage,
    PathDetailPage,
    PathSettingPage,
    PathMapPage,
    UndonePathDetailPage,
    PlaceDetailPage,
    PlaceValidationPage,
    PlaceMapPage,
    PathValidationPage,
    PerformPathPage,
    CommentPlacePage,
    CommentPathPage,
    CommentEventPage,
    RecordsPage,
    TodosPage,
    SpiderPage,
    TabsPage
  ],
  providers: [
    AppService,
    CompleteFeedService,
    Geolocation,
    NativeGeocoder,
    FilterService,
    GeolocationService,
    Globalization,
    AppVersion,
    Device,
    Network,
    Keyboard,
    MapService,
    ServerService,
    AnalyticsService,
    UserService,
    StatusBar,
    Camera,
    SplashScreen,
    Toast,
    Facebook,
    PushProvider,
    NativeStorage,
    Localstorage,
    OneSignal,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
