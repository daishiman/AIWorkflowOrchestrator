# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 12                                    |
| タスクID   | TASK-SW-STRUCT-LLM-002                |
| 機能名     | skill-creator-features-llm-generation |
| 前提Phase  | Phase 11                              |
| 後続Phase  | Phase 13                              |
| 作成日     | 2026-04-18                            |
| ステータス | not_started                           |

## 目的

`TASK-SW-STRUCT-LLM-002` を close-out するため、
仕様書更新・未タスク検出・実装ガイド・変更履歴・スキルフィードバック・準拠チェックを
同一 wave で整える。

> **最重要**: Phase 12 は漏れが最も発生しやすい Phase。必ず全項目を逐次確認すること。

## 実行タスク

- 実装ガイドの作成（中学生レベル説明 + 技術者向け説明）
- 仕様書ステータスの `completed` 更新
- aiworkflow-requirements への features 自動生成機能追加の反映
- ドキュメント変更履歴の記録
- 未タスク検出レポートの作成
- スキルフィードバックレポートの作成
- Phase 12 準拠チェックの実施と実測結果の記録

## 参照資料

| 資料名                 | パス                                                                                   | 用途                       |
| ---------------------- | -------------------------------------------------------------------------------------- | -------------------------- |
| Phase 11/12 実行ガイド | `.agents/skills/task-specification-creator/references/phase-11-12-guide.md`            | close-out 方針             |
| Phase 12 詳細          | `.agents/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Task 12-1〜12-6 必須要件   |
| aiworkflow 正本 skill  | `.claude/skills/aiworkflow-requirements/SKILL.md`                                      | Step 1/2 境界判断          |
| Phase 2 設計成果物     | `outputs/phase-2/requirements-analysis.md`                                             | 実装ガイド根拠             |
| Phase 11 証跡          | `outputs/phase-11/manual-test-result.md`                                               | NON_VISUAL 証跡確認        |
| Phase 5 実装           | `outputs/phase-5/implementation-summary.md`                                            | current facts の元確認     |
| Phase 10 最終レビュー  | `outputs/phase-10/final-review-result.md`                                              | close-out 判定根拠         |
| root artifacts         | `artifacts.json`                                                                       | root status / phase status |
| mirrored artifacts     | `outputs/artifacts.json`                                                               | parity 確認                |

## 実行手順

### Task 1: 実装ガイド作成【必須】

**出力先**: `outputs/phase-12/implementation-guide.md`

#### Part 1: 概念説明（中学生レベル）

**必須説明**:

features（機能一覧）は、スキルがどんなことができるかを説明するリストです。
今まではこのリストが空っぽでしたが、AI（LLM）に自動的に作ってもらえるようになります。

たとえば、「文章を要約するスキル」を作ったとき、今まではスキルの「できること一覧」が空のままでした。
これからは AI が「長い文章を短くまとめられます」「重要なポイントを抜き出せます」のように、
スキルの特徴を自動的にリストアップしてくれます。

#### Part 2: 技術詳細（開発者向け）

**必須セクション**:

1. **アーキテクチャ概要**
   - `runCreateWorkflow()` → LLM 呼び出し → features 配列生成 → `generateSkillMd()` → SKILL.md 反映
   - エラー時は `features: []` でフォールバックし、ワークフローを継続

2. **実装詳細**

   ```typescript
   // SkillCreatorService.ts の変更箇所
   // AC-1: features フィールドを LLM 自動生成に変更
   const features = await generateFeaturesWithLLM(skillName, purpose);
   // AC-3: 失敗時は空配列でフォールバック

   // AC-2: generateSkillMd() 経由で SKILL.md に反映
   await generateSkillMd({ ..., features });
   ```

3. **フォールバック設計**
   - LLM 呼び出し失敗時: `features: []` を使用して処理継続
   - タイムアウト時: 同様に空配列でフォールバック

4. **依存関係**
   - TASK-SW-LLM-PURPOSE-AUTO-EXTRACT: LLM 呼び出し基盤を共有

### Task 2: 仕様書ステータス更新【必須】

#### Step 1-A: タスク完了記録

- [ ] `docs/30-workflows/TASK-SW-STRUCT-LLM-002/` 配下の仕様書ステータスを `completed` に更新
- [ ] `docs/30-workflows/unassigned-task/TASK-SW-STRUCT-LLM-002.md` のステータスを更新
- [ ] `aiworkflow-requirements/LOGS.md` 更新

  ```markdown
  ## 2026-04-18

  - TASK-SW-STRUCT-LLM-002: LLM による features フィールド自動生成の実装完了
  ```

- [ ] `task-specification-creator/LOGS.md` 更新（**2ファイル両方を忘れずに**）

  ```markdown
  ## 2026-04-18

  - TASK-SW-STRUCT-LLM-002: Phase 12 ドキュメント更新完了
  ```

- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: SkillCreatorService.ts コメント更新

`SkillCreatorService.ts` 内の以下のコメントを更新する:

```typescript
// 変更前: // AC-3: LLM統合は別タスク
// 変更後: // AC-3: LLM統合実装済み (TASK-SW-STRUCT-LLM-002)
```

#### Step 1-C: aiworkflow-requirements への機能追加反映

- [ ] features 自動生成機能の追加を aiworkflow-requirements に反映する
- [ ] 関連仕様書（skill-creator-service.md 等）に機能追加を記録する

```bash
grep -rn "TASK-SW-STRUCT-LLM-002" references/
```

検索結果に基づき、関連仕様書のタスクテーブルを更新する。

#### Step 1-D: topic-map.md 再生成

```bash
node generate-index.js
```

> **P2 防止**: 仕様書更新後は必ず topic-map.md を再生成すること。

### Task 3: ドキュメント変更履歴記録【必須】

**出力先**: `outputs/phase-12/documentation-changelog.md`

**記録内容**:

```markdown
# Documentation Changelog

## TASK-SW-STRUCT-LLM-002

### 更新日: 2026-04-18

### Step 1-A: タスク完了記録

- [ ] TASK-SW-STRUCT-LLM-002 仕様書ステータス:
- [ ] unassigned-task ステータス:
- [ ] aiworkflow-requirements/LOGS.md:
- [ ] task-specification-creator/LOGS.md:
- [ ] SKILL.md（両方）:

### Step 1-B: コメント更新

- [ ] 対象ファイル: SkillCreatorService.ts
- [ ] 更新内容: AC-3 コメントを実装完了に変更

### Step 1-C: aiworkflow-requirements 反映

- [ ] 検索結果:
- [ ] 更新したファイル:

### Step 1-D: topic-map.md

- [ ] 再生成実行:
- [ ] 差分確認:

### 完了確認

- [ ] 全 Step 確認完了
```

### Task 4: 未タスク検出【必須】

> 0 件でも検出プロセスの実行と結果出力は必須。

**検出対象**:

1. **Phase 3/10 レビューの MINOR 指摘**
   - Phase 3 設計レビューの未対応指摘
   - Phase 10 最終レビューの未対応指摘

2. **Phase 11 手動テストのスコープ外発見**
   - テスト中に発見した関連問題
   - 改善提案

3. **コードコメントの TODO/FIXME**

   ```bash
   grep -rn "TODO\|FIXME" apps/desktop/src/main/services/skill/SkillCreatorService.ts
   ```

4. **features 品質向上の未タスク候補**
   - より詳細な機能説明の生成（プロンプト改善）
   - features 生成の品質評価メカニズム
   - features の重複排除・正規化

**未タスク登録プロセス（3ステップ全完了必須）**:

検出した未タスクは以下の3ステップを全て完了すること:

#### Step 1: 指示書作成

```
unassigned-task/TASK-SW-STRUCT-LLM-002-UNASSIGNED-{連番}.md
```

#### Step 2: 残課題テーブルに登録

`task-workflow.md` の残課題テーブルに追加する。

#### Step 3: 関連仕様書にリンク追加

検出元の仕様書に未タスクへの参照リンクを追加する。

**未タスク検出結果レポート**:

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

```markdown
# 未タスク検出結果

## 検出サマリー

| 検出元              | 件数 |
| ------------------- | ---- |
| Phase 3 MINOR       |      |
| Phase 10 MINOR      |      |
| Phase 11 スコープ外 |      |
| TODO/FIXME          |      |
| features 品質向上   |      |
| **合計**            |      |

## 検出一覧

（0件の場合も「検出なし」と明記）
```

### artifacts.json 更新

Phase 12 のステータスを更新する:

```json
{
  "phases": {
    "phase-12": {
      "status": "completed",
      "completedAt": "2026-04-18T00:00:00Z"
    }
  }
}
```

## 統合テスト連携

ドキュメント更新時に統合テスト関連ドキュメントを確認する:

| 確認項目               | 確認内容                                                        | 結果 |
| ---------------------- | --------------------------------------------------------------- | ---- |
| 実装ガイド             | features 自動生成の LLM 統合フローが説明されている              | [ ]  |
| テストガイド           | AC-1〜AC-4 のテスト実行手順がドキュメント化されている           | [ ]  |
| フォールバック説明     | features 生成失敗時の空配列フォールバックフローが説明されている | [ ]  |
| 依存関係説明           | TASK-SW-LLM-PURPOSE-AUTO-EXTRACT との依存関係が説明されている   | [ ]  |
| トラブルシューティング | features 生成エラー時の対処法がドキュメント化されている         | [ ]  |

## 多角的チェック観点（AIが判断）

| 観点         | チェック内容                                                               |
| ------------ | -------------------------------------------------------------------------- |
| 引き継ぎ品質 | 次の開発者が features 自動生成の仕組みを正確に理解できる説明になっているか |
| 未タスク検出 | features 品質向上のフォローアップが formalize されているか                 |
| 仕様更新     | system spec sync の Step 1 / Step 2 境界が明確か                           |
| parity       | `artifacts.json` と `outputs/artifacts.json` が一致しているか              |
| コメント更新 | SkillCreatorService.ts 内の古い TODO コメントが更新されているか            |

## サブタスク管理

1. 実装ガイド作成（中学生レベル説明 + 技術詳細）
2. 仕様書ステータス更新（Step 1-A〜1-D）
3. ドキュメント変更履歴記録
4. 未タスク検出レポート作成
5. スキルフィードバックレポート作成
6. Phase 12 準拠チェック実施

## 成果物

| 成果物                   | パス                                                     | 説明                       |
| ------------------------ | -------------------------------------------------------- | -------------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | current facts を説明       |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 境界       |
| ドキュメント変更履歴     | `outputs/phase-12/documentation-changelog.md`            | close-out narrative の記録 |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-detection.md`          | フォローアップ候補         |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | skill 改善点               |
| Phase 12 準拠チェック    | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 実測結果付きの最終確認     |

## 完了条件

### Task 1: 実装ガイド

- [ ] 中学生レベル概念説明が作成済み
- [ ] 技術詳細（LLM 統合フロー・フォールバック設計）が作成済み

### Task 2: 仕様書ステータス更新

- [ ] Step 1-A: タスク完了記録（6項目全て）
- [ ] Step 1-B: SkillCreatorService.ts コメント更新
- [ ] Step 1-C: aiworkflow-requirements 反映
- [ ] Step 1-D: topic-map.md 再生成

### Task 3: 更新履歴

- [ ] documentation-changelog.md 作成
- [ ] 各 Step の完了結果記録

### Task 4: 未タスク検出

- [ ] 検出プロセス実行
- [ ] unassigned-task-detection.md 作成（0件でも必須）
- [ ] 検出した未タスクの3ステップ完了（該当する場合）
- [ ] artifacts.json 更新

### 全体

- [ ] 本 Phase 内の全タスクを100%実行完了した

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 13: PR作成（blocked）
