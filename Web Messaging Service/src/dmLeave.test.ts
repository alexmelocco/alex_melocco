import request from 'sync-request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
let userdata1: any;
let userdata2: any;
let dmData: any;
beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`, { qs: {} });
  const register1 = request('POST', SERVER_URL + '/auth/register/v3', { json: { email: 'person@email.com', password: 'password', nameFirst: 'Person', nameLast: 'Person' } });
  userdata1 = JSON.parse(register1.getBody() as string);
  const register2 = request('POST', SERVER_URL + '/auth/register/v3', { json: { email: 'hanmingwong@email.com', password: 'password123', nameFirst: 'Hanming', nameLast: 'Wong' } });
  userdata2 = JSON.parse(register2.getBody() as string);
  const dm1 = request('POST', SERVER_URL + '/dm/create/v2',
    { headers: { token: userdata1.token }, json: { uIds: [userdata2.authUserId] } });
  dmData = JSON.parse(dm1.getBody() as string);
});

describe('/dm/leave/v1 test', () => {
  // Tests for when there is no error.
  test('Successful test', () => {
    const leave = request('POST', SERVER_URL + '/dm/leave/v2', { headers: { token: userdata2.token }, json: { dmId: dmData.dmId } });
    const result = JSON.parse(leave.getBody() as string);
    request('POST', SERVER_URL + '/dm/leave/v2', { headers: { token: userdata1.token }, json: { dmId: dmData.dmId } });
    expect(result).toStrictEqual({});
  });
  // Test for when there is an error.
  test('Error occurs during test: dmId does not refer to a valid DM', () => {
    const invalidDmId: number = dmData.dmId + 1000;
    const leave = request('POST', SERVER_URL + '/dm/leave/v2', { headers: { token: userdata2.token }, json: { dmId: invalidDmId } });
    expect(leave.statusCode).toStrictEqual(400);
  });

  test('Error occurs during test: dmId is valid and the authorised user is not a member of the DM', () => {
    const register3 = request('POST', SERVER_URL + '/auth/register/v3', { json: { email: 'johndoe22@email.com', password: 'johndoe123', nameFirst: 'John', nameLast: 'Doe' } });
    const userdata3 = JSON.parse(register3.getBody() as string);
    const leave = request('POST', SERVER_URL + '/dm/leave/v2', { headers: { token: userdata3.token }, json: { dmId: dmData.dmId } });
    expect(leave.statusCode).toStrictEqual(403);
  });

  test('Error occurs during test: Token is invalid', () => {
    const invalidToken = userdata2.token + '100001';
    const leave = request('POST', SERVER_URL + '/dm/leave/v2', { headers: { token: invalidToken }, json: { dmId: dmData.dmId } });
    expect(leave.statusCode).toStrictEqual(403);
  });
});
