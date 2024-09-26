import React, { useState } from 'react';

const PagarConPlug = () => {
  const [isPaying, setIsPaying] = useState(false);
  const [amount, setAmount] = useState(''); // Estado para el monto ingresado por el usuario
  const [selectedToken, setSelectedToken] = useState('ICP'); // Estado para seleccionar token

  const predefinedRecipient = "tvggu-rti2w-hwwp4-efuir-mkqq6-xujb3-quzh5-ecbad-u62dy-slahw-nae"; // Destinatario predefinido

  // Información de los tokens disponibles
  const tokens = {
    ICP: {
      id: '',  // ICP no necesita un canister específico
    },
    ckBTC: {
      id: 'mxzaz-hqaaa-aaaar-qaada-cai', // Canister ID para ckBTC
      standard: 'ICRC1' // Estándar del token ckBTC
    },
  };

  // Función para autenticar y realizar el pago
  const handleAutenticarYPagar = async () => {
    setIsPaying(true); // Desactivar el botón de pago mientras se procesa

    try {
      // Verificar que Plug Wallet esté disponible
      if (!window.ic?.plug) {
        console.error('Plug Wallet no está instalado o disponible.');
        setIsPaying(false);
        return;
      }

      // Verificar si Plug está conectado, si no, solicitar conexión
      const isConnected = await window.ic.plug.isConnected();
      if (!isConnected) {
        const connectionResult = await window.ic.plug.requestConnect();
        if (!connectionResult) {
          throw new Error('Conexión cancelada o fallida');
        }
      }

      // Validar el monto ingresado por el usuario
      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Por favor, ingresa un monto válido.');
      }

      // Configurar los parámetros de la transacción dependiendo del token seleccionado
      if (selectedToken === 'ICP') {
        // Transacción de ICP
        const transactionParams = {
          to: predefinedRecipient,
          amount: parseFloat(amount) * 100000000,  // Convertir a e8s (ICP tiene 8 decimales)
        };
        await window.ic.plug.requestTransfer(transactionParams);
      } else if (selectedToken === 'ckBTC') {
        // Transacción de ckBTC usando ICRC-1 estándar
        const transactionParams = {
          to: predefinedRecipient,
          strAmount: amount,  // El monto debe estar en formato string para ckBTC
          token: tokens.ckBTC.id,  // Canister ID para ckBTC
          standard: tokens.ckBTC.standard,  // Estándar de ckBTC
          // opts es opcional, si no deseas especificar el fee o memo puedes dejarlo vacío
          opts: {
            memo: "ckBTC payment", // Memo opcional para la transacción
          },
        };
        console.log("Enviando transferencia ckBTC:", transactionParams);
        const result = await window.ic.plug.requestTransferToken(transactionParams);
        console.log("Resultado de la transferencia:", result);
      }

    } catch (error) {
      console.error('Error al intentar realizar el pago con Plug:', error);
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