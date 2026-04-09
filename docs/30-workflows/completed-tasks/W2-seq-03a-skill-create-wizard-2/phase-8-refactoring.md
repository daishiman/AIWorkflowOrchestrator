# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 8                                                          |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001                 |
| 機能名     | SkillCreateWizard.tsx 実装（オーケストレーション・Wave 2） |
| 前提Phase  | Phase 7                                                    |
| 後続Phase  | Phase 9                                                    |
| 作成日     | 2026-04-08                                                 |
| ステータス | 未実施                                                     |

---

## 目的

コード品質を改善する（テストは全 PASS を維持すること）。

## 背景

Phase 5・6 で TDD Green を達成し、Phase 7 でカバレッジ目標を達成した。本 Phase ではコードの可読性・保守性を改善するリファクタリングを実施する。テストが全 PASS の状態を維持することが前提条件。

---

## 実行タスク

### タスク1: 責務分離の確認

**目的**: オーケストレーション / 状態管理 / 計装の責務が適切に分離されているか確認する

**実行手順**:

1. `SkillCreateWizard.tsx` を読み込み、責務ごとにコードを分類する
2. オーケストレーションロジック（ステップ制御）が一箇所にまとまっているか確認する
3. 状態管理（useState）が明確に定義されているか確認する
4. 計装ポイント（trackEvent スタブ）が整理されているか確認する
5. 必要であれば責務を分離するリファクタリングを実施する

**期待される成果物**:

- 責務分離確認記録（`outputs/phase-8/refactoring-record.md` 内）

---

### タスク2: 変数名・関数名の一貫性確認

**目的**: 命名規則が一貫しているか確認する

**実行手順**:

1. ハンドラ関数の命名（`handle*`）が一貫しているか確認する
2. state 変数の命名が型と一致しているか確認する
3. 計装ポイントのイベント名（`wizard:*`）が一貫しているか確認する
4. 不一致があれば修正する

**期待される成果物**:

- 命名一貫性確認記録

---

### タスク3: 型定義の精度確認

**目的**: `any` 型の排除と型定義の精度向上

**実行手順**:

1. `SkillCreateWizard.tsx` で `any` 型が使用されている箇所を洗い出す
2. 適切な型（`SkillInfoFormData`、`SmartDefaultResult`、`ConversationAnswers`）に置き換える
3. `pnpm --filter @repo/desktop typecheck` でエラーがないことを確認する

**期待される成果物**:

- 型精度確認記録

---

### タスク4: `trackEvent` スタブの整理

**目的**: Wave 3 での差し替えを容易にするため、スタブを整理する

**実行手順**:

1. `trackEvent` スタブ関数を独立した位置に定義されているか確認する
2. Wave 3 で差し替え可能な構造（単一箇所での定義）になっているか確認する
3. スタブのコメントに Wave 3 での差し替え指示を記述する：
   ```typescript
   // TODO(Wave3): trackEvent 本実装に差し替え（W3-seq-04）
   const trackEvent = (event: string, data?: unknown) => {
     console.log(event, data);
   };
   ```

**期待される成果物**:

- `trackEvent` スタブ整理記録

---

### タスク5: リファクタリング結果のテスト確認

**目的**: リファクタリング後も全テストが PASS することを確認する

**実行手順**:

1. `pnpm vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` を実行する
2. 全テストが Green であることを確認する
3. リファクタリング記録を `outputs/phase-8/refactoring-record.md` に記録する

**期待される成果物**:

- `outputs/phase-8/refactoring-record.md`

---

## 参照資料

| 参照資料                   | パス                                                                                        | 内容                           |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 2 設計書             | `outputs/phase-2/component-design.md`                                                       | 元の設計と比較                 |
| Phase 7 カバレッジ結果     | `outputs/phase-7/coverage-result.md`                                                        | リファクタリング前のカバレッジ |
| アーキテクチャパターン P31 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 無限ループ防止                 |
| アーキテクチャパターン P42 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | バリデーション漏れ防止         |
| アーキテクチャパターン P48 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | useShallow 未適用防止          |

---

## 成果物

| 成果物                             | パス                                                               | 内容                     |
| ---------------------------------- | ------------------------------------------------------------------ | ------------------------ |
| リファクタリング済みコンポーネント | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | 品質改善後               |
| リファクタリング記録               | `outputs/phase-8/refactoring-record.md`                            | 変更内容・テスト確認結果 |

---

## TDD 検証

```bash
# リファクタリング後のテスト確認
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 完了条件

- [ ] 責務分離（オーケストレーション / 状態管理 / 計装）が確認されていること
- [ ] 変数名・関数名の一貫性が確認されていること
- [ ] `any` 型が排除されていること
- [ ] `trackEvent` スタブに Wave 3 差し替えのコメントが付与されていること
- [ ] リファクタリング後も全テストが Green であること
- [ ] 成果物（SkillCreateWizard.tsx / refactoring-record.md）が作成されていること
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認・目標達成）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/W2-seq-03a-skill-create-wizard-2/phase-9-quality-assurance.md`
