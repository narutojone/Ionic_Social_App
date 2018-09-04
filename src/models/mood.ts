export class Mood {
  id: number;
  name: string;
  icon_name: string;
  english_name: string;

  getIcon(outline: boolean = false) {
    if (!this.icon_name)
      return outline ? 'md-pt-logo-outline' : 'md-pt-logo';

    return outline ? this.icon_name + "-outline" : this.icon_name;
  }


  from(mood: Mood): void {
    this.id = mood.id;
    this.name = mood.name;
    this.icon_name = mood.icon_name;
    this.english_name = mood.english_name;
  }

  getName(language: string): string{
    if (language == "en" && this.english_name) {
        return this.english_name;
    }
    else {
        return this.name;
    }
  }
}
