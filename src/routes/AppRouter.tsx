// src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Explore from "../pages/Explore";
import VerifyIdentity from "../pages/VerifyIdentity";
import MyProfile from "../pages/MyProfile";
import CreatePost from "../pages/CreatePost";
import PostDetails from "../pages/PostDetails";
import EditPost from "../pages/EditPost";
import OrderScreen from "../pages/OrderScreen";
import ChatScreen from "../pages/ChatScreen";
import ChatsListScreen from "../pages/ChatListScreen";


/*import Login from "../pages/Login";
import Marketplace from "../pages/Marketplace";*/

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/Login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/explore" element={<Explore/>}/>
        <Route path="/verify" element={<VerifyIdentity />} />
        <Route path="/my-profile" element={<MyProfile/>} />
        <Route path="/create-post" element={<CreatePost/>} />
        <Route path="/post/:id" element={<PostDetails/>}/>
        <Route path="/edit-post/:id" element={<EditPost/>} />
        <Route path="/order/:orderId" element={<OrderScreen/>} />
        <Route path="/chat/:chatId" element={<ChatScreen />} />
        <Route path="/chats" element={<ChatsListScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
