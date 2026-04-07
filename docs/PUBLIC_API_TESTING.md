# Public API v1 Testing Guide

This guide explains how to start the `ft_transcendence` project and verify the Public API v1 endpoints.

## Prerequisites
- Docker and Docker Compose
- `make`
- `curl`

## 1. Start the Application
Use the corrected Makefile to wipe any old state and start all services:

```bash
make rebuild
```

This command will:
1. Stop and remove existing containers and volumes.
2. Build the Docker images (including Go 1.24 for the backend).
3. Start the containers (Vault, DB, App, Frontend, Nginx).
4. Initialize Vault with a random database password.
5. Initialize the PostgreSQL database with the Vault password and seed data.

### Verify Startup
Check the logs of the `app` container to ensure the server is running:

```bash
docker compose logs app
```
Expected output: `Server running on :8080`

## 2. Obtain an API Key
The public API requires an `X-API-Key` header. You can obtain one by registering and logging in through the internal API.

### Step A: Register a new user
```bash
curl -vk -X POST https://localhost:1043/api/register \
  -H "Content-Type: application/json" \
  -d '{"username": "tester", "email": "tester@example.com", "password": "password123"}'
```

### Step B: Login and save session
```bash
curl -vk -X POST https://localhost:1043/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "tester", "password": "password123"}' \
  -c cookies.txt
```

### Step C: Create an API Key
```bash
curl -vk -X POST https://localhost:1043/api/user/api-keys \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name": "my-test-key"}'
```
**Capture the `api_key` from the response.** Example: `ftpub_xxxx_yyyyyyyyyyyyy`

## 3. Test Public API Endpoints

### Success Cases (using your API Key)

#### List Boards
```bash
curl -vk -H "X-API-Key: YOUR_API_KEY" https://localhost:1043/api/public/v1/boards
```

#### Get Board Threads
```bash
curl -vk -H "X-API-Key: YOUR_API_KEY" "https://localhost:1043/api/public/v1/boards/42/threads?limit=5"
```

#### Create a Post
```bash
curl -vk -X POST https://localhost:1043/api/public/v1/boards/1/posts \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "Public Thread", "content": "Hello from Public API"}'
```

#### Update a Post (Author only)
```bash
curl -vk -X PUT https://localhost:1043/api/public/v1/posts/3 \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated Public Content"}'
```

#### Delete a Post (Author or Mod only)
```bash
curl -vk -X DELETE https://localhost:1043/api/public/v1/posts/3 \
  -H "X-API-Key: YOUR_API_KEY"
```

### Failure Cases

#### Missing API Key (401)
```bash
curl -vk https://localhost:1043/api/public/v1/boards
```

#### Invalid API Key (401)
```bash
curl -vk -H "X-API-Key: invalid-key" https://localhost:1043/api/public/v1/boards
```

#### Board Not Found (404)
```bash
curl -vk -H "X-API-Key: YOUR_API_KEY" https://localhost:1043/api/public/v1/boards/nonexistent
```

## 4. Testing via Browser

Since browsers do not support custom headers (like `X-API-Key`) directly in the address bar, you have two options:

### Option A: Using the Developer Console (Recommended)
This is the fastest way to test without installing anything.

1.  Open your browser to `https://localhost:1043/api/public/v1/boards`.
2.  **Crucial:** You will see a security warning. Click **"Advanced"** and then **"Proceed to localhost (unsafe)"**. You will see a "Missing API Key" error—this is expected.
3.  Right-click anywhere on the page and select **Inspect** (or press `F12`) to open the Developer Tools.
4.  Go to the **Console** tab.
5.  Paste the following code (replace `YOUR_API_KEY` with your real key):

```javascript
// Example: GET Boards
fetch('https://localhost:1043/api/public/v1/boards', {
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
})
.then(response => response.json())
.then(data => console.log(data));

// Example: POST a Thread
fetch('https://localhost:1043/api/public/v1/boards/1/posts', {
  method: 'POST',
  headers: { 
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Browser Thread",
    content: "Created from the JS Console"
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Option B: Using a Browser Extension (Best Experience)
For a professional testing experience similar to Postman, install one of these extensions:
- **Thunder Client** (VS Code)
- **Talend API Tester** (Chrome/Firefox)
- **Postman** (Desktop or Web)

**Steps:**
1.  Set the Method (GET, POST, etc.).
2.  Enter the URL: `https://localhost:1043/api/public/v1/boards`.
3.  Go to the **Headers** tab and add:
    - `X-API-Key`: `YOUR_API_KEY`
4.  (For POST/PUT) Go to the **Body** tab, select **JSON**, and enter your data.
5.  Click **Send**.

## Troubleshooting
- **Failed to connect to db**: Ensure Vault has initialized correctly. `docker compose logs vault` should say "Le coffre est coffré".
- **429 Too Many Requests**: You have hit the rate limit (60 requests/min). Wait a moment before retrying.

## Quick smoke test
Run these three commands in order to confirm everything is working:

1. `make up` (Ensure project is running)
2. `curl -k https://localhost:1043/api/public/v1/boards` (Should return `401 Unauthorized: Missing API Key`)
3. Login and use a valid key (as described in section 2) to get a `200 OK` from the same endpoint.
