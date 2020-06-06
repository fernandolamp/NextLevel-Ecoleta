import React from 'react';
import ReactDOM from 'react-dom';

interface HeaderProps{
    title: string;
}
const Header: React.FC<HeaderProps> = (props) => {
    return(
        <header>
           Ecoleta {props.title} 
        </header>
    )
}

export default Header;