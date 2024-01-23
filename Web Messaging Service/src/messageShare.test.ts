import { wrapClearRequest } from './testHelper';
import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

let userData: any;
let dmData: any;
let channelData: any;
let messageChannelData: any;
let messageDmData: any;

beforeEach(() => {
  wrapClearRequest();
  const user = request(
    'POST',
    SERVER_URL + '/auth/register/v3',
    {
      json: {
        email: 'personone@email.com',
        password: 'passwordone',
        nameFirst: 'Person',
        nameLast: 'One'
      }
    }
  );
  userData = JSON.parse(user.getBody() as string);
  const dm = request(
    'POST',
    SERVER_URL + '/dm/create/v2',
    {
      headers: {
        token: userData.token
      },
      json: {
        uIds: [userData.authUserId]
      }
    }
  );
  dmData = JSON.parse(dm.getBody() as string);
  const channel = request(
    'POST',
    SERVER_URL + '/channels/create/v3',
    {
      headers: {
        token: userData.token
      },
      json: {
        name: 'ChannelOne',
        isPublic: true
      }
    }
  );
  channelData = JSON.parse(channel.getBody() as string);
  const messageChannel = request(
    'POST',
    SERVER_URL + '/message/send/v2',
    {
      headers: {
        token: userData.token
      },
      json: {
        channelId: channelData.channelId,
        message: 'Hello'
      }
    }
  );
  messageChannelData = JSON.parse(messageChannel.getBody() as string);
  const messageDm = request(
    'POST',
    SERVER_URL + '/message/senddm/v2',
    {
      headers: {
        token: userData.token
      },
      json: {
        dmId: dmData.dmId,
        message: 'Hello'
      }
    }
  );
  messageDmData = JSON.parse(messageDm.getBody() as string);
});

describe('/message/share/v1 tests', () => {
  test('Testing both channelId and dmId are invalid', () => {
    const err = request(
      'POST',
      SERVER_URL + '/message/share/v1',
      {
        headers: {
          token: userData.token
        },
        json: {
          ogMessageId: messageChannelData.messageId,
          message: '',
          channelId: channelData.channelId + dmData.dmId,
          dmId: channelData.channelId + dmData.dmId,
        }
      }
    );
    expect(err.statusCode).toEqual(400);
  });
  test('Testing neither channelId nor dmId are -1', () => {
    const err = request(
      'POST',
      SERVER_URL + '/message/share/v1',
      {
        headers: {
          token: userData.token
        },
        json: {
          ogMessageId: messageChannelData.messageId,
          message: '',
          channelId: channelData.channelId,
          dmId: dmData.dmId,
        }
      }
    );
    expect(err.statusCode).toEqual(400);
  });
  test('Testing valid dmId but channelId is not -1', () => {
    const err = request(
      'POST',
      SERVER_URL + '/message/share/v1',
      {
        headers: {
          token: userData.token
        },
        json: {
          ogMessageId: messageChannelData.messageId,
          message: '',
          channelId: 0,
          dmId: dmData.dmId,
        }
      }
    );
    expect(err.statusCode).toEqual(400);
  });
  test('Testing invalid ogMessageId in channel', () => {
    const err = request(
      'POST',
      SERVER_URL + '/message/share/v1',
      {
        headers: {
          token: userData.token
        },
        json: {
          ogMessageId: messageDmData.messageId + messageChannelData.messageId + 1,
          message: '',
          channelId: channelData.channelId,
          dmId: -1,
        }
      }
    );
    expect(err.statusCode).toEqual(400);
  });
  test('Testing invalid ogMessageId in dm', () => {
    const err = request(
      'POST',
      SERVER_URL + '/message/share/v1',
      {
        headers: {
          token: userData.token
        },
        json: {
          ogMessageId: messageDmData.messageId + messageChannelData.messageId + 1,
          message: '',
          channelId: -1,
          dmId: dmData.dmId,
        }
      }
    );
    expect(err.statusCode).toEqual(400);
  });
  test('Testing optional message over 1000 characters', () => {
    let longMessage = 'a';
    for (let i = 0; i < 1000; i++) {
      longMessage += 'a';
    }
    const err = request(
      'POST',
      SERVER_URL + '/message/share/v1',
      {
        headers: {
          token: userData.token
        },
        json: {
          ogMessageId: messageChannelData.messageId,
          message: longMessage,
          channelId: channelData.channelId,
          dmId: -1,
        }
      }
    );
    expect(err.statusCode).toEqual(400);
  });
  test('Testing token invalid', () => {
    const err = request(
      'POST',
      SERVER_URL + '/message/share/v1',
      {
        headers: {
          token: userData.token + 'a'
        },
        json: {
          ogMessageId: messageChannelData.messageId,
          message: '',
          channelId: channelData.channelId,
          dmId: -1,
        }
      }
    );
    expect(err.statusCode).toEqual(403);
  });
  test('Testing channel exists but user is not a part of it', () => {
    const user2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'persontwo@email.com',
          password: 'passwordone',
          nameFirst: 'Person',
          nameLast: 'Two'
        }
      }
    );
    const userData2 = JSON.parse(user2.getBody() as string);
    const err = request(
      'POST',
      SERVER_URL + '/message/share/v1',
      {
        headers: {
          token: userData2.token
        },
        json: {
          ogMessageId: messageChannelData.messageId,
          message: '',
          channelId: channelData.channelId,
          dmId: -1,
        }
      }
    );
    expect(err.statusCode).toEqual(403);
  });
  test('Testing dm exists but user is not a part of it', () => {
    const user2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'persontwo@email.com',
          password: 'passwordone',
          nameFirst: 'Person',
          nameLast: 'Two'
        }
      }
    );
    const userData2 = JSON.parse(user2.getBody() as string);
    const err = request(
      'POST',
      SERVER_URL + '/message/share/v1',
      {
        headers: {
          token: userData2.token
        },
        json: {
          ogMessageId: messageChannelData.messageId,
          message: '',
          channelId: -1,
          dmId: dmData.dmId,
        }
      }
    );
    expect(err.statusCode).toEqual(403);
  });
  test('Testing correct message share to channel', () => {
    const share = request(
      'POST',
      SERVER_URL + '/message/share/v1',
      {
        headers: {
          token: userData.token
        },
        json: {
          ogMessageId: messageChannelData.messageId,
          message: '',
          channelId: channelData.channelId,
          dmId: -1,
        }
      }
    );
    const shareJSON = JSON.parse(share.getBody() as string);
    expect(shareJSON).toEqual({ sharedMessageId: expect.any(Number) });
  });
  test('Testing correct message share to channel from dm', () => {
    const share = request(
      'POST',
      SERVER_URL + '/message/share/v1',
      {
        headers: {
          token: userData.token
        },
        json: {
          ogMessageId: messageDmData.messageId,
          message: '',
          channelId: channelData.channelId,
          dmId: -1,
        }
      }
    );
    const shareJSON = JSON.parse(share.getBody() as string);
    expect(shareJSON).toEqual({ sharedMessageId: expect.any(Number) });
  });
  test('Testing correct message share to dm', () => {
    const share = request(
      'POST',
      SERVER_URL + '/message/share/v1',
      {
        headers: {
          token: userData.token
        },
        json: {
          ogMessageId: messageDmData.messageId,
          message: '',
          channelId: -1,
          dmId: dmData.dmId,
        }
      }
    );
    const shareJSON = JSON.parse(share.getBody() as string);
    expect(shareJSON).toEqual({ sharedMessageId: expect.any(Number) });
  });
});
