import ReactMarkdown from 'react-markdown';
import Button from '../../components/Button';

const markdown = `# Public API v1 Documentation

This document describes how to use the \`ft_transcendence\` Public API.

## Base URL
\`https://localhost:1043/api/public/v1\`

## Authentication
All public API requests require an \`X-API-Key\` header.
You can generate an API key in the user settings of the web application.

Example header:
\`X-API-Key: ftpub_abcd1234_yoursecrettoken\`

## Rate Limiting
The public API is rate-limited per API key:
- **Limit:** 60 requests per minute
- **Burst:** 20 requests
- **Error:** \`429 Too Many Requests\`

## Endpoints

### 1. List Boards
Returns a list of all boards.

- **Method:** \`GET\`
- **Path:** \`/boards\`
- **Auth:** Required

### 2. Get Board Details
Returns details for a specific board by name.

- **Method:** \`GET\`
- **Path:** \`/boards/{boardName}\`
- **Auth:** Required

### 3. Get Board Threads
Returns the latest threads for a specific board.

- **Method:** \`GET\`
- **Path:** \`/boards/{boardName}/threads\`
- **Query Params:**
  - \`limit\` (optional, default 25)
  - \`offset\` (optional, default 0)
- **Auth:** Required

### 4. Get Post Replies
Returns all replies for a specific post.

- **Method:** \`GET\`
- **Path:** \`/threads/{postID}/replies\`
- **Auth:** Required

### 5. Create Post
Creates a new thread in a board.

- **Method:** \`POST\`
- **Path:** \`/boards/{boardID}/posts\`
- **Auth:** Required
- **Body:**
\`\`\`json
{
  "title": "Thread Title",
  "content": "Thread content..."
}
\`\`\`
- **Success Response:** \`201 Created\`

### 6. Update Post
Updates an existing post (must be the author).

- **Method:** \`PUT\`
- \`Path:\` \`/posts/{postID}\`
- **Auth:** Required

### 7. Delete Post
Deletes a post (must be the author or a board moderator).

- **Method:** \`DELETE\`
- **Path:** \`/posts/{postID}\`
- **Auth:** Required

## Error Codes
- \`200\`: OK
- \`201\`: Created
- \`400\`: Bad Request
- \`401\`: Unauthorized
- \`403\`: Forbidden
- \`404\`: Not Found
- \`429\`: Too Many Requests
- \`500\`: Internal Server Error`;

export default function ApiDocs({ onClose }) {
  return (
    <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-soft-lg flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <header className="px-8 py-6 border-b border-surface-100 flex justify-between items-center bg-surface-50/50">
          <div>
            <h2 className="text-xl font-bold text-surface-900">API Documentation</h2>
            <p className="text-xs text-surface-500 uppercase tracking-widest font-bold mt-1">Version 1.0.0</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-surface-100">
            Close
          </Button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 prose prose-slate prose-brand max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-8 prose-h2:border-b prose-h2:pb-2 prose-code:text-brand-600 prose-code:bg-brand-50 prose-code:px-1 prose-code:rounded prose-pre:bg-surface-900 prose-pre:text-surface-50">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
        
        <footer className="px-8 py-4 bg-surface-50 border-t border-surface-100 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Got it
          </Button>
        </footer>
      </div>
    </div>
  );
}
