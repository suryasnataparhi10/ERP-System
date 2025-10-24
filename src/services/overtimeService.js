// import apiClient from './apiClient';

// export const getOvertimesByEmployee = (employeeId) =>
//   apiClient.get(`/overtimes/employee/${employeeId}`);

// export const createOvertime = (data) =>
//   apiClient.post('/overtimes', data);

// export const updateOvertime = (id, data) =>
//   apiClient.put(`/overtimes/${id}`, data);

// export const deleteOvertime = (id) =>
//   apiClient.delete(`/overtimes/${id}`);


// // src/services/overtimeService.js
// import apiClient from "./apiClient";

// const getOvertimesByEmployee = async (employeeId) => {
//   const res = await apiClient.get(`/overtimes/employee/${employeeId}`);
//   return res.data.data; // Adjust if backend sends a different response
// };

// const createOvertime = async (payload) => {
//   const res = await apiClient.post("/overtimes", payload);
//   return res.data;
// };

// const updateOvertime = async (id, payload) => {
//   const res = await apiClient.put(`/overtimes/${id}`, payload);
//   return res.data;
// };

// const deleteOvertime = async (id) => {
//   const res = await apiClient.delete(`/overtimes/${id}`);
//   return res.data;
// };

// export default {
//   getOvertimesByEmployee,
//   createOvertime,
//   updateOvertime,
//   deleteOvertime,
// };



// src/services/overtimeService.js
import apiClient from "./apiClient";

const getOvertimesByEmployee = async (employeeId) => {
  try {
    const res = await apiClient.get(`/overtimes/employee/${employeeId}`);
    // API: { success: true, data: [...] }
    return Array.isArray(res?.data?.data) ? res.data.data : [];
  } catch (err) {
    // Treat 404 "No overtime records found" as empty list
    if (err?.response?.status === 404) return [];
    throw err;
  }
};

const createOvertime = async (payload) => {
  // payload must include: employee_id, title, number_of_days, hours, rate, (optional) type
  const res = await apiClient.post("/overtimes", payload);
  return res.data?.data; // return the created record
};

const updateOvertime = async (id, payload) => {
  // payload can include: title, number_of_days, hours, rate, type
  const res = await apiClient.put(`/overtimes/${id}`, payload);
  return res.data?.data; // return updated record
};

const deleteOvertime = async (id) => {
  const res = await apiClient.delete(`/overtimes/${id}`);
  // API: { success: true, message: 'Deleted successfully' }
  return res.data?.success === true;
};

export default {
  getOvertimesByEmployee,
  createOvertime,
  updateOvertime,
  deleteOvertime,
};
