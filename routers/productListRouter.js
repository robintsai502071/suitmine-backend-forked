const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

router.post('/', async (req, res, next) => {
  // 取得 product

  const { product_category_id, product_category_level } = req.body;
  // 定義篩選條件，若前端有傳來 product_category_level 就用 level 去篩選
  // 若沒有則用 id 篩選
  const filterStatement = product_category_level
    ? `WHERE pc.level = ${product_category_level}`
    : `WHERE p.product_category_id = ${product_category_id}`;

  let [products] = await pool.execute(
    `SELECT
  p.id,
  p.name AS product_name,
  pc.name AS product_category,
  p.price AS product_price,
  p.description,
  p.color_spec,
  p.pattern_spec,
  p.fabric_spec,
  p.fabric_weight_spec,
  p.product_photo,
  p.product_photo_detail1,
  p.product_photo_detail2,
  p.product_photo_detail3,
  p.product_photo_detail4,
  p.product_photo_detail5,
  p.product_photo_detail6
  FROM product p
  JOIN product_category pc
  ON p.product_category_id = pc.id
  ${filterStatement}
  `
  );
  res.json({ success: '取得商品成功！', data: products });
});

module.exports = router;
