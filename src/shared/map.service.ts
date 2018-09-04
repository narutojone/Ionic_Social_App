import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';

import { GeolocationService } from './geolocation.service';

@Injectable()
export class MapService {
  private options = {
    center: new google.maps.LatLng(-34.9290, 138.6010),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER
    },
    scaleControl: false,
    streetViewControl: false,
    styles: MapService.getStyle()
  };

  constructor(plateform: Platform, private geolocation: GeolocationService) {
  }

  getOptions(): any {
    if (this.geolocation.getLastLocation()) {
      let loc = this.geolocation.getLastLocation();
      this.options.center = new google.maps.LatLng(loc.latitude, loc.longitude);
    }
    return this.options;
  }


  public static get_static_style(styles): any {
    var result = [];
    styles.forEach(function (v, i, a) {
      var style = '';
      if (v.stylers) { // only if there is a styler object
        if (v.stylers.length > 0) { // Needs to have a style rule to be valid.
          style += (v.hasOwnProperty('featureType') ? 'feature:' + v.featureType : 'feature:all') + '|';
          style += (v.hasOwnProperty('elementType') ? 'element:' + v.elementType : 'element:all') + '|';
          v.stylers.forEach(function (val, i, a) {
            var propertyname = Object.keys(val)[0];
            var propertyval = val[propertyname].toString().replace('#', '0x');
            // changed "new String()" based on: http://stackoverflow.com/a/5821991/1121532

            style += propertyname + ':' + propertyval + '|';
          });
        }
      }
      result.push('style=' + encodeURIComponent(style));
    });

    return result.join('&');
  }

  public static getStyle(): any {
    return [{
      "featureType": "administrative",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#444444"
      }]
    },
    {
      "featureType": "administrative.country",
      "elementType": "geometry.fill",
      "stylers": [{
        "visibility": "on"
      },
      {
        "hue": "#ff0044"
      }]
    },
    {
      "featureType": "administrative.country",
      "elementType": "geometry.stroke",
      "stylers": [{
        "visibility": "on"
      },
      {
        "color": "#bea1e5"
      }]
    },
    {
      "featureType": "administrative.country",
      "elementType": "labels.text",
      "stylers": [{
        "hue": "#ff0000"
      },
      {
        "visibility": "on"
      }]
    },
    {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [{
        "color": "#f2f2f2"
      }]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry.fill",
      "stylers": [{
        "visibility": "on"
      },
      {
        "color": "#efe9db"
      }]
    },
    {
      "featureType": "landscape.natural.landcover",
      "elementType": "geometry.fill",
      "stylers": [{
        "color": "#f2e7c8"
      }]
    },
    {
      "featureType": "poi",
      "elementType": "all",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.attraction",
      "elementType": "all",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.attraction",
      "elementType": "geometry",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.attraction",
      "elementType": "labels",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.business",
      "elementType": "geometry",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.business",
      "elementType": "labels",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.business",
      "elementType": "labels.icon",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.government",
      "elementType": "geometry",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.government",
      "elementType": "labels",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.medical",
      "elementType": "geometry",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.medical",
      "elementType": "labels",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.place_of_worship",
      "elementType": "geometry",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.place_of_worship",
      "elementType": "labels",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.school",
      "elementType": "geometry",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.school",
      "elementType": "labels",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.sports_complex",
      "elementType": "geometry",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "poi.sports_complex",
      "elementType": "labels",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "road.highway",
      "elementType": "all",
      "stylers": [{
        "visibility": "simplified"
      }]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "road.arterial",
      "elementType": "all",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.icon",
      "stylers": [{
        "visibility": "off"
      }]
    },
    {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "road.local",
      "elementType": "labels",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "transit",
      "elementType": "all",
      "stylers": [{
        "visibility": "off"
      }]
    },
    {
      "featureType": "transit",
      "elementType": "labels",
      "stylers": [{
        "visibility": "on"
      }]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [{
        "visibility": "off"
      }]
    },
    {
      "featureType": "water",
      "elementType": "all",
      "stylers": [{
        "color": "#46bcec"
      },
      {
        "visibility": "on"
      }]
    }];
  }

  getPlaceDetails(map, id): Observable<google.maps.places.PlaceResult> {
    let service = new google.maps.places.PlacesService(map);
    return Observable.create(observer => {
      service.getDetails({ placeId: id }, (res, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          observer.next(res);
          observer.complete();
        }
        else {
          observer.onError("Failed to find place details: " + status);
        }
      });
    });
  }

  ZoomToPath(map, obj) {
    var bounds = new google.maps.LatLngBounds();
    var points = obj.getPath().getArray();
    for (var n = 0; n < points.length ; n++){
        bounds.extend(points[n]);
    }
    map.fitBounds(bounds);
    if (obj.getPath().getArray().length <= 1)
    {
      map.setZoom(map.getZoom() - 5);
    }
    else {
      map.setZoom(map.getZoom() - 1);
    }
  }

  ZoomToMarkers(map, obj){
    var bounds = new google.maps.LatLngBounds();
    obj.forEach(m => {
      bounds.extend(m.getPosition());
    });
    map.fitBounds(bounds);
    map.setZoom(map.getZoom() - 1);
  }

  ZoomToPathAndUser(map, obj, pos) {
    var bounds = new google.maps.LatLngBounds();
    var points = obj.getPath().getArray();
    for (var n = 0; n < points.length ; n++){
        bounds.extend(points[n]);
    }
    bounds.extend(pos);
    map.fitBounds(bounds);
    if (obj.getPath().getArray().length <= 1)
    {
      map.setZoom(map.getZoom() - 5);
    }
    else {
      map.setZoom(map.getZoom() - 1);
    }
  }

}
