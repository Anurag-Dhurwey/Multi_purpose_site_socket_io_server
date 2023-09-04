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
interface user extends onlineUser{
    connections: {
        connected: usersMinData[];
        requests_got: usersMinData[];
        requests_sent: usersMinData[];
    };
    image: string;
    bio: string | null;
    desc: string | null;
    link: string | null;
}
export interface onconnectionrequestMsg{
    user:onlineUser;
    me:onlineUser;
    _key:string
}

export type usersMinData = {
    _key: string;
    userId: string;
    name: string;
    mail: string;
    img: string;
  };