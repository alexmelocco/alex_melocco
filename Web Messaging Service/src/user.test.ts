import { sendWrapRequest, wrapClearRequest } from './testHelper';

beforeEach(() => {
  wrapClearRequest();
});

describe('Test /user/profile/v3', () => {
  test('General case', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const res1 = sendWrapRequest('GET', '/user/profile/v3', { token: auth1.token }, { uId: auth1.authUserId });
    const expRes1 = {
      user: {
        uId: auth1.authUserId,
        email: 'valid1@example.com',
        nameFirst: 'Person',
        nameLast: 'One',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      }
    };
    expect(res1).toEqual(expRes1);
  });

  test('Test when given an invalid uId', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const response1 = sendWrapRequest('GET', '/user/profile/v3', { token: auth1.token }, { uId: auth1.authUserId + 1 });
    expect(response1).toStrictEqual(400);
  });

  test('Test when token is invalid', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const response1 = sendWrapRequest('GET', '/user/profile/v3', { token: (auth1 + 1).token }, { uId: auth1.authUserId });
    expect(response1).toStrictEqual(403);
  });
});

describe('Test /user/profile/setname/v2', () => {
  test('General Case', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });

    sendWrapRequest('PUT', '/user/profile/setname/v2', { token: auth1.token }, { nameFirst: 'change', nameLast: 'name' });
    const res1 = sendWrapRequest('GET', '/user/profile/v3', { token: auth1.token }, { uId: auth1.authUserId });
    const expRes1 = {
      user: {
        uId: auth1.authUserId,
        email: 'valid1@example.com',
        nameFirst: 'change',
        nameLast: 'name',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      }
    };
    expect(res1).toEqual(expRes1);
  });

  test('Test when given an invalid token', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const res1 = sendWrapRequest('PUT', '/user/profile/setname/v2', { token: (auth1 + 1).token }, { nameFirst: 'hello', nameLast: 'there' });
    expect(res1).toStrictEqual(403);
  });

  test('Test for no name first input (too short)', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const res1 = sendWrapRequest('PUT', '/user/profile/setname/v2', { token: auth1.token }, { nameFirst: '', nameLast: 'last' });
    expect(res1).toStrictEqual(400);
  });
  test('Test for invalid first name (too long)', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const res1 = sendWrapRequest('PUT', '/user/profile/setname/v2', { token: auth1.token }, { nameFirst: 'firstfirstfirstfirstfirstfirstfirstfirstfirstfirstfirstfirstfirstfirstfisr', nameLast: 'last' });
    expect(res1).toStrictEqual(400);
  });
  test('Test for no lastname input (too short)', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const res1 = sendWrapRequest('PUT', '/user/profile/setname/v2', { token: auth1.token }, { nameFirst: 'Hello', nameLast: '' });
    expect(res1).toStrictEqual(400);
  });
  test('Test for invalid last name (too long)', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const res1 = sendWrapRequest('PUT', '/user/profile/setname/v2', { token: auth1.token }, { nameFirst: 'first', nameLast: 'firstfirstfirstfirstfirstfirstfirstfirstfirstfirstfirstfirstfirstfirstfisr' });
    expect(res1).toStrictEqual(400);
  });
});

describe('Test /user/profile/setemail/v2', () => {
  test('General Case', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    sendWrapRequest('PUT', '/user/profile/setemail/v2', { token: auth1.token }, { email: 'valid@example.com' });
    const res1 = sendWrapRequest('GET', '/user/profile/v3', { token: auth1.token }, { uId: auth1.authUserId });
    const expRes1 = {
      user: {
        uId: auth1.authUserId,
        email: 'valid@example.com',
        nameFirst: 'Person',
        nameLast: 'One',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      }
    };
    expect(res1).toEqual(expRes1);
  });
  test('Test when given an invalid email', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const res1 = sendWrapRequest('PUT', '/user/profile/setemail/v2', { token: auth1.token }, { email: 'emailexample.com' });
    expect(res1).toStrictEqual(400);
  });
  test('Test when given an invalid token', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const res1 = sendWrapRequest('PUT', '/user/profile/setemail/v2', { token: (auth1 + 1).token }, { email: 'valid1@example.com' });
    expect(res1).toStrictEqual(403);
  });
  test('Test when email is already registered and someone tries to change to used email', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid2@example.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' });
    const res1 = sendWrapRequest('PUT', '/user/profile/setemail/v2', { token: auth1.token }, { email: 'valid2@example.com' });
    expect(res1).toStrictEqual(400);
  });
});

describe('Test user/profile/sethandle/v2', () => {
  test('General Case', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });

    sendWrapRequest('PUT', '/user/profile/sethandle/v2', { token: auth1.token }, { handleStr: 'newhandle' });
    const res1 = sendWrapRequest('GET', '/user/profile/v3', { token: auth1.token }, { uId: auth1.authUserId });
    const expRes1 = {
      user: {
        uId: auth1.authUserId,
        email: 'valid1@example.com',
        nameFirst: 'Person',
        nameLast: 'One',
        handleStr: 'newhandle',
        profileImgUrl: expect.any(String),
      }
    };
    expect(res1).toEqual(expRes1);
  });

  test('Test when given an invalid token', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const res1 = sendWrapRequest('PUT', '/user/profile/sethandle/v2', { token: (auth1 + 1).token }, { handleStr: 'newhandle' });
    expect(res1).toStrictEqual(403);
  });

  test('Test if handleStr is already taken by another user', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const auth2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
    sendWrapRequest('PUT', '/user/profile/sethandle/v2', { token: auth2.token }, { handleStr: 'newhandle' });
    const res1 = sendWrapRequest('PUT', '/user/profile/sethandle/v2', { token: auth1.token }, { handleStr: 'newhandle' });
    expect(res1).toStrictEqual(400);
  });

  test('Test when given a non-alphanumeric string ', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const res1 = sendWrapRequest('PUT', '/user/profile/sethandle/v2', { token: auth1.token }, { handleStr: 'newhandle!' });
    expect(res1).toStrictEqual(400);
  });

  test('Test when handle is too short or long', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const res1 = sendWrapRequest('PUT', '/user/profile/sethandle/v2', { token: auth1.token }, { handleStr: 'ha' });
    expect(res1).toStrictEqual(400);

    const auth2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
    const res2 = sendWrapRequest('PUT', '/user/profile/sethandle/v2', { token: auth2.token },
      { handleStr: 'newnewnennewnewnewnewnewnewnewnewnewnewnewnewnenwenwenwenwenwenwenwenwenw' });
    expect(res2).toStrictEqual(400);
  });
});
