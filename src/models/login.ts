export class LoginResponse {

  constructor(public device: string,
              public phone: string,
              public language: string,
              public token: string) {

  }
}

export class LoggedResponse {
  public loginResponse: LoginResponse;

  constructor(public logged: boolean,
              public device: string = null,
              public phone: string = null,
              public language: string = null,
              public token: string = null) {
    if (logged) {
      this.loginResponse = new LoginResponse(device, phone, language, token);
    }
  }
}


export class ConnectedResponse {
  firstname: string;
  lastname: string;
  main_photo: string;
  points: number;
  id: number;
  phone: string;
  profile_picture: string;
  rank: string;
  followers: number;
  follows: number;
  tutorial_completed: boolean;
  last_ip: string;
}
