import axios from 'axios';
import type { InspectionResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const inspectImage = async (file: File): Promise<InspectionResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/api/inspect`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getHealth = async () => {
  const response = await axios.get(`${API_URL}/api/health`);
  return response.data;
};

export const getModelInfo = async () => {
  const response = await axios.get(`${API_URL}/api/model-info`);
  return response.data;
};
