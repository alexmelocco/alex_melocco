import { wrapClearRequest } from './testHelper';
import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

let userData : any;
let channelData: any;

beforeEach(() => {
  wrapClearRequest();
  const user = request('POST', SERVER_URL + '/auth/register/v3',
    { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
  userData = JSON.parse(user.getBody() as string);
  const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
    { headers: { token: userData.token }, json: { name: 'ChannelOne', isPublic: true } });
  channelData = JSON.parse(channel1.getBody() as string);
});

describe('Test for message/sendlater/v1', () => {
  test('channelId does not refer to a valid channel', async () => {
    request('POST', SERVER_URL + '/standup/start/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, length: 1 }
      });
    const data = request('POST', SERVER_URL + '/standup/send/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId + 1, message: 'Hello' }
      });
    await new Promise((r) => setTimeout(r, 1000));
    expect(data.statusCode).toStrictEqual(400);
  });
  test('Deals with invalid token', async () => {
    request('POST', SERVER_URL + '/standup/start/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, length: 1 }
      });
    const data = request('POST', SERVER_URL + '/standup/send/v1',
      {
        headers: { token: userData.token + 'a' },
        json: { channelId: channelData.channelId, message: 'Hello' }
      });
    await new Promise((r) => setTimeout(r, 1000));
    expect(data.statusCode).toStrictEqual(403);
  });
  test('Authorised user but not member of channel', async () => {
    request('POST', SERVER_URL + '/standup/start/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, length: 1 }
      });
    const user2 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'persontwo@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userData2 = JSON.parse(user2.getBody() as string);
    const data = request('POST', SERVER_URL + '/standup/send/v1',
      {
        headers: { token: userData2.token },
        json: { channelId: channelData.channelId, message: 'Hello' }
      });
    await new Promise((r) => setTimeout(r, 1000));
    expect(data.statusCode).toStrictEqual(403);
  });
  test('standup inactive', () => {
    const data = request('POST', SERVER_URL + '/standup/send/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, message: 'Hello' }
      });
    expect(data.statusCode).toStrictEqual(400);
  });
  test('standup message too long', async () => {
    request('POST', SERVER_URL + '/standup/start/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, length: 1 }
      });
    let message = 'long';
    for (let i = 0; i < 1000; i++) {
      message += 'a';
    }
    const data = request('POST', SERVER_URL + '/standup/send/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, message: message }
      });
    await new Promise((r) => setTimeout(r, 1000));
    expect(data.statusCode).toStrictEqual(400);
  });
  test('standup active', async () => {
    const data2 = request('POST', SERVER_URL + '/standup/start/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, length: 1 }
      });
    JSON.parse(data2.getBody() as string);
    request('POST', SERVER_URL + '/standup/send/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, message: 'Hello' }
      });
    const data = request('POST', SERVER_URL + '/standup/send/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, message: 'Hello' }
      });
    const result = JSON.parse(data.getBody() as string);
    const expected = {};
    await new Promise((r) => setTimeout(r, 2500));
    expect(result).toStrictEqual(expected);
  });
});
