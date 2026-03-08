# Phase 11 スクリーンショット自動取得基盤 - タスク指示書

## メタ情報

```yaml
issue_number: 1068
```

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | UT-FIX-PHASE11-SCREENSHOT-AUTOMATION-001             |
| タスク名     | Phase 11 スクリーンショット自動取得基盤              |
| 分類         | 改善                                                 |
| 対象機能     | Phase 11 手動テスト証跡取得                          |
| 優先度       | 中                                                   |
| 見積もり規模 | 中規模                                               |
| ステータス   | 未実施                                               |
| 発見元       | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 Phase 11 |
| 発見日       | 2026-03-08                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

- TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 の Phase 11 で、Apple UI/UX エンジニアとしての視覚検証にスクリーンショットが必要だったが、CLI 環境では Electron アプリの実画面キャプチャができなかった
- 自動テスト結果を「間接的な視覚検証」として代替記録したが、UI/UXの品質保証としては不十分
- 今後のタスクでも Phase 11 は繰り返し実行されるため、毎回手動でスクリーンショットを取得するのは非効率

### 1.2 問題点

- CLI環境（ssh接続、CI/CD）ではGUIが利用できない
- 現状の Phase 11 仕様書は「スクリーンショット取得」を前提としているが、取得手段が標準化されていない
- 取得したスクリーンショットのファイル命名・配置先・メタデータ形式も統一されていない

### 1.3 放置した場合

- Phase 11 の視覚検証が毎回「間接検証」で終わり、実際のUI不具合を見逃すリスク
- Apple HIG 準拠の検証が形骸化

---

## 2. 何を達成するか（What）

### 2.1 目的

CLI環境から1コマンドでElectronアプリのスクリーンショットを自動取得できるスクリプト基盤を構築する。

### 2.2 最終ゴール

- `pnpm --filter @repo/desktop screenshot:phase11 --task-id TASK-XXX` で Phase 11 のテストシナリオに対応するスクリーンショットを自動取得
- 取得画像は `docs/30-workflows/{{TASK_ID}}/outputs/phase-11/screenshots/` に保存
- メタデータJSON（取得日時、画面サイズ、テストシナリオID）を同時生成

### 2.3 スコープ

**含むもの:**

- Electron の `webContents.capturePage()` を利用したスクリーンショット取得スクリプト
- headless モードでの Electron 起動設定
- 取得画像のファイル命名規則とメタデータ生成
- Phase 11 テンプレートへのスクリーンショットスクリプト実行手順の追記

**含まないもの:**

- Playwright E2E テスト基盤の構築（別タスク UT-FIX-SETTINGS-APIKEY-E2E-001）
- 画像の差分比較（Visual Regression Testing）
- CI/CDパイプラインへの統合

---

## 3. どう実装するか（How）

### 3.1 実装方針

- Electron の `BrowserWindow` を headless で起動し、指定画面に遷移後 `capturePage()` でキャプチャ
- 各テストシナリオをJSON設定ファイルで定義し、順番にナビゲーション→キャプチャ→保存
- Linux環境では `xvfb-run` でヘッドレス実行

### 3.2 修正対象ファイル

| ファイルパス                                                            | 操作 | 内容                                |
| ----------------------------------------------------------------------- | ---- | ----------------------------------- |
| `apps/desktop/scripts/capture-screenshots.mjs`                          | 新規 | スクリーンショット取得スクリプト    |
| `apps/desktop/scripts/screenshot-scenarios.json`                        | 新規 | シナリオ定義                        |
| `apps/desktop/package.json`                                             | 更新 | `screenshot:phase11` スクリプト追加 |
| `.claude/skills/task-specification-creator/assets/phase-11-template.md` | 更新 | スクリーンショット取得手順追記      |

### 3.3 実装手順

1. Electron headless 起動ヘルパーを作成
2. `capturePage()` ラッパーを実装（画面遷移→待機→キャプチャ→保存）
3. シナリオJSON定義（画面名、ナビゲーションパス、待機セレクタ）
4. メタデータ生成（timestamp, viewport, scenarioId）
5. pnpm スクリプト登録
6. Phase 11 テンプレートに手順追記

---

## 4. 受入基準

- [ ] `pnpm --filter @repo/desktop screenshot:phase11` が正常終了する
- [ ] 設定画面（Settings View）のスクリーンショットが PNG 形式で保存される
- [ ] メタデータ JSON が同ディレクトリに生成される
- [ ] Linux 環境で `xvfb-run` 経由で実行可能
- [ ] macOS/Linux 両環境で同一コマンドで動作する

---

## 5. テスト計画

- スクリプト自体の単体テスト（PNG 生成確認、メタデータ形式検証）
- CI 環境での実行テスト（xvfb-run 経由）
- 生成画像のサイズ・形式検証

---

## 6. リスク・注意事項

- Electron のバージョンアップで `capturePage()` の API が変更される可能性
- headless モードでは一部のCSSアニメーションが異なる挙動を示す場合がある
- BrowserWindow のサイズ設定がOS環境によって異なる（Retina/非Retina）

---

## 7. 関連タスク・参照資料

### 関連タスク

| タスクID                                    | 関連内容                                                 |
| ------------------------------------------- | -------------------------------------------------------- |
| TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 | このタスクの Phase 11 で問題が顕在化                     |
| UT-FIX-SETTINGS-APIKEY-E2E-001              | E2E テスト基盤（本タスクとは独立だが、将来的に統合可能） |

### 参照資料（aiworkflow-requirements）

| 仕様書                       | 参照内容                                                |
| ---------------------------- | ------------------------------------------------------- |
| `06-known-pitfalls.md` P53   | CLI 環境でのスクリーンショット取得制約                  |
| `06-known-pitfalls.md` P51   | サブエージェントの documentation-changelog 早期完了記載 |
| `quality-e2e-testing.md`     | Playwright E2E テスト設計方針                           |
| `ui-ux-design-principles.md` | Apple HIG 準拠の視覚検証基準                            |

---

## 8. 備考

### 苦戦箇所（TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 からの教訓）

1. **CLI環境の限界（P53）**: SSH/CI環境ではGUIウィンドウを表示できないため、Electronアプリの画面キャプチャには headless モードまたは仮想フレームバッファ（xvfb）が必須。Phase 11 仕様書で「スクリーンショットを取って検証」と指示されても、実行環境の制約で不可能だった

2. **間接検証の品質限界**: 自動テスト58件全PASSを「間接的な視覚検証」としたが、テストでは「要素が存在すること」は検証できても「レイアウトが崩れていないこと」「色・フォントが正しいこと」は検証できない。実画面のスクリーンショットとApple HIG基準の目視チェックは代替不可能

3. **Phase 11テンプレートの環境非依存化不足**: 現在のPhase 11テンプレートは「GUIが使える」前提で書かれている。CLI専用の代替手順を標準化すべき

### 補足

- 本タスクは Phase 11 の再現性・品質を向上させるインフラ改善であり、特定の機能タスクに依存しない
- 将来的には Visual Regression Testing（VRT）との統合も視野に入れるが、本タスクのスコープ外
