import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden!");
      return;
    }

    setIsLoading(true);

    try {
      // 1️⃣ Crear usuario en Supabase Auth
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signupError) {
        alert("Error al registrar: " + signupError.message);
        setIsLoading(false);
        return;
      }

      const userId = signupData.user?.id;
      if (!userId) {
        alert("Error inesperado: No se obtuvo ID del usuario");
        setIsLoading(false);
        return;
      }

      // 2️⃣ Crear registro en tabla "profiles"
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId,
          full_name: formData.name,
          email: formData.email,
          kyc_verified: false,
        },
      ]);

      if (profileError) {
        alert("Cuenta creada pero error guardando el perfil");
        console.log(profileError);
      }

      alert("¡Cuenta creada con éxito!");
      navigate("/login");

    } catch (error) {
      console.log(error);
      alert("Ocurrió un error inesperado");
    }

    setIsLoading(false);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="pt-6 pb-6 w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden overflow-y-hidde">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700">

        {/* Header */}
        <div className="text-center mb-6">
          <button
            onClick={handleBackToHome}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 font-medium text-sm"
          >
            ← Volver al inicio
          </button>
          <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2">
            Crear cuenta
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-base">
            Únete a nuestra comunidad segura
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Ingresa tu nombre"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="tu@email.com"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="Mínimo 8 caracteres"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="Repite tu contraseña"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:-translate-y-0.5 text-base mt-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Registrando...
              </div>
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-base">
            ¿Ya tienes cuenta?{" "}
            <a
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Iniciar sesión
            </a>
          </p>
        </div>

        <div className="flex items-center justify-center mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-2">
            ✓
          </div>
          <span className="text-green-700 dark:text-green-400 text-sm">
            Tus datos están protegidos con encriptación de última generación
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
