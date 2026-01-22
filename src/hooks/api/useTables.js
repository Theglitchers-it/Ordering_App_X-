import { useState, useEffect } from 'react';
import * as tableService from '../../api/tableService';

/**
 * Hook for fetching tables
 *
 * Usage:
 * const { tables, loading, error, createTable, downloadQR } = useTables({ merchant_id: 1 });
 */
export function useTables(filters = {}) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTables = async (customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await tableService.getTables({
        ...filters,
        ...customFilters,
      });

      if (result.success) {
        setTables(result.tables || []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const createTable = async (tableData) => {
    try {
      const result = await tableService.createTable(tableData);

      if (result.success) {
        // Add to local state
        setTables((prev) => [...prev, result.table]);
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateTable = async (tableId, updates) => {
    try {
      const result = await tableService.updateTable(tableId, updates);

      if (result.success) {
        // Update local state
        setTables((prev) =>
          prev.map((t) => (t.id === tableId ? result.table : t))
        );
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteTable = async (tableId) => {
    try {
      const result = await tableService.deleteTable(tableId);

      if (result.success) {
        // Remove from local state
        setTables((prev) => prev.filter((t) => t.id !== tableId));
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const regenerateQR = async (tableId) => {
    try {
      const result = await tableService.regenerateQRCode(tableId);

      if (result.success) {
        // Update local state
        setTables((prev) =>
          prev.map((t) => (t.id === tableId ? result.table : t))
        );
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const downloadQR = async (tableId) => {
    try {
      const result = await tableService.downloadQRCode(tableId);
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateTableStatus = async (tableId, status) => {
    try {
      const result = await tableService.updateTableStatus(tableId, status);

      if (result.success) {
        // Update local state
        setTables((prev) =>
          prev.map((t) => (t.id === tableId ? result.table : t))
        );
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    fetchTables();
  }, [JSON.stringify(filters)]);

  return {
    tables,
    loading,
    error,
    refresh: fetchTables,
    createTable,
    updateTable,
    deleteTable,
    regenerateQR,
    downloadQR,
    updateTableStatus,
  };
}

/**
 * Hook for fetching single table
 */
export function useTable(tableId) {
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTable = async () => {
    if (!tableId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await tableService.getTableById(tableId);

      if (result.success) {
        setTable(result.table);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load table');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTable();
  }, [tableId]);

  return {
    table,
    loading,
    error,
    refresh: fetchTable,
  };
}

export default useTables;
