import { sendWrapRequest, wrapClearRequest } from './testHelper';

beforeEach(() => {
  wrapClearRequest();
});

describe('Test for channels/listAll/v2', () => {
  test('Check for invalid token', () => {
    const result = sendWrapRequest('GET', '/channels/listAll/v3', {
      token: 'ABCSDNEMALSKDJEKWLAM'
    }, {});
    expect(result).toStrictEqual(403);
  });

  test('Test for when user is not in any channel', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });

    const result = sendWrapRequest('GET', '/channels/listAll/v3', {
      token: auth1.token
    }, {});

    expect(result).toStrictEqual({
      channels: []
    });
  });

  test('Test for when user ownns and is in a public channel', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });

    const chan = sendWrapRequest('POST', '/channels/create/v3', { token: auth1.token }, {
      name: 'Channel',
      isPublic: true
    });

    const result = sendWrapRequest('GET', '/channels/listAll/v3', {
      token: auth1.token
    }, {});

    expect(result).toStrictEqual({
      channels: [{
        channelId: chan.channelId,
        name: expect.any(String)
      }]
    });
  });

  test('User owns as is in a private channel', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });

    const chan = sendWrapRequest('POST', '/channels/create/v3', { token: auth1.token },
      {
        name: 'Channel',
        isPublic: false
      });

    const result = sendWrapRequest('GET', '/channels/listAll/v3', {
      token: auth1.token
    }, {});

    expect(result).toStrictEqual({
      channels: [{
        channelId: chan.channelId,
        name: expect.any(String)
      }]
    });
  });

  test('Tests user that is in mult channels', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const auth2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });

    const chan1 = sendWrapRequest('POST', '/channels/create/v3', { token: auth2.token },
      {
        name: 'Channel',
        isPublic: true
      });

    const chan2 = sendWrapRequest('POST', '/channels/create/v3', { token: auth1.token },
      {
        name: 'Channel2',
        isPublic: false
      });

    const chan3 = sendWrapRequest('POST', '/channels/create/v3', { token: auth2.token },
      {
        name: 'Channel3',
        isPublic: true
      });

    sendWrapRequest('POST', '/channel/invite/v3', { token: auth2.token },
      {
        channelId: chan1.channelId,
        uId: auth1.authUserId
      });
    sendWrapRequest('POST', '/channel/join/v3', { token: auth1.token },
      { channelId: chan3.channelId });

    const result = sendWrapRequest('GET', '/channels/listAll/v3', {
      token: auth1.token
    }, {});

    const expectedResult = {
      channels: [{
        channelId: chan1.channelId,
        name: expect.any(String)
      },
      {
        channelId: chan2.channelId,
        name: expect.any(String)
      },
      {
        channelId: chan3.channelId,
        name: expect.any(String)
      }]
    };

    expect(result).toStrictEqual(expectedResult);
  });
});
