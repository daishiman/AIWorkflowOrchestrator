# Phase 4 テストケース一覧 - TASK-9F スキル共有・インポート機能

## 実行日時

2026-02-27

## SkillShareManager.test.ts テストケース (26 件)

### importFromSource — GitHub リポジトリ (5 件)

| ID        | テスト名                                     | 入力                                                                    | 期待結果                                                          |
| --------- | -------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| SSM-IG-01 | 有効なリポジトリ・パスからスキルをインポート | `{ type: "github", repo: "owner/my-skill", branch: "main", path: "/" }` | `success: true`, `skillName: "my-skill"`, `importedAt` が ISO8601 |
| SSM-IG-02 | リポジトリが存在しない場合                   | `{ type: "github", repo: "nonexistent/repo" }`                          | `error.code: 3001`, `category: "external"`                        |
| SSM-IG-03 | SKILL.md が存在しない                        | `{ type: "github", repo: "owner/no-skill-md" }`                         | `error.code: 2003`, `category: "business"`                        |
| SSM-IG-04 | ブランチ指定がある場合                       | `{ type: "github", repo: "owner/my-skill", branch: "develop" }`         | `getRepoContents` が `"develop"` ブランチで呼ばれる               |
| SSM-IG-05 | path 指定がある場合                          | `{ type: "github", repo: "owner/monorepo", path: "skills/my-skill" }`   | `getRepoContents` が `"skills/my-skill"` パスで呼ばれる           |

### importFromSource — Gist (3 件)

| ID        | テスト名                     | 入力                                       | 期待結果                                            |
| --------- | ---------------------------- | ------------------------------------------ | --------------------------------------------------- |
| SSM-IG-06 | 有効な gistId からインポート | `{ type: "gist", gistId: "abc123def456" }` | `success: true`, `getGist("abc123def456")` 呼び出し |
| SSM-IG-07 | Gist が存在しない            | `{ type: "gist", gistId: "nonexistent" }`  | `error.code: 3001`, `category: "external"`          |
| SSM-IG-08 | Gist に SKILL.md がない      | `{ type: "gist", gistId: "no-skill-md" }`  | `error.code: 2003`, `category: "business"`          |

### importFromSource — ローカル (4 件)

| ID        | テスト名                          | 入力                                                            | 期待結果                                         |
| --------- | --------------------------------- | --------------------------------------------------------------- | ------------------------------------------------ |
| SSM-IL-01 | 有効なローカルパスからインポート  | `{ type: "local", localPath: "/home/user/skills/my-skill" }`    | `success: true`                                  |
| SSM-IL-02 | ディレクトリが存在しない          | `{ type: "local", localPath: "/nonexistent/path" }`             | `error.code: 4002`, `category: "infrastructure"` |
| SSM-IL-03 | パストラバーサルを含むパス        | `{ type: "local", localPath: "../../etc/passwd" }`              | `error.code: 1003`, `category: "validation"`     |
| SSM-IL-04 | SKILL.md が存在しないディレクトリ | `{ type: "local", localPath: "/home/user/skills/no-skill-md" }` | `error.code: 2003`, `category: "business"`       |

### importFromSource — URL (4 件)

| ID        | テスト名                  | 入力                                                      | 期待結果                                     |
| --------- | ------------------------- | --------------------------------------------------------- | -------------------------------------------- |
| SSM-IU-01 | 有効な URL からインポート | `{ type: "url", url: "https://example.com/SKILL.md" }`    | `success: true`                              |
| SSM-IU-02 | URL が 404                | `{ type: "url", url: "https://example.com/404" }`         | `error.code: 3001`, `category: "external"`   |
| SSM-IU-03 | SKILL.md 形式でない       | `{ type: "url", url: "https://example.com/random.txt" }`  | `error.code: 1002`, `category: "validation"` |
| SSM-IU-04 | ネットワークタイムアウト  | `{ type: "url", url: "https://slow-server.example.com" }` | `error.code: 3002`, `category: "external"`   |

### exportSkill — Gist (3 件)

| ID        | テスト名              | 入力                                              | 期待結果                                   |
| --------- | --------------------- | ------------------------------------------------- | ------------------------------------------ |
| SSM-EG-01 | Gist にエクスポート   | `skillName: "my-skill"`, `dest: { type: "gist" }` | `success: true`, `shareUrl` あり           |
| SSM-EG-02 | GitHub トークン未設定 | `skillName: "my-skill"`, `dest: { type: "gist" }` | `error.code: 2005`, `category: "business"` |
| SSM-EG-03 | Gist API エラー       | `skillName: "my-skill"`, `dest: { type: "gist" }` | `error.code: 3001`, `category: "external"` |

### exportSkill — ローカル (3 件)

| ID        | テスト名                 | 入力                                                                       | 期待結果                                         |
| --------- | ------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------ |
| SSM-EL-01 | ローカルにエクスポート   | `skillName: "my-skill"`, `dest: { type: "local", localPath: "..." }`       | `success: true`, `shareUrl` undefined            |
| SSM-EL-02 | 書き込み不可ディレクトリ | `skillName: "my-skill"`, `dest: { type: "local", localPath: "/readonly" }` | `error.code: 4003`, `category: "infrastructure"` |
| SSM-EL-03 | 存在しないスキル名       | `skillName: "nonexistent"`, `dest: { type: "local" }`                      | `error.code: 2003`, `category: "business"`       |

### validateSource (4 件)

| ID        | テスト名                  | 入力                                  | 期待結果                                              |
| --------- | ------------------------- | ------------------------------------- | ----------------------------------------------------- |
| SSM-VS-01 | 有効なディレクトリ構造    | `{ type: "local", localPath: "..." }` | `isReachable: true`, `hasSkillMd: true`, `errors: []` |
| SSM-VS-02 | SKILL.md なしディレクトリ | `{ type: "local", localPath: "..." }` | `hasSkillMd: false`, `errors.length > 0`              |
| SSM-VS-03 | SKILL.md のタイトル欠如   | `{ type: "local", localPath: "..." }` | `errors` に "title" を含む                            |
| SSM-VS-04 | 空の SKILL.md             | `{ type: "local", localPath: "..." }` | `errors` に "empty" を含む                            |

## skillHandlers.share.test.ts テストケース (29 件)

### ハンドラ登録 (3 件)

| ID         | テスト名              | 検証内容                                          |
| ---------- | --------------------- | ------------------------------------------------- |
| SSH-REG-01 | importFromSource 登録 | `handlers.has("skill:importFromSource") === true` |
| SSH-REG-02 | export 登録           | `handlers.has("skill:export") === true`           |
| SSH-REG-03 | validateSource 登録   | `handlers.has("skill:validateSource") === true`   |

### skill:importFromSource バリデーション (5 件)

| ID          | テスト名            | 入力              | 期待エラー         |
| ----------- | ------------------- | ----------------- | ------------------ |
| SSH-IMP-V01 | source undefined    | `undefined`       | `VALIDATION_ERROR` |
| SSH-IMP-V02 | type が非 string    | `{ type: 42 }`    | `VALIDATION_ERROR` |
| SSH-IMP-V03 | type が空文字列     | `{ type: "" }`    | `VALIDATION_ERROR` |
| SSH-IMP-V04 | type がスペースのみ | `{ type: "   " }` | `VALIDATION_ERROR` |
| SSH-IMP-V05 | type が許可値外     | `{ type: "ftp" }` | `VALIDATION_ERROR` |

### skill:importFromSource Sender 検証 (1 件)

| ID          | テスト名       | 検証内容                                          |
| ----------- | -------------- | ------------------------------------------------- |
| SSH-IMP-S01 | 不正送信元拒否 | `IPC_UNAUTHORIZED`, `importFromSource` 未呼び出し |

### skill:importFromSource 正常系 (2 件)

| ID          | テスト名      | 入力                                     | 期待結果                                     |
| ----------- | ------------- | ---------------------------------------- | -------------------------------------------- |
| SSH-IMP-N01 | github ソース | `{ type: "github", repo: "owner/repo" }` | `importFromSource` 呼び出し、`success: true` |
| SSH-IMP-N02 | gist ソース   | `{ type: "gist", gistId: "abc123" }`     | `importFromSource` 呼び出し                  |

### skill:export バリデーション (5 件)

| ID          | テスト名                  | 入力                                                      | 期待エラー         |
| ----------- | ------------------------- | --------------------------------------------------------- | ------------------ |
| SSH-EXP-V01 | skillName undefined       | `{ destination: {...} }`                                  | `VALIDATION_ERROR` |
| SSH-EXP-V02 | skillName 空文字列        | `{ skillName: "", destination: {...} }`                   | `VALIDATION_ERROR` |
| SSH-EXP-V03 | skillName スペースのみ    | `{ skillName: "   ", destination: {...} }`                | `VALIDATION_ERROR` |
| SSH-EXP-V04 | destination undefined     | `{ skillName: "my-skill" }`                               | `VALIDATION_ERROR` |
| SSH-EXP-V05 | destination.type 許可値外 | `{ skillName: "my-skill", destination: { type: "ftp" } }` | `VALIDATION_ERROR` |

### skill:export Sender 検証 (1 件)

| ID          | テスト名       | 検証内容                                     |
| ----------- | -------------- | -------------------------------------------- |
| SSH-EXP-S01 | 不正送信元拒否 | `IPC_UNAUTHORIZED`, `exportSkill` 未呼び出し |

### skill:export 正常系 (1 件)

| ID          | テスト名          | 入力                                                       | 期待結果                                |
| ----------- | ----------------- | ---------------------------------------------------------- | --------------------------------------- |
| SSH-EXP-N01 | Gist エクスポート | `{ skillName: "my-skill", destination: { type: "gist" } }` | `exportSkill` 呼び出し、`shareUrl` あり |

### skill:validateSource バリデーション (3 件)

| ID          | テスト名            | 入力              | 期待エラー         |
| ----------- | ------------------- | ----------------- | ------------------ |
| SSH-VAL-V01 | source undefined    | `undefined`       | `VALIDATION_ERROR` |
| SSH-VAL-V02 | type が非 string    | `{ type: 123 }`   | `VALIDATION_ERROR` |
| SSH-VAL-V03 | type がスペースのみ | `{ type: "   " }` | `VALIDATION_ERROR` |

### skill:validateSource 正常系 (1 件)

| ID          | テスト名          | 入力                                     | 期待結果                                       |
| ----------- | ----------------- | ---------------------------------------- | ---------------------------------------------- |
| SSH-VAL-N01 | github ソース検証 | `{ type: "github", repo: "owner/repo" }` | `validateSource` 呼び出し、`isReachable: true` |

### 境界値・異常系 (7 件)

| ID          | テスト名                | 入力                                          | 期待エラー         |
| ----------- | ----------------------- | --------------------------------------------- | ------------------ |
| SSH-EDGE-01 | source に null          | `null`                                        | `VALIDATION_ERROR` |
| SSH-EDGE-02 | source に数値           | `42`                                          | `VALIDATION_ERROR` |
| SSH-EDGE-03 | repo に 10000 文字      | `{ type: "github", repo: "a".repeat(10000) }` | `VALIDATION_ERROR` |
| SSH-EDGE-04 | source が空オブジェクト | `{}`                                          | `VALIDATION_ERROR` |
| SSH-EDGE-05 | export args undefined   | `undefined`                                   | `VALIDATION_ERROR` |
| SSH-EDGE-06 | export args null        | `null`                                        | `VALIDATION_ERROR` |
| SSH-EDGE-07 | validateSource に配列   | `[1, 2, 3]`                                   | `VALIDATION_ERROR` |

## 合計テスト数

| ファイル                    | テスト数 |
| --------------------------- | -------- |
| SkillShareManager.test.ts   | 26       |
| skillHandlers.share.test.ts | 29       |
| **合計**                    | **55**   |
