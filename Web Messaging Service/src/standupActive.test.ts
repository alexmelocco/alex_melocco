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

type result = {
  isActive: boolean,
  timeFinish: number | null
}
describe('Test for standup/active/v1', () => {
  test('channelId does not refer to a valid channel', () => {
    const data = request('GET', SERVER_URL + '/standup/active/v1',
      {
        headers: { token: userData.token },
        qs: { channelId: channelData.channelId + 1 }
      });
    expect(data.statusCode).toStrictEqual(400);
  });
  test('Deals with invalid token', () => {
    const data = request('GET', SERVER_URL + '/standup/active/v1',
      {
        headers: { token: userData.token + 'a' },
        qs: { channelId: channelData.channelId }
      });
    expect(data.statusCode).toStrictEqual(403);
  });
  test('Authorised user but not member of channel', () => {
    const user2 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' } });
    const userData2 = JSON.parse(user2.getBody() as string);
    const data = request('GET', SERVER_URL + '/standup/active/v1',
      {
        headers: { token: userData2.token },
        qs: { channelId: channelData.channelId }
      });
    expect(data.statusCode).toStrictEqual(403);
  });
  test('standup inactive', () => {
    const data = request('GET', SERVER_URL + '/standup/active/v1',
      {
        headers: { token: userData.token },
        qs: { channelId: channelData.channelId }
      });
    const result = JSON.parse(data.getBody() as string);
    const expected: result = {
      isActive: false,
      timeFinish: null,
    };
    expect(result).toStrictEqual(expected);
  });
  test('standup active', async () => {
    const data2 = request('POST', SERVER_URL + '/standup/start/v1',
      {
        headers: { token: userData.token },
        json: { channelId: channelData.channelId, length: 2 }
      });
    JSON.parse(data2.getBody() as string);
    const data = request('GET', SERVER_URL + '/standup/active/v1',
      {
        headers: { token: userData.token },
        qs: { channelId: channelData.channelId }
      });
    const result = JSON.parse(data.getBody() as string);
    const expected = {
      isActive: true,
      timeFinish: expect.any(Number),
    };
    await new Promise((r) => setTimeout(r, 3000));
    expect(result).toStrictEqual(expected);
  });
});
