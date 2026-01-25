# TASK-3-1-B: Hooks実装（PreToolUse/PostToolUse）

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| タスクID   | TASK-3-1-B                                                         |
| Tier       | 1（MVP）                                                           |
| Phase      | 3（実行エンジン）                                                  |
| 依存タスク | TASK-3-1-A（SDK query()基本実装）、TASK-2C（セキュリティパターン） |
| 並列可能   | TASK-3-1-C（PermissionRequest Hook）                               |
| ブロック   | TASK-4-1（IPCチャネル定義）                                        |
| ステータス | pending                                                            |
| 優先度     | high                                                               |
| 複雑度     | medium                                                             |
| 作成日     | 2026-01-25                                                         |
| 機能名     | skill-import-agent-system                                          |

---

## 概要

Claude Agent SDK の Hooks システムを使用して、ツール実行前後の処理を実装する。
危険コマンドのブロック、保護パスへのアクセス制限、ツール完了通知を含む。

### 主要機能

1. **PreToolUse Hook**: ツール実行前の検証・制御
   - 危険コマンド（`rm -rf`、`sudo`等）のブロック
   - 保護パス（`/etc/**`、`~/.ssh/**`等）への書き込み制限
   - ツール実行開始通知

2. **PostToolUse Hook**: ツール実行後の処理
   - ツール結果の通知
   - 完了ステータスの送信

3. **エラーハンドリング**:
   - エラーカテゴリの判定（SDK/権限/タイムアウト/ネットワーク）
   - リトライ可能性の判定

---

## システム仕様参照（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                            | 内容                        |
| ------------------------- | ------------------------------------------------------------------------------- | --------------------------- |
| セキュリティパターン定義  | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | 危険パターン・保護パス・API |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`     | SDK統合・IPC設計・型定義    |
| エラーハンドリング        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | エラー分類・リトライ戦略    |

---

## Phase構成

| Phase | 名称                 | ファイル                     | 目的                             |
| ----- | -------------------- | ---------------------------- | -------------------------------- |
| 1     | 要件定義             | `phase-01-requirements.md`   | 目的・スコープ・受け入れ基準定義 |
| 2     | 設計                 | `phase-02-design.md`         | アーキテクチャ・詳細設計         |
| 3     | 設計レビューゲート   | `phase-03-review-gate.md`    | 要件・設計の妥当性検証           |
| 4     | テスト作成           | `phase-04-test-red.md`       | TDD: Red（失敗するテスト作成）   |
| 5     | 実装                 | `phase-05-implementation.md` | TDD: Green（テストを通す実装）   |
| 6     | テスト拡充           | `phase-06-test-expansion.md` | カバレッジ目標達成に向けた追加   |
| 7     | テストカバレッジ確認 | `phase-07-coverage.md`       | カバレッジ目標検証・統合テスト   |
| 8     | リファクタリング     | `phase-08-refactoring.md`    | TDD: Refactor（品質改善）        |
| 9     | 品質保証             | `phase-09-quality.md`        | 静的解析・セキュリティ・性能     |
| 10    | 最終レビューゲート   | `phase-10-final-review.md`   | 全体品質・整合性検証             |
| 11    | 手動テスト検証       | `phase-11-manual-test.md`    | UX・実環境動作確認               |
| 12    | ドキュメント更新     | `phase-12-documentation.md`  | ドキュメント更新・仕様反映       |
| 13    | PR作成               | `phase-13-pr.md`             | コミット・PR・CI確認             |

---

## 成果物一覧

| 成果物                   | パス                                                           | 説明                          |
| ------------------------ | -------------------------------------------------------------- | ----------------------------- |
| SkillExecutor（更新）    | `apps/desktop/src/main/services/skill/SkillExecutor.ts`        | Hooks追加・エラーハンドリング |
| Hooksユニットテスト      | `apps/desktop/src/main/services/skill/__tests__/hooks.test.ts` | PreToolUse/PostToolUseテスト  |
| エラーハンドリングテスト | `apps/desktop/src/main/services/skill/__tests__/error.test.ts` | エラー分類・リトライテスト    |

---

## 完了条件（全体）

- [ ] PreToolUse Hook で危険コマンドがブロックされる
- [ ] PreToolUse Hook で保護パスへの書き込みがブロックされる
- [ ] PostToolUse Hook でツール完了が通知される
- [ ] ツール実行開始/完了がストリームに送信される
- [ ] エラーカテゴリが正しく判定される
- [ ] リトライ可能性が正しく判定される
- [ ] 全テストがパスする（カバレッジ80%以上）
- [ ] 型チェック・Lintエラーなし

---

## 依存関係

### 入力（依存タスク）

| タスクID   | 成果物                         | 使用目的                |
| ---------- | ------------------------------ | ----------------------- |
| TASK-3-1-A | `SkillExecutor.ts`（基本構造） | Hooks追加のベースクラス |
| TASK-2C    | `isDangerousCommand()`         | 危険コマンド判定        |
| TASK-2C    | `isProtectedPath()`            | 保護パス判定            |

### 出力（後続タスクへ）

| タスクID   | 提供内容                  | 用途                           |
| ---------- | ------------------------- | ------------------------------ |
| TASK-4-1   | `SkillExecutor`（完成版） | IPCハンドラーからの呼び出し    |
| TASK-3-1-C | `createHooks()`パターン   | PermissionRequest Hook参考実装 |

---

## 実行開始

Phase 1から順番に実行してください:

```
docs/30-workflows/skill-import-agent-system/tasks/task-3-1-b-hooks/phase-01-requirements.md
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
