# Visual回帰スナップショット補完 - タスク指示書

## メタ情報

```yaml
issue_number: 2221
task_id: UT-SW-VISUAL-REGRESSION-SNAPSHOT-001
status: open
priority: low
scale: small
task_type: PROCESS
```

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | UT-SW-VISUAL-REGRESSION-SNAPSHOT-001                                        |
| タスク名     | Visual回帰スナップショット補完（transition アニメーション検証の強化）       |
| 分類         | テスト改善（PROCESS）                                                       |
| 対象機能     | スキルウィザード / SkillInfoStep / InterviewProgressBar / VISUAL タスク共通 |
| 優先度       | 低（`priority:low`）                                                        |
| 見積もり規模 | 小規模（`scale:small`）                                                     |
| ステータス   | 未実施（`status:open`）                                                     |
| 発見元       | TASK-SW-UI-POLISH-001 Phase 12 Skill Feedback（2026-04-16）                 |
| 発見日       | 2026-04-16                                                                  |
| タスク分類   | PROCESS タスク（テスト戦略改善・Visual 回帰補完）                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SW-UI-POLISH-001（スキルウィザード UI仕上げ）では、`InterviewProgressBar` に `transition-all duration-300 ease-in-out` を、カテゴリボタンに `transition-all duration-200 ease-in-out` を追加した。

これらの CSS transition アニメーションは、ユニットテスト（Vitest/JSDOM 環境）では「クラスが存在するか」しか確認できず、実際のアニメーション動作（timing、イージング、視覚的スムーズさ）の検証は Phase 11 手動テストに依存している。

手動テストはスクリーンショット4枚で証跡を残しているが、「アニメーションが滑らかか」は静止画では確認できない。今後の修正でアニメーションが壊れた場合、回帰検出が手動確認に頼ることになる。

### 1.2 問題点・課題

- CSS transition の実動作（継続時間・イージング）をユニットテストで検証できない
- 手動テストは静止画証跡のみで、アニメーション動作の回帰検出が困難
- VISUAL タスクで transition を追加するたびに、回帰リスクが蓄積していく
- lightweight な visual snapshot（Playwright component test 等）があれば継続的に検証できる

### 1.3 放置した場合の影響

- 将来の実装変更でアニメーションが壊れても、CI で検出されない
- Phase 11 の手動テストコストが毎回発生する（自動化による削減余地がある）
- UX 品質を保証するための証跡が「静止画」に限定される

---

## 2. 何を達成するか（What）

### 2.1 目的

CSS transition アニメーションの回帰検出を自動化し、手動テストの補完として visual snapshot テストを導入する。または、手動テスト手順を明文化して再現性を向上させる。

### 2.2 最終ゴール

以下のいずれか（または両方）を達成する：

**Option A: Playwright Component テストによる自動 Visual Snapshot**

- `InterviewProgressBar` と `SkillInfoStep` に対する Playwright component test を追加
- アニメーション前後の DOM 状態を snapshot として保存
- CI で差分検出を実行

**Option B: 手動テスト手順の標準化ドキュメント**

- VISUAL タスクの transition アニメーション確認手順を明文化
- チェックリスト形式で「アニメーション検証」項目を追加
- Phase 11 のチェックリストテンプレートに組み込む

**推奨**: まず Option B を実施し、工数対効果で Option A を判断する

### 2.3 スコープ

**含むもの**:

- `InterviewProgressBar` の transition アニメーション確認手順ドキュメント
- `SkillInfoStep` カテゴリボタン transition 確認手順ドキュメント
- Phase 11 チェックリストテンプレートへのアニメーション確認項目追加
- （Option A を選択する場合）Playwright component test の雛形作成

**含まないもの**:

- E2E テスト全体の Playwright 環境構築（既存環境を前提とする）
- animation timing の厳密な数値検証（定性的な確認に留める）
- Storybook 等のコンポーネントカタログ導入

### 2.4 成果物

- `docs/30-workflows/templates/phase11-animation-verification-checklist.md`（アニメーション確認チェックリスト）
- `docs/30-workflows/templates/phase11-visual-regression-guide.md`（Visual 回帰確認ガイド）
- （Option A の場合）Playwright component test ファイルの雛形

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SW-UI-POLISH-001 の実装（`transition-all duration-300 ease-in-out` 追加）が完了していること
- Playwright が既にプロジェクトに導入されていること（E2E テスト環境）

### 3.2 依存タスク

| タスクID                                      | 関係 | 理由                                |
| --------------------------------------------- | ---- | ----------------------------------- |
| UT-SW-VISUAL-PHASE11-TEMPLATE-STANDARDIZE-001 | 推奨 | Phase 11 テンプレートに統合するため |

### 3.3 必要な知識

- CSS transition の仕組み（`transition-property`, `duration`, `timing-function`）
- JSDOM でのアニメーション非動作の制約
- Playwright の `page.screenshot()` / component test の基本

### 3.4 推奨アプローチ

**Phase 1** で「手動 vs 自動」の選択を確定する。工数が小さければ両方実施。

手動テスト手順のポイント：

1. DevTools の Rendering タブ → "Slow down animations" を 10× に設定
2. カテゴリ選択・解除時のフェードを目視確認
3. ProgressBar の進捗変化を目視確認（各問回答ごと）
4. ライト・ダーク両テーマで確認

---

## 4. 実行手順

### Phase 1: 要件定義

- 「手動テスト手順の標準化」と「Playwright 自動化」のトレードオフを評価する
- 既存の Playwright 環境（E2E テスト）の状況を確認する
- 対象コンポーネントのアニメーション仕様を整理する（`duration`, `property`, `easing`）

### Phase 2: 設計

- アニメーション確認チェックリストの設計
- （Option A の場合）Playwright component test の設計

### Phase 3: 設計レビュー

- チェックリストが実際の確認作業に対応しているか検証

### Phase 4: テスト作成（Option A のみ）

- Playwright component test の雛形作成

### Phase 5: 実装

- `phase11-animation-verification-checklist.md` の作成
- `phase11-visual-regression-guide.md` の作成

### Phase 6-10: テスト拡充・カバレッジ・リファクタリング・品質保証・最終レビュー

- 実際の VISUAL タスク（UT-SW-VISUAL-PHASE11-TEMPLATE-STANDARDIZE-001）で試用

### Phase 11: 手動テスト

- 作成したチェックリストと手順書を使って `InterviewProgressBar` のアニメーションを確認

### Phase 12: ドキュメント更新

- Phase 11 チェックリストテンプレートへの統合
- 変更履歴記録

### Phase 13: PR 作成

ユーザーの明示的承認を得た後に実施する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `docs/30-workflows/templates/phase11-animation-verification-checklist.md` が作成されていること
- [ ] `docs/30-workflows/templates/phase11-visual-regression-guide.md` が作成されていること
- [ ] チェックリストが `InterviewProgressBar` と `SkillInfoStep` の両方をカバーしていること

### 品質要件

- [ ] 手順が「DevTools を使ったアニメーション確認方法」を含むこと
- [ ] ライト・ダーク両テーマの確認手順が含まれること

### ドキュメント要件

- [ ] `UT-SW-VISUAL-PHASE11-TEMPLATE-STANDARDIZE-001` の成果物テンプレートにアニメーション確認チェックリストの参照が追記されていること

---

## 6. 検証方法

| テストID | 対象                 | 入力/操作                                        | 期待結果                                   |
| -------- | -------------------- | ------------------------------------------------ | ------------------------------------------ |
| TC-01    | チェックリスト完全性 | チェックリストと実コンポーネントの仕様を比較     | 全アニメーション対象がカバーされていること |
| TC-02    | 手順の再現性         | チェックリストに従って実際にアニメーションを確認 | 手順通りに実行できること                   |
| TC-03    | テーマ切替対応       | ライト・ダーク切替時のアニメーションを確認       | 両テーマで transition が動作すること       |

---

## 7. リスクと対策

| リスク                                           | 影響度 | 発生確率 | 対策                                                         |
| ------------------------------------------------ | ------ | -------- | ------------------------------------------------------------ |
| Playwright component test の環境構築コストが高い | 中     | 中       | まず Option B（手動手順書）を実施し、Option A は後続タスクへ |
| アニメーション確認が主観的になる                 | 低     | 中       | DevTools の "Slow down animations" を使い客観性を向上        |
| チェックリストが長すぎて実用性が低下する         | 低     | 低       | 確認項目を10項目以内に絞る                                   |

---

## 8. 参照情報

| 資料名                                        | パス                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| TASK-SW-UI-POLISH-001 Skill Feedback          | `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-12/skill-feedback-report.md`         |
| InterviewProgressBar 実装                     | `apps/desktop/src/renderer/components/skill/wizard/InterviewProgressBar.tsx`                |
| InterviewProgressBar テスト                   | `apps/desktop/src/renderer/components/skill/wizard/__tests__/InterviewProgressBar.test.tsx` |
| UT-SW-VISUAL-PHASE11-TEMPLATE-STANDARDIZE-001 | `docs/30-workflows/unassigned-task/UT-SW-VISUAL-PHASE11-TEMPLATE-STANDARDIZE-001.md`        |

---

## 9. 備考

### 苦戦箇所

| 項目                                | 内容                                                                                                                                                                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JSDOM での transition 検証不可      | TASK-SW-UI-POLISH-001 のユニットテストでは `transition-all duration-300 ease-in-out` クラスの「存在確認」しかできず、実際のアニメーション動作は確認できなかった。JSDOM は CSS アニメーションを実行しないため、これは構造的な制約である |
| 手動テスト vs 自動化の判断コスト    | Phase 11 手動テストで static スクリーンショットを取得したが、アニメーションの動作確認には不十分だった。次回 VISUAL タスクでは事前に「アニメーション確認方法」を決定しておく必要があった                                                |
| `transition-all` の影響範囲の曖昧さ | `transition-all` は全プロパティに transition を適用するため、パフォーマンス影響を懸念したが、具体的な計測基準がなかった。次回は `transition-colors` や `transition-opacity` と比較する基準を設ける                                     |

### 発見経緯

TASK-SW-UI-POLISH-001（スキルウィザード UI仕上げ）の Phase 12 Skill Feedback において、「Visual 回帰の検証方法を明確にする」として改善候補に挙げられた。transition はユニットテストだけでは見えにくく、手動テスト手順か軽量な visual snapshot を補う必要があると指摘された。
