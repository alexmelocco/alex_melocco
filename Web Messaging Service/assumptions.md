Assumptions 
1. Start value of a channel cant be negative (for channelMessagesV1).
2. All arguments passed into functions are of the correct type.
3. uId can be the same as authUserId for userProfile but not for channelInviteV1.
4. channelMessagesV1 will have messages to access even though there is no function that creates messages.
5. The order in which the members/owners of a channel are stored does not matter.
6. Security measures for preventing data access are not necessary.
