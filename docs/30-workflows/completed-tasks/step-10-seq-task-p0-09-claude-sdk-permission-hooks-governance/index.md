# TASK-P0-09: claude-sdk-permission-hooks-governance

## 概要

Claude Code SDK の `permissionMode`、`allowedTools` / `disallowedTools`、`canUseTool`、Hooks を、skill-creator lane の phase ごとに安全に適用する。前提は変えない。システムは常に最新の `.claude/skills/skill-creator/` を動的に読みに行き、そのスキルを Claude Code SDK で実行する。本タスクは、その動的実行を止めずに、安全境界、監査、tool 利用制御を定義・実装する。

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | TASK-P0-09                         |
| タスク種別 | 機能追加 / ガバナンス hardening    |
| 優先度     | P0 (Critical Path)                 |
| ステータス | completed                          |
| 上流ゲート | TASK-RT-06, TASK-P0-03, TASK-P0-04 |
| 依存タスク | TASK-RT-06, TASK-P0-03, TASK-P0-04 |
| 後続タスク | なし                               |
| 作成日     | 2026-03-29                         |
| 更新日     | 2026-03-29                         |

## 受入基準

| ID   | 基準                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------- |
| AC-1 | plan / execute / verify / improve 各 phase に対する `permissionMode` と tool 境界が定義されている |
| AC-2 | `allowedTools` / `disallowedTools` / `canUseTool` が lane 契約として実装されている                |
| AC-3 | `SessionStart` / `PreToolUse` / `PostToolUse` / `SessionEnd` Hook により監査イベントが記録される  |
| AC-4 | permission denial と hook 判断結果が UI / audit log に反映される                                  |
| AC-5 | `.claude/skills/skill-creator/` の動的読込結果と provenance が hook / audit へ含まれる            |
| AC-6 | skill-creator の固定化や hardcoded prompt への置換を行わない                                      |

## スコープ

**含む**:

- phase 別 `permissionMode` 設計
- `allowedTools` / `disallowedTools` / `canUseTool` 実装
- Hook 経由の provenance / permission / tool execution 監査
- audit payload 型定義
- UI 向け permission denial / governance 表示
- ユニットテスト・統合テスト

**含まない**:

- skill-creator 本文の固定化
- `.claude/skills/skill-creator/` の静的コピー作成
- ManifestLoader のコア読込ロジック変更
- session resume UI 本体（TASK-P0-08）

## 依存関係

| 種別       | 参照先                           | 役割                              |
| ---------- | -------------------------------- | --------------------------------- |
| upstream   | TASK-RT-06                       | SDK message / `session_id` 正規化 |
| upstream   | TASK-P0-03                       | 動的 skill-creator manifest 配置  |
| upstream   | TASK-P0-04                       | dynamic pipeline 有効化           |
| upstream   | `../root-workflow-pack/index.md` | lane 共通不変条件                 |
| downstream | なし                             |                                   |

## 現行コードアンカー

| ファイル                                                              | 現状の役割                  | TASK-P0-09 での扱い                            |
| --------------------------------------------------------------------- | --------------------------- | ---------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | SDK 呼び出しの orchestrator | phase 別 permission option 注入                |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | renderer bridge             | governance 状態の公開                          |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | preload API                 | audit / permission 表示用 payload 公開         |
| `packages/shared/src/types/skillCreator.ts`                           | 共通型                      | governance / audit event 型追加                |
| `.claude/skills/skill-creator/`                                       | 動的読込対象の正本          | provenance と resource root を監査対象へ含める |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| 真の論点             | 動的な skill-creator 実行を維持したまま、phase ごとに tool 利用境界と監査を固定すること     |
| 依存関係・責務境界   | skill-creator の中身は動的読込のまま。Facade が SDK option を設定し、Hooks が監査を担う     |
| 価値とコストの不均衡 | ここを曖昧にすると plan/execute/verify/improve が安全に区別できない。コストは中、価値は高い |
| 改善優先順位         | 1. phase 別 tool policy 2. `canUseTool` 3. Hooks 4. audit payload 5. UI 表示                |
| 4条件評価            | 価値性: 高 / 実現性: 中 / 整合性: 高 / 運用性: 高                                           |

## ディレクトリ構成

```text
step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
```

## 実装者向けクイックガイド

### 着手条件

- `.claude/skills/skill-creator/` を常に動的読込する前提に合意している
- Claude Code SDK の permission / hooks 契約を読了している
- TASK-RT-06, TASK-P0-03, TASK-P0-04 の仕様を把握している

### 想定変更ポイント

- Facade の `query()` option 組み立て
- permission policy module
- hooks factory / audit sink
- renderer 向け governance 表示
- 共通型定義

### 非対象

- skill-creator の静的埋め込み
- workflow 全面再設計
- session persistence main 実装の置換

### 完了イメージ

- plan は read-only 中心、execute は生成対象 skill dir への限定 write、verify は read/test 中心、improve は限定 edit で動く
- Hook で provenance / tool 実行 / denial が追跡できる
- permission denial が UI に理由つきで出る
- 動的 skill-creator 呼出し主線はそのまま維持される

### 並列実行メモ

- TASK-P0-09 は TASK-RT-06 + TASK-P0-03/04 完了後に着手
- hooks / permission は `RuntimeSkillCreatorFacade.ts` で P0-08 と競合しやすい

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
