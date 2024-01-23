import request from 'sync-request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { json: {} });
});

describe('Testing clearV1', () => {
  test('Testing clear with users only', () => {
    const resClear = request('DELETE', SERVER_URL + '/clear/v1', { json: {} });
    const resClearJSON = JSON.parse(resClear.getBody() as string);
    expect(resClearJSON).toStrictEqual({});
    const resRegisterr = request(
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
    const resRegisterrJSON = JSON.parse(resRegisterr.getBody() as string);
    expect(resRegisterrJSON).toStrictEqual({ authUserId: expect.any(Number), token: expect.any(String) });
    const resRegister2 = request(
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
    expect(resRegister2.statusCode).toStrictEqual(400);
    const resClear2 = request('DELETE', SERVER_URL + '/clear/v1', { json: {} });
    const resClear2JSON = JSON.parse(resClear2.getBody() as string);
    expect(resClear2JSON).toStrictEqual({});
    const resRegister3 = request(
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
    const resRegister3JSON = JSON.parse(resRegister3.getBody() as string);
    expect(resRegister3JSON).toStrictEqual({ authUserId: expect.any(Number), token: expect.any(String) });
    const resRegister4 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'abbba@gmail.com',
          password: 'aaaaaa',
          nameFirst: 'aa',
          nameLast: 'aaaaaa',
        }
      }
    );
    const resRegister4JSON = JSON.parse(resRegister4.getBody() as string);
    expect(resRegister4JSON).toStrictEqual({ authUserId: expect.any(Number), token: expect.any(String) });
    const resRegister5 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'abbba@gmail.com',
          password: 'aaaaaa',
          nameFirst: 'aa',
          nameLast: 'aaaaaa',
        }
      }
    );
    expect(resRegister5.statusCode).toStrictEqual(400);
  });
  test('Testing clear with channels only', () => {
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
    const resCreate = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: { token: uId.token },
        json: {
          name: 'aaaaaa',
          isPublic: true,
        }
      }
    );
    const resCreateJSON = JSON.parse(resCreate.getBody() as string);
    expect(resCreateJSON).toStrictEqual({ channelId: expect.any(Number) });
    const resClear = request('DELETE', SERVER_URL + '/clear/v1', { json: {} });
    const resClearJSON = JSON.parse(resClear.getBody() as string);
    expect(resClearJSON).toStrictEqual({});
    const resCreate3 = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: { token: uId.token },
        json: {
          name: 'aaaaaa',
          isPublic: true,
        }
      }
    );
    expect(resCreate3.statusCode).toStrictEqual(403);
    const resReg = request(
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
    const uId2 = JSON.parse(resReg.getBody() as string);
    const resList = request(
      'GET',
      SERVER_URL + '/channels/listall/v3',
      {
        headers: { token: uId2.token },
        qs: {}
      }
    );
    const resListJSON = JSON.parse(resList.getBody() as string);
    expect(resListJSON).toStrictEqual({ channels: [] });
    const resCreate4 = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: { token: uId2.token },
        json: {
          name: 'aaaaaa',
          isPublic: true,
        }
      }
    );
    const resCreate4JSON = JSON.parse(resCreate4.getBody() as string);
    expect(resCreate4JSON).toStrictEqual({ channelId: expect.any(Number) });
    const resCreate6 = request(
      'POST',
      SERVER_URL + '/channels/create/v3',
      {
        headers: { token: uId2.token },
        json: {
          name: 'aayyaaa',
          isPublic: true,
        }
      }
    );
    const resCreate6JSON = JSON.parse(resCreate6.getBody() as string);
    expect(resCreate6JSON).toStrictEqual({ channelId: expect.any(Number) });
    const resClear2 = request('DELETE', SERVER_URL + '/clear/v1', { json: {} });
    const resClear2JSON = JSON.parse(resClear2.getBody() as string);
    expect(resClear2JSON).toStrictEqual({});
    const resList2 = request(
      'GET',
      SERVER_URL + '/channels/listall/v3',
      {
        headers: { token: uId2.token },
        qs: {}
      }
    );
    expect(resList2.statusCode).toStrictEqual(403);
  });
});
