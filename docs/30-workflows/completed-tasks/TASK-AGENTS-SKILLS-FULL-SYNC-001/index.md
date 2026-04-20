# TASK-AGENTS-SKILLS-FULL-SYNC-001: `.agents/skills/` と `.claude/skills/` 完全パリティガード実装

## メタ情報

| 項目                | 内容                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------- |
| タスクID            | TASK-AGENTS-SKILLS-FULL-SYNC-001                                                        |
| タスク名            | `.agents/skills/` と `.claude/skills/` 完全パリティガード実装                           |
| タスク種別          | NON_VISUAL / infra-guard / spec_created                                                 |
| Issue               | [#2278](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2278)                |
| Issue 状態          | CLOSED（本仕様書のマージ時に再 Close しない）                                           |
| 分類                | 改善                                                                                    |
| 優先度              | 高                                                                                      |
| 規模                | 中規模                                                                                  |
| ステータス          | Phase 1-12 完了 / Phase 13 blocked（user 承認待ち）                                     |
| implementation_mode | new                                                                                     |
| 作成日              | 2026-04-19                                                                              |
| 発見元              | TASK-CONFLICT-PREVENT-001 Phase 12（unassigned-task-detection.md）                      |
| 依存タスク          | TASK-CONFLICT-PREVENT-001（完了済み）                                                   |
| 隣接タスク          | task-imp-aiworkflow-same-wave-sync-guard-001、task-p0-05-mirror-sync-automation         |
| 実装対象            | `.claude/scripts/` 2 本 / `.husky/pre-push` 追記 / `.claude/hooks/session-init.sh` 追記 |

## ユーザー要求の要約

Issue #2278 の全文を設計書ベースで Phase 1〜13 の実行可能な仕様に落とし込む。TASK-CONFLICT-PREVENT-001 で導入した merge policy・deterministic generator の上に、`.claude/skills/`（canonical）と `.agents/skills/`（mirror）の**全ファイル完全一致（full parity）を継続的に保証するガード**を pre-push hook / session-init / CI から呼び出せる形で提供する。実装コードは本仕様書では作成せず、Phase 5 で実行する。

## 真の論点

「手 rsync 忘れ」を個別対策で潰すと場当たり的になる。canonical → mirror の一方向同期を verify（read-only）と sync（write）の 2 本に分け、pre-push で gate・session-init で warning・単発で CI から呼べる**一組の普遍スクリプト**を確立し、drift を検知 → 修復 → 再発防止のループへ構造化する。

## why now

- 10 本並列 worktree 開発で drift が慢性化し、canonical と mirror の乖離が PR merge まで発覚しないケースが複数発生している
- TASK-CONFLICT-PREVENT-001 で merge policy は整ったが「全ファイル完全一致」を検証するガードが未実装
- `int-test-skill` のように canonical にのみ存在し mirror から参照できないスキルが発生し、スキル機能が部分的にしか使えない

## why this way

- **rsync `-a --delete` 固定**: 不完全同期を許さず、canonical を唯一の正本として扱う
- **2 スクリプト分離**: verify は read-only で CI / hook から安全に呼べ、sync は修復専用として意図しない書き換えを防ぐ
- **pre-push は blocking / session-init は warning**: 破壊的な push には gate、開発フローの開始点には情報提供、の役割分担
- **`.gitattributes` / EVALS.json 非変更**: TASK-CONFLICT-PREVENT-001 の責務を侵食しない

## スコープ

### 含むもの

- `diff -qr` による全ファイル差分検証スクリプト（`verify-skills-parity.sh`）
- rsync + generate-index + 再検証を単一コマンドで行う同期スクリプト（`sync-skills-mirror.sh`）
- `.husky/pre-push` への parity check 組み込み
- `.claude/hooks/session-init.sh` への parity warning 追記
- 既存差分 6 ファイルの解消と `int-test-skill` の mirror 初回同期
- Phase 1-13 タスク仕様書一式（本ディレクトリ配下）

### 含まないもの

- 実コードの commit / push / PR 作成（Phase 13 は user 承認前 `blocked`）
- `.gitattributes` の merge policy 変更（TASK-CONFLICT-PREVENT-001 のスコープ）
- EVALS.json schema 変更（AC-6 of TASK-CONFLICT-PREVENT-001 を踏襲）
- `.agents/skills/` を廃止して 1 root に統一するアーキテクチャ変更（task-p0-05 のスコープ）

## 受入基準（AC-1 〜 AC-9）

1. **AC-1**: `diff -qr .claude/skills .agents/skills` が空出力となる状態を Phase 5 完了時点で確立
2. **AC-2**: `verify-skills-parity.sh` が差分あり時 exit 1、なし時 exit 0 を deterministic に返す
3. **AC-3**: `sync-skills-mirror.sh` が `rsync -a --delete` → `generate-index.js --quiet` → `diff -qr` の 3 ステップを単一コマンドで完結
4. **AC-4**: pre-push hook は parity NG 時に push を中止し、`--no-verify` 回避導線を設けない
5. **AC-5**: `int-test-skill` が `.agents/skills/int-test-skill/` 配下に SKILL.md ごと同期されている
6. **AC-6**: session-init.sh の parity warning は 1 秒未満、`CLAUDE_SKIP_HEAVY_HOOKS=1` で opt-out 可能
7. **AC-7**: `.gitattributes` の merge policy（`merge=union` / `merge=ours`）を本タスクで変更しない
8. **AC-8**: Phase 13 は user の明示承認があるまで `blocked` を維持する
9. **AC-9**: EVALS.json の schema を本タスクで変更しない

## 4 条件評価（Phase 1-3 で OK 判定済み）

| 条件   | 判定 | 根拠                                                                                   |
| ------ | ---- | -------------------------------------------------------------------------------------- |
| 価値性 | OK   | 「手 rsync 忘れ」の根本原因（人の記憶依存）を hook / CI で自動化                       |
| 実現性 | OK   | 既存ツール（`diff` / `rsync` / `node`）のみ、新規概念なし                              |
| 整合性 | OK   | canonical → mirror 一方向同期、`.gitattributes` / EVALS.json 非変更の責務境界明確      |
| 運用性 | OK   | pre-push blocking + session-init warning の 2 段、`CLAUDE_SKIP_HEAVY_HOOKS` で opt-out |

## Phase 構成

| Phase | 名称             | 状態    | 並列性 | 主な成果物                                                   |
| ----- | ---------------- | ------- | ------ | ------------------------------------------------------------ |
| 1     | 要件定義         | 完了    | seq    | acceptance criteria、inventory、P50 チェック                 |
| 2     | 設計             | 完了    | seq    | 5 コンポーネント設計、データフロー、トレードオフ分析         |
| 3     | 設計レビュー     | 完了    | seq    | AC-コンポーネント トレーサビリティ、4 条件評価               |
| 4     | テスト作成       | 完了    | par    | 3 シナリオ（NG / OK / pre-push abort）、timing 計測          |
| 5     | 実装             | 完了    | seq    | 2 scripts 配置、2 hook 追記、drift 解消                      |
| 6     | テスト拡充       | 完了    | par    | fail path、回帰 guard、`--check-only`                        |
| 7     | カバレッジ確認   | 完了    | par    | C-1〜C-5 × exit path のマトリクス                            |
| 8     | リファクタリング | 完了    | seq    | 対象/Before/After/理由 テーブル                              |
| 9     | 品質保証         | 完了    | par    | `diff -qr` 空出力確認、validate-structure、shellcheck        |
| 10    | 最終レビュー     | 完了    | seq    | AC-1〜AC-9 合否判定、blocker 判定                            |
| 11    | 手動テスト       | 完了    | seq    | shell 実行ログ証跡（NON_VISUAL のため screenshot なし）      |
| 12    | ドキュメント更新 | 完了    | seq    | 実装ガイド Part 1/2、LOGS 更新、未タスク検出、skill feedback |
| 13    | PR 作成          | blocked | seq    | user 承認取得後のみ、gh pr create                            |

> Phase 5 は drift 解消（初回 rsync）→ スクリプト配置 → hook 配置 の 3 段階を順守。Phase 4-7 / 9 は上流が確定すれば並列可能だが、Phase 5 / 8 / 10 / 11 / 12 / 13 は順次実行。

## ディレクトリ構成

```
docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/
├── index.md                       # 本ファイル
├── artifacts.json                 # メタデータ / 依存関係 / 実装 artifact 一覧
├── phase-01-requirements.md
├── phase-02-design.md
├── phase-03-design-review.md
├── phase-04-test-creation.md
├── phase-05-implementation.md
├── phase-06-test-expansion.md
├── phase-07-coverage.md
├── phase-08-refactoring.md
├── phase-09-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr.md
└── outputs/                       # Phase 実行時の成果物配置先
```

## 実装 artifact（Phase 5 で扱う）

### 新規作成

- `.claude/scripts/verify-skills-parity.sh`
- `.claude/scripts/sync-skills-mirror.sh`
- `.agents/skills/int-test-skill/`（canonical からの初回同期）

### 追記

- `.husky/pre-push`（parity check ブロック追記）
- `.claude/hooks/session-init.sh`（parity warning 追記）

### 同期（canonical → mirror）

- `.agents/skills/aiworkflow-requirements/LOGS.md`
- `.agents/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.agents/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.agents/skills/skill-creator/SKILL.md`
- `.agents/skills/skill-creator/references/knowledge-management-guide.md`
- `.agents/skills/skill-creator/scripts/generate_skill_md.js`

### 変更しない

- `.gitattributes`
- `.claude/skills/aiworkflow-requirements/EVALS.json`

## 参照情報

### 関連ドキュメント

- `docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md` — Issue #2278 本文（本仕様書の元ネタ）
- `docs/30-workflows/completed-tasks/conflict-prevent-skills-001/` — 前提タスク（merge policy / deterministic generator）
- `docs/30-workflows/conflict-prevent-skills-001/outputs/phase-12/unassigned-task-detection.md` — 本タスクの発見源

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                 | 内容                                         |
| ----------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| canonical / mirror 原則 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | `.claude` を正本とし mirror を派生とする原則 |
| generate-index 契約     | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`   | deterministic regenerate と `--quiet` フラグ |
| merge policy（前提）    | `.gitattributes` / `.claude/scripts/setup-merge-drivers.sh`          | 本タスクの前提条件（変更しない）             |

### スキル

- `.claude/skills/task-specification-creator/SKILL.md` — Phase 1-13 骨格
- `.claude/skills/aiworkflow-requirements/SKILL.md` — canonical / mirror / regenerate

## 実行原則

1. Phase 1-3（設計書）は直列実行。Phase 4-13 のうち独立可能な Phase は並列化
2. Phase 13 は user の明示承認なしに実行しない（`blocked` 維持）
3. コミット・PR・push は user の指示なしに実行しない
4. `--no-verify` は CLAUDE.md の禁止事項に従い使用しない
5. 各仕様書は単独で実行可能な粒度を保ち、曖昧表現（「適切に」「必要に応じて」「など」）を避ける

## Phase 13 blocked 状態解除の条件

- Phase 1-12 の全ての完了条件が ✅
- user が「PR 作成を実行してください」と明示的に指示
- CI（lint / typecheck / test）が green
- `diff -qr .claude/skills .agents/skills` が空出力
