# Phase 12 出力：未タスク検出レポート — TASK-9A-B

## メタ情報

| 項目     | 内容                   |
| -------- | ---------------------- |
| タスクID | TASK-9A-B              |
| Phase    | 12（ドキュメント更新） |
| 作成日   | 2026-02-19             |
| 検出件数 | 3件                    |

---

## 調査結果

### Phase 3（設計レビュー）指摘事項

- 指摘: なし（PASS判定）

### Phase 10（最終レビュー）指摘事項

- 指摘: なし（PASS判定、MINOR指摘なし）

### Phase 11（手動テスト）発見課題

- 課題: なし（全テスト PASS、致命的・重大・軽微 すべて0件）

### TODO/FIXME検索結果

- `apps/desktop/src/main/ipc/skillFileHandlers.ts`: 0件
- `apps/desktop/src/preload/skill-api.ts`: 0件
- `apps/desktop/src/main/ipc`（ディレクトリスキャン）: raw 4件
  - `aiHandlers.ts:134` `Replace with actual connection check`
  - `aiHandlers.ts:157` `Replace with actual indexing logic`
  - `communityHandlers.ts:25` `Replace with actual service implementation`
  - `dashboardHandlers.ts:59` `Replace with real data fetching`

### raw検出の精査結果

- 上記4件は既存の未タスク `task-imp-community-dashboard-handlers-001.md` で管理済み
- `verify-unassigned-links.js` 実行結果: `ALL_LINKS_EXIST`

### コードレビュー検出（Phase 12 追加検出）

Phase 12のドキュメント・コードレビュー過程で、以下の改善候補を3件検出した:

| #   | タスクID    | タスク名                                      | 分類             | 優先度 | 検出根拠                                                                                 |
| --- | ----------- | --------------------------------------------- | ---------------- | ------ | ---------------------------------------------------------------------------------------- |
| 1   | UT-9A-B-001 | IPC入力バリデーション標準化                   | 改善             | 中     | skillFileHandlers の `.trim()` バリデーションパターンを他のIPCハンドラーに横展開         |
| 2   | UT-9A-B-002 | IPCエラーサニタイズ共通ユーティリティ化       | リファクタリング | 中     | `isKnownSkillFileError` パターンを汎用エラーサニタイズユーティリティに抽出               |
| 3   | UT-9A-B-003 | IPCテストhandlerMapモックユーティリティ共通化 | 改善             | 低     | Handler Map 方式の `vi.fn().mockImplementation` セットアップをテストユーティリティに集約 |

---

## 検出タスク詳細

### UT-9A-B-001: IPC入力バリデーション標準化

| 項目       | 内容                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| 指示書パス | `docs/30-workflows/unassigned-task/task-ipc-validation-standardize-improvements.md` |
| 発見元     | TASK-9A-B Phase 12 コードレビュー                                                   |
| 概要       | skillFileHandlers の `.trim()` 空文字列チェックパターンを他IPCハンドラーに横展開    |

### UT-9A-B-002: IPCエラーサニタイズ共通ユーティリティ化

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 指示書パス | `docs/30-workflows/unassigned-task/task-ipc-error-sanitize-refactoring.md`   |
| 発見元     | TASK-9A-B Phase 12 コードレビュー                                            |
| 概要       | `isKnownSkillFileError` と `sanitizeErrorMessage` を汎用ユーティリティに抽出 |

### UT-9A-B-003: IPCテストhandlerMapモックユーティリティ共通化

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 指示書パス | `docs/30-workflows/unassigned-task/task-ipc-test-mock-utils-improvements.md` |
| 発見元     | TASK-9A-B Phase 12 コードレビュー                                            |
| 概要       | Handler Map 方式のモックセットアップコードをテスト共通ユーティリティに抽出   |

---

## 3ステップ確認（P3対策）

3件の未タスクについて、P3パターンの3ステップを全て実行:

1. ✅ `unassigned-task/` に指示書作成（3ファイル作成済み）
2. ✅ `task-workflow.md` 残課題テーブルに登録（3行追加）
3. ✅ 関連仕様書に参照リンク追加:
   - `security-electron-ipc.md`: UT-9A-B-001, UT-9A-B-002 の参照追加
   - `api-ipc-agent.md`: 3件全ての派生未タスクテーブル追加
   - `architecture-implementation-patterns.md`: UT-9A-B-002（isKnownSkillFileErrorセクション）、UT-9A-B-003（IPC3層テスト分離セクション）の参照追加
