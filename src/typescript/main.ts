export interface onlineUser {
  socketId: string;
  _id: string;
  name: string;
  email: string;
  image: string;
  connections: { connected: usr_and_key_in_array[] };
}

export interface onhandshakeMsg {
  user: {
    _id: string;
    name: string;
    email: string;
    image: string;
    connections: { connected: usr_and_key_in_array[] };
  };
}

type usr_and_key_in_array = {
  _key: string;
  user: { _id: string; name: string; email: string; image: string };
};
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
export interface onconnectionrequestMsg {
  sendTo: { _id: string; name: string; email: string; image: string };
  sentBy: onlineUser;
  _key: string;
}

export interface chat_message {
  sender: _ref;
  receiver: _ref;
  message: string;
  date_time: Date;
  // receiver_email: string;
  receiver_socketId: string;
}
export interface _ref{
  _type: string;
  _ref: string;
};