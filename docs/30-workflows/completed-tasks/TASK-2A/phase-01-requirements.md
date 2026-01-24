# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 1                     |
| Phase名    | 要件定義              |
| 前提Phase  | なし                  |
| 後続Phase  | Phase 2（設計）       |
| ステータス | 未実施                |
| 作成日     | 2026-01-24            |
| 機能名     | TASK-2A: SkillScanner |

---

## 目的

SkillScanner 実装の目的、スコープ、受け入れ基準を明確に定義し、後続フェーズでの設計・実装の基盤を確立する。

## 背景

AIWorkflowOrchestrator では、`~/.aiworkflow/skills/`（アプリ独自スキル）と `~/.claude/skills/`（Claude CLI スキル）の2つのディレクトリにスキルが存在する。既存のインポート機能はスキルの基本情報のみを取得しており、agents/, references/, scripts/ などの配下情報が不足している。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ビジネス要件の整理

**目的**: SkillScanner が解決すべきビジネス課題を明確化する

**実行手順**:

1. specification.md のセクション1（概要）を読み、システムの全体像を把握する
2. 以下のビジネス要件を文書化する：
   - スキルの完全なメタデータ取得（SKILL.md + 配下ディレクトリ）
   - 2つのスキルディレクトリ（~/.aiworkflow/skills/, ~/.claude/skills/）のサポート
   - Claude CLI スキルの読み取り専用フラグ管理
3. `outputs/phase-01/business-requirements.md` に要件をまとめる

**期待される成果物**:

- `outputs/phase-01/business-requirements.md`

---

### タスク2: 機能要件の定義

**目的**: SkillScanner が提供すべき機能を具体的に定義する

**実行手順**:

1. specification.md のセクション5.6（SkillScanner実装仕様）を読む
2. 以下の機能要件を定義する：

| 機能ID | 機能名                   | 説明                                                               |
| ------ | ------------------------ | ------------------------------------------------------------------ |
| FR-001 | 全スキルスキャン         | scanAll() で両ディレクトリの全スキルを取得                         |
| FR-002 | 単一スキルパース         | SKILL.md の YAML Frontmatter をパースしメタデータ取得              |
| FR-003 | サブディレクトリスキャン | agents/, references/, scripts/, assets/, schemas/, indexes/ を走査 |
| FR-004 | その他ファイル検出       | EVALS.json, LOGS.md, package.json 等を検出                         |
| FR-005 | 説明抽出                 | Markdown ファイルから最初の見出しまたは段落を説明として抽出        |
| FR-006 | ディレクトリ自動作成     | ~/.aiworkflow/skills/ が存在しない場合は作成                       |
| FR-007 | 読み取り専用フラグ       | ~/.claude/skills/ のスキルには readonly: true を設定               |

3. `outputs/phase-01/functional-requirements.md` に要件をまとめる

**期待される成果物**:

- `outputs/phase-01/functional-requirements.md`

---

### タスク3: 非機能要件の定義

**目的**: 性能、信頼性、保守性等の品質要件を定義する

**実行手順**:

1. 以下の非機能要件を定義する：

| 要件ID  | カテゴリ     | 要件                                               |
| ------- | ------------ | -------------------------------------------------- |
| NFR-001 | 性能         | 100スキルのスキャンが3秒以内に完了すること         |
| NFR-002 | 信頼性       | 不正な SKILL.md があってもスキャンが中断しないこと |
| NFR-003 | 保守性       | 新しいサブディレクトリタイプを容易に追加できる構造 |
| NFR-004 | テスト性     | モック可能なファイルシステム抽象化                 |
| NFR-005 | セキュリティ | パストラバーサル攻撃への耐性                       |

2. `outputs/phase-01/non-functional-requirements.md` に要件をまとめる

**期待される成果物**:

- `outputs/phase-01/non-functional-requirements.md`

---

### タスク4: 受け入れ基準の定義

**目的**: Phase 完了時の検証可能な受け入れ基準を定義する

**実行手順**:

1. 以下の受け入れ基準を定義する：

| 基準ID | 基準                                                          | 検証方法          |
| ------ | ------------------------------------------------------------- | ----------------- |
| AC-001 | SkillScanner.scanAll() が SkillMetadata[] を返す              | ユニットテスト    |
| AC-002 | ~/.aiworkflow/skills/ のスキルが readonly: false で取得される | ユニットテスト    |
| AC-003 | ~/.claude/skills/ のスキルが readonly: true で取得される      | ユニットテスト    |
| AC-004 | 6種類のサブディレクトリが正しくスキャンされる                 | ユニットテスト    |
| AC-005 | SKILL.md の YAML Frontmatter が正しくパースされる             | ユニットテスト    |
| AC-006 | 存在しないディレクトリの場合は空配列が返される                | ユニットテスト    |
| AC-007 | テストカバレッジが Line 80%以上、Branch 60%以上               | Vitest カバレッジ |

2. `outputs/phase-01/acceptance-criteria.md` に基準をまとめる

**期待される成果物**:

- `outputs/phase-01/acceptance-criteria.md`

---

### タスク5: 依存関係の確認

**目的**: TASK-1-1（共通型定義）との依存関係を確認する

**実行手順**:

1. TASK-1-1 の成果物（`packages/shared/src/types/skill.ts`）が存在することを確認する
2. 以下の型が定義されていることを確認する：
   - `SkillMetadata`
   - `SkillSubResource`
   - `SkillOtherFile`
3. 型定義が SkillScanner の要件を満たしているか確認し、不足があれば追加要件として記録する

**期待される成果物**:

- 依存関係確認チェックリスト（outputs/phase-01/ に記録）

---

## 参照資料

| 参照資料                   | パス                                                                                | 内容                           |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------ |
| スキルインポート機能仕様書 | `docs/30-workflows/skill-import-agent-system/specification.md`                      | 本機能の詳細仕様               |
| Skill構造・フォーマット    | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | SKILL.md仕様、ディレクトリ構造 |
| 元タスク定義               | `docs/30-workflows/skill-import-agent-system/tasks/task-2a-skill-scanner.md`        | タスク概要定義                 |
| TASK-1-1 型定義            | `packages/shared/src/types/skill.ts`                                                | 共通型定義                     |

---

## 成果物

| 成果物       | パス                                              | 内容             |
| ------------ | ------------------------------------------------- | ---------------- |
| ビジネス要件 | `outputs/phase-01/business-requirements.md`       | ビジネス課題整理 |
| 機能要件     | `outputs/phase-01/functional-requirements.md`     | 機能一覧         |
| 非機能要件   | `outputs/phase-01/non-functional-requirements.md` | 品質要件         |
| 受け入れ基準 | `outputs/phase-01/acceptance-criteria.md`         | 検証可能な基準   |

---

## 統合テスト連携

**Phase 1 では統合テストの対象外**

要件定義フェーズのため、統合テストは後続の Phase 4 以降で実施する。

---

## 完了条件

- [ ] ビジネス要件が文書化されている
- [ ] 機能要件（FR-001〜FR-007）が定義されている
- [ ] 非機能要件（NFR-001〜NFR-005）が定義されている
- [ ] 受け入れ基準（AC-001〜AC-007）が定義されている
- [ ] TASK-1-1 の型定義との整合性が確認されている
- [ ] 全成果物が outputs/phase-01/ に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: TASK-1-1（共通型定義）が完了していること
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-2A/phase-02-design.md`
