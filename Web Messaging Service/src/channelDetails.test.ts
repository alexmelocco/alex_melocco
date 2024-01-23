import { sendWrapRequest } from './testHelper';
import request from 'sync-request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { json: {} });
});

describe('check channel/details/v3', () => {
  test('checkOneChannel', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const channel = sendWrapRequest('POST', '/channels/create/v3', { token: auth1.token }, {
      name: 'ChannelOne',
      isPublic: true
    });
    const result = sendWrapRequest('GET', '/channel/details/v3', { token: auth1.token }, {
      channelId: channel.channelId
    });

    const expected = {
      name: 'ChannelOne',
      isPublic: true,
      ownerMembers: [{
        uId: auth1.authUserId,
        nameFirst: 'Person',
        nameLast: 'One',
        email: 'personone@email.com',
        handleStr: 'personone',
        profileImgUrl: expect.any(String),
      }],
      allMembers: [{
        uId: auth1.authUserId,
        nameFirst: 'Person',
        nameLast: 'One',
        email: 'personone@email.com',
        handleStr: 'personone',
        profileImgUrl: expect.any(String),
      }],
    };
    expect(result).toStrictEqual(expected);
  });
  test('checkOneChannels with two members', () => {
    const uIdOne = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const uIdTwo = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });
    const cIdOne = sendWrapRequest('POST', '/channels/create/v3', { token: uIdOne.token }, {
      name: 'ChannelOne',
      isPublic: true
    });
    sendWrapRequest('POST', '/channel/join/v3', { token: uIdTwo.token }, {
      channelId: cIdOne.channelId
    });

    const expected = {
      name: 'ChannelOne',
      isPublic: true,
      ownerMembers: [{
        uId: uIdOne.authUserId,
        nameFirst: 'Person',
        nameLast: 'One',
        email: 'personone@email.com',
        handleStr: 'personone',
        profileImgUrl: expect.any(String),
      }],
      allMembers: [{
        uId: uIdOne.authUserId,
        nameFirst: 'Person',
        nameLast: 'One',
        email: 'personone@email.com',
        handleStr: 'personone',
        profileImgUrl: expect.any(String),
      },
      {
        uId: uIdTwo.authUserId,
        nameFirst: 'Person',
        nameLast: 'Two',
        email: 'persontwo@email.com',
        handleStr: 'persontwo',
        profileImgUrl: expect.any(String),
      }],
    };
    const result = sendWrapRequest('GET', '/channel/details/v3', { token: uIdOne.token }, {
      channelId: cIdOne.channelId
    });

    expect(result).toStrictEqual(expected);
  });
  test('checkNoChannels', () => {
    const uIdOne = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });

    const result = sendWrapRequest('GET', '/channel/details/v3', { token: uIdOne.token }, {
      channelId: 'hello'
    });

    expect(result).toStrictEqual(400);
  });
  test('check authUserId not in channel', () => {
    const uIdOne = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const uIdTwo = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });
    const cIdOne = sendWrapRequest('POST', '/channels/create/v3', { token: uIdOne.token }, {
      name: 'ChannelOne',
      isPublic: true
    });
    const result = sendWrapRequest('GET', '/channel/details/v3', { token: uIdTwo.token }, {
      channelId: cIdOne.channelId
    });

    expect(result).toStrictEqual(403);
  });
  test('check invalid authUserId', () => {
    const uIdOne = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const cIdOne = sendWrapRequest('POST', '/channels/create/v3', { token: uIdOne.token }, {
      name: 'ChannelOne',
      isPublic: true
    });
    const result = sendWrapRequest('GET', '/channel/details/v3', { token: (uIdOne + 1).token }, {
      channelId: cIdOne.channelId
    });

    expect(result).toStrictEqual(403);
  });
});
