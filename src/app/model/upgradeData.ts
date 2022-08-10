export class UpgradeData {
  height: number;
  version: string;
  manualScriptContent?: string;

  constructor(height: number, version: string) {
    this.height = height;
    this.version = version;
  }
}
