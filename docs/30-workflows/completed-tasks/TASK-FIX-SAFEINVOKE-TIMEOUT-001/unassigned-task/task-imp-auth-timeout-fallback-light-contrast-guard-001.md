# AuthTimeoutFallback ライトテーマ視認性改善 - タスク指示書

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | UT-IMP-AUTH-TIMEOUT-FALLBACK-LIGHT-CONTRAST-GUARD-001 |
| タスク名     | AuthTimeoutFallback ライトテーマ視認性改善            |
| 分類         | 改善                                                  |
| 対象機能     | `AuthTimeoutFallback` / timeout fallback UI           |
| 優先度       | 中                                                    |
| 見積もり規模 | 小規模                                                |
| ステータス   | 未着手                                                |
| 発見元       | TASK-FIX-SAFEINVOKE-TIMEOUT-001 Phase 11 再監査       |
| 発見日       | 2026-03-10                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-FIX-SAFEINVOKE-TIMEOUT-001` の Phase 11 で timeout fallback 画面を再撮影したところ、ライトテーマの `AuthTimeoutFallback` で `リトライ` ボタンの視認性が大きく低下していた。

### 1.2 問題点・課題

- ダークテーマでは `リトライ` が読めるのに、ライトテーマでは視認しづらい
- `AuthTimeoutFallback` の UI 契約「`リトライ` / `設定画面へ` を表示する」を視覚品質面で満たしきれていない
- timeout 発生時の主要復旧導線が見えにくいと、復旧可能性そのものが下がる

### 1.3 放置した場合の影響

- ネットワーク不調時にユーザーが `リトライ` を認識できず、復旧行動が `設定画面へ` に偏る
- light / dark で UI 品質が不一致になり、Phase 11 screenshot を再取得するたびに運用ノイズが出る
- WCAG / コントラスト観点の改善余地が残る

---

## 2. 何を達成するか（What）

### 2.1 目的

ライトテーマでも `AuthTimeoutFallback` の `リトライ` と `設定画面へ` が同等に視認できるよう、スタイルと回帰証跡を改善する。

### 2.2 最終ゴール

- ライトテーマで `リトライ` ボタンが十分なコントラストで視認できる
- ダークテーマの見た目を壊さない
- screenshot 4件のうち timeout fallback 2件を再取得し、差分が説明可能

### 2.3 スコープ

#### 含むもの

- `AuthTimeoutFallback.tsx` のスタイル改善
- 関連テストの更新
- Phase 11 screenshot の再取得
- UI仕様書と lessons への必要最小限の同期

#### 含まないもの

- safeInvoke timeout ロジックそのもの
- AuthGuard の状態遷移ロジック変更
- Settings 公開シェルの構造変更

### 2.4 成果物

| 成果物         | パス                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| UI実装修正     | `apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx`                             |
| 回帰テスト     | `apps/desktop/src/renderer/components/AuthGuard/__tests__/AuthTimeoutFallback.test.tsx`              |
| 手動テスト証跡 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/phase-11/` |
| 仕様同期       | `ui-ux-feature-components.md`, `task-workflow.md`, `lessons-learned.md`                              |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001` の harness / screenshot 導線が利用可能
- `TASK-FIX-SAFEINVOKE-TIMEOUT-001` の Phase 11 証跡を参照できる

### 3.2 依存タスク

| タスクID                                       | タスク名                                                | ステータス           |
| ---------------------------------------------- | ------------------------------------------------------- | -------------------- |
| TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 | AuthGuard タイムアウトフォールバック + Settings認証除外 | ✅ 完了              |
| TASK-FIX-SAFEINVOKE-TIMEOUT-001                | safeInvoke タイムアウト追加                             | ✅ Phase 12 まで完了 |

### 3.3 必要な知識・スキル

- Tailwind + CSS変数
- AuthGuard / SettingsView のハーネス撮影運用
- `validate-phase11-screenshot-coverage.js`

### 3.4 推奨アプローチ

1. `AuthTimeoutFallback.tsx` のライトテーマ色を実測確認する
2. `--accent-primary` / text color / bg color の組み合わせを見直す
3. component test で light / dark 両方の視認性を担保する
4. screenshot を再取得し、既存証跡との差を説明可能にする

### 3.5 実装課題と解決策（親タスクからの教訓）

| 項目     | 内容                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| 課題     | 明示 screenshot 要求があるのに、コードレビューだけでは light theme の視認性差分を検出できなかった            |
| 発見経緯 | `TASK-FIX-SAFEINVOKE-TIMEOUT-001` Phase 11 の `TC-11-01` 目視確認で `リトライ` の視認性低下を確認            |
| 解決策   | 代表UIの dedicated harness screenshot と `view_image` 目視確認を current workflow の完了条件へ含める         |
| 教訓     | 非UIタスクでも、ユーザーが画面検証を明示した場合は影響UIの視覚品質まで確認し、見つかった差分は未タスク化する |

---

## 4. 実行手順

1. `AuthTimeoutFallback.tsx` の className と CSS変数依存を点検する
2. component test で `リトライ` ボタンのスタイル適用を light / dark 両方で確認する
3. `node apps/desktop/scripts/capture-task-authguard-timeout-phase11.mjs` を再実行して証跡を更新する
4. `validate-phase11-screenshot-coverage.js` を再実行する
5. `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` を実績ベースで同期する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ライトテーマで `リトライ` ボタンが視認可能
- [ ] ダークテーマの見た目を維持
- [ ] timeout fallback から Settings への導線を維持

### 品質要件

- [ ] `AuthTimeoutFallback` 関連テストが PASS
- [ ] screenshot coverage validator が PASS
- [ ] light / dark の実画面証跡が更新されている

### ドキュメント要件

- [ ] `task-workflow.md` に完了または継続状況を同期
- [ ] `ui-ux-feature-components.md` に結果を同期
- [ ] `lessons-learned.md` に再利用可能な教訓を残す

---

## 6. 検証方法

| #   | テストケース         | 期待結果                               |
| --- | -------------------- | -------------------------------------- |
| 1   | light theme fallback | `リトライ` が背景/文字ともに視認できる |
| 2   | dark theme fallback  | 既存の視認性を維持する                 |
| 3   | timeout -> settings  | `設定画面へ` 導線が維持される          |
| 4   | screenshot coverage  | `TC-11-01..04` が再度 PASS する        |

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                          |
| ------------------------------------ | ------ | -------- | --------------------------------------------- |
| light theme だけ直して dark が崩れる | 中     | 中       | light / dark 両方を同一ターンで撮影・確認する |
| 色修正が design token 逸脱になる     | 中     | 中       | CSS変数ベースで調整し、ハードコードを避ける   |
| screenshot だけ直り実装が不安定      | 中     | 低       | component test と screenshot の二層で確認する |

---

## 8. 参照情報

| ドキュメント            | パス                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| current workflow 証跡   | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/outputs/phase-11/`                |
| completed workflow 証跡 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/phase-11/` |
| UI仕様                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                      |
| ナビゲーション仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                              |

---

## 9. 備考

- 本タスクは safeInvoke timeout ロジックの不具合ではなく、再監査時に見つかった UI 品質課題の formalization である
- current workflow で見つけたが、修正責務は `AuthTimeoutFallback` コンポーネント側にある
