# Phase 1: 要件定義

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 1                            |
| 機能名 | multi-select-user-input-kind |
| 作成日 | 2026-03-29                   |

## 目的

既存の `option.id` 契約を維持したまま `multi_select` を追加するために、shared type、engine、renderer の境界を fixed contract として定義する。

## 実行タスク

- 既存の `single_select` / `free_text` / `secret` / `confirm` の submission 契約を確認する
- `multi_select` の送信データを `selectedOptionIds: string[]` に固定する
- validation rule を「1件以上選択」「未知 option id 禁止」に固定する
- renderer 側の入力 host を checkbox 群で定義する
- AC-1〜AC-4 を file / function 単位へ写像する

## 参照資料

| 資料名           | パス                                                                     | 説明                        |
| ---------------- | ------------------------------------------------------------------------ | --------------------------- |
| 要件草案         | `../skill-creator-agent-sdk-lane/requirements-draft.md`                  | lane 全体の runtime 前提    |
| 親 workflow      | `../skill-creator-agent-sdk-lane/root-workflow-pack/index.md`            | 共通不変条件                |
| remediation pack | `../skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md` | Step 09 sibling task の依存 |
| 型定義           | `packages/shared/src/types/skillCreator.ts`                              | `kind` と submission 契約   |
| engine           | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`   | validation と state owner   |
| renderer         | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`     | question host と submit     |

### 現行コードアンカー

| ファイル                                                               | 観察点                                                                |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                            | `SkillCreatorUserInputKind` は 4 種のみ、submission は単数選択前提    |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | `validateUserInputSubmission` は `single_select` を単数 id で検証する |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`   | question host は radio / textarea / password / boolean の 4 系統のみ  |

## 実行手順

### ステップ1: 現行契約を固定する

- `request.kind` は renderer の分岐キーであり、新規 kind 追加だけで既存 4 kind を壊してはならない
- `request.options[].id` が選択値の正本であり、label 文字列を submission に流さない
- `SkillCreatorUserInputSubmission` は renderer から engine へ送る唯一の payload とする

### ステップ2: `multi_select` の最小契約を定義する

| 項目             | 仕様                                                 |
| ---------------- | ---------------------------------------------------- |
| kind             | `multi_select`                                       |
| submission field | `selectedOptionIds?: string[]`                       |
| 必須条件         | 配列が存在し、1件以上の id を含む                    |
| 妥当性条件       | 全要素が `request.options[].id` に存在する           |
| 非対象           | min/max selection、option の並び替え、追加メタデータ |

### ステップ3: renderer 表示仕様を固定する

- 各 option は checkbox と label の組で描画する
- 選択 state は `string[]` で保持する
- submit 時に `selectedOptionIds` を payload へ詰める
- request kind 切り替え時は他 kind の state を持ち越さない

## 統合テスト連携

- Phase 4 で shared type、engine validation、renderer submit の 3 系統へ分解してテストケース化する
- Phase 6 で空配列、未知 option id、kind 切り替えリセットを追加する
- Phase 7 で AC ごとの coverage matrix を作る

## 成果物

| 成果物              | パス                                     | 説明                                |
| ------------------- | ---------------------------------------- | ----------------------------------- |
| 要件定義書          | `phase-1-requirements.md`                | `multi_select` の契約と非対象の固定 |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | 型定義、engine、renderer の対応表   |

## 完了条件

- [ ] 既存 4 kind の submission 契約が確認されている
- [ ] `selectedOptionIds` を正本とする方針が定義されている
- [ ] validation rule が「非空 + 既知 option id」に固定されている
- [ ] renderer 表示仕様が checkbox 群として定義されている
- [ ] AC-1〜AC-4 の写像が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
