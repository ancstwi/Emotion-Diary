const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const tlsInsecure = /^1|true|yes$/i.test(String(process.env.GIGACHAT_TLS_INSECURE || '').trim());
if (tlsInsecure) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
