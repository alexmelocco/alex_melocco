import {
  sendWrapRequest, wrapClearRequest
} from './testHelper';

beforeEach(() => {
  wrapClearRequest();
});

describe('Test for auth/passwordReset/request/v1', () => {
  describe('Test for successful case', () => {
    test('Basic success case', () => {
      sendWrapRequest('POST', '/auth/register/v3', {},
        { email: 'user1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
      sendWrapRequest('POST', '/auth/register/v3', {},
        { email: 'user2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
      sendWrapRequest('POST', '/auth/register/v3', {},
        { email: 'user3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'three' });

      const data = sendWrapRequest('POST', '/auth/passwordreset/request/v1', {}, { email: 'user1@example.com' });

      expect(data).toStrictEqual({});
    });

    test('Email is not registered', () => {
      sendWrapRequest('POST', '/auth/register/v3', {},
        { email: 'user1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
      sendWrapRequest('POST', '/auth/register/v3', {},
        { email: 'user2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
      sendWrapRequest('POST', '/auth/register/v3', {},
        { email: 'user3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'three' });

      const data = sendWrapRequest('POST', '/auth/passwordreset/request/v1', {}, { email: 'fakeuser@example.com' });

      expect(data).toStrictEqual({});
    });
  });
});

describe('Tests for auth/passwordReset/reset/v1', () => {
  describe('Test for error cases', () => {
    test('Password is too short', () => {
      sendWrapRequest('POST', '/auth/register/v3', {},
        { email: 'user1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
      sendWrapRequest('POST', '/auth/register/v3', {},
        { email: 'user2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
      sendWrapRequest('POST', '/auth/register/v3', {},
        { email: 'user3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'three' });

      const data = sendWrapRequest('POST', '/auth/passwordreset/reset/v1', {}, {
        resetCode: '<random>',
        newPassword: '12345'
      });

      expect(data).toStrictEqual(400);
    });

    test('test for invalid reset code', () => {
      sendWrapRequest('POST', '/auth/register/v3', {},
        { email: 'user1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
      sendWrapRequest('POST', '/auth/register/v3', {},
        { email: 'user2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
      sendWrapRequest('POST', '/auth/register/v3', {},
        { email: 'user3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'three' });

      const data = sendWrapRequest('POST', '/auth/passwordreset/reset/v1', {}, {
        resetCode: '<random>',
        newPassword: '12345'
      });

      expect(data).toStrictEqual(400);
    });
  });
});
