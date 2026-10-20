export type Lang = 'ru' | 'en' | 'pt';
export type Theme = 'dark' | 'light';
export type View = 'home' | 'analytics' | 'history' | 'settings';
export type Bucket = 'low' | 'mid' | 'hi';

export interface Round {
  id: number;
  multiplier: number;
  ts: number;
}

export interface Settings {
  windowSize: number;
  lang: Lang;
  theme: Theme;
  animations: boolean;
  demo: boolean;
}

export type SourceStatus = 'demo' | 'connecting' | 'online' | 'offline' | 'error' | 'unconfigured';

export interface DataState {
  rounds: Round[];
  status: SourceStatus;
  error: string | null;
  lastOk: number | null;
  dropped: number;
  refresh: () => Promise<void>;
}
