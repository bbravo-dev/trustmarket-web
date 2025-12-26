import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { uploadImage } from "../lib/uploadimages";

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🟦 Cargar el post y verificar usuario
  useEffect(() => {
    if (!id || id.length !== 36) {
      setError("ID de publicación inválido (no es un UUID)");
      setLoading(false);
      return;
    }

    const loadPost = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("ID recibido:", id);

        // Verificar usuario autenticado
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          setError("Debes iniciar sesión para editar una publicación");
          setLoading(false);
          return;
        }
        setUserId(authData.user.id);

        // Cargar la publicación
        const { data, error: postError } = await supabase
          .from("posts")
          .select("*")
          .eq("id", id.trim())
          .single();

        if (postError) {
          console.error("Error al cargar post:", postError);
          setError("No se pudo cargar la publicación");
          setLoading(false);
          return;
        }

        if (!data) {
          setError("Publicación no encontrada");
          setLoading(false);
          return;
        }

        // Verificar dueño del post
        if (data.user_id !== authData.user.id) {
          setError("No tienes permiso para editar esta publicación");
          setLoading(false);
          return;
        }

        // Establecer datos
        setTitle(data.title || "");
        setDescription(data.description || "");
        setPrice(data.price?.toString() || "");
        setCategory(data.category || "");
        setImageUrl(data.image_url);
        
      } catch (err: any) {
        console.error("Error inesperado:", err);
        setError("Ocurrió un error al cargar la publicación");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  // 🟦 Actualizar post
  const handleUpdate = async () => {
    if (!id || id.length !== 36) {
      alert("ID inválido");
      return;
    }

    if (!title.trim()) {
      alert("El título es obligatorio");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("El precio debe ser un número mayor a 0");
      return;
    }

    if (!userId) {
      alert("No estás autenticado");
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      let finalImageUrl = imageUrl;

      // Subir imagen nueva
      if (newImageFile) {
        const uploadedUrl = await uploadImage(newImageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          alert("Error al subir la imagen. Se mantendrá la imagen anterior.");
        }
      }

      // Datos a actualizar
      const updateData: any = {
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        category: category.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (finalImageUrl !== imageUrl) {
        updateData.image_url = finalImageUrl;
      }

      console.log("Actualizando con datos:", updateData);

      // 🚀 QUE SEA IMPOSIBLE QUE NO ACTUALICE
      const { data: updatedPost, error: updateError } = await supabase
        .from("posts")
        .update(updateData)
        .eq("id", id.trim())
        .eq("user_id", userId.trim())
        .select();

      console.log("Resultado UPDATE:", updatedPost);

      if (updateError) {
        console.error("Error de Supabase al actualizar:", updateError);
        setError("Error al actualizar la publicación");
        alert("Error al actualizar");
        setUpdating(false);
        return;
      }

      if (!updatedPost || updatedPost.length === 0) {
        alert("No se actualizó nada. Verifica si el ID coincide.");
        setUpdating(false);
        return;
      }

      alert("¡Publicación actualizada correctamente!");
      navigate(`/post/${id}`);

    } catch (err: any) {
      console.error("Error inesperado al actualizar:", err);
      alert("Ocurrió un error inesperado");
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate(`/post/${id}`);
  };

  if (loading) {
    return (
      <div className="w-screen min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-xl">Cargando publicación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 rounded-2xl p-6 border border-red-800/50">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/explore")}
              className="flex-1 bg-gray-700 hover:bg-gray-600 p-3 rounded-xl font-semibold"
            >
              Explorar
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-semibold"
            >
              Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Cancelar
          </button>
          <h1 className="text-lg font-semibold">Editar Publicación</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Editar publicación</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Título *
              </label>
              <input
                type="text"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: iPhone 13 Pro Max 256GB"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Descripción
              </label>
              <textarea
                rows={5}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu producto en detalle..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Precio ($) *
              </label>
              <input
                type="number"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Categoría
              </label>
              <input
                type="text"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej: Electrónica, Ropa, Hogar"
              />
            </div>

            {imageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Imagen actual
                </label>
                <div className="relative group">
                  <img
                    src={imageUrl}
                    alt="Imagen actual del producto"
                    className="w-full h-64 object-cover rounded-xl border border-gray-700 group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    Actual
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Cambiar imagen
              </label>
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-gray-400"
                  onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <button
              onClick={handleUpdate}
              disabled={updating}
              className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {updating ? "Actualizando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditPost;
