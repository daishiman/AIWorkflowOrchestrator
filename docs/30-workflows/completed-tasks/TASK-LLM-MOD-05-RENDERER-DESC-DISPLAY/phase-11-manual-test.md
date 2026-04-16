# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 11                                    |
| Phase名    | 手動テスト                            |
| 対象機能   | TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY |
| 前提Phase  | Phase 10: 最終レビュー                |
| 次Phase    | Phase 12: ドキュメント更新            |
| ステータス | completed                             |
| 作成日     | 2026-04-16                            |
| Visual種別 | VISUAL（スクリーンショット証跡必須）  |

## 目的

3層評価（Semantic / Visual / AI UX）を実施し、`InlineModelSelector` の `description` 表示品質を手動で確認する。

## 実行タスク

### Task 1: Semantic 評価（機能確認）

| チェック項目                                                       | 合否 | メモ |
| ------------------------------------------------------------------ | ---- | ---- |
| description ありのモデルを選択したとき補助情報が表示される         | -    |      |
| description なしのモデルを選択したとき補助情報が非表示のままである | -    |      |
| description が空文字・空白のみの場合に補助情報が出ない             | -    |      |
| description が長文の場合でもレイアウトが崩れない                   | -    |      |
| モデル選択後に description が正しく更新される                      | -    |      |

### Task 2: Visual 評価（スクリーンショット証跡）

**必須**: 以下シナリオのスクリーンショットを取得する

| シナリオ                                      | スクリーンショットパス                                                            |
| --------------------------------------------- | --------------------------------------------------------------------------------- |
| InlineModelSelector の description 表示状態   | `outputs/phase-11/screenshots/TC-11-02-inline-model-selector-tooltip-overlay.png` |
| InlineModelSelector の description 非表示状態 | `outputs/phase-11/screenshots/TC-11-01-inline-model-selector-closed.png`          |

スクリーンショット取得スクリプトには必ず以下のパターンを使用する（ポート解放保証）:

```javascript
try {
  // スクリーンショット取得処理
} finally {
  await browser.close();
  server.close();
}
```

補足: ネイティブ tooltip はブラウザ依存でそのまま画像化しにくいため、
Playwright ハーネス上で tooltip overlay を再現して証跡を保存する。

### Task 3: AI UX 評価

| チェック項目                                                  | 合否 | メモ |
| ------------------------------------------------------------- | ---- | ---- |
| description の存在が主ラベルより弱い情報として伝わる          | -    |      |
| description なしのとき余白・高さが uniform である             | -    |      |
| tooltip の位置・タイミングが自然である（InlineModelSelector） | -    |      |
| 補助情報が長くてもコンポーネントの密度感が崩れない            | -    |      |

### Task 4: 検出問題の記録

HIGH 問題が発生した場合、`docs/30-workflows/unassigned-task/` に新しいタスクを生成する。

## 参照資料

| 資料名       | パス                        | 説明              |
| ------------ | --------------------------- | ----------------- |
| レビュー結果 | `phase-10-final-review.md`  | Phase 11 進行決定 |
| 設計書       | `phase-2-design.md`         | UI デザイン方針   |
| 実装記録     | `phase-5-implementation.md` | 実装方針の根拠    |

## 成果物

| 成果物               | パス                                             | 説明                             |
| -------------------- | ------------------------------------------------ | -------------------------------- |
| テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`      | Task 1〜3 のチェックリスト       |
| テスト結果           | `outputs/phase-11/manual-test-result.md`         | 3層評価の総合結果                |
| 検出事項             | `outputs/phase-11/discovered-issues.md`          | HIGH 問題・MEDIUM 問題の一覧     |
| 証跡メタデータ       | `outputs/phase-11/phase11-capture-metadata.json` | スクリーンショット取得メタデータ |

## 完了条件

- [x] Semantic 評価が全項目 PASS している
- [x] Visual スクリーンショット（2枚）が取得されている
- [x] AI UX 評価が全項目 PASS している
- [x] HIGH 問題が存在しないか、unassigned-task として記録されている
- [x] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [x] 本 Phase 内の全タスクを 100% 実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.json が更新されている
- [x] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
