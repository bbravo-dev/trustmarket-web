import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Upload, ArrowLeft } from "lucide-react";

const VerifyIdentity: React.FC = () => {
  const [step, setStep] = useState(1);
  const [idUploaded, setIdUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
    else navigate("/dashboard");
  };


  const handleFinish = () => {
    alert("✅ Identidad verificada con éxito (modo demo)");
    navigate("/dashboard");
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <button onClick={handlePrev} className="text-gray-500 hover:text-blue-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">Verificación de Identidad</h2>
          <div></div>
        </div>

        {/* Indicador de progreso */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  s <= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 mx-2"></div>}
            </div>
          ))}
        </div>

        {/* Paso 1 */}
        {step === 1 && (
          <div className="text-center">
            <h3 className="text-lg font-medium mb-4">Sube tu documento de identidad</h3>
            <div
              className={`p-6 border-2 border-dashed rounded-xl cursor-pointer ${
                idUploaded
                  ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              onClick={() => setIdUploaded(true)}
            >
              {idUploaded ? (
                <CheckCircle size={40} className="text-green-500 mx-auto mb-2" />
              ) : (
                <Upload size={40} className="text-gray-400 mx-auto mb-2" />
              )}
              <p className="text-sm">
                {idUploaded
                  ? "Documento cargado correctamente"
                  : "Haz clic para subir una foto de tu cédula o pasaporte"}
              </p>
            </div>
            <button
              onClick={handleNext}
              disabled={!idUploaded}
              className={`mt-6 px-6 py-2 rounded-lg font-semibold ${
                idUploaded
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              Continuar
            </button>
          </div>
        )}

        {/* Paso 2 */}
        {step === 2 && (
          <div className="text-center">
            <h3 className="text-lg font-medium mb-4">Sube una selfie para validación</h3>
            <div
              className={`p-6 border-2 border-dashed rounded-xl cursor-pointer ${
                selfieUploaded
                  ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              onClick={() => setSelfieUploaded(true)}
            >
              {selfieUploaded ? (
                <CheckCircle size={40} className="text-green-500 mx-auto mb-2" />
              ) : (
                <Upload size={40} className="text-gray-400 mx-auto mb-2" />
              )}
              <p className="text-sm">
                {selfieUploaded
                  ? "Selfie cargada correctamente"
                  : "Haz clic para subir una selfie con buena iluminación"}
              </p>
            </div>
            <button
              onClick={handleNext}
              disabled={!selfieUploaded}
              className={`mt-6 px-6 py-2 rounded-lg font-semibold ${
                selfieUploaded
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              Continuar
            </button>
          </div>
        )}

        {/* Paso 3 */}
        {step === 3 && (
          <div className="text-center">
            <h3 className="text-lg font-medium mb-4">Confirmar información</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Estás a punto de completar la verificación de identidad.  
              Asegúrate de que los documentos subidos sean correctos.
            </p>
            <button
              onClick={handleFinish}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
            >
              Finalizar verificación
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyIdentity;
