# Public API v1 Documentation

This document describes how to use the `ft_transcendence` Public API.

## Base URL
`https://localhost:8443/api/public/v1`

## Authentication
All public API requests require an `X-API-Key` header.
You can generate an API key in the user settings of the web application.

Example header:
`X-API-Key: ftpub_abcd1234_yoursecrettoken`

## Rate Limiting
The public API is rate-limited per API key:
- **Limit:** 60 requests per minute
- **Burst:** 20 requests
- **Error:** `429 Too Many Requests`

## Endpoints

### 1. List Boards
Returns a list of all boards.

- **Method:** `GET`
- **Path:** `/boards`
- **Auth:** Required
- **Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "42",
      "description": "Meilleur ecole",
      "owner_id": 1,
      "created_at": "2026-04-06T12:00:00Z"
    }
  ]
}
```

### 2. Get Board Details
Returns details for a specific board by name.

- **Method:** `GET`
- **Path:** `/boards/{boardName}`
- **Auth:** Required

### 3. Get Board Threads
Returns the latest threads for a specific board.

- **Method:** `GET`
- **Path:** `/boards/{boardName}/threads`
- **Query Params:**
  - `limit` (optional, default 25)
  - `offset` (optional, default 0)
- **Auth:** Required

### 4. Get Post Replies
Returns all replies for a specific post.

- **Method:** `GET`
- **Path:** `/threads/{postID}/replies`
- **Auth:** Required

### 5. Create Post
Creates a new thread in a board.

- **Method:** `POST`
- **Path:** `/boards/{boardID}/posts`
- **Auth:** Required
- **Body:**
```json
{
  "title": "Thread Title",
  "content": "Thread content..."
}
```
- **Success Response:** `201 Created`

### 6. Update Post
Updates an existing post (must be the author).

- **Method:** `PUT`
- **Path:** `/posts/{postID}`
- **Auth:** Required
- **Body:**
```json
{
  "title": "New Title (optional)",
  "content": "Updated content..."
}
```

### 7. Delete Post
Deletes a post (must be the author or a board moderator).

- **Method:** `DELETE`
- **Path:** `/posts/{postID}`
- **Auth:** Required

## Error Codes
- `200`: OK
- `201`: Created
- `400`: Bad Request (invalid data or missing fields)
- `401`: Unauthorized (missing or invalid API key)
- `403`: Forbidden (lack of permissions for the action)
- `404`: Not Found (resource does not exist)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error
