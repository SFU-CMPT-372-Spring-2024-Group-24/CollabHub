# CollabHub

A fullstack project management application built using the PERN (PostgreSQL, Express.js, React, Node.js) stack. It serves as a centralized platform for effective collaboration and project organization, developed as a project for SFU CMPT 372 Spring 2024 by Group 24.


## Getting started

For instructions on setting up a development environment and getting started with CollabHub, please refer to [CONTRIBUTING.md](CONTRIBUTING.md).

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
    - Establish priorities
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
