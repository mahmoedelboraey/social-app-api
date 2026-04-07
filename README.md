# 📝 Blog App — Full Backend (Express + MongoDB + JWT + ImageKit)

## 🗂️ Project Structure

```
blog-app/
├── config/
│   ├── db.js               → MongoDB connection
│   └── imagekit.js         → ImageKit SDK setup
├── controllers/
│   ├── authController.js   → Register, Login, GetMe
│   ├── userController.js   → CRUD users
│   ├── postController.js   → CRUD posts + likes
│   ├── groupController.js  → Groups + members + permissions
│   └── commentController.js→ Comments (bonus)
├── middleware/
│   ├── auth.js             → protect + restrictTo
│   ├── upload.js           → multer + uploadOnImageKit
│   ├── validate.js         → Joi schemas
│   └── errorHandler.js     → Global error handler
├── models/
│   ├── User.js
│   ├── Post.js
│   ├── Group.js
│   └── Comment.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── postRoutes.js
│   └── groupRoutes.js
├── utils/
│   ├── AppError.js         → Custom error class
│   ├── catchAsync.js       → Async wrapper
│   ├── generateToken.js    → JWT generator
│   └── apiFeatures.js      → Pagination + search
├── .env                    → Environment variables (do NOT commit)
├── .env.example            → Template for env vars
├── .gitignore
├── app.js                  → Express app setup
├── server.js               → Entry point
├── vercel.json             → Vercel deployment config
└── package.json
```

---

## 🚀 Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
PORT=3000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/blogapp
JWT_SECRET=any_long_random_string
JWT_EXPIRES_IN=7d

IMAGEKIT_PUBLIC_KEY=your_key
IMAGEKIT_PRIVATE_KEY=your_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

### 3. Run the server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

---

## 📦 Libraries to Install

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT tokens |
| `joi` | Input validation |
| `multer` | File upload handling |
| `imagekit` | ImageKit SDK |
| `dotenv` | Environment variables |
| `cors` | Cross-origin requests |
| `morgan` | HTTP request logger |
| `express-rate-limit` | Rate limiting |
| `nodemon` | Auto-restart in dev |

All are already in `package.json`. Just run `npm install`.

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (protected) |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | admin, super-admin |
| GET | `/api/users/:id` | Get one user | protected |
| PATCH | `/api/users/:id` | Update user | own or super-admin |
| DELETE | `/api/users/:id` | Delete user | own or super-admin |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get all accessible posts (paginated, searchable) |
| GET | `/api/posts/my-posts` | Get my posts |
| GET | `/api/posts/user/:userId` | Get user's posts |
| GET | `/api/posts/:id` | Get one post |
| POST | `/api/posts` | Create post (with images) |
| PATCH | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/posts/:id/like` | Like/unlike post |
| GET | `/api/posts/:postId/comments` | Get comments |
| POST | `/api/posts/:postId/comments` | Add comment |
| DELETE | `/api/posts/:postId/comments/:id` | Delete comment |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | Get all groups |
| POST | `/api/groups` | Create group |
| GET | `/api/groups/:id` | Get one group |
| PATCH | `/api/groups/:id` | Update group (admin only) |
| DELETE | `/api/groups/:id` | Delete group (admin only) |
| POST | `/api/groups/:id/members` | Add member |
| DELETE | `/api/groups/:id/members` | Remove member |
| POST | `/api/groups/:id/admins` | Add admin |
| POST | `/api/groups/:id/permissions/grant` | Grant post permission |
| POST | `/api/groups/:id/permissions/revoke` | Revoke post permission |

---

## 📮 Postman Tips

### Register
```json
POST /api/auth/register
{
  "username": "ahmed",
  "email": "ahmed@example.com",
  "password": "123456"
}
```

### Login → Copy the token
```json
POST /api/auth/login
{
  "email": "ahmed@example.com",
  "password": "123456"
}
```

### Create Post (multipart/form-data)
```
POST /api/posts
Authorization: Bearer <token>
Body: form-data
  title: My First Post
  content: This is the content of my post
  images: [file1.jpg, file2.jpg]
```

### Query Parameters
```
GET /api/posts?page=1&limit=10&search=hello&sort=-createdAt
```

---

## 🌐 Deployment

### GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourname/blog-app.git
git push -u origin main
```

### Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Add environment variables (same as `.env`)
4. Deploy ✅

---

## 🔑 Roles Summary

| Action | user | admin | super-admin |
|--------|------|-------|-------------|
| Register/Login | ✅ | ✅ | ✅ |
| Get all users | ❌ | ✅ | ✅ |
| Update/Delete own account | ✅ | ✅ | ✅ |
| Update/Delete any account | ❌ | ❌ | ✅ |
| Create post | ✅ | ✅ | ✅ |
| Edit/Delete own post | ✅ | ✅ | ✅ |
| Edit/Delete any post | ❌ | ❌ | ✅ |
| Create group | ✅ | ✅ | ✅ |
| Manage group members | admin only | ✅ | ✅ |
| Override everything | ❌ | ❌ | ✅ |
