# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 6                                                          |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001                 |
| 機能名     | SkillCreateWizard.tsx 実装（オーケストレーション・Wave 2） |
| 前提Phase  | Phase 5                                                    |
| 後続Phase  | Phase 7                                                    |
| 作成日     | 2026-04-08                                                 |
| ステータス | 未実施                                                     |

---

## 目的

エッジケース・境界値テストを追加し、テスト網羅性を高める。

## 背景

Phase 5 で全テスト（TC-01〜TC-15）が Green になった状態から、さらにエッジケースとカバレッジ向上のためのテストを追加する。Phase 7 のカバレッジ目標（90% 以上）を達成するための準備を行う。

---

## 実行タスク

### タスク1: `inferSmartDefaults` フォールバックテスト追加

**目的**: `inferSmartDefaults` が全フィールド null を返す場合のフォールバックテストを追加する

**実行手順**:

1. `inferSmartDefaults` が空の `SmartDefaultResult`（全フィールド null）を返す mock を設定する
2. Step 1 が `smartDefaults=null` の状態で正しく動作することを確認するテストを追加する
3. テストが Green であることを確認する

**期待される成果物**:

- フォールバックテスト追加済みの `SkillCreateWizard.test.tsx`

---

### タスク2: ウィザードクローズ操作テスト追加

**目的**: ウィザードを閉じる（`onClose`）操作のテストを追加する

**実行手順**:

1. `onClose` Props が CompleteStep に渡されることを確認するテストを追加する
2. `onClose` が呼び出された際の動作をテストする
3. テストが Green であることを確認する

**期待される成果物**:

- クローズ操作テスト追加済みの `SkillCreateWizard.test.tsx`

---

### タスク3: ステップ遷移テスト追加

**目的**: Step が連続して進む場合・戻る場合の遷移テストを追加する

**実行手順**:

1. Step 0 → Step 1 → Step 2（CompleteStep）の連続遷移テストを追加する
2. Step 1 → Step 0 への戻る操作テストを追加する（戻るボタンがある場合）
3. テストが Green であることを確認する

**期待される成果物**:

- 遷移テスト追加済みの `SkillCreateWizard.test.tsx`

---

### タスク4: `SkillInfoFormData` 入力パターンテスト追加

**目的**: 最小入力と全入力のテストを追加する

**実行手順**:

1. `SkillInfoFormData` の最小入力（`purpose` のみ）でのテストを追加する
2. `SkillInfoFormData` の全入力でのテストを追加する
3. 各パターンで `inferSmartDefaults` が正しく呼ばれることを確認する

**期待される成果物**:

- 入力パターンテスト追加済みの `SkillCreateWizard.test.tsx`

---

### タスク5: テスト拡充記録の作成

**目的**: Phase 6 で追加したテストを記録する

**実行手順**:

1. 追加したテストケースの一覧を `outputs/phase-6/test-expansion-record.md` に記録する
2. 追加後のテスト数を記録する
3. `pnpm vitest run` で全テストが Green であることを確認する

**期待される成果物**:

- `outputs/phase-6/test-expansion-record.md`

---

## 参照資料

| 参照資料                   | パス                                                                                        | 内容                    |
| -------------------------- | ------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 4 テストケース       | `outputs/phase-4/test-cases.md`                                                             | TC-01〜TC-15 の元テスト |
| 共有型定義                 | `packages/shared/src/types/skillCreator.ts`                                                 | エッジケース設計用      |
| アーキテクチャパターン P42 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | バリデーション漏れ防止  |

---

## 成果物

| 成果物                 | パス                                                                              | 内容               |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------ |
| テスト拡充済みファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` | エッジケース追加後 |
| テスト拡充記録         | `outputs/phase-6/test-expansion-record.md`                                        | 追加テスト一覧     |

---

## 統合テスト連携

- `inferSmartDefaults` フォールバック時の統合テストシナリオを追加する
- ステップ遷移の統合テストシナリオを追加する

---

## 完了条件

- [ ] `inferSmartDefaults` が全フィールド null を返す場合のテストが追加されていること
- [ ] `onClose` 操作のテストが追加されていること
- [ ] Step 連続遷移・戻る操作のテストが追加されていること
- [ ] `SkillInfoFormData` の最小入力・全入力のテストが追加されていること
- [ ] `pnpm vitest run` で全テストが Green であることを確認していること
- [ ] 成果物（SkillCreateWizard.test.tsx / test-expansion-record.md）が作成されていること
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装・Green 状態確認）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/W2-seq-03a-skill-create-wizard-2/phase-7-coverage-check.md`
