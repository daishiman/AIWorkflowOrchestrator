# Phase 11: 発見課題レポート

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-9B-H  |
| Phase    | 11         |
| 作成日   | 2026-02-12 |

---

## 課題一覧

| No  | 重要度 | カテゴリ     | タイトル                                         | ステータス                  |
| --- | ------ | ------------ | ------------------------------------------------ | --------------------------- |
| D-1 | MINOR  | コード品質   | IpcResult型の重複定義                            | 未対応（Phase 10 m-01継承） |
| D-2 | MINOR  | 仕様整合性   | Zodスキーマ未使用（typeof手動チェック）          | 未対応（Phase 10 m-02継承） |
| D-3 | INFO   | API設計      | window.skillCreatorAPI の二重公開パターン        | 既存パターン踏襲            |
| D-4 | INFO   | API命名      | Preload API メソッド名と仕様書テスト項目の不一致 | 記録のみ                    |
| D-5 | INFO   | タイムアウト | IPCレベルのタイムアウト機構不在                  | 記録のみ                    |
| D-6 | INFO   | パス検証     | IPCハンドラーでのパストラバーサル検証の委譲設計  | 記録のみ（設計意図通り）    |

---

## D-1: IpcResult型の重複定義（Phase 10 m-01 継承）

### 概要

`IpcResult<T>` 型がMain側（`skillCreatorHandlers.ts`）とPreload側（`skill-creator-api.ts`）で個別に定義されている。

### 該当ファイル

| ファイル                                            | 行番号 | 内容                                                                     |
| --------------------------------------------------- | ------ | ------------------------------------------------------------------------ |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | L27-31 | `interface IpcResult<T> { success: boolean; data?: T; error?: string; }` |
| `apps/desktop/src/preload/skill-creator-api.ts`     | L26-30 | `interface IpcResult<T> { success: boolean; data?: T; error?: string; }` |

### 影響

- 機能的影響: なし（両ファイルの型定義は同一）
- 保守性影響: 片方のみ変更した場合に型不整合が発生するリスク

### 推奨対処

`@repo/shared/types` に `IpcResult<T>` 型を定義し、両ファイルからimportする。または既存の `IpcResult` 型がプロジェクト内に存在する場合はそれを参照する。

### 対処優先度

低（MINOR）。機能に影響しないため、次回の型統一タスクで対応可能。

---

## D-2: Zodスキーマ未使用（Phase 10 m-02 継承）

### 概要

Phase 2設計時のAC-06ではZodスキーマによる引数検証が要求されているが、実際の実装ではtypeof手動チェックで実装されている。

### 該当ファイル

| ファイル                                            | 行番号                              | 内容                                                       |
| --------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | L61, L100-103, L143, L182, L221-224 | `typeof args?.request !== "string"` 等の手動バリデーション |

### 影響

- 機能的影響: なし（typeofチェックで同等の検証を実現）
- 仕様整合性: AC-06の文言と実装が不一致

### 推奨対処

以下のいずれかを実施する:

1. AC-06の記述を「型チェックによる引数バリデーション」に更新する（現行実装を正とする）
2. Zodスキーマに移行する（AC-06の記述を正とする）

現行のtypeofチェックは以下を検証しており、機能的には十分:

- `typeof !== "string"`: 型チェック
- `.trim() === ""`: 空白文字列チェック
- `=== undefined`: undefined チェック

### 対処優先度

低（MINOR）。機能に影響しないため、仕様書更新またはZod移行タスクで対応可能。

---

## D-3: window.skillCreatorAPI の二重公開パターン

### 概要

`skillCreatorAPI` は以下の2つの経路でRendererに公開されている:

1. `window.electronAPI.skillCreator` -- electronAPI オブジェクト内のプロパティとして（preload/index.ts L366）
2. `window.skillCreatorAPI` -- トップレベルのグローバルオブジェクトとして（preload/index.ts L567）

### 該当ファイル

| ファイル                            | 行番号   | 内容                                                                  |
| ----------------------------------- | -------- | --------------------------------------------------------------------- |
| `apps/desktop/src/preload/index.ts` | L366     | `skillCreator: skillCreatorAPI` (electronAPI内)                       |
| `apps/desktop/src/preload/index.ts` | L567     | `contextBridge.exposeInMainWorld("skillCreatorAPI", skillCreatorAPI)` |
| `apps/desktop/src/preload/index.ts` | L589-590 | `window.skillCreatorAPI = skillCreatorAPI` (non-isolated fallback)    |
| `apps/desktop/src/preload/types.ts` | L1090    | `ElectronAPI.skillCreator` 型定義                                     |
| `apps/desktop/src/preload/types.ts` | L1633    | `window.skillCreatorAPI` 型宣言                                       |

### P28対策との関連

Phase 11仕様書のS-01テスト項目では `typeof window.skillCreatorAPI === "undefined"` を期待しているが、実際には `window.skillCreatorAPI` が存在する。これは既存の `skillAPI` / `window.skillAPI` パターンと同じ二重公開パターンであり、Phase 10 M-02で「既存パターンに準拠」として判定済み。

### 推奨対処

プロジェクト全体のAPI公開パターン統一タスクで一括対応する。個別の修正は既存パターンとの不整合を生むため推奨しない。

### 対処優先度

低（INFO）。既存パターン踏襲であり、本タスクスコープ外。

---

## D-4: Preload APIメソッド名と仕様書テスト項目の不一致

### 概要

Phase 11仕様書のテスト項目で使用されているAPI呼び出しと、実際のPreload APIメソッド名が一部異なる。

### 不一致箇所

| 仕様書の呼び出し                                | 実際のAPIメソッド名                  | 差異                          |
| ----------------------------------------------- | ------------------------------------ | ----------------------------- |
| `window.electronAPI.skillCreator.create(...)`   | `skillCreatorAPI.createSkill(...)`   | `create` vs `createSkill`     |
| `window.electronAPI.skillCreator.validate(...)` | `skillCreatorAPI.validateSkill(...)` | `validate` vs `validateSkill` |

### 該当ファイル

| ファイル                                        | 行番号   | 内容                                   |
| ----------------------------------------------- | -------- | -------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts` | L133-134 | `createSkill: (options)` として定義    |
| `apps/desktop/src/preload/skill-creator-api.ts` | L141-142 | `validateSkill: (skillDir)` として定義 |

### 影響

- 機能的影響: なし（Renderer側からの呼び出し時にメソッド名を合わせれば正常動作）
- 仕様書整合性: Phase 11テスト項目と実際のメソッド名が不一致

### 推奨対処

Phase 12のドキュメント更新時にAPIドキュメントを正確なメソッド名で記載する。Phase 11仕様書のテスト項目は手動テスト時に正しいメソッド名（`createSkill`, `validateSkill`）で実行する必要がある。

### 対処優先度

低（INFO）。ドキュメント更新で対応可能。

---

## D-5: IPCレベルのタイムアウト機構不在

### 概要

現在の実装では、IPCハンドラーレベルでのタイムアウト機構が実装されていない。ElectronのipcMain.handleはデフォルトでタイムアウトせず、SkillCreatorServiceが応答しない場合にRendererのPromiseが永続的にペンディング状態となる可能性がある。

### 該当ファイル

| ファイル                                            | 行番号 | 内容                             |
| --------------------------------------------------- | ------ | -------------------------------- |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | 全体   | タイムアウトロジックが存在しない |

### 影響

- 機能的影響: SkillCreatorServiceがハングした場合にRendererが無応答になる
- UX影響: ユーザーが操作不能になる可能性

### 推奨対処

以下のいずれかで対応する:

1. **Renderer側**: `Promise.race` でタイムアウト付きPromiseを実装する
2. **Main側**: ハンドラー内で `Promise.race` または `AbortController` を使用する
3. **サービス層**: SkillCreatorService内部でタイムアウトを実装する

### 対処優先度

低（INFO）。SkillCreatorServiceの長時間処理は進捗通知で対応する設計であり、タイムアウトはサービス層の責務として分離可能。

---

## D-6: IPCハンドラーでのパストラバーサル検証の委譲設計

### 概要

パストラバーサル攻撃の検証はIPCハンドラー層ではなく、SkillCreatorService層に委譲されている。IPCハンドラーは型チェック（string型であること、空文字列でないこと）のみを行い、パスの安全性検証はサービス層の責務としている。

### 該当箇所

| ファイル                                            | 行番号     | 内容                                      |
| --------------------------------------------------- | ---------- | ----------------------------------------- |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | L143, L182 | `typeof args?.skillDir !== "string"` のみ |

### 自動テストでの検証状況

| テストID    | 入力値                               | サービスの応答          | IPCハンドラーの返却値                       |
| ----------- | ------------------------------------ | ----------------------- | ------------------------------------------- |
| SCIT-SEC-05 | `/path/to/tasks/../../../etc/passwd` | `Error("Invalid path")` | `{ success: false, error: "Invalid path" }` |
| SCIT-SEC-06 | `../../etc/shadow`                   | `Error("Invalid path")` | `{ success: false, error: "Invalid path" }` |
| SCIT-SEC-07 | `/path/to/skill\0/../../etc/passwd`  | `Error("Invalid path")` | `{ success: false, error: "Invalid path" }` |
| SCIT-SEC-08 | `\\\\server\\share\\path`            | `Error("Invalid path")` | `{ success: false, error: "Invalid path" }` |

### 設計判断の妥当性

この設計は以下の理由で妥当と判断する:

1. **単一責務原則**: IPCハンドラーはIPC通信の整合性（型チェック、sender検証）を担当し、ビジネスロジック（パス検証）はサービス層に委譲
2. **既存パターン準拠**: 他のIPCハンドラー（authHandlers, skillHandlers等）も同様にビジネスバリデーションをサービス層に委譲
3. **多層防御**: IPCハンドラーの型チェック + サービス層のパス検証で多層防御を実現

### 推奨対処

対応不要。設計意図通りの実装。

---

## Phase 10 MINOR指摘の追跡状況

| Phase 10指摘ID | タイトル              | 本Phase 発見課題ID | ステータス               |
| -------------- | --------------------- | ------------------ | ------------------------ |
| m-01           | IpcResult型の重複定義 | D-1                | 未タスク仕様書に変換予定 |
| m-02           | Zodスキーマ未使用     | D-2                | 未タスク仕様書に変換予定 |
