import { wrapClearRequest } from './testHelper';
import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  wrapClearRequest();
});
jest.useFakeTimers();
describe('Test for message/sendlater/v1', () => {
  test('Deals with timeSent is a time in the past', async () => {
    const user = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userData = JSON.parse(user.getBody() as string);
    const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
      { headers: { token: userData.token }, json: { name: 'ChannelOne', isPublic: true } });
    const channelData = JSON.parse(channel1.getBody() as string);

    const data = request('POST', SERVER_URL + '/message/sendlater/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, message: 'Hello noone', timeSent: Math.floor(Date.now() / 1000) - 1 }
      });
    jest.runOnlyPendingTimers();
    expect(data.statusCode).toStrictEqual(400);
  });

  test('Deals with invalid token', async () => {
    const user = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userData = JSON.parse(user.getBody() as string);

    const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
      { headers: { token: userData.token }, json: { name: 'ChannelOne', isPublic: true } });
    const channelData = JSON.parse(channel1.getBody() as string);
    const data = request('POST', SERVER_URL + '/message/sendlater/v1',
      {
        headers: { token: userData.token + 'a' },
        json: { channelId: channelData.channelId, message: 'Hello noone', timeSent: Math.floor(Date.now() / 1000) + 2 }
      });
    jest.runOnlyPendingTimers();
    expect(data.statusCode).toStrictEqual(403);
  });

  test('Deals with channelId is invalid', async () => {
    const user = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userData = JSON.parse(user.getBody() as string);
    const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
      { headers: { token: userData.token }, json: { name: 'ChannelOne', isPublic: true } });
    const channelData = JSON.parse(channel1.getBody() as string);

    const data = request('POST', SERVER_URL + '/message/sendlater/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId + 1, message: 'Hello noone', timeSent: Math.floor(Date.now() / 1000) + 4 }
      });
    jest.runOnlyPendingTimers();
    expect(data.statusCode).toStrictEqual(400);
  });

  test('Deals with message length less than 1 character', async () => {
    const user = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userData = JSON.parse(user.getBody() as string);
    const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
      { headers: { token: userData.token }, json: { name: 'ChannelOne', isPublic: true } });
    const channelData = JSON.parse(channel1.getBody() as string);

    const data = request('POST', SERVER_URL + '/message/sendlater/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, message: '', timeSent: Math.floor(Date.now() / 1000) + 6 }
      });
    jest.runOnlyPendingTimers();
    expect(data.statusCode).toStrictEqual(400);
  });

  test('Deals with message length over 1000 characters', async () => {
    const user = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userData = JSON.parse(user.getBody() as string);
    const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
      { headers: { token: userData.token }, json: { name: 'ChannelOne', isPublic: true } });
    const channelData = JSON.parse(channel1.getBody() as string);
    let message = 'long';
    for (let i = 0; i < 1000; i++) {
      message += 'a';
    }
    const data = request('POST', SERVER_URL + '/message/sendlater/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, message: message, timeSent: Math.floor(Date.now() / 1000) + 8 }
      });
    jest.runOnlyPendingTimers();
    expect(data.statusCode).toStrictEqual(400);
  });

  test('Deals with user is not member of the channel they are trying to post to', async () => {
    const user = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userData = JSON.parse(user.getBody() as string);
    const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
      { headers: { token: userData.token }, json: { name: 'ChannelOne', isPublic: true } });

    const user2 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' } });
    const userData2 = JSON.parse(user2.getBody() as string);
    const channelData = JSON.parse(channel1.getBody() as string);
    const data = request('POST', SERVER_URL + '/message/sendlater/v1',
      {
        headers: { token: userData2.token },
        json: { channelId: channelData.channelId, message: 'Hello noone', timeSent: Math.floor(Date.now() / 1000) + 10 }
      });
    jest.runOnlyPendingTimers();
    expect(data.statusCode).toStrictEqual(403);
  });

  test('Deals with successful call', async () => {
    const user = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userData = JSON.parse(user.getBody() as string);
    const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
      { headers: { token: userData.token }, json: { name: 'ChannelOne', isPublic: true } });

    const channelData = JSON.parse(channel1.getBody() as string);
    const data = request('POST', SERVER_URL + '/message/sendlater/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, message: 'Hello noone', timeSent: Math.floor(Date.now() / 1000) + 12 }
      });
    jest.runOnlyPendingTimers();
    expect(JSON.parse(data.getBody() as string)).toStrictEqual({ messageId: expect.any(Number) });
  });
});
