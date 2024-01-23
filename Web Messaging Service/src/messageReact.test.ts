import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

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
});

describe('Testing message react errors', () => {
  test('message already contains a react with ID reactId from authorised user', () => {
    request('POST', SERVER_URL + '/message/react/v1',
      { headers: { token: userdata.token }, json: { messageId: messageData.messageId, reactId: 1 } });
    const result = request('POST', SERVER_URL + '/message/react/v1',
      { headers: { token: userdata.token }, json: { messageId: messageData.messageId, reactId: 1 } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('reactId is not a valid react ID', () => {
    const result = request('POST', SERVER_URL + '/message/react/v1',
      { headers: { token: userdata.token }, json: { messageId: messageData.messageId, reactId: 2 } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('messageId does not refer to a valid message in a channel/DM that the authorised user has joined', () => {
    const result = request('POST', SERVER_URL + '/message/react/v1',
      { headers: { token: userdata2.token }, json: { messageId: messageData.messageId, reactId: 1 } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('token is invalid', () => {
    const invalidToken: string = userdata.token + '1';
    const result = request('POST', SERVER_URL + '/message/react/v1',
      { headers: { token: invalidToken }, json: { messageId: messageData.messageId, reactId: 1 } });
    expect(result.statusCode).toStrictEqual(403);
  });
});

describe('Testing expected output', () => {
  test('expected react', () => {
    request('POST', SERVER_URL + '/message/react/v1',
      { headers: { token: userdata.token }, json: { messageId: messageData.messageId, reactId: 1 } });
    const result = request('GET', SERVER_URL + '/channel/messages/v3',
      { headers: { token: userdata.token }, qs: { channelId: channeldata.channelId, start: 0 } });
    const data = JSON.parse(result.getBody() as string);
    const message = {
      messageId: messageData.messageId,
      uId: userdata.authUserId,
      message: 'Hello',
      timeSent: expect.any(Number),
      isPinned: false,
      reacts: [{
        reactId: 1,
        uIds: [userdata.authUserId],
        isThisUserReacted: true,
      }],
    };
    const expected = {
      messages: [message],
      start: 0,
      end: -1,
    };
    expect(data).toStrictEqual(expected);
  });
});
