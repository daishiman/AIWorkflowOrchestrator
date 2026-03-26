# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 6                                     |
| 機能名 | task-sdk-02-system-spec-and-path-sync |
| 作成日 | 2026-03-26                            |

## 目的

Phase 4 の基本検証に加え、same-wave 再発パターンを guard する追加チェックを固定する。

## 実行タスク

- stale wording の派生表現を追加する
- stale path の派生経路を追加する
- no-op 根拠不足ケースを追加する
- mirror parity drift の追加検証を定義する

## 参照資料

| 資料名             | パス                                           | 説明             |
| ------------------ | ---------------------------------------------- | ---------------- |
| Phase 4 テスト作成 | `phase-4-test-creation.md`                     | 基本コマンド     |
| test matrix        | `outputs/phase-4/test-matrix.md`               | 追加対象         |
| Phase 5 成果物     | `outputs/phase-5/implementation-sequencing.md` | 実更新順との対応 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス                                                                                              | 内容                   |
| -------- | ------------------------------------------------------------------------------------------------- | ---------------------- |
| lessons  | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | same-wave 崩壊パターン |

## 実行手順

### ステップ1: wording guard を増やす

- `計画済み`
- `後続で同期`
- `PRマージ後`

### ステップ2: path guard を増やす

- `skill-creator-agent-sdk-lane`
- `../root-workflow-pack`

### ステップ3: no-op guard を増やす

- Step 2 no-op の根拠が changelog と summary に両方あるかを確認する。

## 統合テスト連携

- Phase 6 では Phase 4 の test matrix に未完了表現、派生 stale path、no-op 根拠不足の guard を追加し、回帰検知を厚くする。
- 追加した guard は Phase 7 以降の coverage / QA / final review でそのまま再利用する。

## 成果物

| 成果物                 | パス                                        | 説明              |
| ---------------------- | ------------------------------------------- | ----------------- |
| テスト拡充             | `phase-6-test-expansion.md`                 | 回帰 guard の追加 |
| test expansion summary | `outputs/phase-6/test-expansion-summary.md` | 追加チェック一覧  |

## 完了条件

- [ ] wording guard が 3 追加されている
- [ ] path guard が 2 追加されている
- [ ] no-op 根拠 guard が追加されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. 回帰 guard の追加
3. 統合テスト連携の更新
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] 後続Phaseへ渡す guard 群が固定されている
