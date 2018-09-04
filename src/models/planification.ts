import { Category } from './category';
import { Place } from './place';
import * as MarkerWithLabel from 'markerwithlabel';


export class Planification {
  activity_type: Category;
  steps: Array<Place>;

  from(planification: Planification): void {
    this.activity_type = new Category();
    this.activity_type.from(planification.activity_type);

    if (planification.steps) {
      this.steps = new Array<Place>();
      for (var i = 0; i < planification.steps.length; ++i) {
        let s = new Place();
        s.from(planification.steps[i]);
        this.steps.push(s);
      }
    }
  }

  drawMarkers(map: google.maps.Map): Array<any> {
    var markers = Array<any>();
    let markerLabel = MarkerWithLabel(google.maps);
    this.steps.forEach(p => {
      var marker = new markerLabel({
        position: p.getLatLng(),
        animation: google.maps.Animation.DROP,
        map: map,
        icon: ' ',
        labelContent: '<i class="ion-' + p.getCategory(0).getIcon() + '"></i>',
        labelClass: "creation-marker-label",
        labelAnchor: new google.maps.Point(6, 6),
      });
      markers.push({
        marker: marker,
        place: p
      });
    });
    return markers;
  }
}
