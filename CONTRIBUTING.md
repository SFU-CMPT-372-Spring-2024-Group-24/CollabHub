# Contributing to CollabHub

## Table of contents

- [Getting started](#getting-started)
    - [Set up development environment](#set-up-development-environment)
        - [Generate a self-signed SSL certificate](#generate-a-self-signed-ssl-certificate)
        - [Set up Google Cloud Storage](#set-up-google-cloud-storage)
        - [Create environment file](#create-environment-file)
    - [Install dependencies](#install-dependencies)
    - [Start PostgreSQL server](#start-postgresql-server)
    - [Start backend (port 8080)](#start-backend-port-8080)
    - [Start frontend (port 3000)](#start-frontend-port-3000)

- [Development workflow (aka Git 101)](#development-workflow-aka-git-101)
    - [Create a feature branch](#1-create-a-feature-branch)
    - [Open an issue on GitHub web interface for the developing feature (optional)](#2-open-an-issue-on-github-web-interface-for-the-developing-feature-optional)
    - [Write code on your local machine](#3-write-code-on-your-local-machine)
    - [Commit changes locally](#4-commit-changes-locally)
    - [Merge main branch and resolve conflicts](#5-merge-main-branch-and-resolve-conflicts)
    - [Push to the remote feature branch](#6-push-to-the-remote-feature-branch)
    - [Pull request and merge](#7-pull-request-and-merge)
    - [Delete local and remote branch (optional)](#8-delete-local-and-remote-branch-optional)

- [Other useful Git commands](#other-useful-git-commands)
    - [Delete files from Git repository](#delete-files-from-git-repository)
    - [Rename a local branch](#rename-a-local-branch)

## Getting started

Clone this repository:

```bash
git clone https://github.com/SFU-CMPT-372-Spring-2024-Group-24/CollabHub.git
```

### Set up development environment

Change to the `backend/` directory.

#### Generate a self-signed SSL certificate

An SSL certificate is required to enable HTTPS communication between the backend and frontend. To generate a self-signed SSL certifcate, run:

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

This will create the `key.pem` and `cert.pem` files, which are your private key and certificate respectively.

#### Set up Google Cloud Storage

1. Log onto https://console.cloud.google.com (make sure you're in the right project).
2. Go to IAM & Admin > Service Accounts > Create Service Account. Name the account and set the role to Cloud Storage > Storage Admin.
3. Note the email address of the account you just created. Request the bucket owner to add you via this email.
4. Select the account > Keys > Add key > Create new key > JSON > Create. This will download a JSON file. Place the file in `backend/ignore/`.

#### Create environment file

While still in the `backend/` directory, create a `.env` file with the following variables (be sure to make changes to reflect your environment):

```bash
PORT=# e.g., 8080

DB_HOST=# e.g., localhost
DB_PORT=# e.g., 5432
DB_USERNAME=# e.g., postgres
DB_PASSWORD=# e.g., postgres
DB_NAME=# e.g., cmpt372project

SESSION_SECRET=# e.g., your-secret

GOOGLE_APPLICATION_CREDENTIALS=# e.g., ignore/key-file.json
GCLOUD_STORAGE_BUCKET=# e.g., bucket-name

NODE_ENV=development
```

Change to the `frontend/` directory. Create a `.env` file with the following variable:

```bash
VITE_APP_GOOGLE_CLIENT_ID=# your Google ID (for Google authentication)
```

### Install dependencies

In the `backend/` directory, run:

```bash
npm install
```

Repeat for the `frontend/` directory.

### Start PostgreSQL server

If you installed PostgreSQL with the official installer, the server should start automatically when you start your computer. Otherwise, you can start the server using your preferred method.

### Start backend (port 8080)

In the `backend/` directory, run:

```bash
npm run dev
```

> [!IMPORTANT]  
> **Database migrations**
>
> When changes are made to a model, a database migration might be required. If you haven't already, initialize `sequelize`:
>
> ```bash
> npx sequelize-cli init
> ```
>
> Then, modify the details in `config/config.json` to reflect your database connection (similar to your `.env` file). `sequelize` will use this information to connect to the database and perform changes to it.
>
> Lastly, perform a database migration by running:
>
> ```bash
> npx sequelize-cli db:migrate
> ```

### Start frontend (port 3000)

In the `frontend/` directory, run:

```bash
npm run dev
```

## Development workflow (aka Git 101)

> [!CAUTION]
>
> Make sure to perform a `git pull` and resolve any conflicts prior to pushing to the repository!

### 1. Create a feature branch

Create a new branch:

```bash
git checkout -b [branch-name]
```

Query current branches:

```bash
git branch
```

Switch to another branch:

```bash
git checkout [branch-name]
```

### 2. Open an issue on GitHub web interface for the developing feature (optional)

### 3. Write code on your local machine

### 4. Commit changes locally

```bash
git add .                  # stage files (new, modified, deleted, equivalent to `git add -A`)
git commit -m "[Comment]"  # write a reasonable commit log
```

> [!NOTE]
>
> In the commit message, mention the issue number # of the issue created in step 2 (if any).

### 5. Merge main branch and resolve conflicts

```bash
git checkout main              # switch to the local main
git pull                       # pull from remote main branch
git checkout [branch name]     # switch to the feature branch
git merge main                 # merge diff from main
```

> [!CAUTION]
>
> Resolve conflicts and errors before pushing to the remote repository.

### 6. Push to the remote feature branch

If it is the first time you're pushing to the remote, additional parameters are needed:

```bash
git checkout [branch name]            # switch to the feature branch
git push -u origin [branch name]      # create a new feature branch in the upstream and push
```

Otherwise:

```bash
git checkout [branch name]                     # switch to the feature branch
git push                                       # push from local to remote feature branch
```

### 7. Pull request and merge

1. Visit the GitHub repository
2. Select the branch you would like to merge to `main`
3. Open a new pull request

### 8. Delete local and remote branch (optional)

Once the branch is merged, it is good practice to delete the feature branch:

Delete a local branch:

```bash
git branch -d [branch name]
```

Delete a remote branch:

```bash
git push origin --delete [branch name]
```

Alternatively, you can use a web interface to delete a remote branch.

## Other useful Git commands

### Delete files from Git repository

If you need to remove a file from both git repository and local filesystem:

```bash
git rm [filename]
```

If you only want to remove a file from git repository (and keep the local copy):

```bash
git rm --cached [filename]
```

Once you're done, push changes to the remote repository:

```bash
git push
```

### Rename a local branch

```bash
git branch -m <oldname> <newname>
```
