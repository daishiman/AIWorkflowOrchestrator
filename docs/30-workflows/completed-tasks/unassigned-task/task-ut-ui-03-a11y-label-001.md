# UT-UI-03-A11Y-LABEL-001: 停止ボタン aria-label 設計仕様不一致修正

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | UT-UI-03-A11Y-LABEL-001                  |
| タスク名     | 停止ボタン aria-label 設計仕様不一致修正 |
| 親タスクID   | TASK-UI-03-AGENT-VIEW-ENHANCEMENT        |
| 分類         | アクセシビリティ改善                     |
| 対象機能     | AgentView - FloatingExecutionBar         |
| 優先度       | 低                                       |
| 見積もり規模 | 極小（30分以内）                         |
| ステータス   | 未実施                                   |
| 発見元       | Phase 10 最終レビュー MINOR #3           |
| 発見日       | 2026-03-07                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-03-AGENT-VIEW-ENHANCEMENT の Phase 5（実装）において、FloatingExecutionBar の停止ボタンに `aria-label="停止"` が設定された。しかし Phase 2 設計書では `aria-label="実行を停止"` と定義されており、設計仕様と実装の間に文言の不一致が存在する。

Phase 10 最終レビューの MINOR #3 指摘として検出された。

### 1.2 問題点

| #   | 問題                              | 現状                    | あるべき姿                  | 影響度 |
| --- | --------------------------------- | ----------------------- | --------------------------- | ------ |
| 1   | aria-label の文言が設計書と不一致 | `aria-label="停止"`     | `aria-label="実行を停止"`   | 低     |
| 2   | テストの期待値も設計書と不一致    | `"停止"` で検証している | `"実行を停止"` で検証すべき | 低     |

### 1.3 放置した場合の影響

- スクリーンリーダー利用者に対し、ボタンの操作対象が曖昧になる。「停止」だけでは「何を停止するのか」が不明瞭であり、「実行を停止」であればエージェント実行の停止であることが明確に伝わる
- 設計仕様と実装の乖離が残り続けることで、今後の保守時に「どちらが正しいのか」判断コストが発生する
- WCAG 2.1 AA の「名前・役割・値」基準（Success Criterion 4.1.2）において、操作の意味が正確に伝わるラベル付けが求められる

### 1.4 TASK-UI-03 実装時の苦戦箇所と教訓

| 項目         | 内容                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| **課題**     | Phase 5 実装時に aria-label の文言を「停止」と簡略化して設定し、Phase 2 設計書の定義「実行を停止」と乖離した          |
| **原因**     | Phase 9 品質検証で aria-label の文言が設計書と一致しているかのチェックが漏れた                                        |
| **教訓**     | aria-label の文言は設計書で定義された正確な表現を使用すべき。品質検証時に設計書の a11y 定義との突合チェックを実施する |
| **再発防止** | Phase 9 品質検証チェックリストに「aria-label / aria-labelledby の文言が Phase 2 設計書と一致するか確認」を追加する    |

---

## 2. 何を達成するか（What）

### 2.1 目的

FloatingExecutionBar の停止ボタンの `aria-label` を Phase 2 設計書の定義どおり「実行を停止」に修正し、設計仕様と実装の整合性を回復する。

### 2.2 最終ゴール

- 停止ボタンの `aria-label` が設計書と一致している
- スクリーンリーダーで「実行を停止」と読み上げられる
- 関連テストが修正後の文言で PASS する

### 2.3 スコープ

#### 含むもの

- `FloatingExecutionBar.tsx` の `aria-label` 値の修正
- `FloatingExecutionBar.test.tsx` のテスト期待値の修正

#### 含まないもの

- FloatingExecutionBar のその他の a11y 改善
- 他コンポーネントの aria-label 見直し
- デザインシステムの a11y ガイドライン策定

### 2.4 成果物

| 成果物                        | 説明                                 |
| ----------------------------- | ------------------------------------ |
| 修正済み FloatingExecutionBar | `aria-label="実行を停止"` に修正     |
| 修正済みテストファイル        | テスト期待値を `"実行を停止"` に更新 |

---

## 3. どう実装するか（How）

### 3.1 前提条件

- TASK-UI-03-AGENT-VIEW-ENHANCEMENT の Phase 5 実装が完了していること

### 3.2 依存タスク

| タスクID                          | 関係 | 状況 |
| --------------------------------- | ---- | ---- |
| TASK-UI-03-AGENT-VIEW-ENHANCEMENT | 先行 | 完了 |

### 3.3 修正内容

#### 修正 1: FloatingExecutionBar.tsx

```typescript
// 修正前
<button aria-label="停止" ...>

// 修正後
<button aria-label="実行を停止" ...>
```

#### 修正 2: FloatingExecutionBar.test.tsx

```typescript
// 修正前
expect(stopButton).toHaveAttribute("aria-label", "停止");
// または
screen.getByLabelText("停止");

// 修正後
expect(stopButton).toHaveAttribute("aria-label", "実行を停止");
// または
screen.getByLabelText("実行を停止");
```

### 3.4 実行手順

1. `FloatingExecutionBar.tsx` を開き、停止ボタンの `aria-label="停止"` を `aria-label="実行を停止"` に変更
2. `FloatingExecutionBar.test.tsx` を開き、`"停止"` を参照しているテスト期待値を `"実行を停止"` に変更
3. `pnpm --filter @repo/desktop exec vitest run src/renderer/components/organisms/AgentView/__tests__/FloatingExecutionBar` でテスト実行
4. `pnpm typecheck` で型チェック PASS を確認

---

## 4. 影響範囲

| ファイル                                                                                           | 変更内容              |
| -------------------------------------------------------------------------------------------------- | --------------------- |
| `apps/desktop/src/renderer/components/organisms/AgentView/FloatingExecutionBar.tsx`                | `aria-label` 値の修正 |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/FloatingExecutionBar.test.tsx` | テスト期待値の修正    |

- 他コンポーネントへの影響: なし
- IPC / Store への影響: なし
- 破壊的変更: なし

---

## 5. 参照資料

### 関連ドキュメント

| ドキュメント         | パス                                                                           | 参照理由                |
| -------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| Phase 2 設計書       | `docs/30-workflows/agent-view-enhancement/phase-2-design.md`                   | aria-label の正式定義元 |
| UI/UX デザイン原則   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | アクセシビリティ基準    |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                             | WCAG 2.1 AA 準拠基準    |

### 関連タスク

| タスクID                          | 関係 | 説明                                      |
| --------------------------------- | ---- | ----------------------------------------- |
| TASK-UI-03-AGENT-VIEW-ENHANCEMENT | 親   | AgentView 強化の本体タスク                |
| UT-UI-03-A11Y-DIALOG-001          | 並行 | AdvancedSettingsPanel の dialog role 追加 |
| UT-UI-03-A11Y-RADIOGROUP-001      | 並行 | SkillChip群の radiogroup role 追加        |

---

## 6. 完了条件

### 機能要件

- [ ] `FloatingExecutionBar.tsx` の停止ボタンが `aria-label="実行を停止"` に修正されている
- [ ] スクリーンリーダーで「実行を停止」と読み上げられることが確認できる

### 品質要件

- [ ] `FloatingExecutionBar.test.tsx` のテストが全て PASS する
- [ ] `pnpm typecheck` が PASS する
- [ ] `pnpm lint` が PASS する

### ドキュメント要件

- [ ] 変更内容が PR 説明に記載されている

---

## 7. 備考

### 発見元の原文

```
Phase 10 最終レビュー MINOR #3:
FloatingExecutionBar の停止ボタンの aria-label が「停止」となっているが、
Phase 2 設計書では「実行を停止」と定義されている。設計仕様と一致させること。
```

### 補足事項

- 変更範囲は2ファイル・各1箇所のみで、影響範囲は極めて限定的
- 同じ TASK-UI-03 から派生した他の a11y 未タスク（UT-UI-03-A11Y-DIALOG-001、UT-UI-03-A11Y-RADIOGROUP-001）と同時に対応すると効率的
