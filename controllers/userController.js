"use strict";

const controller = {};
const models = require("../models");
const sequelize = require("sequelize");
const Op = sequelize.Op;

controller.checkout = async (req, res) => {
  if (req.session.cart.quantity <= 0) {
    return res.redirect("/products");
  }
  let userId = 1;
  res.locals.addresses = await models.Address.findAll({ userId });
  res.locals.cart = req.session.cart.getCart();
  res.render("checkout");
}

controller.placeorders = async (req, res) => {
  let userId = 1;
  let addressId = isNaN(req.body.addressId) ? 0 : parseInt(req.body.addressId);
  let address = await models.Address.findByPk(addressId);
  console.log(address);
  if(!address) {
    address = await models.Address.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      mobile: req.body.mobile,
      address: req.body.address,
      country: req.body.country,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      isDefault: req.body.isDefault,
      userId: userId,
    });
  }

  let cart = req.session.cart;
  cart.paymentMethod = req.body.payment;
  cart.shippingAddress = `${address.firstName} ${address.lastName}, 
  Email: ${address.email}, Address: ${address.address}, ${address.city}, ${address.country},  ${address.state}, ${address.zipCode}`;
  
  switch (req.body.payment) {
    case 'PAYPAL':
      saveOrder(req, res, 'PAID');
      break;
  
    case 'COD':
      saveOrder(req, res, 'UNPAID');
      break;
  }

  // return res.redirect('/users/checkout');
};

async function saveOrder(req, res, status) {
  let userId = 1;
  let { items, ...others} = req.session.cart.getCart();
  let order = await models.Order.create({
    userId,
    ...others,
    status
  });

  let orderDetails = [];
  items.forEach(item => {
    orderDetails.push({
      orderId: order.id,
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      total: item.total,
    });
  });

  await models.OrderDetail.bulkCreate(orderDetails);
  req.session.cart.clear();
  res.render('error', {message: 'Order placed successfully!'});
}
module.exports = controller;
