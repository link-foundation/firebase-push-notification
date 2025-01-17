// import { NotificationPayload } from "firebase/messaging";
// import { NotificationPayload } from "firebase/messaging/dist/esm/messaging/index";

// export type PushNotification = Omit<NotificationPayload, 'icon' | 'image'>;
/**
 * Push notification
 */
export type { NotificationPayload as PushNotification } from '@firebase/messaging';

