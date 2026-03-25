# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 11                                            |
| Phase名    | 手動テスト                                    |
| 前提Phase  | Phase 10                                      |
| 後続Phase  | Phase 12                                      |
| ステータス | 未実施                                        |
| 作成日     | 2026-03-24                                    |
| 機能名     | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION |

---

## 目的

Electron アプリを実際に起動し、SkillCreateWizard の LLM 生成フローを手動で操作して、自動テストでは確認できない UI/UX 品質・実際の IPC 動作・画面遷移の連続性を確認する。

## 背景

Phase 10 で全受入条件（AC-1〜AC-10）が自動テストで充足されていることを確認した。本 Phase では、実際の Electron アプリ上での動作確認を行い、ユーザー体験として問題がないことを確認する。スクリーンショットを成果物として記録し、PR レビュー時のエビデンスとする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Electron アプリの起動

**目的**: 手動テスト環境を準備する

**実行手順**:

1. 開発サーバーを起動する:
   ```bash
   pnpm --filter @repo/desktop dev
   ```
2. Electron アプリが正常に起動することを確認する
3. SkillCreateWizard が表示されるページ/画面に遷移する
4. 手動テスト開始の準備が整ったことを記録する

---

### タスク2: LLM 生成フローの手動確認

**目的**: LLM 生成フローの全ステップを実際に操作して確認する

**実行手順**:

以下の各確認項目を順番に実施し、各ステップで画面の状態を確認する。

**確認項目1: DescribeStep での「LLM で生成」選択**

1. SkillCreateWizard を開く
2. DescribeStep（第1ステップ）が表示されることを確認する
3. 「LLM で生成」と「テンプレートから作成」の選択 UI が表示されていることを確認する（AC-1）
4. 「LLM で生成」を選択する
5. スキルの説明文を入力する（例: 「コードレビューを自動化するスキル」）
6. スクリーンショットを取得する（`outputs/phase-11/screenshots/01-describe-llm-mode.png`）

**確認項目2: GenerateStep への遷移と plan 結果表示**

1. DescribeStep の「次へ」または「生成する」ボタンをクリックする
2. ConfigureStep がスキップされ GenerateStep（LLM 生成中ステップ）に遷移することを確認する（AC-2）
3. `planSkill` が呼ばれ、処理中のローディング状態が表示されることを確認する（AC-6）
4. `generationProgress` のメッセージが GenerateStep に表示されることを確認する（AC-6）
5. plan 完了後、以下が正しく表示されることを確認する（AC-3）:
   - plan の type（スキルタイプ）
   - estimatedSteps（推定ステップ数）
   - guidance（ガイダンステキスト）
6. スクリーンショットを取得する（`outputs/phase-11/screenshots/02-generate-step-plan-result.png`）

**確認項目3: 「実行する」ボタンで CompleteStep へ遷移**

1. GenerateStep の「実行する」ボタンをクリックする
2. `executePlan` が呼ばれ、実行中のローディング状態が表示されることを確認する
3. 成功時、CompleteStep（完了ステップ）に遷移することを確認する（AC-4）
4. CompleteStep で生成されたスキルの情報が表示されることを確認する
5. スクリーンショットを取得する（`outputs/phase-11/screenshots/03-complete-step.png`）

**確認項目4: 「キャンセル」ボタンで DescribeStep に戻る**

1. 新しく SkillCreateWizard を開く
2. 「LLM で生成」を選択し GenerateStep に遷移する
3. plan 結果が表示された状態で「キャンセル」ボタンをクリックする
4. plan がクリアされ DescribeStep（第1ステップ）に戻ることを確認する（AC-5）
5. DescribeStep の入力フォームが初期状態またはキャンセル前の状態に戻っていることを確認する
6. スクリーンショットを取得する（`outputs/phase-11/screenshots/04-cancel-to-describe.png`）

**確認項目5: テンプレートフローが既存通り動作する**

1. 新しく SkillCreateWizard を開く
2. DescribeStep で「テンプレートから作成」を選択する（デフォルト選択）
3. 既存フロー（DescribeStep → ConfigureStep → GenerateStep → CompleteStep）が正常に動作することを確認する（AC-8）
4. 「テンプレートから作成」で LLM 生成ボタン等が表示されないことを確認する
5. スクリーンショットを取得する（`outputs/phase-11/screenshots/05-template-flow.png`）

**確認項目6: エラー時の表示確認**

1. ネットワーク切断またはモック設定でエラー状態を再現する（可能な場合）
2. `planSkill` がエラーを返した場合、GenerateStep にエラーメッセージが表示されることを確認する（AC-7）
3. エラーメッセージが適切に表示され、ユーザーが再試行できる状態であることを確認する
4. スクリーンショットを取得する（`outputs/phase-11/screenshots/06-error-state.png`）
   ※ エラー状態の再現が難しい場合はスキップし、理由を記録する

---

### タスク3: UI/UX 品質確認

**目的**: 自動テストでは確認できない UI/UX の品質を確認する

**実行手順**:

1. 以下の観点でウィザード全体を目視確認する:

   | 確認項目                            | 確認内容                                             |
   | ----------------------------------- | ---------------------------------------------------- |
   | レイアウトの崩れ                    | 各ステップで要素が正しく配置されているか             |
   | ローディング状態の視認性            | スピナー・プログレスメッセージが見やすいか           |
   | ボタンの活性/非活性状態             | 処理中はボタンが無効化されているか                   |
   | エラーメッセージの視認性            | エラーが発生した場合にユーザーが気づけるか           |
   | plan 結果テキストの可読性           | guidance テキストが長い場合にスクロール可能か        |
   | キャンセル動作の即応性              | キャンセルボタン押下後に即座に DescribeStep に戻るか |
   | CompleteStep での成功フィードバック | 生成完了が視覚的に明確にわかるか                     |

2. 問題が発見された場合は記録し、重大度（Critical / Major / Minor）を判定する
3. Critical / Major の問題は修正してから Phase 12 に進む
4. Minor の問題は記録のみとし Phase 12 に進む
5. 結果を `outputs/phase-11/ux-check.md` に記録する

---

### タスク4: 手動テスト結果サマリー作成

**目的**: 手動テストの結果を文書化し、Phase 12 に引き渡す

**実行手順**:

1. 確認項目1〜6 と UI/UX 確認の結果を以下の表にまとめる:

   | 確認項目                                  | 結果           | 備考                   |
   | ----------------------------------------- | -------------- | ---------------------- |
   | DescribeStep で「LLM で生成」選択 UI 確認 | PASS/FAIL/SKIP | スクリーンショット参照 |
   | GenerateStep 遷移と plan 結果表示確認     | PASS/FAIL/SKIP |                        |
   | 「実行する」で CompleteStep 遷移確認      | PASS/FAIL/SKIP |                        |
   | 「キャンセル」で DescribeStep 戻り確認    | PASS/FAIL/SKIP |                        |
   | テンプレートフロー既存動作確認            | PASS/FAIL/SKIP |                        |
   | エラー時の表示確認                        | PASS/FAIL/SKIP |                        |
   | UI/UX 品質確認                            | PASS/FAIL      | 問題件数: N 件         |

2. 総合判定（全て PASS の場合は Phase 12 に進む）を記録する
3. 結果を `outputs/phase-11/manual-test-summary.md` に記録する

**期待される成果物**:

- `outputs/phase-11/manual-test-summary.md`（手動テスト結果サマリー）

---

## 参照資料

| 参照資料              | パス                                                                 | 内容                              |
| --------------------- | -------------------------------------------------------------------- | --------------------------------- |
| Phase 10 最終レビュー | `outputs/phase-10/final-review-summary.md`                           | AC 充足確認済みの状態             |
| Phase 1 受入条件      | `outputs/phase-1/acceptance-criteria.md`                             | 手動テストの確認基準              |
| SkillCreateWizard     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | 手動テスト対象コンポーネント      |
| GenerateStep          | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` | 手動テスト対象（LLM 結果表示 UI） |
| DescribeStep          | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` | 手動テスト対象（モード選択 UI）   |

---

## 成果物

| 成果物                           | パス                                                            | 内容                             |
| -------------------------------- | --------------------------------------------------------------- | -------------------------------- |
| スクリーンショット（LLM選択）    | `outputs/phase-11/screenshots/01-describe-llm-mode.png`         | DescribeStep でのモード選択 UI   |
| スクリーンショット（plan結果）   | `outputs/phase-11/screenshots/02-generate-step-plan-result.png` | GenerateStep での plan 結果表示  |
| スクリーンショット（完了）       | `outputs/phase-11/screenshots/03-complete-step.png`             | CompleteStep での完了画面        |
| スクリーンショット（キャンセル） | `outputs/phase-11/screenshots/04-cancel-to-describe.png`        | キャンセル後の DescribeStep 戻り |
| スクリーンショット（テンプレ）   | `outputs/phase-11/screenshots/05-template-flow.png`             | テンプレートフローの既存動作     |
| スクリーンショット（エラー）     | `outputs/phase-11/screenshots/06-error-state.png`               | エラー表示状態（再現可能な場合） |
| UI/UX 確認結果                   | `outputs/phase-11/ux-check.md`                                  | 目視確認の結果                   |
| 手動テストサマリー               | `outputs/phase-11/manual-test-summary.md`                       | 全確認項目の結果と総合判定       |

---

## 統合テスト連携（Phase 11）

手動テストでは以下の統合動作を実際の Electron IPC で確認する:

- `planSkill` の実際の IPC 呼び出しが正常に動作すること
- `executePlan` の実際の IPC 呼び出しが正常に動作すること
- Zustand store の状態変化が UI に正しく反映されること（generationProgress 等）
- Electron のプロセス間通信（Main/Renderer）が正常に機能していること

---

## 完了条件

- [ ] Electron アプリが正常に起動している
- [ ] 確認項目1〜5 が全て PASS（確認項目6 は SKIP 可）
- [ ] UI/UX 確認で Critical / Major の問題が存在しないこと
- [ ] スクリーンショット（最低5枚、確認項目1〜5 に対応）が取得されている
- [ ] `outputs/phase-11/manual-test-summary.md` が生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10（最終レビューゲート）が PASS または MINOR（対応済み）で完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-12-documentation.md`
