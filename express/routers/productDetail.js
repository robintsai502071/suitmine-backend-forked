const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

router.get('/products', async (req, res, next) => {
  //   取得product中商品照片、價格、名稱
  let [productdetail] = await pool.execute(
    `SELECT comment.* ,product.*, orders.user_id AS ordersUser_id, user.name AS userName, user.phone AS userPhoto FROM comment JOIN product ON  comment.product_id = product.id JOIN orders ON comment.orders_id = orders.id JOIN user ON orders.user_id =user.id 
    `
  );
  res.json(productdetail);
});
router.get('/products/:productsId', async (req, res, next) => {
  let [productdetail] = await pool.execute(
    'SELECT comment.* ,product.*, orders.user_id AS ordersUser_id, user.name AS userName, user.phone AS userPhoto FROM comment JOIN product ON  comment.product_id = product.id JOIN orders ON comment.orders_id = orders.id JOIN user ON orders.user_id =user.id WHERE product.id = ?',
    [req.params.productsId]
  );
  res.json(productdetail);
});

module.exports = router;
