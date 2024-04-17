# CollabHub

A fullstack project management application built using the PERN (PostgreSQL, Express.js, React, Node.js) stack. It serves as a centralized platform for effective collaboration and project organization, developed as a project for SFU CMPT 372 Spring 2024 by Group 24.


## Getting started

For instructions on setting up a development environment and getting started with CollabHub, please refer to [CONTRIBUTING.md](CONTRIBUTING.md).

## Technical Implementation

### User Authentication

- Implemented a secure, session-based authentication system, and integrated with third-party authentication provider using OAuth 2.0

### Admin Dashboard

- Developed complex, role-based user interfaces and managed user permissions by introducing an administrative dashboard that allows for comprehensive management of users and projects.

### Project and Task Management

- Implemented CRUD operations using Express.js and Sequelize as the ORM for PostgreSQL to manage data.

- Tasks within projects can be moved between lists (To Do, In Progress, Done) via a React-based drag-and-drop interface or a dropdown menu.

### Role-based Access Control

- Implemented role-based access control within projects, with roles such as Owner, Editor, and Viewer, each having different levels of privileges, from full project management to view-only access.

### Real-time Communication

- Integrated Socket.IO, a WebSocket library, to facilitate real-time, bidirectional communication between users for enhanced collaboration.

### File Sharing and Previewing

- Leveraged Google Cloud Storage, a cloud-based storage, for file sharing and uploading within projects, with a built-in React-based file previewer supporting various file types.

### Search Capability

- Enhanced user experience by implementing a robust search functionality that allows users to search for project-related entities, users, and other projects. This search functionality uses Sequelize's operators for case-insensitive and multi-field matching, providing efficient and flexible search options to users.

### Other technical details

- The application is deployed on a virtual machine instance using the Compute Engine service provided by Google Cloud Platform. The PostgreSQL database is hosted on Google Cloud SQL, and file storage is handled using a Google Cloud Storage bucket.

## Features

### User authentication

- Easily sign up, log in, or use Google Sign In to access the platform.

### Admin dashboard

- Administrators can manage users and projects, including viewing total users/projects, managing user roles, and more.

### Projects

- Get started by creating a project or joining others'.
- Project customizations:
    - Adjust project descriptions
    - Add members
    - Assign roles
    - Attach files
    - Manage project membership
- Projects have three distinct roles each with tailored permissions:
    - Owner: full control of the project
    - Editor: interact with the project (e.g., create tasks, upload files, etc.) but not allowed to change more critical information like project details and members’ roles
    - Viewer: view projects and comment on tasks

### Tasks

- Seamlessly manage tasks across "To Do," "In Progress," or "Done" sections.
- Features:
    - Modify descriptions
    - Set due dates
    - Assign users and files
    - Establish priority levels
    - Add comments

### Chat functionality

- View and manage chats with ease using the chat icon located at the top right corner.
- Chat options:
    - Create new chats
    - Manage participants
    - Edit chat names
    - Change chat membership

### File management

- Upload files to a project and attach them to tasks to keep track of them more easily.
- Built-in file previewer with support for various file types.

### Search capability

- Efficiently search for project-related entities such as members, files, and tasks within projects.
- Explore users and projects outside of current project contexts.
