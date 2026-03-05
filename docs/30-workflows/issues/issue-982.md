# [#982] "[UT-TASK-10A-B-009] 改善結果実行日時の視認性改善"

## メタ情報

```yaml
task_id: UT-TASK-10A-B-009
task_name: 改善結果実行日時の視認性改善
category: 改善
target_feature: SkillAnalysisView 改善結果内訳表示（ImprovementResultBreakdown）
priority: 低
scale: 小規模
status: 未実施
source_phase: UT-TASK-10A-B-003 Phase 11 手動検証（Apple UI/UX視点）
created_date: 2026-03-05
dependencies: [TASK-10A-B, UT-TASK-10A-B-003]
spec_path: docs/30-workflows/unassigned-task/task-10a-b-improvement-result-timestamp-readability.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## メタ情報

| 項目         | 内容                                                             |
| ------------ | ---------------------------------------------------------------- |
| タスクID     | UT-TASK-10A-B-009                                                |
| タスク名     | 改善結果実行日時の視認性改善                                     |
| 分類         | 改善                                                             |
| 対象機能     | SkillAnalysisView 改善結果内訳表示（ImprovementResultBreakdown） |
| 優先度       | 低                                                               |
| 見積もり規模 | 小規模                                                           |
| ステータス   | 未実施                                                           |
| 発見元       | UT-TASK-10A-B-003 Phase 11 手動検証（Apple UI/UX視点）           |
| 発見日       | 2026-03-05                                                       |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-TASK-10A-B-003 の Phase 11 手動検証で、改善結果カード上の `executedAt` 表示が小さく、離れた距離だと判読しづらいことを確認した。

### 1.2 問題点・課題

- 実行日時が本文より弱いコントラスト/文字サイズで表示され、視認性が低い。
- ユーザーが「いつ実行した結果か」を即時判断しづらい。
- テストでは機能を満たすが、運用時の認知負荷が高い。

### 1.3 放置した場合の影響

- 改善結果の鮮度判断に時間がかかる。
- スクリーンショットレビュー時に可読性指摘が再発する。

## 2. 何を達成するか（What）

### 2.1 目的

改善結果の実行日時を Apple UI/UX 観点で読み取りやすい情報階層に是正する。

### 2.2 最終ゴール

1. `executedAt` が本文と同等の可読性（サイズ/コントラスト）で表示される。
2. Dark/Light の両テーマで読み取り可能性が維持される。
3. 手動検証で「実行日時の判読性」項目が PASS になる。

### 2.3 スコープ

#### 含むもの

- `ImprovementResultBreakdown` の実行日時表示スタイル調整
- 必要なアクセシビリティ文言（ラベル/補助テキスト）調整
- 単体テストと Phase 11 手動検証の更新

#### 含まないもの

- 改善結果ロジック（成功/失敗/スキップ件数計算）の変更
- 日時フォーマットの国際化仕様拡張

### 2.4 成果物

- 実装差分（UI表示スタイル）
- テスト更新（表示内容/可読性観点）
- 手動検証結果更新

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/renderer/components/skill/ImprovementResultBreakdown.tsx` が存在すること
- 既存テストが実行可能であること

### 3.2 依存タスク

- TASK-10A-B（完了）
- UT-TASK-10A-B-003（完了）

### 3.3 必要な知識

- Tailwindユーティリティ設計（サイズ/コントラスト）
- React Testing Library による表示検証

### 3.4 推奨アプローチ

1. 実行日時のタイポグラフィを `text-xs` から `text-sm` 以上へ調整し、色トークンを可読性優先で再設定する。
2. ラベル文言（例: `実行日時`）を明示して意味認知を補強する。
3. テストで表示文言とテーマ差異を検証し、手動スクリーンショットで最終確認する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                       | 発見経緯                                 | 解決策                                            | 教訓                                   |
| -------------------------- | ---------------------------------------- | ------------------------------------------------- | -------------------------------------- |
| 実行日時が読みにくい       | Phase 11 目視レビューで UI-11-001 を検出 | フォントサイズ/コントラスト/ラベルの3点を同時修正 | 情報鮮度を示す要素は本文より弱くしない |
| 動作要件PASSで見送りやすい | 機能系テストでは可読性が検出されない     | 手動検証チェック項目に可読性を固定追加            | UI品質は機能PASSとは別に管理する       |

## 4. 実行手順

### Phase構成

- Phase A: 表示仕様の決定
- Phase B: 実装修正
- Phase C: テスト・画面検証
- Phase D: 仕様同期

### Phase A: 表示仕様の決定

#### 目的

可読性要件を明確化する。

#### 手順

1. 現在の `executedAt` 表示スタイルを確認する。
2. 文字サイズ、コントラスト、ラベル有無の基準を決める。

#### 成果物

- 表示調整方針

#### 完了条件

- 調整前後の比較観点が定義されている。

### Phase B: 実装修正

#### 目的

UI表示を可読性基準へ合わせる。

#### 手順

1. `ImprovementResultBreakdown.tsx` の日時表示スタイルを更新する。
2. 必要に応じてラベル文言を追加する。

#### 成果物

- 実装差分

#### 完了条件

- 日時表示が基準値を満たす。

### Phase C: テスト・画面検証

#### 目的

回帰と視認性を確認する。

#### 手順

1. 関連ユニットテストを更新/実行する。
2. Phase 11 スクリーンショットを再取得する。
3. Apple UI/UX 観点（情報階層・視認性）で再評価する。

#### 成果物

- テスト結果
- スクリーンショット証跡

#### 完了条件

- テスト PASS かつ視認性判定 PASS。

### Phase D: 仕様同期

#### 目的

未タスク台帳と仕様書を同期する。

#### 手順

1. `task-workflow.md` の残課題テーブルへ登録する。
2. `ui-ux-feature-components.md` の関連未タスク表へ登録する。
3. `verify-unassigned-links` / `audit --target-file` で整合確認する。

#### 成果物

- 更新済み仕様書

#### 完了条件

- 参照切れ 0 件、フォーマット違反 0 件。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 実行日時表示の可読性が改善されている
- [ ] ラベル/文言が一貫している

### 品質要件

- [ ] 関連ユニットテストが PASS
- [ ] Dark/Light の両テーマで視認性が確保される

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置済み
- [ ] `task-workflow.md` と `ui-ux-feature-components.md` に登録済み
- [ ] 監査コマンド結果を記録済み

## 6. 検証方法

### テストケース

- Case 1: 日時表示が Desktop で判読できる
- Case 2: 日時表示が Mobile で判読できる
- Case 3: Dark/Light でコントラスト破綻がない

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx
node apps/desktop/scripts/capture-improvement-result-breakdown-phase11.mjs
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-10a-b-improvement-result-timestamp-readability.md
```

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                     |
| ---------------------------------------- | ------ | -------- | ---------------------------------------- |
| 見た目調整で既存レイアウトが崩れる       | 中     | 低       | 既存スクリーンショット比較で差分確認する |
| テーマごとのコントラスト差が残る         | 中     | 中       | Dark/Light の両方で再撮影して確認する    |
| 未タスク登録だけで実装修正が後回しになる | 低     | 中       | 期限付きで優先度再評価を行う             |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui/outputs/phase-11/discovered-issues.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`

### 参考資料

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
結果パネルの executedAt（日時）表示が小さく、離れた距離だと判読しづらい。
```

### 補足事項

本タスクは視認性改善が目的であり、改善結果の計算ロジックは変更対象外とする。
