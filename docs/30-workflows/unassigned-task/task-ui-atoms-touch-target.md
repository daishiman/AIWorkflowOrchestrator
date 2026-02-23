# UT-UI-ATOMS-TOUCH-TARGET-001 - タスク指示書

## メタ情報

```yaml
issue_number: 885
```

## メタ情報

| 項目         | 値                                                             |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UT-UI-ATOMS-TOUCH-TARGET-001                                   |
| タスク名     | SuggestionBubble size="sm" タッチターゲット Apple HIG 44px準拠 |
| 分類         | 改善                                                           |
| 対象機能     | SuggestionBubbleコンポーネント                                 |
| 優先度       | 低                                                             |
| 見積もり規模 | 小規模                                                         |
| ステータス   | 未実施                                                         |
| 発見元       | TASK-UI-00-ATOMS Phase 10 MINOR指摘 M-2                        |
| 発見日       | 2026-02-22                                                     |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

SuggestionBubble の `size="sm"` は 36px（`h-9`）で実装されており、Apple HIG が推奨する最小タッチターゲット 44px を下回っている。Phase 3 設計レビュー（R-3）で同一指摘があり、`min-h-[44px]` での対応方針が提示されていたが、Phase 5 実装時に反映されなかった。デフォルトサイズ（md: 44px）は基準を満たしている。

### 1.2 問題点・課題

- `size="sm"` のタッチターゲットが 36px で Apple HIG 推奨の 44px を 8px 下回る
- タッチデバイスでの操作性が低下し、誤タップの原因となる
- Phase 3 で指摘・方針決定されたにもかかわらず、Phase 5 で追跡が欠落し未反映のまま残存した

### 1.3 放置した場合の影響

- モバイル・タッチデバイスでの UX が低下し、ユーザーの誤タップが増加する
- Apple HIG 非準拠としてデザインレビューで再度指摘される
- Phase 3 指摘の追跡漏れパターンが他コンポーネントにも波及するリスクがある

## 2. 何を達成するか（What）

### 2.1 目的

`size="sm"` のタッチターゲットを Apple HIG 44px 推奨に合致させるか、非合致の理由をドキュメントに明確に記載する。

### 2.2 最終ゴール

sm サイズのタッチ操作が改善された状態、または密度優先 UI オプションとしての明確な許容理由がドキュメント化された状態。

### 2.3 スコープ（含むもの / 含まないもの）

**含むもの:**

- SuggestionBubble `size="sm"` のタッチターゲット改善（CSS 修正またはドキュメント対応）
- 関連テストの更新
- デザインシステム仕様書への反映

**含まないもの:**

- md / lg サイズの変更（既に 44px 以上で基準合致）
- 他コンポーネントのタッチターゲット改善
- SuggestionBubble の機能追加・API 変更

### 2.4 成果物

| #   | 成果物                          | パス                                                                                    |
| --- | ------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | SuggestionBubble コンポーネント | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx`                 |
| 2   | テストファイル                  | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/SuggestionBubble.test.tsx` |
| 3   | デザインシステム仕様書更新      | `.claude/skills/aiworkflow-requirements/references/ui-ux-atoms-patterns.md`             |

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-UI-00-ATOMS が完了していること
- SuggestionBubble コンポーネントが `index.tsx` に実装済みであること

### 3.2 依存タスク

なし

### 3.3 必要な知識

- Apple HIG タッチターゲットガイドライン（44pt 推奨）
- Tailwind CSS のサイズユーティリティ（`h-9`, `h-11`, `min-h-[44px]`）
- CSS 疑似要素（`::before`）によるヒットエリア拡張テクニック
- React コンポーネントのサイズバリアント設計パターン

### 3.4 推奨アプローチ

以下の 3 つの選択肢から方針を決定する:

**方針 1: 視覚的サイズ 36px 維持 + タッチ領域のみ 44px 確保（推奨）**

- `::before` 疑似要素でヒットエリアを 44px に拡張する
- 視覚的な密度を維持しつつ、タッチ操作性を改善できる
- 既存の UI レイアウトへの影響が最小限

**方針 2: sm サイズ自体を 44px に変更**

- `h-9`（36px）を `h-11`（44px）に変更する
- 実装が単純だが、視覚的密度が低下し sm と md の差が縮まる

**方針 3: 現状維持 + ドキュメント対応のみ**

- sm を密度優先 UI オプションとしてドキュメントに明記する
- 44px 未満であることを意識的な例外として記録し、許容条件（デスクトップ専用 UI、マウス操作前提）を明示する

## 3.5 実装課題と解決策（親タスクからの教訓）【重要】

### 課題 1: Phase 3 指摘の追跡漏れ

| 項目     | 内容                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------- |
| 課題     | Phase 3 R-3 で「min-h-[44px] で対応」方針が出されていたが、Phase 5 実装時に `h-9`（36px）のまま実装された |
| 発見経緯 | Phase 10 最終レビューで再指摘。Phase 3 → Phase 5 の指摘追跡が欠落していた                                 |
| 解決策   | Phase 3 の指摘事項を Phase 5 のチェックリストに転記する運用を導入する                                     |
| 教訓     | レビュー指摘は Phase 間で追跡可能な形で管理しないと、後続 Phase で見落とされる                            |

### 課題 2: P46（HTMLAttributes Props 型衝突パターン）

| 項目     | 内容                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| 課題     | Atoms 実装で HTML 標準属性との名前衝突が TS2430 エラーを引き起こした                                       |
| 発見経緯 | Badge コンポーネントで `content?: string \| number` が HTML 標準の `content?: string` と衝突               |
| 解決策   | `Omit<React.HTMLAttributes<T>, "conflicting-attr">` で衝突属性を除外する                                   |
| 教訓     | SuggestionBubble の Props 修正時にも同様の衝突リスクがあるため、Props 変更前に HTML 属性との突合確認が必要 |

### 課題 3: P47（CSS 変数テストアサーション）

| 項目     | 内容                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------- |
| 課題     | タッチターゲット関連のスタイル変更時、テスト側の CSS 変数文字列ハードコードが修正コスト増大の原因 |
| 発見経緯 | デザイントークンベースのスタイルテストで、トークン名変更時に全テストの修正が必要になった          |
| 解決策   | スタイル定義を `Record<Size, string>` 型で export し、テストから参照する                          |
| 教訓     | サイズバリアント変更はスタイル定数ファイルの 1 箇所変更で完結させる設計にすべき                   |

### 課題 4: 密度優先 UI の判断基準不明確

| 項目     | 内容                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------- |
| 課題     | 44px 未満のタッチターゲットが「密度優先 UI オプション」として許容される判断基準が明文化されていなかった |
| 発見経緯 | Phase 10 レビューで「密度優先として許容」と判断されたが、基準が暗黙的だった                             |
| 解決策   | 許容条件（デスクトップ専用 UI、マウス操作前提）をドキュメントに明記する                                 |
| 教訓     | Apple HIG からの逸脱は意識的な例外として記録し、理由を明示する                                          |

## 4. 実行手順（Phase 構成）

### Phase 1: 要件定義

- `size="sm"` の使用箇所を特定し、密度優先 UI としての使用パターンを分析する
- タッチデバイスでの使用頻度と影響範囲を評価する
- 3 つの方針から 1 つを選定する

### Phase 2: 設計

- 選定した方針に基づくタッチターゲット拡張方式を設計する
- CSS 疑似要素によるヒットエリア拡張の場合、レイアウトへの影響を検証する
- サイズバリアント定数（`Record<Size, string>`）の設計を行う

### Phase 4: テスト作成

- タッチターゲットサイズのテストケースを設計する
- sm サイズのタッチ領域が 44px 以上であることを検証するテストを作成する
- 方針 3（ドキュメント対応のみ）の場合はテスト変更なし

### Phase 5: 実装

- 選定した方針に基づいて SuggestionBubble コンポーネントを修正する
- サイズバリアント定数を更新する
- 方針 3 の場合はドキュメントへの記載のみ

### Phase 9: 品質検証

- `pnpm lint` / `pnpm typecheck` の通過を確認する
- `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/SuggestionBubble/` が PASS することを確認する

### Phase 12: ドキュメント更新

- `ui-ux-atoms-patterns.md` にタッチターゲット対応の記録を追加する
- デザインシステム仕様書に sm サイズのタッチターゲット仕様を記載する

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `size="sm"` のタッチターゲットが Apple HIG 44px 推奨に合致する、または不合致の理由がドキュメントに明記されている
- [ ] 方針 1 の場合: `::before` 疑似要素で 44px のヒットエリアが確保されている
- [ ] 方針 2 の場合: sm サイズが `h-11`（44px）に変更されている
- [ ] 方針 3 の場合: 密度優先 UI オプションとしての許容理由がドキュメントに記載されている

### 品質要件

- [ ] `pnpm lint` が PASS する
- [ ] `pnpm typecheck` が PASS する
- [ ] `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/SuggestionBubble/` が PASS する
- [ ] P46（HTML 属性衝突）が発生しないことを確認する
- [ ] P47（CSS 変数テストアサーション）パターンに準拠してテストを記述する

### ドキュメント要件

- [ ] `ui-ux-atoms-patterns.md` にタッチターゲット対応の記録が追加されている
- [ ] 方針 3 選択時: 許容条件（デスクトップ専用 UI、マウス操作前提）がドキュメントに明記されている

## 6. 検証方法

### テストケース

| #   | テストケース                                    | 期待結果                                        | 対象方針 |
| --- | ----------------------------------------------- | ----------------------------------------------- | -------- |
| 1   | sm サイズのタッチ領域が 44px 以上               | ヒットエリアの高さが 44px 以上                  | 方針 1,2 |
| 2   | sm サイズの視覚的サイズが維持される（方針 1）   | 要素の `height` が 36px（視覚的サイズ変更なし） | 方針 1   |
| 3   | md / lg サイズに変更がない                      | 既存テストが全て PASS する                      | 全方針   |
| 4   | sm サイズの `h-11` クラスが適用される（方針 2） | `h-11` クラスの存在を確認                       | 方針 2   |

### 検証手順

1. `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/SuggestionBubble/` でユニットテストを実行する
2. `pnpm lint && pnpm typecheck` でコード品質を検証する
3. DevTools でタッチターゲットのサイズをインスペクトし、44px 以上であることを確認する（方針 1, 2 の場合）

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                                                    |
| -------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------- |
| 視覚的サイズ変更による UI レイアウト崩れ     | 中     | 中       | 方針 1（疑似要素）なら視覚変更なし                                      |
| 他コンポーネントへの波及                     | 低     | 低       | SuggestionBubble のみに限定し影響調査を実施する                         |
| P46 パターン（Props 変更時の HTML 属性衝突） | 中     | 低       | Props 追加・変更時に HTML 属性との突合確認を実施する                    |
| Phase 3 指摘の再見落とし                     | 低     | 中       | Phase 5 チェックリストに Phase 3 指摘事項を転記する                     |
| 疑似要素のクリックイベント伝播問題（方針 1） | 中     | 低       | `pointer-events: none` を適切に設定し、親要素へのイベント伝播を検証する |

## 8. 参照情報

### 関連ドキュメント（aiworkflow-requirements）

- `.claude/skills/aiworkflow-requirements/references/ui-ux-atoms-patterns.md` -- Atoms 実装パターン全体
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` -- デザインシステム仕様
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` -- Apple HIG 準拠テーブル
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` -- S12-S17 Atoms パターン
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` -- Section 13 テストパターン
- `.claude/rules/06-known-pitfalls.md` -- P46, P47
- `.claude/rules/01-architecture.md` -- Apple HIG 準拠カラーパレット・タッチターゲット

### 参考資料

- `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx` -- 実装ファイル
- `apps/desktop/src/renderer/components/atoms/SuggestionBubble/SuggestionBubble.test.tsx` -- テストファイル
- `docs/30-workflows/task-ui-00-atoms/outputs/phase-10/final-review-result.md` -- Phase 10 MINOR M-2
- `docs/30-workflows/task-ui-00-atoms/outputs/phase-3/review-summary.md` -- Phase 3 MINOR R-3
- [Apple HIG -- Pointing and clicking](https://developer.apple.com/design/human-interface-guidelines/pointing-and-clicking) -- 44pt タッチターゲット推奨

## 9. 備考

### レビュー指摘の原文

**Phase 10 MINOR M-2:**

> SuggestionBubble size="sm" のタッチターゲットが36px（h-9）でApple HIG推奨44pxを下回る。デフォルト（md: 44px）は基準合致。smは密度優先UIオプションとして許容されるが、min-h-[44px]のタッチターゲット領域確保を検討すべき。

**Phase 3 MINOR R-3:**

> size="sm"（h-9=36px）がApple HIG推奨44pxを下回る。min-h-[44px]による対応方針を提示。

### 補足事項

- Phase 3 で同一指摘があり方針が出されたが、Phase 5 で反映漏れが発生した。Phase 間の指摘追跡が今後の課題
- デフォルト（md）は 44px で基準合致しており、問題は sm サイズのみ
- 方針 1（疑似要素によるヒットエリア拡張）が視覚的影響とタッチ操作性のバランスにおいて最も優れている
