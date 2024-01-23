import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
import { authRegisterV1, channelsCreateV1, channelDetailsV1 } from './testHelpers';

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { json: {} });
});

describe('Testing /channels/create/v3', () => {
  test('Deals with channel name length less than 1', () => {
    const uId = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const nameTooShort = '';
    expect(channelsCreateV1(uId.token, nameTooShort, true)).toStrictEqual(400);
  });
  test('Deals with channel name length more than 20', () => {
    const uId = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const nameTooLong1 = 'abcdefghijklmnopqrstuvwxyz';
    const nameTooLong2 = 'this_channel_name_is_also_too_long';
    expect(channelsCreateV1(uId.token, nameTooLong1, true)).toStrictEqual(400);
    expect(channelsCreateV1(uId.token, nameTooLong2, true)).toStrictEqual(400);
  });
  test('Deals with invalid token', () => {
    const uId = authRegisterV1('aa@gmail.com', 'aaaaaa', 'aa', 'aaaaaaa');
    const uIdMissing = uId + 1;
    expect(channelsCreateV1(uIdMissing.token, 'abc', true)).toStrictEqual(403);
  });
  test('Deals with valid channel creation and adding a user automatically', () => {
    const uId = authRegisterV1('personone@email.com', 'passwordone', 'Person', 'One');
    const channelId = channelsCreateV1(uId.token, 'valid_channel_name', true);
    const expectedMember = {
      uId: uId.authUserId,
      nameFirst: 'Person',
      nameLast: 'One',
      email: 'personone@email.com',
      handleStr: 'personone',
      profileImgUrl: expect.any(String),
    };
    expect(channelDetailsV1(uId.token, channelId.channelId)).toStrictEqual({ name: 'valid_channel_name', isPublic: true, ownerMembers: [expectedMember], allMembers: [expectedMember] });
  });
  test('Deals with creation of multiple valid channels and adding users automatically', () => {
    const uId1 = authRegisterV1('personone@email.com', 'passwordone', 'Person', 'One');
    const channelId1 = channelsCreateV1(uId1.token, 'first_channel_name', true);
    const expectedMember1 = {
      uId: uId1.authUserId,
      nameFirst: 'Person',
      nameLast: 'One',
      email: 'personone@email.com',
      handleStr: 'personone',
      profileImgUrl: expect.any(String),
    };
    expect(channelDetailsV1(uId1.token, channelId1.channelId)).toStrictEqual({ name: 'first_channel_name', isPublic: true, ownerMembers: [expectedMember1], allMembers: [expectedMember1] });
    const channelId2 = channelsCreateV1(uId1.token, 'second_channel_name', false);
    expect(channelDetailsV1(uId1.token, channelId2.channelId)).toStrictEqual({ name: 'second_channel_name', isPublic: false, ownerMembers: [expectedMember1], allMembers: [expectedMember1] });
    const uId2 = authRegisterV1('persontwo@email.com', 'passwordtwo', 'Person', 'Two');
    const channelId3 = channelsCreateV1(uId2.token, 'third_channel_name', true);
    const expectedMember2 = {
      uId: uId2.authUserId,
      nameFirst: 'Person',
      nameLast: 'Two',
      email: 'persontwo@email.com',
      handleStr: 'persontwo',
      profileImgUrl: expect.any(String),
    };
    expect(channelDetailsV1(uId2.token, channelId3.channelId)).toStrictEqual({ name: 'third_channel_name', isPublic: true, ownerMembers: [expectedMember2], allMembers: [expectedMember2] });
  });
});
