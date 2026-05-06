"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayFastNotification = exports.generatePayFastSignature = void 0;
const crypto_1 = __importDefault(require("crypto"));
// PayFast requires fields in a specific order for the signature if not using alphabetical sort.
// However, many implementations use alphabetical sort (ksort) and it works if the form follows it.
// To be safe and follow the most reliable path:
const generatePayFastSignature = (data, passphrase) => {
    let queryString = '';
    // 1. Sort keys alphabetically (equivalent to PHP ksort)
    const sortedKeys = Object.keys(data).sort();
    // 2. Concatenate key=value pairs
    sortedKeys.forEach((key) => {
        if (data[key] !== undefined && data[key] !== '' && data[key] !== null) {
            // 3. Values must be URL-encoded, with spaces as +
            const value = encodeURIComponent(String(data[key]).trim()).replace(/%20/g, '+');
            queryString += `${key}=${value}&`;
        }
    });
    // 4. Remove trailing ampersand
    queryString = queryString.substring(0, queryString.length - 1);
    // 5. Append passphrase if it exists
    if (passphrase && passphrase.trim() !== '') {
        queryString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    }
    // 6. Generate MD5 hash
    return crypto_1.default.createHash('md5').update(queryString).digest('hex');
};
exports.generatePayFastSignature = generatePayFastSignature;
const verifyPayFastNotification = (data, passphrase) => {
    const signature = data.signature;
    const dataWithoutSignature = { ...data };
    delete dataWithoutSignature.signature;
    // For ITN, PayFast sends fields in a specific order. 
    // Most modern PayFast integrations use alphabetical sort for verification too.
    const calculatedSignature = (0, exports.generatePayFastSignature)(dataWithoutSignature, passphrase);
    return calculatedSignature === signature;
};
exports.verifyPayFastNotification = verifyPayFastNotification;
//# sourceMappingURL=payfast.js.map