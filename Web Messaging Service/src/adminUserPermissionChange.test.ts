import { sendWrapRequest, wrapClearRequest } from './testHelper';
import { globalOwner, globalMember } from './types';

beforeEach(() => {
  wrapClearRequest();
});

describe('Test for admin/userpermission/change/v1', () => {
  test('Deals with invalid token', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });

    const data = sendWrapRequest('POST', '/admin/userpermission/change/v1', { token: (user1 + user2).token }, {
      uId: user2.authUserId,
      permissionId: globalOwner,
    });

    expect(data).toStrictEqual(403);
  });

  test('Deals with invalid uId', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });

    const data = sendWrapRequest('POST', '/admin/userpermission/change/v1', { token: user1.token }, {
      uId: Math.max(user1.authUserId, user2.authUserId) + 1,
      permissionId: globalOwner,
    });

    expect(data).toStrictEqual(400);
  });

  test('Deals with uId refers to a user who is the only global owner and is being demoted to a user', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });

    const data = sendWrapRequest('POST', '/admin/userpermission/change/v1', { token: user1.token }, {
      uId: user1.authUserId,
      permissionId: globalMember,
    });

    expect(data).toStrictEqual(400);
  });

  test('Deals with permissionId is invalid', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });

    const permissionIdInvalid = 3;
    const data = sendWrapRequest('POST', '/admin/userpermission/change/v1', { token: user1.token }, {
      uId: user2.authUserId,
      permissionId: permissionIdInvalid,
    });

    expect(data).toStrictEqual(400);
  });

  test('Deals with user already has the permissions level of permissionId', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });

    const data = sendWrapRequest('POST', '/admin/userpermission/change/v1', { token: user1.token }, {
      uId: user2.authUserId,
      permissionId: globalMember,
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

    const data = sendWrapRequest('POST', '/admin/userpermission/change/v1', { token: user2.token }, {
      uId: user3.authUserId,
      permissionId: globalOwner,
    });

    expect(data).toStrictEqual(403);
  });

  test('Deals with general case', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
      { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });

    const data = sendWrapRequest('POST', '/admin/userpermission/change/v1', { token: user1.token }, {
      uId: user2.authUserId,
      permissionId: globalOwner,
    });
    expect(data).toStrictEqual({});
    const data2 = sendWrapRequest('POST', '/admin/userpermission/change/v1', { token: user2.token }, {
      uId: user1.authUserId,
      permissionId: globalMember,
    });
    expect(data2).toStrictEqual({});
  });
});
