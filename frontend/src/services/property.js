import apiClient from './apiClient';

export const fetchProperties = async (params = {}) => {
  try {
    console.log('Fetching properties with params:', params);
    const res = await apiClient.get('/properties', { params });
    console.log('Properties response:', res.data);
    if (res.data.properties.length === 1) return res.data.properties[0];
    return res.data.properties || [];
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

export const fetchPropertyById = async (id) => {
  try {
    console.log('Fetching property by ID:', { id });
    const res = await apiClient.get(`/properties/${id}`);
    console.log('Property response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching property by ID:', { id, error: error.message });
    throw error;
  }
};

export const createProperty = async (formData) => {
  const res = await apiClient.post('/properties', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateProperty = async (id, formData) => {
  try {
    console.log('Updating property with ID:', { id, formData });
    const form = new FormData();
    // Append top-level fields
    if (formData.title) form.append('title', formData.title);
    if (formData.description) form.append('description', formData.description);
    if (formData.type) form.append('type', formData.type);
    if (formData.price) form.append('price', formData.price);
    if (formData.floors) form.append('floors', formData.floors);
    // Append location fields
    if (formData.location) {
      if (formData.location.address) form.append('location[address]', formData.location.address);
      if (formData.location.city) form.append('location[city]', formData.location.city);
      if (formData.location.lat) form.append('location[lat]', formData.location.lat);
      if (formData.location.lng) form.append('location[lng]', formData.location.lng);
    }
    // Append specifications fields
    if (formData.specifications) {
      if (formData.specifications.bedrooms) form.append('specifications[bedrooms]', formData.specifications.bedrooms);
      if (formData.specifications.bathrooms) form.append('specifications[bathrooms]', formData.specifications.bathrooms);
      if (formData.specifications.area) form.append('specifications[area]', formData.specifications.area);
    }
    // Append images
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((file) => {
        form.append('images', file);
      });
    }

    const res = await apiClient.put(`/properties/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Property update response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error updating property:', { id, error: error.message });
    throw error;
  }
};