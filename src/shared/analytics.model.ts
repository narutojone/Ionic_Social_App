/**
 * LIST ALL THE EVENTS TO TRACK HERE
 *
 * Please follow this guide for naming conventions
 * https://segment.com/academy/collecting-data/naming-conventions-for-clean-data/
 *
 * Simple rule : Object + Action
 * eg, Object = Activity, action = Viewed
 *
 */

class SegmentAppViewEvents {
}

class SegmentCategory extends SegmentAppViewEvents {
  static ACCOUNT: string = 'Account';
}

class SegmentAppPages extends SegmentCategory {
  static Profile: string = 'Profile Page';
  static Records: string = 'Records Page';
  static Todos: string = 'Todos Page';
  static Photos: string = 'Photos Page';
  static PathList: string = 'PathList Page';
  static Historic: string = 'Historic Page';
  static FollowList: string = 'FollowList Page';
  static FollowerList: string = 'FollowerList Page';
  static Feed: string = "Feed Page";
  static Creation: string = "Ceation Page";
  static Exploration: string = "Exploration Page";
  static Tutorial: string = "Tutorial Page";
  static RecommendedPather: string = "Recommended Pather Page";
  static NotificationsPage: string = "Notifications Page";
  static TopPather: string = "Top Pather Page";
  static Planification: string = "Planification Page";
  static PlanificationPlaces: string = "Planification Places Page";
  static PlaceValidation: string = "Place Validation Page";
  static PlaceMap: string = "Place Map Page";
  static PlaceDetail: string = "Place Detail Page";
  static PerformPath: string = "Perform Path Page";
  static UndonePath: string = "Undone Path Page";
  static PathValidation: string = "Path Validation Page";
  static PathMap: string = "Path Map Page";
  static PathDetail: string = "Path Detail Page";
  static PathSetting: string = "Path Setting Page";
  static GroupDetail: string = "Group Detail Page";
  static GroupSetting: string = "Group Setting Page";
  static EventDetail: string = "Event Detail Page";
  static Inspiration: string = "Inspiration Page";
  static CommentPath: string = "Comment Path Page";
  static CommentPlace: string = "Comment Place Page";
  static CommentEvent: string = "Comment Event Page";
  static EventCreation: string = "Event Creation Page";
  static PickActivityPage: string = "Pick Activity Page";
  static ChatPage: string = "Chat Page";
}

export class SegmentEvents extends SegmentAppPages {
  static SearchPlanification: string = "Search Planification";
  static SearchInspiration: string = "Search Inspiration";
  static tutorialDone: string = "TutorialDone Event";
  static likePath: string = "Path Liked";
  static dislikePath: string = "Path Disliked";
  static likePlace: string = "Place Liked";
  static dislikePlace: string = "Place DisLiked";
  static likeMessage: string = "Message Liked";
  static dislikeMessage: string = "Message DisLiked";
  static favorPlace: string = "Place add in Todos";
  static unfavorPlace: string = "Place removed from Todos";
  static favorPath: string = "Path Saved";
  static unfavorPath: string = "Path UnSaved";
  static addFollow: string = "Add Follow";
  static deleteFollow: string = "Delete Follow";
  static sendPlaceComment: string = "sendPlaceComment Event";
  static sendPathComment: string = "sendPathComment Event";
  static sendEventComment: string = "sendPathComment Event";
  static createPath: string = "createPath Event";
  static updatePath: string = "updatePath Event";
  static createPathFromUndone: string = "createPathFromUndone Event";
  static createUndonePath: string = "createUndonePath Event";
  static createPlace: string = "createPlace Event";
  static createPlaceAndComment: string = "createPlaceAndComment Event";
  static createPendingMood: string = "createPendingMood Event";
  static createPendingCategory: string = "createPendingCategory Event";

}
