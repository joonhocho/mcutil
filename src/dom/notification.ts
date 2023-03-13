export const notify = async (message: string) => {
  if (!('Notification' in window)) {
    // Check if the browser supports notifications
    return;
  }

  let { permission } = Notification;
  if (permission === 'denied') return;

  if (permission !== 'granted') {
    permission = await Notification.requestPermission();
    // …
  }

  if (permission !== 'granted') return;

  const notification = new Notification(message);
  return notification;
};
