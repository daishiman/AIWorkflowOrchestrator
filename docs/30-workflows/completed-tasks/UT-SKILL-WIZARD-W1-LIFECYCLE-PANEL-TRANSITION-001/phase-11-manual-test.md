# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                                                |
| ------ | ------------------------------------------------- |
| Phase  | 11                                                |
| 機能名 | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 |
| 作成日 | 2026-04-08                                        |

---

## 目的

自動テストでは検証できないユーザー体験・UI/UX・実環境動作を手動で確認する。  
`SkillLifecyclePanel` の UI 変更（テキストエリア削除・ウィザードボタン追加）を実環境で目視確認する。

---

## 実行タスク

- **機能テスト**: ウィザード遷移ボタンのレンダリング・クリック動作確認
- **UI/UX テスト**: テキストエリア削除後のレイアウト確認
- **リグレッションテスト**: 既存機能（スキル一覧・ステータス等）への影響確認
- **UI/UX 品質評価**: 変更コンポーネントのスクリーンショット取得・品質評価

---

## 参照資料

| 資料名        | パス                                      | 説明                        |
| ------------- | ----------------------------------------- | --------------------------- |
| 最終レビュー  | `outputs/phase-10/final-review-result.md` | Phase 10 成果物（判定結果） |
| 設計書        | `outputs/phase-2/design-document.md`      | Phase 2 成果物（画面設計）  |
| UI レイアウト | `outputs/phase-2/ui-layout-design.md`     | レイアウト設計              |

---

## テストカテゴリ

- **機能テスト**: ウィザードボタン表示確認・クリック動作確認
- **UI/UX テスト**: テキストエリア非表示確認・レイアウト整合確認
- **リグレッションテスト**: 既存コンポーネントへの影響確認
- **テーマテスト**: ライトモード・ダークモードでの表示確認

---

## 画面カバレッジマトリクス

### Step 1: 変更コンポーネント一覧

```bash
git diff main --name-only -- '*.tsx' '*.jsx' | grep -E '(components|views|pages)/'
```

| #   | コンポーネント        | 種別 | 配置ルート      | 表示トリガー       |
| --- | --------------------- | ---- | --------------- | ------------------ |
| 1   | `SkillLifecyclePanel` | 変更 | `/skill-center` | スキルパネル表示時 |

### Step 2: UI 状態カバレッジの定義

| 状態                 | 優先度   | 該当判定                 |
| -------------------- | -------- | ------------------------ |
| デフォルト表示       | [A] 必須 | 該当                     |
| ウィザードボタン表示 | [A] 必須 | 該当                     |
| テキストエリア非表示 | [A] 必須 | 該当                     |
| ライトモード         | [A] 必須 | 該当                     |
| ダークモード         | [A] 必須 | 該当                     |
| ローディング中       | [D] 任意 | 非該当（同期処理のため） |
| エラー表示           | [C] 推奨 | 既存機能のため確認       |

### Step 3: テストケース一覧

| テストケース | コンポーネント      | 状態                     | テーマ | ファイル名                        |
| ------------ | ------------------- | ------------------------ | ------ | --------------------------------- |
| TC-11-01     | SkillLifecyclePanel | デフォルト（ボタン表示） | light  | `skill-lifecycle-panel-light.png` |
| TC-11-02     | SkillLifecyclePanel | デフォルト（ボタン表示） | dark   | `skill-lifecycle-panel-dark.png`  |
| TC-11-03     | SkillLifecyclePanel | テキストエリア非表示確認 | light  | `skill-lifecycle-panel-light.png` |
| TC-11-04     | SkillLifecyclePanel | テキストエリア非表示確認 | dark   | `skill-lifecycle-panel-dark.png`  |

---

## テストケーステーブル

| No       | カテゴリ       | テスト項目                           | 期待結果                                          | 実行結果 | スクリーンショット                |
| -------- | -------------- | ------------------------------------ | ------------------------------------------------- | -------- | --------------------------------- |
| TC-11-01 | 機能           | ウィザードボタンが表示される         | `skill-lifecycle-open-wizard-button` が表示される | PASS     | `skill-lifecycle-panel-light.png` |
| TC-11-02 | 機能           | ウィザードボタンがダークモードで表示 | ダークテーマでボタンが正常表示される              | PASS     | `skill-lifecycle-panel-dark.png`  |
| TC-11-03 | UI/UX          | テキストエリアが表示されない         | request-input/execution-input が非表示            | PASS     | `skill-lifecycle-panel-light.png` |
| TC-11-04 | UI/UX          | ダークモードでテキストエリアが非表示 | ダークテーマで textarea が非表示                  | PASS     | `skill-lifecycle-panel-dark.png`  |
| TC-11-05 | リグレッション | 既存のスキル一覧表示が正常           | 既存機能に影響なし                                | PASS     | -                                 |

---

## 撮影コマンド

```bash
# スクリーンショット一括撮影
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 \
  --plan outputs/phase-11/screenshot-plan.json
```

---

## 統合テスト連携【必須】

| テスト項目         | 確認内容                             | 期待結果   | 実行結果 |
| ------------------ | ------------------------------------ | ---------- | -------- |
| UI 変更確認        | ウィザードボタンの表示               | 正常表示   | TBD      |
| エラーハンドリング | ボタンクリック時の動作（未接続状態） | スコープ外 | N/A      |
| リグレッション     | 既存機能への影響なし                 | 影響なし   | TBD      |

---

## 成果物

| 成果物             | パス                                                                              | 必須 | 説明                         |
| ------------------ | --------------------------------------------------------------------------------- | ---- | ---------------------------- |
| テスト結果         | `outputs/phase-11/manual-test-result.md`                                          | 必須 | 手動テスト結果               |
| 発見課題一覧       | `outputs/phase-11/discovered-issues.md`                                           | 必須 | 発見した課題（0 件でも出力） |
| スクリーンショット | `outputs/phase-11/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001/screenshots/` | 必須 | UI/UX 変更のため必須         |
| 撮影計画           | `outputs/phase-11/screenshot-plan.json`                                           | 必須 | UI/UX 変更のため必須         |
| カバレッジレポート | `outputs/phase-11/screenshot-coverage.md`                                         | 必須 | 100% 達成確認用              |

---

## 完了条件

- [x] TC-11-01〜TC-11-05 の全テストケースが実行済み
- [x] 全テストケースが PASS した
- [ ] 変更コンポーネント一覧（`git diff` 結果）を洗い出し済み
- [ ] 各 UI 状態（表示・テーマ）を列挙済み（N/A 理由も記録）
- [x] 撮影計画 `screenshot-plan.json` が作成済み
- [x] スクリーンショットが `outputs/phase-11/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001/screenshots/` に配置済み
- [ ] 各 TC にスクリーンショット証跡が紐付いている
- [ ] 画面カバレッジレポートの必須項目（優先度[A][B]）が 100%
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 手動テスト結果を記録した
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 --phase 11
```

---

## 次のPhase

Phase 12: ドキュメント更新
