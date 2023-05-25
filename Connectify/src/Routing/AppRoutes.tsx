import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Layout from "../pages/Layout";
import HomePage from "../pages/HomePage";
import ChatBox from "../components/ChatBox/ChatBox";

const routes = [
  {
    name: "Home",
    path: "/home",
    element: (
      <Layout>
        <HomePage />
      </Layout>
    ),
  },
  {
    name: "Chat",
    path: "/chat",
    element: (
      <Layout>
        <ChatBox />
      </Layout>
    ),
  },
];

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              welcomeText="Welcome to the Connectify"
              detailsText="Please sign in or sign up"
            />
          }
        />
        {generateRoutes()}
      </Routes>
    </Router>
  );
};

function generateRoutes() {
  return routes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element} />
  ));
}

export default AppRoutes;
