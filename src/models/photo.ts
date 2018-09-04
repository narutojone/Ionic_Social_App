import { Place } from './place';
import { User } from './user';

export class Photo {
  public user: User;
  public url: String;
  public place: Place;

  from(p: Photo): void {
    this.user = new User();
    this.user.from(p.user);
    this.place = new Place();
    this.place.from(p.place)
    this.url = p.url;
  }
}
