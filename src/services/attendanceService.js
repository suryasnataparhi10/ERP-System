
// // src/services/attendanceService.js
// import apiClient from './apiClient';

// const BASE_URL = '/attendance';

// const attendanceService = {
//   create: (data) => apiClient.post(BASE_URL, data),
//   getAll: (params = {}) => apiClient.get(BASE_URL, { params }),
//   getById: (id) => apiClient.get(`${BASE_URL}/${id}`),
//   update: (id, data) => apiClient.put(`${BASE_URL}/${id}`, data),
//   delete: (id) => apiClient.delete(`${BASE_URL}/${id}`),
//   filter: (params) => apiClient.get(BASE_URL, { params }),

//   // CORRECTED: Use PATCH method for early-leaving and overtime
//   // updateEarlyLeaving: (employeeId, data) =>
//   //   apiClient.patch(`${BASE_URL}/early-leaving/${employeeId}`, data),

//   updateEarlyLeaving: (employeeId, data) =>
//     apiClient.patch(`${BASE_URL}/early-leaving/${employeeId}`, data),

//   updateOvertime: (employeeId, data) =>
//     apiClient.patch(`${BASE_URL}/overtime/${employeeId}`, data),

//   // New methods for attendance management 
//   getByEmployeeAndDate: (employeeId, date) =>
//     apiClient.get(BASE_URL, { params: { employee_id: employeeId, date } }),

//   bulkUpdate: (data) => apiClient.put(`${BASE_URL}/bulk`, data),

//   // Get today's attendance for an employee
//   getTodayAttendance: (employeeId) => {
//     const today = new Date().toISOString().split('T')[0];
//     return apiClient.get(BASE_URL, {
//       params: { employee_id: employeeId, date: today }
//     });
//   }


// };



// export default attendanceService;




// src/services/attendanceService.js
import apiClient from './apiClient';

const BASE_URL = '/attendance';

const attendanceService = {
  create: (data) => apiClient.post(BASE_URL, data),
  getAll: (params = {}) => apiClient.get(BASE_URL, { params }),
  getById: (id) => apiClient.get(`${BASE_URL}/${id}`),
  update: (id, data) => apiClient.put(`${BASE_URL}/${id}`, data),
  delete: (id) => apiClient.delete(`${BASE_URL}/${id}`),
  filter: (params) => apiClient.get(BASE_URL, { params }),

  // CORRECTED: Use PATCH method for early-leaving and overtime
  updateEarlyLeaving: (employeeId, data) =>
    apiClient.patch(`${BASE_URL}/early-leaving/${employeeId}`, data),

  updateOvertime: (employeeId, data) =>
    apiClient.patch(`${BASE_URL}/overtime/${employeeId}`, data),

  // NEW: Add method for employee attendance summary
  getEmployeeAttendanceSummary: (employeeCode, params = {}) =>
    apiClient.get(`/attendance/attendance-summary/${employeeCode}`, { params }),

  // Existing methods for attendance management 
  getByEmployeeAndDate: (employeeId, date) =>
    apiClient.get(BASE_URL, { params: { employee_id: employeeId, date } }),

  bulkUpdate: (data) => apiClient.put(`${BASE_URL}/bulk`, data),

  // Get today's attendance for an employee
  getTodayAttendance: (employeeId) => {
    const today = new Date().toISOString().split('T')[0];
    return apiClient.get(BASE_URL, {
      params: { employee_id: employeeId, date: today }
    });
  }
};

export default attendanceService;