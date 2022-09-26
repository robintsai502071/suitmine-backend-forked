# SUITMINE 電商網站 後端
## API 使用說明(使用 Axios)
`API_URL`：`https://suitmine.herokuapp.com/api`

### auth

+ **修改密碼**
    + **功能說明** 
    在官網註冊的會員可使用更改密碼功能。
    + **Method**  POST
    + **攜帶 Cookie** 不需要
    + **Path** /auth/change-password
    + **參數** request body
    ```
    {
      currentPassword: STRING,
      newPassword: STRING,
      confirmNewPassword: STRING,
      user_id: INT,
    }

    ```
    + **範例**
    ```javascript
    axios.post(`${API_URL}/auth/change-password`, object)
    ```

    + **範例**
    ```javascript
    axios.patch(`${API_URL}/member/${memberId}`, object)
    ```
    + reponse
        + status code 200
        ```javascript
        {
          "success":"更改密碼成功！"
        }
        ```
        + status code 400
        ```javascript
        // 當前帳號為測試帳號時 user_id = 44
        {
          "error":"很抱歉，此帳號為測試帳號，無法修改密碼！"
        }    
        ```
        ```javascript
        {
          "error":"密碼錯誤！"
        }  
        ```
+ **Google 登入**
    + **功能說明** 
    登入頁面點選「Google 登入」發送之 API。
    + **Method**  POST
    + **攜帶 Cookie** 必要
    + **Path** /auth/login-with-google
    + **參數** request body
    ```
    {
      email: STRING,
      displayName: STRING,
      uid: STRING,
    }
    ```
    + **範例**
    ```javascript
    axios.post(
      `${API_URL}/auth/login-with-google`,
      object,
      {
        withCredentials: true,
      }
    )
    ```
    + response
        + status code 200
        ```javascript
        {
           "message":"登入成功",
           "user":{
              "user_id": 50,
              "uid":"xxxx-xxxx-xxxx-xxxx",
              "email":"robin@gmail.com",
              "name":"robin tsai"
           }
        }
        ```
        + status code 400
        ```javascript
        {
           "error":"登入失敗",
           "errorMessage":"此 Gmail 已於官方網站註冊過！請改用信箱/密碼方式登入。"
        }
        ```
+ **確認是否為登入狀態**
    + **功能說明** 
    每次載入頁面 (`navigation.component.jsx`) 都發送此 API 確認用戶是否還是登入狀態。
    + **Method**  GET
    + **攜帶 Cookie** 必要
    + **Path** /auth/check-is-login
    + **參數** 無
    + **範例**
    ```javascript
    axios.get(`${API_URL}/auth/check-is-login`, {
      withCredentials: true,
    })
    ```
    + response
        + status code 200
        ```javascript
        {
           "user_id": 4,
           "email":"robin@gmail",
           "name":"robin tsai"
        }
        ```
        + status code 400
        ```javascript
        {
           "error":"尚未登入"
        }
        ```

+ **官網信箱/密碼登入**
    + **功能說明** 
    登入頁面點選輸入信箱/密碼登入時發送之 API。
    + **Method**  POST
    + **攜帶 Cookie** 必要
    + **Path** /auth/login
    + **參數** request body
    ```
    {
      email: STRING,
      password: STRING,
   }
    ```
    + **範例**
    ```javascript
    axios.post(`${API_URL}/auth/login`, object, {
      withCredentials: true,
    })
    ```
    + response
        + status code 200
        ```javascript
        {
           "message":"登入成功",
           "user":{
              "user_id": 50,
              "email":"robin@gmail.com",
              "name":"robin tsai"
           }
        }
        ```
        + status code 400
        ```javascript
        {
           "error":"帳號或密碼錯誤"
        }
        ```

+ **登出**
    + **功能說明** 
    會員登出（官網信箱/密碼登入、Google 登入之使用者皆適用）
    + **Method**  GET
    + **攜帶 Cookie** 必要
    + **Path** /auth/logout
    + **參數** 無
    + **範例**
    ```javascript
    axios.get(`${API_URL}/auth/logout`, {
    withCredentials: true,
  })
    ```
    + response
        + status code 202
        + no response
    
+ **官網會員註冊**
    + **功能說明** 
    透過官網註冊頁面註冊會員之 API。
    + **Method**  POST
    + **攜帶 Cookie** 必要
    + **Path** /auth/register
    + **參數** request body
    ```
    {
      username: STRING,
      email: STRING,
      password: STRING,
      confirmPassword: STRING,
      gender: INT, (0~2)
      birth_date: DATESTRING,
   }
    ```
    + **範例**
    ```javascript
    axios.post(`${API_URL}/auth/register`, object, {
      withCredentials: true,
    })
    ```
    + response
        + status code 200
        ```javascript
        {
           "success":"註冊成功",
           "user":{
              "user_id": 50,
              "email":"robin@gmail.com",
              "name":"robin tsai"
           }
        }
        ```
        + status code 400
        ```javascript
        {
           "error":"此信箱已被註冊過！"
        }
        ```
        ```javascript
        // 註冊欄位驗證錯誤時
        {
           "errorColumns": 欄位驗證錯誤訊息
        }
        ```
### member
+ **取得會員資料**
    + **功能說明** 
    會員登入後轉址到會員頁發送之 API。
    + **Method**  GET
    + **攜帶 Cookie** 不需要
    + **Path** /member/:memberId
    + **參數** in-path
    + **範例**
    ```javascript
    axios.get(`${API_URL}/member/${memberId}
    ```
    + response
        + status code 200
        ```javascript
        {
           "success":"獲取資料成功！",
           "memberProfile":{
              "id":44,
              "uid":null,
              "username":"測試帳號",
              "email":"test@gmail.com",
              "phone":"0963000000",
              "gender":0,
              "birth_date":"2022-09-02",
              "address":"苗栗縣竹南鎮頂埔里中華路1000號",
              "weight":"68",
              "height":"183",
              "shoulder_width":"70",
              "chest_width":"65",
              "waist_width":"58",
              "butt_width":"50",
              "leg_length":"90",
              "arm_length":"65"
           },
           "orders":[
              {
                 "id":302,
                 "order_uuid":"d029575e-cfd8-4fe8-a67a-20768b1e50e1",
                 "user_id":44,
                 "cart_total":136500,
                 "shipping_fee":0,
                 "receiver_name":"g",
                 "receiver_phone":"0000000000",
                 "receiver_address":"g",
                 "create_time":"2022-09-17 15:17:40"
              },
            ...
           ]
        }
        ```
        + status code 400
        ```javascript
        // 撈出 0 位 member
        {
           "error":"獲取資料失敗！請重新登入"
        }
        ```
    
+ **建立訂單**
    + **功能說明** 
   會員將商品加入購物車後至結帳頁面進行「提交訂單」動作之 API。
    + **Method**  POST
    + **攜帶 Cookie** 不需要
    + **Path** /member/:memberId/orders
    + **參數** in-path & request body
    ```
    {
      formData: {
        receiverName: STRING,
        receiverPhone: STRING,
        receiverAddress: STRING,
        cardNumber: STRING,
        cardOwner: 'STRING,
        cardValidDate: STRING,
        cardSafeCode: STRING,
      },
      cartSummary: {
       cartItems: Array,
       cartTotal: INT,
       shippingFee: INT,
      },
    }
    ```
    + **範例**
    ```javascript
    axios.post(`${API_URL}/member/${memberId}/orders`, {
      formData,
      cartSummary,
    })
    ```
    + response
        + status code 200
        ```javascript
        {
           "success":"建立訂單成功！",
           "order_id": 5
        }
        ```
    
+ **取得某 1 會員的 1 筆訂單**
    + **功能說明** 
    會員登入後至「我的訂單」列表點選「查閱」，轉址後發送之 API。
    + **Method**  GET
    + **攜帶 Cookie** 不需要
    + **Path** /member/:memberId/orders/:orderId
    + **參數** in-path
    + **範例**
    ```javascript
      axios.get(`${API_URL}/member/${memberId}/orders/${orderId}`
    ```
    + response
        + status code 200
        ```javascript
        {
       "success":"獲取一筆訂單資料成功！",
       "orderDetail":{
          "id":344,
          "order_uuid":"a2a34445-c0f7-4d7e-a838-5b00985346a2",
          "user_id":44,
          "cart_total":13500,
          "shipping_fee":600,
          "receiver_name":"測試帳號",
          "receiver_phone":"0963000000",
          "receiver_address":"苗栗縣竹南鎮頂埔里中華路1000號",
          "create_time":"2022-09-23 07:39:21",
          "customer_name":"測試帳號",
          "customer_birth":"2022-09-02",
          "customer_phone":"0963000000"
       },
       "orderItems":[
          {
             "id":74,
             "order_id":344,
             "product_id":1,
             "quantity":1,
             "product_name":"海沃思海軍套裝",
             "product_photo":"https://github.com/robintsai502071/suitmine-frontend-forked/blob/dev/src/assests/images/products/suit/%E5%95%86%E5%8B%99/%E8%97%8D%E8%89%B2/%E6%B5%B7%E6%B2%83%E6%80%9D%E6%B5%B7%E8%BB%8D%E5%A5%97%E8%A3%9D/thumbnail.webp?raw=true",
             "product_price":13500
          }
           ...
       ]
        }
        
        ```


+ **確認用戶是否已完整填寫個人檔案**

    + **功能說明** 
    用戶在結帳頁面準備提交訂單前發出，若尚未完整填寫個人檔案則不可提交訂單。
    + **Method**  GET
    + **攜帶 Cookie** 不需要
    + **Path** /member/:memberId/check-if-body-info-filled
    + **參數** in-path
    + **範例**
    ```javascript
    axios.get(
      `${API_URL}/member/${memberId}/check-if-body-info-filled`
    )
    ```
    + response
        + status code 200
        ```javascript
        {
           "success":"此用戶已填寫個人檔案完畢！"
        }
        ```
        + status code 400
        ```javascript
        {
       "error":"很抱歉，您還未完成填寫個人檔案，請您完成後才能繼續！"
        }
        ```
        
+ **修改特定一位會員的個人檔案**
    + **功能說明** 
    登入會員後可至個人檔案點選「編輯檔案」進行資料修改。
    + **Method**  PATCH
    + **攜帶 Cookie** 不需要
    + **Path** /member/:memberId
    + **參數** in-path & request body
    ```
    {
      username: STRING,
      gender: INT, (0~2)
      phone: STRING,
      address: STRING,
      height: STRING,
      weight: STRING,
      arm_length: STRING,
      butt_width: STRING,
      chest_width: STRING,
      leg_length: STRING,
      shoulder_width: STRING,
      waist_width: STRING,
    }
    ```
    + response
        + status code 200
        ```javascript
        {
           "success":"更新資料成功！"
        }
        ```
### product
+ **取得商品列表**
    + **功能說明** 
    撈取商品總覽頁面所展示之產品 API。
    + **Method**  GET
    + **攜帶 Cookie** 不需要
    + **Path** /products?product_category_id=INT&product_category_level=INT
    + **參數** query string
    + **範例**
    ```javascript
      axios.get(`${API_URL}/products`, {
      params: { product_category_id, product_category_level },
    })
    ```
    + response
        + status code 200
        ```javascript
        {
       "success":"取得商品成功！",
       "data":[
          {
             "id":1,
             "product_name":"海沃思海軍套裝",
             "product_category":"商務套裝",
             "product_price":13500,
             "description":"穿上海沃斯海軍服，成為精妙絕倫的大師。這種面料的幾何菱形編織賦予其特殊的質感和深度，近距離觀看效果最佳。相信我們，他們會想要接近的。除了根據您獨特的尺寸和規格定制外，這款套裝還採用優質組件精心打造。我們所有的西裝夾克要么採用半帆佈設計，以提高多功能性和形狀，要么採用非結構化設計，減少帆布以提高透氣性和寬鬆合身性。每件夾克還採用全帆布翻領、喇叭鈕扣、輕質肩墊和高品質領毛氈。",
             "color_spec":"藍色",
             "pattern_spec":"素色",
             "fabric_spec":"100% 羊毛",
             "fabric_weight_spec":255,
             "product_photo":"https://github.com/robintsai502071/suitmine-frontend-forked/blob/dev/src/assests/images/products/suit/%E5%95%86%E5%8B%99/%E8%97%8D%E8%89%B2/%E6%B5%B7%E6%B2%83%E6%80%9D%E6%B5%B7%E8%BB%8D%E5%A5%97%E8%A3%9D/thumbnail.webp?raw=true",
             "product_photo_detail1":"https://github.com/robintsai502071/suitmine-frontend-forked/blob/dev/src/assests/images/products/suit/%E5%95%86%E5%8B%99/%E8%97%8D%E8%89%B2/%E6%B5%B7%E6%B2%83%E6%80%9D%E6%B5%B7%E8%BB%8D%E5%A5%97%E8%A3%9D/1.webp?raw=true",
             "product_photo_detail2":"https://github.com/robintsai502071/suitmine-frontend-forked/blob/dev/src/assests/images/products/suit/%E5%95%86%E5%8B%99/%E8%97%8D%E8%89%B2/%E6%B5%B7%E6%B2%83%E6%80%9D%E6%B5%B7%E8%BB%8D%E5%A5%97%E8%A3%9D/2.webp?raw=true",
             "product_photo_detail3":"https://github.com/robintsai502071/suitmine-frontend-forked/blob/dev/src/assests/images/products/suit/%E5%95%86%E5%8B%99/%E8%97%8D%E8%89%B2/%E6%B5%B7%E6%B2%83%E6%80%9D%E6%B5%B7%E8%BB%8D%E5%A5%97%E8%A3%9D/3.webp?raw=true",
             "product_photo_detail4":"https://github.com/robintsai502071/suitmine-frontend-forked/blob/dev/src/assests/images/products/suit/%E5%95%86%E5%8B%99/%E8%97%8D%E8%89%B2/%E6%B5%B7%E6%B2%83%E6%80%9D%E6%B5%B7%E8%BB%8D%E5%A5%97%E8%A3%9D/4.webp?raw=true",
             "product_photo_detail5":"https://github.com/robintsai502071/suitmine-frontend-forked/blob/dev/src/assests/images/products/suit/%E5%95%86%E5%8B%99/%E8%97%8D%E8%89%B2/%E6%B5%B7%E6%B2%83%E6%80%9D%E6%B5%B7%E8%BB%8D%E5%A5%97%E8%A3%9D/5.webp?raw=true",
             "product_photo_detail6":null
          },
            ...
          ]
        }
        ```
+ **取得商品細節**
    + **功能說明** 
    商品總覽頁面點選各商品轉址至「商品細節頁」所發送之 API。
    + **Method**  GET
    + **攜帶 Cookie** 不需要
    + **Path** /products/:productId
    + **參數** in-path
    + **範例**
    ```javascript
      axios.get(`${API_URL}/products/${productId}`
    ```
    + response
        + status code 200
        ```javascript
        {
           "success":"取得單筆商品資訊成功！",
           "productDetail":{
              "id":3,
              "product_name":"海沃德法蘭絨海軍套裝",
              "product_category":"商務套裝",
              "product_category_id":5,
              "product_price":13500,
              "description":"隨著天氣轉涼，穿上拉絨至超柔軟法蘭絨飾面的海軍服保暖。除了根據您獨特的尺寸和規格進行定制外，印度支那套裝還採用優質組件和周到的結構製成。我們所有的西裝外套都經過半帆布處理，為您的身體提供更大的多功能性和卓越的造型。每件夾克還採用全帆布翻領、喇叭鈕扣、輕質肩墊和高品質領毛氈。",
              "color_spec":"藍色",
              "pattern_spec":"素色",
              "fabric_spec":"97% 羊毛，3% 氨綸",
              "fabric_weight_spec":320,
              "product_photo":"https://github.com/robintsai502071/suitmine-frontend-forked/blob/dev/src/assests/images/products/suit/%E5%95%86%E5%8B%99/%E8%97%8D%E8%89%B2/%E6%B5%B7%E6%B2%83%E5%BE%B7%E6%B3%95%E8%98%AD%E7%B5%A8%E6%B5%B7%E8%BB%8D%E5%A5%97%E8%A3%9D/thumbnail.webp?raw=true",
              "productDetailImages":[
                 "https://github.com/robintsai502071/suitmine-frontend-forked/blob/dev/src/assests/images/products/suit/%E5%95%86%E5%8B%99/%E8%97%8D%E8%89%B2/%E6%B5%B7%E6%B2%83%E5%BE%B7%E6%B3%95%E8%98%AD%E7%B5%A8%E6%B5%B7%E8%BB%8D%E5%A5%97%E8%A3%9D/1.webp?raw=true",
                 "https://github.com/robintsai502071/suitmine-frontend-forked/blob/dev/src/assests/images/products/suit/%E5%95%86%E5%8B%99/%E8%97%8D%E8%89%B2/%E6%B5%B7%E6%B2%83%E5%BE%B7%E6%B3%95%E8%98%AD%E7%B5%A8%E6%B5%B7%E8%BB%8D%E5%A5%97%E8%A3%9D/2.webp?raw=true",
                 "https://github.com/robintsai502071/suitmine-frontend-forked/blob/dev/src/assests/images/products/suit/%E5%95%86%E5%8B%99/%E8%97%8D%E8%89%B2/%E6%B5%B7%E6%B2%83%E5%BE%B7%E6%B3%95%E8%98%AD%E7%B5%A8%E6%B5%B7%E8%BB%8D%E5%A5%97%E8%A3%9D/3.webp?raw=true",
                 "https://github.com/robintsai502071/suitmine-frontend-forked/blob/dev/src/assests/images/products/suit/%E5%95%86%E5%8B%99/%E8%97%8D%E8%89%B2/%E6%B5%B7%E6%B2%83%E5%BE%B7%E6%B3%95%E8%98%AD%E7%B5%A8%E6%B5%B7%E8%BB%8D%E5%A5%97%E8%A3%9D/4.webp?raw=true",
                 "https://github.com/robintsai502071/suitmine-frontend-forked/blob/dev/src/assests/images/products/suit/%E5%95%86%E5%8B%99/%E8%97%8D%E8%89%B2/%E6%B5%B7%E6%B2%83%E5%BE%B7%E6%B3%95%E8%98%AD%E7%B5%A8%E6%B5%B7%E8%BB%8D%E5%A5%97%E8%A3%9D/5.webp?raw=true"
              ]
           }
        }
        ```