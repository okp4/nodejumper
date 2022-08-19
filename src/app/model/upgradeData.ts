export class UpgradeData {
  height: number;
  version: string;
  manualScriptContent?: string;
  automaticUpgradeDisabled?: boolean;

  constructor(height: number, version: string, automaticUpgradeDisabled: boolean) {
    this.height = height;
    this.version = version;
    this.automaticUpgradeDisabled = automaticUpgradeDisabled;
  }
}
