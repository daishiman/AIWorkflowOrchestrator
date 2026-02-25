# Phase 8: リファクタリング（仕様書記述品質改善・重複排除） - タスク仕様書

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| Phase        | 8                                         |
| Phase名      | リファクタリング（仕様書記述品質改善）    |
| 機能名       | ut-imp-aiworkflow-spec-reference-sync-001 |
| タスクID     | UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 |
| 種別         | 改善（仕様書修正のみ）                    |
| GitHub Issue | #903                                      |
| 前提Phase    | Phase 7（テストカバレッジ確認）           |
| 後続Phase    | Phase 9（品質保証）                       |
| ステータス   | 未実施                                    |
| 作成日       | 2026-02-25                                |

## 目的

Phase 5 で更新した仕様書群の記述品質を改善し、仕様書間の重複記述を排除する。本タスクはコード変更を伴わないため、通常のリファクタリング（コード品質改善）の代わりに、曖昧表現の排除・仕様書間重複排除・参照整合性確認・チェックリスト書式統一を実施する。

## 背景

Phase 5 で `task-workflow.md` / `spec-update-workflow.md` / `phase-11-12-guide.md` / `phase-templates.md` に同期ルール・チェックリスト・検証コマンド実行手順を追加した。これらの仕様書間で記述が重複している箇所や、曖昧表現が残存している箇所を整理し、Single Source of Truth の原則に従って記述を統一する。

## 実行タスク

### タスク1: 曖昧表現の排除

**目的**: Phase 5 で更新した仕様書に残存する曖昧表現を具体的な条件・基準に置き換える

**実行手順**:

1. 以下の4ファイルを対象に曖昧表現を検索する
   - `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
   - `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
   - `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
   - `.claude/skills/task-specification-creator/references/phase-templates.md`
2. 検索対象の曖昧表現パターン:
   - 禁止語A（条件未定義の行動副詞）→ 具体的な条件（例: 「exit code 0 で正常終了すること」）に置き換え
   - 禁止語B（条件未定義の分岐句）→ 具体的なトリガー条件に置き換え
   - 禁止語C（列挙省略の終端語）→ 列挙を完結させるか、具体的な範囲を明示
   - 努力目標語（例: 上限未定義の改善表現）→ 具体的な閾値または基準に置き換え
3. 置き換え前後の対照表を `outputs/phase-8/refactoring-report.md` に記録する

**検証コマンド**:

```bash
grep -rn "[適][切]に\|[必][要]に応じて\|等$\|[な][ど]$\|[で]きるだけ\|可能な限り\|なるべく" \
  .claude/skills/aiworkflow-requirements/references/task-workflow.md \
  .claude/skills/task-specification-creator/references/spec-update-workflow.md \
  .claude/skills/task-specification-creator/references/phase-11-12-guide.md \
  .claude/skills/task-specification-creator/references/phase-templates.md
```

**完了判定**: 上記 grep コマンドの出力が 0 件

---

### タスク2: 仕様書間の重複排除

**目的**: `task-workflow.md` / `spec-update-workflow.md` / `phase-11-12-guide.md` 間の記述重複を特定し、Single Source of Truth に整理する

**実行手順**:

1. 3ファイル間で同一内容を記述しているセクションを特定する
2. 各記述について「正本」を1ファイルに決定する
3. 正本以外のファイルでは「正本: [ファイル名#セクション名]」の参照形式に置き換える
4. 正本決定の基準:
   - 同期チェックリスト → `spec-update-workflow.md` を正本とする（Phase 12 更新手順の正本であるため）
   - 未タスク管理手順 → `task-workflow.md` を正本とする（未タスク台帳の正本であるため）
   - 検証コマンド実行手順 → `phase-11-12-guide.md` を正本とする（Phase 11/12 実行手順の正本であるため）
5. 変更内容を `outputs/phase-8/refactoring-report.md` に記録する

**完了判定**: 同一内容の記述が複数ファイルに存在しないこと（正本以外は参照形式への置き換えが完了）

---

### タスク3: 参照整合性の確認

**目的**: 仕様書間のクロスリファレンスが正しいファイルパスとセクション名を指していることを確認する

**実行手順**:

1. Phase 5 で追加・変更した参照リンクを全て抽出する
2. 各参照リンクについて以下を確認する:
   - 参照先ファイルが実在する（`test -f <path>` で確認）
   - 参照先セクション名が実在する（`#` 付きアンカーの場合、対象ファイル内に該当見出しが存在）
3. 片方向のみの参照がある場合は逆方向リンクを追加する（双方向一貫性）
4. 壊れた参照があれば修正する
5. 確認結果を `outputs/phase-8/refactoring-report.md` に記録する

**検証コマンド**:

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source .claude/skills/aiworkflow-requirements/references/task-workflow.md
```

**完了判定**: 参照切れ 0 件、片方向リンク 0 件

---

### タスク4: チェックリスト書式の統一

**目的**: Phase 5 で新規追加したチェックリストの書式を既存チェックリストの書式と統一する

**実行手順**:

1. 既存チェックリストの書式パターンを確認する（`spec-update-workflow.md` の Step 1-A 形式を基準とする）
2. Phase 5 で追加した新規チェックリスト項目が以下の書式に準拠しているか確認する:
   - `- [ ]` 形式のチェックボックスを使用している
   - 各項目に「何を」「どのファイルで」「どう確認するか」の3要素が含まれている
   - 1項目に複数アクションを含まない（1項目1アクション原則）
   - 動詞形式が「〜を確認する」「〜を実行する」「〜が0件である」で統一されている
   - 項目間のインデント・改行が統一されている
3. 書式が異なる項目を統一する
4. 変更内容を `outputs/phase-8/refactoring-report.md` に記録する

**完了判定**: 全チェックリスト項目が統一書式に準拠している

## 参照資料

| 参照資料                      | パス                                                                                                                     | 内容                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| Phase 1 要件定義              | `docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-1/requirements-definition.md` | 受入基準との整合確認         |
| Phase 2 設計                  | `docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-2/architecture-design.md`     | 設計方針との整合確認         |
| Phase 5 実装記録              | `docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-5/specification-updates.md`   | リファクタリング対象一覧     |
| Phase 6 検証拡充              | `docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-6/integration-test.md`        | 検証観点との整合確認         |
| Phase 7 カバレッジ確認        | `docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-7/coverage-report.md`         | カバレッジ確認結果           |
| development-guidelines.md     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`                                            | 開発ガイドライン（品質基準） |
| task-workflow.md              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                     | 更新対象仕様書               |
| spec-update-workflow.md       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                           | 更新対象仕様書               |
| phase-11-12-guide.md          | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                              | 更新対象仕様書               |
| phase-templates.md            | `.claude/skills/task-specification-creator/references/phase-templates.md`                                                | 更新対象仕様書               |
| unassigned-task-guidelines.md | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`                                     | 参照整合確認対象             |
| baseline-current-template     | `outputs/phase-5/baseline-current-template.md`                                                                           | Phase 5 成果物               |
| design-deviation-record       | `outputs/phase-5/design-deviation-record.md`                                                                             | Phase 5 成果物               |
| operation-checklist           | `outputs/phase-5/operation-checklist.md`                                                                                 | Phase 5 成果物               |

### システム仕様（aiworkflow-requirements + task-specification-creator）参照

| 仕様書                  | 参照セクション                       | 参照理由                 |
| ----------------------- | ------------------------------------ | ------------------------ |
| task-workflow.md        | 残課題テーブル、完了タスクセクション | 重複排除の正本決定対象   |
| spec-update-workflow.md | Step 1-A 〜 Step 1-E                 | チェックリスト書式の基準 |
| lessons-learned.md      | P1, P2, P3, P4                       | 過去教訓の反映確認       |
| コード品質ルール        | `.claude/rules/02-code-quality.md`   | 曖昧表現禁止規則         |

## 実行手順

### Step 1: 曖昧表現の検出と排除（タスク1）

1. 対象4ファイルに対して grep コマンドを実行し、曖昧表現を検出する
2. 検出された曖昧表現を一覧化する
3. 各表現を具体的な条件・基準に置き換える
4. 置き換え前後の対照表をレポートに記録する

### Step 2: 重複箇所の特定と正本整理（タスク2）

1. `task-workflow.md` / `spec-update-workflow.md` / `phase-11-12-guide.md` の対応セクションを比較する
2. 重複している記述を特定する
3. 正本を決定し、正本以外のファイルを参照形式に置き換える
4. 変更一覧をレポートに記録する

### Step 3: 参照リンクの検証と双方向化（タスク3）

1. `verify-unassigned-links.js` を実行して参照切れを検出する
2. Phase 5 で追加した参照リンクの双方向性を手動で確認する
3. 壊れた参照や片方向リンクがあれば修正する
4. 確認結果をレポートに記録する

### Step 4: チェックリスト書式の統一（タスク4）

1. `spec-update-workflow.md` の Step 1-A を書式基準として確認する
2. Phase 5 で追加したチェックリスト項目の書式を検証する
3. 不統一箇所を修正する（1項目1アクション分割、動詞形式統一、3要素確認）
4. 修正内容をレポートに記録する

### Step 5: リファクタリング後の統合検証

1. `verify-unassigned-links.js` を再実行し、参照切れ 0 件を確認する
2. `generate-index.js` を再実行し、索引が最新であることを確認する
3. SKILL validator を再実行し、有効判定を確認する
4. 曖昧表現 grep を再実行し、0 件を確認する
5. 全検証結果をレポートに記録する

**検証コマンド**:

```bash
# 参照リンク検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source .claude/skills/aiworkflow-requirements/references/task-workflow.md

# 索引再生成
cd .claude/skills/aiworkflow-requirements && node scripts/generate-index.js
cd .claude/skills/task-specification-creator && node scripts/generate-index.js

# SKILL validator
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/aiworkflow-requirements --verbose
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/task-specification-creator --verbose

# 曖昧表現検出
grep -rn "[適][切]に\|[必][要]に応じて\|等$\|[な][ど]$\|[で]きるだけ\|可能な限り\|なるべく" \
  .claude/skills/aiworkflow-requirements/references/task-workflow.md \
  .claude/skills/task-specification-creator/references/spec-update-workflow.md \
  .claude/skills/task-specification-creator/references/phase-11-12-guide.md \
  .claude/skills/task-specification-creator/references/phase-templates.md
```

## 統合テスト連携

リファクタリング後も全検証コマンドが成功することを確認する。

| 統合検証項目             | 検証コマンド                                                                                                                                                    | 期待結果             |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 未タスク参照リンク整合   | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md` | 参照切れ 0 件        |
| topic-map.md 索引最新化  | `cd .claude/skills/aiworkflow-requirements && node scripts/generate-index.js`                                                                                   | 差分なし（最新状態） |
| SKILL validator 有効判定 | `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/aiworkflow-requirements --verbose`                              | `Skill is valid!`    |
| SKILL validator 有効判定 | `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/task-specification-creator --verbose`                           | `Skill is valid!`    |
| 曖昧表現検索             | grep コマンド（Step 5 参照）                                                                                                                                    | 出力 0 件            |

## 多角的チェック観点

| 観点             | 確認内容                                               | 判定基準                                 |
| ---------------- | ------------------------------------------------------ | ---------------------------------------- |
| 記述品質         | 曖昧表現が排除され、全項目が検証可能な形式である       | grep 検索結果 0 件                       |
| 重複排除         | 同一内容が複数ファイルに存在しない                     | 正本以外は参照形式に統一されている       |
| 参照整合性       | 仕様書間のクロスリファレンスが全て有効である           | `verify-unassigned-links.js` で 0 エラー |
| 双方向一貫性     | 全参照リンクが双方向で成立している                     | 片方向リンク 0 件                        |
| 書式統一         | チェックリストが統一書式に準拠している                 | 全項目が「何を・どこで・どう」を含む     |
| 1項目1アクション | チェック項目に複数アクションが含まれていない           | 複数アクション項目 0 件                  |
| 後方互換性       | リファクタリングにより既存仕様書の意味が変わっていない | 変更前後で意図が同一であることを確認     |
| 検証継続成功     | リファクタリング後も全検証コマンドが正常終了する       | 全コマンド exit code 0                   |

## 成果物

| 成果物               | パス                                    | 内容                                                     |
| -------------------- | --------------------------------------- | -------------------------------------------------------- |
| リファクタリング報告 | `outputs/phase-8/refactoring-report.md` | 曖昧表現改善、重複排除、参照修正、書式統一の変更一覧記録 |

## 完了条件

- [ ] 対象4ファイルの曖昧表現 grep で該当 0 件（検証コマンド出力なし）
- [ ] `task-workflow.md` / `spec-update-workflow.md` / `phase-11-12-guide.md` 間の重複記述が解消されている（正本以外は参照形式）
- [ ] 全参照リンクの双方向一貫性が確認されている（片方向リンク 0 件）
- [ ] 全チェックリスト項目が統一書式（チェックボックス + 「何を・どこで・どう」3要素 + 1項目1アクション）に準拠している
- [ ] `verify-unassigned-links.js` の再実行結果が参照切れ 0 件
- [ ] `generate-index.js` の再実行で差分が発生しない
- [ ] SKILL validator で有効判定が維持されている（2スキル両方）
- [ ] `outputs/phase-8/refactoring-report.md` に改善内容と変更一覧が記録されている

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜4 + 統合検証）を100%実行完了
- [ ] 各タスクの完了を明記
- [ ] 成果物（refactoring-report.md）が生成されていることを確認
- [ ] `artifacts.json` の Phase 8 ステータスを `completed` に更新

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/phase-9-quality-assurance.md`
