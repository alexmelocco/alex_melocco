import { sendWrapRequest, wrapClearRequest } from './testHelper';

beforeEach(() => {
  wrapClearRequest();
});

describe('Test for dm/create/v2', () => {
  test('test if dm is empty', () => {
    const auth = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });

    const result = sendWrapRequest('POST', '/dm/create/v2', { token: auth.token }, { uIds: [] });

    expect(result).toStrictEqual({ dmId: expect.any(Number) });
  });

  test('test if multiple dms are empty', () => {
    const auth = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });

    const dm = sendWrapRequest('POST', '/dm/create/v2', { token: auth.token }, { uIds: [] });

    const dm1 = sendWrapRequest('POST', '/dm/create/v2', { token: auth.token }, { uIds: [] });

    expect(dm.dmId).not.toEqual(dm1.dmId);

    expect([dm, dm1]).toStrictEqual([
      { dmId: expect.any(Number) },
      { dmId: expect.any(Number) }
    ]);
  });

  test('Test for an invalid inputted token', () => {
    const invalidToken = 'ABCDEFGHILabcdftusan';

    const res = sendWrapRequest('POST', '/dm/create/v2', { token: invalidToken }, { uIds: [] });
    expect(res).toStrictEqual(403);
  });

  test('Test for invalid user Id', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const auth2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
    const auth3 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'Three' });

    expect(sendWrapRequest('POST', '/dm/create/v2', { token: auth1.token },
      {
        uIds: [
          auth2.authUserId,
          Math.max(auth1.authUserId, auth2.authUserId, auth3.authUserId) + 1
        ]
      })).toEqual(400);
  });

  test('Test for duplicate inputed uId', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const auth2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
    const auth3 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'Three' });

    expect(sendWrapRequest('POST', '/dm/create/v2', { token: auth1.token },
      {
        uIds: [
          auth2.authUserId,
          auth3.authUserId,
          auth2.authUserId
        ]
      })).toEqual(400);
  });
  test('Test for members (invalid) in dm', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const auth2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
    const auth3 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'Three' });

    const result = sendWrapRequest('POST', '/dm/create/v2', { token: auth1.token },
      {
        uIds: [
          auth2.authUserId,
          auth3.authUserId,
          12
        ]
      });

    expect(result).toEqual(400);
  });
  test('Test for multiple members (valid) in dm', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const auth2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
    const auth3 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'Three' });

    const result = sendWrapRequest('POST', '/dm/create/v2', { token: auth1.token },
      {
        uIds: [
          auth2.authUserId,
          auth3.authUserId
        ]
      });

    expect(result).toEqual({ dmId: expect.any(Number) });
  });

  test('Test for unique DM id numbers', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });

    const result1 = sendWrapRequest('POST', '/dm/create/v2', { token: auth1.token },
      { uIds: [] });

    const result2 = sendWrapRequest('POST', '/dm/create/v2', { token: auth1.token },
      { uIds: [] });

    expect(result1.dmId).not.toEqual(result2.dmId);
  });
});
