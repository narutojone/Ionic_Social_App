export class Companion {
  value: string;
  icon: string;

  constructor(value: string, icon: string) {
    this.value = value;
    this.icon = icon;
  }

  getIcon(outline: boolean = false): string {
    return outline ? this.icon + '-outline' : this.icon;
  }

  from(companion: Companion): void {
    this.value = companion.value;
    this.icon = companion.icon;
  }
}
