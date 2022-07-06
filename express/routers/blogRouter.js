const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 引入圖片處理套件 for image upload
const multer = require('multer');
// 引入 node.js 內建 path，(圖片儲存位置會用到)
const path = require('path');
require('dotenv').config();

// 設定貼文封面圖片儲存位置
const thumbnailStorage = multer.diskStorage({
  // 設定儲存目的地(檔案夾)
  // 就是要這要寫，套件規定的
  destination: function (req, file, cb) {
    // cb 的第一個參數是給 error，這邊單純存圖片，沒什麼錯誤就給 NULL
    // 第二個參數指定圖片上傳到什麼位址，這邊設定要放在根目錄下的 uploadedByUser/updatedAvatar
    cb(null, path.join(__dirname, '..', 'blog', 'thumbnail'));
  },
  // 重新命名使用者上傳的圖片名稱
  filename: function (req, file, cb) {
    let ext = file.originalname.split('.').pop();
    let newFilename = `${Date.now()}.${ext}`;
    cb(null, newFilename);
    // file
    // {
    //   fieldname: 'photo',
    //   originalname: 'japan04-200.jpg',
    //   encoding: '7bit',
    //   mimetype: 'image/jpeg'
    // }
  },
});
// 這是一個中間件
const thumbnailUploader = multer({
  //設定儲存位置
  storage: thumbnailStorage,
  // 過濾檔案類型
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype !== 'image/jpeg' &&
      file.mimetype !== 'image/jpg' &&
      file.mimetype !== 'image/png'
    ) {
      cb('這不是可被接受的格式!', false);
    } else {
      cb(null, true);
    }
  },
  // 檔案尺寸的過濾
  // limits: {
  //   // 1k = 1024
  //   fileSize: 200 * 1024,
  // },
});

// 設定貼文內文圖片儲存位置
const postStorage = multer.diskStorage({
  // 設定儲存目的地(檔案夾)
  // 就是要這要寫，套件規定的
  destination: function (req, file, cb) {
    // cb 的第一個參數是給 error，這邊單純存圖片，沒什麼錯誤就給 NULL
    // 第二個參數指定圖片上傳到什麼位址，這邊設定要放在根目錄下的 uploadedByUser/updatedAvatar
    cb(null, path.join(__dirname, '..', 'blog', 'post'));
  },
  // 重新命名使用者上傳的圖片名稱
  filename: function (req, file, cb) {
    let ext = file.originalname.split('.').pop();
    let newFilename = `${Date.now()}.${ext}`;
    cb(null, newFilename);
    // file
    // {
    //   fieldname: 'photo',
    //   originalname: 'japan04-200.jpg',
    //   encoding: '7bit',
    //   mimetype: 'image/jpeg'
    // }
  },
});
// 這是一個中間件
const postImageUploader = multer({
  //設定儲存位置
  storage: postStorage,
  // 過濾檔案類型
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype !== 'image/jpeg' &&
      file.mimetype !== 'image/jpg' &&
      file.mimetype !== 'image/png'
    ) {
      cb('這不是可被接受的格式!', false);
    } else {
      cb(null, true);
    }
  },
  // 檔案尺寸的過濾
  // limits: {
  //   // 1k = 1024
  //   fileSize: 200 * 1024,
  // },
});

// 上傳 blog thubnail API
router.post(
  '/upload-thumbnail',
  thumbnailUploader.single('photo'),
  async (req, res, next) => {
    if (req.file) {
      let link = process.env.BASE_URL + '/blog/thumbnail/' + req.file.filename;
      // response
      res.json({ success: '圖片上傳成功', data: { link } });
    } else {
      res.status(400).json({ eror: '圖片上傳失敗！' });
    }
  }
);

// 上傳 blog post image API
router.post(
  '/upload-post-image',
  postImageUploader.single('photo'),
  async (req, res, next) => {
    if (req.file) {
      let link = '/blog/post/' + req.file.filename;
      // let link = process.env.BASE_URL + '/blog/post/' + req.file.filename;
      // let link = 'http://localhost:3001'+ '/blog/post/' + req.file.filename;
      // response
      res.json({ success: '圖片上傳成功', data: { link } });
    } else {
      res.status(400).json({ eror: '圖片上傳失敗！' });
    }
  }
);

// 撈出所有 blogs
router.get('/', async (req, res, next) => {
  let [blogs] = await pool.execute(`SELECT * FROM blog`);

  return res.json({ success: '獲取全部 blogs 成功！', blogs });
});

// 撈出特定一筆 blog
router.get('/:blogId', async (req, res, next) => {
  let [blog] = await pool.execute(`SELECT * FROM blog WHERE id = ?`, [
    req.params.blogId,
  ]);

  return res.json({ success: '獲取全部 blogs 成功！', blog });
});

// 新增一筆 blog
router.post('/', async (req, res, next) => {
  let [response] = await pool.execute(
    `
  INSERT INTO blog (category_id, title, content, images)
  VALUES (?,?,?, ?)
  `,
    [req.body.category_id, req.body.title, req.body.content, req.body.images]
  );

  return res.json({ success: '新增 blog 成功！' });
});

// 修改特定一筆 blog
router.patch('/:blogId', async (req, res, next) => {
  let [blog] = await pool.execute(
    `UPDATE blog SET category_id = ?, content = ?, title = ?, images = ?  WHERE id = ?`,
    [
      req.body.category_id,
      req.body.content,
      req.body.title,
      req.body.images,
      req.params.blogId,
    ]
  );

  return res.json({ success: '修改一筆 blog 成功！' });
});

// 刪除特定一筆 blog
router.delete('/:blogId', async (req, res, next) => {
  let [blog] = await pool.execute(`DELETE FROM blog  WHERE id = ?`, [
    req.params.blogId,
  ]);

  return res.json({ success: '刪除一筆 blog 成功！' });
});

module.exports = router;
