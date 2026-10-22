import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";

import HomePage from "./pages/HomePage";
import ShopCategory from "./pages/ShopCategory";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";

import ProtectedRoute from "./routes/ProtectedRoute";
import DealerRegistration from "./pages/DealerRegistration";
import Profile from "./pages/Profile";
import CheckoutPage from "./pages/CheckoutPage";
import Contact from "./pages/Contact";
import OurPolicies from "./pages/OurPolicies";
import FAQs from "./pages/FAQs";
import WarrantyRegistration from "./pages/WarrantyRegistration";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (

    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />
      <Route path="/dealer-registration" element={<DealerRegistration />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />

        <Route
          path="/shop"
          element={
            <MainLayout>
              <ShopCategory />
            </MainLayout>
          }
        />

        <Route
          path="/shop/:brandName"
          element={
            <MainLayout>
              <ShopCategory />
            </MainLayout>
          }
        />

        <Route
          path="/shop/:brandName/:modelId"
          element={
            <MainLayout>
              <ShopCategory />
            </MainLayout>
          }
        />

        <Route
          path="/product/:slug"
          element={
            <MainLayout>
              <ProductDetail />
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <Profile />
            </MainLayout>
          }
        />
        <Route
          path="/checkout"
          element={
            <MainLayout>
              <CheckoutPage />
            </MainLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <MainLayout>
              <Contact />
            </MainLayout>
          }
        />
        <Route
          path="/our-policies"
          element={
            <MainLayout>
              <OurPolicies />
            </MainLayout>
          }
        />
        <Route
          path="/Warranty-Policy"
          element={
            <MainLayout>
              <WarrantyRegistration />
            </MainLayout>
          }
        />


        <Route
          path="/faq"
          element={
            <MainLayout>
              <FAQs />
            </MainLayout>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
