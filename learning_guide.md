# ShopWave Full Learning Guide

Ee guide `client side + admin side + backend mock server + Redux + React Query` full project step by step padikkan vendi aanu. Explanations Manglish style-il aanu. Code read cheyyumbo `enthaanu nadakkunnath`, `data evide ninnu varunnu`, `click cheythal next enthu aakum` ennulla flow manasilakkan focus cheythittundu.

## 1. Project Big Picture

ShopWave oru single React project aanu, but athil randu major areas und:

1. User/client side
2. Admin side

Ivide real backend illa. Athinte pakaram `json-server` + custom `server.js` use cheyyunnu.

Main stack:

- `React` for UI
- `React Router` for page navigation
- `Redux Toolkit` for auth/cart/admin state
- `React Query` for server data fetching/cache
- `Axios` for API calls
- `json-server` for fake database from `db.json`
- `JWT` for admin token login

## 2. Folder Structure

```text
ecommerce/
├── db.json
├── server.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api/
│   │   └── axios.js
│   ├── Store/
│   │   └── store.js
│   ├── features/
│   │   ├── auth/
│   │   │   └── authSlice.js
│   │   ├── cart/
│   │   │   └── cartSlice.js
│   │   └── products/
│   │       └── useProducts.js
│   ├── hooks/
│   │   └── useDebounce.js
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   ├── Components/
│   │   ├── layout/
│   │   │   └── Navbar.jsx
│   │   └── ui/
│   │       └── ProductCard.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Shop.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Profile.jsx
│   │   └── OrderSuccess.jsx
│   └── admin/
│       ├── api/
│       │   └── adminApi.js
│       ├── layout/
│       │   └── AdminLayout.jsx
│       ├── pages/
│       ├── queries/
│       ├── routes/
│       ├── services/
│       └── store/
```

## 3. Startup Flow

Project run aakumbol exact flow ithaanu:

```text
Browser open
  -> src/main.jsx
  -> BrowserRouter mount
  -> React Query Provider mount
  -> Redux Provider mount
  -> App.jsx load
  -> route check
  -> public page / admin page render
```

### `src/main.jsx`

Ithu application boot file aanu.

```jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <App />
          <ToastContainer position="bottom-left" autoClose={1000} />
        </Provider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
```

Code block meaning:

```jsx
// BrowserRouter -> route path manage cheyyum
// QueryClientProvider -> API data cache cheyyum
// Provider -> Redux state ella component-um access cheyyan allow cheyyum
// ToastContainer -> success/error popup message show cheyyum
```

## 4. App Level Routing Flow

### `src/App.jsx`

Ithu full app control center pole aanu.

Main jobs:

- admin route aano public route aano detect cheyyuka
- public navbar/footer kaanikkanam ennu decide cheyyuka
- lazy loading routes setup cheyyuka
- login user-inde cart server-il ninnu sync cheyyuka

Important snippet:

```jsx
const isAdminRoute = location.pathname.startsWith('/admin');

useEffect(() => {
  const fetchCart = async () => {
    if (isAuthenticated && user) {
      const { data } = await api.get(`/carts?userId=${user.id}`);
      if (data.length > 0) {
        dispatch(setCart(data[0].items));
      } else {
        dispatch(setCart([]));
      }
    } else {
      dispatch(setCart([]));
    }
  };
  fetchCart();
}, [isAuthenticated, user, dispatch]);
```

Meaning:

```jsx
// user login aayal server cart fetch cheyyum
// ath Redux cart-il set cheyyum
// logout aayal cart empty aakkum
// public pages-il navbar/footer kaanikku
// /admin route-il admin routes render cheyyum
```

Route map:

```text
/                  -> Home
/shop              -> Shop
/login             -> Login
/register          -> Register
/product/:id       -> ProductDetail
/cart              -> Protected
/checkout          -> Protected
/profile           -> Protected
/order-success/:id -> Protected
/admin/*           -> AdminRoutes
```

## 5. Store Architecture

### `src/Store/store.js`

Redux store-il 3 main slices und:

```js
reducer: {
  auth: authReducer,
  cart: cartReducer,
  admin: adminReducer,
}
```

Simple meaning:

- `auth` -> user login info
- `cart` -> cart items + total-related state
- `admin` -> admin login token + admin session

## 6. API Layers

### `src/api/axios.js`

User/client side normal API instance.

```js
const api = axios.create({
  baseURL: 'http://localhost:5005',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

Meaning:

```js
// ella public request-um localhost:5005-il pokum
// products, users, carts, orders, coupons ellam ivide ninnu fetch cheyyum
```

### `src/admin/api/adminApi.js`

Admin side special API instance.

```js
adminApi.interceptors.request.use((config) => {
  const token = store.getState().admin.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Meaning:

```js
// admin request pokumbo token automatic aayi header-il add cheyyum
// 401 vannal admin logout aakki login page-il redirect cheyyum
```

## 7. Mock Backend Flow

### `server.js`

Ithu fake backend aanu. Pakshe random static server alla. Ithu 3 job cheyyunnu:

1. `db.json` read cheyyunnu
2. admin login custom aayi handle cheyyunnu
3. admin routes token use cheythu protect cheyyunnu

### Admin login flow

```text
Admin email/password enter
  -> POST /api/admin/login
  -> users collection-il match nokkum
  -> role === admin aano check cheyyum
  -> JWT token create cheyyum
  -> token + admin object response aayi return cheyyum
```

### Admin protected route flow

```text
Admin page fetch cheyyumbo
  -> request /api/admin/...
  -> server Authorization header check cheyyum
  -> token verify cheyyum
  -> role admin aanenkil allow cheyyum
  -> /api/admin/products pole url-ne /products aakki json-server router-lekku വിടും
```

Important snippet:

```js
if (req.url === '/api/admin/dashboard/stats') {
  return res.json({
    totalProducts: db.get('products').size().value() || 0,
    totalOrders: db.get('orders').size().value() || 0,
    totalUsers: db.get('users').size().value() || 0,
    totalRevenue: orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    recentOrders
  });
}
```

Meaning:

```js
// dashboard cards-in vendi aggregate/count data ivide custom aayi create cheyyunnu
// json-server plain CRUD mathram alle, athukondu extra logic ivide aanu
```

## 8. Client Side Full Working Flow

### 8.1 Home Page

File: `src/pages/Home.jsx`

Home page:

- hero banner kaanikku
- category cards kaanikku
- deals fetch cheyyum
- trending products fetch cheyyum

Data fetch:

```jsx
const { data: products, isLoading: isProductsLoading } = useProducts();
const { data: deals, isLoading: isDealsLoading } = useDeals();
const trendingProducts = products ? products.slice(0, 8) : [];
```

Meaning:

```jsx
// useProducts -> /products fetch cheyyum
// useDeals -> /deals fetch cheyyum
// first 8 products trending section-il show cheyyunnu
```

### 8.2 Product Hook Layer

File: `src/features/products/useProducts.js`

```jsx
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
```

Meaning:

```jsx
// React Query use cheythu products fetch cheyyum
// cache key = products
// 10 minute vare fresh aayi consider cheyyum
```

### 8.3 Navbar Flow

File: `src/Components/layout/Navbar.jsx`

Navbar jobs:

- logo + links
- live search input
- cart item count
- login/logout actions
- profile shortcut

Search flow:

```jsx
if (q) {
  navigate(`/shop?q=${encodeURIComponent(q)}`);
} else {
  navigate('/shop');
}
```

Meaning:

```jsx
// search submit aayal Shop page-il query param use cheythu navigate cheyyum
// example: /shop?q=nike
```

### 8.4 Shop Page

File: `src/pages/Shop.jsx`

Ithu project-le most important learning page aanu because filtering logic ivide aanu.

Main concerns:

- fetch all products
- read URL search params
- category filter
- subcategory filter
- brand filter
- sort
- pagination
- mobile filter drawer

Main filter pipeline:

```jsx
const filteredProducts = useMemo(() => {
  let result = products;

  if (selectedCategory !== 'All') {
    result = result.filter(p => p.category === selectedCategory);
  }

  if (selectedSubCategory !== 'All') {
    result = result.filter(p => p.subCategory === selectedSubCategory);
  }

  if (selectedBrands.length > 0) {
    result = result.filter(p => selectedBrands.includes(p.brand));
  }

  if (debouncedSearch) {
    const lowerSearch = debouncedSearch.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(lowerSearch) ||
      p.brand.toLowerCase().includes(lowerSearch)
    );
  }

  return result;
}, [products, selectedCategory, selectedSubCategory, selectedBrands, debouncedSearch, sortOrder]);
```

Meaning:

```jsx
// products list kittiyal athine step by step filter cheyyunnu
// aadyam category
// pinne subcategory
// pinne brand
// pinne search text
// last-il sort + pagination apply cheyyum
```

Why `useDebounce`?

File: `src/hooks/useDebounce.js`

- user fast typing cheyyumbo every key press-il filter/search heavy aakathirikan
- small delay koduthu final input value use cheyyan

### 8.5 Product Detail Page

File: `src/pages/ProductDetail.jsx`

Ivide single product detail kaanikku.

Main jobs:

- `id` route param read cheyyuka
- single product fetch cheyyuka
- quantity control cheyyuka
- add to cart
- buy now

Snippet:

```jsx
const { id } = useParams();
const { data: product } = useProduct(id);
```

Meaning:

```jsx
// /product/101 pole route vannal 101 eduthu fetch cheyyum
// useProduct(id) -> /products/101 call cheyyum
```

Add to cart flow:

```text
Add to Cart click
  -> login undo check
  -> Redux cart update
  -> toast show
  -> server /carts?userId=... fetch
  -> existing cart undo check
  -> put/post request use cheythu db update
```

Key idea:

```jsx
dispatch(addToCart({ product, quantity }));
```

Meaning:

```jsx
// UI fast aayi respond cheyyan aadyam Redux update cheyyunnu
// backend sync pinne background-il cheyyunnu
```

### 8.6 Cart Slice

File: `src/features/cart/cartSlice.js`

Main reducers:

- `setCart`
- `addToCart`
- `updateQuantity`
- `removeFromCart`
- `clearCart`

Most important logic:

```jsx
const existingItem = state.items.find(item => item.product.id === product.id);

if (existingItem) {
  existingItem.quantity += quantity;
} else {
  state.items.push({ product, quantity });
}
```

Meaning:

```jsx
// same product repeat add cheythal duplicate line create cheyyilla
// existing line item quantity increase cheyyum
```

### 8.7 Cart Page

File: `src/pages/Cart.jsx`

Cart page-il 3 layers und:

1. left side item list
2. coupon logic
3. order summary

Coupon flow:

```text
User coupon type cheyyum
  -> /coupons?userId=...&code=... fetch
  -> code match undo nokkum
  -> expiry nokkum
  -> min order nokkum
  -> percent/fixed discount calculate cheyyum
  -> final total reduce cheyyum
```

Key snippet:

```jsx
if (coupon.type === 'percent') {
  discount = Math.round(cartTotal * (coupon.discount / 100));
} else {
  discount = Number(coupon.discount);
}
```

Meaning:

```jsx
// coupon data type percent aano fixed amount aano ennu നോക്കി calculation maattunnu
```

### 8.8 Auth Slice

File: `src/features/auth/authSlice.js`

Main responsibility:

- user data localStorage-il save cheyyuka
- refresh kazhinjal restore cheyyuka
- login/logout state manage cheyyuka

Snippet:

```jsx
const initialState = {
  user: loadUserFromStorage(),
  isAuthenticated: !!loadUserFromStorage(),
  loading: false,
  error: null,
};
```

Meaning:

```jsx
// browser refresh kazhinjalum login state pokathe localStorage-il ninnu veendum load cheyyunnu
```

### 8.9 Login Page

File: `src/pages/Login.jsx`

Interesting point:

- same login form user + admin randum handle cheyyunnu

Flow:

```text
email/password submit
  -> /users?email=...&password=... fetch
  -> user found aano check
  -> role admin aanenkil admin thunk dispatch
  -> allenkil user loginSuccess dispatch
```

Snippet:

```jsx
if (user.role === 'admin') {
  const result = await dispatch(adminLogin({ email, password }));
  if (result.success) {
    navigate('/admin/dashboard');
  }
  return;
}
```

Meaning:

```jsx
// admin user aanenkil normal customer home-il pokilla
// admin auth flow separate aayi run cheyyum
```

### 8.10 Register Page

File: `src/pages/Register.jsx`

Flow:

```text
submit
  -> email already undo check
  -> new user object create
  -> /users POST
  -> password remove cheytha user object Redux-il save
  -> auto login + home redirect
```

### 8.11 Protected Route

File: `src/routes/ProtectedRoute.jsx`

```jsx
if (!isAuthenticated) {
  return <Navigate to="/login" state={{ from: location }} replace />;
}
return <Outlet />;
```

Meaning:

```jsx
// login illatha user /cart, /checkout, /profile thurakkan try cheythal login page-il redirect cheyyum
// Outlet means nested protected pages render cheyyanulla slot
```

### 8.12 Checkout Page

File: `src/pages/Checkout.jsx`

Ithu cart checkout + buy now checkout randum handle cheyyunnu.

Very important snippet:

```jsx
const buyNowItem = location.state?.buyNowItem;
const displayItems = buyNowItem ? [buyNowItem] : cartItems;
const displayTotal = buyNowItem ? (buyNowItem.product.price * buyNowItem.quantity) : cartTotal;
```

Meaning:

```jsx
// ProductDetail-il "Buy Now" cheythal single item checkout
// Cart-il ninnu vannal full cart checkout
```

Address flow:

```text
Checkout open
  -> past orders fetch cheyyum
  -> old shipping addresses extract cheyyum
  -> unique addresses list kaanikku
  -> user old address select cheyyam / new address fill cheyyam
```

Place order flow:

```text
submit
  -> fake payment delay
  -> new order object create
  -> /orders POST
  -> if normal cart checkout:
       -> server cart empty aakkum
       -> Redux clearCart dispatch
  -> success toast
  -> order-success page-il navigate
```

### 8.13 Order Success Page

File: `src/pages/OrderSuccess.jsx`

Purpose:

- order receipt kaanikku
- tracking stages kaanikku
- print option
- recommended products

Flow:

```text
route param orderId read
  -> /orders/:id fetch
  -> receipt render
  -> status timeline render
```

### 8.14 Profile Page

File: `src/pages/Profile.jsx`

Profile page 3 major sections:

- orders
- addresses
- edit profile

Data flow:

```text
profile open
  -> current user from Redux
  -> /orders?userId=... fetch
  -> orders tab build
  -> addresses from order.shippingAddress derive cheyyum
  -> profile save cheythal /users/:id PUT
```

Important learning point:

Profile page often backend-il separate `/addresses` table illa. Existing `orders.shippingAddress` ninnu derive cheyyunnu.

## 9. Admin Side Architecture

Admin side app-inte separate mini application pole aanu.

Flow:

```text
/admin/*
  -> AdminRoutes.jsx
  -> AdminProtectedRoute
  -> AdminLayout
  -> Specific admin page
```

### 9.1 Admin Routes

File: `src/admin/routes/AdminRoutes.jsx`

Role:

- admin routes declare cheyyunnu
- protected shell wrap cheyyunnu
- layout apply cheyyunnu

Snippet:

```jsx
<Route element={<AdminProtectedRoute />}>
  <Route element={<AdminLayout />}>
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="products" element={<AdminProducts />} />
    <Route path="orders" element={<AdminOrders />} />
    <Route path="carts" element={<AdminCarts />} />
    <Route path="users" element={<AdminUsers />} />
    <Route path="categories" element={<AdminCategories />} />
    <Route path="coupons" element={<AdminCoupons />} />
  </Route>
</Route>
```

Meaning:

```jsx
// admin layout-il sidebar/header same aayi irikkum
// middle content matram page anusaarichu maari varum
```

### 9.2 Admin Protected Route

File: `src/admin/routes/AdminProtectedRoute.jsx`

```jsx
const { isAuthenticated, token } = useSelector((state) => state.admin);

if (!isAuthenticated || !token) {
  return <Navigate to="/login" replace />;
}
```

Meaning:

```jsx
// admin token illengil admin pages allow cheyyilla
```

### 9.3 Admin Layout

File: `src/admin/layout/AdminLayout.jsx`

Responsibilities:

- sidebar navigation
- mobile drawer
- admin profile block
- logout button
- `<Outlet />` through page rendering

Learning note:

Public app-inte navbar/footer pattern pole alla. Admin section dashboard shell pattern follow cheyyunnu.

### 9.4 Admin Store

Files:

- `src/admin/store/adminSlice.js`
- `src/admin/store/adminThunks.js`

`adminSlice` manages:

- admin object
- token
- loading
- error

`adminThunks.js` manages async login:

```jsx
export const adminLogin = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const { data } = await adminLoginApi(credentials);
    dispatch(loginSuccess({ admin: data.admin, token: data.token }));
    return { success: true };
  } catch (error) {
    const message = error.response?.data?.message || "Login failed";
    dispatch(loginFailure(message));
    return { success: false, message };
  }
};
```

Meaning:

```jsx
// thunk = async business logic
// API call വിജയിച്ചാൽ token + admin details save cheyyum
// fail aayal error state set cheyyum
```

## 10. Admin Data Layers

Admin side-il 3-layer structure valare nannayi separate cheythittundu:

1. `services`
2. `queries`
3. `pages`

### 10.1 Services Layer

File: `src/admin/services/adminServices.js`

Ithu raw API functions mathram aanu.

Examples:

```js
export const fetchAllProducts = (params) => adminApi.get("/admin/products", { params });
export const updateOrderStatus = (id, status) => adminApi.patch(`/admin/orders/${id}`, { status });
export const fetchAllUsers = (params) => adminApi.get("/admin/users", { params });
```

Meaning:

```js
// ee layer-il UI logic illa
// axios request functions mathram
```

### 10.2 Queries Layer

File: `src/admin/queries/adminQueries.js`

Ithu admin side-le brain pole aanu.

Ivide:

- React Query hooks und
- server data normalize cheyyunnu
- search/pagination client-side cheyyunnu
- mutations success aayal invalidate cheyyunnu
- toast show cheyyunnu

Important helper:

```js
const normalizeProduct = (product) => ({
  ...product,
  _id: product._id || product.id,
  category:
    typeof product.category === "string" ? { name: product.category } : product.category || { name: "—" },
});
```

Meaning:

```js
// db.json-le data shape page-inde expectation-ode same allenkil ivide standard shape-il maattunnu
// ath kond UI page simple aayi ezhutham
```

Mutation flow:

```js
onSuccess: () => {
  qc.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
  toast.success("Product created successfully");
}
```

Meaning:

```js
// create/update/delete kazhinjal cached products veendum fetch cheyyan invalidate cheyyum
// ath kond refresh illathe latest UI kaanum
```

## 11. Admin Pages Working Flow

### 11.1 Admin Dashboard

File: `src/admin/pages/AdminDashboard.jsx`

Jobs:

- stats cards
- recent orders table
- quick order modal
- status update

Flow:

```text
Dashboard load
  -> useDashboardStats()
  -> /api/admin/dashboard/stats
  -> cards render
  -> recentOrders render
  -> modal-il order status maattam
```

### 11.2 Admin Products

File: `src/admin/pages/AdminProducts.jsx`

Great learning page because ithil full CRUD pattern und.

Features:

- search
- pagination
- view modal
- edit modal
- create modal
- delete confirmation

Flow:

```text
page load
  -> useProducts({ search, page, limit })
  -> products table render
Add Product
  -> openCreate()
  -> form fill
  -> createProduct mutation
Edit Product
  -> openEdit(product)
  -> form state populate
  -> updateProduct mutation
Delete Product
  -> window.confirm
  -> deleteProduct mutation
```

Payload creation:

```jsx
const payload = {
  name: form.name,
  price: Number(form.price || 0),
  stock: Number(form.stock || 0),
  category: form.category,
  brand: form.brand,
  description: form.description,
  images: form.image ? [form.image] : [],
};
```

Meaning:

```jsx
// form input values mostly string aanu
// backend/store consistent aakan price/stock number aakkunnu
// single image input-ne images array aakkunnu
```

### 11.3 Admin Orders

Pattern-wise ith `AdminDashboard` recent order modal-ne extend cheytha full order management page aanu.

Common things expect cheyyam:

- status filter
- search by id or customer
- modal open
- status patch

### 11.4 Admin Users

Likely pattern:

- users list
- status toggle
- delete user

Connected hook:

- `useUsers`
- `useUpdateUserStatus`
- `useDeleteUser`

### 11.5 Admin Categories

Pattern:

- categories list fetch
- create/update/delete

Connected hook:

- `useCategories`
- `useCreateCategory`
- `useUpdateCategory`
- `useDeleteCategory`

### 11.6 Admin Carts and Coupons

Separate service/query files:

- `src/admin/services/cartServices.js`
- `src/admin/services/couponServices.js`
- `src/admin/queries/cartQueries.js`
- `src/admin/queries/couponQueries.js`

Learning note:

Project author features split cheythittundu:

- common admin resources `adminQueries.js`
- cart-specific queries separate
- coupon-specific queries separate

Ithu scalable structure aanu.

## 12. Full End-to-End Data Flows

### Flow A: User Registration

```text
Register form
  -> /users?email=... check
  -> /users POST
  -> loginSuccess dispatch
  -> localStorage save
  -> home redirect
```

### Flow B: User Login

```text
Login form
  -> /users query
  -> if admin => admin thunk
  -> else => authSlice loginSuccess
  -> Redux update
  -> localStorage save
  -> redirect
```

### Flow C: Add To Cart

```text
ProductDetail
  -> addToCart dispatch
  -> navbar count update
  -> /carts?userId fetch
  -> put/post to server
```

### Flow D: Checkout and Order

```text
Cart/Buy Now
  -> Checkout
  -> shipping form
  -> payment method select
  -> /orders POST
  -> /carts clear
  -> Redux clearCart
  -> OrderSuccess
```

### Flow E: Admin Product CRUD

```text
AdminProducts
  -> useProducts query
  -> adminServices -> adminApi -> server
  -> CRUD mutation
  -> invalidateQueries
  -> UI auto refresh
```

## 13. Code Reading Order

Project first time padikkan best order ithaanu:

1. `src/main.jsx`
2. `src/App.jsx`
3. `src/Store/store.js`
4. `src/api/axios.js`
5. `src/features/auth/authSlice.js`
6. `src/features/cart/cartSlice.js`
7. `src/features/products/useProducts.js`
8. `src/routes/ProtectedRoute.jsx`
9. `src/Components/layout/Navbar.jsx`
10. `src/pages/Home.jsx`
11. `src/pages/Shop.jsx`
12. `src/pages/ProductDetail.jsx`
13. `src/pages/Cart.jsx`
14. `src/pages/Login.jsx`
15. `src/pages/Register.jsx`
16. `src/pages/Checkout.jsx`
17. `src/pages/OrderSuccess.jsx`
18. `src/pages/Profile.jsx`
19. `server.js`
20. `src/admin/api/adminApi.js`
21. `src/admin/store/adminSlice.js`
22. `src/admin/store/adminThunks.js`
23. `src/admin/services/adminServices.js`
24. `src/admin/queries/adminQueries.js`
25. `src/admin/routes/AdminRoutes.jsx`
26. `src/admin/layout/AdminLayout.jsx`
27. `src/admin/pages/AdminDashboard.jsx`
28. `src/admin/pages/AdminProducts.jsx`
29. remaining admin pages

## 14. Step-by-Step Workout Plan

### Stage 1: Foundation

Read and understand:

- `main.jsx`
- `App.jsx`
- `store.js`

Target:

- Provider enthaanu
- Router enthaanu
- Redux slice enthaanu
- React Query enthaanu

### Stage 2: User State

Read:

- `authSlice.js`
- `cartSlice.js`
- `ProtectedRoute.jsx`

Target:

- login state engane persist aakunnu
- cart add/update/remove engane nadakkunnu
- route protection engane aanu

### Stage 3: Product Browsing

Read:

- `useProducts.js`
- `Navbar.jsx`
- `Home.jsx`
- `Shop.jsx`
- `ProductCard.jsx`

Target:

- data fetch flow
- query params
- filtering/sorting/pagination

### Stage 4: Purchase Flow

Read:

- `ProductDetail.jsx`
- `Cart.jsx`
- `Checkout.jsx`
- `OrderSuccess.jsx`

Target:

- add to cart
- coupon apply
- order place
- receipt render

### Stage 5: Account Flow

Read:

- `Login.jsx`
- `Register.jsx`
- `Profile.jsx`

Target:

- auth branching
- auto login
- orders history
- profile update

### Stage 6: Backend Understanding

Read:

- `server.js`
- `db.json`

Target:

- fake backend engane work cheyyunnu
- admin token engane generate cheyyunnu
- custom route engane build cheyyunnu

### Stage 7: Admin App

Read:

- `adminApi.js`
- `adminSlice.js`
- `adminThunks.js`
- `adminServices.js`
- `adminQueries.js`
- admin pages

Target:

- service layer
- query layer
- mutation layer
- CRUD UI pattern

## 15. Practice Tasks for Learning

These tasks cheythal project nalla pole internalize cheyyam:

1. Shop page-il price range filter add cheyyuka.
2. Cart page-il quantity server sync live aakkuka.
3. Login kazhinjal previous page-il redirect cheyyuka.
4. Profile logout button actual logout dispatch cheyyunna reethiyil improve cheyyuka.
5. Admin products-il multiple image support add cheyyuka.
6. Admin dashboard-il monthly revenue chart add cheyyuka.
7. Orders status timeline user profile-ilum kaanikuka.
8. Coupon create page validation improve cheyyuka.

## 16. Common Patterns You Should Notice

### Pattern 1: UI -> Hook -> API

```text
Component
  -> custom hook / query hook
  -> service/api function
  -> server/db
```

### Pattern 2: Immediate UI + Background Sync

Example: `ProductDetail.jsx`

```text
dispatch(addToCart)
  -> UI fast update
  -> server sync later
```

### Pattern 3: Query Cache Refresh

Example admin create/update/delete:

```text
mutation success
  -> invalidateQueries
  -> auto refetch
  -> latest data render
```

### Pattern 4: Route Guard

```text
protected page request
  -> auth check
  -> allow or redirect
```

## 17. Quick File Definitions

Short file-wise definitions:

- `main.jsx` -> application bootstrap
- `App.jsx` -> route shell + cart sync
- `axios.js` -> public API client
- `store.js` -> Redux root store
- `authSlice.js` -> customer login state
- `cartSlice.js` -> cart state logic
- `useProducts.js` -> product/deal query hooks
- `ProtectedRoute.jsx` -> customer route guard
- `Navbar.jsx` -> top navigation + search + auth/cart links
- `Home.jsx` -> marketing homepage
- `Shop.jsx` -> listing/filter/search/pagination page
- `ProductDetail.jsx` -> single product detail + buy/add flow
- `Cart.jsx` -> cart items + coupon + price summary
- `Checkout.jsx` -> address + payment + order creation
- `OrderSuccess.jsx` -> receipt + order tracking UI
- `Profile.jsx` -> profile edit + orders + saved addresses
- `server.js` -> fake backend + admin auth
- `adminApi.js` -> admin axios with token interceptor
- `adminSlice.js` -> admin session state
- `adminThunks.js` -> admin login async logic
- `adminServices.js` -> raw admin API methods
- `adminQueries.js` -> admin React Query hooks + mutations
- `AdminRoutes.jsx` -> admin route map
- `AdminLayout.jsx` -> admin sidebar shell
- `AdminDashboard.jsx` -> dashboard cards + recent orders
- `AdminProducts.jsx` -> admin CRUD page for products

## 18. Final Study Advice

Ee project padikkumbo ee 4 questions eppozhum self-check cheyyuka:

1. Data evide ninnu varunnu?
2. State evide aanu store cheyyunnath?
3. User action kazhinjal exact next function enthaanu run aakunnath?
4. UI refresh aakunnath Redux kondaano React Query kondaano?

Best method:

- oru file open cheyyuka
- component state note cheyyuka
- event handlers note cheyyuka
- API calls mark cheyyuka
- `navigate`, `dispatch`, `useQuery`, `useMutation` kandupidikkuka
- aa flow paper-il draw cheyyuka

---

If you want, next step-il njan ithinte **Part 2** aayi full file-by-file annotated guide create cheyyam:

- every file summary
- major functions breakdown
- important lines explanation
- beginner questions + answers

All in Manglish style.
