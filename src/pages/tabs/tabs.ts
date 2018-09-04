import { Component, AfterViewInit } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard';

import { FeedPage } from '../feed/feed';
import { GroupPage } from '../group/group';
import { ExplorationPage } from '../exploration/exploration';
import { CreationPage } from '../creation2/creation';
import { ProfilePage } from "../profile/profile";
//import { CommunityPage } from '../community/community';

@Component({
  providers: [Keyboard],
  templateUrl: 'tabs.html'
})
export class TabsPage implements AfterViewInit {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  groupTab: any = GroupPage;
  feedTab: any = FeedPage;
  explorationTab: any = ExplorationPage;
  //creationTab: any = CreationPage;
  //profileTab: any = ProfilePage;
  //communityTab: any = CommunityPage;
  constructor(private keyboard: Keyboard) {

  }

  ngAfterViewInit(): void {
    this.keyboard.onKeyboardShow().subscribe(() => {

    });
    this.keyboard.onKeyboardHide().subscribe(() => {

    });
  }

}
