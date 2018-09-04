import { Budget } from './enum';
import { Category } from './category';
import { Companion } from './companion';
import { Mood } from './mood';
import { User } from "./user";

export class Filter {
    city: string;//FIXME
    city_id: string;
    city_lat: number;
    city_lng: number;
    with: Companion;
    pathers: Array<User>;
    categories: Array<Category>;
    moods: Array<Mood>;
    budget: Budget;

    constructor() {
      this.categories = new Array<Category>();
      this.moods = new Array<Mood>();
      this.pathers = new Array<User>();
      this.with = null;
      this.budget = Budget.Average;
    }
}
