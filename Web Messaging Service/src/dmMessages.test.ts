import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
import { messageView } from './types';
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

describe('Testing dmMessages', () => {
  test('invalid token', () => {
    const invalidToken: number = parseInt(userdata.token) + 1;
    const result = request('GET', SERVER_URL + '/dm/messages/v2',
      { headers: { token: invalidToken.toString() }, qs: { dmId: dmData.dmId, start: 0 } });
    expect(result.statusCode).toStrictEqual(403);
  });
  test('invalid dmId', () => {
    const invalidDm = parseInt(dmData.dmId) + 1;
    const result = request('GET', SERVER_URL + '/dm/messages/v2',
      { headers: { token: userdata.token }, qs: { dmId: invalidDm.toString(), start: 0 } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('no messages and start is greater than 0', () => {
    const result = request('GET', SERVER_URL + '/dm/messages/v2',
      { headers: { token: userdata.token }, qs: { dmId: dmData.dmId, start: 5 } });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('member is not in dm', () => {
    const user3 = request('POST', SERVER_URL + '/auth/register/v3',
      { json: { email: 'personthree@email.com', password: 'passwordthree', nameFirst: 'Person', nameLast: 'Three' } });
    const userdata3 = JSON.parse(user3.getBody() as string);

    const result = request('GET', SERVER_URL + '/dm/messages/v2',
      { headers: { token: userdata3.token }, qs: { dmId: dmData.dmId, start: 0 } });
    expect(result.statusCode).toStrictEqual(403);
  });
  test('no messages (expected output)', () => {
    const expected: messageView = {
      messages: [],
      start: 0,
      end: -1,
    };
    const result = request('GET', SERVER_URL + '/dm/messages/v2',
      { headers: { token: userdata.token }, qs: { dmId: dmData.dmId, start: 0 } });
    const data = JSON.parse(result.getBody() as string);
    expect(data).toStrictEqual(expected);
  });
});
