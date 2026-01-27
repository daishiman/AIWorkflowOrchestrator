# Phase 1: スコープ定義

## メタ情報

| 項目     | 値                       |
| -------- | ------------------------ |
| Phase    | 1                        |
| タスクID | TASK-5-1                 |
| タスク名 | SkillAPI 実装（Preload） |
| 作成日   | 2026-01-27               |

---

## 1. スコープ内（In Scope）

### 1.1 実装対象ファイル

| ファイル                                | 役割                | 状態   |
| --------------------------------------- | ------------------- | ------ |
| `apps/desktop/src/preload/skill-api.ts` | SkillAPI実装        | 実装済 |
| `apps/desktop/src/preload/index.ts`     | window.skillAPI公開 | 実装済 |
| `apps/desktop/src/preload/channels.ts`  | IPCチャネル定義     | 実装済 |

### 1.2 API メソッド

| メソッド                 | 説明                   | 状態   |
| ------------------------ | ---------------------- | ------ |
| `execute`                | スキル実行開始         | 実装済 |
| `onStream`               | ストリーミング受信     | 実装済 |
| `abort`                  | 実行中断               | 実装済 |
| `getExecutionStatus`     | 実行状態取得           | 実装済 |
| `onPermissionRequest`    | 権限確認リクエスト購読 | 実装済 |
| `sendPermissionResponse` | 権限確認応答送信       | 実装済 |

### 1.3 IPC チャネル

| チャネル                    | 方向  | 状態   |
| --------------------------- | ----- | ------ |
| `skill:execute`             | R → M | 登録済 |
| `skill:abort`               | R → M | 登録済 |
| `skill:get-status`          | R → M | 登録済 |
| `skill:stream`              | M → R | 登録済 |
| `skill:permission:request`  | M → R | 登録済 |
| `skill:permission:response` | R → M | 登録済 |

### 1.4 セキュリティ機能

- `safeInvoke` によるホワイトリスト検証
- `safeOn` によるホワイトリスト検証
- `contextBridge` によるセキュアなAPI公開

### 1.5 本タスクで検証・文書化する項目

- 既存実装の要件適合性検証
- 単体テストの作成・実行
- テストカバレッジ確認
- 品質保証（lint, typecheck）
- API仕様書の作成

---

## 2. スコープ外（Out of Scope）

### 2.1 Main Process 側の実装

| 項目               | 担当タスク | 備考                 |
| ------------------ | ---------- | -------------------- |
| IPC ハンドラー実装 | TASK-4-2   | skillHandlers.ts     |
| SkillExecutor      | TASK-3-1   | スキル実行ロジック   |
| SkillScanner       | TASK-2A    | スキルディスカバリー |
| SkillImportStore   | TASK-2B    | インポート状態管理   |

### 2.2 Renderer 側の実装

| 項目       | 担当タスク | 備考             |
| ---------- | ---------- | ---------------- |
| SkillSlice | TASK-6-1   | Zustand ストア   |
| スキルUI   | TASK-7-x   | UIコンポーネント |

### 2.3 本タスクでは実装しない機能

- スキル一覧取得API（`skill:list` - TASK-2A範囲）
- スキルインポートAPI（`skill:import` - TASK-2B範囲）
- スキル削除API（`skill:remove` - TASK-2B範囲）
- E2Eテスト（別タスク）

---

## 3. 依存関係

### 3.1 依存タスク（前提条件）

| タスクID | タイトル          | 状態 | 依存内容                 |
| -------- | ----------------- | ---- | ------------------------ |
| TASK-4-1 | IPCチャネル定義   | 完了 | チャネル名定義           |
| TASK-4-2 | IPCハンドラー実装 | 完了 | Main Process側ハンドラー |

### 3.2 ブロックタスク（本タスクが前提となるもの）

| タスクID | タイトル       | 依存内容            |
| -------- | -------------- | ------------------- |
| TASK-6-1 | SkillSlice実装 | window.skillAPI使用 |

---

## 4. 成果物一覧

### Phase 1（要件定義）

| 成果物       | パス                                         |
| ------------ | -------------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        |

### Phase 2以降（予定）

| Phase | 主要成果物           |
| ----- | -------------------- |
| 2     | API設計書            |
| 3     | 設計レビュー結果     |
| 4     | テストコード         |
| 5     | 実装検証結果         |
| 6     | 拡充テストコード     |
| 7     | カバレッジレポート   |
| 8     | リファクタリング結果 |
| 9     | 品質保証レポート     |
| 10    | 最終レビュー結果     |
| 11    | 手動テストシナリオ   |
| 12    | API仕様書            |

---

## 5. 制約条件

### 5.1 技術的制約

- Electron Preload Script環境で動作すること
- `contextIsolation: true` 環境をサポートすること
- 既存の `safeInvoke` / `safeOn` パターンに準拠すること

### 5.2 セキュリティ制約

- すべてのIPCチャネルはホワイトリストで管理すること
- 許可されていないチャネルへのアクセスは拒否すること

### 5.3 品質制約

- TypeScriptコンパイルエラーがないこと
- 単体テストカバレッジ80%以上
- ESLintエラーがないこと

---

## 6. 前提条件

- Node.js 20.x 以上
- pnpm パッケージマネージャー使用
- Vitest テストフレームワーク使用
- TypeScript 5.x

---

## 7. リスクと対策

| リスク                   | 影響度 | 対策                    |
| ------------------------ | ------ | ----------------------- |
| 依存型定義の変更         | 中     | @repo/shared の型を参照 |
| Main Process側のAPI変更  | 中     | TASK-4-2との整合性確認  |
| テストカバレッジ目標未達 | 低     | Phase 6でテスト拡充     |

---

## 8. スコープ変更管理

本スコープに変更がある場合は、以下の手順で管理します：

1. 変更要求の文書化
2. 影響範囲の分析
3. 関係タスクへの影響確認
4. スコープ定義の更新
5. 関係者への周知
