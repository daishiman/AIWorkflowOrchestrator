# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目      | 値                                                  |
| --------- | --------------------------------------------------- |
| Phase     | 11                                                  |
| 機能名    | imp-layer12-spec-definition-004                     |
| 作成日    | 2026-04-03                                          |
| 前提Phase | Phase 10（最終レビュー）完了                        |
| 後続Phase | Phase 12（ドキュメント更新）                        |
| 判定      | **NON_VISUAL**（docs-only task のため視覚証跡不要） |

## 目的

aiworkflow-requirements への check ID 体系追記（docs-only タスク）について、実装コード（SkillCreatorVerificationEngine.ts）と仕様書の check ID が完全に一致していることを grep ベースの突き合わせで検証する。本タスクは可視的な変更を伴わないため NON_VISUAL 判定とし、grep コマンド出力を証跡とする。

## 実行タスク

### Task 1: 実装との突き合わせ確認（代替証跡）

**目的**: SkillCreatorVerificationEngine.ts に定義された全 check ID と仕様書に記載された全 check ID の差分がないことを確認する。

**手順**:

1. SkillCreatorVerificationEngine.ts の全 check ID を grep で抽出する

   ```bash
   grep -oE 'L[1-4]-[0-9]{3}' <SkillCreatorVerificationEngine.ts のパス> | sort -u
   ```

2. 仕様書に記載された全 check ID を grep で抽出する

   ```bash
   grep -oE 'L[1-4]-[0-9]{3}' <仕様書パス> | sort -u
   ```

3. 両者の差分を確認する

   ```bash
   diff <(grep結果1) <(grep結果2)
   ```

4. 差分が 0 件であることを確認する

**証跡の主ソース**: grep コマンド出力結果

**可視証跡を使わない理由**: docs-only task で可視的な変更なし（NON_VISUAL 判定）

**成果物**: `outputs/phase-11/manual-test-result.md` に grep 出力と diff 結果を記録し、補助証跡として `outputs/phase-11/manual-test-checklist.md` / `outputs/phase-11/screenshot-plan.json` / `outputs/phase-11/screenshots/non-visual-placeholder.png` を配置する

### Task 2: 命名規則の整合性確認

**目的**: 全 check ID が `L{N}-{NNN}` 形式に準拠しており、Layer 番号と連番に欠番・重複がないことを確認する。

**手順**:

1. 全 check ID が `L[1-4]-[0-9]{3}` の正規表現にマッチすることを確認

   ```bash
   grep -cE '^L[1-4]-[0-9]{3}$' <check ID一覧>
   ```

2. Layer 番号（1-4）ごとに連番を抽出し、欠番がないことを確認

   ```bash
   # Layer 1
   grep -oE 'L1-[0-9]{3}' <仕様書パス> | sort -u
   # Layer 2
   grep -oE 'L2-[0-9]{3}' <仕様書パス> | sort -u
   # Layer 3
   grep -oE 'L3-[0-9]{3}' <仕様書パス> | sort -u
   # Layer 4
   grep -oE 'L4-[0-9]{3}' <仕様書パス> | sort -u
   ```

3. 重複 ID がないことを確認

   ```bash
   grep -oE 'L[1-4]-[0-9]{3}' <仕様書パス> | sort | uniq -d
   ```

**成果物**: Task 1 の manual-test-result.md に結果を統合記録

### Task 3: 発見課題の記録

**目的**: テスト実行中に発見された課題を記録する（0 件でも出力必須）。

**手順**:

1. Task 1・Task 2 の実行結果を確認し、不一致や問題点を洗い出す
2. `outputs/phase-11/discovered-issues.md` を作成する（0 件の場合も「発見課題なし」と明記）

**成果物**: `outputs/phase-11/discovered-issues.md`

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名             | パス                                                                         | 説明                 |
| ------------------ | ---------------------------------------------------------------------------- | -------------------- |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | レイヤー構成         |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | 完了記録・残課題規約 |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 検証・証跡の品質基準 |
| ディレクトリ構成   | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`   | 参照パスと配置規約   |
| Phase 11/12ガイド  | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`  | 手動テスト詳細手順   |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                         | 過去インシデント教訓 |

### タスク固有参照

| 資料名                            | パス                                                     | 説明                     |
| --------------------------------- | -------------------------------------------------------- | ------------------------ |
| SkillCreatorVerificationEngine.ts | `apps/desktop/src/` 配下（実装コード内の check ID 定義） | 実装側 check ID のソース |
| Phase 1 要件定義                  | `phase-1-requirements.md`                                | check ID 体系の要件      |
| Phase 2 設計                      | `phase-2-design.md`                                      | check ID 体系の設計      |
| Phase 3 設計レビュー              | `phase-3-design-review.md`                               | 設計レビュー結果         |

## テストケース

| No  | カテゴリ | テスト項目                     | 期待結果             |
| --- | -------- | ------------------------------ | -------------------- |
| 1   | 網羅性   | Layer 1 check ID 5個が全て記載 | grep で 5 件ヒット   |
| 2   | 網羅性   | Layer 2 check ID 7個が全て記載 | grep で 7 件ヒット   |
| 3   | 網羅性   | Layer 3 check ID 4個が全て記載 | grep で 4 件ヒット   |
| 4   | 網羅性   | Layer 4 check ID 3個が全て記載 | grep で 3 件ヒット   |
| 5   | 正確性   | severity が実装と一致          | diff 0 件            |
| 6   | 形式     | `L{N}-{NNN}` 形式に準拠        | 正規表現マッチ 19 件 |

## 統合テスト連携

N/A -- docs-only タスクのため統合テストは不要。

## 成果物

| 成果物                   | パス                                                      | 必須 | 説明                                   |
| ------------------------ | --------------------------------------------------------- | ---- | -------------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`               | ✅   | 実施前後の最小チェック項目             |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                  | ✅   | grep 証跡・NON_VISUAL メタ情報含む     |
| 撮影計画                 | `outputs/phase-11/screenshot-plan.json`                   | ✅   | NON_VISUAL 補助証跡                    |
| プレースホルダー画像     | `outputs/phase-11/screenshots/non-visual-placeholder.png` | ✅   | 可視証跡ではないプレースホルダー       |
| 発見課題                 | `outputs/phase-11/discovered-issues.md`                   | ✅   | 0 件でも出力（「発見課題なし」と明記） |

### manual-test-result.md 必須メタ情報

```markdown
## NON_VISUAL 判定

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| 判定     | NON_VISUAL                                      |
| 理由     | docs-only task（文書更新のみ）                  |
| 代替証跡 | grep コマンド出力による check ID 突き合わせ結果 |
| 視覚証跡 | 不要                                            |
```

## 完了条件

- [ ] Task 1: SkillCreatorVerificationEngine.ts の全 check ID を grep で抽出した
- [ ] Task 1: 仕様書の全 check ID を grep で抽出した
- [ ] Task 1: 両者の diff が 0 件であることを確認した
- [ ] Task 2: 全 check ID が `L{N}-{NNN}` 形式に準拠していることを確認した
- [ ] Task 2: Layer 番号（1-4）と連番に欠番がないことを確認した
- [ ] Task 2: 重複 ID がないことを確認した
- [ ] Task 3: `outputs/phase-11/discovered-issues.md` を作成した（0 件でも出力）
- [ ] テストケース 6 項目の結果を `manual-test-result.md` に記録した
- [ ] NON_VISUAL メタ情報を `manual-test-result.md` に記載した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 12: ドキュメント更新（`phase-12-documentation.md`）
