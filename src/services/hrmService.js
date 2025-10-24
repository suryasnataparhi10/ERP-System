// src/services/hrmService.js
import apiClient from './apiClient';
import axios from 'axios';

// Employee APIs
export const getEmployees = async () => {
  try {
    const { data } = await apiClient.get('/employees');
    // data is { success: true, data: [...] }
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return [];
  }
};


// hrmService.js
export const getEmployeeById = async (employeeId) => {
  try {
    const { data } = await apiClient.get(`/employees?employee_id=${employeeId}`);
    return data.data[0]; // assuming backend returns a list
  } catch (error) {
    console.error(`Failed to fetch employee with employee_id ${employeeId}:`, error);
    throw error;
  }
};

// export const getEmployeeByEmployeeId = async (employeeId) => {
//   try {
//     const employees = await getEmployees();
//     return employees.find(emp => emp.employee_id == employeeId);
//   } catch (error) {
//     throw error;
//   }
// };

// In hrmService.js
export const getEmployeeByEmployeeId = async (employeeId) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await apiClient.get(`/employees/${employeeId}`, config);
    return data.data;
  } catch (error) {
    console.error("Error fetching employee:", error);
    throw error;
  }
};

// export const getEmployeeDocuments = async (employeeId) => {
//   try {
//     const { data } = await apiClient.get(`/employee-documents/employee/${employeeId}`);
//     return Array.isArray(data?.data) ? data.data : [];
//   } catch (error) {
//     console.error(`Failed to fetch documents for employee ${employeeId}:`, error);
//     return [];
//   }
// };

export const getEmployeeDocuments = async (employeeId) => {
  try {
    const empData = await getEmployeeByEmployeeId(employeeId);

    const { data } = await apiClient.get(`/employee-documents/employee/${empData.id}`);
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error(`Failed to fetch documents for employee ${employeeId}:`, error);
    return [];
  }
};



export const getEmployeesByBranch = async (branchId) => {
  try {
    const response = await apiClient.get(`/employees/branch/${branchId}`);
    return Array.isArray(response.data?.data) ? response.data.data : [];
  } catch (error) {
    console.error(`Failed to fetch employees for branch ${branchId}:`, error);
    return [];
  }
};

export const getRequiredDocuments = async () => {
  const { data } = await apiClient.get("/documents");
  return data?.data?.filter(doc => doc.is_required === "yes") || [];
};

// export const uploadEmployeeDocument = async (employeeId, documentId, file) => {
//   const token = localStorage.getItem("token");
//   const formData = new FormData();

//   formData.append("employee_id", employeeId.toString().trim());
//   formData.append("document_id", documentId.toString().trim());
//   formData.append("document_value", file);

//   try {
//     const response = await axios.post(
//       `${process.env.REACT_APP_API_BASE_URL}/document/employee-documents`,
//       formData,
//       {
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "multipart/form-data"
//         }
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Document upload error:", {
//       status: error.response?.status,
//       data: error.response?.data,
//       message: error.message
//     });
//     throw error;
//   }
// };

// export const createEmployee = async (payload) => {
//   try {
//     const { data } = await apiClient.post("/employees", payload, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//     return data;   // return full API response (success, message, data)
//   } catch (error) {
//     console.error("Error creating employee:", error);
//     throw error;
//   }
// };

// REPLACE this function in hrmService.js






// export const createEmployee = async (payload) => {
//   try {
//     const token = localStorage.getItem("token");

//     const { data } = await apiClient.post("/employees", payload, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//         ...(token && { Authorization: `Bearer ${token}` }),
//       },
//     });

//     return data;
//   } catch (error) {
//     console.error("Error creating employee:", {
//       message: error.message,
//       code: error.code,
//       status: error.response?.status,
//       data: error.response?.data,
//     });
//     throw error;
//   }
// };


export const createEmployee = async (payload) => {
  try {
    const token = localStorage.getItem("token");

    console.log("📤 Sending employee data to server...");

    const { data } = await apiClient.post("/employees", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    console.log("✅ Employee creation successful:", data);
    return data;
  } catch (error) {
    console.error("❌ FULL ERROR DETAILS:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      // This is the most important part - the server's error response
      serverError: error.response?.data,
      requestData: error.config?.data, // What we sent
    });

    // If server provided error details, use them
    if (error.response?.data) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
};





export const updateEmployee = async (id, formData) => {
  try {
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    // IMPORTANT: send FormData directly (not JSON)
    const { data } = await apiClient.put(`/employees/${id}`, formData, config);


    if (!data?.success) {
      throw new Error(data?.message || "Failed to update employee");
    }

    return data; // keep structure same as backend response
  } catch (error) {
    console.error("Update error details:", {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });
    throw error;
  }
};






export const deleteEmployee = async (employee_id) => {
  try {
    console.log('🔄 Making DELETE request to:', `/employees/${employee_id}`);
    const { data } = await apiClient.delete(`/employees/${employee_id}`);
    console.log('✅ Delete API response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error deleting employee:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};


// Add this to your hrmService.js
// FIXED: rejoinEmployee function in hrmService.js
export const rejoinEmployee = async (rejoinData) => {
  try {
    const token = localStorage.getItem("token");

    console.log("🔄 Making rejoin request for Aadhaar:", rejoinData.aadhaar_number);

    const { data } = await apiClient.post("/employees/rejoin", rejoinData, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    console.log("✅ Rejoin API response:", data);
    return data;
  } catch (error) {
    console.error("❌ Error in rejoin employee API:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      serverError: error.response?.data,
    });

    // If server provided error details, use them
    if (error.response?.data) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
};


// In hrmService.js - CORRECTED
export const checkAadhaar = async (aadhaarData) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // CORRECTED ENDPOINT - Add /employees prefix
    const { data } = await apiClient.post("/employees/check-aadhaar", aadhaarData, config);
    return data;
  } catch (error) {
    console.error("Error checking Aadhaar:", error);
    throw error;
  }
};
// ==============================
// Branch, Department, Designation APIs
// ==============================
export const getBranches = async () => {
  try {
    const response = await apiClient.get("/branches");

    // response.data = { success: true, data: [...] }
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

export const getDepartments = async () => {
  const { data } = await apiClient.get("/departments");
  return data;
};

export const getDesignations = async () => {
  try {
    const { data } = await apiClient.get("/designations");
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch designations:", error);
    return [];
  }
};



// ==============================
// Leave Management APIs
// ==============================

export const getLeaveTypes = async () => {
  try {
    const { data } = await apiClient.get('/leave-types');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch leave types:", error);
    return [];
  }
};

export const fetchLeaves = async (params = {}) => {
  try {
    const { data } = await apiClient.get("/leaves", { params });
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch leaves:", error);
    return [];
  }
};

export const createLeave = async (payload) => {
  const { data } = await apiClient.post("/leaves", payload);
  return data;
};

export const updateLeave = async (id, payload) => {
  const { data } = await apiClient.put(`/leaves/${id}`, payload);
  return data;
};

export const deleteLeave = async (id) => {
  const { data } = await apiClient.delete(`/leaves/${id}`);
  return data;
};

// ==============================
// Trainer APIs
// ==============================
export const getTrainers = async () => {
  try {
    const { data } = await apiClient.get('/trainers');
    // If your API response is like { data: [...] }
    return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
  } catch (error) {
    console.error("Failed to fetch trainers:", error);
    return [];
  }
};


export const createTrainer = async (payload) => {
  try {
    const { data } = await apiClient.post('/trainers', payload);
    return data;
  } catch (error) {
    console.error("Failed to create trainer:", error);
    throw error;
  }
};

export const updateTrainer = async (id, payload) => {
  try {
    const { data } = await apiClient.put(`/trainers/${id}`, payload);
    return data;
  } catch (error) {
    console.error(`Failed to update trainer with id ${id}:`, error);
    throw error;
  }
};

export const deleteTrainer = async (id) => {
  try {
    const { data } = await apiClient.delete(`/trainers/${id}`);
    return data;
  } catch (error) {
    console.error(`Failed to delete trainer with id ${id}:`, error);
    throw error;
  }
};
// ==============================
// Awards APIs
// ==============================



// Get all awards
export const getAwards = async () => {
  try {
    const { data } = await apiClient.get("/awards");
    // controller returns { data: [...] }
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch awards:", error);
    return [];
  }
};

// Get award by ID
export const getAwardById = async (id) => {
  try {
    const { data } = await apiClient.get(`/awards/${id}`);
    // controller returns { data: {...} }
    return data?.data || null;
  } catch (error) {
    console.error(`Failed to fetch award with id ${id}:`, error);
    throw error;
  }
};

// Create award
export const createAward = async (payload) => {
  try {
    const { data } = await apiClient.post("/awards", payload);
    // controller returns { message: "...", data: {...} }
    return data?.data || null;
  } catch (error) {
    console.error("Failed to create award:", error);
    throw error;
  }
};

// Update award
export const updateAward = async (id, payload) => {
  try {
    const { data } = await apiClient.put(`/awards/${id}`, payload);
    // controller returns { message: "...", data: {...} }
    return data?.data || null;
  } catch (error) {
    console.error(`Failed to update award with id ${id}:`, error);
    throw error;
  }
};

// Delete award
export const deleteAward = async (id) => {
  try {
    const { data } = await apiClient.delete(`/awards/${id}`);
    // controller returns { message: "Award deleted" }
    return data?.message || "Deleted successfully";
  } catch (error) {
    console.error(`Failed to delete award with id ${id}:`, error);
    throw error;
  }
};

// ==============================
// Transfer APIs
// ==============================




// Get all transfers
export const getTransfers = async () => {
  try {
    const { data } = await apiClient.get("/transfers");
    // controller returns { data: [...] }
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch transfers:", error);
    return [];
  }
};

// Get transfer by ID
export const getTransferById = async (id) => {
  try {
    const { data } = await apiClient.get(`/transfers/${id}`);
    // controller returns { data: {...} }
    return data?.data || null;
  } catch (error) {
    console.error(`Failed to fetch transfer with id ${id}:`, error);
    throw error;
  }
};

// Create transfer
export const createTransfer = async (payload) => {
  try {
    const { data } = await apiClient.post("/transfers", payload);
    // controller returns { message: "...", data: {...} }
    return data?.data || null;
  } catch (error) {
    console.error("Failed to create transfer:", error);
    throw error;
  }
};

// Update transfer
export const updateTransfer = async (id, payload) => {
  try {
    const { data } = await apiClient.put(`/transfers/${id}`, payload);
    // controller returns { message: "...", data: {...} }
    return data?.data || null;
  } catch (error) {
    console.error(`Failed to update transfer with id ${id}:`, error);
    throw error;
  }
};




// Delete transfer
export const deleteTransfer = async (id) => {
  try {
    const { data } = await apiClient.delete(`/transfers/${id}`);
    // controller returns { message: "Transfer deleted" }
    return data?.message || "Deleted successfully";
  } catch (error) {
    console.error(`Failed to delete transfer with id ${id}:`, error);
    throw error;
  }
};






// ==============================
// Resignation APIs
// ==============================




// =====================
// Get all resignations
// =====================
export const getResignations = async () => {
  try {
    const { data } = await apiClient.get('/resignations');
    // Check if data is wrapped in `data` key
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  } catch (error) {
    console.error('Failed to fetch resignations:', error.response || error);
    return [];
  }
};

// =====================
// Get resignation by ID
// =====================
export const getResignationById = async (id) => {
  try {
    const { data } = await apiClient.get(`/resignations/${id}`);
    return data?.data || null;
  } catch (error) {
    console.error(`Failed to fetch resignation with id ${id}:`, error.response || error);
    return null;
  }
};

// =====================
// Create resignation
// =====================
export const createResignation = async (payload) => {
  try {
    const { data } = await apiClient.post('/resignations', payload);
    return data;
  } catch (error) {
    console.error('Failed to create resignation:', error.response || error);
    throw error;
  }
};

// =====================
// Update resignation
// =====================
export const updateResignation = async (id, payload) => {
  try {
    const { data } = await apiClient.put(`/resignations/${id}`, payload);
    return data;
  } catch (error) {
    console.error(`Failed to update resignation with id ${id}:`, error.response || error);
    throw error;
  }
};

// =====================
// Delete resignation
// =====================
export const deleteResignation = async (id) => {
  try {
    const { data } = await apiClient.delete(`/resignations/${id}`);
    return data;
  } catch (error) {
    console.error(`Failed to delete resignation with id ${id}:`, error.response || error);
    throw error;
  }
};



// ==============================
// Promotion APIs
// ==============================



// ==========================
// Promotions Service
// ==========================

// Fetch all promotions
export const getPromotions = async () => {
  try {
    const { data } = await apiClient.get('/promotions');
    console.log('Promotions API response:', data);

    // Case 1: data wrapped in a `data` key
    if (Array.isArray(data?.data)) return data.data;

    // Case 2: data is a direct array
    if (Array.isArray(data)) return data;

    // Fallback
    return [];
  } catch (error) {
    console.error('Failed to fetch promotions:', error.response || error);
    return [];
  }
};

// Create a promotion
export const createPromotion = async (payload) => {
  try {
    const { data } = await apiClient.post('/promotions', payload);
    return data;
  } catch (error) {
    console.error('Failed to create promotion:', error.response || error);
    throw error;
  }
};

// Update a promotion
export const updatePromotion = async (id, payload) => {
  try {
    const { data } = await apiClient.put(`/promotions/${id}`, payload);
    return data;
  } catch (error) {
    console.error(`Failed to update promotion with id ${id}:`, error.response || error);
    throw error;
  }
};

// Delete a promotion
export const deletePromotion = async (id) => {
  try {
    const { data } = await apiClient.delete(`/promotions/${id}`);
    return data;
  } catch (error) {
    console.error(`Failed to delete promotion with id ${id}:`, error.response || error);
    throw error;
  }
};

// Fetch single promotion by ID
export const getPromotionById = async (id) => {
  try {
    const { data } = await apiClient.get(`/promotions/${id}`);
    return data?.data || null;
  } catch (error) {
    console.error(`Failed to fetch promotion with id ${id}:`, error.response || error);
    return null;
  }
};





// ==============================
// Complaint APIs
// ==============================


export const getComplaints = async () => {
  try {
    const { data } = await apiClient.get('/complaints');

    return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Failed to fetch complaints:", error.response || error);
    return [];
  }
};

export const createComplaint = async (payload) => {
  try {
    const { data } = await apiClient.post('/complaints', payload);
    return data;
  } catch (error) {
    console.error("Failed to create complaint:", error.response || error);
    throw error;
  }
};

export const updateComplaint = async (id, payload) => {
  try {
    const { data } = await apiClient.put(`/complaints/${id}`, payload);
    return data;
  } catch (error) {
    console.error(`Failed to update complaint with id ${id}:`, error.response || error);
    throw error;
  }
};

export const deleteComplaint = async (id) => {
  try {
    const { data } = await apiClient.delete(`/complaints/${id}`);
    return data;
  } catch (error) {
    console.error(`Failed to delete complaint with id ${id}:`, error.response || error);
    throw error;
  }
};


// ==============================
// Warning APIs
// ==============================
export const getWarnings = async () => {
  try {
    const { data } = await apiClient.get('/warnings');
    return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Failed to fetch warnings:", error.response || error);
    return [];
  }
};

export const createWarning = async (payload) => {
  try {
    const { data } = await apiClient.post('/warnings', payload);
    return data;
  } catch (error) {
    console.error("Failed to create warning:", error.response || error);
    throw error;
  }
};

export const updateWarning = async (id, payload) => {
  try {
    const { data } = await apiClient.put(`/warnings/${id}`, payload);
    return data;
  } catch (error) {
    console.error(`Failed to update warning with id ${id}:`, error.response || error);
    throw error;
  }
};

export const deleteWarning = async (id) => {
  try {
    const { data } = await apiClient.delete(`/warnings/${id}`);
    return data;
  } catch (error) {
    console.error(`Failed to delete warning with id ${id}:`, error.response || error);
    throw error;
  }
};

// ==============================
// Termination APIs
// ==============================

// export const getTerminations = async () => {
//   try {
//     const { data } = await apiClient.get('/terminations');
//     return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
//   } catch (error) {
//     console.error("Failed to fetch terminations:", error);
//     return [];
//   }
// };

// export const createTermination = async (payload) => {
//   try {
//     const { data } = await apiClient.post('/terminations', payload);
//     return data;
//   } catch (error) {
//     console.error("Failed to create termination:", error.response || error);
//     throw error;
//   }
// };

// export const updateTermination = async (id, payload) => {
//   try {
//     const { data } = await apiClient.put(`/terminations/${id}`, payload);
//     return data;
//   } catch (error) {
//     console.error(`Failed to update termination with id ${id}:`, error.response || error);
//     throw error;
//   }
// };

// export const deleteTermination = async (id) => {
//   try {
//     const { data } = await apiClient.delete(`/terminations/${id}`);
//     return data;
//   } catch (error) {
//     console.error(`Failed to delete termination with id ${id}:`, error.response || error);
//     throw error;
//   }
// };


export const getTerminations = async () => {
  try {
    const { data } = await apiClient.get('/terminations');
    return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Failed to fetch terminations:", error);
    return [];
  }
};

export const createTermination = async (payload) => {
  try {
    const { data } = await apiClient.post('/terminations', payload);
    return data;
  } catch (error) {
    console.error("Failed to create termination:", error.response || error);
    throw error;
  }
};

export const updateTermination = async (id, payload) => {
  try {
    const { data } = await apiClient.put(`/terminations/${id}`, payload);
    return data;
  } catch (error) {
    console.error(`Failed to update termination with id ${id}:`, error.response || error);
    throw error;
  }
};

export const deleteTermination = async (id) => {
  try {
    const { data } = await apiClient.delete(`/terminations/${id}`);
    return data;
  } catch (error) {
    console.error(`Failed to delete termination with id ${id}:`, error.response || error);
    throw error;
  }
};



// ==============================
// Announcements APIs
// ==============================


// =======================
// Fetch all announcements
// =======================

// export const getAnnouncements = async () => {
//   try {
//     const response = await apiClient.get("/announcements");
//     // Backend sends raw array
//     return Array.isArray(response.data) ? response.data : [];
//   } catch (error) {
//     console.error("Failed to fetch announcements:", error);
//     return [];
//   }
// };


// // =======================
// // Create a new announcement
// // =======================
// export const createAnnouncement = async (payload) => {
//   try {
//     const { data } = await apiClient.post("/announcements", payload);
//     return data; // returns { success, message, data }
//   } catch (error) {
//     console.error("Failed to create announcement:", error.response || error);
//     throw error;
//   }
// };

// // =======================
// // Update an existing announcement
// // =======================
// export const updateAnnouncement = async (id, payload) => {
//   try {
//     const { data } = await apiClient.put(`/announcements/${id}`, payload);
//     return data;
//   } catch (error) {
//     console.error(`Failed to update announcement with id ${id}:`, error.response || error);
//     throw error;
//   }
// };

// // =======================
// // Delete an announcement
// // =======================
// export const deleteAnnouncement = async (id) => {
//   try {
//     const { data } = await apiClient.delete(`/announcements/${id}`);
//     return data;
//   } catch (error) {
//     console.error(`Failed to delete announcement with id ${id}:`, error.response || error);
//     throw error;
//   }
// };


export const getAnnouncements = async () => {
  try {
    const response = await apiClient.get("/announcements");
    // backend returns { success: true, data: [...] }
    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    return [];
  }
};

export const createAnnouncement = async (payload) => {
  try {
    const { data } = await apiClient.post("/announcements", payload);
    return data.data; // announcement object
  } catch (error) {
    console.error("Failed to create announcement:", error.response || error);
    throw error;
  }
};

export const updateAnnouncement = async (id, payload) => {
  try {
    const { data } = await apiClient.put(`/announcements/${id}`, payload);
    return data.data; // updated object
  } catch (error) {
    console.error(`Failed to update announcement with id ${id}:`, error.response || error);
    throw error;
  }
};

export const deleteAnnouncement = async (id) => {
  try {
    const { data } = await apiClient.delete(`/announcements/${id}`);
    return data.success;
  } catch (error) {
    console.error(`Failed to delete announcement with id ${id}:`, error.response || error);
    throw error;
  }
};



export const getTerminationTypes = async () => {
  const response = await apiClient.get("/termination-types");
  return response.data;
};


// Holidays API

// export const getHolidays = async () => {
//   try {
//     const { data } = await apiClient.get("/holidays");
//     return Array.isArray(data) ? data : [];
//   } catch (error) {
//     console.error("Failed to fetch holidays:", error.response || error);
//     return [];
//   }
// };

// export const createHoliday = async (payload) => {
//   try {
//     const { data } = await apiClient.post("/holidays", payload);
//     return data;
//   } catch (error) {
//     console.error("Failed to create holiday:", error.response || error);
//     throw error;
//   }
// };

// export const updateHoliday = async (id, payload) => {
//   try {
//     const { data } = await apiClient.put(`/holidays/${id}`, payload);
//     return data;
//   } catch (error) {
//     console.error(`Failed to update holiday ${id}:`, error.response || error);
//     throw error;
//   }
// };

// export const deleteHoliday = async (id) => {
//   try {
//     const { data } = await apiClient.delete(`/holidays/${id}`);
//     return data;
//   } catch (error) {
//     console.error(`Failed to delete holiday ${id}:`, error.response || error);
//     throw error;
//   }
// };

export const getHolidays = async () => {
  try {
    const { data } = await apiClient.get("/holidays");
    return data?.data || []; // unwrap array from { success, data }
  } catch (error) {
    console.error("Failed to fetch holidays:", error.response || error);
    return [];
  }
};

export const createHoliday = async (payload) => {
  try {
    const { data } = await apiClient.post("/holidays", payload);
    return data.data; // unwrap single holiday object
  } catch (error) {
    console.error("Failed to create holiday:", error.response || error);
    throw error;
  }
};

export const updateHoliday = async (id, payload) => {
  try {
    const { data } = await apiClient.put(`/holidays/${id}`, payload);
    return data.data; // unwrap updated holiday object
  } catch (error) {
    console.error(`Failed to update holiday ${id}:`, error.response || error);
    throw error;
  }
};

export const deleteHoliday = async (id) => {
  try {
    const { data } = await apiClient.delete(`/holidays/${id}`);
    return data.success; // returns true if deleted
  } catch (error) {
    console.error(`Failed to delete holiday ${id}:`, error.response || error);
    throw error;
  }
};


export const getTrainings = async () => {
  try {
    const { data } = await apiClient.get("/trainings");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch trainings:", error);
    return [];
  }
};

export const createTraining = async (payload) => {
  try {
    const { data } = await apiClient.post("/trainings", payload);
    return data;
  } catch (error) {
    console.error("Failed to create training:", error);
    throw error;
  }
};

export const updateTraining = async (id, payload) => {
  try {
    console.log("Updating training with payload:", payload); // debug line
    const { data } = await apiClient.put(`/trainings/${id}`, payload);
    return data;
  } catch (error) {
    console.error("Failed to update training:", error.response?.data || error);
    throw error;
  }
};


export const deleteTraining = async (id) => {
  try {
    const { data } = await apiClient.delete(`/trainings/${id}`);
    return data;
  } catch (error) {
    console.error("Failed to delete training:", error);
    throw error;
  }
};

export const getTrainingTypes = async () => {
  try {
    const { data } = await apiClient.get("/training-types");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch training types:", error);
    return [];
  }
};


