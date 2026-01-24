h--
id: TASK-2A
tier: 1
title: SkillScanner 実装
phase: 2
depends_on: [TASK-1-1]
parallel_with: [TASK-2B, TASK-2C]
blocks: [TASK-3-1, TASK-4-2]
status: pending
priority: high
estimated_complexity: medium
tags: [backend, main-process, service]
created_at: 2026-01-24

---

# TASK-2A: SkillScanner 実装 - メインタスク仕様書

## 概要

スキルディレクトリをスキャンし、SKILL.md と配下の全サブディレクトリ情報（agents/, references/, scripts/, assets/, schemas/, indexes/）を取得するサービスクラスを実装する。

## 目的

- `~/.aiworkflow/skills/`（アプリ独自スキル）と `~/.claude/skills/`（Claude CLI スキル、読み取り専用）の両方からスキル情報を取得できるスキャナーを提供
- スキルの詳細メタデータ（YAML Frontmatter、サブリソース）を構造化データとして返却
- インポート機能やスキル管理UIに必要なデータを一元的に提供

## 背景

現在のスキルインポート機能は基本情報のみを取得しており、スキル配下の詳細情報（サブエージェント、参照資料等）が不足している。SkillScanner はディレクトリ全体を再帰的にスキャンし、スキルの完全なメタデータを構築する。

## スコープ

### 対象

- SkillScanner クラスの実装
- スキャン対象ディレクトリ（~/.aiworkflow/skills/, ~/.claude/skills/）の処理
- SKILL.md の YAML Frontmatter パース
- 6種類のサブディレクトリスキャン

### 対象外

- スキル実行機能（TASK-3-1 で実装）
- UI コンポーネント（TASK-7a 以降で実装）
- IPC ハンドラー（TASK-4-2 で実装）

---

## Phase構成

| Phase | 名称                 | 目的                                 | ドキュメント                                               |
| ----- | -------------------- | ------------------------------------ | ---------------------------------------------------------- |
| 1     | 要件定義             | 目的・スコープ・受け入れ基準定義     | [phase-01-requirements.md](./phase-01-requirements.md)     |
| 2     | 設計                 | アーキテクチャ・詳細設計             | [phase-02-design.md](./phase-02-design.md)                 |
| 3     | 設計レビューゲート   | 要件・設計の妥当性検証               | [phase-03-design-review.md](./phase-03-design-review.md)   |
| 4     | テスト作成           | TDD: Red（失敗するテスト作成）       | [phase-04-tests.md](./phase-04-tests.md)                   |
| 5     | 実装                 | TDD: Green（テストを通す実装）       | [phase-05-implementation.md](./phase-05-implementation.md) |
| 6     | テスト拡充           | カバレッジ目標達成に向けた追加テスト | [phase-06-test-expansion.md](./phase-06-test-expansion.md) |
| 7     | テストカバレッジ確認 | カバレッジ目標検証                   | [phase-07-coverage.md](./phase-07-coverage.md)             |
| 8     | リファクタリング     | TDD: Refactor（品質改善）            | [phase-08-refactoring.md](./phase-08-refactoring.md)       |
| 9     | 品質保証             | 静的解析・セキュリティ               | [phase-09-quality.md](./phase-09-quality.md)               |
| 10    | 最終レビューゲート   | 全体品質・整合性検証                 | [phase-10-final-review.md](./phase-10-final-review.md)     |
| 11    | 手動テスト検証       | 実環境動作確認                       | [phase-11-manual-test.md](./phase-11-manual-test.md)       |
| 12    | ドキュメント更新     | ドキュメント更新・仕様反映           | [phase-12-documentation.md](./phase-12-documentation.md)   |
| 13    | PR作成               | コミット・PR・CI確認                 | [phase-13-pr-creation.md](./phase-13-pr-creation.md)       |

---

## 成果物一覧

| 成果物                                                                | Phase | 説明                          |
| --------------------------------------------------------------------- | ----- | ----------------------------- |
| `apps/desktop/src/main/services/skill/SkillScanner.ts`                | 5     | SkillScanner クラス実装       |
| `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | 4, 6  | ユニットテスト                |
| `apps/desktop/src/main/services/skill/__fixtures__/`                  | 4     | テスト用フィクスチャ          |
| `apps/desktop/src/main/services/skill/index.ts`                       | 5     | バレルエクスポート            |
| 設計ドキュメント                                                      | 2     | docs/配下のアーキテクチャ設計 |

---

## 依存関係

### 前提タスク

| タスクID | タイトル   | 依存内容                                          |
| -------- | ---------- | ------------------------------------------------- |
| TASK-1-1 | 共通型定義 | SkillMetadata, SkillSubResource, SkillOtherFile型 |

### 後続タスク

| タスクID | タイトル      | 依存内容                         |
| -------- | ------------- | -------------------------------- |
| TASK-3-1 | SkillExecutor | SkillScannerからのスキル情報取得 |
| TASK-4-2 | IPC Handlers  | SkillScannerの呼び出し           |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                                | 内容                            |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| Skill構造・フォーマット    | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | SKILL.md仕様、ディレクトリ構造  |
| ディレクトリ構造           | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`          | モノレポ構成、apps/desktop/配置 |
| スキルインポート機能仕様書 | `docs/30-workflows/skill-import-agent-system/specification.md`                      | 本機能の詳細仕様                |
| 元タスク定義               | `docs/30-workflows/skill-import-agent-system/tasks/task-2a-skill-scanner.md`        | タスク概要定義                  |

---

## 完了条件（全Phase完了時）

- [ ] SkillScanner クラスが `apps/desktop/src/main/services/skill/` に実装されている
- [ ] `~/.aiworkflow/skills/` が存在しない場合は自動作成される
- [ ] `~/.aiworkflow/skills/` と `~/.claude/skills/` の両方をスキャンできる
- [ ] `~/.claude/skills/` のスキルには `readonly: true` フラグが設定される
- [ ] `scanAll()` が全スキルのメタデータを返す
- [ ] 6つのサブディレクトリ（agents, references, scripts, assets, schemas, indexes）がスキャンされる
- [ ] SKILL.md の YAML Frontmatter が正しくパースされる
- [ ] Markdown ファイルから説明が抽出される
- [ ] 存在しないディレクトリは空配列を返す
- [ ] 単体テストのカバレッジが Line 80%以上、Branch 60%以上を達成
- [ ] 全品質チェック（Lint, TypeCheck）がパス
- [ ] PR が作成され、CI が通過している

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
