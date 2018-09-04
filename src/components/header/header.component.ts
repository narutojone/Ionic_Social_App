import { Component } from '@angular/core';
import { UserService } from '../../shared/user.service';
import { ProfilePage } from '../../pages/profile/profile';
import { NavController } from 'ionic-angular';

@Component({ selector: 'pt-header', templateUrl: 'header.html' })
export class HeaderComponent {

    constructor(private user: UserService, private nav: NavController) {

    }

    goProfile(): void {
      let view = this.nav.getActive();
      if (view.component !== ProfilePage){
        //this.nav.parent.select(1);
        this.nav.push(ProfilePage, {u: this.user.getUser()} );
        //this.nav.setRoot(ProfilePage);
      }
    }
}
