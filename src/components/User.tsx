import React from 'react';
import styled from 'styled-components';

interface USER_I {
    show: boolean;
    setUser: (name: string) => void;
}

const StyleDiv = styled.div`
    display: ${(props: { show: boolean }) => props.show ? 'block' : 'none'};
    width: 200px;
    height: 200px;
    background: #FFF;
    font-size: 20px;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #000;
    border-radius: 5px;
    user-select: none;
    >span{
        display: block;
        margin: 10px 0;
    }
    .userName{
        display: block;
        height: 50px;
        width: 180px;
        box-sizing: border-box;
        font-size: 20px;
    }
    .submit{
        width: 80px;
        height: 50px;
        background: lightgray;
        border: 0;
        margin: 10px 0;
        cursor: pointer;
    }
`

const User = React.forwardRef(({ show, setUser }: USER_I, ref) => {


    const [name, setName] = React.useState('');


    React.useImperativeHandle(ref, () => ({
        value: name
    }));

    const onSubmit = () => {
        if (name) {
            setUser(name);
        } else {
            alert("請輸入名稱");
        }
    }
    return (
        <StyleDiv show={show} >
            <span>
                設定使用者名稱
            </span>
            <input type="text" className='userName' onChange={(e) => setName(e.target.value)} />
            <button className='submit' onClick={onSubmit}>確認</button>
        </StyleDiv>
    )
})

export default User;