# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目               | 内容                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| タスクID           | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                      |
| Phase              | 8 / 13                                                                          |
| Phase名称          | リファクタリング（TDD: Refactor）                                               |
| 機能名             | skill-creator検証ゲート整合化（quick_validate実行経路統一 + 警告ノイズ制御）    |
| 作成日             | 2026-02-26                                                                      |
| GitHub Issue       | #910                                                                            |
| 前提Phase          | Phase 7（カバレッジ確認）完了                                                   |
| 目的               | 動作を変えずに仕様書・運用ルールの品質を改善する                                |
| 成果物ディレクトリ | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-8/` |

## 目的

Phase 5-7 で動作確認済みの成果物に対し、外部挙動を維持したまま品質を改善する。仕様書の表現統一・冗長表現の排除、Warning 運用ルールの可読性向上、Phase 12 テンプレートの簡潔化、重複記述の整理を通じて保守性を向上させる。

## 実行タスク

- **Task 8-1**: 仕様書品質改善 -- 更新した仕様書の表現統一・冗長表現の排除
- **Task 8-2**: 運用ルール整理 -- Warning 運用ルールの可読性向上、判定フローチャートの追加
- **Task 8-3**: テンプレート品質改善 -- Phase 12 テンプレートの検証コマンド部分の簡潔化
- **Task 8-4**: 重複排除 -- `spec-update-workflow.md` と `phase-11-12-guide.md` で重複する記述の整理
- **Task 8-5**: リファクタリング後の全テスト再実行による動作不変確認

## 参照資料

| 参照資料                   | パス                                                                                                      | 内容                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義           | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-1/requirements-definition.md` | 受入基準・非機能要件の原点     |
| Phase 2 設計書             | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-2/design-document.md`         | リファクタ対象の設計基準       |
| Phase 5 実装成果物         | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-5/`                           | 実装済みコード・仕様書         |
| Phase 6 テスト拡充成果物   | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-6/`                           | 回帰・エッジケースの拡充結果   |
| Phase 7 カバレッジレポート | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-7/`                           | テスト網羅性の確認結果         |
| spec-update-workflow.md    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                            | 検証コマンド運用の正本         |
| phase-11-12-guide.md       | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                               | Phase 11/12 ガイド             |
| quick_validate.js          | `.claude/skills/skill-creator/scripts/quick_validate.js`                                                  | 検証スクリプト正本             |
| 実装パターン仕様           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`               | 再発防止パターン               |
| 教訓集                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                    | 過去の苦戦箇所と対策           |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                               | 品質基準                       |
| コード品質ルール           | `.claude/rules/02-code-quality.md`                                                                        | 曖昧表現禁止・コーディング規約 |

## 実行手順

### Task 8-1: 仕様書品質改善（表現統一・冗長表現の排除）

**対象ファイル**:

- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`

1. 曖昧表現を検出する:

   ```bash
   grep -rn "基準どおりに\|条件該当時に\|等\b\|状況を見て\|条件別に判断" \
     .claude/skills/task-specification-creator/references/spec-update-workflow.md \
     .claude/skills/task-specification-creator/references/phase-11-12-guide.md
   ```

2. 検出された曖昧表現を具体的な条件・基準に置換する:
   - 「基準どおりに対応」→ 「Error の場合は即時修正、Warning-要対応の場合は本 Phase 内で修正、Warning-許容の場合は件数記録のみ」
   - 「条件該当時に」→ 具体的なトリガー条件を記載（例: 「Warning 件数が前回比10%以上増加した場合」）
   - 「等」→ 列挙を完結させるか、網羅的なリストに置換

3. 検証コマンドの表記を統一する:
   - `quick_validate.js` へのパス表記が全箇所で `node .claude/skills/skill-creator/scripts/quick_validate.js <skill-path>` 形式であることを確認する
   - 省略表記（`quick_validate.js` のみ）が使用されている箇所はフルパス表記に置換する

4. 修正後、`git diff` で変更差分を確認し、意味的な変更（挙動の変更）が混入していないことを検証する

### Task 8-2: 運用ルール整理（Warning 判定フローチャート作成）

**成果物**: `outputs/phase-8/warning-flowchart.md`

1. Phase 2 で設計した Warning 3段階分類の判定フローを Mermaid 形式のフローチャートに変換する:

   ```mermaid
   flowchart TD
       A[Warning 発生] --> B{Phase 5 以前から存在する既知 Warning か?}
       B -->|YES| C[許容に分類]
       C --> C1[件数を記録し増加傾向がないことを確認]
       B -->|NO| D{機能やスキル構造の正確性に影響するか?}
       D -->|YES| E[要対応に分類]
       E --> E1[本 Phase 内で修正]
       D -->|NO| F[要監視に分類]
       F --> F1[次回 Phase 12 までに対応方針を決定]
   ```

2. フローチャートに加えて、各分類の判定例を3つ以上記載する:
   - **許容**: `aiworkflow-requirements` の大量 reference ファイルの参照リンク警告（50ファイル超のスキルで既知）
   - **要監視**: 新規追加した reference ファイルが SKILL.md からリンクされていない
   - **要対応**: agents/\*.md の必須セクション不足、name とディレクトリ名の不一致

3. `warning-flowchart.md` に以下の構成で記載する:
   - フローチャート（Mermaid）
   - 分類判定例テーブル
   - 分類ごとの対応アクション一覧

### Task 8-3: テンプレート品質改善（Phase 12 検証コマンドの簡潔化）

**対象ファイル**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

1. Phase 12 テンプレートの検証コマンド部分を確認する
2. 以下の観点で簡潔化を行う:
   - コピー&ペーストで実行可能な最小限のコマンド列にする
   - 余計な説明文がコマンド間に挟まっていないことを確認する（説明はコマンドブロックの前後に配置）
   - 3スキル分の検証コマンドをまとめた「一括実行用」スニペットを追加する:
     ```bash
     # 全3スキル一括検証
     for skill in skill-creator task-specification-creator aiworkflow-requirements; do
       echo "=== $skill ===" && \
       node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
     done
     ```
3. 簡潔化後のコマンド列を実際にコピー&ペーストで実行し、正常動作を確認する

### Task 8-4: 重複排除（spec-update-workflow.md と phase-11-12-guide.md の整理）

**対象ファイル**:

- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`

1. 両ファイル間で重複している記述を列挙する:

   ```bash
   # 検証コマンド関連の記述箇所を特定
   grep -n "quick_validate" \
     .claude/skills/task-specification-creator/references/spec-update-workflow.md \
     .claude/skills/task-specification-creator/references/phase-11-12-guide.md
   ```

2. 重複箇所ごとに正本を決定する:
   - 検証コマンドの詳細（コマンド全文、引数説明、判定基準）→ 正本: `spec-update-workflow.md`
   - Phase 12 の実行フロー内での検証タイミング → 正本: `phase-11-12-guide.md`
   - Warning 分類ルールの詳細 → 正本: `spec-update-workflow.md`

3. 正本でないファイル側の重複記述を以下のパターンで置換する:
   - 要約（1-2行）+ 正本への参照リンク
   - 例: 「検証コマンドの詳細は [spec-update-workflow.md の Step 1-G](./spec-update-workflow.md#step-1-g) を参照」

4. 修正後、両ファイルの参照リンクが正しいパスを指していることを確認する
5. `git diff` で変更差分を確認し、意味的な変更が混入していないことを検証する

### Task 8-5: リファクタリング後の全テスト再実行

1. Phase 4 で作成したテストを全て実行する:

   ```bash
   cd apps/desktop && pnpm vitest run src/ --reporter=verbose 2>&1 | tail -20
   ```

2. `quick_validate.js` の検証を全3スキルに対して実行する:

   ```bash
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
   ```

3. テスト結果が Phase 7 完了時点と同一であることを確認する（テスト数・PASS数・FAIL数の一致）
4. 差異がある場合は原因を特定し、リファクタリングによる退行であれば修正する
5. リファクタリング記録を `outputs/phase-8/refactoring-report.md` に以下の構成で作成する:
   - リファクタリング対象ファイル一覧
   - 各ファイルの変更内容（Before / After の要約）
   - 曖昧表現の検出・置換結果
   - 重複排除の結果
   - テスト再実行結果（PASS数、所要時間）
   - リファクタリングにより発見された追加課題（該当する場合）

## 統合テスト連携【必須】

- Phase 4 で作成されたテストスイートの全テストが PASS すること
- `quick_validate.js` の出力がリファクタリング前と同一であること（Error/Warning の件数・内容が変わっていないこと）
- `pnpm lint` でリファクタリング後のファイルに Lint エラーがないこと
- リファクタリング前後の出力比較手順:

  ```bash
  # リファクタリング前の出力を保存
  node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator > /tmp/before-refactor.txt 2>&1

  # リファクタリング後の出力と比較
  node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator > /tmp/after-refactor.txt 2>&1
  diff /tmp/before-refactor.txt /tmp/after-refactor.txt
  ```

## 多角的チェック観点（AIが判断）

| 観点                      | 適用 | 確認内容                                                                       |
| ------------------------- | ---- | ------------------------------------------------------------------------------ |
| 仕様書品質                | ○    | 曖昧表現（「基準どおりに」「条件該当時に」）が全て具体的な条件・基準に置換済み |
| 既存フローとの互換性      | ○    | 変更前後で検証結果が変わらないこと（出力の diff が空であること）               |
| 重複排除の完全性          | ○    | 正本+参照リンク構造が全重複箇所で適用されていること                            |
| コピー&ペースト実行可能性 | ○    | 検証コマンドが実際にコピー&ペーストで正常動作すること                          |
| セキュリティ              | --   | 本タスクは読み取り専用の仕様書・スクリプト改善であり対象外                     |
| UI/UX                     | --   | ユーザー向け UI の変更を含まないため対象外                                     |

## 成果物

| 成果物                     | パス                                                                                                 | 内容                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------- |
| リファクタリング記録       | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-8/refactoring-report.md` | 変更内容・テスト結果の記録            |
| Warning 判定フローチャート | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-8/warning-flowchart.md`  | Mermaid 形式の判定フロー + 分類判定例 |

## 完了条件

- [ ] テストが継続成功（Phase 7 完了時点と同一のテスト数・PASS 数）
- [ ] 仕様書の曖昧表現（「基準どおりに」「条件該当時に」「等」「状況を見て」「条件別に判断」）が排除されている
- [ ] `spec-update-workflow.md` と `phase-11-12-guide.md` 間の重複記述が整理されている（正本+参照リンク構造）
- [ ] Warning 判定フローチャートが Mermaid 形式で `warning-flowchart.md` に作成されている
- [ ] Phase 12 テンプレートの検証コマンドがコピー&ペーストで実行可能な最小限の形式に簡潔化されている
- [ ] リファクタリング前後で `quick_validate.js` の出力が同一である（`diff` で差分なし）
- [ ] `refactoring-report.md` にリファクタリング内容とテスト結果が記録されている
- [ ] **本 Phase 内の全タスク（8-1, 8-2, 8-3, 8-4, 8-5）を100%実行完了**

## サブタスク管理

| サブタスク | 内容                             | 状態   | 備考 |
| ---------- | -------------------------------- | ------ | ---- |
| Task 8-1   | 仕様書品質改善（表現統一）       | 未着手 |      |
| Task 8-2   | 運用ルール整理（フローチャート） | 未着手 |      |
| Task 8-3   | テンプレート品質改善（簡潔化）   | 未着手 |      |
| Task 8-4   | 重複排除（正本+参照リンク化）    | 未着手 |      |
| Task 8-5   | 全テスト再実行・記録作成         | 未着手 |      |

## タスク100%実行確認【必須】

- [ ] 全タスク（8-1, 8-2, 8-3, 8-4, 8-5）が100%実行完了
- [ ] 各成果物（refactoring-report.md, warning-flowchart.md）が生成されている
- [ ] `artifacts.json` の Phase 8 ステータスが `completed` に更新されている

## 次のPhase

Phase 9: 品質保証（`phase-9-quality-assurance.md`）に進む。
