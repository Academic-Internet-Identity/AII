import React, { useState } from 'react';
import { useCanister } from '@connect2ic/react';
import { Principal } from '@dfinity/principal';  // Asegúrate de importar Principal
import { useUser } from '../UserContext';  // Importa el contexto de usuario

const PagarConPlug = () => {
  const { principal } = useUser();  // Obtén el principal desde el contexto de usuario
  const [isPaying, setIsPaying] = useState(false);
  const [amount, setAmount] = useState(''); // Estado para el monto ingresado por el usuario
  const [selectedToken, setSelectedToken] = useState('ICP'); // Estado para seleccionar token

  const predefinedRecipient = "tvggu-rti2w-hwwp4-efuir-mkqq6-xujb3-quzh5-ecbad-u62dy-slahw-nae"; // Destinatario predefinido

  // Usa el hook useCanister para obtener el canister principal 'AII_backend'
  const [AII_backend] = useCanister('AII_backend');

  // Function to get the user's ckBTC balance
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

  // Function for payment handling (ICP & ckBTC)
  const handleAutenticarYPagar = async () => {
    setIsPaying(true); // Desactivar el botón de pago mientras se procesa

    try {
      // Verificar que Plug Wallet esté disponible para ICP
      if (!window.ic?.plug) {
        console.error('Plug Wallet no está instalado o disponible.');
        setIsPaying(false);
        return;
      }

      // Conectar a Plug Wallet si no está conectado
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

      // Imprime el principal obtenido desde el contexto de usuario
      console.log('Principal del usuario conectado (desde contexto):', principal);

      // Obtener el balance antes de la transacción
      const balance = await getBalance();
      if (BigInt(parseFloat(amount) * 100000000) > balance) {
        throw new Error('Fondos insuficientes');
      }

      // Lógica de transacción basada en el token seleccionado
      if (selectedToken === 'ICP') {
        // Transacción de ICP usando Plug Wallet
        const transactionParams = {
          to: predefinedRecipient,
          amount: parseFloat(amount) * 100000000,  // Convertir a e8s (ICP tiene 8 decimales)
        };
        const result = await window.ic.plug.requestTransfer(transactionParams);
        console.log('Resultado de la transacción ICP:', result);

      } else if (selectedToken === 'ckBTC') {
        // Convertir el predefinedRecipient a Principal
        const recipientPrincipal = Principal.fromText(predefinedRecipient);

        // Transacción de ckBTC usando la función `transferTokens` del canister 'AII_backend'
        const result = await AII_backend.transferTokens(recipientPrincipal, BigInt(parseFloat(amount) * 100000000));
        console.log('Resultado de la transacción ckBTC:', result);
      }

    } catch (error) {
      console.error('Error al intentar realizar el pago:', error);
    } finally {
      setIsPaying(false); // Reactivar el botón después del proceso
    }
  };

  return (
    <div className="pagar-plug-container">
      {/* Selección de token */}
      <select value={selectedToken} onChange={(e) => setSelectedToken(e.target.value)} className="select-token">
        <option value="ICP">ICP</option>
        <option value="ckBTC">ckBTC</option>
      </select>

      {/* Entrada de monto */}
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={`Monto en ${selectedToken}`}
        min="0"
        className="input-amount"
      />

      {/* Botón para autenticar y realizar el pago */}
      <button onClick={handleAutenticarYPagar} className="pagar-button" disabled={isPaying}>
        {isPaying ? 'Procesando...' : 'Autenticar y Pagar'}
      </button>
    </div>
  );
};

export default PagarConPlug;