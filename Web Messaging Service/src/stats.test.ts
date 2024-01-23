import { sendWrapRequest, wrapClearRequest } from './testHelper';
import { channelInviteV3, channelJoinV3, channelLeaveV2, channelsCreateV1, messageSendV2, userStats, dmCreateV2, dmLeaveV2, dmRemoveV2, messageSendDmV2 } from './testHelpers';
import request from 'sync-request';
import { port, url } from './config.json';
import { dmRemoveV1 } from './dm';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
    wrapClearRequest();
});


describe('/user/stats/v1 tests', () => {
  describe('SUCCESS CASE', () => {
    test('test for channels and messages', () => {
    const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
        { email: 'user1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
    const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
        { email: 'user2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
    const user3 = sendWrapRequest('POST', '/auth/register/v3', {},
        { email: 'user3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'three' });


    const channel1 = channelsCreateV1(user1.token, 'channel 1', true)
    const channel2 = channelsCreateV1(user2.token, 'channel 2', true)
  
    messageSendV2(user1.token, channel1.channelId, 'message 1');
    channelJoinV3(user1.token, channel2.channelId)
    channelLeaveV2(user1.token, channel2.channelId);
    channelInviteV3(user2.token, channel2.channelId, user1.authUserId);
    messageSendV2(user1.token, channel2.channelId, 'message 2');

    const res = sendWrapRequest('GET', '/user/stats/v1', {token: user1.token}, {});

    const data = {
        userStats: {
          channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }, { numChannelsJoined: 1, timeStamp: expect.any(Number) }, { numChannelsJoined: 2, timeStamp: expect.any(Number) }, { numChannelsJoined: 1, timeStamp: expect.any(Number) }, { numChannelsJoined: 2, timeStamp: expect.any(Number) }],
          dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }],
          messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }, { numMessagesSent: 1, timeStamp: expect.any(Number) }, { numMessagesSent: 2, timeStamp: expect.any(Number) }],
          involvementRate: expect.any(Number),
        }
    }

    expect(res).toStrictEqual(data);
    });

    test('DM and messages', () => {

        const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
            { email: 'user1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
        const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
            { email: 'user2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
        const user3 = sendWrapRequest('POST', '/auth/register/v3', {},
            { email: 'user3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'three' });


        const dm1 = sendWrapRequest('POST', '/dm/create/v2', { token: user1.token },
        {
            uIds: [
            user2.authUserId,
            ]
        });

        const dm2 = sendWrapRequest('POST', '/dm/create/v2', { token: user3.token },
        {
            uIds: [
            user1.authUserId,
            ]
        });

        messageSendDmV2(user1.token, dm1.dmId, 'message 1');
        messageSendDmV2(user1.token, dm2.dmId, 'message 2');

        dmLeaveV2(user1.token, dm1.dmId);
        sendWrapRequest('DELETE', '/dm/remove/v2', {token: user3.token,}, {
            dmId: dm2.dmId,
        });

        const channel1 = channelsCreateV1(user1.token, 'channel 1', true)
        messageSendV2(user1.token, channel1.channelId, 'message 1');
        const res = sendWrapRequest('GET', '/user/stats/v1', {token: user1.token}, {});

        const data = {
            userStats: {
            channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }, { numChannelsJoined: 1, timeStamp: expect.any(Number) }],
            dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }, { numDmsJoined: 1, timeStamp: expect.any(Number) }, { numDmsJoined: 2, timeStamp: expect.any(Number) }, { numDmsJoined: 1, timeStamp: expect.any(Number) }, { numDmsJoined: 0, timeStamp: expect.any(Number) }],
            messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }, { numMessagesSent: 1, timeStamp: expect.any(Number) }, { numMessagesSent: 2, timeStamp: expect.any(Number) }, { numMessagesSent: 3, timeStamp: expect.any(Number) }],
            involvementRate: expect.any(Number),
            }
        }

        expect(res).toStrictEqual(data);
    });

    test('for no channel, dm or mesasge', () => {
        const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
            { email: 'user1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
        const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
            { email: 'user2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
        const user3 = sendWrapRequest('POST', '/auth/register/v3', {},
            { email: 'user3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'three' });

        const dm1 = sendWrapRequest('POST', '/dm/create/v2', { token: user1.token },
        {
            uIds: [
            user2.authUserId,
            ]
        });
 
        sendWrapRequest('DELETE', '/dm/remove/v2', {token: user1.token}, {
            dmId: dm1.dmId,
        });
 
        const res = sendWrapRequest('GET', '/user/stats/v1', {token: user1.token}, {});

        const data = {
            userStats: {
            channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }],
            dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }, { numDmsJoined: 1, timeStamp: expect.any(Number) }, { numDmsJoined: 0, timeStamp: expect.any(Number) }],
            messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }],
            involvementRate: 0,
            }
        };

        expect(res).toStrictEqual(data);
    });

    test('tests for involvement greater than 1', () => {
        const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
            { email: 'user1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
        const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
            { email: 'user2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
        const user3 = sendWrapRequest('POST', '/auth/register/v3', {},
            { email: 'user3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'three' });

        const dm1 = sendWrapRequest('POST', '/dm/create/v2', { token: user1.token },
        {
            uIds: [
            user2.authUserId,
            ]
        });

        const messageResponse = request('POST', SERVER_URL + '/message/senddm/v2',
            { headers: { token: user1.token }, json: { dmId: dm1.dmId, message: 'message 1' } });
        
        const message = JSON.parse(messageResponse.getBody('utf8').toString());

        request('DELETE', SERVER_URL + '/message/remove/v2',
            { headers: { token: user1.token }, qs: { messageId: message.messageId } });
    
        const res = sendWrapRequest('GET', '/user/stats/v1', {token: user1.token}, {});

        const data = {
            userStats: {
            channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }],
            dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }, { numDmsJoined: 1, timeStamp: expect.any(Number) }],
            messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }, { numMessagesSent: 1, timeStamp: expect.any(Number) },{ numMessagesSent: 0, timeStamp: expect.any(Number) }],
            involvementRate: 0.5,
            }
        }

        expect(res).toStrictEqual(data);
        });
    });

    describe('FAIL CASES', () => {
        test('test for invalid token', () => {
        const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
            { email: 'user1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
        const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
            { email: 'user2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
        const user3 = sendWrapRequest('POST', '/auth/register/v3', {},
            { email: 'user3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'three' });

        const res = sendWrapRequest('GET', '/user/stats/v1', {token: 'abcdeabcdeabcdeabcde'}, {});

        expect(res).toStrictEqual(403);
        });
    });
});

describe('/users/stats/v1 tests', () => { 
    describe('SUCCESS CASES', () => {
        test('test for channel and messages', () => {
            const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
                { email: 'user1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
            const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
                { email: 'user2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
            const user3 = sendWrapRequest('POST', '/auth/register/v3', {},
                { email: 'user3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'three' });

            const channel1 = channelsCreateV1(user1.token, 'channel 1', true);
            const channel2 = channelsCreateV1(user2.token, 'channel 2', true);

            const messageResponse = request('POST', SERVER_URL + '/message/send/v2',
                { headers: { token: user1.token }, json: { channelId: channel1.channelId, message: 'message 1' } });
            const message = JSON.parse(messageResponse.getBody('utf8').toString());
            channelJoinV3(user1.token, channel2.channelId)
            channelLeaveV2(user1.token, channel2.channelId);
            channelInviteV3(user2.token, channel2.channelId, user1.authUserId);
            messageSendV2(user1.token, channel2.channelId, 'message 2');

            request('DELETE', SERVER_URL + '/message/remove/v2',
                { headers: { token: user1.token }, qs: { messageId: message.messageId } });

            const res = sendWrapRequest('GET', '/users/stats/v1', {token: user1.token}, {});
            const data = {
                workspaceStats: {
                channelsExist: [{ numChannelsExist: 0, timeStamp: expect.any(Number) }, { numChannelsExist: 1, timeStamp: expect.any(Number) }, { numChannelsExist: 2, timeStamp: expect.any(Number) }],
                dmsExist: [{ numDmsExist: 0, timeStamp: expect.any(Number) }],
                messagesExist: [{ numMessagesExist: 0, timeStamp: expect.any(Number) }, { numMessagesExist: 1, timeStamp: expect.any(Number) }, { numMessagesExist: 2, timeStamp: expect.any(Number) }, { numMessagesExist: 1, timeStamp: expect.any(Number) }],
                utilizationRate: expect.any(Number),
                }
            };

            expect(res).toStrictEqual(data);
        });
    
        test('test for DMs and messages', () => {
            const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
                { email: 'user1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
            const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
                { email: 'user2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
            const user3 = sendWrapRequest('POST', '/auth/register/v3', {},
                { email: 'user3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'three' });

            const dm1 = sendWrapRequest('POST', '/dm/create/v2', { token: user1.token },
            {
                uIds: [
                user2.authUserId,
                ]
            });
            const dm2 = sendWrapRequest('POST', '/dm/create/v2', { token: user3.token },
            {
                uIds: [
                user1.authUserId,
                ]
            });

            messageSendDmV2(user1.token, dm1.dmId, 'message 1');
            messageSendDmV2(user1.token, dm2.dmId, 'message 2');

            dmLeaveV2(user1.token, dm1.dmId);
            sendWrapRequest('DELETE', '/dm/remove/v2', {token: user3.token,}, {
                dmId: dm2.dmId,
            });
            messageSendDmV2(user2.token, dm1.dmId, 'message 3');

            const res = sendWrapRequest('GET', '/users/stats/v1', {token: user1.token}, {});
            const data = {
                workspaceStats: {
                channelsExist: [{ numChannelsExist: 0, timeStamp: expect.any(Number) }],
                dmsExist: [{ numDmsExist: 0, timeStamp: expect.any(Number) }, { numDmsExist: 1, timeStamp: expect.any(Number) }, { numDmsExist: 2, timeStamp: expect.any(Number) }, { numDmsExist: 1, timeStamp: expect.any(Number) }],
                messagesExist: [{ numMessagesExist: 0, timeStamp: expect.any(Number) }, { numMessagesExist: 1, timeStamp: expect.any(Number) }, { numMessagesExist: 2, timeStamp: expect.any(Number) }, { numMessagesExist: 1, timeStamp: expect.any(Number) }, { numMessagesExist: 2, timeStamp: expect.any(Number) }],
                utilizationRate: expect.any(Number),
                }
            };

            expect(res).toStrictEqual(data);
        });
    });
    
    describe('fail cases', () => {
        test('Test invalid token', () => {
            const user1 = sendWrapRequest('POST', '/auth/register/v3', {},
                { email: 'user1@example.com', password: 'passwordone', nameFirst: 'Person', nameLast: 'One' });
            const user2 = sendWrapRequest('POST', '/auth/register/v3', {},
                { email: 'user2@example.com', password: 'passwordtwo', nameFirst: 'Persontwo', nameLast: 'Two' });
            const user3 = sendWrapRequest('POST', '/auth/register/v3', {},
                { email: 'user3@example.com', password: 'passwordthree', nameFirst: 'Personthree', nameLast: 'three' });

            const res = sendWrapRequest('GET', '/users/stats/v1', {token: 'abcdeabcdeabcdeabcde'}, {});    
            expect(res).toStrictEqual(403);
        });
    });
});