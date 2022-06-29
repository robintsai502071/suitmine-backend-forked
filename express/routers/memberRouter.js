const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 取得特定 1 位 member 的資料
router.get('/:memberId', async (req, res, next) => {
  
  let [member] = await pool.execute(`SELECT * FROM user WHERE id = ?`, [
    req.params.memberId,
  ]);

  member = member[0];
  const returnMemberInfo = {
    id: member.id,
    name: member.name,
    gender: member.gender,
    age: member.age,
    phone: member.phone,
    photo: member.photo,
    email: member.email,
    valid: member.valid,
    address: member.address,
  };

  res.json({ success: '獲取資料成功！', data: returnMemberInfo });
});

//   修改特定 1 位 member 的資料
router.patch('/:memberId', async (req, res, next) => {
  //   update 特定 1 位 member 的資料
  let [response] = await pool.execute(
    `UPDATE user SET name = ?, gender = ?, phone = ?, photo = ?,address = ? WHERE id = ?`,
    [
      req.body.name,
      req.body.gender,
      req.body.phone,
      req.body.photo,
      req.body.address,
      req.params.memberId,
    ]
  );


  res.json({ success: '更新資料成功！' });
});

module.exports = router;
