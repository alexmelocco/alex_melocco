import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
import { channelsCreateV1, channelJoinV1, authRegisterV1, channelDetailsV1, channelAddOwnerV1, channelRemoveOwnerV1 } from './testHelpers';

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { json: {} });
});

describe('Testing /channel/removeowner/v2', () => {
  test('Deals with invalid channelId', () => {
    const uId1 = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const uId2 = authRegisterV1('ba@gmail.com', 'baaaaa', 'ba', 'baaaaaa');
    const channelId = channelsCreateV1(uId1.token, 'new_channel_name', true);
    channelJoinV1(uId2.token, channelId.channelId);
    channelAddOwnerV1(uId1.token, channelId.channelId, uId2.authUserId);
    const missingChannelId = channelId.channelId + 1;
    expect(channelRemoveOwnerV1(uId1.token, missingChannelId, uId2.authUserId)).toStrictEqual(400);
  });
  test('Deals with invalid uId', () => {
    const uId1 = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const uId2 = authRegisterV1('ba@gmail.com', 'baaaaa', 'ba', 'baaaaaa');
    const channelId = channelsCreateV1(uId1.token, 'new_channel_name', true);
    channelJoinV1(uId2.token, channelId.channelId);
    channelAddOwnerV1(uId1.token, channelId.channelId, uId2.authUserId);
    const missingUId = uId1.authUserId + uId2.authUserId;
    expect(channelRemoveOwnerV1(uId1.token, channelId.channelId, missingUId)).toStrictEqual(400);
  });
  test('Deals with user is not an owner of channel', () => {
    const uId1 = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const uId2 = authRegisterV1('ba@gmail.com', 'baaaaa', 'ba', 'baaaaaa');
    const channelId = channelsCreateV1(uId1.token, 'new_channel_name', true);
    channelJoinV1(uId2.token, channelId.channelId);
    expect(channelRemoveOwnerV1(uId1.token, channelId.channelId, uId2.authUserId)).toStrictEqual(400);
  });
  test('Deals with user is only owner of channel', () => {
    const uId = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const channelId = channelsCreateV1(uId.token, 'new_channel_name', true);
    expect(channelRemoveOwnerV1(uId.token, channelId.channelId, uId.authUserId)).toStrictEqual(400);
  });
  test('Deals with invalid token', () => {
    const uId1 = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const uId2 = authRegisterV1('ba@gmail.com', 'baaaaa', 'ba', 'baaaaaa');
    const channelId = channelsCreateV1(uId1.token, 'first_channel_name', true);
    channelJoinV1(uId2.token, channelId.channelId);
    channelAddOwnerV1(uId1.token, channelId.channelId, uId2.authUserId);
    const uIdMissing = uId1 + uId2;
    expect(channelRemoveOwnerV1(uIdMissing.token, channelId.channelId, uId2.authUserId)).toStrictEqual(403);
  });
  test('Deals with authorised user does not have owner permissions in channel', () => {
    const uId1 = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const uId2 = authRegisterV1('ba@gmail.com', 'baaaaa', 'ba', 'baaaaaa');
    const uId3 = authRegisterV1('ca@gmail.com', 'caaaaa', 'ca', 'caaaaaa');
    const channelId = channelsCreateV1(uId1.token, 'new_channel_name', true);
    channelJoinV1(uId2.token, channelId.channelId);
    channelJoinV1(uId3.token, channelId.channelId);
    channelAddOwnerV1(uId1.token, channelId.channelId, uId2.authUserId);
    expect(channelRemoveOwnerV1(uId3.token, channelId.channelId, uId2.authUserId)).toStrictEqual(403);
  });
  test('Deals with authorised user is a global owner', () => {
    const uId1 = authRegisterV1('personone@email.com', 'passwordone', 'Person', 'One');
    const uId2 = authRegisterV1('persontwo@email.com', 'passwordtwo', 'Person', 'Two');
    const uId3 = authRegisterV1('personthr@email.com', 'passwordthr', 'Person', 'Thr');
    const channelId = channelsCreateV1(uId2.token, 'abc', true);
    channelJoinV1(uId1.token, channelId.channelId);
    channelJoinV1(uId3.token, channelId.channelId);
    channelAddOwnerV1(uId2.token, channelId.channelId, uId3.authUserId);
    channelRemoveOwnerV1(uId1.token, channelId.channelId, uId3.authUserId);
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
    const expectedMember3 = {
      uId: uId3.authUserId,
      nameFirst: 'Person',
      nameLast: 'Thr',
      email: 'personthr@email.com',
      handleStr: 'personthr',
      profileImgUrl: expect.any(String),
    };
    expect(channelDetailsV1(uId1.token, channelId.channelId)).toStrictEqual(
      {
        name: 'abc',
        isPublic: true,
        ownerMembers: [expectedMember2],
        allMembers: [expectedMember2, expectedMember1, expectedMember3],
      }
    );
  });
  test('Deals with valid token, channelId and uId', () => {
    const uId1 = authRegisterV1('personone@email.com', 'passwordone', 'Person', 'One');
    const uId2 = authRegisterV1('persontwo@email.com', 'passwordtwo', 'Person', 'Two');
    const channelId1 = channelsCreateV1(uId1.token, 'abc', true);
    channelJoinV1(uId2.token, channelId1.channelId);
    channelAddOwnerV1(uId1.token, channelId1.channelId, uId2.authUserId);
    channelRemoveOwnerV1(uId2.token, channelId1.channelId, uId1.authUserId);
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
        allMembers: [expectedMember1, expectedMember2],
      }
    );
  });
});
