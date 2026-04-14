# TASK-CRON-ERROR-STYLE-UNIFICATION-001 weekly/monthly エラースタイル統一 - タスク指示書

## メタ情報

```yaml
issue_number: 2142
```

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | TASK-CRON-ERROR-STYLE-UNIFICATION-001               |
| タスク名     | weekly/monthly エラースタイル統一                   |
| 分類         | 改善                                                |
| 対象機能     | `VisualCronPicker.tsx`                              |
| 優先度       | 低                                                  |
| 見積もり規模 | 極小規模                                            |
| ステータス   | 未実施                                              |
| 発見元       | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 Phase 11/12 |
| 発見日       | 2026-04-13                                          |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

VisualCronPicker のエラー表示は、weekly が `text-xs`、monthly が `text-sm` になっている。
機能上の問題はないが、同じ役割の alert で見た目のサイズが異なると、UI 全体の一貫性が弱くなる。

### 1.2 問題点・課題

- weekly と monthly の alert でフォントサイズが違う
- スクリーンショットで差分が見えるため、レビュー時に「意図した差か」を確認し続ける必要がある
- 将来のデザイントークン見直し時に、どちらを正とするか曖昧になりやすい

### 1.3 放置した場合の影響

- 見た目の揺れが積み上がり、フォーム全体の品質が下がる
- 仕様書上の文言と実装が一致していても、視覚上の統一感が損なわれる

## 2. 何を達成するか（What）

### 2.1 目的

weekly と monthly のエラーメッセージスタイルを統一し、VisualCronPicker の alert 表示ルールを単純化する。

### 2.2 最終ゴール

- weekly / monthly の alert が同じフォントサイズ・余白ルールで表示される
- スクリーンショットで見たときに、エラー表示の差分が文言のみになる

### 2.3 スコープ

#### 含むもの

- `VisualCronPicker.tsx` の weekly error className 調整
- 必要なら monthly 側も同じトークンへ揃える
- 既存テストとスクリーンショットの再確認

#### 含まないもの

- weekly/monthly の文言変更
- monthly バリデーションロジックの変更
- direct input モードの validation 追加

### 2.4 成果物

- 更新された `VisualCronPicker.tsx`
- 必要に応じた再撮影スクリーンショット
- `outputs/phase-12/unassigned-task-detection.md` の追跡更新

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 が完了済みであること
  - `onValidationChange` コールバックが実装済み
  - `weeklyError` / `monthlyError` の算出ロジックが存在すること

### 3.2 依存タスク

| タスクID                                | 関係                     | ステータス |
| --------------------------------------- | ------------------------ | ---------- |
| TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 | 前提（エラー表示実装元） | 完了済み   |

### 3.3 必要な知識

- **Tailwind CSS テキストサイズユーティリティ**
  - `text-xs`: `font-size: 0.75rem` (12px)
  - `text-sm`: `font-size: 0.875rem` (14px)
  - 同じ役割の UI 要素は同一クラスに揃えるのが原則
- **VisualCronPicker のエラー表示実装**
  - weekly エラー: `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx` 254行目付近
    - 現状: `<p role="alert" className="text-xs text-red-500 mt-1">`
  - monthly エラー: 同ファイル 282行目付近
    - 現状: `<p role="alert" className="text-red-500 text-sm mt-1">`
  - `role="alert"` は両者とも付与済みのため、アクセシビリティに変更なし

### 3.4 推奨アプローチ

`text-sm` を正とし、weekly の `text-xs` を `text-sm` に統一する。

**判断根拠**:

- monthly 側が後から実装されており、その時点で `text-sm` が選ばれた
- フォーム内の他のヘルプテキスト（頻度ラベル・曜日ラベル等）も `text-sm` を使用している
- `text-xs` は「補足的注釈」向けのサイズであり、エラーメッセージの視認性として `text-sm` が適切

**変更箇所（1行のみ）**:

```diff
- <p role="alert" className="text-xs text-red-500 mt-1">
+ <p role="alert" className="text-sm text-red-500 mt-1">
```

## 4. 実行手順

極小規模のため、主要 Phase のみ記述する。

| Phase | 名称         | 内容                                                                                                     | 担当       |
| ----- | ------------ | -------------------------------------------------------------------------------------------------------- | ---------- |
| 1     | 要件確認     | 本タスク仕様書の読み込みと変更箇所の特定                                                                 | 実装者     |
| 4     | テスト確認   | 既存テスト（`VisualCronPicker.validation.test.tsx`）でエラー文言が `role="alert"` で取得されることを確認 | 実装者     |
| 5     | 実装         | `VisualCronPicker.tsx` 254行目の `text-xs` を `text-sm` に変更（1行）                                    | 実装者     |
| 9     | 品質確認     | `pnpm --filter @repo/desktop test` を実行し、既存テストがすべてパスすることを確認                        | 実装者     |
| 10    | レビュー     | diff が1行であることを確認                                                                               | レビュワー |
| 12    | ドキュメント | 本タスク仕様書のステータスを「完了」に更新                                                               | 実装者     |
| 13    | PR作成       | `fix(cron): weekly エラー text-xs → text-sm に統一` のタイトルで PR 作成                                 | 実装者     |

## 5. 完了条件チェックリスト

- [ ] `VisualCronPicker.tsx` の weekly エラー `p` 要素が `text-sm text-red-500 mt-1` になっている
- [ ] monthly エラー `p` 要素が `text-red-500 text-sm mt-1` のまま変更されていない（クラス順は任意）
- [ ] `pnpm --filter @repo/desktop test` が全件パスする
- [ ] ブラウザ（または Electron）上で weekly モード → 曜日を全解除したときにエラー文字サイズが monthly と同じになることを目視確認
- [ ] diff が `VisualCronPicker.tsx` 1ファイル・1行のみであること

## 6. 検証方法

### 6.1 自動テスト

```bash
# デスクトップパッケージのテストを実行
pnpm --filter @repo/desktop test

# 特定テストファイルのみ実行する場合
pnpm vitest run apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx
```

### 6.2 目視確認手順

1. `pnpm --filter @repo/desktop dev` でアプリを起動
2. スケジュール設定画面を開く
3. 頻度を「weekly（毎週）」に切り替える
4. 曜日ボタンをすべてクリックして選択解除する
5. 赤いエラーメッセージ「曜日を1つ以上選択してください」が表示されることを確認
6. 頻度を「monthly（毎月）」に切り替える
7. 日付を空にする、または範囲外の値を入力する
8. 赤いエラーメッセージ「日付は1〜31の範囲で入力してください」が表示されることを確認
9. 手順5と手順8のメッセージのフォントサイズが目視で同一であることを確認

### 6.3 スタイル確認（DevTools）

ブラウザ DevTools で該当 `p` 要素を選択し、`font-size` が両者ともに `14px` (`text-sm` の値) であることを確認する。

## 7. リスクと対策

| リスク                                 | 可能性 | 影響 | 対策                                                                                      |
| -------------------------------------- | ------ | ---- | ----------------------------------------------------------------------------------------- |
| 既存スクリーンショットテストとの差分   | 低     | 低   | スクリーンショットが存在する場合は再撮影して更新する                                      |
| `text-sm` への変更で他のスタイルと競合 | 極低   | 極低 | weekly エラー `p` に付与されているクラスは `text-xs text-red-500 mt-1` のみであり競合なし |
| monthly 側を変更してしまうミス         | 低     | 低   | diff を1行に限定し、レビュー時に確認する                                                  |

## 8. 参照情報

- **主要実装ファイル**: `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`
  - weekly エラー: 254行目付近（`text-xs text-red-500 mt-1`）
  - monthly エラー: 282行目付近（`text-red-500 text-sm mt-1`）
- **関連タスクディレクトリ**: `docs/30-workflows/TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001/`
  - `phase-5-implementation.md` — エラー表示実装の詳細
  - `phase-12-documentation.md` — 未タスク検出記録
- **テストファイル**: `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`
- **Tailwind CSS 公式ドキュメント**: https://tailwindcss.com/docs/font-size

## 9. 備考

### 発見の経緯

TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 の Phase 11（手動テスト）および Phase 12（ドキュメント）において、
weekly と monthly のエラー `p` 要素のクラスを並べて確認したときに不統一が発覚した。
週次バリデーション実装（Phase 5 前半）と月次バリデーション実装（Phase 5 後半）が別々の作業単位で行われたため、
スタイルの統一ルールが共有されなかったことが原因である。

### 苦戦箇所【記入必須】

| 項目     | 内容                                                                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | weekly エラーが `text-xs`、monthly エラーが `text-sm` でフォントサイズが異なる                                                                             |
| 原因     | 別々の実装フェーズで追加されたため、統一ルールが存在しなかった                                                                                             |
| 対応     | Phase 12 未タスク検出フローで発見し、本タスクとして formalize した                                                                                         |
| 再発防止 | エラーメッセージの共通スタイルクラスをデザイントークンまたは定数（例: `ERROR_TEXT_CLASS = "text-sm text-red-500 mt-1"`）として定義し、複数箇所で再利用する |
