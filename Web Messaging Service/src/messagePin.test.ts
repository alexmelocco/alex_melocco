import { sendWrapRequest, wrapClearRequest } from './testHelper';

beforeEach(() => {
  wrapClearRequest();
});

describe('Test for message/pin/v1', () => {
  test('Deals with invalid token', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });

    const channel = sendWrapRequest('POST', '/channels/create/v3', { token: user1.token }, {
      name: 'ChannelOne',
      isPublic: true
    });
    const message = sendWrapRequest('POST', '/message/send/v2', { token: user1.token }, {
      channelId: channel.channelId,
      message: 'Hello',
    });

    const data = sendWrapRequest('POST', '/message/pin/v1', { token: (user1 + user2).token }, {
      messageId: message.messageId,
    });

    expect(data).toStrictEqual(403);
  });
  test('Member is not a part of the channel', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });

    const channel = sendWrapRequest('POST', '/channels/create/v3', { token: user1.token }, {
      name: 'ChannelOne',
      isPublic: true
    });
    const message = sendWrapRequest('POST', '/message/send/v2', { token: user1.token }, {
      channelId: channel.channelId,
      message: 'Hello',
    });

    const data = sendWrapRequest('POST', '/message/pin/v1', { token: user2.token }, {
      messageId: message.messageId,
    });

    expect(data).toStrictEqual(400);
  });
  test('Deals with invalid messageId within a channel or DM that the user is part of', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });

    const channel = sendWrapRequest('POST', '/channels/create/v3', { token: user1.token }, {
      name: 'ChannelOne',
      isPublic: true
    });
    const message = sendWrapRequest('POST', '/message/send/v2', { token: user1.token }, {
      channelId: channel.channelId,
      message: 'Hello',
    });

    const data = sendWrapRequest('POST', '/message/pin/v1', { token: user1.token }, {
      messageId: message.messageId + 1,
    });

    expect(data).toStrictEqual(400);
  });

  test('Deals with the message is already pinned', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });

    const channel = sendWrapRequest('POST', '/channels/create/v3', { token: user1.token }, {
      name: 'ChannelOne',
      isPublic: true
    });
    const message = sendWrapRequest('POST', '/message/send/v2', { token: user1.token }, {
      channelId: channel.channelId,
      message: 'Hello',
    });
    const data = sendWrapRequest('POST', '/message/pin/v1', { token: user1.token }, {
      messageId: message.messageId,
    });
    expect(data).toStrictEqual({});

    const data2 = sendWrapRequest('POST', '/message/pin/v1', { token: user1.token }, {
      messageId: message.messageId,
    });
    expect(data2).toStrictEqual(400);
  });

  test('Deals with user does not have owner permissions in the channel/DM', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });

    const channel = sendWrapRequest('POST', '/channels/create/v3', { token: user1.token }, {
      name: 'ChannelOne',
      isPublic: true
    });
    sendWrapRequest('POST', '/channel/join/v3', { token: user2.token }, {
      channelId: channel.channelId,
    });
    const message = sendWrapRequest('POST', '/message/send/v2', { token: user1.token }, {
      channelId: channel.channelId,
      message: 'Hello',
    });
    const data = sendWrapRequest('POST', '/message/pin/v1', { token: user2.token }, {
      messageId: message.messageId,
    });
    expect(data).toStrictEqual(403);
  });

  test('Deals with user is a global owner', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });

    const channel = sendWrapRequest('POST', '/channels/create/v3', { token: user2.token }, {
      name: 'ChannelOne',
      isPublic: true
    });
    sendWrapRequest('POST', '/channel/join/v3', { token: user1.token }, {
      channelId: channel.channelId,
    });

    const message = sendWrapRequest('POST', '/message/send/v2', { token: user1.token }, {
      channelId: channel.channelId,
      message: 'Hello',
    });
    const data = sendWrapRequest('POST', '/message/pin/v1', { token: user1.token }, {
      messageId: message.messageId,
    });
    expect(data).toStrictEqual({});

    const dm = sendWrapRequest('POST', '/dm/create/v2', { token: user2.token }, { uIds: [user1.authUserId] });
    const dmMessage = sendWrapRequest('POST', '/message/senddm/v2', { token: user1.token }, {
      dmId: dm.dmId,
      message: 'Hello',
    });
    const data2 = sendWrapRequest('POST', '/message/pin/v1', { token: user1.token }, {
      messageId: dmMessage.messageId,
    });
    expect(data2).toStrictEqual(403);
  });

  test('Deals with general case', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });

    const channel = sendWrapRequest('POST', '/channels/create/v3', { token: user1.token }, {
      name: 'ChannelOne',
      isPublic: true
    });
    const message = sendWrapRequest('POST', '/message/send/v2', { token: user1.token }, {
      channelId: channel.channelId,
      message: 'Hello',
    });

    const data = sendWrapRequest('POST', '/message/pin/v1', { token: user1.token }, {
      messageId: message.messageId,
    });

    expect(data).toStrictEqual({});
  });
});
