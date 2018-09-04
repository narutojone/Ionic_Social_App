import { Component, Input } from '@angular/core';
import { User } from "../../../models/user";
import { UserService } from "../../../shared/user.service";
import { NavController, LoadingController, NavParams } from "ionic-angular";
import { ServerService } from "../../../shared/server.service";
import { PlaceDetailPage } from "../../place/place-detail";
import { Place } from "../../../models/place";
import { Photo } from "../../../models/photo";
import { SegmentEvents } from "../../../shared/analytics.model";
import { AnalyticsService } from "../../../shared/analytics.service";

@Component({
  selector: 'page-photos',
  templateUrl: 'photos.html'
})
export class PhotosPage {
@Input() u: User;
rows: Array<Array<Photo>>;

  constructor(private user: UserService, public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private server: ServerService, public params: NavParams,  private analyticsService: AnalyticsService) {
      this.u = this.params.get("u");
      this.populateGrid(this.u.photoList, 3);
  }

  ionViewDidEnter() {
    let payload = {
      userCheckedFBID: this.u.facebook_id,
      contentLength: this.u.photoList.length
    }
    this.analyticsService.trackScreen(SegmentEvents.Photos, payload);
  }

  populateGrid(items: Array<Photo>, size: number) {
		this.rows = new Array<Array<Photo>>();
		let i = 0;
 
		let total = items.length;
 
		do {
			let cols = new Array<Photo>();
 
			for (let j = 0; j < size; j++) {
				if ((i + j) < total) {
					cols.push(items[i + j]);
				}
			}
 
			this.rows.push(cols);
			i += size;
		} while(i < total);
	}
  
  goPlaceDetail(p: Place): void {
    if (p.opening_hours) {
      this.navCtrl.push(PlaceDetailPage, { place: p });
    }
    else {
      let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.server.getLoadingContent('Download Place Infos'),
        dismissOnPageChange: true
      });

      loading.present();
      this.server.getPlace(p.google_id)
        .subscribe(place => {
          p = place;
          this.navCtrl.push(PlaceDetailPage, { place: p });
        }, error => {
          //FIXME: Dislplay Toast
          loading.dismiss();
        });
    }
  }

}
