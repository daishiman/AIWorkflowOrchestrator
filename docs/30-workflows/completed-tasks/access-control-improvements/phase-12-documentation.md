# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 12                          |
| Phase名    | ドキュメント更新            |
| 前提Phase  | Phase 11                    |
| 後続Phase  | Phase 13                    |
| ステータス | 未実施                      |
| 作成日     | 2026-01-18                  |
| 機能名     | access-control-improvements |

---

## 目的

実装した認可機能をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 背景

APIインターフェースの変更、新しいエラークラスの追加に伴い、開発者向けドキュメントを更新する必要がある。

---

## 実行タスク

### タスク1: 実装ガイド作成【必須】

**目的**: 認可機能の実装ガイドを2パート構成で作成する

**2パート構成**:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**Part 1 記載内容**:

- 認可チェックとは何か
- なぜ必要か（セキュリティ上の理由）
- どのように動作するか（概念図）

**Part 2 記載内容**:

- UnauthorizedErrorクラスの仕様
- verifySessionOwnershipの実装詳細
- 使用例とコードサンプル
- エラーハンドリングパターン

**期待される成果物**: `outputs/phase-12/implementation-guide.md`

---

### タスク2: システムドキュメント更新

**目的**: aiworkflow-requirements等のシステム仕様を更新する

**更新対象**:

- `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`
  - メソッドシグネチャ変更を反映
- `.claude/skills/aiworkflow-requirements/references/error-handling.md`
  - UnauthorizedErrorを追加

**更新テーブル**:

| メソッド         | 変更前                              | 変更後                                             |
| ---------------- | ----------------------------------- | -------------------------------------------------- |
| getSession       | `getSession(id)`                    | `getSession(id, requestUserId)`                    |
| deleteSession    | `deleteSession(id)`                 | `deleteSession(id, requestUserId)`                 |
| exportToMarkdown | `exportToMarkdown(sessionId, opts)` | `exportToMarkdown(sessionId, requestUserId, opts)` |
| exportToJson     | `exportToJson(sessionId, opts)`     | `exportToJson(sessionId, requestUserId, opts)`     |

**期待される成果物**: システム仕様更新

---

### タスク3: 未タスク検出【必須】

**目的**: 残課題を検出し、未タスク検出レポートを作成する

**検出ソース**:

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

**検出コマンド**:

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --workflow docs/30-workflows/access-control-improvements \
  --sources "packages/shared/src/features/chat-history/"
```

**期待される成果物**: `outputs/phase-12/unassigned-task-report.md`（0件でも出力必須）

---

### タスク4: ドキュメント更新履歴の記録

**目的**: ドキュメント更新内容を記録する

**記載内容**:

- 作成・更新したファイル一覧
- 変更内容の要約

**期待される成果物**: `outputs/phase-12/documentation-update-log.md`

---

## 参照資料

| 参照資料         | パス                                                                           | 内容         |
| ---------------- | ------------------------------------------------------------------------------ | ------------ |
| チャット履歴仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 更新対象仕様 |
| エラー仕様       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | 更新対象仕様 |
| 仕様更新フロー   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                           | 内容         |
| ---------------- | ------------------------------------------------------------------------------ | ------------ |
| チャット履歴仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 更新対象仕様 |

---

## 成果物

| 成果物               | パス                                           | 必須 | 内容                      |
| -------------------- | ---------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成            |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] システム仕様が更新されている
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] ドキュメント更新履歴が作成されている
- [ ] artifacts.jsonが更新されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/access-control-improvements/phase-13-pr-creation.md`
