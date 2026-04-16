# Phase 12: 実装ガイド

## Part 1: 初学者向け

### 何を直したのか

たとえば、ボタンの色だけ別のメモに書いてあって、部屋の照明を変えてもそのボタンだけ昔の色のままだったら、見た目がちぐはぐになります。
今回の UI 仕上げは、その「ちぐはぐ」を減らすための整理です。

スキルウィザードでは、次の 3 点を整えました。

1. `SkillInfoStep` のカテゴリ選択に上限をつけた
2. スキルウィザード内の色指定を CSS 変数ベースに寄せた
3. `InterviewProgressBar` の進捗変化にアニメーションをつけた

### どういう効果があるのか

- カテゴリを無制限に選べなくなるので、入力が過剰になりにくい
- テーマ変更時に色のズレが起きにくい
- 進捗バーの変化が滑らかに見えるので、質問が進んだことが分かりやすい

### Phase 11 の証跡について

このタスクの作業ツリーでは、Phase 11 の visual evidence を再取得済みです。

参照できるスクリーンショットは次の 4 枚です。

- `../phase-11/screenshots/TASK-SW-UI-POLISH-001-category-limit-light.png`
- `../phase-11/screenshots/TASK-SW-UI-POLISH-001-category-limit-dark.png`
- `../phase-11/screenshots/TASK-SW-UI-POLISH-001-progressbar-light.png`
- `../phase-11/screenshots/TASK-SW-UI-POLISH-001-progressbar-dark.png`

補助証跡として、`../phase-11/phase11-capture-metadata.json`、`../phase-11/screenshot-plan.json`、`../phase-11/manual-test-result.md` も保存済みです。

---

## Part 2: 開発者向け

### 現在のコード事実

| 項目               | 現在値                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| カテゴリ上限       | `SkillInfoStep.tsx` に `MAX_CATEGORY_COUNT = 3` を定義                                               |
| 上限制御           | 未選択カテゴリは上限到達時に `disabled` になる                                                       |
| CSS 変数化         | `SkillInfoStep.tsx` の入力・カテゴリボタンが `--status-primary` / `--text-inverse` を使用            |
| 進捗アニメーション | `InterviewProgressBar.tsx` のバー要素に `transition-all duration-300 ease-in-out` を適用             |
| テスト             | `SkillInfoStep.test.tsx` と `InterviewProgressBar.test.tsx` に上限・アニメーション・回帰テストを追加 |
| Phase 11 証跡      | `../phase-11/phase11-capture-metadata.json` と 4 枚の screenshot を保存済み                          |

### 変更対象の実装方針

#### 1. `SkillInfoStep`

- `handleCategoryClick` で「選択済みなら解除」「未選択なら上限未満のときだけ追加」を分岐
- `isAtLimit` を導入し、未選択ボタンだけを `disabled` にする
- ボタンの状態差分は `transition-all duration-200 ease-in-out` で表現する

#### 2. CSS 変数の整理

- 直接の青系 Tailwind クラスを避け、テーマ変数を優先する
- フォーカス枠も `focus:border-[var(--status-primary)]` に統一する
- 新旧テーマで色の意味が変わらないようにする

#### 3. `InterviewProgressBar`

- `totalQuestions <= 0` を 0% に丸める
- バー要素に `transition-all duration-300 ease-in-out` を付ける
- 幅更新だけで視覚的変化が伝わるようにする

### 実装確認ポイント

| 確認項目     | 期待値                                            |
| ------------ | ------------------------------------------------- |
| カテゴリ選択 | 4 件目は追加されず、既存選択は解除できる          |
| テーマ色     | Wizard 内の主要なボタンと入力が CSS 変数色に揃う  |
| 進捗バー     | `currentQuestion` の変化で滑らかに width が変わる |
| 回帰         | 既存の選択・解除・進行フローが壊れない            |

### 参照するテストの読み方

- `SkillInfoStep.test.tsx` は、カテゴリ上限と解除可否を確認する
- `InterviewProgressBar.test.tsx` は、幅計算と transition クラスの保持を確認する
- `SkillCreateWizard.test.tsx` は、Wizard 系ファイルに `bg-blue-*` が残っていないことの静的監査を担う
- `../phase-11/evidence-index.md` は、Phase 11 の current task 証跡を 1 箇所にまとめる
