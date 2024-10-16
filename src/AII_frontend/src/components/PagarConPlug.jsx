import React, { useState } from 'react';
import { useCanister } from '@connect2ic/react';
import { useUser } from '../UserContext';
import '../styles/PagarConPlugStyles.css'; // Importa el archivo de estilos

const PagarConPlug = () => {
  const { principal } = useUser(); // Principal desde el contexto de usuario
  const [isPaying, setIsPaying] = useState(false);
  const [amount, setAmount] = useState(''); // Monto ingresado por el usuario
  const [selectedToken, setSelectedToken] = useState('ICP'); // Selección de token

  const predefinedRecipient = "tvggu-rti2w-hwwp4-efuir-mkqq6-xujb3-quzh5-ecbad-u62dy-slahw-nae"; // Destinatario predefinido
  const [AII_backend] = useCanister('AII_backend');

  const handleAutenticarYPagar = async () => {
    setIsPaying(true);
    try {
      if (!window.ic?.plug) {
        console.error('Plug Wallet no está instalado o disponible.');
        setIsPaying(false);
        return;
      }
      const isConnected = await window.ic.plug.isConnected();
      if (!isConnected) {
        const connectionResult = await window.ic.plug.requestConnect();
        if (!connectionResult) {
          throw new Error('Conexión cancelada o fallida');
        }
      }

      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Por favor, ingresa un monto válido.');
      }

      console.log('Principal del usuario conectado (desde contexto):', principal);

      if (selectedToken === 'ICP') {
        const transactionParams = {
          to: predefinedRecipient,
          amount: parseFloat(amount) * 100000000, // Convertir a e8s (ICP tiene 8 decimales)
        };
        const result = await window.ic.plug.requestTransfer(transactionParams);
        console.log('Resultado de la transacción ICP:', result);
      } 
      /*
      else if (selectedToken === 'ckBTC') {
        const balance = await getBalance();
        if (BigInt(parseFloat(amount) * 100000000) > balance) {
          throw new Error('Fondos insuficientes');
        }
        const recipientPrincipal = Principal.fromText(predefinedRecipient);
        const result = await AII_backend.transferTokens(
          recipientPrincipal,
          BigInt(parseFloat(amount) * 100000000)
        );
        console.log('Resultado de la transacción ckBTC:', result);
      }
      */
    } catch (error) {
      console.error('Error al intentar realizar el pago:', error);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="pagar-plug-container">
      <div className="pagar-form-group">
        <select
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value)}
          className="select-token"
          disabled // Desactivar la selección
        >
          <option value="ICP">ICP</option>
          {/* <option value="ckBTC">ckBTC</option> */}
        </select>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Monto en ${selectedToken}`}
          min="0"
          className="input-amount styled-input"
        />
      </div>
      <button
        onClick={handleAutenticarYPagar}
        className="autenticar-pagar-button"
        disabled={isPaying}
      >
        {isPaying ? 'Procesando...' : 'Autenticar y Pagar'}
      </button>
    </div>
  );
};

export default PagarConPlug;