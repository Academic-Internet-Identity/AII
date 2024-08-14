import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnect, useCanister } from '@connect2ic/react';
import { ConnectButton, ConnectDialog } from '@connect2ic/react';
import '@connect2ic/core/style.css';
import '../styles/loginStyles.css';
import logo from '/logo-completo-utma.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const { isConnected, principal } = useConnect();
  const [AII_backend] = useCanister('AII_backend');
  const navigate = useNavigate();

  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [isDisabled, setIsDisabled] = useState(false); // Estado para controlar el bloqueo de campos

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nick') setNick(value);
    if (name === 'email') setEmail(value);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showToast = (message, type) => {
    setIsDisabled(true); // Bloquear los campos cuando se muestra un toast
    toast[type](message, {
      onClose: () => setIsDisabled(false) // Desbloquear los campos cuando el toast se cierra
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!principal) {
      showToast('Error: Principal is undefined', 'error');
      return;
    }

    if (!nick || !email) {
      showToast('Error: Todos los campos son obligatorios', 'warn');
      return;
    }

    if (!validateEmail(email)) {
      showToast('Error: Formato de email no válido', 'warn');
      return;
    }

    try {
      const response = await AII_backend.registrarse(nick, email);
      console.log('Respuesta del servidor:', response);
      if (response.startsWith('Error:')) {
        showToast(response, 'error');
      } else {
        navigate('/inicio');
      }
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      showToast('Error al registrar el usuario', 'error');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!principal) {
      showToast('Error: Principal is undefined', 'error');
      return;
    }

    try {
      const user = await AII_backend.getMyUser();
      console.log('Respuesta de getMyUser:', user);
      if (user && Object.keys(user).length > 0) {
        navigate('/inicio');
      } else {
        showToast('Usuario no registrado. Favor de registrarse.', 'warn');
      }
    } catch (error) {
      console.error('Error al verificar si el usuario está registrado:', error);
      showToast('Error al verificar si el usuario está registrado', 'error');
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Logo" className="login-logo" />
      <h1>Iniciar Sesión</h1>
      <ConnectButton />
      <ConnectDialog />
      <form className="login-form">
        <input
          type="text"
          name="nick"
          value={nick}
          onChange={handleInputChange}
          placeholder="Nickname"
          required
          className="form-input"
          disabled={isDisabled} // Bloquear el campo si isDisabled es true
        />
        <input
          type="email"
          name="email"
          value={email}
          onChange={handleInputChange}
          placeholder="Email"
          required
          className="form-input"
          disabled={isDisabled} // Bloquear el campo si isDisabled es true
        />
        <button onClick={handleRegister} className="form-button" disabled={isDisabled}>Registrar Usuario</button>
        <button onClick={handleLogin} className="form-button" disabled={isDisabled}>Login</button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Login;