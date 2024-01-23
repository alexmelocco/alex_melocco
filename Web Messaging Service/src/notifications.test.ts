import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

let userdata: any;
let userdata2: any;
let channelData: any;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { qs: {} });
  const user = request('POST', SERVER_URL + '/auth/register/v3',
    { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
  userdata = JSON.parse(user.getBody() as string);
  const user2 = request('POST', SERVER_URL + '/auth/register/v3',
    { json: { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' } });
  userdata2 = JSON.parse(user2.getBody() as string);
  const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
    { headers: { token: userdata.token }, json: { name: 'ChannelOne', isPublic: true } });
  channelData = JSON.parse(channel1.getBody() as string);
});

describe('Testing notifications results', () => {
  test('Invalid token', () => {
    const result = request('GET', SERVER_URL + '/notifications/get/v1',
      { headers: { token: userdata2.token + 'a' } });
    expect(result.statusCode).toStrictEqual(403);
  });
  test('added to channel', () => {
    request('POST', SERVER_URL + '/channel/invite/v3',
      { headers: { token: userdata.token }, json: { channelId: channelData.channelId, uId: userdata2.authUserId } });
    const result = request('GET', SERVER_URL + '/notifications/get/v1',
      { headers: { token: userdata2.token } });
    const data = JSON.parse(result.getBody() as string);
    const expected = {
      notifications: [{
        channelId: channelData.channelId,
        dmId: -1,
        notificationMessage: 'personone added you to ChannelOne'
      }]
    };
    expect(data).toStrictEqual(expected);
  });
  test('added to dm', () => {
    const dm1 = request('POST', SERVER_URL + '/dm/create/v2',
      { headers: { token: userdata.token }, json: { uIds: [userdata2.authUserId] } });
    const dmData = JSON.parse(dm1.getBody() as string);
    const expected = {
      notifications: [{
        channelId: -1,
        dmId: dmData.dmId,
        notificationMessage: 'personone added you to personone, persontwo'
      }]
    };
    const result = request('GET', SERVER_URL + '/notifications/get/v1',
      { headers: { token: userdata2.token } });
    const data = JSON.parse(result.getBody() as string);
    expect(data).toStrictEqual(expected);
  });
  test('tagged message', () => {
    request('POST', SERVER_URL + '/channel/invite/v3',
      { headers: { token: userdata.token }, json: { channelId: channelData.channelId, uId: userdata2.authUserId } });
    request('POST', SERVER_URL + '/message/send/v2',
      { headers: { token: userdata.token }, json: { channelId: channelData.channelId, message: 'Hello @persontwo@personthree' } });
    const result = request('GET', SERVER_URL + '/notifications/get/v1',
      { headers: { token: userdata2.token } });
    const data = JSON.parse(result.getBody() as string);
    request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personthree@email.com', password: 'passwordthree', nameFirst: 'Person', nameLast: 'Three' } });
    const expected = {
      notifications: [{
        channelId: channelData.channelId,
        dmId: -1,
        notificationMessage: 'personone tagged you in ChannelOne: Hello @persontwo@pe',
      }, {
        channelId: channelData.channelId,
        dmId: -1,
        notificationMessage: 'personone added you to ChannelOne'
      }]
    };
    expect(data).toStrictEqual(expected);
  });
  test('reacted message', () => {
    request('POST', SERVER_URL + '/channel/invite/v3',
      { headers: { token: userdata.token }, json: { channelId: channelData.channelId, uId: userdata2.authUserId } });
    const message = request('POST', SERVER_URL + '/message/send/v2',
      { headers: { token: userdata2.token }, json: { channelId: channelData.channelId, message: 'Hello' } });
    const messageData = JSON.parse(message.getBody() as string);
    request('POST', SERVER_URL + '/message/react/v1',
      { headers: { token: userdata.token }, json: { messageId: messageData.messageId, reactId: 1 } });
    request('POST', SERVER_URL + '/message/react/v1',
      { headers: { token: userdata2.token }, json: { messageId: messageData.messageId, reactId: 1 } });
    const result = request('GET', SERVER_URL + '/notifications/get/v1',
      { headers: { token: userdata2.token } });
    const data = JSON.parse(result.getBody() as string);
    const expected = {
      notifications: [{
        channelId: channelData.channelId,
        dmId: -1,
        notificationMessage: 'personone reacted to your message in ChannelOne',
      },
      {
        channelId: channelData.channelId,
        dmId: -1,
        notificationMessage: 'personone added you to ChannelOne'
      }]
    };
    expect(data).toStrictEqual(expected);
  });
  test('mix', () => {
    const dm1 = request('POST', SERVER_URL + '/dm/create/v2',
      { headers: { token: userdata.token }, json: { uIds: [userdata2.authUserId] } });
    const dmData = JSON.parse(dm1.getBody() as string);
    request('POST', SERVER_URL + '/message/senddm/v2',
      { headers: { token: userdata.token }, json: { dmId: dmData.dmId, message: 'Hello @persontwo' } });
    const expected = {
      notifications: [{
        channelId: -1,
        dmId: dmData.dmId,
        notificationMessage: 'personone tagged you in personone, persontwo: Hello @persontwo',
      },
      {
        channelId: -1,
        dmId: dmData.dmId,
        notificationMessage: 'personone added you to personone, persontwo'
      }]
    };
    const result = request('GET', SERVER_URL + '/notifications/get/v1',
      { headers: { token: userdata2.token } });
    const data = JSON.parse(result.getBody() as string);
    expect(data).toStrictEqual(expected);
  });
  test('20 notifications', () => {
    for (let i = 0; i < 22; i++) {
      const dm1 = request('POST', SERVER_URL + '/dm/create/v2',
        { headers: { token: userdata.token }, json: { uIds: [userdata2.authUserId] } });
      JSON.parse(dm1.getBody() as string);
    }
    type notification = {
      channelId: number,
      dmId: number,
      notificationMessage: string
    }

    const notification2 = {
      channelId: -1,
      dmId: expect.any(Number),
      notificationMessage: 'personone added you to personone, persontwo'
    };
    const notifications: notification[] = [];
    for (let i = 0; i < 20; i++) {
      notifications.push(notification2);
    }
    const result = request('GET', SERVER_URL + '/notifications/get/v1',
      { headers: { token: userdata2.token } });
    const data = JSON.parse(result.getBody() as string);
    const expected = {
      notifications: notifications
    };
    expect(data).toStrictEqual(expected);
  });
});
