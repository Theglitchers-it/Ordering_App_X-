const { Table, Merchant, Order } = require('../models');
const logger = require('../utils/logger');
const QRCode = require('qrcode');

// @route   GET /api/tables
// @desc    Get all tables for a merchant
// @access  Public (if merchant_id provided) or Private
exports.getTables = async (req, res) => {
  try {
    const { merchant_id } = req.query;

    if (!merchant_id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'merchant_id is required'
      });
    }

    const tables = await Table.findAll({
      where: { merchant_id, is_active: true },
      order: [['table_number', 'ASC']],
      include: [
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'business_name', 'slug']
        }
      ]
    });

    res.json({ tables });

  } catch (error) {
    logger.error('Get tables error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get tables'
    });
  }
};

// @route   GET /api/tables/:id
// @desc    Get table by ID
// @access  Public
exports.getTableById = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findByPk(id, {
      include: [
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'business_name', 'slug', 'logo_url', 'phone']
        }
      ]
    });

    if (!table) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Table not found'
      });
    }

    res.json({ table });

  } catch (error) {
    logger.error('Get table error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get table'
    });
  }
};

// @route   POST /api/tables
// @desc    Create table
// @access  Private (merchant_admin)
exports.createTable = async (req, res) => {
  try {
    const {
      merchant_id,
      table_number,
      table_name,
      capacity,
      floor,
      section
    } = req.body;

    // Validation
    if (!merchant_id || !table_number) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'merchant_id and table_number are required'
      });
    }

    // Check merchant exists and permission
    const merchant = await Merchant.findByPk(merchant_id);

    if (!merchant) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Merchant not found'
      });
    }

    const isOwner = merchant.owner_id === req.userId;
    const isAdmin = ['super_admin', 'admin_ops'].includes(req.userRole);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to create tables for this merchant'
      });
    }

    // Check if table number already exists
    const existingTable = await Table.findOne({
      where: { merchant_id, table_number }
    });

    if (existingTable) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Table number already exists for this merchant'
      });
    }

    // Create table (QR will be generated separately)
    const table = await Table.create({
      merchant_id,
      table_number,
      table_name,
      capacity: capacity || 4,
      floor,
      section,
      is_active: true,
      current_status: 'available'
    });

    // Generate QR code URL
    // Format: https://app.orderhub.com/menu/{merchant_slug}/table/{table_id}
    const qrDataUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu/${merchant.slug}/table/${table.id}`;

    // Generate QR code data URL (base64)
    const qrCodeDataURL = await QRCode.toDataURL(qrDataUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1
    });

    // Update table with QR code data
    await table.update({
      qr_code_url: qrDataUrl,
      qr_code_data: qrCodeDataURL
    });

    logger.info(`Table created: ${table.table_number} for merchant ${merchant_id}`);

    res.status(201).json({
      message: 'Table created successfully',
      table
    });

  } catch (error) {
    logger.error('Create table error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create table'
    });
  }
};

// @route   PATCH /api/tables/:id
// @desc    Update table
// @access  Private (merchant owner or admin)
exports.updateTable = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!table) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Table not found'
      });
    }

    // Check permission
    const isOwner = table.merchant.owner_id === req.userId;
    const isAdmin = ['super_admin', 'admin_ops'].includes(req.userRole);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this table'
      });
    }

    // Fields that can be updated
    const allowedFields = [
      'table_number',
      'table_name',
      'capacity',
      'floor',
      'section',
      'is_active',
      'current_status'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await table.update(updates);

    logger.info(`Table updated: ${table.id} by user ${req.userId}`);

    res.json({
      message: 'Table updated successfully',
      table
    });

  } catch (error) {
    logger.error('Update table error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update table'
    });
  }
};

// @route   DELETE /api/tables/:id
// @desc    Delete table
// @access  Private (merchant owner or admin)
exports.deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!table) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Table not found'
      });
    }

    // Check permission
    const isOwner = table.merchant.owner_id === req.userId;
    const isAdmin = ['super_admin', 'admin_ops'].includes(req.userRole);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this table'
      });
    }

    await table.destroy();

    logger.info(`Table deleted: ${table.id} by user ${req.userId}`);

    res.json({
      message: 'Table deleted successfully'
    });

  } catch (error) {
    logger.error('Delete table error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete table'
    });
  }
};

// @route   POST /api/tables/:id/regenerate-qr
// @desc    Regenerate QR code for table
// @access  Private (merchant owner)
exports.regenerateQR = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!table) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Table not found'
      });
    }

    // Check permission
    const isOwner = table.merchant.owner_id === req.userId;

    if (!isOwner) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to regenerate QR for this table'
      });
    }

    // Generate new QR code
    const qrDataUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu/${table.merchant.slug}/table/${table.id}`;

    const qrCodeDataURL = await QRCode.toDataURL(qrDataUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1
    });

    await table.update({
      qr_code_url: qrDataUrl,
      qr_code_data: qrCodeDataURL
    });

    logger.info(`QR code regenerated for table ${table.id}`);

    res.json({
      message: 'QR code regenerated successfully',
      qr_code_data: qrCodeDataURL
    });

  } catch (error) {
    logger.error('Regenerate QR error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to regenerate QR code'
    });
  }
};

// @route   GET /api/tables/:id/qr-download
// @desc    Download QR code as image
// @access  Private (merchant owner)
exports.downloadQR = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!table) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Table not found'
      });
    }

    // Check permission
    const isOwner = table.merchant.owner_id === req.userId;

    if (!isOwner) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to download QR for this table'
      });
    }

    if (!table.qr_code_data) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'QR code not generated for this table'
      });
    }

    // Convert data URL to buffer
    const base64Data = table.qr_code_data.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="table-${table.table_number}-qr.png"`);

    res.send(buffer);

  } catch (error) {
    logger.error('Download QR error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to download QR code'
    });
  }
};

// @route   PATCH /api/tables/:id/status
// @desc    Update table status (available, occupied, reserved, cleaning)
// @access  Private (merchant owner)
exports.updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['available', 'occupied', 'reserved', 'cleaning'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid status'
      });
    }

    const table = await Table.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!table) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Table not found'
      });
    }

    // Check permission
    const isOwner = table.merchant.owner_id === req.userId;

    if (!isOwner) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this table status'
      });
    }

    await table.update({ current_status: status });

    logger.info(`Table ${table.table_number} status updated to ${status}`);

    res.json({
      message: 'Table status updated successfully',
      table
    });

  } catch (error) {
    logger.error('Update table status error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update table status'
    });
  }
};

module.exports = exports;
