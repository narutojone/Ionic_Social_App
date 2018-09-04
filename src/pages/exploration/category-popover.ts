import { ApplicationRef, Component, Input } from '@angular/core';
import { ViewController, AlertController } from 'ionic-angular';

import { Category } from '../../models/category';
import { TranslateService } from "ng2-translate";
import { SegmentEvents } from "../../shared/analytics.model";
import { AnalyticsService } from "../../shared/analytics.service";
import { ServerService } from "../../shared/server.service";
import { PtTap } from "../../shared/ptTap.model";

@Component({
  selector: 'pt-popover-category',
  templateUrl: 'category-popover.html'
})
export class CategoryPopover {
  @Input() parent: Category;
  @Input() result: Array<Category>;
  private ptTap: PtTap;


  constructor(private viewCtrl: ViewController,
              private appRef: ApplicationRef,
              private translate: TranslateService, 
              private alertCtrl: AlertController, 
              private analyticsService: AnalyticsService,
              private server: ServerService) {
  }

  chooseCategory(category: Category) {
    let index: number = this.result.indexOf(category);
    if (index >= 0) {
      this.result.splice(index, 1);
    }
    else {
      this.result.push(category);
    }

    this.appRef.tick();
  }

  touchStartPtTap($event) {
    this.ptTap = new PtTap(event);
  }

  touchEndPtTap($event) {
    return this.ptTap.needFire(event);
  }

  addPendingCategory() {
    this.translate.get('EXPLORATION.ALERTCATEGORY').subscribe(
      value => {
        let alert = this.alertCtrl.create({
          title: value.TITLE,
          subTitle: value.TEXT,
          inputs: [
            {
              name: 'name',
              placeholder: value.NAME
            }
          ],
          buttons: [
            {
              text: value.CANCEL,
              role: 'cancel'
            },
            {
              text: value.VALIDATE,
              handler: data => {
                if (data.name != '') {
                  this.analyticsService.trackEvent(SegmentEvents.createPendingCategory, {name: name});
                  this.server.createPendingCategory(data.name)
                  .subscribe(() => {
                    let alert = this.alertCtrl.create({
                    title: value.DONETITLE,
                    subTitle: value.DONETEXT,
                    buttons: ['OK']
                  });
                  alert.present();
                  });
                } else {
                  return false;
                }
              }
            }
          ]
        });
      alert.present();
      }
    );
  }
}
