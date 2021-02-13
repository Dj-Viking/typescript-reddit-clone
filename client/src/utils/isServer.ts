//checking if something is being ran or queried on the server
export const isServer = () => typeof window === 'undefined';

//if window is defined we are not running on the server (false)
// window is undefined we are running on the server (true)