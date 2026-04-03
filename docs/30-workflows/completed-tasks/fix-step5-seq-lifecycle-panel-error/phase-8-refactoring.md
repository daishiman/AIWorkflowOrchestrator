# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 8                         |
| Phase名    | リファクタリング          |
| 前提Phase  | Phase 7                   |
| 後続Phase  | Phase 9                   |
| ステータス | 完了                      |
| 作成日     | 2026-04-02                |
| 機能名     | fix-lifecycle-panel-error |

---

## 目的

修正箇所のコメント改善と定数化の検討を行い、コードの可読性・保守性を向上させる。

## 背景

1行変更の修正だが、なぜ `currentPhase: 'handoff'` 時にエラーをクリアしないかを将来の開発者が理解できるよう、コメントを追加することを検討する。

---

## 実行タスク

### タスク1: コメント改善の検討

**目的**: 修正箇所の意図を明確にするコメントを追加する。

**実行手順**:

1. `SkillLifecyclePanel.tsx` の修正箇所を確認する
2. 以下のコメント追加を検討する:

```typescript
// currentPhase:'handoff' 時はエラー状態を保持する（fire-and-forget 方式で
// 後続スナップショットが届いてもエラーメッセージが消えないようにする）
if (snapshot.currentPhase !== "handoff") {
  setWorkflowError(null);
}
```

3. コメントが不要な場合（コードが自明な場合）は追加しない
4. 変更内容を `outputs/phase-8/refactoring-log.md` の `対象/Before/After/理由` テーブルに記録する

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`

---

### タスク2: 定数化の検討

**目的**: `'handoff'` 文字列リテラルの定数化を検討する。

**実行手順**:

1. `snapshot.currentPhase` の型定義を確認し、`'handoff'` が型リテラルとして定義されているか確認する
2. 既存コードで `'handoff'` が他箇所で使われているか確認する（定数化の費用対効果判断）
3. 定数化が有益な場合は実施、1箇所だけなら不要と判断して記録する
4. リファクタリング後もテストが全てGreenであることを確認する

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel"
```

**期待される成果物**:

- リファクタリング結果（constants化 or 不要判定）の記録

---

## 参照資料

| 参照資料       | パス                                                                                                  | 内容                   |
| -------------- | ----------------------------------------------------------------------------------------------------- | ---------------------- |
| 修正ファイル   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                  | リファクタリング対象   |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx` | リファクタ後の回帰確認 |

---

## 成果物

| 成果物               | パス                                 | 内容                                     |
| -------------------- | ------------------------------------ | ---------------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 対象/Before/After/理由テーブル形式で記録 |

---

## TDD検証

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel"
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 統合テスト連携

- リファクタ後の統合テスト継続成功を確認する

---

## 完了条件

- [ ] `outputs/phase-8/refactoring-log.md` が作成されている（変更なしの場合も「変更なし・理由」を記録）
- [ ] リファクタリング後もテストが全てGreen
- [ ] 変更内容が `対象/Before/After/理由` テーブル形式で記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜2）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] リファクタリング記録ファイルが生成されていることを確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了し、カバレッジ目標達成済みであること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/fix-step5-seq-lifecycle-panel-error/phase-9-quality-assurance.md`
