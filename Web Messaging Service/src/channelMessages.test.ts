import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
import { messageView } from './types';

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { qs: {} });
});

// Test for channelMessagesV1 expected output
describe('Testing channelMessagesV2', () => {
  test('no users', () => {
    const invalidToken = 'invalid';
    const result = request('GET', SERVER_URL + '/channel/messages/v3', { headers: { token: invalidToken }, qs: { channelId: 0, start: 0 } });
    expect(result.statusCode).toStrictEqual(403);
  });
  test('invalid token', () => {
    const user1 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userdata = JSON.parse(user1.getBody() as string);
    request('POST', SERVER_URL + '/channels/create/v3',
      { headers: { token: userdata.token }, json: { name: 'ChannelOne', isPublic: true } });
    const invalidToken: number = parseInt(userdata.token) + 1;
    const result = request('GET', SERVER_URL + '/channel/messages/v3',
      { headers: { token: invalidToken.toString() }, qs: { channelId: 0, start: 0 } });
    expect(result.statusCode).toStrictEqual(403);
  });
  test('no channels', () => {
    const user1 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userdata = JSON.parse(user1.getBody() as string);
    const result = request('GET', SERVER_URL + '/channel/messages/v3',
      { headers: { token: userdata.token }, qs: { channelId: 0, start: 0 } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('invalid channelId', () => {
    const user1 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userdata = JSON.parse(user1.getBody() as string);
    const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
      { headers: { token: userdata.token }, json: { name: 'ChannelOne', isPublic: true } });
    const channeldata = JSON.parse(channel1.getBody() as string);

    const invalidchannel = parseInt(channeldata.channelId) + 1;
    const result = request('GET', SERVER_URL + '/channel/messages/v3',
      { headers: { token: userdata.token }, qs: { channelId: invalidchannel.toString(), start: 0 } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('no messages and start is greater than 0', () => {
    const user1 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userdata = JSON.parse(user1.getBody() as string);
    const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
      { headers: { token: userdata.token }, json: { name: 'ChannelOne', isPublic: true } });
    const channeldata = JSON.parse(channel1.getBody() as string);
    const result = request('GET', SERVER_URL + '/channel/messages/v3',
      { headers: { token: userdata.token }, qs: { channelId: channeldata.channelId, start: 5 } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('member is not in channel', () => {
    const user1 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userdata1 = JSON.parse(user1.getBody() as string);
    const user2 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' } });
    const userdata2 = JSON.parse(user2.getBody() as string);

    const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
      { headers: { token: userdata1.token }, json: { name: 'ChannelOne', isPublic: true } });
    const channeldata = JSON.parse(channel1.getBody() as string);
    const result = request('GET', SERVER_URL + '/channel/messages/v3',
      { headers: { token: userdata2.token }, qs: { channelId: channeldata.channelId, start: 0 } });
    expect(result.statusCode).toStrictEqual(403);
  });
  test('no messages (expected output)', () => {
    const user1 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userdata1 = JSON.parse(user1.getBody() as string);
    const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
      { headers: { token: userdata1.token }, json: { name: 'ChannelOne', isPublic: true } });
    const channeldata = JSON.parse(channel1.getBody() as string);
    const expected: messageView = {
      messages: [],
      start: 0,
      end: -1,
    };
    const result = request('GET', SERVER_URL + '/channel/messages/v3',
      { headers: { token: userdata1.token }, qs: { channelId: channeldata.channelId, start: 0 } });
    const data = JSON.parse(result.getBody() as string);
    expect(data).toStrictEqual(expected);
  });
});
