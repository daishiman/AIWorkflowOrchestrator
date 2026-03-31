# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 11                                  |
| 機能名 | session-resume-renderer-integration |
| 作成日 | 2026-03-29                          |

## タスク種別判定（最初に確認）

| タスク種別 | 判定条件                                | 判定     |
| ---------- | --------------------------------------- | -------- |
| UI タスク  | Renderer コンポーネントの追加・変更あり | **該当** |

判定理由: `SkillLifecyclePanel.tsx` への統合と新規 UI コンポーネント追加がスコープに含まれるため。

## 目的

自動テストでは検証できないユーザー体験・UI/UX・実環境動作を手動で確認し、UI/UX品質の問題を発見・修正する。

## 実行タスク

- 機能テスト: 正常系/異常系/境界値/状態遷移の手動検証
- UI/UXテスト: レイアウト/レスポンシブ/アクセシビリティ確認
- 統合テスト: IPC/セッション復元/復元フローの手動確認
- リグレッションテスト: 既存スキル作成フローへの影響確認
- UI/UX品質評価: 全画面状態の撮影→品質基準で評価→問題発見→修正→再検証

## 参照資料

| 資料名       | パス                                              | 説明                 |
| ------------ | ------------------------------------------------- | -------------------- |
| index.md     | `index.md`                                        | 受入基準             |
| Phase 2 設計 | `phase-2-design.md`                               | 画面/データフロー    |
| ガイド       | `references/phase-11-12-guide.md`                 | 手順・形式           |
| 撮影ガイド   | `references/phase-11-screenshot-guide.md`         | 撮影規定             |
| 視覚検証     | `references/screenshot-verification-procedure.md` | Apple UI/UX 視覚確認 |

## テストカテゴリ

- **機能テスト**: 正常系/異常系/境界値/状態遷移
- **UI/UXテスト**: レイアウト/アクセシビリティ/視覚整合
- **統合テスト**: IPC/復元フロー/データ整合
- **リグレッションテスト**: 既存導線の崩れ確認

## スクリーンショット撮影ガイドライン

### 適用判断

UI 変更を含むため **必須**。

### 撮影規定

| 項目           | 規定                                        |
| -------------- | ------------------------------------------- |
| 命名規則       | `TC-{番号}-{状態ラベル}-{テーマ}.png`       |
| 配置先         | `outputs/phase-11/screenshots/`             |
| 必須タイミング | 操作後の結果状態 / エラー状態               |
| 紐付け規定     | `manual-test-result.md` の各 TC に最低 1 枚 |

### 撮影コマンド

```bash
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/step-10-seq-task-p0-08-session-resume-renderer-integration \
  --plan outputs/phase-11/screenshot-plan.json
```

### 網羅性検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/step-10-seq-task-p0-08-session-resume-renderer-integration
```

## 画面カバレッジマトリクス

### Step 1: 変更コンポーネント一覧

| #   | コンポーネント                            | 種別 | 配置ルート | 表示トリガー                          |
| --- | ----------------------------------------- | ---- | ---------- | ------------------------------------- |
| 1   | SkillLifecyclePanel                       | 変更 | /skill     | セッション復元フロー開始 / エラー表示 |
| 2   | SessionResumePrompt                       | 新規 | /skill     | 未完了セッション検出                  |
| 3   | SessionIndicator                          | 新規 | /skill     | アクティブセッション表示              |
| 4   | SkillLifecyclePanel 内 session list state | 変更 | /skill     | セッション一覧取得後                  |

### Step 2: UI状態カバレッジ

| 状態               | 説明                               | 該当判定       |
| ------------------ | ---------------------------------- | -------------- |
| デフォルト表示     | 初期表示                           | **必須**       |
| データあり表示     | セッション一覧あり                 | **必須**       |
| 非表示状態         | セッションなし時に prompt 非表示   | **必須**       |
| ローディング中     | IPC 呼び出し中                     | **必須**       |
| エラー表示         | 復元失敗時のパネルエラー           | **該当時必須** |
| 成功フィードバック | 復元成功後の SessionIndicator 表示 | **該当時必須** |
| 無効化状態         | 非互換時の復元不可                 | **該当時必須** |

### Step 3: 撮影計画（manual-test-result.md に記載）

| テストケース | コンポーネント      | 状態       | 撮影方法                       | テーマ | ファイル名                |
| ------------ | ------------------- | ---------- | ------------------------------ | ------ | ------------------------- |
| TC-01        | SessionResumePrompt | デフォルト | route: /skill                  | light  | `TC-01-default-light.png` |
| TC-02        | SessionResumePrompt | デフォルト | route: /skill --dark           | dark   | `TC-02-default-dark.png`  |
| TC-03        | SessionResumePrompt | データあり | route: /skill                  | light  | `TC-03-data-light.png`    |
| TC-04        | SessionResumePrompt | 非表示状態 | route: /skill                  | light  | `TC-04-hidden-light.png`  |
| TC-05        | SkillLifecyclePanel | エラー表示 | route: /skill + resume failure | light  | `TC-05-error-light.png`   |
| TC-06        | SessionIndicator    | 進行中     | route: /skill                  | light  | `TC-06-active-light.png`  |

### Step 4: 画面カバレッジレポート（screenshot-coverage.md に記載）

| カバレッジ種別 | 対象数 | 撮影数 | カバレッジ率 | 基準         |
| -------------- | ------ | ------ | ------------ | ------------ |
| コンポーネント | N      | M      | %            | **100%必須** |
| 表示状態       | N      | M      | %            | **100%必須** |
| テーマ         | N      | M      | %            | **100%必須** |
| 総合           | N      | M      | %            | **100%必須** |

## 統合テスト連携

| テスト項目     | 確認内容        | 期待結果 | 実行結果   |
| -------------- | --------------- | -------- | ---------- |
| IPC取得        | 一覧/詳細取得   | 取得成功 | {{RESULT}} |
| 復元           | resume/continue | 復元成功 | {{RESULT}} |
| フォールバック | 非互換時        | 新規開始 | {{RESULT}} |
| クリーンアップ | TTL 超過        | 削除成功 | {{RESULT}} |

## テストケーステンプレート

| No    | カテゴリ | テスト項目         | 前提条件             | 操作手順 | 期待結果       | 実行結果   | スクリーンショット | 備考 |
| ----- | -------- | ------------------ | -------------------- | -------- | -------------- | ---------- | ------------------ | ---- |
| TC-01 | UI       | 復元プロンプト表示 | 未完了セッションあり | 起動     | プロンプト表示 | {{RESULT}} | TC-01              |      |

## 成果物

| 成果物           | パス                                             | 必須 | 説明                |
| ---------------- | ------------------------------------------------ | ---- | ------------------- |
| テスト結果       | `outputs/phase-11/manual-test-result.md`         | 必須 | 手動テスト結果      |
| テスト報告       | `outputs/phase-11/manual-test-report.md`         | 必須 | 実施概要と所見      |
| 発見課題一覧     | `outputs/phase-11/discovered-issues.md`          | 必須 | 課題（0件でも出力） |
| 視覚レビュー     | `outputs/phase-11/ui-sanity-visual-review.md`    | 必須 | UI/UX視覚確認       |
| 撮影計画         | `outputs/phase-11/screenshot-plan.json`          | 必須 | 撮影計画            |
| 証跡             | `outputs/phase-11/screenshots/`                  | 必須 | 画面証跡            |
| 画面カバレッジ   | `outputs/phase-11/screenshot-coverage.md`        | 必須 | カバレッジ結果      |
| capture metadata | `outputs/phase-11/phase11-capture-metadata.json` | 必須 | 証跡インベントリ    |

## 完了条件

- [ ] すべてのテストケースが実行済み
- [ ] すべてのテストケースが PASS
- [ ] 統合テスト手動確認が完了
- [ ] UI/UX対象タスクとして撮影計画と証跡が揃っている
- [ ] `validate-phase11-screenshot-coverage.js` が PASS
- [ ] 画面カバレッジ必須項目が 100% である
- [ ] UI/UX問題は修正済み、または `discovered-issues.md` に記録済み
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新
