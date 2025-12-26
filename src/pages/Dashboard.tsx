import React, { useEffect, useState } from "react";
import { Home, User, Settings, LogOut, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  kyc_verified: boolean;
  role: string;
}

const Dashboard: React.FC = () => {
  const [sidebarOpen, ] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [ , setUserEmail] = useState<string>("");

  const navigate = useNavigate();
  

  // Logout real
  const handleLogOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Cargar el perfil real desde Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        navigate("/login");
        return;
      }

      //Email desde supabase
      setUserEmail(user.email || "");

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("full_name, email, kyc_verified, role")
        .eq("id", user.id)
        .single();

      if (!error && profileData) {
        setProfile(profileData as Profile);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const menuItems = [
    { name: "Inicio", icon: <Home size={18} />, to: "/explore" },
    { name: "Perfil", icon: <User size={18} />, to: "/my-profile" },
    { name: "Estadísticas", icon: <BarChart2 size={18} />, to: "/stats" },
    { name: "Configuración", icon: <Settings size={18} />, to: "/settings" },
  ];

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-50 dark:bg-gray-900 text-gray-100 flex overflow-hidden">

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900/80 backdrop-blur-xl border-r border-gray-800 transition-all duration-300 fixed h-screen left-0 top-0 flex flex-col shadow-xl`}
      >
        {/* Menu */}
        <nav className="flex-1 mt-4 overflow-y-auto">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.to)}
              className="flex items-center w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
            >
              <span className="mr-3">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-800 p-4">
          <button
            onClick={handleLogOut}
            className="flex items-center space-x-2 text-gray-300 hover:text-red-500 transition"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >

        {/* Header corregido */}
        <header className="w-full flex items-center justify-between px-6 py-4 bg-[#0f172a]">
          <h1 className="text-white text-3xl font-bold">TrustMarket</h1>

          <div className="flex items-center gap-4">
            <div className="text-white text-lg flex items-center gap-2">
              <span>Bienvenido, {profile?.full_name}</span> 👋
            </div>

            <img
              src="https://i.pravatar.cc/40"
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-blue-500 shadow-md"
            />
          </div>
        </header>

        {/* KYC banner */}
        {!profile?.kyc_verified && (
          <div className="bg-yellow-200/20 border border-yellow-400/40 text-yellow-200 p-4 rounded-xl flex justify-between items-center m-6 shadow-lg backdrop-blur-xl">
            <span className="font-medium">
              Verifica tu identidad para operar con seguridad en TrustMarket.
            </span>
            <button
              onClick={() => navigate("/verify")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              Verificar
            </button>
          </div>
        )}

        {/* Dashboard cards */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800/70 p-6 rounded-2xl shadow-lg backdrop-blur-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">
              Estado KYC
            </h3>
            <p
              className={`text-3xl font-bold ${
                profile?.kyc_verified ? "text-green-400" : "text-red-400"
              }`}
            >
              {profile?.kyc_verified ? "Verificado" : "Pendiente"}
            </p>
          </div>

          <div className="bg-gray-800/70 p-6 rounded-2xl shadow-lg backdrop-blur-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">
              Tu correo
            </h3>
            <p className="text-xl text-blue-400">{profile?.email}</p>
          </div>

          <div className="bg-gray-800/70 p-6 rounded-2xl shadow-lg backdrop-blur-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Rol</h3>
            <p className="text-3xl font-bold text-purple-400">{profile?.role}</p>
          </div>
        </div>

        {/* Activity */}
        <section className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Actividad reciente
          </h3>
          <div className="bg-gray-800/70 p-6 rounded-xl shadow-lg backdrop-blur-lg">
            <ul className="space-y-3 text-gray-300 text-sm">
              <li>• Sesión iniciada correctamente</li>
              <li>• Perfil cargado desde Supabase</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
