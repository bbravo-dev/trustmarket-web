import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ChatScreen: React.FC = () => {
  const { chatId } = useParams();

  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // ======================================
  // 1. Obtener usuario actual
  // ======================================
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data?.user?.id ?? null);
    };
    loadUser();
  }, []);

  // ======================================
  // 2. Cargar chat + mensajes
  // ======================================
  useEffect(() => {
    if (!chatId) {
      setErrorMsg("No se encontró el ID del chat.");
      return;
    }

    const loadChatAndMessages = async () => {
      try {
        const { data: chatData, error: chatError } = await supabase
          .from("chats")
          .select(
            `
            *,
            posts:post_id (title, price)
          `
          )
          .eq("id", chatId)
          .single();

        if (chatError) {
          setErrorMsg("Este chat no existe o no tienes permiso.");
          return;
        }

        setChat(chatData);

        const { data: msgData, error: msgError } = await supabase
          .from("chat_messages")
          .select(
            `
            *,
            profiles:sender_id (full_name)
          `
          )
          .eq("chat_id", chatId)
          .order("created_at", { ascending: true });

        setMessages(msgError ? [] : msgData || []);
      } catch (error) {
        setErrorMsg("Error cargando el chat");
      }
    };

    loadChatAndMessages();
  }, [chatId]);

  // ======================================
  // 3. Suscripción realtime
  // ======================================
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat_room_${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          const { data: enriched } = await supabase
            .from("chat_messages")
            .select(
              `
              *,
              profiles:sender_id (full_name)
            `
            )
            .eq("id", payload.new.id)
            .single();

          setMessages((prev) => [...prev, enriched]);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [chatId]);

  // ======================================
  // 4. Enviar mensaje normal
  // ======================================
  const sendMessage = async () => {
    if (!input.trim() || !currentUserId) return;

    await supabase.from("chat_messages").insert({
      chat_id: chatId,
      sender_id: currentUserId,
      message: input.trim(),
      message_type: "text",
    });

    setInput("");
  };

  // ======================================
  // 5. ENVIAR OFERTA (corregido)
  // ======================================
  const sendOffer = async () => {
    const amount = prompt("Ingresa tu oferta:");
    if (!amount || !currentUserId) return;

    const priceNumber = Number(amount);
    if (isNaN(priceNumber)) {
      alert("Debe ingresar un número válido.");
      return;
    }

    await supabase.from("chat_messages").insert({
      chat_id: chatId,
      sender_id: currentUserId,
      message_type: "offer",
      offer_amount: priceNumber,
      message: `Oferta: $${priceNumber}`, // <-- FIX PARA TABLAS QUE EXIGEN MESSAGE
    });
  };

  // ======================================
  // 6. Aceptar oferta
  // ======================================
  const acceptOffer = async (msg: any) => {
    if (!currentUserId) return;

    // Guardar mensaje de aceptación
    await supabase.from("chat_messages").insert({
      chat_id: msg.chat_id,
      sender_id: currentUserId,
      message_type: "offer_accepted",
      message: `Oferta aceptada por $${msg.offer_amount}`,
    });

    // 🔥 Cambiar estado del chat → YA NO SE PUEDE MODIFICAR
    await supabase
      .from("chats")
      .update({ deal_status: "accepted" })
      .eq("id", msg.chat_id);

    // Refrescar chat
    const { data } = await supabase
      .from("chats")
      .select("*")
      .eq("id", msg.chat_id)
      .single();
    setChat(data);
  };
  // ======================================
  // 7. Rechazar oferta
  // ======================================
  const rejectOffer = async (msg: any) => {
    await supabase.from("chat_messages").insert({
      chat_id: msg.chat_id,
      sender_id: currentUserId,
      message_type: "offer_rejected",
      message: "Oferta rechazada",
    });
  };

  // ======================================
  // 8. Contraoferta
  // ======================================
  const counterOffer = async (msg: any) => {
    const amount = prompt("Ingresa tu contraoferta:");
    if (!amount) return;

    await supabase.from("chat_messages").insert({
      chat_id: msg.chat_id,
      sender_id: currentUserId,
      message_type: "counteroffer",
      offer_amount: Number(amount),
      message: `Contraoferta: $${amount}`, // <-- FIX
    });
  };

  // ======================================
  // 9. Realizar pago (comprador)
  // ======================================
  const payEscrow = async () => {
    if (!chatId || !currentUserId) return;

    // Mensaje system
    await supabase.from("chat_messages").insert({
      chat_id: chatId,
      sender_id: currentUserId,
      message_type: "system",
      message:
        "Pago realizado. TrustMarket mantiene el dinero en custodia hasta que el comprador confirme la entrega.",
    });

    // Cambiar estado del deal
    await supabase
      .from("chats")
      .update({ deal_status: "paid" })
      .eq("id", chatId);

    const { data } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .single();

    setChat(data);
  };

  // ======================================
  // 10. Marcar como enviado (vendedor)
  // ======================================
  const markAsShipped = async () => {
    if (!chatId || !currentUserId) return;

    await supabase.from("chat_messages").insert({
      chat_id: chatId,
      sender_id: currentUserId,
      message_type: "system",
      message: "El vendedor ha marcado el producto como enviado.",
    });

    await supabase
      .from("chats")
      .update({ deal_status: "shipped" })
      .eq("id", chatId);

    const { data } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .single();

    setChat(data);
  };

  // ======================================
  // 11. Confirmar entrega (comprador)
  // ======================================
  const confirmDelivery = async () => {
    if (!chatId || !currentUserId) return;

    // Mensaje system
    await supabase.from("chat_messages").insert({
      chat_id: chatId,
      sender_id: currentUserId,
      message_type: "system",
      message:
        "El comprador confirmó la entrega. TrustMarket liberará el pago al vendedor.",
    });

    // Estado final del deal
    await supabase
      .from("chats")
      .update({ deal_status: "completed" })
      .eq("id", chatId);

    const { data } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .single();

    setChat(data);
  };

  // ======================================
  // Auto scroll
  // ======================================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ======================================
  // Renderizar mensajes
  // ======================================
  const renderMessage = (msg: any) => {
    const isMe = msg.sender_id === currentUserId;

    if (msg.message_type === "offer") {
      return (
        <div
          key={msg.id}
          className={`self-start ${isMe ? "ml-auto" : ""
            }`}
        >
          <div className="w-full max-w-sm rounded-lg bg-yellow-200 text-black shadow px-3 py-1 ml-auto">

            {!isMe && (
              <p className="text-xs text-gray-600 mb-1">
                {msg.profiles?.full_name}
              </p>
            )}

            <p className="mb-2 font-semibold">
              Oferta: ${msg.offer_amount}
            </p>

            {!isMe && (
              <div className="flex flex-nowrap gap-2">
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => acceptOffer(msg)}
                >
                  Aceptar
                </button>

                <button
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => rejectOffer(msg)}
                >
                  Rechazar
                </button>

                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => counterOffer(msg)}
                >
                  Contraoferta
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (msg.message_type === "counteroffer") {
      const isMe = msg.sender_id === currentUserId;

      return (
        <div
          key={msg.id}
          className={`w-full p-3 max-w-sm rounded-lg shadow bg-blue-200 text-black ${isMe ? "ml-auto" : ""

            }`}
        >
          {!isMe && (
            <p className="text-xs text-gray-600 mb-1">
              {msg.profiles?.full_name}
            </p>
          )}

          <p><b>Contraoferta:</b> ${msg.offer_amount}</p>

          {/* SI NO ES MIO → mostrar botones (igual que oferta inicial) */}
          {!isMe && chat.deal_status === "open" && (
            <div className="flex flex-row gap-2 mt-3 w-full">
              <button
                className="bg-green-600 text-white px-2 py-1 rounded"
                onClick={() => acceptOffer(msg)}
              >
                Aceptar
              </button>

              <button
                className="bg-red-600 text-white px-2 py-1 rounded"
                onClick={() => rejectOffer(msg)}
              >
                Rechazar
              </button>

              <button
                className="bg-blue-600 text-white px-2 py-1 rounded"
                onClick={() => counterOffer(msg)}
              >
                Contraoferta
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={msg.id}
        className={`max-w-xs p-2 rounded-lg shadow ${isMe ? "bg-blue-500 text-white ml-auto" : "bg-white text-gray-800"
          }`}
      >
        {!isMe && (
          <p className="text-xs text-gray-500 mb-1">
            {msg.profiles?.full_name || "Usuario"}
          </p>
        )}
        {msg.message}
      </div>
    );
  };

  if (errorMsg)
    return <p className="text-red-500 text-center mt-5">{errorMsg}</p>;

  if (!chat)
    return (
      <div className=" h-screen w-screen flex flex-col items-center justify-center text-center text-xl ">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-blue-600 font-medium">
          Cargando chat...
        </p>
      </div>
    );

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100">
      {/* HEADER */}
      <div className="p-4 bg-blue-600 text-white flex justify-between items-center shadow-md">
        <h2 className="text-lg font-bold">Chat</h2>


      </div>

      {/* ================= DEAL STATUS ACTIONS ================= */}
      {chat.deal_status === "accepted" && (
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-3 text-center shadow">
          {currentUserId === chat.buyer_id ? (
            <>
              <p className="text-sm mb-3 text-black">
                Oferta aceptada. Realiza el pago para continuar.
              </p>
              <button
                onClick={payEscrow}
                className="bg-blue-600 text-white px-5 py-2 rounded-md shadow"
              >
                💳 Realizar pago (Escrow)
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-700">
              ⏳ Esperando que el comprador realice el pago.
            </p>
          )}
        </div>
      )}

      {chat.deal_status === "paid" && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-3 text-center shadow">
          {currentUserId === chat.seller_id ? (
            <>
              <p className="text-sm mb-3">
                Pago recibido en custodia. Procede con el envío.
              </p>
              <button
                onClick={markAsShipped}
                className="bg-green-600 text-white px-5 py-2 rounded-md shadow"
              >
                📦 Marcar como enviado
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-700">
              🔒 Pago en custodia. Esperando envío del vendedor.
            </p>
          )}
        </div>
      )}

      {chat.deal_status === "shipped" && (
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-3 text-center shadow">
          {currentUserId === chat.buyer_id ? (
            <>
              <p className="text-sm mb-3">
                📦 El producto fue enviado. Confirma si lo recibiste en buen estado.
              </p>
              <button
                onClick={confirmDelivery}
                className="bg-blue-600 text-white px-5 py-2 rounded-md shadow"
              >
                ✅ Confirmar entrega
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-700">
              ⏳ Esperando confirmación del comprador.
            </p>
          )}
        </div>
      )}

      {chat.deal_status === "completed" && (
        <div className="bg-green-200 border border-green-400 rounded-lg p-4 mb-3 text-center shadow">
          <p className="font-semibold text-green-800">
            ✅ Trato completado. Pago liberado al vendedor.
          </p>
        </div>
      )}

      {/* MENSAJES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => renderMessage(msg))}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 bg-black flex gap-3 border-t shadow-md">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          className="flex-1 border rounded-md p-2 shadow-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded-md shadow"
        >
          Enviar
        </button>
        <button
          onClick={() => chat.deal_status === "open" && sendOffer()}
          disabled={chat.deal_status !== "open"}
          className={`px-3 py-1 rounded-md text-sm shadow ${chat.deal_status === "open"
            ? "bg-white text-blue-600"
            : "bg-gray-400 text-white cursor-not-allowed"
            }`}
        >
          Proponer precio
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;
