-- CreateTable
CREATE TABLE "projeto" (
    "idProjeto" TEXT NOT NULL PRIMARY KEY,
    "nomeProjeto" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomeCompleto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" TEXT NOT NULL DEFAULT 'tenant-1',
    "id_projeto" TEXT NOT NULL DEFAULT '5119fe85-1f7e-44d3-b50c-fbf97e64c33c',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "users_id_projeto_fkey" FOREIGN KEY ("id_projeto") REFERENCES "projeto" ("idProjeto") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT 'tenant-1',
    "id_projeto" TEXT NOT NULL DEFAULT '5119fe85-1f7e-44d3-b50c-fbf97e64c33c',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "courses_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "courses_id_projeto_fkey" FOREIGN KEY ("id_projeto") REFERENCES "projeto" ("idProjeto") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "lesson_order" INTEGER NOT NULL,
    "course_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT 'tenant-1',
    "id_projeto" TEXT NOT NULL DEFAULT '5119fe85-1f7e-44d3-b50c-fbf97e64c33c',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "lessons_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lessons_id_projeto_fkey" FOREIGN KEY ("id_projeto") REFERENCES "projeto" ("idProjeto") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
