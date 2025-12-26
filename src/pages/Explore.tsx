import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, User, Plus, Car, Building, Package,
  Menu, Search, Bell, MessageCircle,
  Filter, Settings, LogOut,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://uwzbrvzkbvnvwerxgylv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3emJydnprYnZudndlcnhneWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMDUyMTIsImV4cCI6MjA3ODc4MTIxMn0.wB42WQZ2prQltVuRx5VTRr0EtI1bIr8Nr4Ib--bTNYs"
);

const Explore: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const handleLogOut = () => navigate("/");
  const handleMyProfile = () => navigate("/my-profile");
  const handleCreatePost = () => navigate("/create-post");


  // -----------------------------
  // ⭐ FEED (nuevo)
  // -----------------------------
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // -----------------------------

  // Cerrar menú de perfil
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = [
    { name: "Vehículos", icon: Car, count: 12 },
    { name: "Propiedades", icon: Building, count: 8 },
    { name: "Hogar", icon: Package, count: 25 },
    { name: "Electrónicos", icon: Bell, count: 15 },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white overflow-hidden">

      {/* HEADER PRINCIPAL */}
      <header className="bg-blue-800 text-white p-4 w-full shadow-lg">
        <div className="w-full px-4">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <div className="flex items-center space-x-4">
              <button
                className="p-2 rounded-lg bg-blue-700 hover:bg-blue-600 transition-colors md:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu size={24} />
              </button>
              <h1
                className="text-2xl font-mono italic
             bg-gradient-to-r from-gray-400 via-blue-500 to-blue-700
             bg-[length:200%_100%] bg-left
             bg-clip-text text-transparent
             animate-text-on">
                TrustMarket
              </h1>
            </div>

            {/* Buscador Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar productos, categorías..."
                  className="w-full px-4 py-3 pl-12 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {/* Acciones usuario */}
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-lg bg-blue-700 hover:bg-blue-600 transition-colors relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
              </button>

              <button
                onClick={() => navigate("/chats")}
                className="p-2 rounded-lg bg-blue-700 hover:bg-blue-600 transition-colors">
                <MessageCircle size={20} />
              </button>

              <button onClick={handleCreatePost} className="bg-white text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center">
                <Plus size={18} className="mr-2" />
                Publicar
              </button>

              {/* Menu perfil */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-white text-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  B
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleMyProfile}
                      className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User size={18} />
                      <span>Mi perfil</span>
                    </button>

                    <button className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Settings size={18} />
                      <span>Configuración</span>
                    </button>

                    <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>

                    <button
                      onClick={handleLogOut}
                      className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
                    >
                      <LogOut size={18} />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buscador móvil */}
          <div className="mt-4 md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar en TrustMarket..."
                className="w-full px-4 py-3 pl-12 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* LAYOUT PRINCIPAL */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <aside
          className={`
            w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
            p-6 flex-col flex-none h-full transition-transform duration-300
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:flex fixed md:relative z-50
          `}
        >

          <button
            className="md:hidden absolute top-4 right-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Menu size={20} />
          </button>

          {/* Menú rápido */}
          <nav className="space-y-2 mb-8">
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold transition-colors">
              <Home size={20} />
              <span>Inicio</span>
            </button>
          </nav>

          {/* Categorías */}
          <div className="mb-6">
            <h2 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Categorías</h2>
            <div className="space-y-2">
              {categories.map((cat, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <cat.icon size={18} className="text-blue-600" />
                    <span>{cat.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

        </aside>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Sugerencias para ti</h2>
              <p className="text-gray-600 dark:text-gray-400">Productos basados en tus preferencias</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
              <Filter size={18} />
              <span>Filtros</span>
            </button>
          </div>

          {/* ----------------------------- */}
          {/* ⭐ NUEVA GRID CON POST REALES */}
          {/* ----------------------------- */}

          {loading ? (
            <p className="text-center text-gray-500">Cargando...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500">No hay publicaciones aún.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image_url || "/placeholder.png"}
                      className="w-full h-48 object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-4 text-center">
                    <div className="flex flex-col items-center mb-2">
                      <h3 className="font-bold text-lg truncate">{post.title}</h3>
                      <span className="text-blue-600 font-semibold mt-1">
                        ${post.price}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                      {post.description}
                    </p>

                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-500">{post.location}</span>
                      <button onClick={() => navigate(`/post/${post.id}`)} className="text-blue-600 text-sm font-medium hover:underline">
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Explore;
