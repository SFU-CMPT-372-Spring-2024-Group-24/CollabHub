import React from "react";
import ReactDOM from "react-dom/client";
import {
  Outlet,
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Bootstrap
import "bootstrap/dist/css/bootstrap.css";
// Global styles
import "./styles.scss";

// Pages and components
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Homepage from "./pages/Homepage/Homepage";
import NotFoundPage from "./pages/NotFoungPage/NotFoundPage";
import ProjectViewPage from "./pages/ProjectViewPage/ProjectViewPage";
import LoginSignup from "./pages/SignupLoginpage/LoginSignup";
import LandingPage from "./pages/LandingPage/LandingPage";
import Adminpage from "./pages/AdminPage/Adminpage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import ChatList from "./components/Chat/ChatList/ChatList";

// Contexts
import { UserProvider, useUser } from "./hooks/UserContext";
import { ChatProvider } from "./hooks/ChatContext";

// Declaration for google
declare global {
  interface Window {
    google: any;
  }
}

function Layout() {
  return (
    <>
      <Header searchPlaceholder="Search"/>
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

interface AuthRouteProps {
  children: React.ReactNode;
}

const AuthRoute = ({ children }: AuthRouteProps) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AdminAuthRoute = ({ children }: AuthRouteProps) => {
  const { user } = useUser();

  if (!user || !user.isAdmin) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <UserProvider>
      <ChatProvider>
        <ToastContainer
          position="bottom-center"
          autoClose={3000}
          hideProgressBar={true}
          draggable={true}
          pauseOnHover={true}
        />
        <BrowserRouter>
          <ChatList />
          <Routes>
            <Route element={<Layout />}>
              <Route
                path="/projects"
                element={
                  <AuthRoute>
                    <Homepage />
                  </AuthRoute>
                }
              />
              <Route path="/projects/notfound" element={<NotFoundPage />} />
              <Route
                path="/projects/*"
                element={<Navigate to={"/projects/notfound"} />}
              />
              <Route
                path="/profile/:username"
                element={
                  <AuthRoute>
                    <ProfilePage />
                  </AuthRoute>
                }
              />
              <Route path="/notfound" element={<NotFoundPage />} />
            </Route>
            {/* <Route element={<LayoutWithHeader />}> */}
              <Route
                path="/projects/:id"
                element={
                  <AuthRoute>
                    <ProjectViewPage />
                  </AuthRoute>
                }
              />
            {/* </Route> */}
            <Route path="/login" element={<LoginSignup />} />
            <Route
              path="/admin"
              element={
                <AdminAuthRoute>
                  <Adminpage />
                </AdminAuthRoute>
              }
            />
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to={"/"} />} />
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </UserProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
