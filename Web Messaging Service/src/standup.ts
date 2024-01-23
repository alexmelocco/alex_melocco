import { getData, setData } from './dataStore';
import { checkForValidToken, findUserIdUsingToken } from './token';
import HTTPError from 'http-errors';
import { message } from './types';

async function standupStartV1(token: string, channelId: number, length: number) {
  const data = getData();
  console.log(token);
  if (length < 0) {
    throw HTTPError(400, 'length is negative');
  }
  if (!checkForValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  const oldStandup = data.standups.find((standup: {channelId: number}) => standup.channelId === channelId);
  if (oldStandup !== undefined) {
    throw HTTPError(400, 'Active standup is already running');
  }
  const authUserId = findUserIdUsingToken(token);
  const finish = (Date.now() + (length * 1000) / 1000);
  const standup = {
    channelId: channelId,
    timeFinish: Date.now() + (length * 1000),
    message: '',
    uId: authUserId
  };
  const channel = data.channels.find((channel: {channelId: number}) => channel.channelId === channelId);
  if (channel === undefined) {
    throw HTTPError(400, 'Channel does not exist');
  }
  const user = channel.allMembers.find((user: {uId: number}) => user.uId === authUserId);
  if (user === undefined) {
    throw HTTPError(403, 'User is not in channel');
  }
  data.standups.push(standup);
  setData(data);
  console.log(token);
  setTimeout(finishStandup, length * 1000, authUserId, channelId, finish);
  return { timeFinish: finish };
}

function finishStandup(authUserId: number, channelId: number, finish: number) {
  let data = getData();
  const sendMessage = data.standups.find((standup: {channelId: number}) => standup.channelId === channelId).message;
  if (sendMessage.length === 0) {
    data = getData();
    const removeStandup = data.standups.findIndex((standup: {channelId: number}) => standup.channelId === channelId);
    data.standups.splice(removeStandup, 1);
    setData(data);
    return { timeFinish: finish };
  }
  console.log('access');
  sendStandup(authUserId, channelId, sendMessage);
  data = getData();
  const removeStandup = data.standups.findIndex((standup: {channelId: number}) => standup.channelId === channelId);
  data.standups.splice(removeStandup, 1);
  setData(data);
  console.log('access');
}

function standupActiveV1(token: string, channelId: number) {
  console.log(channelId);
  const data = getData();
  if (!checkForValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  const authUserId = findUserIdUsingToken(token);
  console.log(data);
  console.log(channelId);
  for (const index of data.channels) {
    if (index.channelId === channelId) {
      console.log('true');
    }
  }
  const channel = data.channels.find((channel: {channelId: number}) => channel.channelId === channelId);
  if (channel === undefined) {
    throw HTTPError(400, 'Channel does not exist');
  }
  const user = channel.allMembers.find((user: {uId: number}) => user.uId === authUserId);
  if (user === undefined) {
    throw HTTPError(403, 'User is not in channel');
  }
  let isActive: boolean;
  let timeFinish: number | null;

  const standup = data.standups.find((standup: {channelId: number}) => standup.channelId === channelId);
  if (standup === undefined) {
    isActive = false;
    timeFinish = null;
  } else {
    isActive = true;
    timeFinish = (standup.timeFinish) / 1000;
  }
  return {
    isActive: isActive,
    timeFinish: timeFinish
  };
}

function standupSendV1(token: string, channelId: number, message: string) {
  const data = getData();
  if (!checkForValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  const authUserId = findUserIdUsingToken(token);
  const channel = data.channels.find((channel: {channelId: number}) => channel.channelId === channelId);
  if (channel === undefined) {
    throw HTTPError(400, 'Channel does not exist');
  }
  const user = channel.allMembers.find((user: {uId: number}) => user.uId === authUserId);
  if (user === undefined) {
    throw HTTPError(403, 'User is not in channel');
  }
  if (message.length > 1000) {
    throw HTTPError(400, 'Message too long');
  }
  const standup = data.standups.find((standup: {channelId: number}) => standup.channelId === channelId);
  if (standup === undefined) {
    throw HTTPError(400, 'Standup inactive');
  } else {
    let standupMessage = standup.message;
    if (standupMessage.length !== 0) {
      standupMessage += '\n'; // Need to add a test for this
    }
    const user = data.users.find((user: {authUserId: number}) => user.authUserId === authUserId);
    standupMessage = standupMessage + user.handleStr + ': ' + message;
    standup.message = standupMessage;
  }
  setData(data);
  return {};
}

function sendStandup(authUserId: number, channelId: number, message: string) {
  const data = getData();
  const channel = data.channels.find((channel: {channelId: number}) => channel.channelId === channelId);
  const newMessage: message = {
    messageId: data.messageGlobal,
    message: message,
    uId: authUserId,
    timeSent: Math.floor(Date.now() / 1000),
    isPinned: false,
    reacts: [{
      reactId: 1,
      uIds: [],
    }]
  };
  data.messageGlobal++;
  channel.messages.unshift(newMessage);

  setData(data);
  return { messageId: data.messageGlobal - 1 };
}

export { standupStartV1, standupActiveV1, standupSendV1 };
