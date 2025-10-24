// import apiClient from "./apiClient";

// const ENDPOINT = "/allowance-options";

// const allowanceTypeService = {
//   getAll: async () => {
//     try {
//       const res = await apiClient.get(ENDPOINT);
//       // unwrap backend response
//       return Array.isArray(res.data?.data) ? res.data.data : [];
//     } catch (err) {
//       console.error("Error fetching allowance options:", err);
//       return [];
//     }
//   },

//   create: async (payload) => {
//     const res = await apiClient.post(ENDPOINT, payload);
//     return res.data?.data || null;
//   },

//   update: async (id, payload) => {
//     const res = await apiClient.put(`${ENDPOINT}/${id}`, payload);
//     return res.data?.data || null;
//   },

//   remove: async (id) => {
//     const res = await apiClient.delete(`${ENDPOINT}/${id}`);
//     return res.data || { success: false };
//   },
// };

// export default allowanceTypeService;


// import apiClient from "./apiClient";

// const ENDPOINT = "/allowance-options";

// const allowanceTypeService = {
//   getAll: async () => {
//     try {
//       const res = await apiClient.get(ENDPOINT);
//       // Your backend returns {success: true, data: [...]}
//       return res.data.data || [];
//     } catch (err) {
//       console.error("Error fetching allowance options:", err);
//       return [];
//     }
//   },

//   create: async (payload) => {
//     const res = await apiClient.post(ENDPOINT, payload);
//     return res.data.data || null;
//   },

//   update: async (id, payload) => {
//     const res = await apiClient.put(`${ENDPOINT}/${id}`, payload);
//     return res.data.data || null;
//   },

//   remove: async (id) => {
//     const res = await apiClient.delete(`${ENDPOINT}/${id}`);
//     return res.data || { success: false };
//   },
// };

// export default allowanceTypeService;


// import apiClient from "./apiClient";

// const ENDPOINT = "/allowance-options";

// const allowanceTypeService = {
//   getAll: async () => {
//     try {
//       const res = await apiClient.get(ENDPOINT);
//       return Array.isArray(res.data?.data) ? res.data.data : [];
//     } catch (err) {
//       console.error("Error fetching allowance options:", err);
//       return [];
//     }
//   },

//   create: async (payload) => {
//     const res = await apiClient.post(ENDPOINT, payload);
//     return res.data?.data || null;
//   },

//   update: async (id, payload) => {
//     const res = await apiClient.put(`${ENDPOINT}/${id}`, payload);
//     return res.data?.data || null;
//   },

//   remove: async (id) => {
//     const res = await apiClient.delete(`${ENDPOINT}/${id}`);
//     return res.data || { success: false };
//   },
// };

// export default allowanceTypeService;



// src/services/allowanceTypeService.js
import apiClient from "./apiClient"; // your axios instance

// ✅ Get all allowance options (company scoped)
const getAllAllowanceOptions = async () => {
  const res = await apiClient.get("/allowance-options");
  return res.data.data; // returns array of allowance options
};

// ✅ Get a single allowance option by ID
const getAllowanceOptionById = async (id) => {
  const res = await apiClient.get(`/allowance-options/${id}`);
  return res.data.data; // returns single allowance option object
};

// ✅ Create a new allowance option
const createAllowanceOption = async (data) => {
  const res = await apiClient.post("/allowance-options", data);
  return res.data.data; // returns created allowance option object
};

// ✅ Update an existing allowance option
const updateAllowanceOption = async (id, data) => {
  const res = await apiClient.put(`/allowance-options/${id}`, data);
  return res.data.data; // returns updated allowance option object
};

// ✅ Delete an allowance option
const deleteAllowanceOption = async (id) => {
  const res = await apiClient.delete(`/allowance-options/${id}`);
  return res.data; // returns { success: true, message: "Allowance option deleted" }
};

// Export all functions
const allowanceTypeService = {
  getAllAllowanceOptions,
  getAllowanceOptionById,
  createAllowanceOption,
  updateAllowanceOption,
  deleteAllowanceOption,
};

export default allowanceTypeService;
