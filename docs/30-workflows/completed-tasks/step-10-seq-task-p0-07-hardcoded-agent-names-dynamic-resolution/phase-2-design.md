# Phase 2: 設計

## メタ情報

| 項目      | 値                                       |
| --------- | ---------------------------------------- |
| Phase     | 2                                        |
| Phase名   | 設計                                     |
| 機能名    | hardcoded-agent-names-dynamic-resolution |
| 前提Phase | Phase 1: 要件定義                        |
| 次Phase   | Phase 3: 設計レビュー                    |
| 状態      | pending                                  |
| 作成日    | 2026-03-29                               |
| 更新日    | 2026-03-30                               |

## 目的

Phase 1 で固定した skill 準拠結果と差分棚卸しを前提に、ハードコードされた `AGENT_NAMES` を破棄しても成立する最小構成の動的解決設計を行う。`AgentNameResolver`、ManifestLoader 拡張、WorkflowEngine 連携、フォールバック順序を一つの責務境界に閉じる。

## 実行タスク

- コンポーネント構成の設計
- インターフェース定義
- データフローの設計
- エラーハンドリング方針の定義
- 破棄判断基準の固定

## 参照資料

| 資料名           | パス                                                                     | 説明                 |
| ---------------- | ------------------------------------------------------------------------ | -------------------- |
| Phase 1 要件     | `phase-1-requirements.md`                                                | 要件定義             |
| index.md         | `index.md`                                                               | タスク概要           |
| lane 要件草案    | `../skill-creator-agent-sdk-lane/requirements-draft.md`                  | 背景、制約、解決境界 |
| 親 workflow pack | `../skill-creator-agent-sdk-lane/root-workflow-pack/index.md`            | 依存順と責務分離     |
| P0 是正パック    | `../skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md` | 15 タスクの全体文脈  |

## 実行手順

### ステップ1: コンポーネント構成を設計する

変更対象の `SkillCreatorWorkflowEngine`、`ManifestLoader`、`AgentNameResolver` の責務を分け、どの層が source of truth かを明確にする。

### ステップ2: インターフェースを定義する

型定義、API 境界、IPC チャネル、manifest 由来の設定キーを設計する。

### ステップ3: データフローを設計する

入力から出力までのデータの流れを設計し、フォールバック順序を `manifest -> default -> existing behavior` の順で固定する。

### ステップ4: エラーハンドリング方針を定義する

想定されるエラーパターンと対処方針を定義し、失敗時に patch ではなく再構成へ切り替える条件を明示する。

### ステップ5: 破棄判断を固定する

追加分岐や重複フォールバックを増やす案は採用せず、責務が肥大化する場合は `AgentNameResolver` を中心に再構成する。

## 成果物

| 成果物           | パス                                         | 説明              |
| ---------------- | -------------------------------------------- | ----------------- |
| 設計ドキュメント | `outputs/phase-2/design-document.md`         | 技術設計書        |
| 破棄判断メモ     | `outputs/phase-2/reconstruction-decision.md` | 再構成/patch 判断 |

## 完了条件

- [ ] コンポーネント構成が設計されている
- [ ] インターフェースが定義されている
- [ ] データフローが設計されている
- [ ] エラーハンドリング方針が定義されている
- [ ] 破棄判断基準が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
