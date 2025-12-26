import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const ChatsListScreen = () => {
  const [chats, setChats] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadChats = async () => {
      // Obtener usuario logueado
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user logged in");
        return;
      }

      // Buscar los chats donde participa este usuario
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .contains("participant_ids", [user.id]);

      if (error) {
        console.error("Error cargando chats:", error);
        return;
      }

      setChats(data || []);
    };

    loadChats();
  }, []);

  return (
    <div className="w-screen p-4">
      <h2 className="text-xl font-bold mb-4">Tus chats</h2>

      {chats.length === 0 && (
        <p className="text-gray-500 justify-center items-center">No tienes chats aún.</p>
      )}

      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => navigate(`/chat/${chat.id}`)}
          className="p-3 bg-black rounded-lg mb-3 cursor-pointer hover:bg-gray-300 transition"
        >
          Chat #{chat.id}
        </div>
      ))}
    </div>
  );
};

export default ChatsListScreen;
