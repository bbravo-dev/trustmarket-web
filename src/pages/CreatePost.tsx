import React,  { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { uploadImage } from "../lib/uploadimages";
import { useEffect } from "react";

const CreatePost: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

const handlePublish = async () => {
  if (!title || !price) {
    alert("Título y precio son obligatorios");
    return;
  }

  // Validar que el precio sea positivo
  if (Number(price) <= 0) {
    alert("El precio debe ser mayor a 0");
    return;
  }

  setLoading(true);

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("Error de autenticación:", authError);
      alert("Error al verificar usuario");
      setLoading(false);
      return;
    }

    if (!user) {
      alert("Debes iniciar sesión para publicar");
      setLoading(false);
      return;
    }

    // ⭐ Subir imagen
    let imageUrl = null;
    if (imageFile) {
      // Validar tipo de archivo
      if (!imageFile.type.startsWith('image/')) {
        alert("Por favor, selecciona un archivo de imagen válido");
        setLoading(false);
        return;
      }
      
      console.log("Iniciando subida de imagen...");
      imageUrl = await uploadImage(imageFile);
      
      if (!imageUrl) {
        alert("Error al subir la imagen. Intenta con otra imagen.");
        setLoading(false);
        return;
      }
      
      console.log("Imagen subida exitosamente:", imageUrl);
    }

    // ⭐ Insertar post en BD
    const { data, error } = await supabase.from("posts").insert({
      user_id: user.id,
      title,
      description,
      price: Number(price),
      category,
      image_url: imageUrl,
    }).select();

    if (error) {
      console.error("Error al insertar post:", error);
      alert(`Error al publicar: ${error.message}`);
    } else {
      console.log("Post creado exitosamente:", data);
      alert("¡Publicación creada exitosamente!");
      navigate("/explore");
    }
    
  } catch (error) {
    console.error("Error inesperado:", error);
    alert("Ocurrió un error inesperado");
  } finally {
    setLoading(false);
  }
};

// En tu componente, prueba esto temporalmente:
useEffect(() => {
  const testConnection = async () => {
    const { data, error } = await supabase.storage.from('posts').list();
    console.log("Contenido del bucket:", data, error);
  };
  testConnection();
}, []);

  return (
    <main className="relative flex flex-col justify-center items-center w-screen min-h-screen text-center px-4 overflow-hidden bg-gray-900 text-white">

      
      <div className="w-full max-w-md">
        
        <h1 className="text-4xl font-bold mb-8 text-white">
          Publicar venta
        </h1>

        <div className="flex flex-col gap-4 text-left">

          {/* Título */}
          <div>
            <label className="font-semibold">Título *</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: Laptop HP"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="font-semibold">Descripción</label>
            <textarea
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Detalles del producto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Precio */}
          <div>
            <label className="font-semibold">Precio *</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: 150"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="font-semibold">Categoría</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: Tecnología"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="font-semibold">Imagen (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-700"
            />
          </div>

          {/* Botón */}
          <button
            onClick={handlePublish}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold p-3 rounded-xl text-lg shadow-md"
          >
            {loading ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default CreatePost;
