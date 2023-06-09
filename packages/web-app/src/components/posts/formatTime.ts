export const timeSince = (date: Date): string => {
  // 2 minutes ago, 3 hours ago, 4 days ago, 5 months ago, 6 years ago etc
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) {
    // years
    return "on " + date.toLocaleDateString();
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    // months
    return "on " + date.toLocaleDateString();
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval).toString() + " dagen geleden";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval).toString() + " uur geleden";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval).toString() + " minuten geleden";
  }
  return Math.floor(seconds).toString() + " seconden geleden";
};
