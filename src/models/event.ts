import { User } from './user';
import { PathTimeObject } from './pathtime-object';
import { Group } from "./group";
import { Path } from "./path";
import { EventType, EventResponseChoice } from "./enum";
import { Place } from "./place";
import { SimpleComment } from "./simple-comment";
import { EventResponse } from "./event-response";

export class Event<T extends PathTimeObject> implements PathTimeObject {
  public id: number;
  public name: String;
  public description: String;
  public date: Date;
  public updated_at: Date;
  public user: User;
  public group: Group;
  public event_type: EventType;
  public activity: T;
  public validated: boolean;
  public note: number;
  public nb_notes: number;
  public user_response: EventResponseChoice;
  public comments: Array<SimpleComment>;
  public responses: Array<EventResponse>;
  public members: Array<User>

  constructor() {
    this.comments = new Array<SimpleComment>();
    this.responses = new Array<EventResponse>();
    this.members = new Array<User>();
  }

  from(event: Event<T>, ref: T): void {
    this.name = event.name;
    this.description = event.description;
    this.id = event.id;
    this.updated_at = event.updated_at;
    this.date = event.date;
    this.event_type = event.event_type;
    this.validated = event.validated;
    this.activity = ref;
    if (this.event_type == EventType.Place || this.event_type == EventType.UndonePlace)
      this.activity.from(event.activity, new Place());
    else if (this.event_type == EventType.Path || this.event_type == EventType.UndonePath)
      this.activity.from(event.activity, new Path());
    else {
      this.activity.from(event.activity);
    }
    if (event.group) {
      this.group = new Group();
      this.group.from(event.group);
    }
    this.user = new User();
    this.user.from(event.user);
    this.user_response = event.user_response;
    if (event.comments) {
      for (let i = 0; i < event.comments.length; ++i) {
        let comment = new SimpleComment();
        comment.from(event.comments[i]);
        this.comments.push(comment);
      }
    }
    if (event.responses) {
      for (let i = 0; i < event.responses.length; ++i) {
        let response = new EventResponse();
        response.from(event.responses[i]);
        this.responses.push(response);
      }
    }
    if (event.members) {
      for (let i = 0; i < event.members.length; ++i) {
        let member = new User();
        member.from(event.members[i]);
        this.members.push(member);
      }
    }
    if (event.note) {
      this.note = event.note;
      this.nb_notes = event.nb_notes;
    }
  }

  getInterestedPeople() {
    let count = 0;
    this.responses.forEach(response => {
      count += response.response == EventResponseChoice.Interested ? 1 : 0;
    });
    return count;
  }

  getGroupMembersCount() {
    if (this.group) {
      return this.group.getMembersCount();
    }
    else {
      return this.responses.length;
    }
  }

  orderedResponses() {
    return this.responses.sort((a, b) => a.response - b.response).reverse();
  }

  static parseEvent(res) {
    let e = new Event<PathTimeObject>();
    let ref: PathTimeObject;
    let et = <any>EventType[res.event_type];

    if (et == EventType.Place || et == EventType.UndonePlace) {
      ref = new Place();
    }
    else if (et == EventType.Path || et == EventType.UndonePath) {
      ref = new Path();
    }
    else {
      ref = null;
    }

    e.from(res, ref);
    return e;
  }

  static parseEvents(res) {
    let events = new Array<Event<PathTimeObject>>();
    for (let i = 0; i < res.length; ++i) {
      let e = Event.parseEvent(res[i]);
      events.push(e);
    }
    return events;
  }

  isEventPlace() {
    return this.event_type == EventType.Place || this.event_type == EventType.UndonePlace;
  }

}
