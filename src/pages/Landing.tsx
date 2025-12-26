import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Zap } from "lucide-react";

const TrustMarket: React.FC = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState<string | null>(null);

  const handleHowItWorks = () => setOpenModal("funciona");
  const handleCategories = () => setOpenModal("categorias");
  const handleContact = () => setOpenModal("contacto");
  const handleClose = () => setOpenModal(null);

  const handleRegister = () => navigate("/Register");
  const handleLogin = () => navigate("/Login");
  const handleExplore = () => navigate("/Explore");

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("trustmarket-darkmode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("trustmarket-darkmode", darkMode.toString());
  }, [darkMode]);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div
        className={`h-screen w-screen overflow-auto ${darkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-blue-50 to-green-50 text-gray-900"
          }`}
      >
        {/* HEADER */}
        <header
          className={`w-full ${darkMode ? "bg-gray-800" : "bg-white"
            } shadow-sm sticky top-0 z-50`}
        >
          <div className="container mx-auto flex justify-between items-center px-4 py-3">
            <h1 className="text-xl md:text-2xl font-bold">
              <span className="text-blue-600 font-mono italic">TRUST</span>
              <span className="text-green-500 font-mono italic">MARKET</span>
            </h1>

            <div className="flex items-center gap-3 md:gap-6">
              <nav className="hidden md:flex gap-4 lg:gap-6">
                <a
                  href="#"
                  className={`font-medium hover:text-blue-600 transition-colors text-sm ${darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                >
                  Inicio
                </a>
                <a
                  href="#"
                  onClick={handleHowItWorks}
                  className={`font-medium hover:text-blue-600 transition-colors text-sm ${darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                >
                  Cómo funciona
                </a>
                <a
                  href="#"
                  onClick={handleCategories}
                  className={`font-medium hover:text-blue-600 transition-colors text-sm ${darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                >
                  Categorías
                </a>
                <a
                  href="#"
                  onClick={handleContact}
                  className={`font-medium hover:text-blue-600 transition-colors text-sm ${darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                >
                  Contacto
                </a>
              </nav>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg border transition-all duration-300 text-sm ${darkMode
                  ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                  : "border-gray-300 text-gray-800 hover:bg-gray-100"
                  }`}
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="flex items-center justify-center py-8 md:py-12 w-full">
          <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-16 px-4">
            {/* CONTENIDO PRINCIPAL */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                Compra y vende <span className="text-blue-600">sin riesgo</span>
              </h1>

              <p
                className={`text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 font-medium ${darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
              >
                Verificación KYC + pagos en escrow para tu seguridad
              </p>
              <div className="max-w-3xl ">
                {/* FEATURES */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8 justify-center lg:justify-start">
                  <div
                    className={`flex items-center p-3 md:p-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 ${darkMode ? "bg-gray-800" : "bg-white"
                      }`}
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg mr-2 md:mr-3">
                      K
                    </div>
                    <span className="font-semibold text-base md:text-lg">
                      Verificación KYC
                    </span>
                  </div>

                  <div
                    className={`flex items-center p-3 md:p-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 ${darkMode ? "bg-gray-800" : "bg-white"
                      }`}
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg mr-2 md:mr-3">
                      E
                    </div>
                    <span className="font-semibold text-base md:text-lg">
                      Pagos en Escrow
                    </span>
                  </div>
                </div>

                {/* BOTONES */}
                <div className="flex flex-col sm:grid-cols-3 sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8 justify-center lg:justify-start">
                  <button
                    onClick={handleRegister}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm md:text-base"
                  >
                    Registrarse
                  </button>

                  <button
                    onClick={handleLogin}
                    className={`font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border hover:scale-105 text-sm md:text-base ${darkMode
                      ? "bg-gray-800 border-blue-400 text-blue-400 hover:bg-gray-700"
                      : "bg-white border-blue-600 text-blue-600 hover:bg-gray-50"
                      }`}
                  >
                    Iniciar Sesión
                  </button>

                  <button
                    onClick={handleExplore}
                    className={`font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border-2 hover:scale-105 text-sm md:text-base ${darkMode
                      ? "border-blue-400 text-blue-400 hover:bg-gray-800"
                      : "border-blue-600 text-blue-600 hover:bg-blue-50"
                      }`}
                  >
                    Explorar
                  </button>
                </div>
              </div>
            </div>

            {/* ILUSTRACIÓN */}
            <div className="w-full lg:w-1/2 flex justify-center items-center mt-6 md:mt-8 lg:mt-0">
              <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg">
                <div
                  className={`w-full h-64 md:h-72 lg:h-80 rounded-2xl shadow-2xl flex items-center justify-center p-6 md:p-8 transition-all duration-1000 animate-float ${darkMode
                    ? "bg-gradient-to-br from-blue-700 to-green-600"
                    : "bg-gradient-to-br from-blue-600 to-green-500"
                    }`}
                >
                  <div className="text-center text-white">
                    <div className="text-4xl md:text-5xl lg:text-6xl mb-3 md:mb-4 animate-pulse">
                      🛡️
                    </div>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3">
                      Transacciones Seguras
                    </h3>
                    <p className="text-base md:text-lg opacity-95">
                      Tu dinero protegido en cada paso
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className={`py-12 md:py-16 lg:py-20 w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 lg:mb-16">
              ¿Por qué elegir <span className="text-blue-600">TrustMarket</span>?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 w-full max-w-6xl mx-auto">
              <div className={`text-center p-4 md:p-6 lg:p-8 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 lg:mb-6 transition-all duration-300 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'
                  }`}>
                  <span className="text-xl md:text-2xl lg:text-3xl">🔒</span>
                </div>
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 lg:mb-4">Seguridad Máxima</h3>
                <p className={`text-sm md:text-base lg:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Tus datos personales y financieros están protegidos con encriptación de última generación.
                </p>
              </div>

              <div className={`text-center p-4 md:p-6 lg:p-8 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 lg:mb-6 transition-all duration-300 ${darkMode ? 'bg-green-900' : 'bg-green-100'
                  }`}>
                  <span className="text-xl md:text-2xl lg:text-3xl">⚡</span>
                </div>
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 lg:mb-4">Transacciones Rápidas</h3>
                <p className={`text-sm md:text-base lg:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Procesamos tus operaciones en tiempo récord sin comprometer la seguridad.
                </p>
              </div>

              <div className={`text-center p-4 md:p-6 lg:p-8 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 lg:mb-6 transition-all duration-300 ${darkMode ? 'bg-purple-900' : 'bg-purple-100'
                  }`}>
                  <span className="text-xl md:text-2xl lg:text-3xl">👥</span>
                </div>
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 lg:mb-4">Comunidad Verificada</h3>
                <p className={`text-sm md:text-base lg:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Todos los usuarios pasan por rigurosos procesos de verificación de identidad.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          className={`w-full py-8 md:py-10 ${darkMode ? "bg-gray-900" : "bg-gray-800"
            } text-white`}
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0 text-center md:text-left">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">
                  <span className="text-blue-400">TRUST</span>
                  <span className="text-green-400">MARKET</span>
                </h2>
                <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-base">
                  Tu marketplace seguro de confianza
                </p>
              </div>
              <div className="flex gap-4 md:gap-6 lg:gap-8">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                >
                  Términos
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                >
                  Privacidad
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                >
                  Soporte
                </a>
              </div>
            </div>
            <div className="text-center text-gray-500 mt-6 md:mt-8">
              <p className="text-sm md:text-base">
                © 2025 TrustMarket. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* === MODALES === */}
      {openModal && (
        <div className="fixed backdrop-blur-lg inset-0 bg-black/60 flex items-center justify-center z-50 p-4 border border-white/20">
          <div
            className={`bg-white  dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative transition-all duration-300 scale-100 animate-fadeIn`}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
            >
              ✕
            </button>

            {/* Modal: Cómo funciona */}
            {openModal === "funciona" && (
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">
                  Cómo funciona TrustMarket
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  🔒 TrustMarket conecta compradores y vendedores mediante un
                  sistema de <strong>escrow</strong> (fideicomiso digital).
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 w-56">
                    <Shield className="mx-auto text-blue-600 mb-2" />
                    <h3 className="font-semibold mb-2">1. Publica</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Crea tu oferta o busca un servicio.
                    </p>
                  </div>
                  <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 w-56">
                    <Lock className="mx-auto text-blue-600 mb-2" />
                    <h3 className="font-semibold mb-2">2. Protege</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      El dinero se guarda en escrow hasta cumplir el acuerdo.
                    </p>
                  </div>
                  <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 w-56">
                    <Zap className="mx-auto text-blue-600 mb-2" />
                    <h3 className="font-semibold mb-2">3. Confirma</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Cuando ambas partes confirman, se liberan los fondos.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Categorías */}
            {openModal === "categorias" && (
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Categorías</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Explora los tipos de productos y servicios disponibles.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    "Electrónica",
                    "Servicios",
                    "Automotriz",
                    "Inmuebles",
                    "Freelance",
                    "Moda",
                    "Criptomonedas",
                    "Otros",
                  ].map((cat) => (
                    <div
                      key={cat}
                      className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 cursor-pointer transition"
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal: Contacto */}
            {openModal === "contacto" && (
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Contacto</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  ¿Tienes dudas o sugerencias? Envíanos un mensaje.
                </p>
                <form className="flex flex-col gap-3 max-w-md mx-auto">
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:border-blue-500 outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Tu correo"
                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:border-blue-500 outline-none"
                  />
                  <textarea
                    placeholder="Tu mensaje"
                    rows={3}
                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:border-blue-500 outline-none"
                  ></textarea>
                  <button className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
                    Enviar
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animaciones */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TrustMarket;
