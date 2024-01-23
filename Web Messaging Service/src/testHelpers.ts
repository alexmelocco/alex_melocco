import { stringify } from 'querystring';
import request from 'sync-request';
import { StringMappingType } from 'typescript';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

export function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/register/v3',
    {
      json: {
        email,
        password,
        nameFirst,
        nameLast,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function channelDetailsV1(token: string, channelId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/channel/details/v3',
    {
      headers: { token: token },
      qs: {
        channelId,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function channelsCreateV1(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    SERVER_URL + '/channels/create/v3',
    {
      headers: { token: token },
      json: {
        name,
        isPublic,
      },
    }
  );
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function channelJoinV1(token: string, channelId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/join/v3',
    {
      headers: { token: token },
      json: {
        channelId,
      }
    }
  );
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function channelLeaveV1(token: string, channelId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/leave/v2',
    {
      headers: { token: token },
      json: {
        channelId,
      }
    }
  );
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function channelAddOwnerV1(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/addowner/v2',
    {
      headers: { token: token },
      json: {
        channelId,
        uId,
      }
    }
  );
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function channelRemoveOwnerV1(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/removeowner/v2',
    {
      headers: { token: token },
      json: {
        channelId,
        uId,
      }
    }
  );
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

// itr4 funcs

export function messageSendV2(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    SERVER_URL + '/message/send/v2',
    {
      headers: { token: token },
      json: {
        channelId,
        message,
      },
    }
  )
}

export function channelJoinV3(token: string, channelId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/join/v3',
    {
      headers: { token: token },
      json: {
        channelId,
      },
    }
  )
}

export function channelLeaveV2(token: string, channelId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/leave/v2',
    {
      headers: { token: token },
      json: {
        channelId,
      },
    }
  )
}

export function channelInviteV3(token: string, channelId: number, uId: string) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/invite/v3',
    {
      headers: { token: token },
      json: {
        channelId,
        uId,
      },
    }
  )
}

export function userStats(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/user/stats/v1',
    {
      headers: { token: token },
    }
  )
}

export function dmCreateV2(token: string, uIds: string[]) {
  const res = request(
    'POST',
    SERVER_URL + '/dm/create/v2',
    {
      headers: { token: token },
      json: {
        uIds
      },
    }
  )
}

export function dmLeaveV2(token: string, dmId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/dm/leave/v2',
    {
      headers: { token: token },
      json: {
        dmId
      },
    }
  )
}

export function dmRemoveV2(token: string, dmId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + '/dm/remove/v2',
    {
      headers: { token: token },
      json: {
        dmId
      },
    }
  )
}

export function messageSendDmV2(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
    SERVER_URL + '/message/senddm/v2',
    {
      headers: { token: token },
      json: {
        dmId,
        message,
      },
    }
  )
  return res;
}