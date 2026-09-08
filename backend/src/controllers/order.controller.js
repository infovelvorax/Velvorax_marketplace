import { Order } from '../models/Order.js';
import { Listing } from '../models/Listing.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';

// Helper to generate a unique readable Order Number like VX10025
const generateOrderNumber = async () => {
  const count = await Order.countDocuments();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `VX${10000 + count + 1}-${randomSuffix}`;
};

// @desc    Create new purchase / order (Buyer)
// @route   POST /api/marketplace/orders
// @access  Private/Buyer
export const createOrder = async (req, res) => {
  try {
    const { listingId, shippingAddress, paymentMethod = 'DIRECT_MARKETPLACE', notes } = req.body;

    if (!listingId) {
      return res.status(400).json({ success: false, message: 'Listing ID is required' });
    }

    const listing = await Listing.findById(listingId).populate('sellerId');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'This listing is not currently available for purchase because it has not been approved by an administrator.'
      });
    }

    if (listing.sellerId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot purchase your own listing' });
    }

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      buyerId: req.user._id,
      sellerId: listing.sellerId._id,
      listingId: listing._id,
      amount: listing.price || 0,
      currency: listing.currency || 'INR',
      currencySymbol: listing.currencySymbol || '₹',
      paymentStatus: 'PAID',
      orderStatus: 'COMPLETED',
      paymentMethod,
      shippingAddress: shippingAddress || {
        fullName: req.user.name,
        phone: req.user.phone,
        city: req.user.location?.city || '',
        country: req.user.location?.country || 'India'
      },
      notes: notes || ''
    });

    // Notify seller
    await Notification.create({
      userId: listing.sellerId._id,
      title: 'New Order Received! 🛍️',
      message: `Buyer ${req.user.name} placed order #${orderNumber} for "${listing.title}" for ${order.currencySymbol}${order.amount.toLocaleString()}.`,
      type: 'OFFER',
      link: `/seller/orders`
    });

    // Notify buyer
    await Notification.create({
      userId: req.user._id,
      title: 'Order Confirmed! 🎉',
      message: `Your order #${orderNumber} for "${listing.title}" has been confirmed.`,
      type: 'SYSTEM',
      link: `/buyer/purchases`
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('sellerId', 'name email phone profilePhoto location rating verificationStatus')
      .populate('buyerId', 'name email phone profilePhoto location')
      .populate('listingId', 'title price images categorySlug listingType details');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create order' });
  }
};

// @desc    Get all purchases made by logged-in Buyer
// @route   GET /api/marketplace/orders/buyer/purchases
// @access  Private
export const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id })
      .populate('sellerId', 'name email phone profilePhoto location rating verificationStatus')
      .populate('listingId', 'title price images categorySlug listingType details location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders / sales for logged-in Seller
// @route   GET /api/marketplace/orders/seller/sales
// @access  Private/Seller
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.user._id })
      .populate('buyerId', 'name email phone profilePhoto location')
      .populate('listingId', 'title price images categorySlug listingType details')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all marketplace orders (Admin)
// @route   GET /api/marketplace/orders/admin/all
// @access  Private/Admin
export const getAdminOrders = async (req, res) => {
  try {
    const { status, q, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.orderStatus = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone')
      .populate('listingId', 'title price images categorySlug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: orders,
      stats: {
        totalOrders: total,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/marketplace/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization: Admin or the Seller of the order
    const isSeller = order.sellerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }

    const validOrderStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
    const validPaymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

    if (orderStatus) {
      const targetOrderStatus = String(orderStatus).toUpperCase();
      if (!validOrderStatuses.includes(targetOrderStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid order status provided' });
      }
      order.orderStatus = targetOrderStatus;
    }

    if (paymentStatus) {
      const targetPaymentStatus = String(paymentStatus).toUpperCase();
      if (!validPaymentStatuses.includes(targetPaymentStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid payment status provided' });
      }
      order.paymentStatus = targetPaymentStatus;
    }

    await order.save();

    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${order.orderStatus}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
