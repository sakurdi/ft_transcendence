# ft_transcendence_skeleton


Major: Use a framework for both the frontend and backend

Major: Implement real-time features using WebSockets or similar technology.
◦ Real-time updates across clients.
◦ Handle connection/disconnection gracefully.
◦ Efficient message broadcasting.

Major: Allow users to interact with other users. The minimum requirements are:
◦ A basic chat system (send/receive messages between users).
◦ A profile system (view user information).
◦ A friends system (add/remove friends, see friends list).

Major: A public API to interact with the database with a secured API key, rate limiting, documentation, and at least 5 endpoints:
◦ GET /api/{something}
◦ POST /api/{something}
◦ PUT /api/{something}
◦ DELETE /api/{something}

Minor: Use an ORM for the database

Minor: Progressive Web App (PWA) with offline support and installability

Minor: Custom-made design system with reusable components, including a proper
color palette, typography, and icons (minimum: 10 reusable components).

Minor: Implement advanced search functionality with filters, sorting, and pagination

Minor: File upload and management system.
◦ Support multiple file types (images, documents, etc.).
◦ Client-side and server-side validation (type, size, format).
◦ Secure file storage with proper access control.
◦ File preview functionality where applicable.
◦ Progress indicators for uploads.
◦ Ability to delete uploaded files

Minor: Support for additional browsers.
◦ Full compatibility with at least 2 additional browsers (Firefox, Safari, Edge, etc.).
◦ Test and fix all features in each browser.
◦ Document any browser-specific limitations.
◦ Consistent UI/UX across all supported browsers.

Major: Standard user management and `authentication.
◦ Users can update their profile information.
◦ Users can upload an avatar (with a default avatar if none provided).
◦ Users can add other users as friends and see their online status.
◦ Users have a profile page displaying their information.

Major: An organization system:
◦ Create, edit, and delete organizations.
◦ Add users to organizations.
◦ Remove users from organizations.
◦ View organizations and allow users to perform specific actions within an organization (minimum: create, read, update)

Major: Implement WAF/ModSecurity (hardened) + HashiCorp Vault for secrets:
◦ Configure strict ModSecurity/WAF.
◦ Manage secrets in Vault (API keys, credentials, environment variables), encrypted and isolated.

Minor: A gamification system to reward users for their actions.
◦ Implement at least 3 of the following: achievements, badges, leaderboards,
XP/level system, daily challenges, rewards
◦ System must be persistent (stored in database)
◦ Visual feedback for users (notifications, progress bars, etc.)
◦ Clear rules and progression mechanics

 Major: Backend as microservices.
◦ Design loosely-coupled services with clear interfaces.
◦ Use REST APIs or message queues for communication.
◦ Each service should have a single responsibility.

Minor: Health check and status page system with automated backups and disaster recovery procedures.
