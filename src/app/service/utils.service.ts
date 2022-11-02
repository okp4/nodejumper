import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() {}

  compactNumber(num: number, maximumFractionDigits = 0): string {
    return Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: maximumFractionDigits
    }).format(num);
  }

  humanReadableTimeDifferenceSeconds(dateTimeString: string) {
    const dateTime = new Date(dateTimeString);
    const now = new Date();
    return (now.getTime() - dateTime.getTime()) / 1000;
  }

  humanReadableTimeDifferenceString(dateTimeString: string) {
    const timeDifferenceInSeconds = this.humanReadableTimeDifferenceSeconds(dateTimeString);
    return this.secondsToHumanReadableFormat(timeDifferenceInSeconds);
  }

  secondsToHumanReadableFormat(seconds: number) {
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval + " year" + (interval > 1 ? 's' : '');
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval + " month" + (interval > 1 ? 's' : '');
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval + " day" + (interval > 1 ? 's' : '');
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval + " hour" + (interval > 1 ? 's' : '');
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval + " minute" + (interval > 1 ? 's' : '');
    }
    interval = Math.floor(seconds);
    return interval + " second" + (interval > 1 ? 's' : '');
  }

  isIP6Address(ip: string) {
    const match = ip.match(/:/g);
    return match && match.length > 1;
  }

  calculatePercentage(partial: number, total: number) {
    return ((partial * 100) / total).toFixed(2)
  }

  isCosmosSdkVersionGreaterThan(v1: string, v2: string) {
    if (v1 === v2) {
      return true;
    }
    const v1Array = v1.replace(/v/g, ' ').split('.');
    const v2Array = v2.replace(/v/g, ' ').split('.');
    for (let i = 0; i < v1Array.length; i++) {
      const part1 = +v1Array[i];
      const part2 = +v2Array[i];
      if (part1 > part2) {
        return true;
      }
      if (part1 < part2) {
        return false;
      }
    }
    return false;
  }
}
