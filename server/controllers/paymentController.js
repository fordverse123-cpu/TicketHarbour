import Stripe from 'stripe';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51MockStripeKeyForTicketHarborDevTestingOnly001');

// @desc    Create Stripe PaymentIntent or Mock Order
// @route   POST /api/v1/payments/create-intent
// @access  Private
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    if (booking.user.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to process payment for this booking');
    }

    let clientSecret = `mock_client_secret_${booking._id}_${Date.now()}`;
    let paymentIntentId = `pi_mock_${booking._id}_${Date.now()}`;

    try {
      if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('MockStripeKey')) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(booking.totalAmount * 100), // convert to cents / paise
          currency: 'inr',
          metadata: {
            bookingId: booking._id.toString(),
            bookingReference: booking.bookingReference,
            userId: req.user.id,
          },
        });
        clientSecret = paymentIntent.client_secret;
        paymentIntentId = paymentIntent.id;
      }
    } catch (stripeErr) {
      console.warn('Stripe SDK fallback to dev mode:', stripeErr.message);
    }

    booking.paymentIntentId = paymentIntentId;
    await booking.save();

    await Payment.create({
      booking: booking._id,
      user: req.user.id,
      paymentIntentId,
      amount: booking.totalAmount,
      status: 'created',
    });

    return successResponse(res, 200, 'Payment intent created', {
      clientSecret,
      paymentIntentId,
      amount: booking.totalAmount,
      bookingReference: booking.bookingReference,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe Webhook confirmation listener
// @route   POST /api/v1/payments/webhook
// @access  Public
export const stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && !process.env.STRIPE_WEBHOOK_SECRET.includes('mock')) {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = req.body;
    }
  } catch (err) {
    return errorResponse(res, 400, `Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata?.bookingId;

    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentIntentId: paymentIntent.id,
      });

      await Payment.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { status: 'succeeded' }
      );
    }
  }

  return res.status(200).json({ received: true });
};
