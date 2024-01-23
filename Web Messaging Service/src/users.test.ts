import { sendWrapRequest, wrapClearRequest } from './testHelper';

beforeEach(() => {
  wrapClearRequest();
});

describe('Testing /users/all/v2', () => {
  test('General case', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const result1 = sendWrapRequest('GET', '/users/all/v2', { token: auth1.token }, {});
    const expResult = {
      users: [{
        uId: auth1.authUserId,
        email: 'valid1@example.com',
        nameFirst: 'Person',
        nameLast: 'One',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      }]
    };
    expect(result1).toStrictEqual(expResult);
  });

  test('Test for multiple users', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const auth2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
    const auth3 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'Three' });
    const result = sendWrapRequest('GET', '/users/all/v2', { token: auth1.token }, {});
    const expResult = {
      users: [{
        uId: auth1.authUserId,
        email: 'valid1@example.com',
        nameFirst: 'Person',
        nameLast: 'One',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      }, {
        uId: auth2.authUserId,
        email: 'valid2@example.com',
        nameFirst: 'Persontwo',
        nameLast: 'Two',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      }, {
        uId: auth3.authUserId,
        email: 'valid3@example.com',
        nameFirst: 'Personthree',
        nameLast: 'Three',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      }]
    };
    expect(result).toStrictEqual(expResult);
  });

  test('Test when given an invalid token', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const result = sendWrapRequest('GET', '/users/all/v2', { token: (auth1 + 1).token }, {});
    expect(result).toStrictEqual(403);
  });
});
