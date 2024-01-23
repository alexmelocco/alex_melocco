import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
import { channelsCreateV1, channelJoinV1, authRegisterV1, channelDetailsV1 } from './testHelpers';

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { json: {} });
});

describe('Testing /channel/join/v3', () => {
  test('Deals with invalid channelId', () => {
    const uId = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const channelId = channelsCreateV1(uId.token, 'new_channel_name', true);
    const missingChannelId = channelId.channelId + 1;
    expect(channelJoinV1(uId.token, missingChannelId)).toStrictEqual(400);
  });
  test('Deals with member is already part of channel', () => {
    const uId = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const channelId = channelsCreateV1(uId.token, 'new_channel_name', true);
    expect(channelJoinV1(uId.token, channelId.channelId)).toStrictEqual(400);
  });
  test('Deals with when channel is private and user is not already a channel member or global owner', () => {
    const uId1 = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const channelId = channelsCreateV1(uId1.token, 'private_channel_name', false);
    const uId2 = authRegisterV1('bb@gmail.com', 'bbbbbb', 'bb', 'bbbbbbb');
    expect(channelJoinV1(uId2.token, channelId.channelId)).toStrictEqual(403);
  });
  test('Deals with when channel is private and user is a global owner', () => {
    const uId1 = authRegisterV1('personone@email.com', 'passwordone', 'Person', 'One');
    const uId2 = authRegisterV1('persontwo@email.com', 'passwordtwo', 'Person', 'Two');
    const channelId = channelsCreateV1(uId2.token, 'private_channel_name', false);
    channelJoinV1(uId1.token, channelId.channelId);
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
    expect(channelDetailsV1(uId2.token, channelId.channelId)).toStrictEqual(
      {
        name: 'private_channel_name',
        isPublic: false,
        ownerMembers: [expectedMember2],
        allMembers: [expectedMember2, expectedMember1],
      }
    );
  });
  test('Deals with invalid token', () => {
    const uId = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const channelId = channelsCreateV1(uId.token, 'first_channel_name', true);
    const uIdMissing = uId + 1;
    expect(channelJoinV1(uIdMissing.token, channelId.channelId)).toStrictEqual(403);
  });
  test('Deals with valid token and channelId', () => {
    const uId1 = authRegisterV1('personone@email.com', 'passwordone', 'Person', 'One');
    const channelId1 = channelsCreateV1(uId1.token, 'abc', true);
    const uId2 = authRegisterV1('persontwo@email.com', 'passwordtwo', 'Person', 'Two');
    const channelId2 = channelsCreateV1(uId2.token, 'xyz', true);
    channelJoinV1(uId1.token, channelId2.channelId);
    channelJoinV1(uId2.token, channelId1.channelId);
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
        allMembers: [expectedMember1, expectedMember2],
      }
    );
    expect(channelDetailsV1(uId2.token, channelId2.channelId)).toStrictEqual(
      {
        name: 'xyz',
        isPublic: true,
        ownerMembers: [expectedMember2],
        allMembers: [expectedMember2, expectedMember1],
      }
    );
  });
  test('Global owner permissions', () => {
    const uId1 = authRegisterV1('personone@email.com', 'passwordone', 'Person', 'One');
    const uId2 = authRegisterV1('persontwo@email.com', 'passwordtwo', 'Person', 'Two');
    const channelId1 = channelsCreateV1(uId2.token, 'abc', true);
    const channelId2 = channelsCreateV1(uId2.token, 'xyz', false);
    channelJoinV1(uId1.token, channelId1.channelId);
    channelJoinV1(uId1.token, channelId2.channelId);
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
        ownerMembers: [expectedMember2],
        allMembers: [expectedMember2, expectedMember1],
      }
    );
    expect(channelDetailsV1(uId2.token, channelId2.channelId)).toStrictEqual(
      {
        name: 'xyz',
        isPublic: false,
        ownerMembers: [expectedMember2],
        allMembers: [expectedMember2, expectedMember1],
      }
    );
  });
});
