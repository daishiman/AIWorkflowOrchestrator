# TASK-AUTH-MODE-SELECTION-001: 認証方式選択機能

## メタ情報

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | TASK-AUTH-MODE-SELECTION-001                                           |
| タスク名     | 認証方式選択機能（サブスクリプション vs APIキー）                      |
| Issue        | [#750](https://github.com/daishiman/AIWorkflowOrchestrator/issues/750) |
| 分類         | 機能追加                                                               |
| 対象機能     | Claude Agent SDK 認証基盤                                              |
| 優先度       | 中                                                                     |
| 見積もり規模 | 中規模                                                                 |
| ステータス   | 仕様書作成完了                                                         |
| 作成日       | 2026-02-08                                                             |

## 概要

### 背景

現在のClaude Agent SDK認証基盤はAnthropic APIキーのみをサポートしている。
ユーザーには以下の2つのニーズが存在する:

1. サブスクリプション利用者: Claude Code CLIでログイン済みで、追加のAPIキー設定なしで利用したい
2. APIキー利用者: 独自のAPIキーを使用して、コストを自分のアカウントに紐付けたい

### 目的

ユーザーが認証方式を選択できるUIを提供し、サブスクリプション認証とAPIキー認証の両方をシームレスに利用可能にする。

### デフォルト設定

**サブスクリプション認証がデフォルト**

## スコープ

### 含むもの

- 認証方式選択UI（設定画面内セグメントコントロール）
- サブスクリプション認証の統合（Claude Code CLI連携）
- 認証状態の表示・管理
- 認証方式切り替えロジック
- Main Process側の認証プロバイダー抽象化

### 含まないもの

- Claude Code CLIのインストール支援
- サブスクリプションの購入・管理機能
- 課金関連のUI
- 複数APIキーの管理

## 成果物一覧

| Phase | 名称             | 主な成果物                                         |
| ----- | ---------------- | -------------------------------------------------- |
| 1     | 要件定義         | requirements-definition.md, acceptance-criteria.md |
| 2     | 設計             | architecture-design.md, type-definitions.ts        |
| 3     | 設計レビュー     | design-review-result.md                            |
| 4     | テスト作成       | test-specification.md, test-cases.md               |
| 5     | 実装             | AuthModeService, SubscriptionAuthProvider, UI      |
| 6     | テスト拡充       | 追加テストコード                                   |
| 7     | カバレッジ確認   | coverage-report.md                                 |
| 8     | リファクタリング | refactoring-summary.md                             |
| 9     | 品質検証         | quality-report.md                                  |
| 10    | 最終レビュー     | final-review-result.md                             |
| 11    | 手動テスト       | manual-test-result.md                              |
| 12    | ドキュメント     | implementation-guide.md, ipc-documentation.md      |
| 13    | 完了             | PR作成                                             |

## 依存タスク

| タスクID                              | 状態 | 依存内容        |
| ------------------------------------- | ---- | --------------- |
| TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE | 完了 | APIキー管理基盤 |
| Supabase PKCE OAuth                   | 完了 | OAuth認証フロー |

## Phase一覧

- [Phase 1: 要件定義](./phase-1-requirements.md)
- [Phase 2: 設計](./phase-2-design.md)
- [Phase 3: 設計レビュー](./phase-3-design-review.md)
- [Phase 4: テスト作成](./phase-4-test-creation.md)
- [Phase 5: 実装](./phase-5-implementation.md)
- [Phase 6: テスト拡充](./phase-6-test-expansion.md)
- [Phase 7: カバレッジ確認](./phase-7-coverage.md)
- [Phase 8: リファクタリング](./phase-8-refactoring.md)
- [Phase 9: 品質検証](./phase-9-quality.md)
- [Phase 10: 最終レビュー](./phase-10-final-review.md)
- [Phase 11: 手動テスト](./phase-11-manual-test.md)
- [Phase 12: ドキュメント更新](./phase-12-documentation.md)
- [Phase 13: 完了](./phase-13-completion.md)

## 参照システム仕様書

| 仕様書                        | パス                                               | 内容               |
| ----------------------------- | -------------------------------------------------- | ------------------ |
| interfaces-auth.md            | .claude/skills/aiworkflow-requirements/references/ | 認証型定義         |
| architecture-auth-security.md | .claude/skills/aiworkflow-requirements/references/ | 認証アーキテクチャ |
| security-principles.md        | .claude/skills/aiworkflow-requirements/references/ | セキュリティ原則   |
| api-ipc-auth.md               | .claude/skills/aiworkflow-requirements/references/ | IPC認証API         |
| error-handling.md             | .claude/skills/aiworkflow-requirements/references/ | エラーハンドリング |

## リスクと対策

| リスク                              | 影響度 | 発生確率 | 対策                             |
| ----------------------------------- | ------ | -------- | -------------------------------- |
| Claude Code CLI認証トークン取得不可 | 高     | 中       | Phase 1で詳細調査、代替案検討    |
| トークン形式変更によるAPI互換性問題 | 中     | 低       | バージョン検出・フォールバック   |
| 認証方式切り替え時の状態不整合      | 中     | 中       | 切り替え時の状態クリア・再初期化 |
| Claude Code CLI未インストール       | 低     | 中       | 明確なエラーメッセージ・案内     |
