# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 1                                      |
| 機能名 | claude-sdk-permission-hooks-governance |
| 作成日 | 2026-03-29                             |

## 目的

dynamic skill-creator 実行を維持したまま、phase 別 tool policy と hooks / audit の要件を固定する。

## 実行タスク

- plan / execute / verify / improve ごとの tool 境界を定義する
- `permissionMode` / `allowedTools` / `canUseTool` の要件を定義する
- Hooks と audit payload の要件を定義する
- `task-specification-creator` と `aiworkflow-requirements` の正本参照を抽出する
- 本ブランチ変更分の canonical path と dependency edge を固定する

## 参照資料

| 資料名             | パス                                                                                              | 説明            |
| ------------------ | ------------------------------------------------------------------------------------------------- | --------------- |
| remediation pack   | `../p0-verify-manifest-remediation-pack.md`                                                       | 全体構成        |
| requirements draft | `../requirements-draft.md`                                                                        | lane 要件       |
| SDK permissions    | `https://platform.claude.com/docs/fr/agent-sdk/permissions`                                       | permission 契約 |
| RT-06              | `../../completed-tasks/step-08-par-task-rt-06-claude-sdk-message-contract-normalization/index.md` | event 契約      |

## 実行手順

### ステップ0: P50 チェックを実施する

- 対象ファイルの最近の履歴と既存実装を確認する
- 既存の skill 定義と current diff を照合する
- 既実装の破棄が必要かを早期に見極める

### ステップ1: phase 別 tool 境界を固定する

- plan: read-only 中心
- execute: 生成対象 skill dir への限定 write
- verify: read / test 中心
- improve: 限定 edit

### ステップ2: hooks / audit 要件を固定する

- SessionStart
- PreToolUse
- PostToolUse
- SessionEnd

### ステップ3: skill 準拠の抽出対象を固定する

- `task-specification-creator` の Phase 構造・必須成果物・完了条件
- `aiworkflow-requirements` の canonical path、spec sync、quality / lesson / workflow の正本
- `permissionMode`、`allowedTools`、`disallowedTools`、`canUseTool`
- provenance / audit / denial の記録項目

## 成果物

| 成果物              | パス                                         | 説明           |
| ------------------- | -------------------------------------------- | -------------- |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md`     | 要件抽出       |
| skill compliance    | `outputs/phase-1/skill-compliance-matrix.md` | skill 準拠観点 |

## 完了条件

- [x] phase 別 tool policy が列挙されている
- [x] hooks / audit 要件が定義されている
- [x] 2 つの skill 定義から抽出すべき項目が固定されている
- [x] canonical path と dependency edge が明記されている
- [x] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携

- Phase 3 / Phase 10 の gate で再利用できる要件 ID を付与する
- `permissionMode` と `canUseTool` の検証観点を後続 phase に引き渡す

## 多角的チェック観点（AIが判断）

- skill 定義の必須項目が抜けていないか
- 依存先と canonical path が実在するか
- 既存実装を破棄すべき前提が紛れ込んでいないか
- phase 間で同じ語が別の意味になっていないか

## サブタスク管理

| SubAgent   | 責務                               |
| ---------- | ---------------------------------- |
| SubAgent-A | skill 準拠要件の抽出               |
| SubAgent-B | canonical path / dependency の検証 |
| SubAgent-C | hooks / audit 要件の整理           |

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

Phase 2: 設計
