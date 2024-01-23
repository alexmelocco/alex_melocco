import { getData, setData } from './dataStore';
import { checkForValidToken, findUserIdUsingToken } from './token';
import HTTPError from 'http-errors';
import { user, notification } from './types';

export function checkForTag(stringIn: string) {
  const string = stringIn + ' ';
  const data = getData();
  let tempStore = '';
  let tagStart = -1;
  const tagged: number[] = [];
  for (let i = 0; i < string.length; i++) {
    if (/^[a-z0-9]+$/i.test(string[i])) {
      if (tagStart !== -1) {
        tempStore += string[i];
      }
    } else {
      if (tagStart !== -1) {
        const user = data.users.find((user: {handleStr: string}) => user.handleStr === tempStore);
        if (user !== undefined) {
          tagged.push(user.authUserId);
        }
      }
      tagStart = -1;
      tempStore = '';
    }
    if (string[i] === '@') {
      tagStart = i;
      tempStore = '';
    }
  }
  return tagged.filter((number, index) => tagged.indexOf(number) === index);
}

export function createNotification(tagger: number, uId: number, channelId: number, dmId: number, messageType: string, tagged: boolean, taggedMessage?: string) {
  const data = getData();
  const handle = data.users.find((user: {authUserId: number}) => user.authUserId === tagger).handleStr;
  let name;
  if (channelId !== -1) {
    name = data.channels.find((channel: {channelId: number}) => channel.channelId === channelId).channelName;
  } else {
    name = data.dms.find((dm: {dmId: number}) => dm.dmId === dmId).name;
  }
  const notification = {
    channelId: channelId,
    dmId: dmId,
    notificationMessage: handle + ' ' + messageType + ' ' + name,
  };
  if (tagged === true) {
    notification.notificationMessage += ': ';
    notification.notificationMessage += taggedMessage.substring(0, 19);
  }
  const user = data.users.find((user: {authUserId: number}) => user.authUserId === uId);
  user.notifications.unshift(notification);
  setData(data);
  return data;
}

export function notificationsGetV1(token: string) {
  const data = getData();
  if (!checkForValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }
  const authUserId = findUserIdUsingToken(token);
  const notificationsReturn: notification[] = [];
  const user: user = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
  for (let i = 0; i < user.notifications.length; i++) {
    notificationsReturn.push(user.notifications[i]);
    if (i === 19) {
      break;
    }
  }
  return { notifications: notificationsReturn };
}
