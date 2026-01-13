# Agent SDK 依存関係修正タスク

## 概要

ElectronアプリでClaude Agent SDK（`@anthropic-ai/claude-agent-sdk`）パッケージが見つからないエラーを修正する。

## エラー内容

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@anthropic-ai/claude-agent-sdk'
imported from /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/apps/desktop/out/main/index.js
```

## タスクID

- **TASK-ID**: AGENT-SDK-DEP-FIX
- **ブランチ**: `docs/task-spec-agent-sdk-dependency-fix`

## 現状分析

| 項目                 | 状態                                           |
| -------------------- | ---------------------------------------------- |
| package.json依存関係 | `^0.2.5` で宣言済み                            |
| 実装ファイル         | `apps/desktop/src/main/services/agent/` に存在 |
| 型定義               | スタブ定義あり                                 |
| テストモック         | vitest aliasで設定済み                         |
| ランタイム解決       | **失敗**                                       |

## 根本原因候補

1. **パッケージ未インストール**: pnpm installが正常完了していない
2. **Electronバンドル設定**: electron-viteのexternals設定不備
3. **モノレポ解決**: pnpmワークスペース解決の問題
4. **ESM/CJS互換性**: モジュール形式の不一致

---

## Phase構成

| Phase | 名称                 | 状態   | ファイル                                                               |
| ----- | -------------------- | ------ | ---------------------------------------------------------------------- |
| 1     | 要件定義             | 完了   | [phase-1-requirements.md](./phase-1-requirements.md)                   |
| 2     | 設計                 | 完了   | [phase-2-design.md](./phase-2-design.md)                               |
| 3     | 設計レビューゲート   | 完了   | [phase-3-design-review.md](./phase-3-design-review.md)                 |
| 4     | テスト作成           | 完了   | [phase-4-test-creation.md](./phase-4-test-creation.md)                 |
| 5     | 実装                 | 完了   | [phase-5-implementation.md](./phase-5-implementation.md)               |
| 6     | テスト拡充           | 完了   | [phase-6-test-expansion.md](./phase-6-test-expansion.md)               |
| 7     | テストカバレッジ確認 | 完了   | [phase-7-coverage-verification.md](./phase-7-coverage-verification.md) |
| 8     | リファクタリング     | 完了   | [phase-8-refactoring.md](./phase-8-refactoring.md)                     |
| 9     | 品質保証             | 完了   | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)         |
| 10    | 最終レビューゲート   | 完了   | [phase-10-final-review.md](./phase-10-final-review.md)                 |
| 11    | 手動テスト検証       | 完了   | [phase-11-manual-testing.md](./phase-11-manual-testing.md)             |
| 12    | ドキュメント更新     | 完了   | [phase-12-documentation.md](./phase-12-documentation.md)               |
| 13    | PR作成               | 未実施 | [phase-13-pr-creation.md](./phase-13-pr-creation.md)                   |

---

## 関連システム仕様

| 仕様                      | パス                                                                         | 説明                 |
| ------------------------- | ---------------------------------------------------------------------------- | -------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | SDK統合仕様          |
| 技術スタック              | `.claude/skills/aiworkflow-requirements/references/technology-core.md`       | Electron/pnpm設定    |
| モノレポアーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | ワークスペース構成   |
| Electronセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | Electronセキュリティ |

---

## 成果物管理

進捗管理は `artifacts.json` で追跡。

```bash
# Phase完了時の検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-sdk-dependency-fix --phase <N>
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
