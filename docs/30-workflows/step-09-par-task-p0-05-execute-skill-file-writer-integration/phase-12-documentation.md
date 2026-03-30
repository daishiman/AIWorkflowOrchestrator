# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 12                                    |
| 機能名     | execute-skill-file-writer-integration |
| タスクID   | TASK-P0-05                            |
| タスク種別 | 機能追加                              |
| UI task    | No                                    |
| docs-only  | No                                    |
| 作成日     | 2026-03-30                            |

## 目的

実装ガイド（Part 1: 中学生レベル概念説明 + Part 2: 技術詳細）を作成し、システム仕様書を更新する。ドキュメント更新履歴、未タスク検出レポート、スキルフィードバックレポートを作成して Phase 12 の全成果物を揃える。

## 事前チェック

Phase 12 着手前に以下の既知の落とし穴を確認すること。

| Pitfall | 内容                                         | 防止策                                                                           |
| ------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| P1      | LOGS.md 2ファイル更新漏れ                    | aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md の両方更新 |
| P2      | topic-map.md 再生成忘れ                      | 仕様書変更時は必ず再生成スクリプトを実行                                         |
| P3      | 未タスク管理の3ステップ不完全                | ①指示書 → ②残課題テーブル → ③関連仕様書リンク の全ステップ実施                   |
| P4      | documentation-changelog への早期「完了」記載 | 全Step完了後に「完了」を記載。途中で書かない                                     |
| P25     | LOGS.md 2ファイル更新漏れ（P1再発）          | Phase 12チェックリストで「2ファイル更新」を明示的にチェック                      |
| P26     | システム仕様書更新遅延                       | Phase 12完了時点で更新。PRマージを待たない                                       |
| P27     | topic-map.md 再生成トリガー判断ミス          | 追加だけでなく削除・更新も再生成トリガーに含める                                 |
| P28     | スキルフィードバックレポート未作成           | 改善点なしでも「改善点なし」としてレポートを出力                                 |

### 着手時の初期アクション

1. `outputs/artifacts.json` と各 `phase-*.md` のartifact名を1対1で突合し、不一致があれば修正する（Feedback 2 対策）
2. Phase 1 のタスク分類（UI task: No / docs-only: No）を再確認する（Feedback 3 対策）

## 実行タスク

### タスク一覧（表）

| Task | 名称                             | 必須 | 成果物                                           |
| ---- | -------------------------------- | ---- | ------------------------------------------------ |
| 12-1 | 実装ガイド作成（2パート構成）    | ✅   | `outputs/phase-12/implementation-guide.md`       |
| 12-2 | システム仕様書更新               | ✅   | `outputs/phase-12/system-spec-update-summary.md` |
| 12-3 | ドキュメント更新履歴作成         | ✅   | `outputs/phase-12/documentation-changelog.md`    |
| 12-4 | 未タスク検出レポート作成         | ✅   | `outputs/phase-12/unassigned-task-detection.md`  |
| 12-5 | スキルフィードバックレポート作成 | ✅   | `outputs/phase-12/skill-feedback-report.md`      |

---

### Task 12-1: 実装ガイド作成

成果物: `outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生レベル概念説明

**必須要件**:

- 日常生活での例え話を**必ず**含める（「たとえば」を最低1回使用）
- 専門用語は使わない（使う場合は即座にかみ砕いて説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明する

**記載構成**:

1. **なぜ必要か**: AIが作ったプログラムをファイルとして保存する仕組みがなかった問題を説明
2. **何をするか**: AIの回答を読み取り → 必要な部分だけ取り出し → ファイルとして保存する流れ
3. **たとえば**: 日常の例え話（例: 手紙から必要な情報を抜き出してノートに書き写す、のような比喩）
4. **結果どうなるか**: スキルのコードがきちんとファイルに保存され、次から使えるようになる

#### Part 2: 技術詳細

**必須要件**:

- TypeScript型定義を含める
- APIシグネチャと使用例を記載
- エラーハンドリングとエッジケースを説明
- 設定可能なパラメータと定数を一覧化

**記載構成**:

1. **型定義**:
   - `SkillGeneratedContent` 型（既存の再利用）
   - `RuntimeSkillCreatorExecuteResult` の拡張フィールド（`persistResult?`, `persistError?`）
   - `persistResult` の structural type（`{ skillPath: string; files: string[] }`）

2. **APIシグネチャ**:
   - `parseLlmResponseToContent(events: SkillCreatorSdkEvent[]): SkillGeneratedContent | null`
   - `execute()` 内の persist 呼び出しフロー

3. **使用例**:

   ```typescript
   // execute() 内の処理フロー
   const content = parseLlmResponseToContent(sdkEvents);
   if (content && this.skillFileWriter) {
     const persistResult = await this.skillFileWriter.persist(
       request.skillName,
       content,
       {
         overwrite: true,
       },
     );
     result.persistResult = persistResult;
   }
   ```

4. **エラーハンドリング**:
   - パースエラー: `null` を返し、persist をスキップ
   - persist 失敗: `persistError` に記録、execute 自体は success
   - SkillFileWriter 未DI: `console.warn` + persist スキップ

5. **設定パラメータ**:
   - `overwrite`: `true`（デフォルト）— 既存ファイルの上書き許可
   - `basePath`: SkillFileWriter の書き出し先ルートディレクトリ

---

### Task 12-2: システム仕様書更新

成果物: `outputs/phase-12/system-spec-update-summary.md`

#### Step 1-A: タスク完了記録

- [ ] 完了タスクセクションに TASK-P0-05 の記録を追加
- [ ] 関連ドキュメントリンクを追加
- [ ] 変更履歴エントリを追加
- [ ] **LOGS.md 2ファイル更新**:
  - [ ] `.claude/skills/aiworkflow-requirements/LOGS.md`
  - [ ] `.claude/skills/task-specification-creator/LOGS.md`
- [ ] **SKILL.md 2ファイル更新**:
  - [ ] `.claude/skills/aiworkflow-requirements/SKILL.md`
  - [ ] `.claude/skills/task-specification-creator/SKILL.md`
- [ ] `topic-map.md` 再生成:
  - [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
  - [ ] `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/step-09-par-task-p0-05-execute-skill-file-writer-integration --regenerate`

#### Step 1-B: 実装状況テーブル更新

- [ ] TASK-P0-05 の実装状況を更新
  - 実装完了の場合: 「未実装」→「完了」
  - 仕様書作成のみの場合: `spec_created`

#### Step 1-C: 関連タスクテーブル更新

- [ ] 仕様書内の「関連タスク」テーブルのステータス更新
  - TASK-RT-01, TASK-RT-02, TASK-RT-06 のステータス確認
- [ ] 「未タスク候補」テーブルのステータス更新

#### Step 2: システム仕様更新（条件付き）

**判定**: `persistResult` / `persistError` フィールドが `RuntimeSkillCreatorExecuteResult` に追加されるため、**Step 2 の実行が必要**と判定する。

新規・変更インターフェース:

- `RuntimeSkillCreatorExecuteResult` — `persistResult?`, `persistError?` フィールド追加
- `PersistResult` 型の新設は不要。`persistResult` は structural type で扱う
- `parseLlmResponseToContent()` ユーティリティ関数の追加

更新対象仕様書の候補:

- `skillCreator.ts` 関連の型仕様
- `RuntimeSkillCreatorFacade` の API 仕様

> **注意**: 仕様書更新は3ファイル以下/エージェントに分割すること（P43対策）

---

### Task 12-3: ドキュメント更新履歴作成

成果物: `outputs/phase-12/documentation-changelog.md`

**記載構成**:

- Step 1-A の実施結果を個別に明記
- Step 1-B の実施結果を個別に明記
- Step 1-C の実施結果を個別に明記
- Step 2 の実施結果を個別に明記（「該当なし」の場合も記録）
- **全Step完了後に「Phase 12完了」と記載する**（P4対策）

---

### Task 12-4: 未タスク検出レポート作成

成果物: `outputs/phase-12/unassigned-task-detection.md`

**0件でも出力必須**。`current` / `baseline` を分離して記録する。

検出ソース:

| ソース                | 確認項目                                          |
| --------------------- | ------------------------------------------------- |
| 元タスク仕様書        | 「スコープ外」として明示された項目                |
| Phase 3 レビュー結果  | **MR-01**: `skillFileWriter` 未DI時のログ出力追加 |
| Phase 10 レビュー結果 | MINOR判定の指摘事項                               |
| Phase 11 手動テスト   | スコープ外の発見事項・改善提案                    |
| コードコメント        | TODO/FIXME/HACK/XXX                               |

**MR-01 の未タスク化**:

- Phase 3 で指摘された MR-01（`skillFileWriter` 未DI時のログ出力）は、Phase 5 で `console.warn` 追加として対応済み
- ただし、将来的な改善（例: 構造化ロギング、監視ダッシュボード連携）は未タスク候補として記録する

```bash
# 未タスク検出スクリプト
node scripts/detect-unassigned-tasks.js --scan packages/shared/src apps/desktop/src/main/services/runtime --output .tmp/unassigned-candidates.json
```

未タスク管理の3ステップ（P3対策）:

1. 指示書作成（`unassigned-task/` 配下）
2. 残課題テーブルへの追加
3. 関連仕様書へのリンク追加

---

### Task 12-5: スキルフィードバックレポート作成

成果物: `outputs/phase-12/skill-feedback-report.md`

**改善点なしでも出力必須**。

検討観点:

| 観点             | 検討内容                                          |
| ---------------- | ------------------------------------------------- |
| テンプレート改善 | Phase仕様書テンプレートに漏れや曖昧さがなかったか |
| ワークフロー改善 | 機械検証や手順分岐に改善余地がないか              |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補がないか    |

`phase12-task-spec-compliance-check.md` を root evidence として残す。

---

## 参照資料

| 資料名                           | パス                                          | 説明                     |
| -------------------------------- | --------------------------------------------- | ------------------------ |
| タスク概要                       | `index.md`                                    | AC定義・スコープ         |
| Phase 3 レビュー                 | `phase-3-design-review.md`                    | MR-01 指摘               |
| Phase 10 結果                    | `outputs/phase-10/final-review-result.md`     | 最終レビュー判定         |
| Phase 11 結果                    | `outputs/phase-11/manual-test-result.md`      | 手動テスト結果           |
| Phase 12 ドキュメントガイド      | `references/phase-12-documentation-guide.md`  | Part 1/2 作成手順        |
| 仕様更新ワークフロー             | `references/spec-update-workflow.md`          | Step 1-A〜Step 2 手順    |
| 仕様更新バリデーションマトリクス | `references/spec-update-validation-matrix.md` | 更新検証基準             |
| 未タスクガイドライン             | `references/unassigned-task-guidelines.md`    | 未タスク検出・管理手順   |
| Phase 12 同期パターン            | `references/patterns-phase12-sync.md`         | Task 12-5 手順           |
| 06-known-pitfalls                | `.claude/rules-disabled/06-known-pitfalls.md` | P1, P2, P3, P4, P25〜P28 |

## 統合テスト連携

| 観点               | 内容                                               |
| ------------------ | -------------------------------------------------- |
| Phase 10 MINOR反映 | MR-01 の未タスク化を Task 12-4 で実施              |
| Phase 11 引継      | 発見事項を Task 12-4 の検出ソースに含める          |
| Phase 13 への引継  | 全成果物が揃ったことを確認してから Phase 13 に進行 |

## 成果物

| 成果物                       | パス                                             | 説明                 |
| ---------------------------- | ------------------------------------------------ | -------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`       | Part 1 + Part 2      |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md` | Step 1 + Step 2 結果 |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`    | 全Step の実施結果    |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`  | 0件でも出力          |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`      | 改善点なしでも出力   |

## 完了条件チェックリスト

### Task 12-1: 実装ガイド

- [ ] Part 1 に日常の例え話が含まれている（「たとえば」が最低1回）
- [ ] Part 1 は「なぜ必要か」→「何をするか」の順序で記述
- [ ] Part 2 に TypeScript 型定義が含まれている
- [ ] Part 2 に API シグネチャと使用例が記載されている
- [ ] Part 2 にエラーハンドリングとエッジケースの説明がある
- [ ] Part 2 に設定パラメータの一覧がある

### Task 12-2: システム仕様書更新

- [ ] Step 1-A: LOGS.md **2ファイル**更新（P1/P25対策）
- [ ] Step 1-A: SKILL.md **2ファイル**更新
- [ ] Step 1-A: topic-map.md 再生成（P2/P27対策）
- [ ] Step 1-B: 実装状況テーブル更新
- [ ] Step 1-C: 関連タスクテーブル更新
- [ ] Step 2: 新規インターフェース追加の仕様反映（`persistResult`, `persistError`, structural type）
- [ ] 仕様書更新は3ファイル以下/エージェントに分割（P43対策）

### Task 12-3: ドキュメント更新履歴

- [ ] 全Step（1-A/1-B/1-C/Step 2）の結果が個別に記録されている
- [ ] 「該当なし」の Step も明記されている
- [ ] 全Step完了後に「完了」を記載（P4対策）

### Task 12-4: 未タスク検出

- [ ] 0件でも出力されている
- [ ] `current` / `baseline` が分離記録されている
- [ ] MR-01 が未タスク候補として検討されている（P3対策）
- [ ] 未タスク管理の3ステップ（指示書・テーブル・リンク）が完了

### Task 12-5: スキルフィードバック

- [ ] 改善点なしでも出力されている
- [ ] `phase12-task-spec-compliance-check.md` が root evidence として作成されている

### 全体

- [ ] `outputs/phase-12/` 配下に5ファイル全て存在する
- [ ] `artifacts.json` と `outputs/artifacts.json` が一致している（P280対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## 漏れやすいポイント（再掲）

| Pitfall | 要点                                                      |
| ------- | --------------------------------------------------------- |
| P1      | LOGS.md は2箇所。片方忘れやすい                           |
| P2      | topic-map.md は仕様書変更があれば必ず再生成               |
| P27     | 追加だけでなく削除・更新も再生成トリガー                  |
| P29     | worktree環境でも `.claude` 正本を実更新する               |
| P3      | 未タスクは3ステップ（指示書→テーブル→リンク）で完結させる |

## 次のPhase

Phase 13: PR作成
