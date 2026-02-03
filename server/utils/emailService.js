const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter
const createTransporter = async () => {
  // In production, use real SMTP settings
  // For development, you can use Ethereal or a test account
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'test@ethereal.email',
      pass: process.env.SMTP_PASS || 'test',
    },
  });
};

// Send email
exports.sendEmail = async (options) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Hotel Complex'}" <${process.env.EMAIL_FROM || 'noreply@hotelcomplex.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    
    // For development, log the preview URL
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

// Send booking confirmation email
exports.sendBookingConfirmation = async (user, booking) => {
  const subject = `Booking Confirmation - ${booking.bookingNumber}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a2e; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .btn { display: inline-block; padding: 10px 20px; background: #e94560; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏨 Hotel Complex</h1>
          <p>Booking Confirmation</p>
        </div>
        <div class="content">
          <h2>Dear ${user.firstName} ${user.lastName},</h2>
          <p>Thank you for your booking! Here are your booking details:</p>
          
          <div class="booking-details">
            <p><strong>Booking Number:</strong> ${booking.bookingNumber}</p>
            <p><strong>Type:</strong> ${booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1)}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
            <p><strong>Total Amount:</strong> $${booking.pricing.totalAmount.toFixed(2)}</p>
          </div>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <a href="${process.env.FRONTEND_URL}/bookings/${booking._id}" class="btn">View Booking</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Hotel Complex. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return this.sendEmail({
    to: user.email,
    subject,
    html,
  });
};

// Send order confirmation email
exports.sendOrderConfirmation = async (user, order) => {
  const subject = `Order Confirmation - ${order.orderNumber}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a2e; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .btn { display: inline-block; padding: 10px 20px; background: #e94560; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍽️ Restaurant & Bar</h1>
          <p>Order Confirmation</p>
        </div>
        <div class="content">
          <h2>Dear ${user.firstName} ${user.lastName},</h2>
          <p>Your order has been received! Here are your order details:</p>
          
          <div class="order-details">
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Type:</strong> ${order.orderType}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
          </div>
          
          <p>Thank you for choosing us!</p>
          <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="btn">View Order</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Hotel Complex. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return this.sendEmail({
    to: user.email,
    subject,
    html,
  });
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const subject = 'Password Reset Request';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a2e; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .btn { display: inline-block; padding: 10px 20px; background: #e94560; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏨 Hotel Complex</h1>
          <p>Password Reset</p>
        </div>
        <div class="content">
          <h2>Dear ${user.firstName},</h2>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="btn">Reset Password</a>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Hotel Complex. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return this.sendEmail({
    to: user.email,
    subject,
    html,
  });
};

