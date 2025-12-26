import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";



const Login: React.FC = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // 🔹 Login de prueba (puedes conectar tu backend aquí después)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(""); // limpia error al escribir
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación local
        if (!formData.email || !formData.password) {
            setError("Por favor, completa todos los campos");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            // 🔹 LOGIN REAL CON SUPABASE
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) {
                setError("Correo o contraseña incorrectos");
                return;
            }

            // Login exitoso → redirigir
            navigate("/dashboard");

        } catch (err) {
            setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () =>
        alert("Funcionalidad de recuperación de contraseña (Simulado)");

    const handleDemoLogin = () =>
        setFormData({
            email: "demo@trustmarket.com",
            password: "demopassword123"
        });

    return (
<div className="pt-6 pb-6 w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden overflow-y-hidden">
            <div className="w-full max-w-md px-4">
                <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
                    <div className="text-center mb-8">
                        <button
                            onClick={() => navigate("/")}
                            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-medium text-sm transition-colors"
                        >
                            ← Volver al inicio
                        </button>

                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-2xl text-white font-bold">🔐</span>
                            </div>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
                            Bienvenido de nuevo
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                            Ingresa a tu cuenta TrustMarket
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="tu@email.com"
                                    className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    📧
                                </div>
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    placeholder="Ingresa tu contraseña"
                                    className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 pr-12"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        {/* Recordarme y Olvidé contraseña */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div
                                        className={`w-5 h-5 border-2 rounded transition-all ${rememberMe
                                                ? "bg-blue-600 border-blue-600"
                                                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                            }`}
                                    >
                                        {rememberMe && (
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                    Recordarme
                                </span>
                            </label>

                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors text-left sm:text-right"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        {/* 🔴 Mensaje de error */}
                        {error && (
                            <p className="text-red-500 text-center text-sm font-medium">
                                {error}
                            </p>
                        )}

                        {/* Botón Iniciar sesión */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Iniciando sesión...</span>
                                </>
                            ) : (
                                <>
                                    <span>🚀</span>
                                    <span>Iniciar Sesión</span>
                                </>
                            )}
                        </button>

                        {/* Botón Demo */}
                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            className="w-full border-2 border-green-500 text-green-600 dark:text-green-400 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                        >
                            <span>👤</span>
                            <span>Usar cuenta demo</span>
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                            Al iniciar sesión, aceptas nuestros{" "}
                            <a
                                href="#"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Términos de servicio
                            </a>{" "}
                            y{" "}
                            <a
                                href="#"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Política de privacidad
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;



