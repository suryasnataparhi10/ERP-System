// import api from "./api";
import apiClient from "./apiClient";


const getEmployeeSalary = async (employeeId) => {
  const res = await apiClient.get(`/employees/${employeeId}`);
  return res.data;
};

const updateSalary = async (employeeId, data) => {
  const res = await apiClient.post(`/set-salary/${employeeId}`, data);
  return res.data;
};


const getAllowances = async (employeeId) => {
  const res = await apiClient.get(`/allowances?employee_id=${employeeId}`);
  return res.data;
};

const createAllowance = async (employeeId, data) => {
  const res = await apiClient.post(`/allowances`, { ...data, employee_id: employeeId });
  return res.data;
};

const updateAllowance = async (id, data) => {
  const res = await apiClient.put(`/allowances/${id}`, data);
  return res.data;
};

const deleteAllowance = async (id) => {
  const res = await apiClient.delete(`/allowances/${id}`);
  return res.data;
};

// const getPayslips = async (salary_month) => {
//   const res = await apiClient.get(`/payslips?salary_month=${salary_month}`);
//   return res.data;
// };


const getPayslips = async (page = 1, limit = 10, salary_month = "") => {
  const query = salary_month ? `&salary_month=${salary_month}` : "";
  const res = await apiClient.get(`/payslips?page=${page}&limit=${limit}${query}`);
  return res.data; // ? this keeps success, data, pagination
};

const softDeletePayslip = async (employee_id) => {
  const res = await apiClient.delete(`/payslips/${employee_id}/soft-delete`);
  return res.data;
};



const bulkGeneratePayslips = async (data) => {
  const res = await apiClient.post(`/payslips/bulk-create`, data);
  return res.data;
};
const bulkPayment = async (data) => {
  const res = await apiClient.post(`/payslips/bulk-payment`, data);
  return res.data;
};


const salaryService = {
  getEmployeeSalary,
  updateSalary,
  getAllowances,
  createAllowance,
  updateAllowance,
  deleteAllowance,
  getPayslips,
  softDeletePayslip,
  bulkGeneratePayslips,
  bulkPayment,
};



export default salaryService;
