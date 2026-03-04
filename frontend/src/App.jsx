import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./User/AuthProvider";
import { NotifProvider } from "./components/Notif";

import Register from "./User/Register";
import Login from "./User/Login";
import Logout from "./User/Logout";
import UserPage from "./User/UserPage";
import UserPageEdit from "./User/UserPageEdit";
import PostPage from "./Board/DisplayPost/PostPage";
import FriendsPage from "./Social/FriendsPage";
import AdminDashboard from "./Admin/AdminDashboard";

import NavBar from "./NavBar";
import Footer from "./components/Footer";
import CreateBoard from "./Board/CreateBoard";
import DisplayBoard from "./Board/DisplayBoard";
import ChangePassword from "./User/ChangePassword";
import SocialSidebar from "./Social/SocialSidebar";
import BoardList from "./Board/DisplayBoardSearch";
import Home from "./Home";
import PublicApiDocsPage from "./PublicApiDocsPage";
import NotFound from "./NotFound";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-surface-900 antialiased">
      <NavBar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
      <Footer />
      <SocialSidebar />
    </div>
  );
};

export default function App() {
  return (
    <NotifProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_relativeSplatPath: false }}>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/changepassword" element={<ChangePassword />} />
              <Route path="/createBoard" element={<CreateBoard />} />
              <Route path="/board" element={<BoardList />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/docs/api" element={<PublicApiDocsPage />} />
              <Route path="/user/:username" element={<UserPage />} />
              <Route path="/user/:usernameParam/edit" element={<UserPageEdit />} />
              <Route path="/board/:boardName" element={<DisplayBoard />} />
              <Route path="/post/:postID" element={<PostPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </AuthProvider>
    </NotifProvider>
  );
}
