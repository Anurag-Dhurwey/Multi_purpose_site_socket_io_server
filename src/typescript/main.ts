export interface onlineUser{
    socketId:string;
    _id:string;
    name:string;
    email:string;
    image:string
}

export interface onhandshakeMsg{
    user:onlineUser
}
// interface user extends onlineUser{
//     connections: {
//         connected: usersMinData[];
//         requests_got: usersMinData[];
//         requests_sent: usersMinData[];
//     };
//     image: string;
//     bio: string | null;
//     desc: string | null;
//     link: string | null;
//     socketId:string;
// }
export interface onconnectionrequestMsg{
    sendTo:onlineUser;
    sentBy:onlineUser;
    _key:string
}

export type usersMinData = {
    _key: string;
    userId: string;
    name: string;
    email: string;
    image: string;
  };


 export interface chat_message {
  sender_id: string;
  receiver_id: string;
  message: string;
  date_time: Date;
  receiver_email:string;
  receiver_socketId:string;
}
