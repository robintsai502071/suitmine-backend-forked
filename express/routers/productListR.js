const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

router.get('/', async (req, res, next) => {
  //   取得product中商品照片、價格、名稱
  let [result] = await pool.execute(
    'SELECT product_photo, price, name FROM `product`'
  );
  res.json(result);
});

module.exports = router;
