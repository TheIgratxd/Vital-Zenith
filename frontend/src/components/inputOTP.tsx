import React, {
  useState,
  useRef,
  useMemo,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import "./InputOTP.css"; // Importa el archivo CSS

// Definición de las Props (propiedades) del componente
interface InputOTPProps {
  length?: number; // Opcional, por defecto 6
  onChange: (otp: string) => void;
  // Puedes añadir más, como 'disabled', 'error', etc.
}

// Componente funcional
const InputOTP: React.FC<InputOTPProps> = ({ length = 6, onChange }) => {
  // 1. Estado para almacenar el código OTP como un array de strings (un dígito por elemento)
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));

  // 2. Referencias para acceder directamente a los elementos input del DOM
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // 3. Manejar el cambio en cada input individual
  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;

    // Solo permitimos un solo dígito numérico (0-9)
    if (!/^\d*$/.test(value) || value.length > 1) {
      return;
    }

    // Clonamos el estado actual y actualizamos el dígito
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Unimos los dígitos para devolver el código completo al componente padre
    const finalOtp = newOtp.join("");
    onChange(finalOtp);

    // * Lógica para pasar el foco al siguiente input automáticamente
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 4. Manejar la pulsación de teclas (para ir hacia atrás con Backspace)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Si el input actual está vacío Y se pulsa Backspace,
      // movemos el foco al input anterior
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 5. Manejar el pegado (paste) del código completo
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain").slice(0, length);

    // Si la información pegada es numérica y tiene la longitud correcta o menor
    if (/^\d+$/.test(pasteData)) {
      const newOtp = new Array(length).fill("");

      // Llenamos el array con los dígitos pegados
      pasteData.split("").forEach((char, i) => {
        if (i < length) {
          newOtp[i] = char;
        }
      });

      setOtp(newOtp);
      onChange(newOtp.join(""));

      // Opcional: mover el foco al último o al siguiente input disponible
      const lastIndex = Math.min(pasteData.length - 1, length - 1);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  // 6. Generar los inputs a partir de la longitud
  const inputs = useMemo(() => {
    return new Array(length).fill(0).map((_, index) => (
      <input
        key={index}
        type="text"
        maxLength={1} // Solo se permite 1 dígito
        inputMode="numeric" // Teclado numérico en móviles
        autoComplete="off" // Desactiva autocompletado del navegador
        className="otp-input"
        value={otp[index]}
        onChange={(e) => handleChange(e, index)}
        onKeyDown={(e) => handleKeyDown(e, index)}
        onPaste={index === 0 ? handlePaste : undefined} // Solo permitimos pegar en el primer input
        ref={(el) => {
          inputRefs.current[index] = el;
        }} // Asignar la referencia
        // Opcional: autofocus en el primero
        autoFocus={index === 0}
      />
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, otp]); // Dependencias del useMemo

  return <div className="otp-container">{inputs}</div>;
};

export default InputOTP;
