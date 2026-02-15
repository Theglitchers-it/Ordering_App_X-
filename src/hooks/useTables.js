import { useState, useEffect, useMemo } from 'react'
import * as tableService from '../api/tableService'
import { getTablesByMerchant as getStaticTables, getTableStats as getStaticStats } from '../data/tables'

const USE_API = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined'

const normalizeTable = (t) => ({
  id: t.id,
  merchantId: t.merchant_id || t.merchantId,
  tableNumber: t.table_number || t.tableNumber,
  capacity: t.capacity || 2,
  status: t.current_status || t.status || 'available',
  location: t.location || 'Interno',
  qrCode: t.qr_code_url || t.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/?table=${t.table_number || t.tableNumber}`)}`,
  currentOrder: t.current_order || t.currentOrder || null
})

export function useTables(merchantId) {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!merchantId) {
      setTables([])
      setLoading(false)
      return
    }

    if (USE_API) {
      loadFromAPI()
    } else {
      loadFromStaticData()
    }
  }, [merchantId])

  const loadFromAPI = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await tableService.getTablesByMerchant(merchantId)
      if (result.success && result.tables?.length > 0) {
        setTables(result.tables.map(normalizeTable))
      } else {
        loadFromStaticData()
      }
    } catch {
      loadFromStaticData()
    } finally {
      setLoading(false)
    }
  }

  const loadFromStaticData = () => {
    setTables(getStaticTables(merchantId))
    setLoading(false)
  }

  const stats = useMemo(() => {
    if (!USE_API || tables.length === 0) {
      return getStaticStats(merchantId)
    }
    const available = tables.filter(t => t.status === 'available').length
    const occupied = tables.filter(t => t.status === 'occupied').length
    return {
      total: tables.length,
      available,
      occupied,
      reserved: tables.filter(t => t.status === 'reserved').length,
      occupancyRate: tables.length > 0 ? ((occupied / tables.length) * 100).toFixed(1) : '0.0'
    }
  }, [tables, merchantId])

  const addTable = async (tableData) => {
    if (USE_API) {
      const result = await tableService.createTable({
        merchant_id: merchantId,
        table_number: tableData.tableNumber,
        capacity: tableData.capacity || 2,
        location: tableData.location || 'Interno'
      })
      if (result.success) {
        const normalized = normalizeTable(result.table)
        setTables(prev => [...prev, normalized])
        return normalized
      }
      return null
    }
    // Demo mode
    const newTable = {
      id: `table_${Date.now()}`,
      merchantId,
      tableNumber: tableData.tableNumber,
      capacity: tableData.capacity || 2,
      status: 'available',
      location: tableData.location || 'Interno',
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/?merchant=${merchantId}&table=${tableData.tableNumber}`)}`,
      currentOrder: null
    }
    setTables(prev => [...prev, newTable])
    return newTable
  }

  const deleteTable = async (tableId) => {
    if (USE_API) {
      await tableService.deleteTable(tableId)
    }
    setTables(prev => prev.filter(t => t.id !== tableId))
  }

  const updateTableStatus = async (tableId, newStatus) => {
    if (USE_API) {
      const result = await tableService.updateTableStatus(tableId, newStatus)
      if (result.success) {
        setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: newStatus } : t))
        return
      }
    }
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: newStatus } : t))
  }

  return {
    tables,
    stats,
    loading,
    error,
    addTable,
    deleteTable,
    updateTableStatus,
    refresh: USE_API ? loadFromAPI : loadFromStaticData
  }
}
