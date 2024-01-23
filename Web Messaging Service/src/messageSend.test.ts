import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
import { messageOutput, messageView } from './types';

let userdata: any;
let userdata2: any;
let channeldata: any;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { qs: {} });
  const user = request('POST', SERVER_URL + '/auth/register/v3',
    { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
  userdata = JSON.parse(user.getBody() as string);
  const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
    { headers: { token: userdata.token }, json: { name: 'ChannelOne', isPublic: true } });
  channeldata = JSON.parse(channel1.getBody() as string);
  const user2 = request('POST', SERVER_URL + '/auth/register/v3',
    { json: { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' } });
  userdata2 = JSON.parse(user2.getBody() as string);
});

describe('Testing message send errors', () => {
  test('channelId is not a valid channel', () => {
    const invalidId = channeldata.channelId + 1;
    const result = request('POST', SERVER_URL + '/message/send/v2',
      { headers: { token: userdata.token }, json: { channelId: invalidId, message: 'Hello' } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('length of message is less than 1', () => {
    const result = request('POST', SERVER_URL + '/message/send/v2',
      { headers: { token: userdata.token }, json: { channelId: channeldata.channelId, message: '' } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('length of message is over 1000 characters', () => {
    let longMessage = 'a';
    for (let i = 0; i < 1000; i++) {
      longMessage += 'a';
    }
    const result = request('POST', SERVER_URL + '/message/send/v2',
      { headers: { token: userdata.token }, json: { channelId: channeldata.channelId, message: longMessage } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const result = request('POST', SERVER_URL + '/message/send/v2',
      { headers: { token: userdata2.token }, json: { channelId: channeldata.channelId, message: 'Hello' } });
    expect(result.statusCode).toStrictEqual(403);
  });
  test('token is invalid', () => {
    const invalidToken: number = parseInt(userdata.token) + 1;
    const result = request('POST', SERVER_URL + '/message/send/v2',
      { headers: { token: invalidToken.toString() }, json: { channelId: channeldata.channelId, message: 'Hello' } });
    expect(result.statusCode).toStrictEqual(403);
  });
});

describe('Testing message send working', () => {
  test('single message', () => {
    const message = request('POST', SERVER_URL + '/message/send/v2',
      { headers: { token: userdata.token }, json: { channelId: channeldata.channelId, message: 'Hello' } });
    const messageData = JSON.parse(message.getBody() as string);

    const result = request('GET', SERVER_URL + '/channel/messages/v3',
      { headers: { token: userdata.token }, qs: { channelId: channeldata.channelId, start: 0 } });
    const data = JSON.parse(result.getBody() as string);
    const helloMessage: messageOutput = {
      messageId: messageData.messageId,
      uId: userdata.authUserId,
      message: 'Hello',
      timeSent: expect.any(Number),
      isPinned: false,
      reacts: [{
        reactId: 1,
        uIds: [],
        isThisUserReacted: false,
      }]
    };
    const expected: messageView = {
      messages: [helloMessage],
      start: 0,
      end: -1,
    };
    expect(data).toStrictEqual(expected);
  });
  test('two messages in same channel', () => {
    const message = request('POST', SERVER_URL + '/message/send/v2',
      { headers: { token: userdata.token }, json: { channelId: channeldata.channelId, message: 'Hello' } });
    const messageData = JSON.parse(message.getBody() as string);
    const message2 = request('POST', SERVER_URL + '/message/send/v2',
      { headers: { token: userdata.token }, json: { channelId: channeldata.channelId, message: 'Hello2' } });
    const messageData2 = JSON.parse(message2.getBody() as string);
    const result = request('GET', SERVER_URL + '/channel/messages/v3',
      { headers: { token: userdata.token }, qs: { channelId: channeldata.channelId, start: 0 } });
    const data = JSON.parse(result.getBody() as string);
    const helloMessage: messageOutput = {
      messageId: messageData.messageId,
      uId: userdata.authUserId,
      message: 'Hello',
      timeSent: expect.any(Number),
      isPinned: false,
      reacts: [{
        reactId: 1,
        uIds: [],
        isThisUserReacted: false,
      }]
    };
    const helloMessage2: messageOutput = {
      messageId: messageData2.messageId,
      uId: userdata.authUserId,
      message: 'Hello2',
      timeSent: expect.any(Number),
      isPinned: false,
      reacts: [{
        reactId: 1,
        uIds: [],
        isThisUserReacted: false,
      }]
    };
    const expected: messageView = {
      messages: [helloMessage2, helloMessage],
      start: 0,
      end: -1,
    };
    expect(data).toStrictEqual(expected);
    const result2 = request('GET', SERVER_URL + '/channel/messages/v3',
      { headers: { token: userdata.token }, qs: { channelId: channeldata.channelId, start: 1 } });
    const data2 = JSON.parse(result2.getBody() as string);
    const expected2: messageView = {
      messages: [helloMessage],
      start: 1,
      end: -1,
    };
    expect(data2).toStrictEqual(expected2);
  });
  test('50 messages', () => {
    const sendMessage = 'Hello';
    const expected: messageView = {
      messages: [],
      start: 0,
      end: -1,
    };
    for (let i = 0; i < 50; i++) {
      const messageSending = sendMessage + i.toString();
      const message = request('POST', SERVER_URL + '/message/send/v2',
        { headers: { token: userdata.token }, json: { channelId: channeldata.channelId, message: messageSending } });
      const messageData = JSON.parse(message.getBody() as string);
      const helloMessage: messageOutput = {
        messageId: messageData.messageId,
        uId: userdata.authUserId,
        message: messageSending,
        timeSent: expect.any(Number),
        isPinned: false,
        reacts: [{
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }]
      };
      expected.messages.unshift(helloMessage);
    }
    const result = request('GET', SERVER_URL + '/channel/messages/v3',
      { headers: { token: userdata.token }, qs: { token: userdata.token, channelId: channeldata.channelId, start: 0 } });
    const data = JSON.parse(result.getBody() as string);
    expect(data).toStrictEqual(expected);
  });
  test('60 messages', () => {
    const sendMessage = 'Hello';
    const expected: messageView = {
      messages: [],
      start: 0,
      end: 50,
    };
    for (let i = 0; i < 60; i++) {
      const messageSending = sendMessage + i.toString();
      const message = request('POST', SERVER_URL + '/message/send/v2',
        { headers: { token: userdata.token }, json: { channelId: channeldata.channelId, message: messageSending } });
      const messageData = JSON.parse(message.getBody() as string);
      if (i >= 10) {
        const helloMessage: messageOutput = {
          messageId: messageData.messageId,
          uId: userdata.authUserId,
          message: messageSending,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [{
            reactId: 1,
            uIds: [],
            isThisUserReacted: false,
          }]
        };
        expected.messages.unshift(helloMessage);
      }
    }
    const result = request('GET', SERVER_URL + '/channel/messages/v3',
      { headers: { token: userdata.token }, qs: { channelId: channeldata.channelId, start: 0 } });
    const data = JSON.parse(result.getBody() as string);
    expect(data).toStrictEqual(expected);
  });
});
