export interface SettingsData {
  showLocation?: boolean;
  showFreeEvents?: boolean;
  maskPrivateEvents?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
}
