import { notifications } from '@mantine/notifications';

/** Errors of user actions are shown as notification, so they are visible regardless of the scroll position. */
export const notifyError = (message: string) =>
  notifications.show({ color: 'red', title: 'Action failed', message, autoClose: 6000 });
