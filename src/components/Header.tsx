'use client';
import React from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header>
      <Navbar collapseOnSelect expand='lg' className='bg-body-secondary'>
        <Container>
          <Link href='/' className='navbar-brand'>
            Teste App
          </Link>

          <Navbar.Toggle aria-controls='responsive-navbar-nav' />
          <Navbar.Collapse id='responsive-navbar-nav'>
            <Nav>
              <Link href='/autores' className='nav-link'>
                Autores
              </Link>
              <Link href='/assuntos' className='nav-link'>
                Assuntos
              </Link>
              <Link href='/livros' className='nav-link'>
                Livros
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
