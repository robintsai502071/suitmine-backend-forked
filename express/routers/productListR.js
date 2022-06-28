const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

router.get('/', async (req, res, next) => {
  //   取得product中商品照片、價格、名稱
  let [productList] = await pool.execute(
    'SELECT product.id, product.product_photo, product.price, product.name, product.color_type, product_category.name AS productCategoryName, product_category.level AS productCategoryLevel, product_category.parent_id AS productCategotyParentId FROM product JOIN product_category ON product_category.id = product.product_category_id'
  );
  res.json(productList);
  // console.log(productList);
});

module.exports = router;
