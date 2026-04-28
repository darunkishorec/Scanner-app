import QRCode from 'qrcode';
import { mkdirSync } from 'fs';

const BASE_URL = 'https://yourdomain.com/cart';
const carts = ['CART-001', 'CART-002', 'CART-003', 'CART-004', 'CART-005'];

mkdirSync('./qr-codes', { recursive: true });

for (const cart of carts) {
  const url = `${BASE_URL}/${cart}`;
  const file = `./qr-codes/${cart}.png`;
  await QRCode.toFile(file, url, {
    width: 400,
    margin: 2,
    color: { dark: '#0F1117', light: '#E8E6E1' },
  });
  console.log(`Generated: ${file}  →  ${url}`);
}
