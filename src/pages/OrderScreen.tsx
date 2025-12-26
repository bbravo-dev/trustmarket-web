import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const OrderScreen: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [post, setPost] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ---------------------------
  // 1. Cargar orden + post + vendedor
  // ---------------------------
  useEffect(() => {
    if (!orderId) {
      setErrorMsg("ID de orden inválido");
      return;
    }

    const loadData = async () => {
      // 1️⃣ Obtener orden
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError) {
        console.error(orderError);
        setErrorMsg("No se encontró la orden");
        setLoading(false);
        return;
      }

      setOrder(orderData);

      // 2️⃣ Obtener post asociado
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("*")
        .eq("id", orderData.post_id)
        .single();

      if (postError) {
        console.error(postError);
        setErrorMsg("Error cargando publicación");
        setLoading(false);
        return;
      }

      setPost(postData);

      // 3️⃣ Obtener vendedor
      const { data: sellerData, error: sellerError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", orderData.seller_id)
        .single();

      if (sellerError) {
        console.error(sellerError);
        setErrorMsg("Error cargando vendedor");
      } else {
        setSeller(sellerData);
      }

      setLoading(false);
    };

    loadData();
  }, [orderId]);


const getOrCreateChat = async (buyerId: string, sellerId: string) => {
  if (!buyerId || !sellerId) {
    console.error("buyerId o sellerId faltan");
    setErrorMsg("Falta información del usuario");
    return null;
  }

  if (!post) {
    console.error("No hay información del post");
    setErrorMsg("Error cargando la publicación");
    return null;
  }

  console.log("Buscando chat para post:", post.id);
  console.log("Comprador:", buyerId);
  console.log("Vendedor:", sellerId);

  try {

    const { data: existingChats, error: searchError } = await supabase
      .from("chats")
      .select("*")
      .eq("post_id", post.id);

    if (searchError) {
      console.error("Error buscando chat:", searchError);
      setErrorMsg("Error buscando chat existente");
      return null;
    }

    console.log("Chats encontrados para este post:", existingChats);

    // Filtrar manualmente los chats donde ambos usuarios sean participantes
    const existingChat = existingChats?.find(chat => {
      const participants = chat.participant_ids || [];
      return participants.includes(buyerId) && participants.includes(sellerId);
    });

    if (existingChat) {
      console.log("Chat existente encontrado:", existingChat.id);
      return existingChat.id;
    }

    // 2. Crear nuevo chat
    console.log("Creando nuevo chat...");
    const { data: newChat, error: insertError } = await supabase
      .from("chats")
      .insert({
        participant_ids: [buyerId, sellerId],
        buyer_id: buyerId,
        seller_id: sellerId,
        created_at: new Date().toISOString(),
        post_id: post.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("ERROR CREANDO CHAT:", insertError);
      setErrorMsg("Error al crear el chat: " + insertError.message);
      return null;
    }

    console.log("Nuevo chat creado:", newChat.id);
    return newChat.id;

  } catch (error) {
    console.error("Error inesperado en getOrCreateChat:", error);
    setErrorMsg("Error inesperado al procesar el chat");
    return null;
  }
};

const handleGoToChat = async () => {
  setErrorMsg(""); 
  
  // Get Actual User
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    setErrorMsg("Debes iniciar sesión para negociar");
    return;
  }

  if (!seller?.id) {
    setErrorMsg("No se pudo identificar al vendedor");
    return;
  }

  const buyerId = user.id;
  const sellerId = seller.id;

  console.log("Creando/obteniendo chat entre:", buyerId, "y", sellerId);

  const chatId = await getOrCreateChat(buyerId, sellerId);
  
  if (!chatId) {
    setErrorMsg("No se pudo crear o encontrar el chat");
    return;
  }


  navigate(`/chat/${chatId}?orderId=${order.id}`);
};


  if (loading)
    return (
      <div className="w-screen h-screen flex justify-center items-center text-xl">
        Cargando...
      </div>
    );

  if (errorMsg)
    return (
      <div className="w-screen h-screen flex justify-center items-center text-red-600 text-lg">
        {errorMsg}
      </div>
    );

  return (
    <div className="w-screen min-h-screen flex justify-center items-center bg-black p-4">
      <div className="w-full max-w-xl bg-blue shadow-lg rounded-xl p-6">
        <h1 className="text-xl font-bold mb-2 text-center">
          Orden #{order.id}
        </h1>

        {/* Producto */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{post.title}</h2>
          <p className="text-lg text-green-600 font-bold mt-1">
            ${post.price}
          </p>
        </div>

        {/* Vendedor */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Vendedor</h3>
          <p className="text-gray-700">{seller?.full_name}</p>
        </div>

        {/* Botón */}
        <button
          onClick={handleGoToChat}
          className="
            w-full py-3 
            bg-blue-600 hover:bg-blue-700 
            text-white font-semibold 
            rounded-lg transition
          "
        >
          Abrir negociación
        </button>
      </div>
    </div>
  );
};

export default OrderScreen;
