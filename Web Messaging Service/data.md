```javascript
let data = {
    users: [
        {
            authUserId: 1,
            nameFirst: "MMMMMM",
            nameLast: "NNNNNN",
            email: "aaaa@gmail.com",
            handleStr: "mmmmmmnnnnnn",
            password: "abcdef123",
            globalPermissions: 1,
        },
        {
            authUserId: 2,
            nameFirst: "EEEEEEE",
            nameLast: "AAAA",
            email: "eeeee@gmail.com",
            handleStr: "eeeeeeeaaaa",
            password: "kjjfkjdsfh111",
            globalPermissions: 2,
        },
    ],
    channels: [
        {
            channelId: 1,
            channelName: "H11A",
            allMembers: [{
              uId: 1,
              email: "aaaa@gmail.com",
              nameFirst: "MMMMMM",
              nameLast: "NNNNNN",
              handleStr: "mmmmmmnnnnnn",
            }, 
            {
              uId: 2
              email: "eeeee@gmail.com",
              nameFirst: "EEEEEEE",
              nameLast: "AAAA",
              handleStr: "eeeeeeeaaaa",
            }],
            ownerMembers: [{
              uId: 1,
              email: "aaaa@gmail.com",
              nameFirst: "MMMMMM",
              nameLast: "NNNNNN",
              handleStr: "mmmmmmnnnnnn",
            }],
            isPublic: true,
            messages: [
                {
                    messageId: 1,
                    authUserId: 1,
                    message: "hello",
                    timeSent: 273283728,
                }
                {
                    messageId: 2,
                    authUserId: 2,
                    message: "hello",
                    timeSent: 273298123,
                }
            ],
            start: 0,
            end: 50,
        },
    ],
}

```

[Optional] short description: 
Users have their own Id associated with them. They also have their name and email and password stored. They also have their nickname stored. 

Channels hold information about the name of the channel, the users within the channel and the channel Id. It also holds information about whether the channel is public or private and who the owner members are. It also holds the start and end of the messages. 
