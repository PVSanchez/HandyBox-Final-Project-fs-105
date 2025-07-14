import React from "react";
// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { ModifyUser } from "./pages/ModifyUser";
import { Services } from "./pages/Services";
import { PaymentPage } from "./pages/PaymentPage";
import { ResumenCompra } from "./pages/ResumenCompra";
import { CreateService } from "./pages/CreateService";
import { ServicesPay } from "./pages/ServicesPay";
import { ProfessionalServices } from "./pages/ProfessionalServices";
import { UserDetail } from "./pages/UserDetail";
import { ServiceDetail  } from "./pages/ServiceDetail";
import { CreateUserDetail } from "./pages/CreateUserDetail";
import Chat from "./pages/chat";
import { ResetPassword } from "./pages/ResetPassword";
import { ForgotPassword } from "./pages/ForgotPassword";

export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

    // Root Route: All navigation will start from here.
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/modifyUser" element={<ModifyUser />} />
      <Route path="/services" element={<Services />} />
      <Route path="/payment/:totalAmount/:currency" element={<PaymentPage />} />
      <Route path="/resumen" element={<ResumenCompra />} />
      <Route path="/createService" element={<CreateService />} />
      <Route path="/services-pay" element={<ServicesPay />} />
      <Route path="/user-detail" element={<UserDetail />} />
      <Route path="/professional-services" element={<ProfessionalServices />} />
      <Route path="/service/:id" element={<ServiceDetail />} />
      <Route path="/create-user-detail" element={<CreateUserDetail />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Route>
  )
);