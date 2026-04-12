*This project has been created as part of the 42 curriculum by saal-kur, kevwang, gaeudes, esouhail, and hsebiane.*

# ft_transcendence

## Description
**ft_transcendence** is a comprehensive social platform and forum designed to facilitate community interaction through organized discussion boards, real-time communication, and secure data management. The project aims to provide a robust, scalable architecture for user-generated content, featuring:
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
    cd ft_transcendence
    ```
2.  **Environment Configuration:**
    Ensure the `.env` file (if required by specific modules) is properly configured. The current setup relies on Docker environment variables defined in `docker-compose.yml`.
3.  **Build and Start the Project:**
    ```bash
    make build
    make up
    ```
4.  **Access the Application:**
    - HTTPS: [https://localhost:1043](https://localhost:1043)

### Management Commands
- `make down`: Stop and remove containers.
- `make logs`: View real-time logs from all services.
- `make clean`: Wipe the database and stop all services.
- `make restart`: Restart the application.

## Team Information

| Login | Role | Responsibilities |
| :--- | :--- | :--- |
| **saal-kur** | PO / Developer | Defining project goals, feature prioritization, and core backend implementation. |
| **kevwang** | Tech Lead / Developer | System architecture design, technical problem solving, and backend API development. |
| **gaeudes** | Developer | Frontend component development, UI/UX implementation, and API integration. |
| **esouhail** | Developer | responsible for API development. |
| **hsebiane** | PM | Task distribution, timeline management, and documentation oversight. |

## Project Management
- **Organization:** Weekly Meetups.
- **Tools:** Github, Discord
- **Communication:** Discord, and School.

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

| Feature | Description | By |
| :--- | :--- | :--- |
| **Authentication** | Secure Registration, Login, and Session-based Auth. | saal-kur, gaeudes |
| **User Profiles** | Customizable profiles with avatar uploads and biography. | kevwang, gaeudes, saal-kur |
| **Social System** | Friend requests (send/accept/decline), friends list, and presence tracking. | kevwang |
| **Discussion Boards** | Create, browse, and search for community boards with owner controls. | saal-kur, gaeudes |
| **Threaded Posts** | Infinite scrolling for threads and replies, supporting rich text and file uploads. | saal-kur, gaeudes, kevwang |
| **Real-time Engine** | WebSockets for live updates on boards, threads, and private messaging. | kevwang |
| **Direct Messaging** | Private, real-time chat between friends. | kevwang |
| **Public API** | REST API for external access with API key authentication and rate limiting. | esouhail |
| **Moderation Tools** | Role-based permissions for board admins, moderators, and superadmins. | saal-kur, gaeudes |
| **Secret Management** | Full HashiCorp Vault integration for injecting sensitive credentials. | saal-kur |
| **Security Layer** | Nginx reverse proxy with SSL termination and ModSecurity WAF. | saal-kur, gaeudes |


## Modules

| Module | Type | Points | Justification | Implementation |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Framework** | Minor | 1 | React used for modular component-based UI. | Vite + React 18. |
| **Real-time Features** | Major | 2 | WebSockets for live chat and notifications. | Gorilla WebSocket (Go) + React. |
| **User Interaction** | Major | 2 | Social features: chat, profiles, and friends. | Relational DB + WS broadcasting. |
| **Public API** | Major | 2 | Programmatic access for external integrations. | REST API with API Key auth & Rate limiting. |
| **Notification System** | Minor | 1 | Enhance UX with real-time feedback. | WebSocket events + persistent store. |
| **Custom Design System** | Minor | 1 | Consistent aesthetics across the platform. | Tailwind CSS + Reusable Components. |
| **Advanced Search** | Minor | 1 | Improved discoverability of boards/posts. | PostgreSQL full-text/ILike search. |
| **File Upload System** | Minor | 1 | Support for media-rich posts and avatars. | Local storage + server-side validation. |
| **User Management** | Major | 2 | Essential authentication and profile control. | hashing + JWT/Session management. |
| **Advanced Permissions** | Major | 2 | Role-based access control (RBAC). | Middleware-based permission checking. |
| **Organization System** | Major | 2 | Support for structured community groups. | Relational mapping of users to boards. |
| **Vault & WAF** | Major | 2 | High-security secret management & protection. | HashiCorp Vault + ModSecurity Nginx. |
| **Microservices** | Major | 2 | Scalable and decoupled architecture. | Dockerized services with REST/Internal API. |
| **Total Points** | | **21** | | | |



## Individual Contributions

### saal-kur
- **Contributions:** Acted as Product Owner, defining the project's vision and feature set. Focused on system security and core infrastructure, implementing HashiCorp Vault integration, Nginx/ModSecurity configuration, and the backend authentication system. Developed the community board and moderation logic. Implemented the project's architecture and database design.
- **Challenges:** Implementing a secure zero-trust secret management workflow and hardening the infrastructure against common web vulnerabilities.

### kevwang
- **Contributions:** Acted as Tech Lead, Developed the high-concurrency real-time engine using WebSockets, including the direct messaging and social systems (friends/presence). Implemented user profile management and contributed to the threaded post system. Implemented the direct messaging system, infinite scrolling features.
- **Challenges:** Managing complex WebSocket state and ensuring efficient real-time data broadcasting across various social features.

### gaeudes
- **Contributions:** Architected the frontend using React and Vite. Developed the responsive UI/UX using Tailwind CSS, implemented user profile management, and handled frontend-to-backend API integration.
- **Challenges:** Building a consistent and reusable design system while managing complex application state in the frontend.

### esouhail
- **Contributions:** Developed and assisted with database management and API refinement.
- **Challenges:** Handling concurrency and ensuring low-latency message delivery across multiple client sessions.

### hsebiane
- **Contributions:** Managed the project timeline and task distribution. Oversaw the creation of project documentation, including the README and API specifications, ensuring team alignment with milestones.
- **Challenges:** Coordinating parallel development tracks and maintaining comprehensive documentation as the project evolved.

## Resources
React:
 - https://medium.com/@jaswanth_270602/understanding-nested-components-and-props-in-react-a-beginners-guide-part-7-b244052609f2
 - https://medium.com/@a.g.stranger/4-different-ways-you-can-wrap-react-components-38b02302b07d
 - https://dev.to/ugglr/react-functional-components-const-vs-function-2kj9
 - https://medium.com/seat-code/what-if-i-pass-a-state-setter-as-a-prop-4c3592992cc6
 - https://dev.to/kurmivivek295/contextprovider-pattern-4m1c
 - https://medium.com/@it_it_ayush/search-in-react-heres-how-aaedac43ad07
 - https://thomas-rubattel.medium.com/override-a-props-type-of-a-react-component-to-be-mandatory-c539fe1f02f1
 - https://blog.appsignal.com/2022/06/15/how-to-handle-errors-in-react.html

Upload:
 - https://blog.openreplay.com/build-upload-progress-bar-js/
 - https://www.w3schools.com/js/js_ajax_http.asp
 - https://www.w3schools.com/xml/xml_http.asp
 - https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 - https://developer.mozilla.org/fr/docs/Learn_web_development/Core/Frameworks_libraries/React_interactivity_events_state#gestion_des_%C3%A9v%C3%A8nements
 - https://www.geeksforgeeks.org/reactjs/file-uploading-in-react-js/
 - https://medium.com/@blessingmba3/building-a-file-uploader-with-react-11dba6409480
 - https://medium.com/@umerfarooq.dev/mastering-react-forms-a-deep-dive-into-formdata-and-best-practices-7defecf45ad4
 - https://medium.com/@dlrnjstjs/the-complete-react-file-upload-guide-from-drag-drop-to-progress-tracking-b2edb40016c2
 - https://dev.to/alais29dev/building-a-real-time-search-filter-in-react-a-step-by-step-guide-3lmm
 - https://developer.mozilla.org/fr/docs/Web/API/XMLHttpRequest

Upload magic number:
 - https://en.wikipedia.org/wiki/List_of_file_signatures
 - https://medium.com/@nir.almog90/detect-validate-file-types-by-their-magic-numbers-in-react-f7f44bd45187
 - https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers
 - https://medium.com/@nir.almog90/detect-validate-file-types-by-their-magic-numbers-in-react-f7f44bd45187
 - https://mimesniff.spec.whatwg.org/
 - https://pkg.go.dev/net/http#DetectContentType
 - https://gist.github.com/rayrutjes/db9b9ea8e02255d62ce2

Pagination:
 - https://dev.to/siddheshk02/taking-pagination-to-the-next-level-sorting-and-filtering-in-go-apis-497d
 - https://medium.com/design-bootcamp/designing-filter-sort-for-better-ux-9b88f40081db
 - https://dev.to/hexshift/building-a-responsive-product-filter-and-sort-ui-with-tailwind-css-5e3e



Database:
 - https://www.back4app.com/tutorials/how-to-design-a-database-schema-for-a-real-time-chat-and-messaging-app#a-overview-of-key-classes
 - https://www.linkedin.com/pulse/how-discord-handles-trillions-messages-understanding-its-surya-m-sip8c
 - https://blog.postly.ai/how-social-media-platforms-manage-video-uploads/

Go:
 - https://golang.org/doc

Other:
 - https://websocketking.com/
 - https://tailwind-to-css.vercel.app/
 - https://developer.hashicorp.com/vault


### AI Usage
AI was used in this project to:
- Understand the technologies used in depth.
- Documentation formatting.
- Test cases.
- Knowing the good security practices.
