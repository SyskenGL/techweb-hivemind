# Hivemind: Application Setup

## Prerequisites

To run this application, make sure you have the following tools installed:

- **Docker Engine** version 28.0.1 or higher  
- **Docker Compose** version 2.33.1 or higher  

You can check the installed versions of Docker Engine and Docker Compose with the following commands:

```bash
docker --version
docker compose --version
```

## Optional Steps (but Recommended)

Before proceeding with the application build, it is **recommended** but **optional** to download the MinIO bucket backup from Google Drive using the following [drive link](https://drive.google.com/drive/folders/1w6luXvHIpc96OiTAih6y7e5RO0cwCxPw?usp=sharing). This step ensures that images are available.

The `hivemind-users-media` folder must be placed in the `deploy\hivemind-obj\backup\buckets` directory within the project.

**Note:** The script will attempt to restore the backup at every startup if available. Therefore, you can perform the restoration at any time, even after the initial setup.

## Build & Start

To build and start the application, navigate to the main `hivemind` folder and execute one of the following commands:

- To build the Docker image and start the containers:

  ```bash
  docker-compose build
  docker-compose up
  ```

- Or, to build the image and start the containers in a single command:

  ```bash
  docker-compose up --build
  ```

## URLs

Once the startup process is complete, the following services will be available:

- Backend (Swagger UI): <http://localhost:5000/swagger/>
- Frontend: <http://localhost:4200/>
- MinIO Console: <http://localhost:9001/>

  ```bash
  MINIO_ACCESS_KEY: hivemind
  MINIO_SECRET_KEY: {44ju$^6}-A=_l8R[h1}}Y6rZ0D5l&DOvkI6aWF3HFr6?euk=`
  ```

## Showcase

[![Hivemind Showcase](https://img.youtube.com/vi/TcQixXWtcK8/0.jpg)](https://www.youtube.com/watch?v=TcQixXWtcK8)
