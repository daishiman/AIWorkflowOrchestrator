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

## 参照資料

| 資料名             | パス                                                        | 説明            |
| ------------------ | ----------------------------------------------------------- | --------------- |
| remediation pack   | `../p0-verify-manifest-remediation-pack.md`                 | 全体構成        |
| requirements draft | `../requirements-draft.md`                                  | lane 要件       |
| SDK permissions    | `https://platform.claude.com/docs/fr/agent-sdk/permissions` | permission 契約 |

## 実行手順

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

## 成果物

| 成果物              | パス                                     | 説明     |
| ------------------- | ---------------------------------------- | -------- |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | 要件抽出 |

## 完了条件

- [ ] phase 別 tool policy が列挙されている
- [ ] hooks / audit 要件が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
