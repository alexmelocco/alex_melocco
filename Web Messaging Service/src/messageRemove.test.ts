import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
import { messageView } from './types';

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

describe('Testing messageRemove errors', () => {
  test('message was not sent by the authorised user making this request and the ' +
    'user does not have owner permissions in the channel/DM', () => {
    request('POST', SERVER_URL + '/channel/join/v3',
      { headers: { token: userdata2.token }, json: { channelId: channeldata.channelId } });
    const result = request('DELETE', SERVER_URL + '/message/remove/v2',
      { headers: { token: userdata2.token }, qs: { token: userdata2.token, messageId: messageData.messageId } });
    expect(result.statusCode).toStrictEqual(403);
  });
  test('messageId does not refer to a valid message in a channel/DM that the authorised user has joined', () => {
    const result = request('DELETE', SERVER_URL + '/message/remove/v2',
      { headers: { token: userdata2.token }, qs: { messageId: messageData.messageId } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('token is invalid', () => {
    const invalidToken: number = parseInt(userdata.token) + 1;
    const result = request('DELETE', SERVER_URL + '/message/remove/v2',
      { headers: { token: invalidToken.toString() }, qs: { messageId: messageData.messageId } });
    expect(result.statusCode).toStrictEqual(403);
  });
});

describe('Testing message remove working', () => {
  test('deleted', () => {
    request('DELETE', SERVER_URL + '/message/remove/v2',
      { headers: { token: userdata.token }, qs: { messageId: messageData.messageId } });
    const result = request('GET', SERVER_URL + '/channel/messages/v3',
      { headers: { token: userdata.token }, qs: { channelId: channeldata.channelId, start: 0 } });
    const data = JSON.parse(result.getBody() as string);
    const expected: messageView = {
      messages: [],
      start: 0,
      end: -1,
    };
    expect(data).toStrictEqual(expected);
  });
});
