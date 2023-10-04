"use strict";

const controller = {};
const model = require("../models");
const sequelize = require("sequelize");
const Op = sequelize.Op;

controller.getData = async (req, res, next) => {
  const categories = await model.Category.findAll({
    include: [
      {
        model: model.Product,
      },
    ],
  });
  res.locals.categories = categories;

  const brands = await model.Brand.findAll({
    include: [
      {
        model: model.Product,
      },
    ],
  });
  res.locals.brands = brands;

  const tags = await model.Tag.findAll();
  res.locals.tags = tags;

  next();
};

controller.show = async (req, res) => {
  let category = isNaN(req.query.category) ? 0 : parseInt(req.query.category);
  let brand = isNaN(req.query.brand) ? 0 : parseInt(req.query.brand);
  let tag = isNaN(req.query.tag) ? 0 : parseInt(req.query.tag);
  let keyword = req.query.keyword || "";
  let sort = ["price", "newest", "popular"].includes(req.query.sort)
    ? req.query.sort
    : "price";
  let page = isNaN(req.query.page) ? 1 : Math.max(1, parseInt(req.query.page));

  let productOptions = {
    attributes: ["id", "name", "imagePath", "stars", "price", "oldPrice"],
    where: {},
  };

  if (category > 0) {
    productOptions.where.categoryId = category;
  }

  if (brand > 0) {
    productOptions.where.brandId = brand;
  }

  if (tag > 0) {
    productOptions.include = [
      {
        model: model.Tag,
        where: {
          id: tag,
        },
      },
    ];
  }

  if (keyword.trim() != "") {
    productOptions.where.name = {
      [Op.iLike]: `%${keyword}%`,
    };
  }
  switch (sort) {
    case "newest":
      productOptions.order = [["createdAt", "DESC"]];
      break;
    case "popular":
      productOptions.order = [["stars", "DESC"]];
      break;
    default:
      productOptions.order = [["price", "ASC"]];
      break;
  }
  res.locals.originalUrl = removeParam("sort", req.originalUrl);
  res.locals.sort = sort;

  if (Object.keys(req.query).length == 0) {
    res.locals.originalUrl = res.locals.originalUrl + "?";
  }

  const limit = 6;
  productOptions.limit = limit;
  productOptions.offset = limit * (page - 1);
  let {rows, count} = await model.Product.findAndCountAll(productOptions);
  res.locals.pagination ={
    page: page,
    limit: limit,
    totalRows: count,
    queryParams: req.query
  }
  res.locals.products = rows;
  res.render("product-list");
};

controller.showDetails = async (req, res) => {
  const id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
  let product = await model.Product.findOne({
    attributes: [
      "id",
      "name",
      "name",
      "stars",
      "price",
      "oldPrice",
      "description",
      "specification",
    ],
    where: {
      id: id,
    },
    include: [
      { model: model.Image, attributes: ["name", "imagePath"] },
      {
        model: model.Review,
        attributes: ["id", "review", "stars", "createdAt"],
        include: [{ model: model.User, attributes: ["firstName", "lastName"] }],
      },
      {
        model: model.Tag,
        attributes: ["id"],
      }
    ],
  });

  let tagIds = product.Tags.map((tag) => tag.id);
  let relatedProducts = await model.Product.findAll({
    attributes: ["id", "name", "imagePath", "stars", "price", "oldPrice"],
    include: [
      {
        model: model.Tag,
        attributes: ["id"],
        where: {
          id: {
            [Op.in]: tagIds,
          },
        },
      },
    ],
    limit: 10,
  });
  res.locals.product = product;
  res.locals.relatedProducts = relatedProducts;
  res.render("product-detail");
};

function removeParam(key, sourceURL) {
  var rtn = sourceURL.split("?")[0],
    param,
    params_arr = [],
    queryString = sourceURL.indexOf("?") !== -1 ? sourceURL.split("?")[1] : "";
  if (queryString !== "") {
    params_arr = queryString.split("&");
    for (var i = params_arr.length - 1; i >= 0; i -= 1) {
      param = params_arr[i].split("=")[0];
      if (param === key) {
        params_arr.splice(i, 1);
      }
    }
    if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
  }
  return rtn;
}

module.exports = controller;
