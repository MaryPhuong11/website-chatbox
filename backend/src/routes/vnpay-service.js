const crypto = require("crypto");
const querystring = require("qs"); // Thay querystring bằng qs để xử lý tốt hơn
const moment = require("moment-timezone"); // Sử dụng moment-timezone để xử lý múi giờ

// Hàm sắp xếp object và mã hóa giá trị theo chuẩn VNPay
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        let value = obj[decodeURIComponent(str[key])];
        // Chuyển giá trị thành chuỗi và mã hóa
        if (value !== undefined && value !== null && value !== "") {
            sorted[str[key]] = encodeURIComponent(value.toString()).replace(/%20/g, "+");
        }
    }
    return sorted;
}

// Hàm tạo URL thanh toán VNPay
function createPaymentUrl(req, model, config) {
    // Lấy địa chỉ IP của client
    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection && req.connection.socket ? req.connection.socket.remoteAddress : "127.0.0.1");

    // Lấy các giá trị cấu hình
    let vnpUrl = config.VnPay.BaseUrl;
    let secretKey = config.VnPay.HashSecret;
    let tmnCode = config.VnPay.TmnCode;
    let returnUrl = config.VnPay.ReturnUrl;

    // Đảm bảo amount là số nguyên
    let amount = Math.round(Number(model.amount) * 100); // Nhân 100 và làm tròn để tránh số thập phân
    if (isNaN(amount) || amount <= 0) {
        throw new Error("Số tiền không hợp lệ");
    }

    // Tạo vnp_Params
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = model.orderCode.toString(); // Đảm bảo orderCode là chuỗi
    vnp_Params['vnp_OrderInfo'] = `Thanh toan don hang ${model.orderCode}`;
    vnp_Params['vnp_OrderType'] = 'billpayment';
    vnp_Params['vnp_Amount'] = amount;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    // Sử dụng múi giờ UTC+7 (Việt Nam) cho vnp_CreateDate
    vnp_Params['vnp_CreateDate'] = moment().tz("Asia/Ho_Chi_Minh").format('YYYYMMDDHHmmss');

    // Sắp xếp và mã hóa các tham số
    vnp_Params = sortObject(vnp_Params);

    // Tạo chữ ký bảo mật
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    // Thêm vnp_SecureHash vào tham số
    vnp_Params['vnp_SecureHash'] = signed;

    // Tạo query string thủ công để đảm bảo mã hóa đúng
    let query = Object.keys(vnp_Params)
        .map(key => `${key}=${vnp_Params[key]}`)
        .join('&');

    // Tạo URL cuối cùng
    vnpUrl += '?' + query;

    return vnpUrl;
}

// Hàm xử lý phản hồi từ VNPay
function processPaymentResponse(query, config) {
    let vnp_Params = query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa các tham số liên quan đến chữ ký để kiểm tra
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp và mã hóa lại các tham số để kiểm tra chữ ký
    vnp_Params = sortObject(vnp_Params);

    let secretKey = config.VnPay.HashSecret;
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    let result = {
        success: secureHash === signed,
        orderCode: vnp_Params['vnp_TxnRef'],
        transactionId: vnp_Params['vnp_TransactionNo']
    };

    return result;
}

module.exports = { createPaymentUrl, processPaymentResponse };