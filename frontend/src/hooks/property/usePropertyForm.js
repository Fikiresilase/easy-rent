import { useState } from 'react';
import { createProperty } from '../../services/property';

export function usePropertyForm(user, token) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [floors, setFloors] = useState('');
  const [area, setArea] = useState('');
  const [parking, setParking] = useState(false);
  const [type, setType] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [locationAddress, setLocationAddress] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationState, setLocationState] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [status, setStatus] = useState('available');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const availableAmenities = ['WiFi', 'Pool', 'Gym', 'Parking', 'Air Conditioning', 'Heating'];

  const descriptionData = [
    { label: 'Title', value: title || 'N/A' },
    { label: 'Type', value: type || 'N/A' },
    { label: 'Price', value: price ? `$${Number(price).toLocaleString()}` : 'N/A' },
    { label: 'Bedrooms', value: bedrooms || 'N/A' },
    { label: 'Bathrooms', value: bathrooms || 'N/A' },
    { label: 'Floors', value: floors || 'N/A' },
    { label: 'Area', value: area ? `${Number(area).toLocaleString()} sqft` : 'N/A' },
    { label: 'Parking', value: parking ? 'Yes' : 'No' },
    { label: 'Amenities', value: amenities.length ? amenities.join(', ') : 'N/A' },
    {
      label: 'Location',
      value: locationAddress || locationCity || locationState
        ? `${locationAddress || 'N/A'}, ${locationCity || 'N/A'}, ${locationState || 'N/A'}`
        : 'N/A',
    },
    { label: 'Status', value: status || 'N/A' },
  ];

  const description = descriptionData
    .map(({ label, value }) => `${label}: ${value}`)
    .join(' | ');

  const handleAmenityChange = (amenity) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!user?.id) {
      setError('You must be logged in to post a property');
      setLoading(false);
      return;
    }

    try {
      const data = {
        ownerId: user._id,
        title,
        description,
        type,
        price: Number(price),
        floors: Number(floors),
        parking,
        specifications: {
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          area: Number(area),
          parking,
        },
        location: {
          address: locationAddress,
          city: locationCity,
          state: locationState,
          coordinates: {
            latitude: latitude ? Number(latitude) : undefined,
            longitude: longitude ? Number(longitude) : undefined,
          },
        },
        amenities,
        status,
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(data));
      if (image) formData.append('images', image);

      await createProperty(formData, token);

      setSuccess(`Property "${title}" posted successfully!`);
      setTitle('');
      setPrice('');
      setBedrooms('');
      setBathrooms('');
      setFloors('');
      setArea('');
      setParking(false);
      setType('');
      setAmenities([]);
      setLocationAddress('');
      setLocationCity('');
      setLocationState('');
      setLatitude('');
      setLongitude('');
      setStatus('available');
      setImage(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post property');
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}