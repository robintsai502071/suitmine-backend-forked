const express = require('express');
const router = express.Router();

// 引入圖片處理套件 for image upload
const multer = require('multer');
// 引入 node.js 內建 path，(圖片儲存位置會用到)
const path = require('path');

// 設定圖片儲存位置
const storage = multer.diskStorage({
  // 設定儲存目的地(檔案夾)
  // 就是要這要寫，套件規定的
  destination: function (req, file, cb) {
    // cb 的第一個參數是給 error，這邊單純存圖片，沒什麼錯誤就給 NULL
    // 第二個參數指定圖片上傳到什麼位址，這邊設定要放在根目錄下的 uploadedByUser/updatedAvatar
    cb(null, path.join(__dirname, '..', 'uploadedByUser', 'updatedAvatar'));
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
const uploader = multer({
  //設定儲存位置
  storage: storage,
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
  limits: {
    // 1k = 1024
    fileSize: 200 * 1024,
  },
});

router.post('/', uploader.single('photo'), async (req, res, next) => {
  if (req.file) {
    let link =
      process.env.BASE_URL +
      '/uploadedByUser/updatedAvatar/' +
      req.file.filename;
    // response
    res.json({ success: '圖片上傳成功', data: { link } });
  } else {
    res.status(400).json({ eror: '圖片上傳失敗！' });
  }
});

module.exports = router;
