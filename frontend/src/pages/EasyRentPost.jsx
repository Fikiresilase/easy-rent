import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { useAuth } from '../hooks/useAuth'
import { usePropertyForm } from '../hooks/property/usePropertyForm';
import { useMapInteraction } from '../hooks/map/useMapInteraction';
import { PropertyForm } from '../components/property/PropertyForm';
import { PropertySummary } from '../components/property/PropertySummary';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function EasyRentPost() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const {
    title, setTitle,
    price, setPrice,
    bedrooms, setBedrooms,
    bathrooms, setBathrooms,
    floors, setFloors,
    area, setArea,
    parking, setParking,
    type, setType,
    amenities, setAmenities,
    locationAddress, setLocationAddress,
    locationCity, setLocationCity,
    locationState, setLocationState,
    latitude, setLatitude,
    longitude, setLongitude,
    status, setStatus,
    image, setImage,
    loading, error, success,
    availableAmenities,
    descriptionData,
    handleAmenityChange,
    handleImageChange,
    handleSubmit,
  } = usePropertyForm(user, token);

  const {
    showMap,
    setShowMap,
    mapCenter,
    handleMapClick,
  } = useMapInteraction(setLatitude, setLongitude);

  useEffect(() => {
    if (!user) {
      navigate('/easyrent-login'); // Redirect to login if not authenticated
    } else if (user.role !== 'owner') {
      navigate('/easyrent-subscribe'); // Redirect to subscribe if not owner
    }
  }, [user, navigate]);

  if (!user || user.role !== 'owner') {
    return null; // Prevent rendering until redirect
  }

  return (
    <div className="container mx-auto px-4 py-6 relative">
      {loading && <LoadingSpinner />}
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Post a Property</h1>
      {error && <ErrorMessage message={error} />}
      {success && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-sm text-green-800 p-4 rounded-lg max-w-lg mx-auto">
          {success}
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-4 max-w-5xl mx-auto">
        <PropertyForm
          handleSubmit={handleSubmit}
          title={title}
          setTitle={setTitle}
          price={price}
          setPrice={setPrice}
          type={type}
          setType={setType}
          floors={floors}
          setFloors={setFloors}
          locationAddress={locationAddress}
          setLocationAddress={setLocationAddress}
          locationCity={locationCity}
          setLocationCity={setLocationCity}
          locationState={locationState}
          setLocationState={setLocationState}
          showMap={showMap}
          setShowMap={setShowMap}
          mapCenter={mapCenter}
          latitude={latitude}
          longitude={longitude}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          handleMapClick={handleMapClick}
          bedrooms={bedrooms}
          setBedrooms={setBedrooms}
          bathrooms={bathrooms}
          setBathrooms={setBathrooms}
          area={area}
          setArea={setArea}
          parking={parking}
          setParking={setParking}
          amenities={amenities}
          setAmenities={setAmenities}
          status={status}
          setStatus={setStatus}
          availableAmenities={availableAmenities}
          handleAmenityChange={handleAmenityChange}
          image={image}
          handleImageChange={handleImageChange}
          loading={loading}
        />
        <PropertySummary
          image={image}
          descriptionData={descriptionData}
        />
      </div>
    </div>
  );
}