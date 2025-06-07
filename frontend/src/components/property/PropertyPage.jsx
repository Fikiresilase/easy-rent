import React from 'react';
import { GeneralInfo } from '../ui/GeneralInfo';
import { LocationDetails } from '../map/LocationDetails';
import { Specifications } from './Specification';
import { ImageUpload } from '../ui/ImageUpload';

export function PropertyForm({
  handleSubmit,
  title, setTitle,
  price, setPrice,
  type, setType,
  floors, setFloors,
  locationAddress, setLocationAddress,
  locationCity, setLocationCity,
  locationState, setLocationState,
  showMap, setShowMap,
  mapCenter, latitude, longitude, handleMapClick,
  bedrooms, setBedrooms,
  bathrooms, setBathrooms,
  area, setArea,
  parking, setParking,
  amenities, setAmenities,
  status, setStatus,
  availableAmenities, handleAmenityChange,
  image, handleImageChange,
  loading,
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-lg flex-1 space-y-6 min-w-[320px]"
    >
      <GeneralInfo
        title={title}
        setTitle={setTitle}
        price={price}
        setPrice={setPrice}
        type={type}
        setType={setType}
        floors={floors}
        setFloors={setFloors}
      />
      <LocationDetails
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
        handleMapClick={handleMapClick}
      />
      <Specifications
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
      />
      <ImageUpload
        image={image}
        handleImageChange={handleImageChange}
      />
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={loading}
          className={`bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-2 rounded-md shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 hover:scale-105 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Post property"
        >
          {loading ? 'Uploading...' : 'Post Property'}
        </button>
      </div>
    </form>
  );
}