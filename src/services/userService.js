



// // src/services/userService.js
// import apiClient from "./apiClient";
// // Existing functions remain unchanged...
// export const fetchUsers = async () => {
//   const res = await apiClient.get("/users");
//   // return res.data;
//    return res.data.data;
// };

// // Get user by ID
// export const getUserById = async (id) => {
//   const res = await apiClient.get(`/users/${id}`);
//  return res.data;
// };

// export const createUser = async (data) => {
//   const res = await apiClient.post("/users", data);
//   return res.data;
// };

// // export const updateUser = async (id, data) => {
// //   const res = await apiClient.put(`/users/${id}`, data);
// //   return res.data;

// // };

// export const updateUser = async (id, data) => {
//   const res = await apiClient.put(`/users/${id}`, data, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };

// export const deleteUser = async (id) => {
//   const res = await apiClient.delete(`/users/${id}`);
//   return res.data;
// };

// export const resetUserPassword = async (id, newPassword) => {
//   const res = await apiClient.post(`/users/${id}/reset-password`, {
//     password: newPassword,
//   });
//   return res.data;
// };

// export const toggleUserLogin = async (id, enabled) => {
//   const res = await apiClient.post(`/users/${id}/login-toggle`, {
//     status: enabled ? 1 : 0,
//   });
//   return res.data;
// };

// // ========================
// // NEW PROFILE ENDPOINTS
// // ========================

// // Update Profile (name, email, avatar)
// export const updateProfile = async (formData) => {
//   const res = await apiClient.put("/profile", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };

// // Change Password
// export const changePassword = async (id, data) => {
//   const res = await apiClient.put(`/users/change-password/${id}`, data, {
//     headers: { "Content-Type": "application/json" },
//   });
//   return res.data;
// };


// import apiClient from "./apiClient";

// // Fetch all users
// export const fetchUsers = async () => {
//   const res = await apiClient.get("/users");
//   return res.data.data;
// };

// // Get user by ID
// export const getUserById = async (id) => {
//   const res = await apiClient.get(`/users/${id}`);
//   return res.data;
// };

// // Create user
// export const createUser = async (data) => {
//   const res = await apiClient.post("/users", data);
//   return res.data;
// };

// // Update user (supports file upload)
// export const updateUser = async (id, data) => {
//   const res = await apiClient.put(`/users/${id}`, data, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };

// // Delete user
// export const deleteUser = async (id) => {
//   const res = await apiClient.delete(`/users/${id}`);
//   return res.data;
// };

// // Reset user password
// export const resetUserPassword = async (id, newPassword) => {
//   const res = await apiClient.post(`/users/${id}/reset-password`, {
//     password: newPassword,
//   });
//   return res.data;
// };

// // ✅ NEW: Toggle login status
// export const toggleUserLogin = async (id) => {
//   const res = await apiClient.patch(`/users/${id}/toggle-login`);
//   return res.data;
// };

// // ========================
// // PROFILE ENDPOINTS
// // ========================
// export const updateProfile = async (formData) => {
//   const res = await apiClient.put("/profile", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };

// export const changePassword = async (id, data) => {
//   const res = await apiClient.put(`/users/change-password/${id}`, data, {
//     headers: { "Content-Type": "application/json" },
//   });
//   return res.data;
// };


// export const fetchProfile = async () => {
//   const res = await apiClient.get("/profile");
//   return res.data;
// };




import apiClient from "./apiClient";

// Fetch all users
export const fetchUsers = async () => {
  const res = await apiClient.get("/users");
  return res.data.data;
};

// Get user by ID
export const getUserById = async (id) => {
  const res = await apiClient.get(`/users/${id}`);
  return res.data;
};

// Create user - CORRECTED endpoint and data structure
export const createUser = async (data) => {
  const res = await apiClient.post("/users/add", data);
  return res.data;
};

// Update user (supports file upload)
export const updateUser = async (id, data) => {
  const res = await apiClient.put(`/users/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Delete user
export const deleteUser = async (id) => {
  const res = await apiClient.delete(`/users/${id}`);
  return res.data;
};

// Reset user password
export const resetUserPassword = async (id, newPassword) => {
  const res = await apiClient.post(`/users/${id}/reset-password`, {
    password: newPassword,
  });
  return res.data;
};

// Toggle user login status
export const toggleUserLogin = async (id) => {
  const res = await apiClient.patch(`/users/${id}/toggle-login`);
  return res.data;
};

// ========================
// PROFILE ENDPOINTS
// ========================
export const updateProfile = async (formData) => {
  const res = await apiClient.put("/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const changePassword = async (id, data) => {
  const res = await apiClient.put(`/users/change-password/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const fetchProfile = async () => {
  const res = await apiClient.get("/profile");
  return res.data;
};

export const uploadUsersExcel = async (file) => {
  const formData = new FormData();
  formData.append("excel", file); // 👈 must match multer field name

  const res = await apiClient.post("excel/upload-excel", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};