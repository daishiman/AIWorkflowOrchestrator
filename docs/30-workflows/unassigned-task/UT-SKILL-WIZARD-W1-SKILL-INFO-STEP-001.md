# SkillInfoStep.tsx 実装（Step 0: スキル情報入力） - タスク指示書

## メタ情報

```yaml
issue_number: 2012
task_id: UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001
status: open
priority: high
scale: medium
task_type: NON_VISUAL
```

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001                      |
| タスク名     | SkillInfoStep.tsx 実装（Step 0: スキル情報入力）            |
| 分類         | 新機能実装                                                  |
| 対象機能     | スキル作成ウィザード - Step 0（スキル情報入力）             |
| 優先度       | 高（`priority:high`）                                       |
| 見積もり規模 | 中規模（`scale:medium`）                                    |
| ステータス   | 未実施（`status:open`）                                     |
| 発見元       | skill-wizard-redesign-lane Wave 0 完了後                    |
| 発見日       | 2026-04-08                                                  |
| タスク分類   | NON_VISUAL タスク（Renderer 内部の計装のみ / 視覚差分なし） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

スキル作成ウィザード改善レーン（skill-wizard-redesign-lane）の Wave 0 が完了し、
以下の前提条件が揃った：

- **W0-seq-01（型定義）**: `SkillInfoFormData` 型を含む `@repo/shared/types/skillCreator` の
  型定義が Phase 12 close-out まで完了済み。
- **W0-seq-02（推論サービス）**: `inferSmartDefaults` を含む `smartDefaultReasoningService` が
  `@repo/shared` から公開済み。

Wave 0 の完了により、Wave 1 の並列タスクが全て実行可能な状態になった。
`W1-par-02a-skill-info-step`（SkillInfoStep.tsx の実装）はその最初の並列タスクである。

### 1.2 問題点・課題

1. **SkillInfoStep.tsx が未実装**: スキル作成ウィザードの Step 0（スキル名/目的/カテゴリの
   3フィールド入力）を担うコンポーネントが存在しない。ウィザード全体のフローが完成しない。

2. **型定義が活用されていない**: W0-seq-01 で整備した `SkillInfoFormData` 型が
   `@repo/shared/types/skillCreator` に存在するが、これを使用するコンポーネントがない。

3. **Wave 1 の並列実装を待つタスクがある**: `W2-seq-03a-skill-create-wizard`（ウィザード
   オーケストレーション）は `W1-par-02a` + `W1-par-02b` + `W1-par-02c` の全完了後にしか
   着手できない。本タスクのブロックはレーン全体の進行を遅延させる。

### 1.3 放置した場合の影響

- スキル作成ウィザードの Step 0 が存在しないため、ウィザード全体が動作しない。
- Wave 2 の `SkillCreateWizard.tsx` オーケストレーション実装がブロックされ続ける。
- W0 で整備した型定義（`SkillInfoFormData`）が参照されないデッドコードになる。
- Wave 1 の他タスク（02b / 02c / 02d）との統合テストが実施できない。

---

## 2. 何を達成するか（What）

### 2.1 目的

`apps/desktop/src/renderer/components/skill/` に `SkillInfoStep.tsx` を新規作成し、
スキル作成ウィザードの Step 0（スキル名・目的・カテゴリの 3フィールド入力フォーム）を
実装する。

### 2.2 最終ゴール

- `SkillInfoStep` コンポーネントが `SkillInfoFormData` 型を props として受け取り、
  3フィールドのフォームを描画する。
- フォームの変更が `onChange` コールバック経由で親コンポーネントへ通知される。
- Wave 2 の `SkillCreateWizard.tsx` から `<SkillInfoStep>` として import・使用できる。
- `pnpm --filter @repo/desktop typecheck` および関連テストが全て PASS する。

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/renderer/components/skill/SkillInfoStep.tsx` の新規作成
- `SkillInfoFormData` 型（`@repo/shared/types/skillCreator`）を使用した型付き props 設計
- スキル名・目的・カテゴリの 3フィールドフォーム実装（シンプルな入力 UI）
- カテゴリの選択肢は `SkillCategory` 型の値を使用
- 対応するユニットテスト（`__tests__/SkillInfoStep.test.tsx`）
- `wizard/index.ts` または同等のエクスポートファイルへの追加

#### 含まないもの

- Step 1（6問会話ラリー）の実装（W1-par-02b の担当）
- 完了画面の実装（W1-par-02c の担当）
- SkillLifecyclePanel の変更（W1-par-02d の担当）
- スマートデフォルト推論の呼び出し（SkillCreateWizard.tsx または Step 1 側の担当）
- バリデーションの詳細 UI（スキル名のリアルタイムプレビュー等は別タスク）
- Phase 11 スクリーンショット（NON_VISUAL タスクのため不要）

### 2.4 成果物

| 種別     | ファイル                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------- |
| 新規作成 | `apps/desktop/src/renderer/components/skill/SkillInfoStep.tsx`                                     |
| 新規作成 | `apps/desktop/src/renderer/components/skill/__tests__/SkillInfoStep.test.tsx`                      |
| 修正     | `apps/desktop/src/renderer/components/skill/wizard/index.ts`（`SkillInfoStep` のエクスポート追加） |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `W0-seq-01-types-skill-info-form` が Phase 12 完了済みであること
  （`SkillInfoFormData` 型が `@repo/shared/types/skillCreator` から import 可能な状態）
- `W0-seq-02-smart-default-reasoning-service` が Phase 12 完了済みであること
  （`inferSmartDefaults` が `@repo/shared` から公開済みな状態）
- `pnpm install` が完了しており、monorepo のパッケージ解決が正常であること
- `@repo/shared` の TypeScript ビルド設定が Renderer から import できる状態であること

### 3.2 依存タスク

| タスクID                                  | 状態 | 内容                                                               |
| ----------------------------------------- | ---- | ------------------------------------------------------------------ |
| W0-seq-01-types-skill-info-form           | 完了 | `SkillInfoFormData` / `SkillCategory` 型定義（参照元）             |
| W0-seq-02-smart-default-reasoning-service | 完了 | `inferSmartDefaults` サービス公開（間接依存 / 直接 import は不要） |

### 3.3 必要な知識

- React の関数コンポーネントと props 型付け（TypeScript）
- Tailwind CSS による基本的なフォームスタイリング
- `@repo/shared/types/skillCreator` の `SkillInfoFormData` / `SkillCategory` 型の構造
- monorepo 内の `@repo/shared` パッケージからの import 方法（tsconfig paths / Vite alias）
- `useCallback` を用いたフォームイベントハンドラのメモ化
- Vitest + React Testing Library を用いたコンポーネントテストの基本

### 3.4 推奨アプローチ

1. **`SkillInfoFormData` の型構造を確認してから実装を開始する**: `packages/shared/src/types/skillCreator.ts`
   で `SkillInfoFormData` と `SkillCategory` の定義を精読し、フィールド名・型・オプショナル性を把握する。

2. **シンプルなフォームコンポーネントとして実装する**: Step 0 は 3フィールドのみのシンプルな
   フォームである。状態管理は親（後続の `SkillCreateWizard.tsx`）が持ち、`SkillInfoStep` は
   controlled component として実装する（value + onChange の props パターン）。

3. **カテゴリは `<select>` または列挙 UI で実装する**: `SkillCategory` 型の全値を選択肢として
   表示する。既存の wizard コンポーネントのスタイルに合わせた UI にする。

4. **テストは TDD で進める**: Phase 4 でテストを先行作成し（Red）、Phase 5 で実装して Green にする。
   テストはレンダリング確認・フォーム変更イベント確認・型整合を中心にする。

5. **サブpath export の衝突に注意する**: W0-seq-01 の知見により、`SkillInfoFormData` は
   `@repo/shared/types/skillCreator` からの subpath import として閉じている可能性がある。
   root の `@repo/shared` からではなく subpath から import することを確認する。

---

## 4. 実行手順（Phase 1〜13 の概要）

### Phase 構成

| Phase | 名称                  | ステータス | 概要                                                              |
| ----- | --------------------- | ---------- | ----------------------------------------------------------------- |
| 1     | 要件定義              | open       | スコープ・受入条件・コードインベントリ確定                        |
| 2     | 設計                  | open       | コンポーネント設計・props 型・フィールド定義・ファイル一覧確定    |
| 3     | 設計レビュー          | open       | Phase 4 進行可否の判定・CRITICAL / MINOR 指摘分類                 |
| 4     | テスト作成（TDD Red） | open       | テストマトリクス確定・テストファイル先行作成（全テスト Red 状態） |
| 5     | 実装                  | open       | `SkillInfoStep.tsx` 新規作成・エクスポート追加・テスト Green 化   |
| 6     | テスト拡充            | open       | エッジケース・回帰ガード追加                                      |
| 7     | カバレッジ確認        | open       | 変更ファイルの line / branch カバレッジ実測・目標達成確認         |
| 8     | リファクタリング      | open       | 重複除去・命名整理・リファクタリング記録テーブル作成              |
| 9     | 品質検証              | open       | typecheck / lint / test 全通過確認                                |
| 10    | 最終レビュー          | open       | 受入条件（AC）全充足確認・Phase 11 進行可否判定                   |
| 11    | 手動テスト            | open       | NON_VISUAL タスクのため console / mock 出力が主証跡               |
| 12    | ドキュメント更新      | open       | canonical 6 成果物 + step log + 準拠チェック作成                  |
| 13    | PR 作成               | open       | ユーザー明示承認後のみ実施（それまで blocked 維持）               |

---

### Phase 1: 要件定義

**ステータス**: open

#### 目的

タスクの受入条件、タスク分類、コードインベントリを確定する。

#### タスク分類（Phase 1 時点）

- **タスク種別**: NON_VISUAL タスク（Renderer 内部の計装のみ / UI 視覚差分なし）
- **影響 Process**: Renderer（ブラウザ環境）のみ
- **新規追加**: `SkillInfoStep.tsx` / `SkillInfoStep.test.tsx`
- **変更のある既存ファイル**: `apps/desktop/src/renderer/components/skill/wizard/index.ts`

#### 受入条件（AC）

| AC   | 内容                                                                                          |
| ---- | --------------------------------------------------------------------------------------------- |
| AC-1 | `SkillInfoStep.tsx` が `apps/desktop/src/renderer/components/skill/` に存在する               |
| AC-2 | `SkillInfoStep` が `SkillInfoFormData` 型（`@repo/shared/types/skillCreator`）を props に使用 |
| AC-3 | スキル名・目的・カテゴリの 3フィールドが描画される                                            |
| AC-4 | カテゴリは `SkillCategory` 型の全値を選択肢として表示する                                     |
| AC-5 | フォーム変更が `onChange(data: SkillInfoFormData)` コールバックで親へ通知される               |
| AC-6 | `wizard/index.ts` から `SkillInfoStep` が export される                                       |
| AC-7 | `pnpm --filter @repo/desktop typecheck` が PASS する                                          |
| AC-8 | `pnpm --filter @repo/desktop lint` が PASS する                                               |
| AC-9 | `SkillInfoStep.test.tsx` の全テストが PASS する                                               |

#### 手順

1. `packages/shared/src/types/skillCreator.ts` を精読し、`SkillInfoFormData` と `SkillCategory` の
   定義・フィールド名・型・オプショナル性を把握する
2. `apps/desktop/src/renderer/components/skill/wizard/` 配下の既存コンポーネントを確認し、
   命名規則・スタイリングパターン・import パスを把握する
3. `apps/desktop/src/renderer/components/skill/wizard/index.ts` の現在のエクスポート一覧を確認する
4. 受入条件 AC-1〜AC-9 を仕様書に記録する

#### 成果物

- 受入条件（AC）一覧
- コードインベントリ（変更対象ファイル一覧）

#### 完了条件

- AC-1〜AC-9 が明文化されている
- NON_VISUAL タスクとして分類されていることが記録されている

---

### Phase 2: 設計

**ステータス**: open

#### 目的

コンポーネント設計・props 型・フィールド定義・ファイル一覧を確定する。

#### 変更ファイル一覧

| 変更種別 | ファイルパス                                                                  | 変更内容                          |
| -------- | ----------------------------------------------------------------------------- | --------------------------------- |
| 新規作成 | `apps/desktop/src/renderer/components/skill/SkillInfoStep.tsx`                | Step 0 フォームコンポーネント     |
| 新規作成 | `apps/desktop/src/renderer/components/skill/__tests__/SkillInfoStep.test.tsx` | ユニットテスト                    |
| 修正     | `apps/desktop/src/renderer/components/skill/wizard/index.ts`                  | `SkillInfoStep` の re-export 追加 |

#### コンポーネント設計（概要）

```typescript
// props の型設計（実装時に確定）
interface SkillInfoStepProps {
  value: SkillInfoFormData;
  onChange: (data: SkillInfoFormData) => void;
}

// SkillInfoFormData は @repo/shared/types/skillCreator からの subpath import
import type { SkillInfoFormData } from "@repo/shared/types/skillCreator";
```

#### フィールド構成（3フィールド）

| フィールド | 入力 UI   | 型              | 必須 |
| ---------- | --------- | --------------- | ---- |
| スキル名   | text 入力 | `string`        | 必須 |
| 目的       | textarea  | `string`        | 必須 |
| カテゴリ   | select    | `SkillCategory` | 必須 |

#### 手順

1. `SkillInfoFormData` の全フィールドを確認し、Step 0 で扱う 3フィールドを特定する
2. controlled component パターン（value + onChange props）でコンポーネント設計を確定する
3. `SkillCategory` の全値を選択肢として列挙したデザインを確定する
4. 既存の wizard コンポーネントのスタイリングパターンを参照してスタイルを確定する

#### 成果物

- 変更ファイル一覧テーブル（上記）
- コンポーネント props インターフェース設計
- フィールド構成テーブル（上記）

#### 完了条件

- 変更ファイル一覧が「新規作成」「修正」で分類されて記録されている
- props 型設計が確定している

---

### Phase 3: 設計レビュー

**ステータス**: open

#### 目的

Phase 2 の設計が AC を満たし、Phase 4 のテスト作成に進められるかを判定する。

#### レビューチェックリスト

| チェック項目                                                                  | 判定   |
| ----------------------------------------------------------------------------- | ------ |
| `SkillInfoFormData` が subpath export からの import で型衝突なく使用できるか  | 要確認 |
| controlled component（value + onChange）パターンが Wave 2 の設計と整合するか  | 要確認 |
| `SkillCategory` の全値が選択肢として適切に列挙できるか                        | 要確認 |
| 既存の wizard コンポーネントとスタイリングが一貫しているか                    | 要確認 |
| NON_VISUAL 判定として Phase 11 の証跡が console / mock 出力のみで完結できるか | 要確認 |
| AC-1〜AC-9 を全て満たす設計になっているか                                     | 要確認 |
| テスト可能な設計（純粋な controlled component）になっているか                 | 要確認 |

#### 手順

1. Phase 2 の設計資料を精読し、上記チェックリストを評価する
2. CRITICAL 問題（Phase 4 進行不可レベル）があれば Phase 2 へ差し戻す
3. MINOR 問題は未タスク候補として記録し、Phase 4 へ進む

#### 成果物

- 設計レビュー結果（PASS / FAIL）
- MINOR 指摘事項リスト（あれば）

#### 完了条件

- チェックリスト全項目が PASS または MINOR として記録されている
- Phase 4 進行可否が明確に判定されている

---

### Phase 4: テスト作成（TDD Red）

**ステータス**: open

#### 目的

実装前にテストを作成し（TDD Red 状態）、テストマトリクスを確定する。

#### テストマトリクス

| TC    | 対象              | 入力                                  | 期待出力 / 動作                                    | テストファイル           |
| ----- | ----------------- | ------------------------------------- | -------------------------------------------------- | ------------------------ |
| TC-01 | レンダリング確認  | `value` に初期値を渡す                | スキル名・目的・カテゴリの 3フィールドが描画される | `SkillInfoStep.test.tsx` |
| TC-02 | スキル名変更      | スキル名フィールドを変更              | `onChange` が新しい `SkillInfoFormData` で呼ばれる | `SkillInfoStep.test.tsx` |
| TC-03 | 目的変更          | 目的フィールドを変更                  | `onChange` が新しい `SkillInfoFormData` で呼ばれる | `SkillInfoStep.test.tsx` |
| TC-04 | カテゴリ変更      | `<select>` でカテゴリを選択           | `onChange` が新しい `SkillInfoFormData` で呼ばれる | `SkillInfoStep.test.tsx` |
| TC-05 | 選択肢列挙確認    | コンポーネントをレンダリング          | `SkillCategory` の全値が `<option>` として存在する | `SkillInfoStep.test.tsx` |
| TC-06 | props 型整合      | `value` に `SkillInfoFormData` を渡す | TypeScript の型エラーなくコンパイルできる          | `SkillInfoStep.test.tsx` |
| TC-07 | 現在値の表示確認  | `value.skillName = "my-skill"` を渡す | スキル名フィールドに `"my-skill"` が表示されている | `SkillInfoStep.test.tsx` |
| TC-08 | onChange の安定性 | 同じ値で onChange が連続呼ばれる      | 毎回 props の value を基に差分を計算して通知する   | `SkillInfoStep.test.tsx` |
| TC-09 | 空値の処理        | `value` に空文字列フィールドを渡す    | エラーなく描画される                               | `SkillInfoStep.test.tsx` |

#### 手順

1. `apps/desktop/src/renderer/components/skill/__tests__/SkillInfoStep.test.tsx` を新規作成し、
   TC-01〜TC-09 を記述する（Red 状態）
2. `pnpm --filter @repo/desktop vitest run` を実行して全テストが FAIL することを確認する（TDD Red 確認）
3. 命名規則が既存の wizard コンポーネントの camelCase / PascalCase と整合しているか確認する

#### 成果物

- `apps/desktop/src/renderer/components/skill/__tests__/SkillInfoStep.test.tsx`（Red 状態）
- TDD Red 確認のテスト実行ログ

#### 完了条件

- TC-01〜TC-09 がテストファイルとして作成されている
- 全テストが意図した理由（実装がないため）で FAIL している

---

### Phase 5: 実装

**ステータス**: open

#### 目的

Phase 4 で作成したテストを Green にする実装を行う。

#### 実装計画

**新規作成ファイル**:

- `apps/desktop/src/renderer/components/skill/SkillInfoStep.tsx` — Step 0 フォームコンポーネント

**修正ファイル**:

- `apps/desktop/src/renderer/components/skill/wizard/index.ts` — `SkillInfoStep` の re-export 追加

#### 実装タスク一覧

**Task 5-1: `SkillInfoStep.tsx` を新規作成する**

1. `packages/shared/src/types/skillCreator.ts` の `SkillInfoFormData` と `SkillCategory` を
   subpath import で確認する（`@repo/shared/types/skillCreator` からの import）
2. controlled component パターンで `SkillInfoStep` コンポーネントを実装する
3. スキル名（text）・目的（textarea）・カテゴリ（select）の 3フィールドを描画する
4. `SkillCategory` の全値を `<option>` として列挙する
5. 各フィールドの `onChange` で `onChange(newData)` を呼ぶ実装を行う
6. `pnpm --filter @repo/desktop vitest run` で TC-01〜TC-09 が Green になることを確認する

**Task 5-2: `wizard/index.ts` に `SkillInfoStep` を追加する**

1. `apps/desktop/src/renderer/components/skill/wizard/index.ts` を確認する
2. `export { SkillInfoStep } from "../SkillInfoStep"` またはパスを合わせた re-export を追加する
3. `pnpm --filter @repo/desktop typecheck` が PASS することを確認する

#### 成果物

- `apps/desktop/src/renderer/components/skill/SkillInfoStep.tsx`（実装済み）
- 修正済み `wizard/index.ts`
- `pnpm --filter @repo/desktop vitest run` の Green 確認ログ

#### 完了条件

- TC-01〜TC-09 が全て Green になっている
- `pnpm --filter @repo/desktop typecheck` が PASS している

---

### Phase 6: テスト拡充

**ステータス**: open

#### 目的

エッジケース・回帰ガードを追加し、テストの網羅性を高める。

#### 追加テストケース

| TC    | 対象                         | 内容                                                                   |
| ----- | ---------------------------- | ---------------------------------------------------------------------- |
| TC-10 | Wave 2 統合前回帰            | `SkillInfoStep` が wizard/index.ts から re-export されていることを確認 |
| TC-11 | props 欠落時のフォールバック | `onChange` が渡されない場合にエラーにならないか（Optional 時）         |
| TC-12 | カテゴリ選択の初期値         | 初期値として有効な `SkillCategory` が設定されている場合の確認          |
| TC-13 | アクセシビリティ基本確認     | 各フィールドに `label` 要素または `aria-label` が付与されているか      |

#### 手順

1. `SkillInfoStep.test.tsx` に TC-10〜TC-13 を追加する
2. `pnpm --filter @repo/desktop vitest run` で全テストが PASS することを確認する

#### 成果物

- 拡充済み `SkillInfoStep.test.tsx`
- テスト実行 PASS ログ

#### 完了条件

- TC-01〜TC-13 が全て PASS している

---

### Phase 7: カバレッジ確認

**ステータス**: open

#### 目的

変更したファイルの line カバレッジ・branch カバレッジを実測し、品質基準を満たしていることを確認する。

#### カバレッジ対象ファイル（変更ファイルのみ）

| ファイル                                                       | 目標 line | 目標 branch |
| -------------------------------------------------------------- | --------- | ----------- |
| `apps/desktop/src/renderer/components/skill/SkillInfoStep.tsx` | 90%+      | 80%+        |

> 全体カバレッジは参考値。変更ブロックの line / branch 実測を証跡として残すこと。

#### 手順

1. `pnpm --filter @repo/desktop vitest run --coverage` を実行する
2. `SkillInfoStep.tsx` の line / branch カバレッジを記録する
3. 目標未達の場合は Phase 6 へ戻りテストを追加する

#### 成果物

- カバレッジレポート（`outputs/phase-7/coverage-result.md`）

#### 完了条件

- `SkillInfoStep.tsx` が line 90%+ / branch 80%+ を達成している

---

### Phase 8: リファクタリング

**ステータス**: open

#### 目的

実装後の重複除去・命名整理・設計改善を記録する。

#### リファクタリング記録テーブル（実施後に記入）

| 対象             | Before | After | 理由 |
| ---------------- | ------ | ----- | ---- |
| （実施後に記入） |        |       |      |

#### 手順

1. 実装コードを見直し、重複ロジック・不要な `console.log` 等を除去する
2. 命名揺れ（camelCase / PascalCase）を確認し、プロジェクト規則に統一する
3. リファクタリング内容を上記テーブルに記録する
4. `pnpm --filter @repo/desktop vitest run` で全テストが引き続き PASS することを確認する

#### 成果物

- リファクタリング記録テーブル（記入済み）

#### 完了条件

- リファクタリング記録が `対象/Before/After/理由` テーブル形式で残っている
- 全テストが PASS している

---

### Phase 9: 品質検証

**ステータス**: open

#### 目的

typecheck / lint / test の全通過を確認する。

#### 手順

1. `pnpm --filter @repo/desktop typecheck` を実行して PASS を確認する
2. `pnpm --filter @repo/desktop lint` を実行して PASS を確認する
3. `pnpm --filter @repo/desktop vitest run` を実行して全テスト PASS を確認する

#### 成果物

- 品質検証結果レポート（`outputs/phase-9/quality-check-result.md`）

#### 完了条件

- typecheck / lint / test が全て PASS している

---

### Phase 10: 最終レビュー

**ステータス**: open

#### 目的

受入条件（AC-1〜AC-9）の充足確認と、Phase 11 進行可否の判定を行う。

#### 受入条件チェック

| AC   | 内容                                                                                          | 判定   |
| ---- | --------------------------------------------------------------------------------------------- | ------ |
| AC-1 | `SkillInfoStep.tsx` が `apps/desktop/src/renderer/components/skill/` に存在する               | 未確認 |
| AC-2 | `SkillInfoStep` が `SkillInfoFormData` 型（`@repo/shared/types/skillCreator`）を props に使用 | 未確認 |
| AC-3 | スキル名・目的・カテゴリの 3フィールドが描画される                                            | 未確認 |
| AC-4 | カテゴリは `SkillCategory` 型の全値を選択肢として表示する                                     | 未確認 |
| AC-5 | フォーム変更が `onChange(data: SkillInfoFormData)` コールバックで親へ通知される               | 未確認 |
| AC-6 | `wizard/index.ts` から `SkillInfoStep` が export される                                       | 未確認 |
| AC-7 | `pnpm --filter @repo/desktop typecheck` が PASS する                                          | 未確認 |
| AC-8 | `pnpm --filter @repo/desktop lint` が PASS する                                               | 未確認 |
| AC-9 | `SkillInfoStep.test.tsx` の全テストが PASS する                                               | 未確認 |

#### 手順

1. AC-1〜AC-9 を一つずつ確認し、PASS / FAIL を記録する
2. CRITICAL 問題（AC FAIL）があれば対応 Phase へ差し戻す
3. MINOR 問題は未タスク候補として記録し、Phase 11 へ進む

#### 成果物

- 最終レビュー結果（`outputs/phase-10/final-review.md`）

#### 完了条件

- AC-1〜AC-9 が全て PASS している
- Phase 11 への進行が承認されている

---

### Phase 11: 手動テスト（NON_VISUAL タスク）

**ステータス**: open

> **NON_VISUAL タスク**: UI の視覚差分がないため、スクリーンショットは不要。
> console 出力 / mock 出力 / TypeScript コンパイル結果が主証跡となる。

#### 目的

コンポーネントの実装が期待通り動作することを非視覚的証跡（console / mock / type 出力）で確認する。

#### 証跡取得手順

**環境準備**:

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop vitest run --reporter=verbose
```

**NON_VISUAL 証跡一覧**:

| 証跡ID | 確認内容                                                            | 証跡の種類     |
| ------ | ------------------------------------------------------------------- | -------------- |
| NV-01  | typecheck が PASS したログ出力                                      | CLI 出力ログ   |
| NV-02  | `pnpm vitest run --reporter=verbose` で TC-01〜TC-13 が全て PASS    | テスト結果ログ |
| NV-03  | `SkillInfoStep` が `wizard/index.ts` から import できることの型確認 | typecheck ログ |
| NV-04  | `SkillInfoFormData` の全フィールドが props として型解決されること   | typecheck ログ |

#### 成果物

- 手動テスト結果（`outputs/phase-11/manual-test-result.md`）
- CLI 出力ログのテキスト証跡（`outputs/phase-11/console-evidence.md`）

#### 完了条件

- NV-01〜NV-04 が全て実施・記録されている
- 重大な問題（HIGH）がある場合は修正してから次 Phase に進む

---

### Phase 12: ドキュメント更新

**ステータス**: open

#### 目的

canonical 6 成果物 + step log + 準拠チェックを同一 wave で揃える。

#### タスク一覧

| Task     | 内容                              | 主成果物                                                 |
| -------- | --------------------------------- | -------------------------------------------------------- |
| Task12-1 | 実装ガイド作成（Part 1 + Part 2） | `outputs/phase-12/implementation-guide.md`               |
| Task12-2 | システム仕様書更新                | `outputs/phase-12/system-spec-update-summary.md`         |
| Task12-3 | ドキュメント更新履歴作成          | `outputs/phase-12/documentation-changelog.md`            |
| Task12-4 | 未タスク検出レポート作成          | `outputs/phase-12/unassigned-task-detection.md`          |
| Task12-5 | スキルフィードバックレポート作成  | `outputs/phase-12/skill-feedback-report.md`              |
| Task12-6 | Phase 12 準拠チェック作成         | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

#### Task 12-1 実装ガイド構成

**Part 1: 中学生でも理解できる説明**

スキル作成ウィザードでは、最初に「何を作りたいか」を入力する画面があります。
そこで入力するのは次の 3 つです：

1. **スキル名**: 作るスキルの名前（例: `my-slack-bot`）
2. **目的**: このスキルが何をするか（例: 「毎日 Slack に天気を送る」）
3. **カテゴリ**: スキルの種類（例: 「通知系」「コードサポート系」）

この 3 つを入力する画面を「SkillInfoStep（スキル情報ステップ）」と呼びます。

画面が表示されたとき、入力欄は最初は空（または前に入力したデータ）になっています。
入力したデータは「変更があるたびに親の画面に送られる」仕組みになっています。
これは React の「controlled component（管理されたコンポーネント）」パターンと呼ばれ、
「フォームの状態は自分では持たず、親に任せる」設計です。

**Part 2 の詳細は実装完了後に作成する**（実装内容に基づいて更新）。

#### 成果物

| ファイル                                                 | 内容                                               |
| -------------------------------------------------------- | -------------------------------------------------- |
| `outputs/phase-12/implementation-guide.md`               | 実装ガイド Part1（中学生レベル） + Part2（技術者） |
| `outputs/phase-12/system-spec-update-summary.md`         | システム仕様書更新サマリー                         |
| `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴                               |
| `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出レポート（0件でも出力必須）            |
| `outputs/phase-12/skill-feedback-report.md`              | スキルフィードバックレポート（改善点なしでも必須） |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 準拠チェック（root evidence）             |

#### 完了条件

- 上記 6ファイルが全て作成されている
- `outputs/artifacts.json` と `outputs/phase-12/` が同期されている
- lane index（`docs/30-workflows/skill-wizard-redesign-lane/index.md`）の
  `W1-par-02a-skill-info-step` のステータスが更新されている

---

### Phase 13: PR 作成

**ステータス**: open（ユーザー明示承認前は blocked 維持）

> **重要**: PR 作成はユーザーの明示的な承認後のみ実施する。自動実行しない。

#### 目的

実装・テスト・ドキュメント更新が完了した内容を Pull Request として提出する。

#### 手順

1. ユーザーから PR 作成の明示的な承認を得る
2. `git status` / `git diff` / `git log` を確認する
3. コミットメッセージを作成する（Conventional Commits 形式）
4. PR タイトル・本文を作成する
5. `gh pr create` で PR を作成する

#### PR タイトル（案）

```
feat(skill-wizard): W1-par-02a SkillInfoStep.tsx 実装（Step 0: スキル情報入力）
```

#### 完了条件

- ユーザーの承認を得た後に PR が作成されている
- CI が PASS している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-1: `SkillInfoStep.tsx` が `apps/desktop/src/renderer/components/skill/` に存在する
- [ ] AC-2: `SkillInfoFormData` 型（subpath）を props に使用している
- [ ] AC-3: スキル名・目的・カテゴリの 3フィールドが描画される
- [ ] AC-4: `SkillCategory` の全値を選択肢として表示する
- [ ] AC-5: フォーム変更が `onChange(data: SkillInfoFormData)` で親へ通知される
- [ ] AC-6: `wizard/index.ts` から `SkillInfoStep` が export される

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が PASS
- [ ] `pnpm --filter @repo/desktop vitest run` で TC-01〜TC-13 が全て PASS
- [ ] `SkillInfoStep.tsx` の line 90%+ / branch 80%+ カバレッジ

### ドキュメント要件（Phase 12）

- [ ] `outputs/phase-12/implementation-guide.md`（Part1/Part2 両方）
- [ ] `outputs/phase-12/system-spec-update-summary.md`
- [ ] `outputs/phase-12/documentation-changelog.md`
- [ ] `outputs/phase-12/unassigned-task-detection.md`（0件でも出力必須）
- [ ] `outputs/phase-12/skill-feedback-report.md`（改善点なしでも出力必須）
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md`

### 手動テスト要件（Phase 11 NON_VISUAL）

- [ ] NV-01〜NV-04 が全て実施・記録されている
- [ ] CLI 出力ログ証跡が `outputs/phase-11/console-evidence.md` に保存されている

---

## 6. 検証方法

### 自動テスト

```bash
# desktop パッケージの型チェックとテスト
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop vitest run

# verbose モードでテスト結果を確認
pnpm --filter @repo/desktop vitest run --reporter=verbose

# カバレッジ確認
pnpm --filter @repo/desktop vitest run --coverage
```

### 型整合確認

```bash
# @repo/shared の型が正しく解決されることを確認
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
```

---

## 7. リスクと対策

| リスク                                                                  | 影響度 | 発生確率 | 対策                                                                                     |
| ----------------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------------- |
| `SkillInfoFormData` の subpath import で型解決が失敗する                | 高     | 中       | Phase 1 で実際に import を試し、`@repo/shared/types/skillCreator` vs root 経由を確認する |
| `SkillCategory` が `@repo/shared` root から export されず衝突が発生する | 高     | 中       | W0-seq-01 の知見に従い subpath export を使用する（root への拡張を避ける）                |
| `wizard/index.ts` の re-export でパスが合わずビルドエラーになる         | 中     | 低       | Phase 5 で既存の re-export パターンを確認してから追加する                                |
| Wave 2 の `SkillCreateWizard.tsx` との props 契約が合わない             | 中     | 低       | `W2-seq-03a` の仕様書が確定次第、props インターフェースを調整する                        |
| Vitest の jsdom 環境で `<select>` の `onChange` が正しく発火しない      | 低     | 低       | `fireEvent.change` を使用し、`target.value` を正しく設定するテスト実装を行う             |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-wizard-redesign-lane/index.md` — レーン設計・タスク一覧・依存グラフ
- `packages/shared/src/types/skillCreator.ts` — `SkillInfoFormData` / `SkillCategory` 型定義（参照元）
- `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` — 推論サービス（間接依存）
- `apps/desktop/src/renderer/components/skill/wizard/` — 既存ウィザードコンポーネント群（スタイル参照）
- `docs/30-workflows/W0-seq-02-smart-default-reasoning-service/phase-12-documentation.md` — W0-seq-02 Phase 12 close-out（苦戦箇所の源泉）

### 関連タスク

| タスクID                                  | 関係     | 内容                                                                 |
| ----------------------------------------- | -------- | -------------------------------------------------------------------- |
| W0-seq-01-types-skill-info-form           | 直接依存 | `SkillInfoFormData` / `SkillCategory` 型定義（完了）                 |
| W0-seq-02-smart-default-reasoning-service | 間接依存 | `inferSmartDefaults` サービス（完了）                                |
| W1-par-02b-conversation-round-step        | 並列     | ConversationRoundStep.tsx（Step 1）実装                              |
| W1-par-02c-complete-step                  | 並列     | CompleteStep.tsx（完了画面）実装                                     |
| W1-par-02d-lifecycle-panel                | 並列     | SkillLifecyclePanel.tsx 遷移ボタン化                                 |
| W2-seq-03a-skill-create-wizard            | 後続     | SkillCreateWizard.tsx オーケストレーション（本タスク完了後に着手可） |
| UT-FIX-SKILL-NAME-JAPANESE-INPUT-UX-001   | 参考     | スキル名 IME 対応 UX（別タスク / スコープ外）                        |

---

## 9. 備考

### 苦戦箇所【記入必須】

W0-seq-01 / W0-seq-02 の実装から得た以下の知見を本タスクに適用する。

#### 苦戦箇所 1: `@repo/shared` への型追加時の root 衝突問題

| 項目     | 内容                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------ |
| 症状     | `SkillCategory` を `@repo/shared` の root export（`packages/shared/src/index.ts`）に追加しようとすると、既存型と衝突する |
| 原因     | root `index.ts` には多数の型が集約されており、`SkillCategory` などの汎用名が既存の型定義と名前衝突する可能性がある       |
| 対応     | root への拡張を行わず、`@repo/shared/types/skillCreator` からの subpath import に閉じる形で import する                  |
| 再発防止 | `SkillInfoFormData` / `SkillCategory` を使用する際は必ず subpath（`@repo/shared/types/skillCreator`）から import する    |

#### 苦戦箇所 2: NON_VISUAL 判定時の Phase 11 証跡取得方法

| 項目     | 内容                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | NON_VISUAL タスクでは UI スクリーンショットが取得できないため、Phase 11 の証跡をどのように用意するかが不明確になる                    |
| 原因     | Phase 11 テンプレートが「手動テスト = UI 確認 = スクリーンショット」を前提にしており、NON_VISUAL の場合の指針が不明瞭                 |
| 対応     | console / mock 出力・CLI ログ・typecheck 結果を証跡として記録する。`outputs/phase-11/console-evidence.md` に貼り付けることで代替する  |
| 再発防止 | NON_VISUAL タスクの Phase 11 では、テスト実行ログ（verbose）と typecheck ログを証跡ファイルとして保存することを標準手順として明記する |

#### 苦戦箇所 3: Phase 12 canonical 6 成果物の artifacts.json との同期

| 項目     | 内容                                                                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | Phase 12 で 6 成果物を作成しても、`artifacts.json` と `outputs/artifacts.json` のエントリが同期されておらず、CI 検証で差分が検出される  |
| 原因     | 成果物ファイルを手動作成した後、`artifacts.json` の更新を忘れることがある                                                               |
| 対応     | Phase 12 開始時に `artifacts.json` のエントリを先に追記し、実際のファイル作成後にパスが一致していることを確認する                       |
| 再発防止 | Phase 12 実施前に `artifacts.json` の現状を確認し、6 成果物ファイルのエントリを予め登録してから作業を開始する手順を Phase 12 仕様に明記 |

### 補足事項

- 本タスクは skill-wizard-redesign-lane の Wave 1 並列タスク（W1-par-02a）として位置付けられる。
- クリティカルパス上のタスクであり（W0-seq-01 → W1-par-02a → W2-seq-03a → W3-seq-04）、
  完了遅延がレーン全体に影響する。
- Wave 1 の他タスク（02b / 02c / 02d）とは並列実行可能であり、独立して進められる。
- Phase 13（PR 作成）はユーザーの明示的な承認があるまで blocked 状態を維持する。
