// import apiClient from "./apiClient";

// // ✅ Simple helper to fetch branches in clean format (for dropdowns)
// export const getBranches = async () => {
//   try {
//     const response = await apiClient.get("/branches");

//     // response.data = { success: true, data: [...] }
//     const branches = response.data?.data || [];

//     return branches.map(branch => ({
//       id: branch.id,
//       name: branch.name
//     }));
//   } catch (error) {
//     console.error("Error fetching branches:", error);
//     return [];
//   }
// };

// // ✅ Branch service with all CRUD operations
// const branchService = {
//   getAll: async () => {
//     try {
//       const response = await apiClient.get("/branches");
//       return response.data?.data || [];
//     } catch (error) {
//       console.error("Error fetching branches:", error);
//       return [];
//     }
//   },

//   getOne: async (id) => {
//     try {
//       const response = await apiClient.get(`/branches/${id}`);
//       return response.data?.data || null;
//     } catch (error) {
//       console.error(`Error fetching branch ${id}:`, error);
//       return null;
//     }
//   },

//   create: (payload) => apiClient.post("/branches", payload),
//   update: (id, payload) => apiClient.put(`/branches/${id}`, payload),
//   remove: (id) => apiClient.delete(`/branches/${id}`),

//   // ✅ New method: Get departments for a specific branch
   
// };

// export default branchService;











import apiClient from "./apiClient";

// ✅ Simple helper to fetch branches in clean format (for dropdowns)
export const getBranches = async () => {
  try {
    const response = await apiClient.get("/branches");
    const branches = response.data?.data || [];
    return branches.map(branch => ({
      id: branch.id,
      name: branch.name
    }));
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
};

// ✅ Branch service with all CRUD operations
const branchService = {
  getAll: async () => {
    try {
      const response = await apiClient.get("/branches");
      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching branches:", error);
      return [];
    }
  },

  getOne: async (id) => {
    try {
      const response = await apiClient.get(`/branches/${id}`);
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error fetching branch ${id}:`, error);
      return null;
    }
  },

  create: (payload) => apiClient.post("/branches", payload),
  update: (id, payload) => apiClient.put(`/branches/${id}`, payload),
  remove: (id) => apiClient.delete(`/branches/${id}`),
};

export default branchService;
