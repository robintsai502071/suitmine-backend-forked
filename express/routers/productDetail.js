const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

router.get('/', async (req, res, next) => {
  //   取得product中商品照片、價格、名稱
  let [productdetail] =
    await pool.execute(`SELECT product.id, product.name, product.product_photo, product.product_photo_detail1, product.product_photo_detail2, product.product_photo_detail3, product.product_photo_detail4, product.product_photo_detail5, product.product_photo_detail6, product.price, product.content, product.color_type, product.texture_type, product.pattern_type, user.name AS userName, user.photo AS userPhoto, comment.content AS commentContent, comment.create_time AS commentCreateTime FROM product JOIN orders ON orders.product_id = product.id JOIN comment ON comment.product_id = product.id JOIN user ON user.id = orders.user_id
  `);
  console.log(productdetail);
  res.json(productdetail);
});

module.exports = router;
