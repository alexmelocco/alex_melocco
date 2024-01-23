import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
import { messageView, messageOutput } from './types';

let userdata: any;
let userdata2: any;
let dmData: any;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { qs: {} });
  const user = request('POST', SERVER_URL + '/auth/register/v3',
    { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
  userdata = JSON.parse(user.getBody() as string);
  const user2 = request('POST', SERVER_URL + '/auth/register/v3',
    { json: { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' } });
  userdata2 = JSON.parse(user2.getBody() as string);
  const dm1 = request('POST', SERVER_URL + '/dm/create/v2',
    { headers: { token: userdata.token }, json: { uIds: [userdata2.authUserId] } });
  dmData = JSON.parse(dm1.getBody() as string);
});

describe('Testing message send dm errors', () => {
  test('dmId is not a valid dm', () => {
    const invalidId = dmData.dmId + 1;
    const result = request('POST', SERVER_URL + '/message/senddm/v2',
      { headers: { token: userdata.token }, json: { dmId: invalidId, message: 'Hello' } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('length of message is less than 1', () => {
    const result = request('POST', SERVER_URL + '/message/senddm/v2',
      { headers: { token: userdata.token }, json: { dmId: dmData.dmId, message: '' } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('length of message is over 1000 characters', () => {
    let longMessage = 'a';
    for (let i = 0; i < 1000; i++) {
      longMessage += 'a';
    }
    const result = request('POST', SERVER_URL + '/message/senddm/v2',
      { headers: { token: userdata.token }, json: { dmId: dmData.dmId, message: longMessage } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('dmId is valid and the authorised user is not a member of the dm', () => {
    const user3 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personthree@email.com', password: 'passwordthree', nameFirst: 'Person', nameLast: 'Three' } });
    const userdata3 = JSON.parse(user3.getBody() as string);
    const result = request('POST', SERVER_URL + '/message/senddm/v2',
      { headers: { token: userdata3.token }, json: { dmId: dmData.dmId, message: 'Hello' } });
    expect(result.statusCode).toStrictEqual(403);
  });
  test('token is invalid', () => {
    const invalidToken: number = parseInt(userdata.token) + 1;
    const result = request('POST', SERVER_URL + '/message/senddm/v2',
      { headers: { token: invalidToken.toString() }, json: { dmId: dmData.dmId, message: 'Hello' } });
    expect(result.statusCode).toStrictEqual(403);
  });
});

describe('Testing message senddm working', () => {
  test('single message', () => {
    const message = request('POST', SERVER_URL + '/message/senddm/v2',
      { headers: { token: userdata.token }, json: { dmId: dmData.dmId, message: 'Hello' } });
    const messageData = JSON.parse(message.getBody() as string);

    const result = request('GET', SERVER_URL + '/dm/messages/v2',
      { headers: { token: userdata.token }, qs: { dmId: dmData.dmId, start: 0 } });
    const data = JSON.parse(result.getBody() as string);
    const helloMessage: messageOutput = {
      messageId: messageData.messageId,
      uId: userdata.authUserId,
      message: 'Hello',
      timeSent: expect.any(Number),
      isPinned: false,
      reacts: [{
        isThisUserReacted: false,
        reactId: 1,
        uIds: [],
      }]
    };
    const expected: messageView = {
      messages: [helloMessage],
      start: 0,
      end: -1,
    };
    expect(data).toStrictEqual(expected);
  });
  test('two messages in same dm', () => {
    const message = request('POST', SERVER_URL + '/message/senddm/v2',
      { headers: { token: userdata.token }, json: { dmId: dmData.dmId, message: 'Hello' } });
    const messageData = JSON.parse(message.getBody() as string);
    const message2 = request('POST', SERVER_URL + '/message/senddm/v2',
      { headers: { token: userdata.token }, json: { dmId: dmData.dmId, message: 'Hello2' } });
    const messageData2 = JSON.parse(message2.getBody() as string);
    request('POST', SERVER_URL + '/message/react/v1',
      { headers: { token: userdata.token }, json: { messageId: messageData.messageId, reactId: 1 } });
    const result = request('GET', SERVER_URL + '/dm/messages/v2',
      { headers: { token: userdata.token }, qs: { dmId: dmData.dmId, start: 0 } });
    const data = JSON.parse(result.getBody() as string);
    const helloMessage: messageOutput = {
      messageId: messageData.messageId,
      uId: userdata.authUserId,
      message: 'Hello',
      timeSent: expect.any(Number),
      isPinned: false,
      reacts: [{
        isThisUserReacted: true,
        reactId: 1,
        uIds: [userdata.authUserId],
      }]
    };
    const helloMessage2: messageOutput = {
      messageId: messageData2.messageId,
      uId: userdata.authUserId,
      message: 'Hello2',
      timeSent: expect.any(Number),
      isPinned: false,
      reacts: [{
        isThisUserReacted: false,
        reactId: 1,
        uIds: [],
      }]
    };
    const expected: messageView = {
      messages: [helloMessage2, helloMessage],
      start: 0,
      end: -1,
    };
    expect(data).toStrictEqual(expected);
    const result2 = request('GET', SERVER_URL + '/dm/messages/v2',
      { headers: { token: userdata.token }, qs: { dmId: dmData.dmId, start: 1 } });
    const data2 = JSON.parse(result2.getBody() as string);
    const expected2: messageView = {
      messages: [helloMessage],
      start: 1,
      end: -1,
    };
    request('PUT', SERVER_URL + '/message/edit/v2',
      { headers: { token: userdata.token }, json: { messageId: messageData.messageId, message: 'Hello-edit' } });
    request('PUT', SERVER_URL + '/message/edit/v2',
      { headers: { token: userdata.token }, json: { messageId: messageData2.messageId, message: 'Hello-edit' } });
    expect(data2).toStrictEqual(expected2);
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
      const message = request('POST', SERVER_URL + '/message/senddm/v2',
        { headers: { token: userdata.token }, json: { dmId: dmData.dmId, message: messageSending } });
      const messageData = JSON.parse(message.getBody() as string);
      if (i >= 10) {
        const helloMessage: messageOutput = {
          messageId: messageData.messageId,
          uId: userdata.authUserId,
          message: messageSending,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [{
            isThisUserReacted: false,
            reactId: 1,
            uIds: [],
          }]
        };
        expected.messages.unshift(helloMessage);
      }
    }
    const result = request('GET', SERVER_URL + '/dm/messages/v2',
      { headers: { token: userdata.token }, qs: { dmId: dmData.dmId, start: 0 } });
    const data = JSON.parse(result.getBody() as string);
    expect(data).toStrictEqual(expected);
  });
});
