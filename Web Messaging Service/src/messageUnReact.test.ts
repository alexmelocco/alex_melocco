import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
import { messageOutput } from './types';
import { sendWrapRequest } from './testHelper';

let userdata: any;
let userdata2: any;
let channeldata: any;
let messageData: any;
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
  const message = request('POST', SERVER_URL + '/message/send/v2',
    { headers: { token: userdata.token }, json: { channelId: channeldata.channelId, message: 'Hello' } });
  messageData = JSON.parse(message.getBody() as string);
  request('POST', SERVER_URL + '/message/react/v1',
    { headers: { token: userdata.token }, json: { messageId: messageData.messageId, reactId: 1 } });
});

describe('Testing message unreact errors', () => {
  test('message does not contain a react with ID reactId from authorised user', () => {
    request('POST', SERVER_URL + '/message/unreact/v1',
      { headers: { token: userdata.token }, json: { messageId: messageData.messageId, reactId: 1 } });
    const result = request('POST', SERVER_URL + '/message/unreact/v1',
      { headers: { token: userdata.token }, json: { messageId: messageData.messageId, reactId: 1 } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('reactId is not a valid react ID', () => {
    const result = request('POST', SERVER_URL + '/message/unreact/v1',
      { headers: { token: userdata.token }, json: { messageId: messageData.messageId, reactId: 2 } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('messageId does not refer to a valid message in a channel/DM that the authorised user has joined', () => {
    const result = request('POST', SERVER_URL + '/message/unreact/v1',
      { headers: { token: userdata2.token }, json: { messageId: messageData.messageId, reactId: 1 } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('token is invalid', () => {
    const invalidToken: string = userdata.token + '1';
    const result = request('POST', SERVER_URL + '/message/unreact/v1',
      { headers: { token: invalidToken }, json: { messageId: messageData.messageId, reactId: 1 } });
    expect(result.statusCode).toStrictEqual(403);
  });
});

describe('Testing expected output', () => {
  test('expected unreact', () => {
    const message2 = request('POST', SERVER_URL + '/message/send/v2',
      { headers: { token: userdata.token }, json: { channelId: channeldata.channelId, message: 'Hello' } });
    const messageData2 = JSON.parse(message2.getBody() as string);
    request('POST', SERVER_URL + '/message/unreact/v1',
      { headers: { token: userdata.token }, json: { messageId: messageData.messageId, reactId: 1 } });
    const result = request('GET', SERVER_URL + '/channel/messages/v3',
      { headers: { token: userdata.token }, qs: { channelId: channeldata.channelId, start: 0 } });
    const data = JSON.parse(result.getBody() as string);
    const message1: messageOutput = {
      messageId: messageData.messageId,
      uId: userdata.authUserId,
      message: 'Hello',
      timeSent: expect.any(Number),
      isPinned: false,
      reacts: [{
        isThisUserReacted: false,
        reactId: 1,
        uIds: [],
      }],
    };
    const messageOut: messageOutput = {
      messageId: messageData2.messageId,
      uId: userdata.authUserId,
      message: 'Hello',
      timeSent: expect.any(Number),
      isPinned: false,
      reacts: [{
        isThisUserReacted: false,
        reactId: 1,
        uIds: [],
      }],
    };
    const expected = {
      messages: [messageOut, message1],
      start: 0,
      end: -1,
    };
    expect(data).toStrictEqual(expected);
    const dm = sendWrapRequest('POST', '/dm/create/v2', { token: userdata.token },
      {
        uIds: []
      });
    const message3 = request('POST', SERVER_URL + '/message/senddm/v2',
      { headers: { token: userdata.token }, json: { dmId: dm.dmId, message: 'Hello' } });
    const messageData3 = JSON.parse(message3.getBody() as string);
    request('POST', SERVER_URL + '/message/react/v1',
      { headers: { token: userdata.token }, json: { messageId: messageData3.messageId, reactId: 1 } });
    request('POST', SERVER_URL + '/message/unreact/v1',
      { headers: { token: userdata.token }, json: { messageId: messageData3.messageId, reactId: 1 } });
    expect(data).toStrictEqual(expected);
  });
});
