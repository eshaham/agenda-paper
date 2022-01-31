export interface SettingsData {
  showLocation?: boolean;
  showFreeEvents?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
}
