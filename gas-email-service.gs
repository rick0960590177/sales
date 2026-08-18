/**
 * Google Apps Script - 訂單系統郵件服務
 * 
 * 設定步驟:
 * 1. 複製此代碼到 Google Apps Script (script.google.com)
 * 2. 建立新項目，貼上下面的代碼
 * 3. 按 "部署" → "新部署" → "類型: Web 應用"
 * 4. 執行者: 我 (your@gmail.com)
 * 5. 誰可以存取: 任何人
 * 6. 複製部署 ID，貼到 app.js 的 GAS_URL 中
 */

// 處理郵件發送請求
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // 驗證必要欄位
    if (!data.to || !data.subject || !data.htmlBody) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: '缺少必要欄位'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 發送郵件
    GmailApp.sendEmail(
      data.to,
      data.subject,
      '',
      {
        htmlBody: data.htmlBody
      }
    );

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '郵件已發送'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('郵件發送錯誤: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 測試函數
function testSendEmail() {
  const testEmail = {
    to: 'rick0960590177@gmail.com',
    subject: '訂單系統測試郵件',
    htmlBody: '<html><body><h1>測試郵件</h1><p>這是一封測試郵件</p></body></html>'
  };

  const response = doPost({
    postData: {
      contents: JSON.stringify(testEmail)
    }
  });

  Logger.log('測試結果: ' + response.getContent());
}
