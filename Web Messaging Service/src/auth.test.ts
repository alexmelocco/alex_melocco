import { port, url } from './config.json';
import { sendWrapRequest, wrapClearRequest } from './testHelper';
import request from 'sync-request';

beforeEach(() => {
  wrapClearRequest();
});

const SERVER_URL = `${url}:${port}`;
const authIdObject = {
  token: expect.any(String),
  authUserId: expect.any(Number),
};

describe('/auth/register/v3 test', () => {
  test('Deals with normal email and names not exceeding 20 characters', () => {
    const res = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'ajm03m@gmail.com', password: 'password', nameFirst: 'Alex', nameLast: 'Melocco' });
    expect(res).toEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
    const res2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'mangdude03@gmail.com', password: 'password1', nameFirst: 'John', nameLast: 'Limothy' });
    expect(res2).toEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });
  test('Deals with normal email and names that exceed 20 characters', () => {
    const res = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'ajm03m@gmail.com', password: 'password', nameFirst: 'abcd', nameLast: 'efghijklmnopqrstuv' });
    expect(res).toEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });

    const res2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'mangdude03@gmail.com', password: 'password1', nameFirst: 'abcd', nameLast: 'efghijklmnopqrstuvwsy' });
    expect(res2).toEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });

  test('Test unnique authUserId', () => {
    const res = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'hunter2', nameFirst: 'Brad', nameLast: 'Valid' });
    const res2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid2@example.com', password: 'hunter3', nameFirst: 'Clive', nameLast: 'Default' });
    expect(res.authUserId).not.toEqual(res2.authUserId);
    expect(res).toEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
    expect(res2).toEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });
  test('Test identical name inputs', () => {
    const res = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'hunter2', nameFirst: 'Brad', nameLast: 'Clive' });
    const res2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid2@example.com', password: 'hunter3', nameFirst: 'Brad', nameLast: 'Clive' });
    expect(res.authUserId).not.toEqual(res2.authUserId);
  });
  test('Test identical name inputs when there is 3 repeats', () => {
    const res = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'hunter2', nameFirst: 'ABrad', nameLast: 'Clive' });
    const res2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid2@example.com', password: 'hunter3', nameFirst: 'ABrad', nameLast: 'Clive' });
    const res3 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid3@example.com', password: 'hunter4', nameFirst: 'ABrad', nameLast: 'Clive' });
    expect(res.authUserId).not.toEqual(res2.authUserId);
    expect(res3.authUserId).not.toEqual(res2.authUserId);
  });
  test('Test identical name inputs exceeding 20 characters', () => {
    const res = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid1@example.com', password: 'hunter2', nameFirst: 'BradBradBrad', nameLast: 'ValidValidValid' });
    const res2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'valid2@example.com', password: 'hunter3', nameFirst: 'BradBradBrad', nameLast: 'ValidValidValid' });
    expect(res.authUserId).not.toEqual(res2.authUserId);
  });
  test('Length of password less than 6 characters', () => {
    const res = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'ajm03m@gmail.com', password: 'pass', nameFirst: 'abcd', nameLast: 'efghijklmnopqrstuv' });
    // Note, if error no token produced
    expect(res).toEqual(400);
  });
  test('Length of nameFirst is not between 1 and 50 characters inclusive', () => {
    const res = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'ajm03m@gmail.com', password: 'password', nameFirst: '', nameLast: 'efghijklmnopqrstuv' });
    const res2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'ajm03@gmail.com', password: 'password', nameFirst: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', nameLast: 'hello' });
    // Note, if error no token produced
    expect(res).toEqual(400);
    expect(res2).toEqual(400);
  });
  test('Length of nameLast is not between 1 and 50 characters inclusive', () => {
    const res = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'ajm03m@gmail.com', password: 'password', nameFirst: 'efghijklmnopqrstuv', nameLast: '' });
    const res2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'ajm03@gmail.com', password: 'password', nameFirst: 'Hello', nameLast: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' });
    // Note, if error no token produced
    expect(res).toEqual(400);
    expect(res2).toEqual(400);
  });
  test('Same email being used', () => {
    const res = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'ajm03m@gmail.com', password: 'password', nameFirst: 'asdas', nameLast: 'Gelo' });
    expect(res).toEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
    const res2 = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'ajm03m@gmail.com', password: 'password1', nameFirst: 'asdasv', nameLast: 'HELasd' });
    expect(res2).toEqual(400);
  });
  test('Test for invalid email', () => {
    const res = sendWrapRequest('POST', '/auth/register/v3', {}, { email: 'ajm03@gmailcom', password: 'password', nameFirst: 'efawsdas', nameLast: 'asdaf' });
    expect(res).toEqual(400);
  });
});

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { json: {} });
});

const authObject = {
  token: expect.any(String),
  authUserId: expect.any(Number),
};

describe('Testing auth/login/v3', () => {
  test('Test email not in dataStore', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/login/v3',
      {
        json: {
          email: 'oooo@ooo.com',
          password: 'eeeee',
        }
      }
    );
    expect(res.statusCode).toEqual(400);
  });
  test('Test incorrect password but email is in dataStore', () => {
    request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'aa@gmail.com',
          password: 'aaaaaa',
          nameFirst: 'aa',
          nameLast: 'aaaaaa',
        }
      }
    );
    const res = request(
      'POST',
      SERVER_URL + '/auth/login/v3',
      {
        json: {
          email: 'aa@gmail.com',
          password: 'eeeee',
        }
      }
    );
    expect(res.statusCode).toEqual(400);
  });
  test('Test valid email and password with one user in dataStore', () => {
    // maybe do a before each for these consts??
    request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'aa@gmail.com',
          password: 'aaaaaa',
          nameFirst: 'aa',
          nameLast: 'aaaaaa',
        }
      }
    );
    const resLogin = request(
      'POST',
      SERVER_URL + '/auth/login/v3',
      {
        json: {
          email: 'aa@gmail.com',
          password: 'aaaaaa',
        }
      }
    );
    const resLoginJSON = JSON.parse(resLogin.getBody() as string);
    expect(resLoginJSON).toEqual(authObject);
  });
  test('Test valid email and password is incorrect for this user, but correct for another', () => {
    request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'aa@gmail.com',
          password: 'aaaaaa',
          nameFirst: 'aa',
          nameLast: 'aaaaaa',
        }
      }
    );
    request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'aaaa@gmail.com',
          password: 'aaaaaaaa',
          nameFirst: 'aaaaaa',
          nameLast: 'aaaa',
        }
      }
    );
    const resLogin = request(
      'POST',
      SERVER_URL + '/auth/login/v3',
      {
        json: {
          email: 'aaaa@gmail.com',
          password: 'aaaaaa',
        }
      }
    );
    expect(resLogin.statusCode).toEqual(400);
  });
  test('Test valid email and password with multiple users in dataStore', () => {
    request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'aa@gmail.com',
          password: 'aaaaaa',
          nameFirst: 'aa',
          nameLast: 'aaaaaa',
        }
      }
    );
    request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'aaaa@gmail.com',
          password: 'aaaaaaaa',
          nameFirst: 'aaaaaa',
          nameLast: 'aaaa',
        }
      }
    );
    const resLogin = request(
      'POST',
      SERVER_URL + '/auth/login/v3',
      {
        json: {
          email: 'aa@gmail.com',
          password: 'aaaaaa',
        }
      }
    );
    const resLoginJSON = JSON.parse(resLogin.getBody() as string);
    expect(resLoginJSON).toEqual(authObject);
  });
  test('Test valid email and password with multiple users in dataStore 2', () => {
    request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'aa@gmail.com',
          password: 'aaaaaa',
          nameFirst: 'aa',
          nameLast: 'aaaaaa',
        }
      }
    );
    request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'aaaa@gmail.com',
          password: 'aaaaaaaa',
          nameFirst: 'aaaaaa',
          nameLast: 'aaaa',
        }
      }
    );
    const resLogin = request(
      'POST',
      SERVER_URL + '/auth/login/v3',
      {
        json: {
          email: 'aaaa@gmail.com',
          password: 'aaaaaaaa',
        }
      }
    );
    const resLoginJSON = JSON.parse(resLogin.getBody() as string);
    expect(resLoginJSON).toEqual(authObject);
  });
});

describe('Testing /auth/logout/v2', () => {
  test('Test invalid token', () => {
    const resOut = request(
      'POST',
      SERVER_URL + '/auth/logout/v2',
      {
        headers: {
          token: 'oooo',
        }
      }
    );
    expect(resOut.statusCode).toEqual(403);
  });
  test('Test valid token with one user logged in once', () => {
    const resRegister = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'aa@gmail.com',
          password: 'aaaaaa',
          nameFirst: 'aa',
          nameLast: 'aaaaaa',
        }
      }
    );
    const uId = JSON.parse(resRegister.getBody() as string);
    const resOut = request(
      'POST',
      SERVER_URL + '/auth/logout/v2',
      {
        headers: {
          token: uId.token,
        }
      }
    );
    const resOutJSON = JSON.parse(resOut.getBody() as string);
    expect(resOutJSON).toStrictEqual({});
    const resOut2 = request(
      'POST',
      SERVER_URL + '/auth/logout/v2',
      {
        headers: {
          token: uId.token,
        }
      }
    );
    expect(resOut2.statusCode).toEqual(403);
  });
  test('Test valid token with one user logged in more than once', () => {
    const resRegister = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'aa@gmail.com',
          password: 'aaaaaa',
          nameFirst: 'aa',
          nameLast: 'aaaaaa',
        }
      }
    );
    const uId = JSON.parse(resRegister.getBody() as string);
    const resLogin = request(
      'POST',
      SERVER_URL + '/auth/login/v3',
      {
        json: {
          email: 'aa@gmail.com',
          password: 'aaaaaa',
        }
      }
    );
    const resLoginJSON = JSON.parse(resLogin.getBody() as string);
    expect(resLoginJSON).toEqual(authIdObject);
    const resOut = request(
      'POST',
      SERVER_URL + '/auth/logout/v2',
      {
        headers: {
          token: uId.token,
        }
      }
    );
    const resOutJSON = JSON.parse(resOut.getBody() as string);
    expect(resOutJSON).toStrictEqual({});
    const resOut2 = request(
      'POST',
      SERVER_URL + '/auth/logout/v2',
      {
        headers: {
          token: uId.token,
        }
      }
    );
    expect(resOut2.statusCode).toEqual(403);
    const resOut3 = request(
      'POST',
      SERVER_URL + '/auth/logout/v2',
      {
        headers: {
          token: resLoginJSON.token,
        }
      }
    );
    const resOut3JSON = JSON.parse(resOut3.getBody() as string);
    expect(resOut3JSON).toStrictEqual({});
  });
  test('Test valid token with one+ users logged in one+ times', () => {
    const resRegister = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'aa@gmail.com',
          password: 'aaaaaa',
          nameFirst: 'aa',
          nameLast: 'aaaaaa',
        }
      }
    );
    const uId = JSON.parse(resRegister.getBody() as string);
    const resLogin = request(
      'POST',
      SERVER_URL + '/auth/login/v3',
      {
        json: {
          email: 'aa@gmail.com',
          password: 'aaaaaa',
        }
      }
    );
    const resLoginJSON = JSON.parse(resLogin.getBody() as string);
    const resRegister2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'aaaa@gmail.com',
          password: 'aaaaaaaa',
          nameFirst: 'aaaaaa',
          nameLast: 'aaaa',
        }
      }
    );
    const uId2 = JSON.parse(resRegister2.getBody() as string);
    expect(uId2).toEqual(authIdObject);
    const resOut = request(
      'POST',
      SERVER_URL + '/auth/logout/v2',
      {
        headers: {
          token: uId.token,
        }
      }
    );
    const resOutJSON = JSON.parse(resOut.getBody() as string);
    expect(resOutJSON).toStrictEqual({});
    const resOut2 = request(
      'POST',
      SERVER_URL + '/auth/logout/v2',
      {
        headers: {
          token: uId.token,
        }
      }
    );
    expect(resOut2.statusCode).toEqual(403);
    const resOut3 = request(
      'POST',
      SERVER_URL + '/auth/logout/v2',
      {
        headers: {
          token: resLoginJSON.token,
        }
      }
    );
    const resOut3JSON = JSON.parse(resOut3.getBody() as string);
    expect(resOut3JSON).toStrictEqual({});
    const resOut4 = request(
      'POST',
      SERVER_URL + '/auth/logout/v2',
      {
        headers: {
          token: uId2.token,
        }
      }
    );
    const resOut4JSON = JSON.parse(resOut4.getBody() as string);
    expect(resOut4JSON).toStrictEqual({});
  });
});
