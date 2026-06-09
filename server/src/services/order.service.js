const Order = require('../models/order.model');
const Settings = require('../models/settings.model');

const defaultWhatsAppTemplate = `DETAILS
ORDER NO:- {{order_number}}
NAME: {{customer_name}}
PH No:- {{customer_phone}}
ADDRESS:- {{customer_address}}
PINCODE:- {{postal_code}}
JERSEY:- {{order_items}}
TOTAL:- ₹{{total_amount}}
DATE:- {{order_date}}`;

const renderTemplate = (template, values) => {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    return values[key] ?? '';
  });
};

const createOrder = async (orderPayload) => {
  const { customer, cart, totalAmount } = orderPayload;

  const orderNumber = await Order.getNextOrderNumber();

  const orderData = {
    order_number: orderNumber,
    customer_id: customer.id,
    shipping_name: customer.name,
    shipping_phone: customer.phone,
    shipping_address: `${customer.address_line_1}${customer.address_line_2 ? ', ' + customer.address_line_2 : ''}, ${customer.city}, ${customer.state} - ${customer.postal_code}`,
    total_amount: totalAmount,
  };

  const newOrder = await Order.create(orderData, cart);

  const settings = await Settings.get();
  const whatsappNumber = settings.whatsapp_number;

  const message = generateWhatsAppMessage(newOrder, customer, settings);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;

  return { order: newOrder, whatsappUrl };
};

const getImageUrl = (item) => {
  if (item.image_url_1) return item.image_url_1;
  if (Array.isArray(item.images) && item.images.length > 0) {
    return item.images[0].url || item.images[0];
  }
  if (Array.isArray(item.jersey_images) && item.jersey_images.length > 0) {
    return item.jersey_images[0].url || item.jersey_images[0];
  }
  if (item.image_url) return item.image_url;
  if (item.cover_image_url) return item.cover_image_url;
  return '';
};

const generateWhatsAppMessage = (order, customer, settings) => {
  const items = order.items
    .map(
      (item) =>
        `- ${item.jersey_name} (${item.size}) x ${item.quantity} - Price: ₹${Number(item.price).toLocaleString('en-IN')}`
    )
    .join('\n');

  const itemsWithImages = order.items
    .map((item, index) => {
      const imageUrl = getImageUrl(item);
      return `${index + 1}.\n\n${item.jersey_name}\n\nSize: ${item.size}\n\nQuantity: ${item.quantity}\n\nPrice: ₹${Number(item.price)}\n\nImage:\n${imageUrl || 'N/A'}`;
    })
    .join('\n\n---\n\n') + (order.items.length > 0 ? '\n\n---\n\n' : '');

  const itemsWithLinks = itemsWithImages;

  const total = `₹${Number(order.total_amount).toLocaleString('en-IN')}`;
  const customerAddress = `${customer.address_line_1}${customer.address_line_2 ? '\n' + customer.address_line_2 : ''}\n${customer.city}, ${customer.state} - ${customer.postal_code}`;
  const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN');

  const template = settings?.whatsapp_message_template || defaultWhatsAppTemplate;
  return renderTemplate(template, {
    order_number: order.order_number,
    customer_name: customer.name,
    customer_phone: customer.phone,
    customer_address: customerAddress,
    postal_code: customer.postal_code,
    order_items: items,
    order_items_with_images: itemsWithImages,
    order_items_with_links: itemsWithLinks,
    total_amount: total,
    order_date: orderDate,
  });
};

const orderService = {
  createOrder,
};

module.exports = { orderService };
