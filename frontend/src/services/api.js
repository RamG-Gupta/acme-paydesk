import axios from 'axios';

const client = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

export const apiService = {
  getEmployees: async ({ page = 1, perPage = 20, search = '', country = '', department = '', status = '' }) => {
    const { data } = await client.get('/employees', {
      params: {
        page,
        per_page: perPage,
        search,
        country,
        department,
        status
      }
    });
    return data;
  },

  getEmployeeDetails: async (id) => {
    const { data } = await client.get(`/employees/${id}`);
    return data;
  },

  updateSalary: async (id, { baseSalary, allowances, changeReason }) => {
    const { data } = await client.patch(`/employees/${id}`, {
      base_salary: Number(baseSalary),
      allowances: Number(allowances),
      change_reason: changeReason
    });
    return data;
  },

  getAnalytics: async () => {
    const { data } = await client.get('/employees/analytics');
    return data;
  }
};

export function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0
    }).format(Number(amount) || 0);
  } catch {
    return `${Number(amount).toFixed(0)} ${currency || ''}`.trim();
  }
}
