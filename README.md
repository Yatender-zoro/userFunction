✨ Core Functionalities:
📝 User Registration & Login

POST /register: Register new users with hashed passwords.

POST /login: Authenticate user and create JWT-based session.

👤 User Profile

GET /profile: View user profile with all their posts.

GET /profile/upload: View the profile picture upload page.

POST /upload: Upload or update profile picture using Multer.

🖊️ Create & Manage Posts

POST /post: Add a new post.

GET /edit/:id: Render the edit page for a specific post.

POST /update/:id: Update post content.

❤️ Like & Unlike Posts

GET /like/:id: Like or unlike a post. Toggles based on user’s previous action.

🔐 JWT Authentication

## ✨ Features

- 🔐 **User Authentication** – Register and login with JWT-based cookie sessions.
- 👤 **User Profiles** – Upload profile pictures and view personal info.
- 📝 **Create/Edit Posts** – Users can post content, edit, and manage their posts.
- ❤️ **Like System** – Like/unlike other posts with a simple toggle.
- 📸 **Image Uploads** – Profile pictures handled securely via `Multer`.
- ⚙️ **Middleware Secured** – Protected routes using custom JWT middleware.
Every protected route checks for a valid JWT in cookies (isLoggedIn middleware).

GET /logout: Clears cookie and logs the user out.
