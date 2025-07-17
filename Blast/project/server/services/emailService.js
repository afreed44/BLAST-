// Simple email service for order confirmations
// In a production environment, you would use services like SendGrid, Nodemailer with SMTP, etc.

const sendOrderConfirmationEmail = async (order, userEmail) => {
  try {
    // Validate inputs
    if (!order || !userEmail) {
      throw new Error('Order and user email are required');
    }

    if (!order.orderNumber || !order.trackingNumber) {
      throw new Error('Order must have orderNumber and trackingNumber');
    }

    // For now, we'll just log the email content
    // In production, replace this with actual email sending logic

    const emailContent = {
      to: userEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: generateOrderConfirmationHTML(order),
      text: generateOrderConfirmationText(order)
    };

    console.log('📧 Order Confirmation Email:');
    console.log('To:', emailContent.to);
    console.log('Subject:', emailContent.subject);
    console.log('Content:', emailContent.text);

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      success: true,
      message: 'Order confirmation email sent successfully'
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      message: `Failed to send order confirmation email: ${error.message}`
    };
  }
};

const generateOrderConfirmationHTML = (order) => {
  try {
    const itemsHTML = (order.items || []).map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.product?.name || 'Unknown Product'} (${item.product?.brand || 'Unknown Brand'})
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity || 0}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${item.price || 0}
        </td>
      </tr>
    `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Order Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="margin-bottom: 30px;">
            <h2 style="color: #dc2626; margin-bottom: 15px;">Order Details</h2>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
            <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
            <p><strong>Status:</strong> ${order.orderStatus}</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #dc2626; margin-bottom: 15px;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #dc2626; margin-bottom: 15px;">Shipping Address</h3>
            <p>
              ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
              ${order.shippingAddress.country}<br>
              ${order.shippingAddress.phone ? `Phone: ${order.shippingAddress.phone}` : ''}
            </p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; text-align: right;">
            <p style="margin: 5px 0;"><strong>Subtotal: ₹${order.subtotal}</strong></p>
            <p style="margin: 5px 0;"><strong>Shipping: ₹${order.shipping}</strong></p>
            <p style="margin: 5px 0;"><strong>Tax: ₹${order.tax}</strong></p>
            <hr style="margin: 10px 0;">
            <p style="margin: 5px 0; font-size: 18px; color: #dc2626;"><strong>Total: ₹${order.total}</strong></p>
          </div>

          <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 5px;">
            <h4 style="color: #1976d2; margin-bottom: 10px;">What's Next?</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>You'll receive tracking updates as your order progresses</li>
              <li>Your order will be delivered to the address provided above</li>
              <li>You can track your order anytime using tracking number: <strong>${order.trackingNumber}</strong></li>
            </ul>
          </div>

          <div style="margin-top: 30px; text-align: center; color: #666;">
            <p>Thank you for shopping with BLAST Podilato!</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  } catch (error) {
    console.error('Error generating email HTML:', error);
    return `<html><body><h1>Order Confirmation - ${order.orderNumber || 'Unknown'}</h1><p>Thank you for your order!</p></body></html>`;
  }
};

const generateOrderConfirmationText = (order) => {
  try {
    const itemsText = (order.items || []).map(item =>
      `- ${item.product?.name || 'Unknown Product'} (${item.product?.brand || 'Unknown Brand'}) x${item.quantity || 0} - ₹${item.price || 0}`
    ).join('\n');

  return `
Order Confirmation - ${order.orderNumber}

Thank you for your purchase! Your order has been confirmed and is being processed.

ORDER DETAILS:
- Order Number: ${order.orderNumber}
- Tracking Number: ${order.trackingNumber}
- Order Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}
- Estimated Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}
- Payment Method: ${order.paymentMethod.toUpperCase()}
- Status: ${order.orderStatus}

ITEMS ORDERED:
${itemsText}

SHIPPING ADDRESS:
${order.shippingAddress.firstName} ${order.shippingAddress.lastName}
${order.shippingAddress.street}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
${order.shippingAddress.country}
${order.shippingAddress.phone ? `Phone: ${order.shippingAddress.phone}` : ''}

ORDER SUMMARY:
Subtotal: ₹${order.subtotal}
Shipping: ₹${order.shipping}
Tax: ₹${order.tax}
Total: ₹${order.total}

WHAT'S NEXT?
- You'll receive tracking updates as your order progresses
- Your order will be delivered to the address provided above
- You can track your order anytime using tracking number: ${order.trackingNumber}

Thank you for shopping with BLAST Podilato!
If you have any questions, please contact our support team.
  `.trim();
  } catch (error) {
    console.error('Error generating email text:', error);
    return `Order Confirmation - ${order.orderNumber || 'Unknown'}\n\nThank you for your order! We'll send you updates soon.`;
  }
};

module.exports = {
  sendOrderConfirmationEmail
};
