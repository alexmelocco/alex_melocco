import { wrapClearRequest } from './testHelper';
import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
let userData: any;
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
    const data = request('POST', SERVER_URL + '/standup/start/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId + 1, length: 2 }
      });
    expect(data.statusCode).toStrictEqual(400);
  });
  test('Deals with invalid token', async () => {
    const data = request('POST', SERVER_URL + '/standup/start/v1',
      {
        headers: { token: userData.token + 'a' },
        json: { channelId: channelData.channelId, length: 2 }
      });
    expect(data.statusCode).toStrictEqual(403);
  });
  test('length is a negative integer', async () => {
    const data = request('POST', SERVER_URL + '/standup/start/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, length: -1 }
      });
    expect(data.statusCode).toStrictEqual(400);
  });
  test('channelId is valid, user is not a member of the channel', async () => {
    const user2 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' } });
    const userData2 = JSON.parse(user2.getBody() as string);
    const data = request('POST', SERVER_URL + '/standup/start/v1',
      {
        headers: { token: userData2.token },
        json: { channelId: channelData.channelId, length: 2 }
      });
    expect(data.statusCode).toStrictEqual(403);
  });
  test('standup active', async () => {
    request('POST', SERVER_URL + '/standup/start/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, length: 2 }
      });
    await new Promise((r) => setTimeout(r, 100));
    const data = request('POST', SERVER_URL + '/standup/start/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, length: 1 }
      });
    await new Promise((r) => setTimeout(r, 3000));
    expect(data.statusCode).toStrictEqual(400);
  });
  test('correct output', async () => {
    const data2 = request('POST', SERVER_URL + '/standup/start/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, length: 1 }
      });
    const result2 = JSON.parse(data2.getBody() as string);
    await new Promise((r) => setTimeout(r, 3000));
    expect(result2).toStrictEqual({ timeFinish: expect.any(Number) });
  });
});
