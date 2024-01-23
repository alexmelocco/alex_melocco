import { wrapClearRequest } from './testHelper';
import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  wrapClearRequest();
});
jest.useFakeTimers();
describe('Test for message/sendlaterdm/v1', () => {
  test('Deals with timeSent is a time in the past', async () => {
    const user = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userData = JSON.parse(user.getBody() as string);
    const dm1 = request('POST', SERVER_URL + '/dm/create/v2',
      { headers: { token: userData.token }, json: { uIds: [userData.authUserId] } });
    const dmData = JSON.parse(dm1.getBody() as string);

    const data = request('POST', SERVER_URL + '/message/sendlaterdm/v1',
      {
        headers: { token: userData.token },
        json: { dmId: dmData.dmId, message: 'Hello noone', timeSent: Math.floor(Date.now() / 1000) - 1 }
      });
    jest.runOnlyPendingTimers();
    expect(data.statusCode).toStrictEqual(400);
  });

  test('Deals with invalid token', async () => {
    const user = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userData = JSON.parse(user.getBody() as string);

    const dm1 = request('POST', SERVER_URL + '/dm/create/v2',
      { headers: { token: userData.token }, json: { uIds: [userData.authUserId] } });
    const dmData = JSON.parse(dm1.getBody() as string);
    const data = request('POST', SERVER_URL + '/message/sendlaterdm/v1',
      {
        headers: { token: userData.token + 'a' },
        json: { dmId: dmData.dmId, message: 'Hello noone', timeSent: Math.floor(Date.now() / 1000) + 2 }
      });
    jest.runOnlyPendingTimers();
    expect(data.statusCode).toStrictEqual(403);
  });

  test('Deals with channelId is invalid', async () => {
    const user = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userData = JSON.parse(user.getBody() as string);
    const dm1 = request('POST', SERVER_URL + '/dm/create/v2',
      { headers: { token: userData.token }, json: { uIds: [userData.authUserId] } });
    const dmData = JSON.parse(dm1.getBody() as string);
    const data = request('POST', SERVER_URL + '/message/sendlaterdm/v1',
      {
        headers: { token: userData.token },
        json: { dmId: dmData.dmId + 1, message: 'Hello noone', timeSent: Math.floor(Date.now() / 1000) + 4 }
      });
    jest.runOnlyPendingTimers();
    expect(data.statusCode).toStrictEqual(400);
  });

  test('Deals with message length less than 1 character', async () => {
    const user = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userData = JSON.parse(user.getBody() as string);
    const dm1 = request('POST', SERVER_URL + '/dm/create/v2',
      { headers: { token: userData.token }, json: { uIds: [userData.authUserId] } });
    const dmData = JSON.parse(dm1.getBody() as string);
    const data = request('POST', SERVER_URL + '/message/sendlaterdm/v1',
      {
        headers: { token: userData.token },
        json: { dmId: dmData.dmId, message: '', timeSent: Math.floor(Date.now() / 1000) + 6 }
      });
    jest.runOnlyPendingTimers();
    expect(data.statusCode).toStrictEqual(400);
  });

  test('Deals with message length over 1000 characters', async () => {
    const user = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userData = JSON.parse(user.getBody() as string);
    const dm1 = request('POST', SERVER_URL + '/dm/create/v2',
      { headers: { token: userData.token }, json: { uIds: [userData.authUserId] } });
    const dmData = JSON.parse(dm1.getBody() as string);
    let message = 'long';
    for (let i = 0; i < 1000; i++) {
      message += 'a';
    }
    const data = request('POST', SERVER_URL + '/message/sendlaterdm/v1',
      {
        headers: { token: userData.token },
        json: { dmId: dmData.dmId, message: message, timeSent: Math.floor(Date.now() / 1000) + 8 }
      });
    jest.runOnlyPendingTimers();
    expect(data.statusCode).toStrictEqual(400);
  });

  test('Deals with user is not member of the dm they are trying to post to', async () => {
    const user = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userData = JSON.parse(user.getBody() as string);
    const dm1 = request('POST', SERVER_URL + '/dm/create/v2',
      { headers: { token: userData.token }, json: { uIds: [userData.authUserId] } });
    const dmData = JSON.parse(dm1.getBody() as string);
    const user2 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' } });
    const userData2 = JSON.parse(user2.getBody() as string);

    const data = request('POST', SERVER_URL + '/message/sendlaterdm/v1',
      {
        headers: { token: userData2.token },
        json: { dmId: dmData.dmId, message: 'Hello noone', timeSent: Math.floor(Date.now() / 1000) + 10 }
      });
    jest.runOnlyPendingTimers();
    expect(data.statusCode).toStrictEqual(403);
  });

  test('Deals with successful call', async () => {
    const user = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
    const userData = JSON.parse(user.getBody() as string);
    const dm1 = request('POST', SERVER_URL + '/dm/create/v2',
      { headers: { token: userData.token }, json: { uIds: [userData.authUserId] } });
    const dmData = JSON.parse(dm1.getBody() as string);
    const data = request('POST', SERVER_URL + '/message/sendlaterdm/v1',
      {
        headers: { token: userData.token },
        json: { dmId: dmData.dmId, message: 'Hello noone', timeSent: Math.floor(Date.now() / 1000) + 12 }
      });
    jest.runOnlyPendingTimers();
    expect(JSON.parse(data.getBody() as string)).toStrictEqual({ messageId: expect.any(Number) });
  });
});
