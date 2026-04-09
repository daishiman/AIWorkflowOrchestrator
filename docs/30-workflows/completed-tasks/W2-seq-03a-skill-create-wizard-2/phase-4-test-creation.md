# Phase 4: テスト作成（TDD Red フェーズ）

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 4                                                          |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001                 |
| 機能名     | SkillCreateWizard.tsx 実装（オーケストレーション・Wave 2） |
| 前提Phase  | Phase 3                                                    |
| 後続Phase  | Phase 5                                                    |
| 作成日     | 2026-04-08                                                 |
| ステータス | 未実施                                                     |

---

## 目的

実装前にテストを作成し、Red 状態を確認する（TDD 起点）。

## 背景

AC-01〜AC-07 に対応するテストケース（TC-01〜TC-15）を設計し、`__tests__/SkillCreateWizard.test.tsx` を作成する。全テストが Red（失敗）の状態であることを確認してから Phase 5 の実装に進む。

---

## 実行タスク

### タスク1: テストケース設計

**目的**: AC-01〜AC-07 に対応するテストケースを設計する

**実行手順**:

1. 各 AC に対応するテストケース（TC-01〜TC-15）を設計する
2. NON_VISUAL 計装ポイント 5 つのテストを含める
3. `inferSmartDefaults` の呼び出しを mock するテスト設計をする
4. テストケース一覧を `outputs/phase-4/test-cases.md` に記録する

**テストケース一覧**:

| TC番号 | テスト内容                                                  | 対応 AC |
| ------ | ----------------------------------------------------------- | ------- |
| TC-01  | Step 0 が初期表示される                                     | AC-01   |
| TC-02  | Step 0 で onNext を呼ぶと inferSmartDefaults が呼ばれる     | AC-02   |
| TC-03  | inferSmartDefaults の結果が Step 1 に渡る                   | AC-03   |
| TC-04  | Step 1 で onGenerate を呼ぶと IPC 実行が開始される          | AC-01   |
| TC-05  | IPC 成功後 Step 2（CompleteStep）に遷移する                 | AC-01   |
| TC-06  | 計装ポイント 1: ウィザード開始時のログ出力                  | AC-04   |
| TC-07  | 計装ポイント 2: Step 0 完了時のログ出力                     | AC-04   |
| TC-08  | 計装ポイント 3: inferSmartDefaults 呼び出し結果のログ出力   | AC-04   |
| TC-09  | 計装ポイント 4: Step 1 完了時のログ出力                     | AC-04   |
| TC-10  | 計装ポイント 5: ウィザード完了時のログ出力                  | AC-04   |
| TC-11  | inferSmartDefaults がエラーを投げた場合のフォールバック挙動 | AC-02   |
| TC-12  | onClose Props が Step 2 の CompleteStep に渡る              | AC-01   |
| TC-13  | 戻るボタン: Step 1 → Step 0 に戻れる                        | AC-01   |
| TC-14  | カバレッジ計測（90% 以上を確認）                            | AC-05   |
| TC-15  | TypeScript 型安全性（Props の型検査）                       | AC-06   |

**期待される成果物**:

- `outputs/phase-4/test-cases.md`

---

### タスク2: テストファイル作成（Red 状態）

**目的**: `SkillCreateWizard.test.tsx` を作成し、全テストが Red であることを確認する

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` を作成する
2. `vi.mock` で `inferSmartDefaults` をモック化する
3. `vi.spyOn(console, 'log')` で計装ポイントのテストを設計する
4. `pnpm vitest run` を実行し、全テストが Red（失敗）であることを確認する

**テスト設計方針**:

- `inferSmartDefaults` は `vi.mock('@repo/shared/services/skillCreator')` でモック化
- 計装ポイントのテストは `vi.spyOn(console, 'log')` を使用
- Wave 3 で差し替える `trackEvent` スタブも考慮した設計にする

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`（Red 状態）
- `outputs/phase-4/test-creation-record.md`（Red 確認記録）

---

## 参照資料

| 参照資料              | パス                                                                          | 内容                                     |
| --------------------- | ----------------------------------------------------------------------------- | ---------------------------------------- |
| Phase 2 設計書        | `outputs/phase-2/component-design.md`                                         | Props インターフェース・計装ポイント定義 |
| Phase 3 レビュー結果  | `outputs/phase-3/design-review-result.md`                                     | 設計 PASS 確認                           |
| 共有型定義            | `packages/shared/src/types/skillCreator.ts`                                   | テスト用型定義                           |
| SkillInfoStep         | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         | Step 0 Props 確認                        |
| ConversationRoundStep | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | Step 1 Props 確認                        |
| CompleteStep          | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`          | Step 2 Props 確認                        |

---

## 成果物

| 成果物                | パス                                                                              | 内容                |
| --------------------- | --------------------------------------------------------------------------------- | ------------------- |
| テストケース一覧      | `outputs/phase-4/test-cases.md`                                                   | TC-01〜TC-15 の詳細 |
| テストファイル（Red） | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` | 全テスト Red 状態   |
| テスト作成記録        | `outputs/phase-4/test-creation-record.md`                                         | Red 確認記録        |

---

## TDD 検証

### TDD サイクル確認

```bash
# テスト実行コマンド（Red 確認）
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

**確認項目**:

- [ ] テストが失敗することを確認（Red 状態）

---

## 統合テスト連携

- `inferSmartDefaults` mock での統合ポイントのテストシナリオを含める
- Wave 1 コンポーネント（SkillInfoStep / ConversationRoundStep / CompleteStep）との統合テストシナリオを含める

---

## 完了条件

- [ ] TC-01〜TC-15 のテストケースが全て作成されていること
- [ ] `inferSmartDefaults` の mock が設計されていること
- [ ] 計装ポイント 5 つのテストが `console.log` spy で設計されていること
- [ ] `pnpm vitest run` で全テストが Red（失敗）であることを確認していること
- [ ] 成果物（test-cases.md / SkillCreateWizard.test.tsx / test-creation-record.md）が作成されていること
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が PASS していること
- **後続**: Phase 5（実装）へ進む

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/W2-seq-03a-skill-create-wizard-2/phase-5-implementation.md`
