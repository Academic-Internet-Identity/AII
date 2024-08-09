import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnect, useCanister } from '@connect2ic/react';
import { ConnectButton, ConnectDialog } from '@connect2ic/react';
import { useUser } from '../UserContext'; // Import the custom user context
import '@connect2ic/core/style.css';
import '../styles/loginStyles.css';
import logo from '/logo-completo-utma.png';

function Login() {
  const { isConnected, principal: connectPrincipal } = useConnect();
  const [AII_backend] = useCanister('AII_backend');
  const { setPrincipal, resetUser } = useUser(); // Use the custom user context
  const navigate = useNavigate();

  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isConnected) {
      setPrincipal(connectPrincipal); // Set principal whenever the user is connected
    } else {
      resetUser(); // Reset user state when disconnected
    }
  }, [isConnected, connectPrincipal, setPrincipal, resetUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nick') setNick(value);
    if (name === 'email') setEmail(value);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!connectPrincipal) {
      setErrorMessage('Error: Principal is undefined');
      return;
    }

    if (!nick || !email) {
      setErrorMessage('Error: Todos los campos son obligatorios');
      return;
    }

    try {
      const response = await AII_backend.registrarse(nick, email);
      console.log('Respuesta del servidor:', response);
      if (response.startsWith('Error:')) {
        setErrorMessage(response);
      } else {
        navigate('/inicio');
      }
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      setErrorMessage('Error al registrar el usuario');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!connectPrincipal) {
      setErrorMessage('Error: Principal is undefined');
      return;
    }

    try {
      const user = await AII_backend.getMyUser();
      console.log('Respuesta de getMyUser:', user);
      if (user && Object.keys(user).length > 0) {
        navigate('/inicio');
      } else {
        setErrorMessage('Usuario no registrado. Favor de registrarse.');
      }
    } catch (error) {
      console.error('Error al verificar si el usuario está registrado:', error);
      setErrorMessage('Error al verificar si el usuario está registrado');
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Logo" className="login-logo" />
      <h1>Iniciar Sesión</h1>
      <ConnectButton />
      <ConnectDialog />
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form className="login-form">
        <input
          type="text"
          name="nick"
          value={nick}
          onChange={handleInputChange}
          placeholder="Nickname"
          required
          className="form-input"
        />
        <input
          type="email"
          name="email"
          value={email}
          onChange={handleInputChange}
          placeholder="Email"
          required
          className="form-input"
        />
        <button onClick={handleRegister} className="form-button">Registrar Usuario</button>
        <button onClick={handleLogin} className="form-button">Login</button>
      </form>
    </div>
  );
}

export default Login;