import { sendWrapRequest, wrapClearRequest } from './testHelper';

beforeEach(() => {
  wrapClearRequest();
});

describe('Test for channel/invite/v3', () => {
  test('Test for invalid token', () => {
    const user = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'user@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const channelCreator = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'creater@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });

    const channel = sendWrapRequest('POST', '/channels/create/v3', { token: channelCreator.token }, {
      name: 'Channel1',
      isPublic: true
    });

    const data = sendWrapRequest('POST', '/channel/invite/v3', { token: (user + channelCreator).token }, {
      channelId: channel.channelId,
      uId: user.authUserId
    });

    expect(data).toStrictEqual(403);
  });

  test('Test where channel doesnt exist', () => {
    const user = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'user@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const channelCreator = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'creater@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
    const channel = sendWrapRequest('POST', '/channels/create/v3', { token: channelCreator.token }, {
      name: 'Channel1',
      isPublic: true
    });

    const data = sendWrapRequest('POST', '/channel/invite/v3', { token: channelCreator.token }, {
      channelId: channel.channelId + 1,
      uId: user.authUserId
    });

    expect(data).toStrictEqual(400);
  });

  test('Test for where invited user does not exist', () => {
    const user = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'user@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const channelCreator = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'creater@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
    const channel = sendWrapRequest('POST', '/channels/create/v3', { token: channelCreator.token }, {
      name: 'Channel1',
      isPublic: true
    });

    const data = sendWrapRequest('POST', '/channel/invite/v3', { token: channelCreator.token }, {
      channelId: channel.channelId,
      uId: Math.max(user.authUserId, channelCreator.authUserId) + 1
    });

    expect(data).toStrictEqual(400);
  });

  test('Test for a successful invite', () => {
    const user = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'user@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const channelCreator = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'creater@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
    const channel = sendWrapRequest('POST', '/channels/create/v3', { token: channelCreator.token }, {
      name: 'Channel1',
      isPublic: true
    });

    const data = sendWrapRequest('POST', '/channel/invite/v3', { token: channelCreator.token }, {
      channelId: channel.channelId,
      uId: user.authUserId
    });

    expect(data).toStrictEqual({});
  });

  test('Test where invited user is already a member of the channel', () => {
    const user = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'user@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const channelCreator = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'creater@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
    const channel = sendWrapRequest('POST', '/channels/create/v3', { token: channelCreator.token }, {
      name: 'Channel1',
      isPublic: true
    });

    const data1 = sendWrapRequest('POST', '/channel/invite/v3', { token: channelCreator.token }, {
      channelId: channel.channelId,
      uId: user.authUserId
    });

    expect(data1).toStrictEqual({});

    const data2 = sendWrapRequest('POST', '/channel/invite/v3', { token: channelCreator.token }, {
      channelId: channel.channelId,
      uId: user.authUserId
    });

    expect(data2).toStrictEqual(400);
  });

  test('Test where user is not authorised to invite to the channel', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'user1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'user2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
    const channelCreator = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'creater@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });

    const channel = sendWrapRequest('POST', '/channels/create/v3', { token: channelCreator.token }, {
      name: 'Channel1',
      isPublic: true
    });

    const data = sendWrapRequest('POST', '/channel/invite/v3', { token: user2.token }, {
      channelId: channel.channelId,
      uId: user1.authUserId
    });

    expect(data).toStrictEqual(403);
  });
});
