import React from 'react';

function Header() {
  return (
    <header className="site-header">
      <a href="#top" className="logo" aria-label="На главную">
        FD
      </a>
      <nav className="nav" aria-label="Основная навигация">
        <a href="#about">О себе</a>
        <a href="#work">Подход</a>
        <a href="#cases">Кейсы</a>
        <a href="#contacts">Контакты</a>
      </nav>
    </header>
  );
}

export default Header;
