'use strict';

const controller = {};
const model = require('../models');

controller.showHomepage = async (req, res) => {
  const recentProducts = await model.Product.findAll(
    {
      attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'],
      order: [
        ['createdAt', 'DESC']
      ],
      limit: 10
    }
  );
  const Brand = model.Brand;
  const Category = model.Category;
  const brands = await Brand.findAll();
  const categories = await Category.findAll();
  const secondArr = categories.splice(2, 2);
  const thirdArr = categories.splice(1, 1);

  const featuredProducts = await model.Product.findAll(
    {
      attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'],
      order: [
        ['stars', 'DESC']
      ],
      limit: 10
    }
  );

  res.locals.featuredProducts = featuredProducts;
  res.locals.recentProducts = recentProducts;
  res.locals.categoriesArr = [
    categories,
    secondArr,
    thirdArr,
  ];
  res.render('index', {brands: brands});
}

controller.showPage = (req, res, next) => {
  const pages = [
    "card",
    "checkout",
    "contact",
    "login",
    "my-account",
    "product-detail",
    "product-list",
    "wishlist",
  ];
  const page = req.params.page;
  if (pages.includes(page)) {
    res.render(page);
  }
  next();
};

module.exports = controller;