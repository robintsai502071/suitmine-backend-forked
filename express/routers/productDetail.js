const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

router.get('/products/:productsId', async (req, res, next) => {
  let [productdetail] = await pool.execute(
    'SELECT comment.* , product.id AS productId, product.name AS productName, product.product_photo AS productPhoto, product.product_photo_detail1 AS productDetailPhoto1, product.product_photo_detail2 AS productDetailPhoto2, product.product_photo_detail3 AS productDetailPhoto3, product.product_photo_detail4 AS productDetailPhoto4, product.product_photo_detail5 AS productDetailPhoto5, product.product_photo_detail6 AS productDetailPhoto6, product.price as price, product.content AS productContent, product.pattern_type AS pattern, product.color_type AS color, product.texture_type AS texture, orders.user_id AS ordersUser_id, user.name AS userName, user.photo AS userPhoto FROM comment JOIN product ON  comment.product_id = product.id JOIN orders ON comment.orders_id = orders.id JOIN user ON orders.user_id =user.id WHERE product.id = ?',
    [req.params.productsId]
  );
  res.json(productdetail);
});

module.exports = router;
