# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 11                                   |
| タスクID   | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 |
| 機能名     | skill-wizard-mso-main-tool-ui        |
| 前提Phase  | Phase 10（GO）                       |
| 後続Phase  | Phase 12                             |
| 作成日     | 2026-04-13                           |
| ステータス | completed                            |

## タスク分類（Phase 1 宣言に基づく）

**分類: VISUAL（UIタスク）— スクリーンショット証跡が必要**

本タスクは Q5（外部ツール連携）複数選択時の「主ツール」バッジUI表示を実装するタスクである。
UIコンポーネントの変更を含むため、手動テストとスクリーンショット証跡が必須となる。

## 目的

3層評価（Semantic / Visual / AI UX）で実装品質を確認し、AC-1〜AC-6の充足を最終確認する。
スクリーンショット証跡を `outputs/phase-11/screenshots/` に保存する。

## 実行タスク

- アプリ起動確認: Electronアプリが正常起動すること
- Semantic評価: バッジのaria-label妥当性の確認
- Visual評価: バッジのスタイル一貫性・Tailwindトークン使用確認
- AI UX評価: 主ツール概念がユーザーに伝わるかの評価
- スクリーンショット証跡取得: playwright使用

## 参照資料

| 資料名          | パス                                      | 用途                 |
| --------------- | ----------------------------------------- | -------------------- |
| Phase 10 成果物 | `outputs/phase-10/final-review-result.md` | 最終レビュー結果確認 |
| 実装ファイル    | 対象UIコンポーネントファイル              | 実装内容確認         |

## 実行手順

### 1. アプリ起動

```bash
# Electron デスクトップアプリの起動
pnpm --filter @repo/desktop dev
```

起動後、アプリが正常に表示されることを確認する。

### 2. スキル作成ウィザードを開く

1. アプリのメニューまたはサイドバーから「スキル作成」を選択する
2. スキル作成ウィザードが開くことを確認する
3. Q1〜Q4 を適切に入力してQ5（外部ツール連携）まで進む

### 3. Q5でツールを1つ選択 → バッジが表示されないことを確認

1. Q5（外部ツール連携）画面で、ツールを1つだけチェックする
2. 「主ツール」バッジが一切表示されていないことを目視確認する
3. スクリーンショットを取得する（`q5-single-select.png`）

**期待結果**: 選択済みチェックボックスにバッジなし

### 4. Q5でツールを2つ以上選択 → 最初のツールにのみ「主ツール」バッジが表示されることを確認

1. Q5（外部ツール連携）画面で、ツールを2つ以上チェックする
2. 最初にチェックしたツール（`selectedOptions[0]`）にのみ「主ツール」バッジが表示されることを目視確認する
3. 2番目以降のツールにバッジが表示されていないことを確認する
4. スクリーンショットを取得する（`q5-multi-select-badge.png`）

**期待結果**: 先頭の選択肢のみにバッジが表示される

### 5. Q3, Q4, Q6で複数選択 → バッジが表示されないことを確認

1. Q3（複数選択質問）で複数の選択肢をチェックし、「主ツール」バッジが表示されないことを確認する
2. Q4（複数選択質問）で複数の選択肢をチェックし、「主ツール」バッジが表示されないことを確認する
3. Q6（複数選択質問）で複数の選択肢をチェックし、「主ツール」バッジが表示されないことを確認する
4. 各スクリーンショットを取得する（`q3-no-badge.png`, `q4-no-badge.png`, `q6-no-badge.png`）

**期待結果**: Q3, Q4, Q6 では「主ツール」バッジが一切表示されない

### 6. スクリーンショット証跡取得手順（playwright使用）

```bash
# スクリーンショット取得スクリプト（try/finally パターンでポート解放確実化）
SCREENSHOT_DIR="outputs/phase-11/screenshots"
mkdir -p "$SCREENSHOT_DIR"

# playwright を使ったスクリーンショット取得
node -e "
const { chromium } = require('playwright');
(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Q5単数選択スクリーンショット
    await page.goto('http://localhost:3000/skill-wizard');
    // Q5まで進む操作...
    await page.screenshot({ path: '${SCREENSHOT_DIR}/q5-single-select.png', fullPage: true });

    // Q5複数選択スクリーンショット
    await page.screenshot({ path: '${SCREENSHOT_DIR}/q5-multi-select-badge.png', fullPage: true });

    // Q3バッジ非表示スクリーンショット
    await page.screenshot({ path: '${SCREENSHOT_DIR}/q3-no-badge.png', fullPage: true });

    // Q4バッジ非表示スクリーンショット
    await page.screenshot({ path: '${SCREENSHOT_DIR}/q4-no-badge.png', fullPage: true });

    // Q6バッジ非表示スクリーンショット
    await page.screenshot({ path: '${SCREENSHOT_DIR}/q6-no-badge.png', fullPage: true });

    console.log('スクリーンショット取得完了');
  } finally {
    // try/finally パターンでブラウザを必ず終了し、ポートを解放する
    if (browser) {
      await browser.close();
    }
  }
})();
"
```

### 7. 証跡保存先の確認

```bash
ls -la outputs/phase-11/screenshots/
```

以下のファイルが存在することを確認する:

- `q5-single-select.png` — Q5単数選択時のバッジ非表示
- `q5-multi-select-badge.png` — Q5複数選択時の先頭バッジ表示
- `q3-no-badge.png` — Q3複数選択時のバッジ非表示
- `q4-no-badge.png` — Q4複数選択時のバッジ非表示
- `q6-no-badge.png` — Q6複数選択時のバッジ非表示

## 評価観点

### Semantic評価（バッジのaria-label妥当性）

| 評価項目                                                                | 確認方法                                                         | 合格基準                                           |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------- |
| バッジ要素に `aria-label="主ツールとして使用される"` が設定されているか | DOMインスペクタまたはPlaywrightで属性確認                        | `aria-label="主ツールとして使用される"` が存在する |
| スクリーンリーダーで意味が伝わるか                                      | aria-labelが「主ツールとして使用される」として読み上げ可能か確認 | 適切な読み上げテキストが設定されている             |
| バッジが非表示の時はaria-labelも存在しないか                            | 単数選択・他Q複数選択でDOM確認                                   | aria-label付き要素が存在しない                     |

### Visual評価（バッジのスタイル一貫性・Tailwindトークン使用）

| 評価項目                                                       | 確認方法                     | 合格基準                                     |
| -------------------------------------------------------------- | ---------------------------- | -------------------------------------------- |
| バッジがTailwindのユーティリティクラスで実装されているか       | コードレビューでクラス名確認 | カスタムCSSなし、Tailwindトークンを使用      |
| バッジのカラー・サイズが既存UIコンポーネントと統一されているか | スクリーンショットで目視確認 | プロジェクトのデザインシステムに準拠している |
| バッジの表示位置がチェックボックスラベルと整合しているか       | スクリーンショットで目視確認 | テキストとバッジが見やすく配置されている     |

### AI UX評価（主ツール概念がユーザーに伝わるか）

| 評価項目                                             | 確認方法                                   | 合格基準                                            |
| ---------------------------------------------------- | ------------------------------------------ | --------------------------------------------------- |
| 「主ツール」という表現がユーザーに概念を伝えているか | バッジの文言を評価                         | `resolveExternalIntegration` の動作がUIで暗示される |
| 複数選択時に「どれが主ツールか」がひと目でわかるか   | スクリーンショットで評価                   | 先頭項目のバッジが視覚的に目立つ                    |
| 暫定措置であることのユーザー影響が許容範囲か         | バッジ表示がユーザー操作を阻害しないか確認 | バッジが邪魔にならず情報として機能している          |

## 統合テスト連携【必須】

| 判定項目               | 基準                     | 結果 |
| ---------------------- | ------------------------ | ---- |
| Q5複数選択バッジ表示   | 先頭のみにバッジ         | PASS |
| Q5単数選択バッジ非表示 | バッジなし               | PASS |
| Q3/Q4/Q6バッジ非表示   | バッジなし（副作用なし） | PASS |
| Semantic評価           | aria-label正常           | PASS |
| Visual評価             | Tailwindトークン使用     | PASS |
| AI UX評価              | 主ツール概念が伝わる     | PASS |
| スクリーンショット証跡 | 5ファイル保存済み        | PASS |

## 成果物

| 成果物                         | パス                                                     | 説明                         |
| ------------------------------ | -------------------------------------------------------- | ---------------------------- |
| 手動テスト結果                 | `outputs/phase-11/manual-test-result.md`                 | 3層評価結果・操作記録        |
| 手動テストレポート             | `outputs/phase-11/manual-test-report.md`                 | 実施概要・観察結果           |
| 発見課題一覧                   | `outputs/phase-11/discovered-issues.md`                  | Blocker / Note / Info の記録 |
| UIサニティレビュー             | `outputs/phase-11/ui-sanity-visual-review.md`            | 視覚・アクセシビリティ評価   |
| 撮影メタデータ                 | `outputs/phase-11/phase11-capture-metadata.json`         | キャプチャ実行時の証跡情報   |
| 撮影計画                       | `outputs/phase-11/screenshot-plan.json`                  | 撮影対象・状態の定義         |
| カバレッジレポート             | `outputs/phase-11/screenshot-coverage.md`                | 画面カバレッジ達成確認       |
| スクリーンショット（単数選択） | `outputs/phase-11/screenshots/q5-single-select.png`      | AC-2証跡                     |
| スクリーンショット（複数選択） | `outputs/phase-11/screenshots/q5-multi-select-badge.png` | AC-1証跡                     |
| スクリーンショット（Q3）       | `outputs/phase-11/screenshots/q3-no-badge.png`           | 副作用なし証跡               |
| スクリーンショット（Q4）       | `outputs/phase-11/screenshots/q4-no-badge.png`           | 副作用なし証跡               |
| スクリーンショット（Q6）       | `outputs/phase-11/screenshots/q6-no-badge.png`           | 副作用なし証跡               |

## 完了条件

- [ ] アプリ起動・Q5まで遷移確認済み
- [ ] Q5単数選択でバッジが表示されないことを確認済み（AC-2）
- [ ] Q5複数選択で先頭のみにバッジが表示されることを確認済み（AC-1）
- [ ] Q3/Q4/Q6複数選択でバッジが表示されないことを確認済み（副作用チェック）
- [ ] Semantic評価（aria-label）完了（AC-3）
- [ ] Visual評価（Tailwindトークン・スタイル一貫性）完了
- [ ] AI UX評価（主ツール概念の伝達）完了
- [ ] 手動テストレポート・発見課題一覧・UIサニティレビュー・撮影メタデータ・撮影計画・カバレッジレポートが作成済み
- [ ] スクリーンショット5件が `outputs/phase-11/screenshots/` に保存済み（AC-5）
- [ ] 手動テスト結果（`outputs/phase-11/manual-test-result.md`）が作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. アプリ起動確認
2. Q5単数選択テスト（AC-2）
3. Q5複数選択テスト（AC-1）
4. Q3/Q4/Q6副作用チェック
5. Semantic評価（AC-3）
6. Visual評価
7. AI UX評価
8. 手動テストレポート作成
9. 発見課題一覧・UIサニティレビュー作成
10. 撮影メタデータ・撮影計画・カバレッジレポート作成
11. スクリーンショット証跡取得（AC-5）
12. 手動テスト結果ファイル作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 12: ドキュメント更新
