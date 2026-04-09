# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 1                                                          |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001                 |
| 機能名     | SkillCreateWizard.tsx 実装（オーケストレーション・Wave 2） |
| 前提Phase  | -                                                          |
| 後続Phase  | Phase 2                                                    |
| 作成日     | 2026-04-08                                                 |
| ステータス | 未実施                                                     |

---

## 目的

新設計の受け入れ基準（AC-01〜AC-07）を確定する。

## 背景

`skill-wizard-redesign-lane` の Wave 0・Wave 1 で個別コンポーネントが完成済みであるが、これらを統合する `SkillCreateWizard.tsx` は旧導線の名残がある。新設計（3 ステップ）に対応するため、受け入れ基準を明確化する必要がある。

---

## 実行タスク

### タスク1: skill-wizard-redesign-lane 設計確定仕様の読み込み

**目的**: 3 ステップ構成・スマートデフォルト統合・計装ポイント 5 つを受け入れ基準に落とし込む

**実行手順**:

1. `skill-wizard-redesign-lane/index.md` の設計確定仕様を読み込む
2. 3 ステップ構成の確認（SkillInfoStep / ConversationRoundStep / CompleteStep）
3. スマートデフォルト統合の要件を確認する
4. NON_VISUAL 計装ポイント 5 つの定義を確認する

**期待される成果物**:

- 設計確定仕様の理解記録

---

### タスク2: 型定義の確認

**目的**: `SkillInfoFormData`・`SmartDefaultResult`・`ConversationAnswers` の型定義を確認する

**実行手順**:

1. `packages/shared/src/types/skillCreator.ts` を確認する（L940〜L1015 付近）
2. `SkillInfoFormData` の全フィールドを確認する
3. `SmartDefaultResult` の構造を確認する
4. `ConversationAnswers` の構造を確認する

**期待される成果物**:

- 型定義確認記録

---

### タスク3: 旧実装の影響範囲分析

**目的**: 旧 `SkillCreateWizard.tsx` の実装を確認し、破壊的変更の影響範囲を特定する

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` を読み込む
2. 旧 state（`description` / `options` / 旧生成モード）の参照箇所を全列挙する
3. `template` 条件分岐を含む全箇所をリストアップする
4. 破壊的変更の影響範囲を確定する

**期待される成果物**:

- `outputs/phase-1/impact-scope-map.md`

---

### タスク4: 受け入れ基準の定義

**目的**: 削除後の動作・新機能の検証基準を定義する

**実行手順**:

1. 以下の受け入れ基準（AC-01〜AC-07）を確定する
2. 各 AC が検証可能な形式で記述されているか確認する
3. `outputs/phase-1/acceptance-criteria.md` に記録する

**受け入れ基準（AC）**:

| AC番号 | 内容                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------- |
| AC-01  | 3 ステップ（Step 0: SkillInfoStep / Step 1: ConversationRoundStep / Step 2: CompleteStep）が動作する |
| AC-02  | Step 0 → Step 1 遷移時に `inferSmartDefaults` が呼び出される                                         |
| AC-03  | `SmartDefaultResult` が Step 1 の `ConversationRoundStep` に Props 経由で渡される                    |
| AC-04  | NON_VISUAL 計装ポイント 5 つが実装される（`console.log` または `trackEvent` スタブ）                 |
| AC-05  | ユニットテストが全 PASS し、カバレッジが 90% 以上となる                                              |
| AC-06  | `pnpm --filter @repo/desktop typecheck` がエラーなし                                                 |
| AC-07  | `pnpm --filter @repo/desktop lint` がエラー・警告なし                                                |

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`
- `outputs/phase-1/requirements-definition.md`

---

## 参照資料

| 参照資料                         | パス                                                                                        | 内容                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| skill-wizard-redesign-lane index | `docs/30-workflows/skill-wizard-redesign-lane/index.md`                                     | レーン設計確定仕様                                           |
| 旧 SkillCreateWizard 実装        | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                          | 破壊的変更の影響範囲確認                                     |
| 共有型定義                       | `packages/shared/src/types/skillCreator.ts`                                                 | SkillInfoFormData / SmartDefaultResult / ConversationAnswers |
| SkillInfoStep                    | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`                       | Step 0 Props 仕様                                            |
| ConversationRoundStep            | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`               | Step 1 Props 仕様                                            |
| CompleteStep                     | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                        | Step 2 Props 仕様                                            |
| アーキテクチャパターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S26, P31, P42, P48                                           |

---

## 成果物

| 成果物         | パス                                         | 内容                                                     |
| -------------- | -------------------------------------------- | -------------------------------------------------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件                                     |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な AC-01〜AC-07                                  |
| 影響範囲マップ | `outputs/phase-1/impact-scope-map.md`        | 旧 state（description/options/旧生成モード）削除影響範囲 |

---

## 統合テスト連携

- 接続要件（Props インターフェース・型契約）を要件に明記する
- `inferSmartDefaults` の呼び出し契約を確認する
- Wave 1 コンポーネントとの Props 互換性を要件に明記する

---

## 完了条件

- [ ] 旧生成モード参照箇所が全て洗い出されていること
- [ ] `description` / `options` 参照箇所が全て洗い出されていること
- [ ] AC-01〜AC-07 が全て定義されていること
- [ ] 各 AC が検証可能な形式で記述されていること
- [ ] Wave 1 コンポーネントの Props 仕様と整合していること
- [ ] `inferSmartDefaults` の型定義との整合が確認されていること
- [ ] 成果物（requirements-definition.md / acceptance-criteria.md / impact-scope-map.md）が作成されていること
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（最初の Phase）
- **後続**: Phase 2（設計）へ進む

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/W2-seq-03a-skill-create-wizard-2/phase-2-design.md`
