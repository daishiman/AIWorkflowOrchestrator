# Phase 4: テストケース一覧（TC-01〜TC-15）

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 4                                          |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001 |
| 作成日     | 2026-04-08                                 |
| ステータス | completed                                  |

---

## テストケース一覧

| TC番号 | テスト内容                                                | 対応 AC | テストファイル                        | 達成状況  |
| ------ | --------------------------------------------------------- | ------- | ------------------------------------- | --------- |
| TC-01  | Step 0 が初期表示される                                   | AC-01   | SkillCreateWizard.test.tsx            | ✅        |
| TC-02  | Step 0 で onNext を呼ぶと inferSmartDefaults が呼ばれる   | AC-02   | SkillCreateWizard.test.tsx            | ✅        |
| TC-03  | inferSmartDefaults の結果が Step 1 に渡る                 | AC-03   | SkillCreateWizard.W2-seq-03a.test.tsx | ✅        |
| TC-04  | Step 1 で onGenerate を呼ぶと IPC 実行が開始される        | AC-01   | SkillCreateWizard.test.tsx            | ✅        |
| TC-05  | IPC 成功後に Step 2（完了）に遷移する                     | AC-01   | SkillCreateWizard.test.tsx            | ✅        |
| TC-06  | 計装ポイント 1: ウィザード開始時のログ出力                | AC-04   | SkillCreateWizard.W2-seq-03a.test.tsx | ✅        |
| TC-07  | 計装ポイント 2: Step 0 完了時のログ出力                   | AC-04   | SkillCreateWizard.W2-seq-03a.test.tsx | ✅        |
| TC-08  | 計装ポイント 3: inferSmartDefaults 呼び出し結果のログ出力 | AC-04   | SkillCreateWizard.W2-seq-03a.test.tsx | ✅        |
| TC-09  | 計装ポイント 4: Step 1 完了時のログ出力                   | AC-04   | SkillCreateWizard.W2-seq-03a.test.tsx | ✅        |
| TC-10  | 計装ポイント 5: ウィザード完了時のログ出力                | AC-04   | SkillCreateWizard.W2-seq-03a.test.tsx | ✅        |
| TC-11  | inferSmartDefaults エラー時のフォールバック挙動           | AC-02   | SkillCreateWizard.test.tsx            | ✅        |
| TC-12  | onClose Props が Step 2 の CompleteStep に渡る            | AC-01   | SkillCreateWizard.test.tsx            | ✅        |
| TC-13  | 戻るボタン: Step 1 → Step 0 に戻れる                      | AC-01   | SkillCreateWizard.test.tsx            | ✅        |
| TC-14  | カバレッジ計測（90% 以上を確認）                          | AC-05   | coverage run                          | ✅ 98.14% |
| TC-15  | TypeScript 型安全性（Props の型検査）                     | AC-06   | typecheck                             | ✅        |

---

## 追加テストケース（Phase 6 拡充分）

| TC番号 | テスト内容                                                | テストファイル                        |
| ------ | --------------------------------------------------------- | ------------------------------------- |
| TC-A01 | inferSmartDefaults: Slack → tool='slack'                  | SkillCreateWizard.W2-seq-03a.test.tsx |
| TC-A02 | inferSmartDefaults: 毎日 → timing='scheduled'             | SkillCreateWizard.W2-seq-03a.test.tsx |
| TC-A03 | inferSmartDefaults: category=code-support → format='code' | SkillCreateWizard.W2-seq-03a.test.tsx |
| TC-A04 | inferSmartDefaults: キーワードなし → 全 null              | SkillCreateWizard.W2-seq-03a.test.tsx |
| TC-A05 | STEPS 配列の正確性確認                                    | SkillCreateWizard.W2-seq-03a.test.tsx |
| TC-A06 | handleRetry: CompleteStep の👎で Step 0 に戻る            | SkillCreateWizard.W2-seq-03a.test.tsx |
| TC-A07 | handleRetry: Step 0 復帰後も formData が保持される        | SkillCreateWizard.W2-seq-03a.test.tsx |
| TC-A08 | CompleteStep アクションカード: 今すぐ実行する             | SkillCreateWizard.W2-seq-03a.test.tsx |
| TC-A09 | CompleteStep アクションカード: エディタで開く             | SkillCreateWizard.W2-seq-03a.test.tsx |
| TC-A10 | CompleteStep アクションカード: 別のスキルを作る           | SkillCreateWizard.W2-seq-03a.test.tsx |

---

## テスト設計方針

- `inferSmartDefaults` は `vi.mock` を使わず直接テスト（純粋関数のため）
- Store hooks は `vi.mock('../../../store', ...)` でモック化
- `inferSmartDefaults` は shared service のモック（`@repo/shared/services/skillCreator`）で差し替える
- 計装ポイントは `vi.spyOn(console, 'log')` で検証（Wave 3 移行後は trackEvent mock）
