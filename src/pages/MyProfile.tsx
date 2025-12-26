import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertTriangle,
  User,
  Shield,
  CreditCard,
  Settings,
  Lock,
  HelpCircle,
  FileText,
  Edit,
  LogOut,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  kyc_verified: boolean;
  role: string;
}





const MyProfile: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  // local simplified user object for UI fields (name, email, phone, country)
  const [user, setUser] = useState<{ name: string; email: string; phone?: string; country?: string }>({
    name: "",
    email: "",
    phone: "",
    country: "",
  });
  const [userId, setUserId] = useState<string | null>(null);

  // editing state & temp copy
  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState<{ name: string; email: string; phone?: string; country?: string }>({
    name: "",
    email: "",
    phone: "",
    country: "",
  });

  // Cargar el perfil real desde Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user;

      if (!authUser) {
        navigate("/login");
        return;
      }

      setUserId(authUser.id);

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("full_name, email, kyc_verified, role")
        .eq("id", authUser.id)
        .single();

      if (!error && profileData) {
        setProfile(profileData as Profile);
      }

      // populate local user object for UI (use profile if available, otherwise auth email)
      setUser({
        name: (profile?.full_name as string) || (profileData && (profileData.full_name as string)) || authUser.email || "",
        email: (profile?.email as string) || (profileData && (profileData.email as string)) || authUser.email || "",
        phone: undefined,
        country: undefined,
      });

      // ensure tempUser matches initial user
      setTempUser({
        name: (profile?.full_name as string) || (profileData && (profileData.full_name as string)) || authUser.email || "",
        email: (profile?.email as string) || (profileData && (profileData.email as string)) || authUser.email || "",
        phone: undefined,
        country: undefined,
      });

      setIsLoading(false);
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleKYC = () => navigate("/verify");

  const handleEditToggle = () => {
    if (isEditing) {
      // cancel: reset temp to current user
      setTempUser({ name: user.name, email: user.email, phone: user.phone, country: user.country });
      setIsEditing(false);
    } else {
      // start editing
      setTempUser({ name: user.name, email: user.email, phone: user.phone, country: user.country });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    // optimistic UI update; also attempt to save to Supabase profiles table if userId exists
    setUser({ name: tempUser.name, email: tempUser.email, phone: tempUser.phone, country: tempUser.country });
    setIsEditing(false);

    if (userId) {
      try {
        await supabase
          .from("profiles")
          .update({
            full_name: tempUser.name,
            email: tempUser.email,
          })
          .eq("id", userId);
        // optionally refetch profile or setProfile if you want to keep profile state in sync
      } catch (err) {
        // Silently fail in demo; restore previous state if needed
        console.error("Failed to save profile", err);
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
      <div className="w-full flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <User className="text-blue-600" />
              Mi Perfil
            </h2>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Volver al Dashboard
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Sección: Información Personal */}
              <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Edit className="text-blue-600" /> Información Personal
                  </h3>
                  {!isEditing ? (
                    <button
                      onClick={handleEditToggle}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={handleSave}
                        className="text-sm text-green-600 hover:underline"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["name", "email", "phone", "country"].map((field) => (
                    <div key={field}>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold capitalize">
                        {field === "name"
                          ? "Nombre"
                          : field === "email"
                          ? "Correo electrónico"
                          : field === "phone"
                          ? "Teléfono"
                          : "País"}
                      </p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={(tempUser as any)[field] ?? ""}
                          onChange={(e) =>
                            setTempUser({ ...tempUser, [field]: e.target.value })
                          }
                          className="w-full mt-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white mt-1">
                          {(user as any)[field] ?? ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección: Verificación KYC */}
              <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
                  <Shield className="text-blue-600" /> Verificación KYC
                </h3>

                {profile?.kyc_verified ?(
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle /> <span>Tu identidad ha sido verificada ✅</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <AlertTriangle /> <span>No verificado</span>
                    </div>
                    <button
                      onClick={handleKYC}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-all"
                    >
                      Verificar mi identidad
                    </button>
                  </div>
                )}
              </div>

              {/* Sección: Métodos de pago */}
              <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
                  <CreditCard className="text-blue-600" /> Métodos de pago
                </h3>

                {profile?.kyc_verified ? (
                  <div className="space-y-4">
                    {/* Tarjetas guardadas */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                            alt="MasterCard"
                            className="w-10 h-6 object-contain"
                          />
                          <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                            **** **** **** 5678
                          </p>
                        </div>
                        <button className="text-red-500 hover:text-red-600 text-sm font-semibold">
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Botón para añadir nueva tarjeta */}
                    <button
                      onClick={() => alert("🔧 Próximamente podrás añadir tus tarjetas aquí")}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <CreditCard size={18} /> Añadir nueva tarjeta
                    </button>

                    {/* Opción de pago con crypto */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                        💠 Pagar con crypto
                      </h4>
                      <button
                        onClick={() => alert("💎 Pronto disponible 🚀")}
                        className="relative overflow-hidden group bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-[1.02] text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-all"
                      >
                        <span className="relative z-10">Conectar wallet</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                    ⚠️ Verifica tu identidad antes de añadir métodos de pago.
                  </p>
                )}
              </div>

              {/* Sección: Preferencias */}
              <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
                  <Settings className="text-blue-600" /> Preferencias
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Cambiar idioma, notificaciones, o tema próximamente.
                </p>
              </div>

              {/* Sección: Seguridad */}
              <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
                  <Lock className="text-blue-600" /> Seguridad
                </h3>
                <div className="flex flex-col gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Cambiar contraseña
                  </button>
                  <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Cerrar sesión en todos los dispositivos
                  </button>
                </div>
              </div>

              {/* Soporte */}
              <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
                  <HelpCircle className="text-blue-600" /> Soporte
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  ¿Tienes problemas con tu cuenta?
                </p>
                <button className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  Contactar soporte
                </button>
              </div>

              {/* Legal */}
              <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
                  <FileText className="text-blue-600" /> Legal
                </h3>
                <div className="flex flex-col text-sm text-gray-600 dark:text-gray-400 gap-2">
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">
                    Términos de servicio
                  </a>
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">
                    Política de privacidad
                  </a>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer."
                        )
                      ) {
                        alert("Cuenta eliminada (demo)");
                      }
                    }}
                    className="text-red-500 hover:text-red-600 font-semibold mt-2 flex items-center gap-1"
                  >
                    <LogOut size={16} /> Eliminar mi cuenta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
