import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
import { channelType } from './channels';

let userdata: any;
let channeldata: any;
beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { qs: {} });
  const user = request('POST', SERVER_URL + '/auth/register/v3',
    { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
  userdata = JSON.parse(user.getBody() as string);
  const channel1 = request('POST', SERVER_URL + '/channels/create/v3',
    { headers: { token: userdata.token }, json: { name: 'ChannelOne', isPublic: true } });
  channeldata = JSON.parse(channel1.getBody() as string);
});

interface channelsExp {
  channels: channelType[];
}

describe('channelsListV3', () => {
  test('Invalid token', () => {
    const invalidToken: string = userdata.token + 'a';
    const result = request('GET', SERVER_URL + '/channels/list/v3',
      { headers: { token: invalidToken } });
    expect(result.statusCode).toStrictEqual(403);
  });
  test('User is in one channel', () => {
    const expected = {
      channels: [
        {
          channelId: channeldata.channelId,
          name: 'ChannelOne',
        }
      ],
    };
    const result = request('GET', SERVER_URL + '/channels/list/v3',
      { headers: { token: userdata.token } });
    const data = JSON.parse(result.getBody() as string);
    expect(data).toStrictEqual(expected);
  });
  test('User is in two channels', () => {
    const channel2 = request('POST', SERVER_URL + '/channels/create/v3',
      { headers: { token: userdata.token }, json: { name: 'ChannelTwo', isPublic: true } });
    const channeldata2 = JSON.parse(channel2.getBody() as string);
    const expected = {
      channels: [
        {
          channelId: channeldata.channelId,
          name: 'ChannelOne',
        },
        {
          channelId: channeldata2.channelId,
          name: 'ChannelTwo',
        }
      ],
    };
    const result = request('GET', SERVER_URL + '/channels/list/v3',
      { headers: { token: userdata.token } });
    const data = JSON.parse(result.getBody() as string);
    expect(data).toStrictEqual(expected);
  });
  test('User is part of no channels', () => {
    const user3 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personthree@email.com', password: 'passwordthree', nameFirst: 'Person', nameLast: 'Three' } });
    const userdata3 = JSON.parse(user3.getBody() as string);
    const expected: channelsExp = {
      channels: [],
    };
    const result = request('GET', SERVER_URL + '/channels/list/v3',
      { headers: { token: userdata3.token } });
    const data = JSON.parse(result.getBody() as string);
    expect(data).toStrictEqual(expected);
  });
});
