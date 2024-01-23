import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { json: {} });
});

describe('Testing /dm/list/v2', () => {
  test('Test invalid token', () => {
    const resList = request(
      'GET',
      SERVER_URL + '/dm/list/v2',
      {
        headers: {
          token: 'fff'
        }
      }
    );
    expect(resList.statusCode).toStrictEqual(403);
  });
  test('Test empty list', () => {
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
    const resList = request(
      'GET',
      SERVER_URL + '/dm/list/v2',
      {
        headers: {
          token: uId.token,
        }
      }
    );
    const resListJSON = JSON.parse(resList.getBody() as string);
    expect(resListJSON).toStrictEqual({ dms: [] });
  });
  test('Test list with dms', () => {
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
    const resRegister2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'aaaaa@gmail.com',
          password: 'aaaaaa',
          nameFirst: 'aa',
          nameLast: 'aaaaaa',
        }
      }
    );
    const uId2 = JSON.parse(resRegister2.getBody() as string);
    const resDm = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: { token: uId.token },
        json: {
          uIds: [uId2.authUserId],
        }
      }
    );
    const resDmJSON = JSON.parse(resDm.getBody() as string);
    const resList = request(
      'GET',
      SERVER_URL + '/dm/list/v2',
      {
        headers: {
          token: uId.token,
        }
      }
    );
    const resListJSON = JSON.parse(resList.getBody() as string);
    expect(resListJSON).toStrictEqual({
      dms: [
        {
          dmId: resDmJSON.dmId,
          name: expect.any(String),
        }]
    });
    const resDm2 = request(
      'POST',
      SERVER_URL + '/dm/create/v2',
      {
        headers: { token: uId.token },
        json: {
          uIds: [uId2.authUserId],
        }
      }
    );
    const resDm2JSON = JSON.parse(resDm2.getBody() as string);
    const resList2 = request(
      'GET',
      SERVER_URL + '/dm/list/v2',
      {
        headers: {
          token: uId.token,
        }
      }
    );
    const resList2JSON = JSON.parse(resList2.getBody() as string);
    expect(resList2JSON).toStrictEqual({
      dms: [
        {
          dmId: resDmJSON.dmId,
          name: expect.any(String),
        },
        {
          dmId: resDm2JSON.dmId,
          name: expect.any(String),
        }]
    });
  });
});
