import { sendWrapRequest, wrapClearRequest } from './testHelper';
import { globalOwner } from './types';

beforeEach(() => {
  wrapClearRequest();
});

describe('Test for admin/user/remove/v1', () => {
  test('Deals with invalid token', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });
    const data = sendWrapRequest('DELETE', '/admin/user/remove/v1', { token: (user1 + user2).token }, {
      uId: user2.authUserId,
    });
    expect(data).toStrictEqual(403);
  });

  test('Deals with invalid uId', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });

    const data = sendWrapRequest('DELETE', '/admin/user/remove/v1', { token: user1.token }, {
      uId: Math.max(user1.authUserId, user2.authUserId) + 1,
    });
    expect(data).toStrictEqual(400);
  });

  test('Deals with uId refers to a user who is the only global owner', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });

    const data = sendWrapRequest('DELETE', '/admin/user/remove/v1', { token: user1.token }, {
      uId: user1.authUserId,
    });
    expect(data).toStrictEqual(400);
  });

  test('Deals with authorised user is not a global owner', () => {
    sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });
    const user3 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personthree@email.com', password: 'passwordthree', nameFirst: 'Person', nameLast: 'Three' });

    const data = sendWrapRequest('DELETE', '/admin/user/remove/v1', { token: user2.token }, {
      uId: user3.authUserId,
    });
    expect(data).toStrictEqual(403);
  });

  test('Deals with global owner removing another owner', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });

    sendWrapRequest('POST', '/admin/userpermission/change/v1', { token: user1.token },
      { uId: user2.authUserId, permissionId: globalOwner });

    const data = sendWrapRequest('DELETE', '/admin/user/remove/v1', { token: user2.token }, {
      uId: user1.authUserId,
    });
    expect(data).toStrictEqual({});
    const result = sendWrapRequest('GET', '/users/all/v2', { token: user2.token }, {});
    const expected = {
      users: [{
        uId: user2.authUserId,
        email: 'persontwo@email.com',
        nameFirst: 'Person',
        nameLast: 'Two',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      }]
    };
    expect(result).toStrictEqual(expected);
    const result2 = sendWrapRequest('GET', '/user/profile/v3', { token: user2.token }, { uId: user1.authUserId });
    const expected2 = {
      user: {
        uId: user1.authUserId,
        email: 'personone@email.com',
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      }
    };
    expect(result2).toStrictEqual(expected2);
  });

  test('Deals with general case', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });

    sendWrapRequest('POST', '/admin/userpermission/change/v1', { token: user1.token },
      { uId: user2.authUserId, permissionId: globalOwner });

    const dm = sendWrapRequest('POST', '/dm/create/v2', { token: user1.token }, { uIds: [user2.authUserId] });
    sendWrapRequest('POST', '/message/senddm/v2', { token: user2.token }, {
      dmId: dm.dmId,
      message: 'Hello',
    });

    const channel = sendWrapRequest('POST', '/channels/create/v3', { token: user1.token }, {
      name: 'ChannelOne',
      isPublic: true
    });
    sendWrapRequest('POST', '/channel/join/v3', { token: user2.token }, {
      channelId: channel.channelId,
    });
    sendWrapRequest('POST', '/message/send/v2', { token: user2.token }, {
      channelId: channel.channelId,
      message: 'Hello',
    });

    const data = sendWrapRequest('DELETE', '/admin/user/remove/v1', { token: user1.token }, {
      uId: user2.authUserId,
    });
    expect(data).toStrictEqual({});

    const result = sendWrapRequest('GET', '/users/all/v2', { token: user1.token }, {});
    const expected = {
      users: [{
        uId: user1.authUserId,
        email: 'personone@email.com',
        nameFirst: 'Person',
        nameLast: 'One',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      }]
    };
    expect(result).toStrictEqual(expected);
    const result2 = sendWrapRequest('GET', '/user/profile/v3', { token: user1.token }, { uId: user2.authUserId });
    const expected2 = {
      user: {
        uId: user2.authUserId,
        email: 'persontwo@email.com',
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      }
    };

    expect(result2).toStrictEqual(expected2);

    const result3 = sendWrapRequest('GET', '/channel/details/v3', { token: user1.token }, {
      channelId: channel.channelId
    });
    const expected3 = {
      name: 'ChannelOne',
      isPublic: true,
      ownerMembers: [{
        uId: user1.authUserId,
        nameFirst: 'Person',
        nameLast: 'One',
        email: 'personone@email.com',
        handleStr: 'personone',
        profileImgUrl: expect.any(String),
      }],
      allMembers: [{
        uId: user1.authUserId,
        nameFirst: 'Person',
        nameLast: 'One',
        email: 'personone@email.com',
        handleStr: 'personone',
        profileImgUrl: expect.any(String),
      }],
    };
    expect(result3).toStrictEqual(expected3);
  });
});
