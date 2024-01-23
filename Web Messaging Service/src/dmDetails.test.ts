import { sendWrapRequest, wrapClearRequest } from './testHelper';

beforeEach(() => {
  wrapClearRequest();
});

describe('Test for dm/details/v1', () => {
  test('success and failure', () => {
    const auth1 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const auth2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
    const auth3 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'Three' });
    const auth4 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid4@example.com', password: 'passwordfour', nameFirst: 'Personfour', nameLast: 'Four' });

    const dm = sendWrapRequest('POST', '/dm/create/v2', { token: auth1.token },
      { uIds: [auth2.authUserId, auth3.authUserId] });

    const result = sendWrapRequest('GET', '/dm/details/v2', { token: auth3.token },
      { dmId: dm.dmId });

    expect(result).toStrictEqual({
      name: 'personone, personthreethree, persontwotwo',
      members: [{
        uId: auth1.authUserId,
        email: 'valid1@example.com',
        nameFirst: 'Person',
        nameLast: 'One',
        handleStr: 'personone',
        profileImgUrl: expect.any(String),
      },
      {
        uId: auth2.authUserId,
        email: 'valid2@example.com',
        nameFirst: 'Persontwo',
        nameLast: 'Two',
        handleStr: 'persontwotwo',
        profileImgUrl: expect.any(String),
      },
      {
        uId: auth3.authUserId,
        email: 'valid3@example.com',
        nameFirst: 'Personthree',
        nameLast: 'Three',
        handleStr: 'personthreethree',
        profileImgUrl: expect.any(String),
      }]
    });
    const result3 = sendWrapRequest('GET', '/dm/details/v2', { token: auth4.token + 'a' },
      { dmId: dm.dmId });

    expect(result3).toStrictEqual(403);
    const result1 = sendWrapRequest('GET', '/dm/details/v2', { token: auth4.token },
      { dmId: dm.dmId });

    expect(result1).toStrictEqual(403);

    const result2 = sendWrapRequest('GET', '/dm/details/v2', { token: auth1.token },
      { dmId: dm.dmId + 1 });

    expect(result2).toStrictEqual(400);
  });
});
