import React from 'react';
import styled from 'styled-components';

interface CHATBOX_I {
    show: boolean;
    sendMessage: (msg: string) => void;
    message: any;
}

const StyleDiv = styled.div`
    display: ${(props: { show: boolean }) => props.show ? 'block' : 'none'};
    width: 60vw;
    height: 80vh;
    background: #FFF;
    font-size: 20px;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #000;
    border-radius: 5px;
    user-select: none;
    .msgArea{
        height: 80%;
        padding: 10px;
        border: 1px solid;
        margin-bottom: 15px;
        overflow: auto;
    }
    .textArea{
        display: flex;
        justify-content: space-around;
        height: 50px;
        width: 100%;
        box-sizing: border-box;
        >input{
            width: calc(100% - 90px);
            font-size: 20px;
        }
        >button{
            width: 80px;
            height: 50px;
            background: lightgray;
            padding: 0;
            padding-left: 10px;
            border: 0;
            cursor: pointer;
        }
     }
`;

const ChatBox = ({ show, sendMessage, message }: CHATBOX_I) => {

    const [msg, setMsg] = React.useState('')
    const sendCallback = () => {
        if (msg) {
            sendMessage(msg);
            setMsg('');
        }
    }

    React.useEffect(() => {
        const enterSend = (e: any) => {
            if (e.keyCode === 13 && show) {
                sendCallback()
            }
        }
        window.addEventListener('keydown', enterSend);
        return () => {
            window.removeEventListener('keydown', enterSend);
        }
    }, [msg])

    return <StyleDiv show={show}>
        Message
        <section className='msgArea' >
            {
                message ? message.map((msg: any) => {
                    return (
                        <div style={{ background: msg.self ? 'lightblue' : 'white' }}> {`${msg.name}：${msg.message}`} </div>
                    )
                }) : null
            }
        </section>
        <section className='textArea' >
            <input type="text" value={msg} onChange={(e) => setMsg(e.target.value)} />
            <button onClick={sendCallback}>送出</button>
        </section>

    </StyleDiv >
}

export default ChatBox;

