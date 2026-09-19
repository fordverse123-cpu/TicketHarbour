import http from 'http';

const data = JSON.stringify({
  email: 'jaswanth@gmail.com',
  password: '11223344@Jj#'
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('HTTP Body:', body);
  });
});

req.on('error', (e) => console.error('HTTP Error:', e));
req.write(data);
req.end();
