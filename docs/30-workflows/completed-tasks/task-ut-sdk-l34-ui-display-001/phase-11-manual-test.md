# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 11                             |
| 機能名 | task-ut-sdk-l34-ui-display-001 |
| 作成日 | 2026-04-03                     |

## 目的

UIタスクのため、Layer別グルーピング表示のUI/UX品質を手動で確認する。
スクリーンショットを撮影し、light/dark両テーマで視覚的品質を検証する。

## タスク分類確認

**Phase 1で記録**: UIタスク（Rendererコンポーネント変更あり）
→ スクリーンショット撮影**必須**、3層評価（Semantic / Visual / AI UX）を実施

## テスト方式（UIタスク）

本Phaseは UI タスクのため、以下 3 系統の証跡を同時に作る。

| 区分           | 正本成果物                                                                               | 目的                                                        | 備考                                                    |
| -------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| チェックリスト | `outputs/phase-11/manual-test-checklist.md`                                              | 「何を」「どのTCで」実施したかの対応表（MT と TC の紐づけ） | **MT-1〜MT-6 と TC-01〜TC-06 の対応が正本**             |
| 結果（実測）   | `outputs/phase-11/manual-test-result.md`                                                 | 手動テストの実行結果（PASS/FAIL と所見）                    | 各 TC に最低 1 つの `.png` 証跡を紐づける               |
| レビュー/所見  | `outputs/phase-11/manual-test-report.md` / `outputs/phase-11/ui-sanity-visual-review.md` | 実施概要、視覚品質（テーマ/色/階層/密度）評価               | `ui-sanity-visual-review.md` は Visual 観点の要約に限定 |

## 実行タスク

- 機能テスト: Layer別グルーピング・アコーディオン・severityアイコンの手動確認
- UI/UXテスト: light/darkテーマでの表示品質確認
- スクリーンショット撮影: 変更コンポーネントの必須UI状態を撮影
- 画面カバレッジ評価: 品質基準との照合

## 参照資料

| 資料名         | パス                                                                        | 説明                         |
| -------------- | --------------------------------------------------------------------------- | ---------------------------- |
| Phase 10成果物 | `outputs/phase-10/final-review-result.md`                                   | 最終レビュー結果             |
| Phase 2設計書  | `outputs/phase-2/design.md`                                                 | 画面設計（UIコンポーネント） |
| Phase 5成果物  | `outputs/phase-5/implementation-summary.md`                                 | 実装差分の把握               |
| Phase 6成果物  | `outputs/phase-6/test-expansion-report.md`                                  | 追加テストの前提             |
| Phase 7成果物  | `outputs/phase-7/coverage-report.md`                                        | カバレッジ確認結果           |
| Phase 8成果物  | `outputs/phase-8/refactoring-report.md`                                     | リファクタリング後の構造     |
| Phase 9成果物  | `outputs/phase-9/quality-report.md`                                         | 品質ゲート結果               |
| 撮影ガイド     | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | 撮影コマンド詳細             |

## Step 1: 変更コンポーネント一覧

```bash
git diff main --name-only -- '*.tsx' '*.jsx' | grep -E '(components|views|pages)/'
```

| #   | コンポーネント                                | 種別 | 配置ルート                        | 表示トリガー                |
| --- | --------------------------------------------- | ---- | --------------------------------- | --------------------------- |
| 1   | SkillLifecyclePanel (verifyDetail セクション) | 変更 | /skill-creator または SkillCenter | verify phase到達時          |
| 2   | VerifyLayerGroup（条件付き新規）              | 新規 | 同上                              | SkillLifecyclePanel内で使用 |

## Step 2: UI状態カバレッジ定義

| 状態                             | 対象コンポーネント      | 優先度   | 該当判定                  |
| -------------------------------- | ----------------------- | -------- | ------------------------- |
| Layer別グルーピング表示（light） | verifyDetailセクション  | [A] 必須 | ✅ 撮影必須               |
| Layer別グルーピング表示（dark）  | verifyDetailセクション  | [A] 必須 | ✅ 撮影必須               |
| Layerが折りたたまれた状態        | アコーディオンヘッダー  | [B] 必須 | ✅ 撮影必須               |
| エラーseverityのLayer（light）   | Layer 4（L4-001 error） | [B] 必須 | ✅ 撮影必須               |
| エラーseverityのLayer（dark）    | Layer 4（L4-001 error） | [B] 必須 | ✅ 撮影必須               |
| checksが空の状態                 | verifyDetailセクション  | [B] 必須 | ✅ 撮影必須               |
| ホバー状態                       | Layerヘッダーボタン     | [C] 推奨 | Electron環境で困難 → N/A  |
| アニメーション中間               | アコーディオン開閉      | [D] 任意 | N/A（アニメーションなし） |

## Step 3: 撮影計画

| テストケース | コンポーネント         | 状態                          | テーマ | ファイル名                         |
| ------------ | ---------------------- | ----------------------------- | ------ | ---------------------------------- |
| TC-01        | verifyDetailセクション | Layer別グルーピング（全展開） | light  | `TC-01-layer-grouped-light.png`    |
| TC-02        | verifyDetailセクション | Layer別グルーピング（全展開） | dark   | `TC-02-layer-grouped-dark.png`     |
| TC-03        | Layerアコーディオン    | Layer3折りたたみ状態          | light  | `TC-03-layer3-collapsed-light.png` |
| TC-04        | severityバッジ         | errorバッジ表示（Layer4）     | light  | `TC-04-error-badge-light.png`      |
| TC-05        | severityバッジ         | errorバッジ表示（Layer4）     | dark   | `TC-05-error-badge-dark.png`       |
| TC-06        | verifyDetailセクション | checks空の状態                | light  | `TC-06-empty-checks-light.png`     |

`manual-test-checklist.md` では、上記 TC-01〜TC-06 と MT-1〜MT-6 の対応を固定し、
撮影ファイルと手動確認結果の紐づけを明示する。

```bash
# 推奨: 撮影計画から一括撮影
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001 \
  --plan outputs/phase-11/screenshot-plan.json
```

### 撮影不可時の代替（例外）

Electron環境でIPCが必要なためVerify Detail表示が困難な場合：

1. `outputs/phase-11/screenshots/NOTE.txt`に理由を記載
2. コンポーネントテストのレンダリング結果をエビデンスとして使用
3. `manual-test-result.md`に「NON_VISUAL_FALLBACK」として記録

## 画面カバレッジマトリクス

**Step 4**: 画面カバレッジマトリクス

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001
```

### TC-ID と証跡ファイルの紐づけ（正本）

`manual-test-result.md` の「スクリーンショットエビデンス」表でも、以下と同じ対応関係を維持する。

| テストケース | 状態                          | テーマ | 証跡ファイル                                                    | 備考 |
| ------------ | ----------------------------- | ------ | --------------------------------------------------------------- | ---- |
| TC-01        | Layer別グルーピング（全展開） | light  | `outputs/phase-11/screenshots/TC-01-layer-grouped-light.png`    | 必須 |
| TC-02        | Layer別グルーピング（全展開） | dark   | `outputs/phase-11/screenshots/TC-02-layer-grouped-dark.png`     | 必須 |
| TC-03        | Layer3 折りたたみ状態         | light  | `outputs/phase-11/screenshots/TC-03-layer3-collapsed-light.png` | 必須 |
| TC-04        | error バッジ表示（Layer4）    | light  | `outputs/phase-11/screenshots/TC-04-error-badge-light.png`      | 必須 |
| TC-05        | error バッジ表示（Layer4）    | dark   | `outputs/phase-11/screenshots/TC-05-error-badge-dark.png`       | 必須 |
| TC-06        | checks 空の状態               | light  | `outputs/phase-11/screenshots/TC-06-empty-checks-light.png`     | 必須 |

### カバレッジ集計（サマリー）

| カバレッジ種別                   | 対象数 | 証跡数 | カバレッジ率 | 基準     |
| -------------------------------- | ------ | ------ | ------------ | -------- |
| コンポーネントカバレッジ         | 2      | {{M}}  | {{%}}        | 100%必須 |
| 表示状態（優先度[A][B]必須項目） | 6      | {{M}}  | {{%}}        | 100%必須 |
| テーマカバレッジ                 | 2      | {{M}}  | {{%}}        | 100%必須 |

**N/A理由テーブル**:

| コンポーネント      | スキップした状態 | N/A理由                             |
| ------------------- | ---------------- | ----------------------------------- |
| Layerヘッダーボタン | ホバー状態       | Playwright非対応環境のため[C]優先度 |
| アコーディオン      | アニメーション中 | アニメーションなし（即時切替）      |

## 手動テストケーステンプレート

| No   | カテゴリ         | テスト項目                               | 前提条件                  | 操作手順                             | 期待結果                                           | 実行結果   |
| ---- | ---------------- | ---------------------------------------- | ------------------------- | ------------------------------------ | -------------------------------------------------- | ---------- |
| MT-1 | UI表示           | Layer別グルーピングが正しく表示される    | verify phaseに到達済み    | Verify Detailパネルを開く            | Layer1〜Layer4のアコーディオングループが表示される | {{RESULT}} |
| MT-2 | インタラクション | Layerヘッダークリックで折りたたみ動作    | Layer別グルーピング表示中 | Layer3ヘッダーをクリック             | Layer3のchecksが非表示になる                       | {{RESULT}} |
| MT-3 | インタラクション | 再クリックで再展開される                 | Layer3折りたたみ状態      | Layer3ヘッダーを再クリック           | Layer3のchecksが再表示される                       | {{RESULT}} |
| MT-4 | severity         | errorアイコン・バッジが正しく表示される  | L4-001 errorを含むverify  | Layer4を確認する                     | `✗`アイコンと赤色バッジが表示される                | {{RESULT}} |
| MT-5 | テーマ           | darkテーマでのバッジ色が正しい           | darkテーマ設定済み        | Verify Detailを確認                  | CSS変数によりerrorが赤、warningが黄で表示される    | {{RESULT}} |
| MT-6 | reverify         | 再検証後もグルーピングが正しく更新される | verify phaseに到達済み    | 「再検証を要求する」ボタンをクリック | 新しいchecksがLayer別に正しくグルーピングされる    | {{RESULT}} |

## 仕様照合チェックリスト（UI/UX変更）

- [ ] カラーパレットがCSS変数（`var(--status-error)`等）を使用している
- [ ] スペーシングがTailwindクラスで統一されている（Phase 2設計と一致）
- [ ] ダークモード・ライトモード両方で確認済み
- [ ] アコーディオンのキーボード操作が可能（アクセシビリティ）

## 統合テスト連携【必須】

| テスト項目       | 確認内容                        | 期待結果           | 実行結果   |
| ---------------- | ------------------------------- | ------------------ | ---------- |
| IPC連携確認      | verifyDetailがIPC経由で届くこと | Layer別表示        | {{RESULT}} |
| reverify後の更新 | verifyDetail更新後のDOM更新     | グルーピング再計算 | {{RESULT}} |

## 成果物

| 成果物                     | パス                                             | 必須 | 説明                                       |
| -------------------------- | ------------------------------------------------ | ---- | ------------------------------------------ |
| 手動テストチェックリスト   | `outputs/phase-11/manual-test-checklist.md`      | ✅   | MT-1〜MT-6 と TC-01〜TC-06 の対応表        |
| テスト結果                 | `outputs/phase-11/manual-test-result.md`         | ✅   | MT-1〜MT-6の手動テスト結果                 |
| 手動テストレポート         | `outputs/phase-11/manual-test-report.md`         | ✅   | 実施概要、結論、リスク、次アクション       |
| 視覚レビュー（UIサニティ） | `outputs/phase-11/ui-sanity-visual-review.md`    | ✅   | テーマ/色/余白/階層の視覚品質レビュー      |
| 発見課題一覧               | `outputs/phase-11/discovered-issues.md`          | ✅   | 発見した課題（0件でも出力）                |
| スクリーンショット         | `outputs/phase-11/screenshots/`                  | ✅   | TC-01〜TC-06のスクリーンショット           |
| 撮影計画                   | `outputs/phase-11/screenshot-plan.json`          | ✅   | 撮影計画（JSON形式）                       |
| カバレッジレポート         | `outputs/phase-11/screenshot-coverage.md`        | ✅   | 画面カバレッジマトリクス結果               |
| キャプチャメタデータ       | `outputs/phase-11/phase11-capture-metadata.json` | ✅   | capture 実行時刻、コマンド、証跡 inventory |

## 完了条件

- [ ] MT-1〜MT-6の手動テストが全て実行済みでPASS
- [ ] `manual-test-checklist.md` に MT-1〜MT-6 と TC-01〜TC-06 の対応が記録されている
- [ ] スクリーンショットTC-01〜TC-06が`outputs/phase-11/screenshots/`に配置済み（または NON_VISUAL_FALLBACK理由を記載）
- [ ] 各TCにスクリーンショット証跡が紐付いている
- [ ] `validate-phase11-screenshot-coverage.js`がPASS（または NON_VISUAL 代替証跡あり）
- [ ] 画面カバレッジの必須項目[A][B]が100%（または N/A理由記録済み）
- [ ] 仕様照合チェックリスト全項目確認済み
- [ ] 発見課題を`discovered-issues.md`に記録している（0件でも出力）
- [ ] **本Phase内の全タスクを100%実行完了**

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001 --phase 11
```

## 次のPhase

Phase 12: ドキュメント更新
