CREATE TYPE "ProjectStatus" AS ENUM ('idle', 'running', 'completed', 'error');

CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userStories" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'idle',
    "workspacePath" TEXT NOT NULL,
    "zipPath" TEXT,
    "zipSizeBytes" BIGINT,
    "fileCount" INTEGER,
    "completedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
