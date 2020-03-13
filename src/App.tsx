import React from 'react';
import webSocket from 'socket.io-client';
// import fetch from 'node-fetch';
import './App.css';

import User from './components/User'
import ChatBox from './components/ChatBox'


const App: React.FC = () => {

  const [ws, setWs] = React.useState<any>(null)
  const [user, setUser] = React.useState('');
  const [message, setMessage] = React.useState<any>([]);

  const connectWebSocket = (name: string) => {

    //開啟
    if (ws) {
      fetch('http://10.41.15.72:8000/login', {
        headers: new Headers({
          'Content-Type': 'application/json; charset=UTF-8'
        }),
        method: 'POST',
        body: JSON.stringify({
          username: name,
        }),
        credentials: 'include', // include, same-origin, *omit.
      }).then(d => d.json())
        .then(d => {
          if (d.success) {
            setUser(d.data.name);
            ws.emit('online');
          } else {
            alert(d.message);
          }
        });
    }
  }

  const addMsg = (msg: { name: string, message: string, self: boolean }) => {
    setMessage((prev: { name: string, message: string, self: boolean }[]) => {
      const newMsgs = [...prev];
      return [...newMsgs, msg];
    })
  }

  const initWebSocket = () => {
    //對 getMessage 設定監聽，如果 server 有透過 getMessage 傳送訊息，將會在此被捕捉

    ws.on('getMessageLess', (msg: any) => {
      if (msg) {
        console.log(msg)
        addMsg({ ...msg, self: false });
      }
    })

    ws.on('online', () => {
      console.log('get online');
      fetch('http://10.41.15.72:8000/online', {
        headers: new Headers({
          'Content-Type': 'application/json; charset=UTF-8'
        }),
        method: 'GET',
        credentials: 'include', // include, same-origin, *omit.
      }).then(d => d.json())
        .then(d => {
          if (d.success) {
            console.log(d);
          }
        });
    })
  }


  React.useEffect(() => {

    if (ws) {
      //設定監聽
      initWebSocket();
    }
    else {
      const weso = webSocket(`http://10.41.15.72:8000`)
      setWs(weso);
      fetch('http://10.41.15.72:8000/loginStatus', {
        headers: new Headers({
          'Content-Type': 'application/json; charset=UTF-8'
        }),
        method: 'GET',
        credentials: 'include', // include, same-origin, *omit.
      }).then(d => d.json())
        .then(d => {
          if (d.success) {
            console.log(d);
            setUser(d.data.name);
            weso.emit('online');
          }
        });
    }
  }, [ws])

  const userRef: any = React.useRef();



  const sendMessage = (msg: string) => {
    addMsg({ name: user, message: msg, self: true });
    ws.emit('getMessage', { name: user, message: msg });
  }


  return (
    <div className="App">
      <User ref={userRef} show={!user ? true : false} setUser={(name: string) => connectWebSocket(name)} />
      <ChatBox show={user ? true : false} message={message} sendMessage={sendMessage} />
    </div>
  )

}

export default App;
