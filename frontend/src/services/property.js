import apiClient from './apiClient'

export const fetchProperties = async (params = {}) => {
  try {
    console.log('Fetching properties with params:', params);
    const res = await apiClient.get('/properties', { params });
    console.log('Properties response:', res.data);
    // Return the properties array from the response
    if (res.data.properties.length===1) return res.data.properties[0]
    return res.data.properties || [];
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
}

// property.js 
export const createProperty = async (formData) => {
  const res = await apiClient.post('/properties', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

