import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

let userdata: any;
let userdata2: any;
let dmData: any;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { qs: {} });
  const user = request('POST', SERVER_URL + '/auth/register/v3',
    { json: { email: 'personone@email.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' } });
  userdata = JSON.parse(user.getBody() as string);
  const user2 = request('POST', SERVER_URL + '/auth/register/v3',
    { json: { email: 'persontwo@email.com', password: 'passwordtwo', nameFirst: 'Person', nameLast: 'Two' } });
  userdata2 = JSON.parse(user2.getBody() as string);
  const dm1 = request('POST', SERVER_URL + '/dm/create/v2',
    { headers: { token: userdata.token }, json: { uIds: [userdata2.authUserId] } });
  dmData = JSON.parse(dm1.getBody() as string);
});

describe('Testing dm/remove/v2', () => {
  test('invalid token', () => {
    const invalidToken: number = parseInt(userdata.token) + 1;
    const result = request('DELETE', SERVER_URL + '/dm/remove/v2',
      { headers: { token: invalidToken.toString() }, qs: { dmId: dmData.dmId } });
    expect(result.statusCode).toStrictEqual(403);
  });
  test('invalid dmId', () => {
    const invalidDm = parseInt(dmData.dmId) + 1;
    const result = request('DELETE', SERVER_URL + '/dm/remove/v2',
      { headers: { token: userdata.token }, qs: { dmId: invalidDm.toString() } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('not original dm creator', () => {
    const result = request('DELETE', SERVER_URL + '/dm/remove/v2',
      { headers: { token: userdata2.token }, qs: { dmId: dmData.dmId } });
    expect(result.statusCode).toStrictEqual(403);
  });
  test('member is not in dm', () => {
    const user3 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personthree@email.com', password: 'passwordthree', nameFirst: 'Person', nameLast: 'Three' } });
    const userdata3 = JSON.parse(user3.getBody() as string);

    const result = request('DELETE', SERVER_URL + '/dm/remove/v2',
      { headers: { token: userdata3.token }, qs: { dmId: dmData.dmId } });
    expect(result.statusCode).toStrictEqual(403);
  });
  test('delete DM success', () => {
    const result = request('DELETE', SERVER_URL + '/dm/remove/v2',
      { headers: { token: userdata.token }, qs: { dmId: dmData.dmId } });
    const data = JSON.parse(result.getBody() as string);
    const expected = {};

    expect(data).toStrictEqual(expected);
  });
});
