import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
import { channelsCreateV1, channelJoinV1, authRegisterV1, channelDetailsV1, channelLeaveV1 } from './testHelpers';

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { json: {} });
});

describe('Testing /channel/leave/v2', () => {
  test('Deals with invalid channelId', () => {
    const uId1 = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const uId2 = authRegisterV1('ba@gmail.com', 'baaaaa', 'ba', 'baaaaaa');
    const channelId = channelsCreateV1(uId1.token, 'new_channel_name', true);
    channelJoinV1(uId2.token, channelId.channelId);
    const missingChannelId = channelId.channelId + 1;
    expect(channelLeaveV1(uId2.token, missingChannelId)).toStrictEqual(400);
  });
  test('Deals with when user is not a channel member', () => {
    const uId1 = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const uId2 = authRegisterV1('ba@gmail.com', 'baaaaa', 'ba', 'baaaaaa');
    const channelId = channelsCreateV1(uId1.token, 'new_channel_name', true);
    expect(channelLeaveV1(uId2.token, channelId.channelId)).toStrictEqual(403);
  });
  /* NEED TO FINISH STANDUP ERROR TEST
  test('Deals with when user is the starter of an active standup in the channel', () => {
    const uId1 = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const uId2 = authRegisterV1('ba@gmail.com', 'baaaaa', 'ba', 'baaaaaa');
    const channelId = channelsCreateV1(uId1.token, 'new_channel_name', true);
    channelJoinV1(uId2.token, channelId.channelId);
    STANDUP START FUNC
    expect(channelLeaveV1(uId1.token, channelId.channelId)).toStrictEqual(400);
  }); */
  test('Deals with invalid token', () => {
    const uId1 = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const uId2 = authRegisterV1('ba@gmail.com', 'baaaaa', 'ba', 'baaaaaa');
    const channelId = channelsCreateV1(uId1.token, 'first_channel_name', true);
    channelJoinV1(uId2.token, channelId.channelId);
    const uIdMissing = uId1 + uId2;
    expect(channelLeaveV1(uIdMissing.token, channelId.channelId)).toStrictEqual(403);
  });
  test('Deals with sole owner leaving a channel', () => {
    const uId1 = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const uId2 = authRegisterV1('persontwo@email.com', 'passwordtwo', 'Person', 'Two');
    const channelId = channelsCreateV1(uId1.token, 'first_channel_name', true);
    channelJoinV1(uId2.token, channelId.channelId);
    channelLeaveV1(uId1.token, channelId.channelId);
    const expectedMember2 = {
      uId: uId2.authUserId,
      nameFirst: 'Person',
      nameLast: 'Two',
      email: 'persontwo@email.com',
      handleStr: 'persontwo',
      profileImgUrl: expect.any(String),
    };
    expect(channelDetailsV1(uId2.token, channelId.channelId)).toStrictEqual(
      {
        name: 'first_channel_name',
        isPublic: true,
        ownerMembers: [],
        allMembers: [expectedMember2],
      }
    );
  });
  test('Deals with valid token and channelId', () => {
    const uId1 = authRegisterV1('personone@email.com', 'passwordone', 'Person', 'One');
    const channelId1 = channelsCreateV1(uId1.token, 'abc', true);
    const uId2 = authRegisterV1('persontwo@email.com', 'passwordtwo', 'Person', 'Two');
    const channelId2 = channelsCreateV1(uId2.token, 'xyz', true);
    channelJoinV1(uId1.token, channelId2.channelId);
    channelJoinV1(uId2.token, channelId1.channelId);
    channelLeaveV1(uId1.token, channelId2.channelId);
    channelLeaveV1(uId2.token, channelId1.channelId);
    const expectedMember1 = {
      uId: uId1.authUserId,
      nameFirst: 'Person',
      nameLast: 'One',
      email: 'personone@email.com',
      handleStr: 'personone',
      profileImgUrl: expect.any(String),
    };
    const expectedMember2 = {
      uId: uId2.authUserId,
      nameFirst: 'Person',
      nameLast: 'Two',
      email: 'persontwo@email.com',
      handleStr: 'persontwo',
      profileImgUrl: expect.any(String),
    };
    expect(channelDetailsV1(uId1.token, channelId1.channelId)).toStrictEqual(
      {
        name: 'abc',
        isPublic: true,
        ownerMembers: [expectedMember1],
        allMembers: [expectedMember1],
      }
    );
    expect(channelDetailsV1(uId2.token, channelId2.channelId)).toStrictEqual(
      {
        name: 'xyz',
        isPublic: true,
        ownerMembers: [expectedMember2],
        allMembers: [expectedMember2],
      }
    );
  });
});
