export class Logger {
  static isActive = false;
  static logs: string[] = [];

  static info(text: string) {
    if (!this.isActive) {
      return;
    }

    if (this.logs.find(el => el === text)) {
      console.info(`[Duplicate]: ${text}`);
      return;
    }

    this.logs.push(text);
    console.log(text);
  }
}
