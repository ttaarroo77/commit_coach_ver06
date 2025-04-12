---
name: "docs/overview_0/project-structure.md"
title: "プロジェクト構造概要 (Project Structure)"
description: "[コミットコーチ] - ディレクトリ構成など"
---

# プロジェクト構造概要

本ドキュメントでは、**コミットコーチ** のディレクトリ構成と各フォルダ/ファイルの役割について解説します。  
特に **`root/backend/`** ディレクトリ内を**詳細に**掘り下げ、バックエンドの要件定義を示します。  
以下の構成・説明はあくまでサンプルです。実際の実装状況や仕様変更にあわせて適宜修正してください。

---

## 1. 全体構成 (ルート直下)

```
[ProjectRoot]/
├── .gitignore
├── README.md
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── docs/
│   ├── overview/
│   │   ├── api-routes.md
│   │   ├── architecture.md
│   │   ├── components.md
│   │   ├── database.md
│   │   ├── development_flow.md
│   │   ├── product-brief.md
│   │   ├── types.md
│   │   └── project-structure.md  ← (本ファイル)
│   └── ai_dev_flow/
│       └── ... (その他ドキュメント)
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── mypage/
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   ├── design/
│   │   │   │   └── page.tsx
│   │   │   ├── mobile-app/
│   │   │   │   └── page.tsx
│   │   │   └── web-app/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ai-chat.tsx
│   │   ├── icons.tsx
│   │   ├── sidebar.tsx
│   │   ├── task-breakdown.tsx
│   │   ├── task-item.tsx
│   │   ├── theme-provider.tsx
│   │   └── ui/
│   │       ├── (共通UIコンポーネント多数)
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── public/
│   │   ├── placeholder-logo.svg
│   │   ├── placeholder-user.jpg
│   │   └── ...
│   ├── styles/
│   │   └── globals.css
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── next.config.mjs
├── backend/  ← **バックエンド用ディレクトリ (今回詳細説明)**
│   ├── .env.example
│   ├── Dockerfile (または docker-compose.yml 等)
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.json (または jsconfig.json)
│   ├── src/
│   │   ├── config/
│   │   ├── db/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.ts (メインアプリケーションエントリポイント)
│   │   └── server.ts (サーバー起動スクリプト)
│   └── tests/
│       ├── integration/
│       └── unit/
└── backup_log/
    ├── commit-coach (1).zip
    ├── design_decisions.md
    └── ...
```

---

## 2. フロントエンド(`frontend/`)の概要

フロントエンドは主に **Next.js + TypeScript** を利用しており、以下の点が特徴です。

- `app/`: Next.js App Router 構文での各ページ配置。  
- `components/`: 再利用可能なUIコンポーネント、ビジネスロジックを持たないUI層。  
- `hooks/`: カスタムフック置き場。  
- `lib/`: ユーティリティ関数やヘルパー関数など共通ロジック。  
- `public/`: 静的ファイル (画像、アイコン等)。  
- `styles/`: グローバルCSS、Tailwind設定。  

※ 詳細は [components.md](./components.md) や各種ドキュメントを参照。

---

## 3. **バックエンド(`backend/`)の詳細構成**

### 3.1. 概要

- **目的**: APIサーバー、認証、DB連携、ビジネスロジックを担当  
- **実装言語**: Node.js (TypeScript推奨)  
- **フレームワーク例**: 
  - Express / NestJS / Fastify など。  
  - ここでは **Express + TypeScript** を例に、ディレクトリ構造を詳細化。

#### バックエンドの責務
- **API提供**: REST/GraphQLエンドポイントを通じてフロントエンドや他サービスにデータを供給  
- **認証・認可**: JWTやセッション管理 (Supabase Authと連携する例も想定)  
- **DB操作**: PostgreSQL (Supabase) やその他RDBMSへのCRUD操作  
- **ビジネスロジック**: プロジェクト管理/コミット履歴処理/ユーザー管理等  

---

### 3.2. `backend/` 全体イメージ

```
backend/
├── .env.example
├── Dockerfile
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── src/
│   ├── config/         ← 環境変数や設定ファイル
│   ├── db/             ← DB関連(接続/マイグレーション等)
│   ├── middlewares/    ← Express ミドルウェア系
│   ├── models/         ← モデル定義 (ORM/スキーマ)
│   ├── controllers/    ← 各APIエンドポイントの処理
│   ├── routes/         ← ルーティングの定義まとめ
│   ├── services/       ← ビジネスロジック/サービス層
│   ├── utils/          ← 汎用ユーティリティ
│   ├── app.ts          ← Expressアプリのセットアップ (各種ミドルウェア登録等)
│   └── server.ts       ← サーバー起動 (HTTPリスナー起動)
└── tests/
    ├── integration/    ← 結合テスト
    └── unit/           ← 単体テスト
```

#### 主なファイル/ディレクトリの詳細説明

1. **`.env.example`**  
   - 環境変数のサンプルファイル。実運用では `.env` を作成し、API_KEYやDB接続情報を記載。  
   - セキュリティ上、`.env` はリポジトリに含めない。

2. **`Dockerfile`** / **`docker-compose.yml`**（必要に応じて）  
   - コンテナ化する場合の設定。Nodeイメージをベースに依存パッケージのインストールなどを行う。

3. **`package.json`**  
   - バックエンドで使用する依存関係 (`express`, `pg`, `typeorm` 等) とスクリプト (`npm run start` など) を管理。

4. **`tsconfig.json`**  
   - TypeScriptコンパイラ設定。ターゲットバージョン、コンパイルオプション等。

5. **`tests/`**  
   - Jest/Mochaなどのテストフレームワークを利用する場合に、単体テスト・結合テストを配置。  
   - **`integration/`**: DBや外部APIを含むテスト。  
   - **`unit/`**: 単一のモジュール/関数/サービスに関するテスト。

---

### 3.3. `src/config/` ディレクトリ

- **役割**: 環境変数の読込・アプリ共通設定（ポート番号、DB接続URL、JWT秘密鍵など）を集約。  
- **例**: `index.ts`, `env.ts`, `logger.config.ts` など。  
- **サンプル**: 
  ```ts
  // env.ts
  import dotenv from "dotenv";
  dotenv.config();

  export const PORT = process.env.PORT || 3000;
  export const DATABASE_URL = process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/db";
  export const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
  ```
  - **注意**: 秘密情報は GitHub 等に公開しない運用を徹底。

---

### 3.4. `src/db/` ディレクトリ

- **役割**: 
  - データベース接続設定  
  - ORM (Prisma / TypeORM / Sequelize など) の設定  
  - マイグレーションファイル/スクリプト  
- **構成例**: 
  ```
  db/
  ├── index.ts       ← DB接続ロジック (プール作成など)
  ├── migrations/
  │   ├── 20230401_init.sql
  │   ├── 20230402_add_commits_table.sql
  │   └── ...
  └── prisma/        ← Prismaを使う場合、schema.prisma や生成物を配置
  ```
- **ポイント**:  
  - **マイグレーション**: DBスキーマの変更は必ずマイグレーションファイルで管理し、チーム全体で同期を図る。  
  - **ORM選択**: TypeORM/Sequelize/Prismaなど、プロジェクト要件や好みに合わせる。

---

### 3.5. `src/middlewares/` ディレクトリ

- **役割**: Expressの各種ミドルウェア (ログ記録、CORS設定、エラー処理など)。  
- **構成例**: 
  ```
  middlewares/
  ├── authMiddleware.ts   ← 認証・認可処理
  ├── errorHandler.ts     ← グローバルエラーハンドリング
  └── logger.ts           ← ログ出力設定 (morgan など)
  ```
- **サンプル (errorHandler.ts)**:
  ```ts
  import { Request, Response, NextFunction } from "express";

  export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
  ```
- **注意**: エラーのステータスコードやレスポンス形式は要件に応じてカスタマイズ。

---

### 3.6. `src/models/` ディレクトリ

- **役割**: 
  - DBエンティティ定義 (ORM利用時)  
  - またはMongoose/FireORM等を利用する場合はスキーマ/モデルをここに配置。  
- **構成例** (TypeORMベース):
  ```
  models/
  ├── User.ts
  ├── Project.ts
  └── Commit.ts
  ```
  ```ts
  // User.ts (サンプル)
  import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

  @Entity()
  export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    name!: string;

    @Column({ nullable: true })
    image?: string;
  }
  ```
- **ポイント**: 
  - バックエンド用の型定義とフロントエンド用の型定義を別個に管理するか、共通の`@types`ディレクトリを用意してシェアするか要検討。

---

### 3.7. `src/controllers/` ディレクトリ

- **役割**: 
  - ルートから呼び出される処理本体(ハンドラー)。  
  - リクエストを受け取り、サービス層やモデルを呼び出してレスポンスを生成。  
- **構成例**:
  ```
  controllers/
  ├── userController.ts
  ├── projectController.ts
  └── commitController.ts
  ```
- **サンプル (projectController.ts)**:
  ```ts
  import { Request, Response } from "express";
  import * as projectService from "../services/projectService";

  export async function getProjects(req: Request, res: Response) {
    try {
      const projects = await projectService.getAllProjects();
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  export async function createProject(req: Request, res: Response) {
    try {
      const newProject = await projectService.createProject(req.body);
      res.status(201).json(newProject);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
  ```
- **ポイント**:  
  - **ビジネスロジック**はコントローラに書きすぎないように、`services/`に切り出しを推奨。  
  - リクエストパラメータのバリデーションは `Joi` や `class-validator` 等を活用。

---

### 3.8. `src/routes/` ディレクトリ

- **役割**: 
  - Expressのルーター定義を集約。コントローラを紐付ける場所。  
- **構成例**:
  ```
  routes/
  ├── index.ts            ← 全ルートのマウント
  ├── projectRoutes.ts
  └── userRoutes.ts
  ```
- **サンプル (projectRoutes.ts)**:
  ```ts
  import { Router } from "express";
  import * as projectController from "../controllers/projectController";

  const router = Router();

  router.get("/", projectController.getProjects);
  router.post("/", projectController.createProject);
//  router.put("/:id", projectController.updateProject);
//  router.delete("/:id", projectController.deleteProject);

  export default router;
  ```
- **ポイント**: 
  - すべてのルートを `index.ts` でまとめて `app.ts` に登録する流れにすることが多い。  
  - 例: `app.use("/api/projects", projectRoutes)`。

---

### 3.9. `src/services/` ディレクトリ

- **役割**: 
  - ビジネスロジックを一元管理。  
  - DBアクセス (models や ORM) や外部APIコールを行い、コントローラから呼び出される形。  
- **構成例**:
  ```
  services/
  ├── projectService.ts
  ├── userService.ts
  └── commitService.ts
  ```
- **サンプル (projectService.ts)**:
  ```ts
  import { AppDataSource } from "../db";
  import { Project } from "../models/Project";

  export async function getAllProjects(): Promise<Project[]> {
    const projectRepo = AppDataSource.getRepository(Project);
    return projectRepo.find();
  }

  export async function createProject(data: Partial<Project>): Promise<Project> {
    const projectRepo = AppDataSource.getRepository(Project);
    const newProject = projectRepo.create(data);
    return projectRepo.save(newProject);
  }
  ```
- **ポイント**: 
  - コントローラよりもさらに細かい処理の分割や共通化（例：メール送信サービス、Git連携サービス）を行う場合にサブディレクトリを増やしても良い。

---

### 3.10. `src/utils/` ディレクトリ

- **役割**: 
  - 汎用的な関数や定数、エラークラスなどを配置。  
  - プロジェクト内の複数箇所で参照されるロジック。  
- **例**:
  ```
  utils/
  ├── dateHelpers.ts
  ├── errorHelpers.ts
  └── stringHelpers.ts
  ```
- **サンプル (errorHelpers.ts)**:
  ```ts
  export class NotFoundError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "NotFoundError";
    }
  }
  ```

---

### 3.11. `src/app.ts` (メインアプリケーション設定)

- **役割**: 
  - Expressアプリインスタンスを生成  
  - ミドルウェア設定 (CORS, JSONパーサー, ログなど)  
  - ルート設定 (`app.use("/api", router)`)  
  - グローバルエラーハンドラー設定  
- **サンプル**:
  ```ts
  import express from "express";
  import cors from "cors";
  import { errorHandler } from "./middlewares/errorHandler";
  import router from "./routes/index";

  const app = express();

  // ミドルウェア設定
  app.use(cors());
  app.use(express.json());

  // ルーティング
  app.use("/api", router);

  // エラーハンドラー
  app.use(errorHandler);

  export default app;
  ```

---

### 3.12. `src/server.ts` (サーバー起動スクリプト)

- **役割**: 
  - `app.ts` で用意したアプリをポート指定で起動する。  
  - DB初期化 (ORM同期やマイグレーション適用) を行う場合もここで実行するケースが多い。  
- **サンプル**:
  ```ts
  import { PORT } from "./config/env";
  import { AppDataSource } from "./db"; // TypeORMの場合
  import app from "./app";

  AppDataSource.initialize()
    .then(() => {
      console.log("Database initialized");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Error during Data Source initialization:", err);
    });
  ```

---

## 4. 運用・テスト

- **テスト**:
  - **Unit Test**: `services/`, `utils/` などの単体テスト。  
  - **Integration Test**: ルーティングやDBとの疎通を含むE2Eに近いテスト。  
  - フレームワーク例: Jest, Mocha + Chai, Supertest 等。  

- **APIドキュメント**:
  - Swagger / OpenAPI を導入し、 `/api-docs` などのエンドポイントで仕様を公開してもよい。

- **開発フロー**:
  1. **開発**  
     - ローカル環境で `pnpm run dev` (例) を実行し、ホットリロードで開発。  
  2. **テスト**  
     - `pnpm run test` / `pnpm run test:integration` など実行。  
  3. **ビルド & デプロイ**  
     - `pnpm run build` 等。Dockerを使用する場合は `docker build` → `docker run` → `docker push` 等のフロー。

---

## 5. まとめ

- 本文書で示した構成は一例であり、プロジェクト固有の要件に合わせて**柔軟に変更**してください。  
- バックエンド側では、「モデル → サービス → コントローラ → ルート → ミドルウェア → アプリ起動」という**責務分離**を明確にし、可読性・保守性を高めることが重要です。  
- フロントエンドとバックエンドで型やモデルを共有する際は、**モノレポ**かつ**TypeScript**をフル活用すると、さらにエラーを減らせます。  

---

## 6. 参考リンク

- [Express公式](https://expressjs.com/)
- [NestJS公式](https://nestjs.com/) (上記構成をNestJSで統合的に行う例)
- [TypeORM公式](https://typeorm.io/)
- [Sequelize公式](https://sequelize.org/)
- [Prisma公式](https://www.prisma.io/)

---

以上が**コミットコーチ**のプロジェクト構造と、特に**`backend/`**ディレクトリの詳細要件定義です。  
本ドキュメントは随時更新し、プロジェクトのスケールや設計変更に合わせて適切な修正を行ってください。