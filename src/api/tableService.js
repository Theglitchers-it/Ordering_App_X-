import apiClient, { handleApiError, logApiCall } from './apiClient';

/**
 * Table Service
 * Handles restaurant tables and QR code generation
 */

/**
 * Get all tables (with filters)
 */
export const getTables = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.merchant_id) params.append('merchant_id', filters.merchant_id);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = `/tables${queryString ? '?' + queryString : ''}`;

    logApiCall('GET', endpoint);

    const response = await apiClient.get(endpoint);

    return {
      success: true,
      tables: response.data.tables
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get table by ID
 */
export const getTableById = async (tableId) => {
  try {
    logApiCall('GET', `/tables/${tableId}`);

    const response = await apiClient.get(`/tables/${tableId}`);

    return {
      success: true,
      table: response.data.table
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Create new table (auto-generates QR code)
 */
export const createTable = async (tableData) => {
  try {
    logApiCall('POST', '/tables', { table_number: tableData.table_number });

    const response = await apiClient.post('/tables', tableData);

    return {
      success: true,
      table: response.data.table,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update table
 */
export const updateTable = async (tableId, updates) => {
  try {
    logApiCall('PATCH', `/tables/${tableId}`, updates);

    const response = await apiClient.patch(`/tables/${tableId}`, updates);

    return {
      success: true,
      table: response.data.table,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete table (soft delete)
 */
export const deleteTable = async (tableId) => {
  try {
    logApiCall('DELETE', `/tables/${tableId}`);

    const response = await apiClient.delete(`/tables/${tableId}`);

    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Regenerate QR code for table
 */
export const regenerateQRCode = async (tableId) => {
  try {
    logApiCall('POST', `/tables/${tableId}/regenerate-qr`);

    const response = await apiClient.post(`/tables/${tableId}/regenerate-qr`);

    return {
      success: true,
      table: response.data.table,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Download QR code as PNG
 */
export const downloadQRCode = async (tableId) => {
  try {
    logApiCall('GET', `/tables/${tableId}/qr-download`);

    const response = await apiClient.get(`/tables/${tableId}/qr-download`, {
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `table-${tableId}-qr.png`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: 'QR Code scaricato con successo'
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update table status
 */
export const updateTableStatus = async (tableId, status) => {
  try {
    logApiCall('PATCH', `/tables/${tableId}/status`, { status });

    const response = await apiClient.patch(`/tables/${tableId}/status`, {
      current_status: status
    });

    return {
      success: true,
      table: response.data.table,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get tables by merchant
 */
export const getTablesByMerchant = async (merchantId) => {
  return getTables({ merchant_id: merchantId });
};

export default {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  regenerateQRCode,
  downloadQRCode,
  updateTableStatus,
  getTablesByMerchant
};
