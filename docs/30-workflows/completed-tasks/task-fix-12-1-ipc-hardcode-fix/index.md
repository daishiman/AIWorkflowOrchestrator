# TASK-FIX-12-1-IPC-HARDCODE-FIX: SkillExecutorのIPCチャネル名定数化

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | TASK-FIX-12-1-IPC-HARDCODE-FIX     |
| タスク名     | SkillExecutorのIPCチャネル名定数化 |
| 分類         | リファクタリング（小規模）         |
| 対象機能     | SkillExecutor IPC通信              |
| 優先度       | 中                                 |
| 見積もり規模 | 小規模                             |
| ステータス   | 未実施                             |
| 作成日       | 2026-02-08                         |
| 関連Phase    | TASK-FIX-4-1の後続修正             |

---

## 概要

`SkillExecutor.ts` のL918とL1214において、IPCチャネル名 `"skill:stream"` がハードコードされている。セキュリティルール（04-electron-security.md）に従い、IPCチャネル名はホワイトリストで管理し定数で参照する必要がある。本タスクでは、ハードコードされた文字列を `SKILL_CHANNELS.SKILL_STREAM` 定数に置き換える。

---

## 問題点

| 問題                         | 影響                                               |
| ---------------------------- | -------------------------------------------------- |
| ハードコードされたチャネル名 | 型安全性の欠如、タイポによるバグリスク             |
| 定数未使用                   | セキュリティチェック（ホワイトリスト）のバイパス   |
| 保守性の低下                 | チャネル名変更時に複数箇所を手動で修正する必要あり |

---

## 目標

1. `SkillExecutor.ts` L918の `"skill:stream"` を `SKILL_CHANNELS.SKILL_STREAM` に置換
2. `SkillExecutor.ts` L1214の `"skill:stream"` を `SKILL_CHANNELS.SKILL_STREAM` に置換
3. 必要に応じて `SKILL_CHANNELS` への定数追加

---

## Phase構成

| Phase | 名称                 | 説明                         | 仕様書                                                                 |
| ----- | -------------------- | ---------------------------- | ---------------------------------------------------------------------- |
| 1     | 要件定義             | 置換対象の特定と要件明文化   | [phase-1-requirements.md](./phase-1-requirements.md)                   |
| 2     | 設計                 | 定数定義・置換方針の設計     | [phase-2-design.md](./phase-2-design.md)                               |
| 3     | 設計レビューゲート   | 設計の妥当性検証             | [phase-3-design-review.md](./phase-3-design-review.md)                 |
| 4     | テスト作成           | TDD Red - 定数使用のテスト   | [phase-4-test-creation.md](./phase-4-test-creation.md)                 |
| 5     | 実装                 | TDD Green - ハードコード置換 | [phase-5-implementation.md](./phase-5-implementation.md)               |
| 6     | テスト拡充           | カバレッジ向上               | [phase-6-test-expansion.md](./phase-6-test-expansion.md)               |
| 7     | テストカバレッジ確認 | 基準達成確認                 | [phase-7-coverage-verification.md](./phase-7-coverage-verification.md) |
| 8     | リファクタリング     | TDD Refactor - コード整理    | [phase-8-refactoring.md](./phase-8-refactoring.md)                     |
| 9     | 品質保証             | 全品質ゲートクリア           | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)         |
| 10    | 最終レビューゲート   | 全体品質確認                 | [phase-10-final-review.md](./phase-10-final-review.md)                 |
| 11    | 手動テスト検証       | 実環境での動作確認           | [phase-11-manual-testing.md](./phase-11-manual-testing.md)             |
| 12    | ドキュメント更新     | 仕様書・実装ガイド更新       | [phase-12-documentation.md](./phase-12-documentation.md)               |
| 13    | PR作成               | コミット・PR・CI確認         | [phase-13-pr-creation.md](./phase-13-pr-creation.md)                   |

---

## スコープ

### 含むもの

- `SkillExecutor.ts` 内のハードコードされた `"skill:stream"` の定数化
- `SKILL_CHANNELS` への `SKILL_STREAM` 定数追加（未定義の場合）
- 関連テストの更新

### 含まないもの

- 他ファイルのIPCチャネルハードコード修正（別タスクで対応）
- ハンドラーロジックの変更
- 新しいIPCチャネルの追加

---

## システム仕様参照

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                                        | 内容                             |
| -------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| スキルIPCセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | IPCチャンネル定義・検証          |
| Electron IPCセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC通信セキュリティ              |
| Agent SDKスキル仕様        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル型定義・IPC仕様            |
| Agent SDK Executor仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`        | SkillExecutor インターフェース   |
| セキュリティ原則           | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                  | セキュリティ設計原則             |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン・ベストプラクティス |

---

## 関連タスク

| タスク                         | 関係                        |
| ------------------------------ | --------------------------- |
| TASK-FIX-4-1-IPC-CONSOLIDATION | IPCチャンネル整理（完了済） |
| TASK-4-1 IPCチャンネル定義     | 関連実装                    |

---

## 成果物一覧

| Phase | 成果物               | 配置先                                          |
| ----- | -------------------- | ----------------------------------------------- |
| 1     | 要件定義書           | `outputs/phase-1/requirements-definition.md`    |
| 2     | 設計書               | `outputs/phase-2/architecture-design.md`        |
| 3     | 設計レビュー結果     | `outputs/phase-3/design-review-result.md`       |
| 4     | テスト仕様書         | `outputs/phase-4/test-specification.md`         |
| 5-8   | 実装コード           | `apps/desktop/src/`                             |
| 9     | 品質レポート         | `outputs/phase-9/quality-report.md`             |
| 10    | 最終レビュー結果     | `outputs/phase-10/final-review-result.md`       |
| 11    | 手動テスト結果       | `outputs/phase-11/manual-test-result.md`        |
| 12    | 実装ガイド           | `outputs/phase-12/implementation-guide.md`      |
| 12    | ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   |
| 12    | 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` |
| 13    | PR情報               | `outputs/phase-13/pr-info.md`                   |
