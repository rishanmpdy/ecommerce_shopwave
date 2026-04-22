import jsonServer from 'json-server';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const SECRET_KEY = 'YOUR_SECRET_KEY_HERE';
const expiresIn = '24h';

// Manglish: admin login success aayal JWT token create cheyyan helper.
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Manglish: request-il vann token valid aano ennu verify cheyyan helper.
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error(`[AUTH ERROR] Token verification failed: ${err.message}`);
    throw err;
  }
}

server.use(cors());
server.use(jsonServer.bodyParser);

// 1. Logger Middleware - MOVE TO VERY TOP
server.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
});

// TEST ROUTE
server.get('/test', (req, res) => res.send('Server is alive!'));

server.use(middlewares);

// Manglish: normal json-server login cheyyilla; athukondu custom admin login endpoint create cheythittundu.
server.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db;
  const users = db.get('users').value();
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Account is not an admin.' });
  }

  const token = createToken({ id: user.id, email: user.email, role: user.role });
  
  res.status(200).json({
    token,
    admin: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Manglish: /api/admin route ellam ivide protect cheyyunnu.
// Token verify cheythu kazhinjal url /products pole json-server readable format-il rewrite cheyyum.
server.use((req, res, next) => {
  if (req.url.startsWith('/api/admin')) {
    if (req.method === 'OPTIONS') return next();
    if (req.url === '/api/admin/login') return next();

    const authHeader = req.headers.authorization;
    console.log(`[DEBUG ADMIN API] ${req.method} ${req.url} | Auth Header: ${authHeader ? 'Present (' + authHeader.slice(0, 15) + '...)' : 'MISSING'}`);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn(`[AUTH WARN] Admin token missing header: ${req.method} ${req.url}`);
      return res.status(401).json({ message: 'Authentication required: Admin token missing.' });
    }

    let decoded;
    try {
      const token = authHeader.split(' ')[1];
      decoded = verifyToken(token);
      
      if (decoded.role !== 'admin') {
        console.warn(`[AUTH WARN] Forbidden access (not admin): ${decoded.email}`);
        return res.status(403).json({ message: 'Access denied: Admin privileges required.' });
      }
    } catch (err) {
      console.error(`[AUTH ERROR] JWT verification failed: ${err.message}`);
      return res.status(401).json({ message: 'Invalid or expired session. Please login again.' });
    }

    // Manglish: dashboard cardsinum recent orders table-inum vendi custom aggregate response.
    if (req.url === '/api/admin/dashboard/stats') {
        const db = router.db;
        const users = db.get('users').value() || [];
        const orders = db.get('orders').value() || [];
        const recentOrders = orders
          .slice()
          .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
          .slice(0, 5)
          .map((order) => ({
            id: order.id,
            totalAmount: order.total ?? 0,
            status: String(order.status || "processing").toLowerCase(),
            createdAt: order.date,
            user: users.find((u) => String(u.id) === String(order.userId)) || null,
          }));

        return res.json({
            totalProducts: db.get('products').size().value() || 0,
            totalOrders: db.get('orders').size().value() || 0,
            totalUsers: db.get('users').size().value() || 0,
            totalRevenue: orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
            recentOrders
        });
    }

    // Manglish: Categories API force handling (Only for GET)
    if (req.url === '/api/admin/categories' && req.method === 'GET') {
        const data = router.db.get('categories').value() || [];
        return res.json(data);
    }
    
    // Manglish: Carts API force handling (Only for GET)
    if (req.url === '/api/admin/carts' && req.method === 'GET') {
        const data = router.db.get('carts').value() || [];
        return res.json(data);
    }

    // Manglish: /api/admin/products -> /products aakki json-server router-lekku വിടും.
    req.url = req.url.replace('/api/admin', '');
    next();
  } else {
    // Manglish: public/user routes direct aayi json-server router-il പോകും.
    next();
  }
});

// Remove these old handlers as they are now handled above inside the auth/prefix block

// 4. Default JSON Server Router
server.use(router);

server.listen(5005, () => {
  console.log('\x1b[32m%s\x1b[0m', 'Custom JSON Server (ShopWave Admin) is active!');
  console.log('\x1b[36m%s\x1b[0m', 'ADMIN API: http://localhost:5005/api/admin');
  console.log('\x1b[36m%s\x1b[0m', 'USER API:  http://localhost:5005');
});
