# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 11                                         |
| 機能名     | TASK-RT-03-skill-creation-result-panel     |
| 作成日     | 2026-04-04                                 |
| タスク種別 | **UIタスク**（スクリーンショット取得必須） |

## 目的

`SkillCreationResultPanel` の視覚的品質を3層評価（Semantic / Visual / AI UX）で確認する。UIタスクのため Playwright + Vite dev server パターンでスクリーンショットを取得する。

## 実行タスク

- **screenshot-plan.json 作成**: キャプチャシナリオの定義
- **スクリーンショット取得**: Playwright + Vite dev server パターン
- **3層評価**: Semantic / Visual / AI UX の評価
- **発見事項記録**: Blocker / Note / Info の分類

### 画面カバレッジマトリクス

| TC       | シナリオ                          | 参照スクリーンショット                                   |
| -------- | --------------------------------- | -------------------------------------------------------- |
| TC-11-01 | 初期状態（全 props null）         | `outputs/phase-11/screenshots/ss-01-initial-state.png`   |
| TC-11-02 | Plan 完了後                       | `outputs/phase-11/screenshots/ss-02-plan-complete.png`   |
| TC-11-03 | Execute 成功後                    | `outputs/phase-11/screenshots/ss-03-execute-success.png` |
| TC-11-04 | Verify pass（完了）               | `outputs/phase-11/screenshots/ss-04-verify-pass.png`     |
| TC-11-05 | Verify fail（検証失敗・部分成功） | `outputs/phase-11/screenshots/ss-05-verify-fail.png`     |
| TC-11-06 | Execute 失敗                      | `outputs/phase-11/screenshots/ss-06-execute-fail.png`    |

## 実行手順

### ステップ 0: タスク種別確認

**判定: UIタスク**（Phase 1 で宣言済み）

- スクリーンショット: **SCREENSHOT 必須**
- 評価方式: Playwright + Vite dev server パターン

### ステップ 1: screenshot-plan.json 作成

```json
{
  "workflow": "TASK-RT-03-skill-creation-result-panel",
  "screenshots": [
    {
      "id": "ss-01",
      "scenario": "初期状態（全 props null）",
      "description": "planResult/executeResult/verifyDetail が全て null の場合の表示",
      "path": "outputs/phase-11/screenshots/ss-01-initial-state.png"
    },
    {
      "id": "ss-02",
      "scenario": "Plan 完了後",
      "description": "planResult あり、その他 null の場合の Plan セクション表示",
      "path": "outputs/phase-11/screenshots/ss-02-plan-complete.png"
    },
    {
      "id": "ss-03",
      "scenario": "Execute 成功後",
      "description": "planResult + executeResult(success=true) の表示、skillPath とファイルパス一覧を含む",
      "path": "outputs/phase-11/screenshots/ss-03-execute-success.png"
    },
    {
      "id": "ss-04",
      "scenario": "Verify pass（完了）",
      "description": "全フェーズ完了・全体ステータス「完了」バッジの表示",
      "path": "outputs/phase-11/screenshots/ss-04-verify-pass.png"
    },
    {
      "id": "ss-05",
      "scenario": "Verify fail（検証失敗・部分成功）",
      "description": "verify fail 時の layer 別チェック一覧、severity バッジ、再検証ボタン、governance note、disabledReason の表示",
      "path": "outputs/phase-11/screenshots/ss-05-verify-fail.png"
    },
    {
      "id": "ss-06",
      "scenario": "Execute 失敗",
      "description": "executeResult.success=false 時のエラーメッセージ表示",
      "path": "outputs/phase-11/screenshots/ss-06-execute-fail.png"
    }
  ]
}
```

### ステップ 2: スクリーンショット取得

```bash
# Vite dev server 起動
cd apps/desktop && npx vite --config vite.e2e.config.ts &

# 疎通確認
curl -I http://127.0.0.1:4173/

# スクリーンショット取得
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/TASK-RT-03-skill-creation-result-panel \
  --plan docs/30-workflows/TASK-RT-03-skill-creation-result-panel/outputs/phase-11/screenshot-plan.json
```

### 画面カバレッジマトリクス

| TC       | シナリオ                  | 証跡                                                     |
| -------- | ------------------------- | -------------------------------------------------------- |
| TC-11-01 | 初期状態（全 props null） | `outputs/phase-11/screenshots/ss-01-initial-state.png`   |
| TC-11-02 | Plan 完了後               | `outputs/phase-11/screenshots/ss-02-plan-complete.png`   |
| TC-11-03 | Execute 成功後            | `outputs/phase-11/screenshots/ss-03-execute-success.png` |
| TC-11-04 | Verify pass（完了）       | `outputs/phase-11/screenshots/ss-04-verify-pass.png`     |
| TC-11-05 | Verify fail（検証失敗）   | `outputs/phase-11/screenshots/ss-05-verify-fail.png`     |
| TC-11-06 | Execute 失敗              | `outputs/phase-11/screenshots/ss-06-execute-fail.png`    |

### ステップ 3: 3層評価

**Semantic 評価（情報構造）**:

| 評価項目                                               | 基準       | 結果 |
| ------------------------------------------------------ | ---------- | ---- |
| Plan セクション: skillName・agents・scripts が識別可能 | 視認可能   | TBD  |
| Execute セクション: success/fail が一目で分かる        | 明確な区別 | TBD  |
| Verify セクション: layer 別グループ化が理解できる      | 論理的構造 | TBD  |
| 部分成功（検証失敗）の全体ステータスバッジが目立つ     | 強調表示   | TBD  |

**Visual 評価（視覚品質）**:

| 評価項目                                            | 基準               | 結果 |
| --------------------------------------------------- | ------------------ | ---- |
| severity バッジの色が info/warning/error で区別可能 | 色のコントラスト   | TBD  |
| detail panel の開閉が視覚的に明確                   | ▼/▶ アイコン       | TBD  |
| ファイルパス一覧が長い場合に折り返し/スクロール     | 表示崩れなし       | TBD  |
| 全体ステータスバッジが他の要素と区別可能            | 目立つ配置・サイズ | TBD  |

**AI UX 評価（ユーザー体験）**:

| 評価項目                                                   | 基準               | 結果 |
| ---------------------------------------------------------- | ------------------ | ---- |
| plan 完了後に Plan セクションの状態が即座に判別できる      | 情報が即座に見える | TBD  |
| verify fail 時にエラー severity が最初に目に入る           | エラー優先表示     | TBD  |
| verify fail 時に再検証ボタンと disabledReason が確認できる | 操作可能性の把握   | TBD  |
| 全 props null 時に「結果がまだありません」等の説明         | 空状態の案内       | TBD  |

### ステップ 4: 発見事項のリアルタイム分類

| #   | シナリオ           | 発見事項 | 分類 | 対応方針 |
| --- | ------------------ | -------- | ---- | -------- |
| 1   | TC-11-01〜TC-11-06 | TBD      | TBD  | TBD      |

**分類基準**:

- **Blocker**: Phase 12 完了前に修正必須
- **Note**: 改善推奨（未タスク化を検討）
- **Info**: 記録のみ

## 必須成果物

| 成果物                        | パス                                             | 説明                             |
| ----------------------------- | ------------------------------------------------ | -------------------------------- |
| screenshot-plan.json          | `outputs/phase-11/screenshot-plan.json`          | キャプチャシナリオ定義           |
| 手動テストチェックリスト      | `outputs/phase-11/manual-test-checklist.md`      | TC 単位の手順と期待結果          |
| スクリーンショット（6枚）     | `outputs/phase-11/screenshots/ss-01〜06-*.png`   | 各シナリオの実スクリーンショット |
| phase11-capture-metadata.json | `outputs/phase-11/phase11-capture-metadata.json` | キャプチャ実行時の evidence      |
| manual-test-result.md         | `outputs/phase-11/manual-test-result.md`         | ウォークスルー結果               |
| manual-test-report.md         | `outputs/phase-11/manual-test-report.md`         | 実施概要と所見                   |
| discovered-issues.md          | `outputs/phase-11/discovered-issues.md`          | Blocker / Note 一覧              |
| ui-sanity-visual-review.md    | `outputs/phase-11/ui-sanity-visual-review.md`    | 視覚レビュー結果                 |

## 完了条件

- [ ] `screenshot-plan.json` が作成されている
- [ ] ss-01〜ss-06 のスクリーンショットが取得されている
- [ ] `phase11-capture-metadata.json` が作成されている
- [ ] 3層評価（Semantic / Visual / AI UX）が完了している
- [ ] 発見事項が Blocker / Note / Info で分類されている
- [ ] Blocker が 0件（または解消済み）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新
