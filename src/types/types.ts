import { MSG_REQUEST_NEW_TOKEN, MSG_DATALAYER_EVENT, MSG_SIZE, MSG_AUTH_TOKEN, MSG_SERVER_ERRORS, MSG_DATA, } from './messages-types';

export type EmbedModule = 'loyalty' | 'cdp' | 'coupons' | 'login';

export type RequestNewTokenMessage = {
  type: typeof MSG_REQUEST_NEW_TOKEN;
};

export type DataLayerMessage = {
  type: typeof MSG_DATALAYER_EVENT;
  payload: unknown;
};

export type SizeMessage = {
  type: typeof MSG_SIZE;
  height: number;
  width?: number;
};

export type ServerErrorPayload = {
  status: number;
  url?: string | null;
  message: string;
  errorCode?: string | null;
  errorBody?: unknown;
  ts: number;
};

export type ServerErrorMessage = {
  type: typeof MSG_SERVER_ERRORS;
  payload: ServerErrorPayload;
};

export type IncomingMessage =
  | RequestNewTokenMessage
  | DataLayerMessage
  | SizeMessage
  | ServerErrorMessage
  | DataMessage;

export type AuthTokenMessage = {
  type: typeof MSG_AUTH_TOKEN;
  token: string;
  locale: string;
  module?: string; 
};

export type OutgoingMessage = AuthTokenMessage;

export type OnSizePayload = {
  height: number;
  width?: number;
  origin: string;
};

export type OnDataPayload<T = unknown> = {
  payload: T;
  origin: string;
};

export type DataMessage<T = unknown> = {
  type: typeof MSG_DATA;
  payload: T;
};

export type InitConfig = {
  containerId: string;
  module: EmbedModule;
  iframeOrigin: string;
  token: string;
  locale?: string;
  onLoad?: () => void;
  onError?: (e: Error) => void;
  onSize?: (payload: OnSizePayload) => void;
  autoResize?: boolean;
  onServerError?: (payload: ServerErrorPayload) => void;
  onTokenRefresh?: () => void;
  onData?: (payload: OnDataPayload) => void;
};
