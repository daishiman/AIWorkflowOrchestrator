# Phase 11: 手動テスト検証 - SkillCreator Layer3/4 severity フィルタ追加

## メタ情報

| 項目       | 値                                                    |
| ---------- | ----------------------------------------------------- |
| Phase      | 11                                                    |
| 機能名     | task-skill-creator-layer34-ui-display-severity-filter |
| 作成日     | 2026-04-03                                            |
| タスク分類 | **UIタスク** — スクリーンショットベース検証が必要     |
| 前提Phase  | Phase 10                                              |
| 後続Phase  | Phase 12                                              |

## 目的

自動テストでは検証できないユーザー体験・UI/UX・視覚的品質を手動で確認する。UIタスクのため、3層評価（Semantic / Visual / AI UX）を実施する。

補助成果物として `outputs/phase-11/manual-test-checklist.md` を作成し、TC-ID / 前提条件 / 実施可否を固定する。

## 実行タスク

### タスク1: 機能テスト

**目的**: severity フィルタの正常系/異常系を手動確認する。

| No  | カテゴリ | テスト項目             | 前提条件                                 | 操作手順                | 期待結果                                |
| --- | -------- | ---------------------- | ---------------------------------------- | ----------------------- | --------------------------------------- |
| 1   | 正常系   | デフォルトで全件表示   | verify detail 表示中                     | フィルタ UI を確認      | `すべて` が選択中、全 check 表示        |
| 2   | 正常系   | warning+ フィルタ      | verify detail に info/warning/error 混在 | `⚠ Warning+` をクリック | info check が非表示、warning/error のみ |
| 3   | 正常系   | error フィルタ         | verify detail に info/warning/error 混在 | `✗ Error` をクリック    | error check のみ表示                    |
| 4   | 正常系   | フィルタ解除           | warning+ フィルタ適用中                  | `すべて` をクリック     | 全件表示に戻る                          |
| 5   | 正常系   | Layer 非表示           | Layer4 に info のみ                      | `error` フィルタ適用    | Layer4 セクション自体が非表示           |
| 6   | 正常系   | reverify 後 state 維持 | warning+ 適用中                          | reverify 実行           | フィルタが warning+ のまま              |
| 7   | 異常系   | check 0 件時           | verify detail に check なし              | verify detail を表示    | フィルタ UI が表示されない              |

### タスク2: UI/UX テスト（3層評価）

**目的**: UIタスクとして視覚的品質を評価する。

**Semantic 評価**:

- [ ] セグメントコントロールのラベルが直感的に理解できる
- [ ] フィルタ適用中であることが視覚的に明示されている
- [ ] 「表示中 X / 全 Y 件」表示が情報量を補完している

**Visual 評価**:

- [ ] セグメントコントロールが8pxグリッドに沿っている
- [ ] ライトモード/ダークモードで視認性が確保されている
- [ ] 既存の verify detail UI と一貫したスタイルである
- [ ] カラーパレットが Apple HIG 準拠である

**AI UX 評価**:

- [ ] フィルタ切り替えが即時反映される（遅延なし）
- [ ] Layer の開閉アニメーションとフィルタが競合しない

### タスク3: スクリーンショット撮影

**適用判断**: UIタスク → **スクリーンショット必須**

#### Step 1: 変更コンポーネント一覧

```bash
git diff main --name-only -- '*.tsx' '*.jsx' | grep -E '(components|views|pages)/'
```

| #   | コンポーネント      | 種別 | 配置ルート       | 表示トリガー         |
| --- | ------------------- | ---- | ---------------- | -------------------- |
| 1   | SkillLifecyclePanel | 変更 | /skill-lifecycle | verify detail 表示中 |

#### Step 2: UI状態カバレッジ

| 状態                            | 該当判定                                            | 優先度 |
| ------------------------------- | --------------------------------------------------- | ------ |
| デフォルト表示（filter=all）    | ✅ 必須                                             | [A]    |
| warning+ フィルタ適用           | ✅ 必須                                             | [A]    |
| error フィルタ適用              | ✅ 必須                                             | [A]    |
| 0件Layer非表示状態              | ✅ 該当時必須                                       | [B]    |
| ライトモード                    | ✅ 必須                                             | [A]    |
| ダークモード                    | ✅ 必須                                             | [A]    |
| check 0件時（フィルタUI非表示） | ✅ 該当時必須                                       | [B]    |
| ホバー                          | N/A（セグメントコントロールにホバーエフェクトなし） | [D]    |

#### Step 3: 撮影計画

| テストケース | コンポーネント      | 状態                  | テーマ | ファイル名                     |
| ------------ | ------------------- | --------------------- | ------ | ------------------------------ |
| TC-01        | SkillLifecyclePanel | filter=all デフォルト | light  | `TC-01-default-all-light.png`  |
| TC-02        | SkillLifecyclePanel | filter=all デフォルト | dark   | `TC-02-default-all-dark.png`   |
| TC-03        | SkillLifecyclePanel | filter=warning+       | light  | `TC-03-warning-plus-light.png` |
| TC-04        | SkillLifecyclePanel | filter=warning+       | dark   | `TC-04-warning-plus-dark.png`  |
| TC-05        | SkillLifecyclePanel | filter=error          | light  | `TC-05-error-only-light.png`   |
| TC-06        | SkillLifecyclePanel | filter=error          | dark   | `TC-06-error-only-dark.png`    |
| TC-07        | SkillLifecyclePanel | 0件Layer非表示        | light  | `TC-07-empty-layer-light.png`  |
| TC-08        | SkillLifecyclePanel | check 0件             | light  | `TC-08-no-checks-light.png`    |

#### Step 4: 画面カバレッジレポート

| カバレッジ種別           | 対象数 | 撮影数 | カバレッジ率 | 基準     |
| ------------------------ | ------ | ------ | ------------ | -------- |
| コンポーネントカバレッジ | 1      | 1      | 100%         | 100%必須 |
| 表示状態カバレッジ       | {{N}}  | {{M}}  | {{%}}        | 100%必須 |
| テーマカバレッジ         | 2      | 2      | 100%         | 100%必須 |

## 参照資料

| 資料名         | パス                                                                                | 説明         |
| -------------- | ----------------------------------------------------------------------------------- | ------------ |
| Phase 10成果物 | `outputs/phase-10/final-review-result.md`                                           | 最終レビュー |
| Phase 2成果物  | `outputs/phase-2/design.md`                                                         | 画面設計     |
| 撮影ガイド     | `.claude/skills/task-specification-creator/references/phase-11-screenshot-guide.md` | 撮影手順     |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                 | 内容       |
| ----------------------- | ------------------------------------------------------------------------------------ | ---------- |
| UI/UXコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-core.md` | UI品質基準 |

## 統合テスト連携

UIタスクのため、手動テスト結果がエビデンスとなる。

| テスト項目       | 確認内容       | 期待結果 | 実行結果   |
| ---------------- | -------------- | -------- | ---------- |
| フィルタ切り替え | 即時反映       | 遅延なし | {{RESULT}} |
| Layer accordion  | フィルタと独立 | 干渉なし | {{RESULT}} |
| ダークモード     | 視認性確保     | OK       | {{RESULT}} |

## 成果物

| 成果物                   | パス                                        | 必須 | 説明                        |
| ------------------------ | ------------------------------------------- | ---- | --------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 必須 | TC-ID / 前提条件 / 実施可否 |
| テスト結果               | `outputs/phase-11/manual-test-result.md`    | 必須 | 手動テスト結果              |
| 発見課題一覧             | `outputs/phase-11/discovered-issues.md`     | 必須 | 発見した課題（0件でも出力） |
| スクリーンショット       | `outputs/phase-11/screenshots/`             | 必須 | UI撮影結果                  |
| 撮影計画                 | `outputs/phase-11/screenshot-plan.md`       | 必須 | 画面カバレッジ用            |
| カバレッジレポート       | `outputs/phase-11/screenshot-coverage.md`   | 必須 | 100%達成確認用              |

## 完了条件

- [ ] 機能テスト（正常系/異常系）を全項目実施した
- [ ] 3層評価（Semantic/Visual/AI UX）を実施した
- [ ] 手動テストチェックリストを作成し、TC-ID / 前提条件 / 実施可否を固定した
- [ ] `git diff` で変更コンポーネント一覧を洗い出した
- [ ] 各コンポーネントの全UI状態を列挙した（N/A理由も記録）
- [ ] 撮影計画 `screenshot-plan.md` を作成した
- [ ] 撮影計画の全項目のスクリーンショットを撮影した
- [ ] 各TCにスクリーンショット証跡が紐付いている
- [ ] 画面カバレッジレポートの必須項目が100%達成
- [ ] 品質評価で発見したUI/UX問題を全て修正済み（または discovered-issues.md に記録済み）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新
