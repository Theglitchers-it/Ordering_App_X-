const { Order, Merchant, User, Product, Table } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const emailService = require('../services/email.service');

/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}${random}`;
};

// @route   POST /api/orders
// @desc    Create new order
// @access  Public (with customer info) or Private
exports.createOrder = async (req, res) => {
  try {
    const {
      merchant_id,
      table_id,
      table_number,
      customer_name,
      customer_email,
      customer_phone,
      items,
      order_type,
      delivery_address,
      payment_method,
      customer_notes
    } = req.body;

    // Validation
    if (!merchant_id || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Merchant ID and items are required'
      });
    }

    if (!customer_name || !customer_email) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Customer name and email are required'
      });
    }

    // Get merchant
    const merchant = await Merchant.findByPk(merchant_id);

    if (!merchant || merchant.status !== 'active') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Merchant not found or inactive'
      });
    }

    // Calculate totals
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id);

      if (!product || !product.is_available) {
        return res.status(400).json({
          error: 'Validation Error',
          message: `Product ${item.product_id} not available`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        options: item.options || null,
        special_instructions: item.special_instructions || null
      });
    }

    // Calculate fees
    const tax_amount = subtotal * 0.10; // 10% VAT
    const service_fee = order_type === 'dine_in' ? 0 : 2.00; // €2 service fee for takeaway/delivery
    const delivery_fee = order_type === 'delivery' ? 3.50 : 0;
    const total = subtotal + tax_amount + service_fee + delivery_fee;

    // Calculate commission
    const commission_rate = merchant.commission_rate;
    const commission_amount = total * commission_rate;
    const merchant_payout = total - commission_amount;

    // Generate order number
    const order_number = generateOrderNumber();

    // Create order
    const order = await Order.create({
      order_number,
      merchant_id,
      customer_id: req.userId || null,
      customer_name,
      customer_email,
      customer_phone,
      table_id,
      table_number,
      order_type: order_type || 'dine_in',
      delivery_address: delivery_address || null,
      items: processedItems,
      subtotal,
      tax_amount,
      service_fee,
      delivery_fee,
      total,
      payment_method: payment_method || 'cash',
      payment_status: payment_method === 'cash' ? 'pending' : 'pending',
      order_status: 'pending',
      customer_notes,
      commission_rate,
      commission_amount,
      merchant_payout
    });

    logger.info(`Order created: ${order.order_number} for merchant ${merchant_id}`);

    // Send confirmation email
    if (process.env.ENABLE_EMAIL === 'true') {
      await emailService.sendOrderConfirmation(order);
    }

    // Emit WebSocket event to merchant
    const io = req.app.get('io');
    if (io && process.env.ENABLE_WEBSOCKET === 'true') {
      const socketHelper = require('../config/socket');
      socketHelper.emitToMerchant(io, merchant_id, 'order:new', {
        order: {
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_name,
          total: order.total,
          items: processedItems.length,
          order_type: order.order_type,
          table_number: order.table_number
        }
      });
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    logger.error('Create order error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create order'
    });
  }
};

// @route   GET /api/orders
// @desc    Get orders (customer: own orders, merchant: merchant orders, admin: all)
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const { status, merchant_id, page = 1, limit = 20 } = req.query;

    const where = {};

    // User role filtering
    if (req.userRole === 'user') {
      // Customer: only their orders
      where.customer_id = req.userId;
    } else if (req.userRole === 'merchant_admin') {
      // Merchant: only their merchant's orders
      const merchant = await Merchant.findOne({ where: { owner_id: req.userId } });
      if (merchant) {
        where.merchant_id = merchant.id;
      }
    } else if (['super_admin', 'admin_ops'].includes(req.userRole)) {
      // Admin: can filter by merchant or see all
      if (merchant_id) {
        where.merchant_id = merchant_id;
      }
    }

    // Status filter
    if (status) {
      where.order_status = status;
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'business_name', 'slug', 'phone']
        },
        {
          model: User,
          as: 'customer',
          attributes: ['uuid', 'email', 'first_name', 'last_name'],
          required: false
        }
      ]
    });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Get orders error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get orders'
    });
  }
};

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'business_name', 'slug', 'phone', 'address_line1', 'city']
        },
        {
          model: User,
          as: 'customer',
          attributes: ['uuid', 'email', 'first_name', 'last_name'],
          required: false
        },
        {
          model: Table,
          as: 'table',
          attributes: ['id', 'table_number', 'table_name'],
          required: false
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Check permission
    const isCustomer = order.customer_id && order.customer_id === req.userId;
    const isMerchantOwner = await Merchant.findOne({
      where: { id: order.merchant_id, owner_id: req.userId }
    });
    const isAdmin = ['super_admin', 'admin_ops', 'support_agent'].includes(req.userRole);

    if (!isCustomer && !isMerchantOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this order'
      });
    }

    res.json({ order });

  } catch (error) {
    logger.error('Get order error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get order'
    });
  }
};

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private (merchant or admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid status'
      });
    }

    const order = await Order.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Check permission
    const isMerchantOwner = order.merchant.owner_id === req.userId;
    const isAdmin = ['super_admin', 'admin_ops'].includes(req.userRole);

    if (!isMerchantOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this order'
      });
    }

    // Update status with timestamp
    const updates = { order_status: status };

    switch (status) {
      case 'confirmed':
        updates.confirmed_at = new Date();
        break;
      case 'preparing':
        updates.preparing_at = new Date();
        break;
      case 'ready':
        updates.ready_at = new Date();
        break;
      case 'out_for_delivery':
        updates.out_for_delivery_at = new Date();
        break;
      case 'delivered':
        updates.delivered_at = new Date();
        break;
      case 'completed':
        updates.completed_at = new Date();
        break;
      case 'cancelled':
        updates.cancelled_at = new Date();
        break;
    }

    await order.update(updates);

    logger.info(`Order ${order.order_number} status updated to ${status}`);

    // Send status update email
    if (process.env.ENABLE_EMAIL === 'true') {
      await emailService.sendOrderStatusUpdate(order, status);
    }

    // Emit WebSocket event to customer
    const io = req.app.get('io');
    if (io && process.env.ENABLE_WEBSOCKET === 'true' && order.customer_id) {
      const socketHelper = require('../config/socket');
      socketHelper.emitToUser(io, order.customer_id, 'order:status-updated', {
        order_id: order.id,
        order_number: order.order_number,
        status: status,
        timestamp: new Date()
      });
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    logger.error('Update order status error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update order status'
    });
  }
};

// @route   PATCH /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private (customer, merchant, or admin)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.order_status)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Check permission
    const isCustomer = order.customer_id === req.userId;
    const isMerchantOwner = order.merchant.owner_id === req.userId;
    const isAdmin = ['super_admin', 'admin_ops'].includes(req.userRole);

    if (!isCustomer && !isMerchantOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to cancel this order'
      });
    }

    await order.update({
      order_status: 'cancelled',
      cancelled_at: new Date(),
      cancellation_reason: reason || 'Cancelled by user'
    });

    logger.info(`Order ${order.order_number} cancelled. Reason: ${reason}`);

    // TODO: Process refund if payment was made

    res.json({
      message: 'Order cancelled successfully',
      order
    });

  } catch (error) {
    logger.error('Cancel order error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to cancel order'
    });
  }
};

module.exports = exports;
