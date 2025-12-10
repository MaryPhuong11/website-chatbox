// const crypto = require('crypto');
// const querystring = require('querystring');

// class VnPayLibrary {
//   constructor() {
//     this.requestData = {};
//     this.responseData = {};
//   }

//   addRequestData(key, value) {
//     if (value !== null && value !== undefined && value !== '') {
//       this.requestData[key] = value;
//     }
//   }

//   addResponseData(key, value) {
//     if (value !== null && value !== undefined && value !== '') {
//       this.responseData[key] = value;
//     }
//   }

//   getResponseData(key) {
//     return this.responseData[key] || '';
//   }

//  createRequestUrl(baseUrl, vnpHashSecret) {
//   const sortedData = sortObject(this.requestData);
  
//   // Tạo chuỗi ký - KHÔNG encode các giá trị
//   const signDataArray = [];
//   for (const [key, value] of Object.entries(sortedData)) {
//     if (value !== null && value !== undefined && value !== '') {
//       signDataArray.push(`${key}=${value}`);
//     }
//   }
//   const signData = signDataArray.join('&');
//   console.log('Sign Data for Hash:', signData); // Debug log

//   // Tạo secure hash
//   const secureHash = hmacSHA512(vnpHashSecret, signData);
//   console.log('Generated Hash:', secureHash); // Debug log
  
//   // Tạo URL - encode các giá trị
//   const encodedParams = {};
//   for (const [key, value] of Object.entries(sortedData)) {
//     if (value !== null && value !== undefined && value !== '') {
//       encodedParams[key] = encodeURIComponent(value).replace(/%20/g, '+');
//     }
//   }
//   const urlParams = querystring.stringify(encodedParams);
//   const finalUrl = `${baseUrl}?${urlParams}&vnp_SecureHash=${secureHash}`;
  
//   return finalUrl;
// }

//   validateSignature(inputHash, secretKey) {
//   const responseData = { ...this.responseData };
  
//   // Xóa các trường không tham gia vào việc tạo hash
//   delete responseData['vnp_SecureHash'];
//   delete responseData['vnp_SecureHashType'];

//   const sortedData = sortObject(responseData);
  
//   // Tạo chuỗi ký - giải mã các giá trị nếu cần
//   const signDataArray = [];
//   for (const [key, value] of Object.entries(sortedData)) {
//     if (value !== null && value !== undefined && value !== '') {
//       // Giải mã giá trị nếu đã được mã hóa URL
//       const decodedValue = decodeURIComponent(value).replace(/\+/g, ' ');
//       signDataArray.push(`${key}=${decodedValue}`);
//     }
//   }
//   const signData = signDataArray.join('&');
//   console.log('Response Sign Data:', signData); // Debug log
  
//   const myHash = hmacSHA512(secretKey, signData);
//   console.log('My Hash:', myHash); // Debug log
//   console.log('Input Hash:', inputHash); // Debug log
  
//   return myHash === inputHash;
// }
// }

// function hmacSHA512(secret, data) {
//   return crypto.createHmac('sha512', secret).update(data, 'utf-8').digest('hex');
// }

// function sortObject(obj) {
//   return Object.keys(obj)
//     .sort()
//     .reduce((result, key) => {
//       result[key] = obj[key];
//       return result;
//     }, {});
// }

// function getClientIp(req) {
//   return (
//     req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
//     req.connection?.remoteAddress ||
//     req.socket?.remoteAddress ||
//     req.connection?.socket?.remoteAddress ||
//     '127.0.0.1'
//   );
// }

// module.exports = {
//   VnPayLibrary,
//   hmacSHA512,
//   getClientIp,
// };