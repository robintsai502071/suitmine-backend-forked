const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

router.get('/:productId', async (req, res, next) => {
  let [productDetail] = await pool.execute(
    'SELECT * FROM product WHERE id = ?',
    [req.params.productId]
  );
  productDetail = productDetail[0];

  // 將產品細節圖片整理成一個陣列再回傳給前端
  const productDetailImages = [];
  for (const key in productDetail) {
    // 將含有 product_photo_detail 屬性挑出來
    if (key.includes('product_photo_detail')) {
      // 如果此屬性有值才加入產品細節圖片陣列
      if (productDetail[key] !== null) {
        productDetailImages.push(productDetail[key]);
      }
      // 從物件刪除此屬性
      delete productDetail[key];
    }
  }
  productDetail.productDetailImages = productDetailImages;
  res.json({ success: '取得單筆商品資訊成功！', productDetail });
});

module.exports = router;
