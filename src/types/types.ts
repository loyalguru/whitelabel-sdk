import { MSG_REQUEST_NEW_TOKEN, MSG_DATALAYER_EVENT, MSG_SIZE, MSG_AUTH_TOKEN, } from './messages-types';

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

export type IncomingMessage =
  | RequestNewTokenMessage
  | DataLayerMessage
  | SizeMessage;

export type AuthTokenMessage = {
  type: typeof MSG_AUTH_TOKEN;
  token: string;
  locale: string;
};

export type OutgoingMessage = AuthTokenMessage;

export type OnSizePayload = {
  height: number;
  width?: number;
  origin: string;
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
};
