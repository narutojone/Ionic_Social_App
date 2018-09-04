import { Component, Input } from '@angular/core';
import { Path } from "../../models/path";
import { NavController, ModalController } from "ionic-angular";
import { PerformPathPage } from "../../pages/perform/perform-path";
import { UserService } from "../../shared/user.service";
import { PathSettingPage } from "../../pages/path/path-setting";

@Component({
  selector: 'pt-sub-bar-icon-title',
  templateUrl: 'sub-bar-icon-title.html'
})
export class SubBarIconTitle {
  @Input() icon: string;
  @Input() img: string;
  @Input() title: string;
  @Input() path: Path;
  @Input() perform: boolean;

  constructor(private navCtrl: NavController, private user: UserService, private modalCtrl: ModalController) {
  }

  goPath() {
    this.navCtrl.push(PerformPathPage, { path: this.path });
  }

}
