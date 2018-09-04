export class Category {
  id: number;
  name: string;
  children: Array<Category>;
  parent_id: number;
  parent_icon: string;
  icon: string;
  english_name: string;

  getIcon(outline: boolean = false): string {
    if (this.icon && this.icon.startsWith('md-'))
      return outline ? this.icon + '-outline' : this.icon;
    else
    {
      if (this.parent_icon && this.parent_icon.startsWith('md-'))
        return outline ? this.parent_icon + '-outline' : this.parent_icon;
      else
        return outline ? 'md-pt-logo-outline' : 'md-pt-logo';
    }
  }

  from(category: Category): void {
    this.id = category.id;
    this.name = category.name;
    this.english_name = category.english_name;
    this.parent_id = category.parent_id;
    this.parent_icon = category.parent_icon;
    this.icon = category.icon;
    this.children = new Array<Category>();

    if (!category.children) {
      return;
    }
    for (var i = 0; i < category.children.length; ++i) {
      let c = category.children[i];
      let new_c = new Category();
      new_c.from(c);
      this.children.push(new_c);
    }
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
