import React, { useState } from 'react';
import { useCanister } from '@connect2ic/react';
import { Principal } from '@dfinity/principal';
import { useUser } from '../UserContext';

const PagarConPlug = () => {
  const { principal } = useUser(); // Principal desde el contexto de usuario
  const [isPaying, setIsPaying] = useState(false);
  const [amount, setAmount] = useState(''); // Monto ingresado por el usuario
  const [selectedToken, setSelectedToken] = useState('ICP'); // Selección de token

  const predefinedRecipient = "4f5th-k6ujl-wtly2-qhvso-62dig-f6kez-z46uq-s6oqd-lwltb-ddcfr-fqe"; // Destinatario predefinido

  const [AII_backend] = useCanister('AII_backend');

  // Función para obtener el balance de ckBTC
  const getBalance = async () => {
    try {
      const balance = await AII_backend.getBalance();
      console.log('Balance actual de ckBTC:', balance.toString());
      return balance;
    } catch (error) {
      console.error('Error al obtener el balance:', error);
      return 0;
    }
  };

  // Lógica de pago para ICP y ckBTC
  const handleAutenticarYPagar = async () => {
    setIsPaying(true);

    try {
      // Verificar si Plug Wallet está disponible
      if (!window.ic?.plug) {
        console.error('Plug Wallet no está instalado o disponible.');
        setIsPaying(false);
        return;
      }

      // Conectar Plug Wallet si no está conectado
      const isConnected = await window.ic.plug.isConnected();
      if (!isConnected) {
        const connectionResult = await window.ic.plug.requestConnect();
        if (!connectionResult) {
          throw new Error('Conexión cancelada o fallida');
        }
      }

      // Validar el monto ingresado
      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Por favor, ingresa un monto válido.');
      }

      console.log('Principal del usuario conectado (desde contexto):', principal);

      if (selectedToken === 'ICP') {
        // Lógica para pagos con ICP usando Plug Wallet
        const transactionParams = {
          to: predefinedRecipient,
          amount: parseFloat(amount) * 100000000, // Convertir a e8s (ICP tiene 8 decimales)
        };
        const result = await window.ic.plug.requestTransfer(transactionParams);
        console.log('Resultado de la transacción ICP:', result);
      } else if (selectedToken === 'ckBTC') {
        // Obtener balance antes de la transacción
        const balance = await getBalance();
        if (BigInt(parseFloat(amount) * 100000000) > balance) {
          throw new Error('Fondos insuficientes');
        }

        // Lógica para pagos con ckBTC
        const recipientPrincipal = Principal.fromText(predefinedRecipient);
        const result = await AII_backend.transferTokens(
          recipientPrincipal,
          BigInt(parseFloat(amount) * 100000000)
        );
        console.log('Resultado de la transacción ckBTC:', result);
      }
    } catch (error) {
      console.error('Error al intentar realizar el pago:', error);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="pagar-plug-container">
      <select
        value={selectedToken}
        onChange={(e) => setSelectedToken(e.target.value)}
        className="select-token"
      >
        <option value="ICP">ICP</option>
        <option value="ckBTC">ckBTC</option>
      </select>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={`Monto en ${selectedToken}`}
        min="0"
        className="input-amount"
      />

      <button
        onClick={handleAutenticarYPagar}
        className="pagar-button"
        disabled={isPaying}
      >
        {isPaying ? 'Procesando...' : 'Autenticar y Pagar'}
      </button>
    </div>
  );
};

export default PagarConPlug;