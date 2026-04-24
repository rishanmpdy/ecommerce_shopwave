import jsonServer from 'json-server';
import cors from 'cors';

// Simplified Backend Server for Learning
// JWT Auth and Security have been removed so you can focus on React/Redux logic.

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// --- 1. CORE MIDDLEWARES ---
server.use(cors());
server.use(jsonServer.bodyParser);
server.use(middlewares);

// --- 2. MOCK LOGIN HANDLER (Simplified) ---
server.post(['/api/admin/login', '/login'], (req, res) => {
  // Request body-il ninnu email-um password-um edukkunnu.
  const { email, password } = req.body;
  const db = router.db;
  // Database-il ee details matching aaya user undo ennu check cheyyunnu.
  const user = db.get('users').find({ email, password }).value();

  if (user) {
    console.log('[LOGIN SUCCESS] User:', user.email);
    // User undengil "fake-token" thirichu ayakkunnu (Security bypass for learning).
    return res.status(200).json({
      token: 'fake-token-for-learning',
      admin: user,
      user: user
    });
  } else {
    // User illengil 401 error ayakkunnu.
    return res.status(401).json({ message: 'Invalid email or password' });
  }
});

// --- 3. DASHBOARD STATS & URL REWRITING ---
server.use((req, res, next) => {
  // 1. Handle Dashboard Stats (Simplified calculation)
  // Dashboard stats-nu vendulla special route handle cheyyunnu.
  if (req.url.includes('/dashboard/stats')) {
    const db = router.db;
    const users = db.get('users').value() || [];
    const orders = db.get('orders').value() || [];

    // Products, Orders, Users, and Revenue counts calculate cheyyunnu.
    const recentOrdersWithUser = orders.slice(-5).map(order => ({
      ...order,
      user: users.find(u => u.id === order.userId) || { name: 'Guest' }
    }));

    return res.json({
      totalProducts: db.get('products').size().value(),
      totalOrders: orders.length,
      totalUsers: users.length,
      totalRevenue: orders.reduce((s, o) => s + Number(o.total || 0), 0),
      recentOrders: recentOrdersWithUser
    });
  }

  // 2. Remove /api/admin prefix so it works with standard json-server routes
  // Frontend-ile admin routes json-server standard format-ilekku rewrite cheyyunnu.
  if (req.url.startsWith('/api/admin')) {
    req.url = req.url.replace('/api/admin', '');
  }
  next();
});

// --- 4. JSON-SERVER ROUTER ---
server.use(router);

const PORT = 5006;
server.listen(PORT, () => {
  console.log(`\x1b[32m[SERVER] Simplified Server running on http://localhost:${PORT}\x1b[0m`);
  console.log(`\x1b[33m[INFO] Security/JWT checks are DISABLED for learning purposes.\x1b[0m`);
});

