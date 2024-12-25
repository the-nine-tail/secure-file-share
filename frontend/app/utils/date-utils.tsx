export class DateUtils {
  formatTimestampToChatBubbleDate = (timestamp: number): string => {
    const now = new Date();
    const date = new Date(timestamp * 1000);
    const oneWeekAgo = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 7
    );
    const oneYearAgo = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate()
    );

    const formatterTime = new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const timeStr = formatterTime.format(date);

    if (date > oneWeekAgo && date < now) {
      const formatterDay = new Intl.DateTimeFormat("en", { weekday: "short" });
      const dayStr = formatterDay.format(date);
      return `${timeStr} • ${dayStr}`;
    }

    if (date <= oneWeekAgo && date > oneYearAgo) {
      const formatterDayMonth = new Intl.DateTimeFormat("en", {
        month: "short",
        day: "2-digit",
      });
      const dayMonthStr = formatterDayMonth.format(date);
      return `${timeStr} • ${dayMonthStr}`;
    }

    if (date <= oneYearAgo) {
      const formatterFull = new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const fullStr = formatterFull.format(date);
      return `${timeStr} • ${fullStr}`;
    }

    return "";
  };
}
