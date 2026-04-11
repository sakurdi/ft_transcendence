*This project has been created as part of the 42 curriculum by <login1>, <login2>, <login3>, <login4>, and <login5>.*

# Push

## Description
**Push** is a comprehensive social platform and forum designed to facilitate community interaction through organized discussion boards, real-time communication, and secure data management. The project aims to provide a robust, scalable architecture for user-generated content, featuring:
- **Community Boards:** Hierarchical discussion areas with moderation capabilities.
- **Real-time Interaction:** Direct messaging and live updates via WebSockets.
- **Security-First Design:** Integration with HashiCorp Vault for sensitive secret management and API key authentication.
- **Modern User Experience:** A responsive React-based frontend coupled with a high-performance Go backend.

## Instructions

### Prerequisites
- **Docker & Docker Compose:** Ensure you have the latest version of Docker installed.
- **Make:** Used for simplified command execution.
- **OpenSSL:** (Optional) If you need to regenerate certificates for the Nginx proxy.

### Setup and Execution
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd push
    ```
2.  **Environment Configuration:**
    Ensure the `.env` file (if required by specific modules) is properly configured. The current setup relies on Docker environment variables defined in `docker-compose.yml`.
3.  **Build and Start the Project:**
    ```bash
    make build
    make up
    ```
4.  **Access the Application:**
    - HTTP: [http://localhost:1042](http://localhost:1042)
    - HTTPS: [https://localhost:1043](https://localhost:1043)

### Management Commands
- `make down`: Stop and remove containers.
- `make logs`: View real-time logs from all services.
- `make clean`: Wipe the database and stop all services.
- `make restart`: Restart the application.

## Team Information

| Login | Role | Responsibilities |
| :--- | :--- | :--- |
| **<login1>** | PO / Developer | [To be filled] |
| **<login2>** | PM / Developer | [To be filled] |
| **<login3>** | Tech Lead | [To be filled] |
| **<login4>** | Developer | [To be filled] |
| **<login5>** | Developer | [To be filled] |

## Project Management
- **Organization:** [To be filled: Task distribution, meeting frequency, etc.]
- **Tools:** [To be filled: GitHub Issues, Trello, etc.]
- **Communication:** [To be filled: Discord, Slack, etc.]

## Technical Stack
- **Frontend:** React (Vite) with Tailwind CSS for styling and React Router for navigation. Chosen for its component-based architecture and rapid development cycle.
- **Backend:** Go (Golang) using the Chi router. Chosen for its performance, type safety, and excellent support for concurrent processes (WebSockets).
- **Database:** PostgreSQL. Selected for its reliability, support for complex relational data, and the `citext` extension for case-insensitive searching.
- **Secret Management:** HashiCorp Vault. Used to securely store database credentials and other sensitive environment variables.
- **Proxy/Gateway:** Nginx. Handles SSL termination and acts as a reverse proxy for the frontend and backend services.

## Database Schema
The system utilizes a relational PostgreSQL schema:
- **users:** Stores user profiles, credentials (hashed), and roles (`superadmin`, `user`, `banned`).
- **sessions:** Manages server-side session state.
- **api_keys:** Allows users to generate keys for programmatic access.
- **boards:** Defines community spaces with owners and descriptions.
- **board_moderators:** A junction table for managing user permissions within specific boards.
- **posts:** Stores threads (parent posts) and replies, supporting file uploads.
- **dm_messages:** Manages direct private messages between users.
- **friend_list / friend_requests:** Tracks social connections and pending requests.

## Features List

| Feature | Description | Worked on by |
| :--- | :--- | :--- |
| **Authentication** | Secure login, registration, and session management. | [Name] |
| **API Vault** | Integration with HashiCorp Vault for secret injection. | [Name] |
| **Discussion Boards** | Creation, search, and moderation of boards. | [Name] |
| **Threads & Posts** | Rich text discussions with support for image uploads. | [Name] |
| **Real-time Chat** | WebSocket-based direct messaging system. | [Name] |
| **Friends System** | Sending, accepting, and managing friend lists. | [Name] |
| **API Keys** | User-generated keys for API interaction. | [Name] |

## Modules
*[To be filled later]*

## Individual Contributions

### <login1>
- **Contributions:** [Details]
- **Challenges:** [Details]

### <login2>
- **Contributions:** [Details]
- **Challenges:** [Details]

### <login3>
- **Contributions:** [Details]
- **Challenges:** [Details]

### <login4>
- **Contributions:** [Details]
- **Challenges:** [Details]

### <login5>
- **Contributions:** [Details]
- **Challenges:** [Details]

## Resources
- **Go Documentation:** [golang.org/doc](https://golang.org/doc)
- **React Documentation:** [react.dev](https://react.dev)
- **HashiCorp Vault Guide:** [developer.hashicorp.com/vault](https://developer.hashicorp.com/vault)

### AI Usage
AI was used in this project to:
- [To be filled: Specify tasks like boilerplate generation, debugging, or documentation assistance].
- [To be filled: Specify which parts of the project involved AI].
