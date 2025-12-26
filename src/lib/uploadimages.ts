import { supabase } from "./supabase";

export const uploadImage = async (file: File) => {
  try {
    console.log("Subiendo archivo a Supabase...", file);

    // Validar tamaño del archivo (opcional, máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("La imagen es demasiado grande (máximo 5MB)");
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = fileName;

    console.log("Intentando subir a bucket: posts, ruta:", filePath);

    // Subir archivo
    const { data, error } = await supabase.storage
      .from("posts")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error detallado al subir:", error);
      throw error;
    }

    console.log("Archivo subido exitosamente:", data);

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from("posts")
      .getPublicUrl(filePath);

    console.log("URL pública generada:", urlData.publicUrl);
    
    return urlData.publicUrl;
    
  } catch (error) {
    console.error("Error en uploadImage:", error);
    return null;
  }
};