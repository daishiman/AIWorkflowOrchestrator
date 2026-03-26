# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 10                                            |
| Phase名    | 最終レビューゲート                            |
| 前提Phase  | Phase 9                                       |
| 後続Phase  | Phase 11                                      |
| ステータス | 未実施                                        |
| 作成日     | 2026-03-24                                    |
| 機能名     | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION |

---

## 目的

Phase 1 で定義した受入条件（AC-1〜AC-10）と実装・テストの状態を照合し、Phase 11（手動テスト）に進める品質レベルに達しているかを判定する。blocker が存在する場合は適切な Phase に戻す。

## 背景

Phase 9 で品質保証（型チェック・Lint・テスト）が完了した状態で、受入条件の全項目が実装・テストで満たされているかを最終確認する。TASK-SC-06 の苦戦箇所（C-1, C-2, C-4, 対称クリア）が実装レベルで回避されているかも本レビューで確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: AC-1〜AC-10 全照合

**目的**: 全受入条件が実装・テストで充足されていることを確認する

**実行手順**:

1. Phase 1 の受入条件（`outputs/phase-1/acceptance-criteria.md`）を読み込む
2. 実装コード（SkillCreateWizard.tsx, GenerateStep.tsx, DescribeStep.tsx）を参照しながら各 AC を照合する
3. テストファイル（`__tests__/` 配下）を参照し、各 AC に対応するテストケースの存在を確認する
4. 以下の表を埋める:

   | AC    | 条件                                                                                    | 実装充足 | テスト充足 | 備考 |
   | ----- | --------------------------------------------------------------------------------------- | -------- | ---------- | ---- |
   | AC-1  | DescribeStep に「LLM で生成」と「テンプレートから作成」の選択 UI が表示される           | -        | -          |      |
   | AC-2  | 「LLM で生成」選択 → ConfigureStep スキップ → GenerateStep で planSkill が呼ばれる      | -        | -          |      |
   | AC-3  | GenerateStep で plan 結果（type, estimatedSteps, guidance）が正しく表示される           | -        | -          |      |
   | AC-4  | GenerateStep の「実行」ボタンで executePlan が呼ばれ、成功時 CompleteStep に遷移する    | -        | -          |      |
   | AC-5  | GenerateStep の「キャンセル」ボタンで plan をクリアし DescribeStep に戻る               | -        | -          |      |
   | AC-6  | generationProgress が GenerateStep に表示される（ローディング状態）                     | -        | -          |      |
   | AC-7  | planSkill / executePlan のエラー時、GenerateStep にエラーメッセージが表示される         | -        | -          |      |
   | AC-8  | 「テンプレートから作成」フローが既存のまま動作する（非破壊）                            | -        | -          |      |
   | AC-9  | PlanResult 型は agentSlice.ts からの Single Source of Truth を使用する                  | -        | -          |      |
   | AC-10 | Hybrid State Pattern の対称クリアが handleCancelPlan / handleExecutePlan 両方で行われる | -        | -          |      |

5. 結果を `outputs/phase-10/ac-verification.md` に記録する

**期待される成果物**:

- `outputs/phase-10/ac-verification.md`（AC 照合結果）

---

### タスク2: TASK-SC-06 苦戦箇所回避の最終確認

**目的**: 実装レベルでの苦戦箇所回避を確認する

**実行手順**:

1. 実装コードを参照し、以下のチェックリストを確認する:

   | 苦戦箇所                       | 確認観点                                                                               | 結果 |
   | ------------------------------ | -------------------------------------------------------------------------------------- | ---- |
   | C-1: executePlan 引数型        | `executePlan` の引数 `skillSpec` が `string`（必須）で呼ばれているか                   | -    |
   | C-2: generationProgress 未表示 | `useGenerationProgress` が import・使用・JSX 表示されているか（セットで3点）           | -    |
   | C-4: PlanResult 二重定義       | `PlanResult` 型がローカル定義されておらず `agentSlice.ts` から import されているか     | -    |
   | 対称クリア                     | handleCancelPlan と handleExecutePlan 両方で `clearGenerationState()` が呼ばれているか | -    |

2. 問題が発見された場合は MAJOR 判定として Phase 5（実装）に戻す
3. 結果を `outputs/phase-10/sc06-avoidance-final.md` に記録する

**期待される成果物**:

- `outputs/phase-10/sc06-avoidance-final.md`（苦戦箇所回避の最終確認結果）

---

### タスク3: レビュー判定

**目的**: Phase 11 に進めるかを判定する

**実行手順**:

1. タスク1・2 の結果を総合して以下の基準で判定する:

   **判定基準**:

   | 判定     | 条件                                                    | 定義                   |
   | -------- | ------------------------------------------------------- | ---------------------- |
   | PASS     | AC-1〜AC-10 が全て充足、苦戦箇所回避が全て確認できた    | Phase 11 へ進行        |
   | MINOR    | 軽微な指摘あり（ドキュメント・コメントの不足等）        | 指摘対応後 Phase 11 へ |
   | MAJOR    | AC の未充足または苦戦箇所が実装レベルで回避されていない | 該当 Phase へ戻る      |
   | CRITICAL | 根本的な設計ミスまたは要件との齟齬                      | Phase 1 へ戻る         |

2. **戻り先決定基準テーブル**（MAJOR / CRITICAL 判定時）:

   | 問題の種類                      | 戻り先                           |
   | ------------------------------- | -------------------------------- |
   | 実装の誤り（AC 未充足）         | Phase 5（実装）                  |
   | テストの不足（AC のテストなし） | Phase 4（テスト作成）            |
   | リファクタリング起因の不具合    | Phase 8（リファクタリング）      |
   | 設計の根本的な問題              | Phase 2（設計）                  |
   | 要件自体の問題                  | Phase 1（要件定義）+ユーザー確認 |

3. **blocker 判定**: 以下に該当する場合は blocker として Phase 11 への進行を阻止する:
   - AC が 1 件でも未充足
   - C-1 / C-2 / C-4 / 対称クリアのいずれかが実装レベルで回避されていない
   - 型エラー・Lint エラーが残存している

4. 判定結果（PASS / MINOR / MAJOR / CRITICAL）と理由・次のアクションを `outputs/phase-10/review-decision.md` に記録する

**期待される成果物**:

- `outputs/phase-10/review-decision.md`（レビュー判定結果）

---

### タスク4: 最終レビューサマリー作成

**目的**: Phase 11〜13 に向けた状態確認を文書化する

**実行手順**:

1. タスク1〜3 の結果を統合し、以下の内容を含むサマリーを作成する:
   - レビュー判定結果（PASS / MINOR / MAJOR / CRITICAL）
   - AC-1〜AC-10 の充足状況（充足率）
   - 苦戦箇所回避の確認結果
   - Phase 9（品質保証）の通過確認（型チェック・Lint・テスト）
   - 残課題（MINOR 判定の場合の対応事項）
2. 結果を `outputs/phase-10/final-review-summary.md` に記録する

**期待される成果物**:

- `outputs/phase-10/final-review-summary.md`（最終レビューサマリー）

---

## 参照資料

| 参照資料             | パス                                                                                 | 内容                               |
| -------------------- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| Phase 1 受入条件     | `outputs/phase-1/acceptance-criteria.md`                                             | AC-1〜AC-10 の定義                 |
| Phase 9 品質保証結果 | `outputs/phase-9/qa-summary.md`                                                      | 型チェック・Lint・テストの通過確認 |
| SkillCreateWizard    | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                   | 照合対象実装                       |
| GenerateStep         | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`                 | 照合対象実装                       |
| DescribeStep         | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                 | 照合対象実装                       |
| テストファイル       | `apps/desktop/src/renderer/components/skill/__tests__/`                              | AC 対応テスト確認                  |
| TASK-SC-06 苦戦箇所  | `docs/30-workflows/unassigned-task/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION.md` | C-1, C-2, C-4, 対称クリアの定義    |

---

## 成果物

| 成果物               | パス                                       | 内容                                           |
| -------------------- | ------------------------------------------ | ---------------------------------------------- |
| AC 照合結果          | `outputs/phase-10/ac-verification.md`      | AC-1〜AC-10 の実装・テスト充足確認             |
| 苦戦箇所回避確認     | `outputs/phase-10/sc06-avoidance-final.md` | C-1, C-2, C-4, 対称クリアの最終確認            |
| レビュー判定結果     | `outputs/phase-10/review-decision.md`      | PASS / MINOR / MAJOR / CRITICAL と次アクション |
| 最終レビューサマリー | `outputs/phase-10/final-review-summary.md` | Phase 11〜13 に向けた状態確認                  |

---

## 統合テスト連携（Phase 10）

- AC-2（planSkill 呼び出し）・AC-4（executePlan 呼び出し）の統合テスト観点が自動テストでカバーされていることを確認する
- IPC 契約（Preload API シグネチャ）と実装の型整合が確認されていることを確認する
- エラーパス（AC-7）の統合テスト観点が自動テストでカバーされていることを確認する

---

## 完了条件

- [ ] AC-1〜AC-10 が全て実装・テストで充足されている
- [ ] TASK-SC-06 苦戦箇所（C-1, C-2, C-4, 対称クリア）が実装レベルで全て回避されている
- [ ] レビュー判定が PASS または MINOR（対応済み）であること
- [ ] blocker が存在しないこと
- [ ] 全4成果物が生成されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## レビューゲート

### レビュー結果判定

| 判定     | 条件                                    | 次のアクション               |
| -------- | --------------------------------------- | ---------------------------- |
| PASS     | AC 全充足・苦戦箇所回避・品質ゲート通過 | Phase 11（手動テスト）へ進行 |
| MINOR    | 軽微な指摘あり（コメント追加等）        | 指摘対応後 Phase 11 へ       |
| MAJOR    | AC 未充足または苦戦箇所回避漏れ         | 戻り先決定基準テーブルに従う |
| CRITICAL | 根本的な要件・設計の問題                | Phase 1 へ戻りユーザー確認   |

### 戻り先決定基準

| 問題の種類                   | 戻り先                      |
| ---------------------------- | --------------------------- |
| 実装の誤り                   | Phase 5（実装）             |
| テストの不足                 | Phase 4（テスト作成）       |
| リファクタリング起因の不具合 | Phase 8（リファクタリング） |
| 設計の根本的な問題           | Phase 2（設計）             |
| 要件自体の問題               | Phase 1（要件定義）         |

---

## 依存関係

- **前提**: Phase 9（品質保証）が完了し、型チェック・Lint・テストが全て通過していること
- **後続**: Phase 11（手動テスト）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-11-manual-test.md`
