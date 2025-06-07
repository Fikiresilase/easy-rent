import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyList from './pages/PropertyList';
import PropertyDetails from './pages/PropertyDetails';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import EasyRentLogin from './pages/EasyRentLogin';
import EasyRentChat from './pages/EasyRentChat';
import EasyRentExplore from './pages/EasyRentExplore';
import EasyRentEditProperty from './pages/EasyRentEditProperty';
import EasyRentPost from './pages/EasyRentPost';
import EasyRentHistory from './pages/EasyRentHistory';
import EasyRentDealStatus from './pages/EasyRentDealStatus';
import EasyRentSignup from './pages/EasyRentSignup';
import PropertyInquirers from './pages/PropertyInquirers';
import EasyRentForgotPassword from './pages/EasyRentForgotPassword';
import EasyRentSubscribe from './pages/EasyRentSubscribe';
import PaymentSuccess from './components/PaymentSucess';

function App() {
  return (
    <Routes>
      <Route path="/easyrent-login" element={<EasyRentLogin />} />
      <Route path="/easyrent-signup" element={<EasyRentSignup />} />
      <Route path="/easyrent-forgot-password" element={<EasyRentForgotPassword />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="easyrent-explore" element={<EasyRentExplore />} />
        <Route path="easyrent-editPost/:propertyId" element={<EasyRentEditProperty />} />
        <Route path="easyrent-post" element={<EasyRentPost />} />
        <Route path="easyrent-history" element={<EasyRentHistory />} />
        <Route path="easyrent-deal-status/:propertyId" element={<EasyRentDealStatus />} />
        <Route path="propertyInquirers/:propertyId" element={<PropertyInquirers />} />
        <Route path="easyrent-chat/:propertyId" element={<EasyRentChat />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="properties" element={<PropertyList />} />
        <Route path="properties/:id" element={<PropertyDetails />} />
        <Route path="easyrent-subscribe" element={<EasyRentSubscribe />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;