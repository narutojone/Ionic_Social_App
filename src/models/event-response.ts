import { User } from './user';
import { PathTimeObject } from "./pathtime-object";
import { EventResponseChoice } from "./enum";

export class EventResponse implements PathTimeObject {
  public id: number;
  public user: User;
  public response: EventResponseChoice;

  constructor() {
  }

  from(response_choice: EventResponse): void {
    this.user = new User();
    this.user.from(response_choice.user);
    this.response = response_choice.response;
    this.id = response_choice.id;
  }
}
