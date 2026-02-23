# UT-UI-ATOMS-SPEC-CLARIFICATION-001 - タスク指示書

## メタ情報

```yaml
issue_number: 884
```

## メタ情報

| 項目         | 値                                                                      |
| ------------ | ----------------------------------------------------------------------- |
| タスクID     | UT-UI-ATOMS-SPEC-CLARIFICATION-001                                      |
| タスク名     | SuggestionBubble success-bounceマイクロインタラクション仕様書責務明確化 |
| 分類         | 改善                                                                    |
| 対象機能     | SuggestionBubble / EmptyState コンポーネント                            |
| 優先度       | 低                                                                      |
| 見積もり規模 | 小規模                                                                  |
| ステータス   | 未実施                                                                  |
| 発見元       | TASK-UI-00-ATOMS Phase 10 MINOR指摘 M-3                                 |
| 発見日       | 2026-02-22                                                              |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

仕様書 `00-2-atoms-components.md` の SuggestionBubble セクション「マイクロインタラクション」テーブルに「タップ後: success-bounceアニメーション」と記載されている。しかし実装では SuggestionBubble 単体には bounce アニメーションは存在しない。bounce は EmptyState の `mood="celebrating"` でアイコンラッパーに `animate-bounce` クラスが適用される。

### 1.2 問題点・課題

- 仕様書の記述が曖昧で、SuggestionBubble 単体で bounce を実装すべきか、EmptyState 統合時のみ発動すべきかが不明確
- Phase 11 手動テスト（#21）でも CONDITIONAL 判定となっており、仕様の曖昧さがテスト判定に直接影響している
- Atomic Design において上位コンポーネント（EmptyState）が下位コンポーネント（SuggestionBubble）の振る舞いを制御するパターンが仕様書で明示されていない

### 1.3 放置した場合の影響

- 将来の開発者が SuggestionBubble 単体に bounce アニメーションを実装しようとして無駄な工数が発生する
- 仕様書と実装の乖離により、仕様書全体の信頼性が低下する
- Phase 11 テスト項目の判定基準が不明確なまま残り、品質保証プロセスに悪影響を及ぼす

## 2. 何を達成するか（What）

### 2.1 目的

success-bounce マイクロインタラクションの責務が EmptyState 側にあることを仕様書で明確に記述し、SuggestionBubble との責務分界を定義する。

### 2.2 最終ゴール

仕様書を読んだ 100 人中 100 人が「bounce アニメーションは EmptyState `mood='celebrating'` のアイコンラッパー要素（`<div className="animate-bounce">`）に適用される。SuggestionBubble 単体には不適用」と理解できる状態。

### 2.3 スコープ（含むもの / 含まないもの）

**含むもの:**

- SuggestionBubble セクションのマイクロインタラクション記述修正
- EmptyState セクションの celebrating バリアント記述修正
- Phase 11 テスト項目 #21 の期待結果の仕様修正との整合

**含まないもの:**

- bounce アニメーション実装の追加・変更（コード変更なし）
- 他のマイクロインタラクション（ホバー、フォーカス等）の変更
- SuggestionBubble / EmptyState の Props 型や API の変更

### 2.4 成果物

| #   | 成果物         | パス                                                                                        |
| --- | -------------- | ------------------------------------------------------------------------------------------- |
| 1   | 修正済み仕様書 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` |

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-UI-00-ATOMS が完了していること（Phase 13 まで完了済み）

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- Atomic Design のコンポーネント間責務分離（atoms / molecules / organisms の責務境界）
- CSS アニメーション（`animate-bounce` クラスの動作原理）
- Tailwind CSS のユーティリティクラス体系

### 3.4 推奨アプローチ

1. **SuggestionBubble マイクロインタラクション テーブル修正**: 「タップ後: success-bounce」の記述に注記を追加 — 「EmptyState (`mood="celebrating"`) との統合時にアイコンラッパー要素に適用。SuggestionBubble 単体には不適用」
2. **EmptyState mood バリアント テーブル修正**: `celebrating` の「アニメーション」欄に明記 — 「success-bounce（アイコンラッパー要素 `<div className="animate-bounce">` に適用。SuggestionBubble ではなく EmptyState のアイコン要素がアニメーション対象）」
3. **Phase 11 テスト項目 #21 の期待結果更新**: 仕様修正に合わせて CONDITIONAL → PASS 判定基準を明確化

## 3.5 実装課題と解決策（親タスクからの教訓）【重要】

### 課題1: コンポーネント間責務の不明確化

| 項目     | 内容                                                                                                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題     | 共通仕様セクションの「マイクロインタラクション」テーブルが個別コンポーネント仕様にコピーされた際、アニメーション実装の責務所在が不明確になった                                                                |
| 発見経緯 | Phase 10 で「success-bounce はどのコンポーネントが実装するのか」が不明確と指摘（M-3）。Phase 11 手動テスト #21 でも CONDITIONAL 判定                                                                          |
| 解決策   | 共通仕様を個別仕様に展開する際、責務の所在を「[コンポーネント名]で実装」と明示する注記を付与する                                                                                                              |
| 教訓     | Atomic Design では上位コンポーネント（organisms/molecules）が下位（atoms）の振る舞いを制御するパターンが多い。仕様書では「誰が（コンポーネント）」「何を（アニメーション/状態変更）」するかを明示的に記載する |

### 課題2: 仕様書の曖昧表現

| 項目     | 内容                                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------------------- |
| 課題     | `02-code-quality.md` ルール「仕様書に曖昧表現を使わない」に反し、アニメーション適用対象の要素とコンポーネントが不明確だった |
| 発見経緯 | Phase 10 レビューで「success-bounce」の適用対象が DOM 要素レベルで特定できないと指摘                                        |
| 解決策   | アニメーション対象を「EmptyState のアイコンラッパー要素（`<div className="animate-bounce">`）」と具体的に記載する           |
| 教訓     | マイクロインタラクション仕様では「何の要素に」「どの CSS/アニメーションを」「いつ適用するか」の 3 点を必ず明記する          |

### 課題3: P46（HTMLAttributes Props 型衝突パターン）

| 項目     | 内容                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| 課題     | Atoms 実装全般で発見された HTML 標準属性との名前衝突パターン                                                         |
| 発見経緯 | Badge コンポーネントで `content?: string \| number` が HTML 標準の `content?: string` と衝突し TS2430 エラー発生     |
| 解決策   | `Omit<React.HTMLAttributes<T>, "conflicting-attr">` で衝突属性を除外する                                             |
| 教訓     | 仕様修正時に Props 型の変更は不要だが、将来 SuggestionBubble の Props 拡張時に HTML 標準属性との衝突可能性に留意する |

### 課題4: P47（CSS 変数テストアサーション）

| 項目     | 内容                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------- |
| 課題     | CSS アニメーションクラス（`animate-bounce` 等）のテストアサーション戦略                                                 |
| 発見経緯 | デザイントークン（CSS 変数）を Tailwind arbitrary values で使用した場合、テストで長い文字列比較が必要になり可読性が低下 |
| 解決策   | アニメーション有無をクラス名チェックで検証 — `expect(element).toHaveClass("animate-bounce")`                            |
| 教訓     | CSS アニメーションの検証は「クラス名の存在確認」で十分。アニメーションの視覚的動作は手動テスト（Phase 11）で確認する    |

## 4. 実行手順（Phase 構成）

### Phase 1: 要件定義

- 現状の仕様書記述と実装の乖離点を整理する
- SuggestionBubble / EmptyState 両コンポーネントの実装コードを確認し、bounce アニメーションの実際の適用箇所を特定する

### Phase 5: 実装（仕様書テキストの修正）

- `00-2-atoms-components.md` の SuggestionBubble マイクロインタラクションテーブルを修正する
- `00-2-atoms-components.md` の EmptyState mood バリアントテーブルを修正する

### Phase 9: 品質検証

- 修正後の仕様書をレビューし、曖昧表現が残っていないことを確認する
- 修正内容が実装コードの挙動と一致することを検証する

### Phase 12: ドキュメント更新

- `documentation-changelog.md` に変更内容を記録する
- Phase 11 テスト項目 #21 の期待結果を仕様修正と整合させる

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SuggestionBubble セクションのマイクロインタラクション記述が success-bounce の実際の責務（EmptyState 側）を正確に反映している
- [ ] EmptyState セクションの celebrating バリアントのアニメーション記述がアニメーション対象要素（アイコンラッパー `<div className="animate-bounce">`）を明記している
- [ ] 仕様書の記述と実装コードの挙動に矛盾がない

### 品質要件

- [ ] 曖昧表現（「適切に」「必要に応じて」「など」）が使用されていない
- [ ] 100 人中 100 人が同じ理解で仕様を解釈可能な記述になっている
- [ ] `02-code-quality.md` のコーディング規約に準拠している

### ドキュメント要件

- [ ] Phase 11 テスト項目 #21 の期待結果が仕様修正と整合している
- [ ] 修正箇所が `documentation-changelog.md` に記録されている

## 6. 検証方法

### テストケース

| #   | テストケース                                          | 期待結果                                                                    | 検証方法     |
| --- | ----------------------------------------------------- | --------------------------------------------------------------------------- | ------------ |
| 1   | SuggestionBubble 仕様書のマイクロインタラクション確認 | success-bounce の責務が EmptyState 側であることが明記されている             | 目視レビュー |
| 2   | EmptyState 仕様書の celebrating バリアント確認        | アニメーション対象が「アイコンラッパー要素」と具体的に記載されている        | 目視レビュー |
| 3   | 仕様書と実装コードの整合性確認                        | `EmptyState/index.tsx` の `animate-bounce` 適用箇所と仕様書の記述が一致する | コード比較   |
| 4   | Phase 11 テスト項目 #21 の期待結果確認                | 仕様修正後の期待結果が CONDITIONAL ではなく明確な判定基準を持っている       | 目視レビュー |

### 検証手順

1. 修正済み仕様書を読み、SuggestionBubble のマイクロインタラクションテーブルで bounce の責務所在が明確であることを確認する
2. EmptyState の celebrating バリアントの記述で、アニメーション対象要素が DOM レベルで特定可能であることを確認する
3. `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx` を開き、`animate-bounce` の適用箇所が仕様書の記述と一致することを確認する
4. `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx` を開き、bounce アニメーションが単体実装されていないことを確認する

## 7. リスクと対策

| リスク                                                                       | 影響度 | 発生確率 | 対策                                                                    |
| ---------------------------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------- |
| 仕様修正により他のマイクロインタラクション記述にも曖昧性が発見される         | 低     | 中       | 修正時に全マイクロインタラクションテーブルを一括レビューする            |
| EmptyState 側の celebrating バリアントの実装変更が success-bounce 仕様に影響 | 低     | 低       | EmptyState 変更時に SuggestionBubble 仕様書も確認する運用ルールを設ける |
| Phase 11 テスト項目更新漏れ                                                  | 低     | 中       | 完了条件チェックリストに明記済み                                        |

## 8. 参照情報

### 関連ドキュメント（aiworkflow-requirements）

- `.claude/skills/aiworkflow-requirements/references/ui-ux-atoms-patterns.md` — Atoms 実装パターン全体
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` — デザインシステム・マイクロインタラクション定義
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` — Apple HIG 準拠原則
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` — S12-S17 Atoms パターン
- `.claude/rules/02-code-quality.md` — 曖昧表現禁止ルール
- `.claude/rules/06-known-pitfalls.md` — P46, P47

### 参考資料

- `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx` — 実装（bounce 未実装）
- `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx` — 実装（`mood="celebrating"` で `animate-bounce` 適用）
- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` — 仕様書（Task 5, Task 6）
- `docs/30-workflows/task-ui-00-atoms/outputs/phase-10/final-review-result.md` — Phase 10 MINOR M-3
- `docs/30-workflows/task-ui-00-atoms/outputs/phase-11/manual-test-result.md` — Phase 11 テスト #21

## 9. 備考

### レビュー指摘の原文

**Phase 10 MINOR M-3:**

> SuggestionBubble の仕様書に success-bounce マイクロインタラクションが記載されているが、実装では SuggestionBubble 単体に bounce アニメーションなし。bounce は EmptyState `mood="celebrating"` のアイコンラッパーに適用。仕様書の責務記述を明確化すべき。

**Phase 11 手動テスト #21:**

> SuggestionBubble クリック後 success-bounce → CONDITIONAL: EmptyState 統合時のアイコンラッパーで bounce 適用を確認。SuggestionBubble 単体の bounce は仕様との乖離。仕様修正推奨。

### 補足事項

- Atomic Design では上位コンポーネント（EmptyState）が下位コンポーネント（SuggestionBubble）の振る舞いを制御するパターンが自然であり、bounce アニメーションの責務が EmptyState 側にあることは設計原則に合致している
- 本タスクは仕様書修正のみの作業であり、コード変更は不要
- 修正対象の仕様書は `completed-task/` 配下に配置されているため、修正後も同ディレクトリに留める
