const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

router.get('/', async (req, res, next) => {
  //   取得comment的內容
  let [commentContent] = await pool.execute(`SELECT comment.*,
  orders.product_id AS ordersProductId,
  orders.user_id AS ordersUserId,
  user.name AS userName,
  user.photo AS userPhoto,
  product.name AS productName,
  product.product_photo AS productBigPhoto
  FROM comment
  JOIN orders ON orders.id = comment.orders_id
  JOIN user ON user.id = orders.user_id
  JOIN product ON product.id = comment.product_id`);

  //   取得product的內容
  let [productContent] = await pool.execute(
    `SELECT id, name, product_photo, product_photo_detail1, product_photo_detail2, product_photo_detail3, product_photo_detail4, product_photo_detail5, product_photo_detail6, price, content, pattern_type, color_type, texture_type  FROM product`
  );
  res.json(commentContent);
});

module.exports = router;
