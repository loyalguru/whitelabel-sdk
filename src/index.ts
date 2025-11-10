
import { embedLoyaltyApp } from './embed-loyalty-app';

export default embedLoyaltyApp;

if (typeof window !== 'undefined') {
  (window as any).EmbedLoyaltyApp = embedLoyaltyApp;
}

export * from './types/types';
export * from './types/messages-types';
export * from './types/errors';
