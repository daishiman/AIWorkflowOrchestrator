# useFeaturedSkills ensureCategoryDiversity アルゴリズム改善 - タスク指示書

## メタ情報

```yaml
issue_number: 1944
task_id: TASK-IMP-USEFEATURESKILLS-001
task_name: useFeaturedSkills ensureCategoryDiversity アルゴリズム改善
category: UX改善（アルゴリズム）
target_feature: SkillCenterView - おすすめスキル選定
priority: low
scale: 小規模
status: 未実施
source: TODOコメント解消パック
created_date: 2026-04-06
dependencies: []
```

| 項目         | 値                                                         |
| ------------ | ---------------------------------------------------------- |
| タスクID     | TASK-IMP-USEFEATURESKILLS-001                              |
| タスク名     | useFeaturedSkills ensureCategoryDiversity アルゴリズム改善 |
| 分類         | UX改善（アルゴリズム）                                     |
| 対象機能     | SkillCenterView - おすすめスキル選定フック                 |
| 優先度       | 低                                                         |
| 見積もり規模 | 小規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | TODOコメント解消パック                                     |
| 発見日       | 2026-04-06                                                 |
| 依存タスク   | なし                                                       |

---

## 1. Why

### 1.1 背景

`apps/desktop/src/renderer/views/SkillCenterView/hooks/useFeaturedSkills.ts` の `ensureCategoryDiversity` 関数（行 73）に以下のTODO(human)コメントが残存している：

```typescript
// TODO(human): ensureCategoryDiversity の選定アルゴリズムを
// ユーザーフィードバックに基づいて改善する。
// 現在はスコア順 + カテゴリ上限の単純なアルゴリズム。
```

現在の実装は「popularityスコア降順ソート → 同カテゴリ最大2件の制約」という2パスアルゴリズムである。このアルゴリズムは動作するが、ユーザーがおすすめに期待する「真の多様性」を保証しない可能性がある。

例えばスキルが特定カテゴリに偏在している場合、カテゴリ上限制約のみでは多様なカテゴリからの選出が保証されない。また、popularity スコアが agents / references / indexes の総数という粗い近似であるため、実際の有用性を反映していない可能性がある。

### 1.2 問題点・課題

現行アルゴリズムの具体的な課題：

1. **カテゴリ推論の精度**: `inferCategory` は `description` 文字列のキーワードマッチのみで推論しており、スキルのカテゴリ情報が正確でない場合がある。例えば "build" という単語が description に含まれるだけで `development` に分類される。

2. **多様性の偏り**: 同カテゴリ最大2件の制約があるが、全スキルが "other" カテゴリに分類される場合は多様性制約が機能しない。

3. **popularity の粗さ**: `computePopularity` は agents + references + indexes の総数を使うが、インポート済みユーザー数や評価スコアなどのより直接的な人気指標がないため、実際の有用性を反映していない。

4. **パス2の設計**: まず多様性パスで選択し、不足分を `skipped`（カテゴリ上限超え）で補完する。このため maxCount が小さい（デフォルト3件）場合、多様性よりスコアが優先されることがある。

### 1.3 放置した場合の影響

- TODO(human) コメントが恒久的に残存し、「改善すべきと認識しているが手を付けていない」状態が続く
- SkillCenter の「おすすめ」欄に同じカテゴリのスキルが並び続け、ユーザーへの発見価値が低下する可能性がある
- アルゴリズムの改善方針が文書化されず、将来の担当者が再設計しにくくなる

---

## 2. What

### 2.1 達成目標

- `ensureCategoryDiversity` のアルゴリズムを改善し、TODO(human) コメントを削除する
- 改善内容を決定するにはユーザビリティテストが理想だが、本タスクでは「合理的なデフォルト改善」として以下を実施する：
  - カテゴリの分散を強化する（最大件数が許す限り、異なるカテゴリから選出する）
  - "other" カテゴリへの過剰集中を防ぐロジックを追加する

### 2.2 最終ゴール

1. `TODO(human)` コメントが削除されている
2. `ensureCategoryDiversity` が「可能な限り異なるカテゴリから選出する」動作を行う
3. 既存テスト（`useFeaturedSkills.test.ts` 等）が全件 PASS する
4. `pnpm --filter @repo/desktop typecheck` および `pnpm --filter @repo/desktop lint` がエラーなし

### 2.3 スコープ

#### 含むもの

- `useFeaturedSkills.ts` の `ensureCategoryDiversity` アルゴリズム改善
- `inferCategory` の精度改善（必要に応じて）
- アルゴリズム変更に対応するテスト追加・修正

#### 含まないもの

- popularity スコアの計算方法の抜本的変更（`computePopularity` の仕様変更は別タスク）
- SkillMetadata への新規フィールド追加
- バックエンド側のスキル人気度 API の追加

---

## 3. How

### 3.1 調査フェーズ

1. `useFeaturedSkills.ts` の現行アルゴリズムを精読し、動作を理解する
2. 既存テストファイルを確認する：
   - `apps/desktop/src/renderer/views/SkillCenterView/hooks/__tests__/useFeaturedSkills.test.ts`（存在する場合）
3. 実際のスキルデータを確認し、カテゴリ分布の偏りを把握する
4. `maxPerCategory = 2` という定数値の根拠を確認する

### 3.2 改善方針の決定

以下のアプローチから選択する（優先度順）：

**アプローチ A（推奨）: カテゴリ最大1件への変更**

- `maxPerCategory` を 2 → 1 に変更し、`maxCount`（デフォルト3件）の範囲で異なるカテゴリから選出する
- スキル数が少なくカテゴリが不足する場合のみ、パス2でカテゴリ重複を許す

**アプローチ B: "other" カテゴリへの追加制約**

- `inferCategory` が "other" を返すスキルには優先度ペナルティを与え、明示的なカテゴリを持つスキルを優先する
- カテゴリ推論の精度が低いスキルを後回しにする

**アプローチ C: ラウンドロビン選出**

- カテゴリごとにグループ化し、各グループから1件ずつラウンドロビンで選出する
- popularity は各グループ内でのソートに使用する

### 3.3 実装フェーズ

1. 選択したアプローチに従い `ensureCategoryDiversity` を修正する
2. `TODO(human)` コメントを削除し、新しいアルゴリズムの説明をJSDocコメントとして記述する
3. アルゴリズム変更に対応するテストケースを追加または修正する

### 3.4 検証フェーズ

```bash
# useFeaturedSkills 関連テスト
pnpm --filter @repo/desktop test useFeaturedSkills

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

---

## 4. 苦戦箇所と知見（重要）

### 苦戦箇所 1: 「多様性」の定義が主観的

TODO(human) コメントが「ユーザーフィードバックに基づいて改善する」と述べているように、何が最適な多様性アルゴリズムかはユーザビリティテストなしには客観的に定まらない。

**知見**: 本タスクでは「ユーザビリティテストの代替として合理的なデフォルトを設定する」という割り切りが重要。完璧なアルゴリズムを目指すより、「明らかに悪い状態（全件同カテゴリ）を防ぐ」という最低保証に焦点を当てると実装範囲が絞れる。

TODO(human) を削除する際には「このアルゴリズムはユーザーフィードバック待ちの暫定版」というニュアンスを JSDoc に残し、将来の改善のフックを維持する。

### 苦戦箇所 2: カテゴリ推論の精度限界

`inferCategory` はキーワードマッチのみで分類しており、スキルの `description` が短い・英語・技術用語を使用しないケースでは大半が "other" になる。カテゴリ推論の精度が低いと、多様性アルゴリズムを改善しても実効的な変化が生まれない。

**知見**: `inferCategory` の改善と `ensureCategoryDiversity` の改善は実質的に連動している。カテゴリ推論の精度を上げずに多様性ロジックだけ変えても効果が限定的。ただし `inferCategory` の網羅的改善は別タスクとして切り出し、本タスクでは最低限の修正（"other" 過剰集中の軽減）に留める。

### 苦戦箇所 3: maxCount が小さい（3件）場合の動作

デフォルトの `maxCount = 3` の場合、3件のスキルを異なるカテゴリから選出しようとすると、スキル全体で3カテゴリ以上存在することが前提になる。実際には "development" と "other" の2カテゴリしかない場合、3件目は必ず重複カテゴリになる。

**知見**: アルゴリズム改善時は「カテゴリが不足する場合でも maxCount 件を必ず返す」フォールバックを維持することが必須。パス2（スキップされたスキルで埋める）の仕組みは改善後も保持する。

### 苦戦箇所 4: テストの期待値変更

アルゴリズムを変更すると、既存テストが「特定のスキルが選ばれること」を期待している場合に FAIL する可能性がある。特に `maxPerCategory` を変更すると、同カテゴリの2件目が選ばれなくなる。

**知見**: テスト修正は実装変更後に行うが、「アルゴリズムの仕様変更なのか、バグなのか」を明確にしてから修正する。テストが失敗した場合は、失敗内容を記録し、新アルゴリズムの意図に沿った期待値へ修正する。

---

## 5. 依存関係

### 上流（このタスクが依存するもの）

なし（独立して実施可能）

### 下流（このタスクの完了を待つもの）

なし（アルゴリズム改善であり、他機能への影響なし）

### 参照ドキュメント

| ドキュメント                             | パス                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| useFeaturedSkills フック実装             | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useFeaturedSkills.ts`                |
| useFeaturedSkills テスト（存在する場合） | `apps/desktop/src/renderer/views/SkillCenterView/hooks/__tests__/useFeaturedSkills.test.ts` |
| SkillCenterView 本体                     | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                                 |
