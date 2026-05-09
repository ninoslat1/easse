export class HTMLModule {
  constructor() {}

  private REGEX_FORMAT = /<[a-z][\s\S]*>/i;

  public minifyHTML(html: string): string {
    return html.replace(/\n/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
  }

  public isHTML(html: string): boolean {
    const htmlRegex = this.REGEX_FORMAT;
    return htmlRegex.test(html);
  }
}
