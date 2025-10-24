

// import apiClient from "./apiClient";

// // Get all allowances for a specific employee
// const getAllowances = async (employeeId) => {
//   try {
//     console.log("Fetching allowances for employee ID:", employeeId);
//     const res = await apiClient.get(`/allowances/employee/${employeeId}`);
//     console.log("API Response:", res.data);

//     // Handle different response structures
//     if (res.data && res.data.success) {
//       return Array.isArray(res.data.data) ? res.data.data : [];
//     } else if (Array.isArray(res.data)) {
//       return res.data;
//     } else {
//       console.error("Unexpected API response structure:", res.data);
//       return [];
//     }
//   } catch (error) {
//     console.error("Error fetching allowances:", error);
//     if (error.response) {
//       console.error("Response data:", error.response.data);
//       console.error("Response status:", error.response.status);
//     }
//     return [];
//   }
// };

// // Create a new allowance
// const createAllowance = async (data) => {
//   try {
//     const res = await apiClient.post("/allowances", data);
//     return res.data?.data || null;
//   } catch (error) {
//     console.error("Error creating allowance:", error);
//     throw error;
//   }
// };

// // Update an existing allowance
// const updateAllowance = async (id, data) => {
//   try {
//     const res = await apiClient.put(`/allowances/${id}`, data);
//     return res.data?.data || null;
//   } catch (error) {
//     console.error("Error updating allowance:", error);
//     throw error;
//   }
// };

// // Delete an allowance
// const deleteAllowance = async (id) => {
//   try {
//     const res = await apiClient.delete(`/allowances/${id}`);
//     return res.data || { success: false };
//   } catch (error) {
//     console.error("Error deleting allowance:", error);
//     throw error;
//   }
// };

// const allowanceService = {
//   getAllowances,
//   createAllowance,
//   updateAllowance,
//   deleteAllowance,
// };

// export default allowanceService;


// // src/services/allowanceService.js
// import apiClient from "./apiClient"; // your axios instance

// // ✅ Get all allowances (admin/company view)
// const getAllAllowances = async () => {
//   const res = await apiClient.get("/allowances");
//   return res.data.data; // returns array of allowances
// };

// // ✅ Get allowances by employee ID
// const getAllowancesByEmployee = async (employeeId) => {
//   const res = await apiClient.get(`/allowances/employee/${employeeId}`);
//   return res.data.data; // returns array of allowances for employee
// };

// // ✅ Create allowance
// const createAllowance = async (data) => {
//   const res = await apiClient.post("/allowances", data);
//   return res.data.data; // returns created allowance object
// };

// // ✅ Update allowance
// const updateAllowance = async (id, data) => {
//   const res = await apiClient.put(`/allowances/${id}`, data);
//   return res.data.data; // returns updated allowance object
// };

// // ✅ Delete allowance
// const deleteAllowance = async (id) => {
//   const res = await apiClient.delete(`/allowances/${id}`);
//   return res.data; // returns { success: true, message: "Deleted successfully" }
// };

// // Export all functions
// const allowanceService = {
//   getAllAllowances,
//   getAllowancesByEmployee,
//   createAllowance,
//   updateAllowance,
//   deleteAllowance,
// };

// export default allowanceService;


// import apiClient from "./apiClient";

// const getAllowancesByEmployee = async (employeeId) => {
//   const res = await apiClient.get(`/allowances/employee/${employeeId}`);
//   return res.data.data; // extract the `data` array
// };

// const createAllowance = async (payload) => {
//   const res = await apiClient.post("/allowances", payload);
//   return res.data.data;
// };

// const updateAllowance = async (id, payload) => {
//   const res = await apiClient.put(`/allowances/${id}`, payload);
//   return res.data.data;
// };

// const deleteAllowance = async (id) => {
//   const res = await apiClient.delete(`/allowances/${id}`);
//   return res.data;
// };

// export default {
//   getAllowancesByEmployee,
//   createAllowance,
//   updateAllowance,
//   deleteAllowance,
// };
// ---

import apiClient from "./apiClient";

const getAllowancesByEmployee = async (employeeId) => {
  try {
    const res = await apiClient.get(`/allowances/employee/${employeeId}`);
    return res.data.data;
  } catch (err) {
    if (err.response?.status === 404) {
      return []; // no allowances found, return empty array
    }
    throw err;
  }
};

const createAllowance = async (payload) => {
  const res = await apiClient.post("/allowances", payload);
  return res.data.data;
};

const updateAllowance = async (id, payload) => {
  const res = await apiClient.put(`/allowances/${id}`, payload);
  return res.data.data;
};

const deleteAllowance = async (id) => {
  const res = await apiClient.delete(`/allowances/${id}`);
  return res.data;
};

export default {
  getAllowancesByEmployee,
  createAllowance,
  updateAllowance,
  deleteAllowance,
};
