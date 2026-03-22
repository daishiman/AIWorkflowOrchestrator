# Phase 12: ドキュメント

## メタ情報

| 項目          | 内容                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------- |
| Phase番号     | 12                                                                                             |
| 機能名        | LLM設定永続化修正 (TASK-FIX-LLM-CONFIG-PERSISTENCE)                                            |
| 作成日        | 2026-03-20                                                                                     |
| 担当          | -                                                                                              |
| ステータス    | 未着手                                                                                         |
| 前Phase成果物 | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-11-manual-test.md` |

## 目的

実装ガイド作成・システム仕様書更新・documentation-changelog記録・未タスク検出の4つのタスクを完了し、TASK-FIX-LLM-CONFIG-PERSISTENCEの成果物を仕様書に反映させる。

> **警告**: P1/P25対策 — LOGS.md は `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の2ファイルを両方更新すること。
> **警告**: P4/P51対策 — documentation-changelogへの「完了」記載は全Step完了後の最後に行うこと。

## 実行タスク

### Task 1: 実装ガイド作成

#### Part 1: 中学生レベル概念説明（日常例えを必須で含める）

**対象読者**: プログラミング初心者・非エンジニア

**作成内容**: `outputs/phase-12/implementation-guide.md` の Part 1 セクション

**説明すべき概念**:

1. **永続化（persist）とは**: アプリを閉じても設定が消えない仕組み
   - 日常例え: 「メモ帳に書いたことは閉じても残る。でもホワイトボードに書いたことは電源を切ると消えてしまう。Zustand の persist は、選択した AI のプロバイダー設定をメモ帳に書き残す仕組み」

2. **マイグレーション（migrate）とは**: 古い形式のデータを新しい形式に変換する仕組み
   - 日常例え: 「古い家族アルバムの写真を、新しいデジタルフォトフレーム用に整理するような作業。昔の写真（古いデータ）を捨てずに新しい保存形式に移し替える」

3. **バリデーション（validation）とは**: 保存されたデータが今も正しく使えるかを確認する
   - 日常例え: 「お財布に入れていた会員カードを使おうとする前に、まず『このお店はまだあるかな？』と確認するようなもの。存在しなくなったお店のカードは捨てる（null クリア）」

#### Part 2: 開発者向け実装詳細

**対象読者**: このコードベースを実装・保守するエンジニア

**作成内容**: `outputs/phase-12/implementation-guide.md` の Part 2 セクション

**記述すべき内容**:

1. **変更ファイルと変更内容**
   - `apps/desktop/src/renderer/store/index.ts`: partialize拡張・version更新・migrate関数追加
   - `apps/desktop/src/renderer/store/slices/llmSlice.ts`: validateAndSyncPersistedConfig関数・起動時同期

2. **設計上の重要な判断**
   - P62対策: DEFAULT_CONFIGへのfallback禁止とnullクリアの理由
   - `availableProviders` が空配列の場合に判断を保留する理由（providers fetchが未完了/失敗の可能性）
   - persist version を v1→v2 にした理由と migrate 関数の必要性

3. **テスト戦略**
   - 作成したテストケース（T1〜T8）の概要
   - 境界値テスト（null入力・空配列・無効Provider）の意図

4. **既知の制約**
   - Zustand hydrate完了前に `syncSelectedConfigToMain()` を呼ぶと古い値（null）が同期されるリスク
   - providers fetchのタイミング依存

**実装ガイドの出力先**: `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/implementation-guide.md`（新規作成または追記）

---

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

> **P43対策**: 更新対象が4ファイル以上の場合は SubAgent を複数に分割（3ファイル以下/エージェント）

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書（`arch-state-management.md`）にタスク完了記録を追加する
- [ ] `aiworkflow-requirements/LOGS.md` を更新する
- [ ] `task-specification-creator/LOGS.md` を更新する（**2ファイル両方**、P1対策）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- [ ] `task-specification-creator/SKILL.md` の変更履歴を更新する

```bash
# LOGS.md の場所を確認
find .claude/skills -name "LOGS.md"
# 2ファイル存在することを確認
```

#### Step 1-B: 実装状況テーブル更新（該当する場合）

- [ ] `arch-state-management.md` のpersist設定セクションに `selectedProviderId` / `selectedModelId` 追加を記録する

#### Step 1-C: 関連タスクテーブル

```bash
# 関連仕様書の検索
grep -rn "TASK-FIX-LLM-CONFIG-PERSISTENCE" .claude/skills/aiworkflow-requirements/references/
```

- [ ] 検索結果の仕様書に完了ステータスを更新する

#### Step 1-D: topic-map.md 再生成

```bash
# topic-map.md 再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] `node generate-index.js` を実行し、topic-map.md を再生成した

#### Step 2: システム仕様更新（該当する場合）

以下の変更は新規インターフェース・アーキテクチャ変更に該当するため更新する:

- [ ] `arch-state-management.md`: persist対象フィールドのリストに `selectedProviderId` / `selectedModelId` を追加する
- [ ] persist version v2 への更新を記録する

---

### Task 3: outputs/phase-12/documentation-changelog.md

> **P4/P51対策**: 全 Step 確認前に「完了」と記載しない。各 Step の実行後に事後記録する。

**出力先**: `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/documentation-changelog.md`（新規作成または追記）

**記録内容**:

- Task 1 実装ガイド: 作成したファイルのパスと主な内容
- Task 2 Step 1-A: 更新した LOGS.md / SKILL.md のパスと更新内容
- Task 2 Step 1-B: arch-state-management.md の更新内容
- Task 2 Step 1-C: 関連仕様書の検索結果と更新内容
- Task 2 Step 1-D: generate-index.js の実行結果（再生成されたファイル数等）
- Task 2 Step 2: システム仕様更新の内容
- Task 4 未タスク検出: 検出件数と対応結果

---

### Task 4: 未タスク検出

> **P3/P38対策**: 0件でも必須。未タスク指示書は `docs/30-workflows/unassigned-task/` に配置すること。

**検出基準**: このタスク実装中に発見した、今回のスコープ外の問題・改善点

**検出例**（Phase 2 設計レビュー観点より）:

- fetchProviders失敗時のバリデーション動作の明確化
- persist storageの暗号化（将来的なセキュリティ強化）

**3ステップを必ず全て実行**:

1. `docs/30-workflows/unassigned-task/<タスク名>.md` に指示書を作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書（例: `arch-state-management.md`）に参照リンクを追加する

**outputs/phase-12/unassigned-task-detection.md の更新**:

```bash
# 既存の outputs/phase-12/unassigned-task-detection.md を確認
find docs/ -name "outputs/phase-12/unassigned-task-detection.md"
```

- [ ] `outputs/phase-12/unassigned-task-detection.md` の件数・ステータスを更新する
- [ ] `artifacts.json` の Phase 12 ステータスを更新する（存在する場合）

**P56対策**: 再評価クローズした未タスクがある場合は対応する GitHub Issue を `gh issue close` で同時に Close する。

## 参照資料

### プロジェクトルール

| 資料名           | パス                                 |
| ---------------- | ------------------------------------ |
| タスク実行ルール | `.claude/rules/05-task-execution.md` |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md` |

### 前Phase成果物

| 資料名              | パス                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Phase 11 手動テスト | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-11-manual-test.md` |

### 既知の落とし穴（Phase 12 固有）

| 落とし穴ID | 説明                                                | 対策                                                         |
| ---------- | --------------------------------------------------- | ------------------------------------------------------------ |
| P1/P25     | LOGS.md 2ファイル更新漏れ                           | aiworkflow-requirements と task-specification-creator の両方 |
| P2/P27     | topic-map.md 再生成忘れ                             | `node generate-index.js` を必ず実行する                      |
| P3/P38     | 未タスク管理の3ステップ不完全・配置ディレクトリ誤り | `unassigned-task/` ディレクトリへの配置を確認する            |
| P4/P51     | documentation-changelog への早期「完了」記載        | 全 Step 完了後の最後に記録する                               |
| P43        | サブエージェントの rate limit 中断                  | 更新ファイルを3以下/エージェントに分割する                   |
| P56        | 再評価クローズ時の GitHub Issue Close 漏れ          | クローズ時に `gh issue close` を同時実行する                 |
| P57        | 設計タスクでの仕様書更新先送り                      | worktree 環境でも Phase 12 完了時に実更新する                |
| P59        | 並列エージェントの changelog 件数不整合             | changelog は最後にメインエージェントが統合して記録する       |

## 実行手順

1. **Task 1 の実施**: 実装ガイド Part 1（中学生向け例え）と Part 2（技術者向け）を作成する
2. **Task 2 Step 1-A の実施**: LOGS.md (2ファイル) と SKILL.md (2ファイル) を更新する
3. **Task 2 Step 1-B の実施**: arch-state-management.md の実装状況テーブルを更新する
4. **Task 2 Step 1-C の実施**: `grep -rn "TASK-FIX-LLM-CONFIG-PERSISTENCE"` で関連仕様書を検索して更新する
5. **Task 2 Step 1-D の実施**: `node generate-index.js` で topic-map.md を再生成する
6. **Task 2 Step 2 の実施**: arch-state-management.md のシステム仕様を更新する
7. **Task 3 の実施**: 全 Step の実行結果を outputs/phase-12/documentation-changelog.md に事後記録する
8. **Task 4 の実施**: 未タスクを検出し、3ステップで登録する（0件でも実施・記録する）
9. **最終確認**: `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認する

## 成果物

| 成果物                        | パス                                                                                                                 | 説明                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 12 仕様書（本ファイル） | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-12-documentation.md`                     | ドキュメント化計画書               |
| 実装ガイド                    | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/implementation-guide.md`      | Part 1（概念）+ Part 2（技術詳細） |
| documentation-changelog       | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/documentation-changelog.md`   | 全 Step の変更記録                 |
| unassigned-task-detection     | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/unassigned-task-detection.md` | 0件でも作成必須                    |
| 更新済みシステム仕様書        | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                         | persist設定更新反映                |

## 完了条件

- [ ] Task 1: 実装ガイド Part 1（中学生向け例え）を作成した
- [ ] Task 1: 実装ガイド Part 2（技術者向け詳細）を作成した
- [ ] Task 2 Step 1-A: `aiworkflow-requirements/LOGS.md` を更新した
- [ ] Task 2 Step 1-A: `task-specification-creator/LOGS.md` を更新した（**P1対策: 2ファイル両方**）
- [ ] Task 2 Step 1-A: `aiworkflow-requirements/SKILL.md` の変更履歴を更新した
- [ ] Task 2 Step 1-A: `task-specification-creator/SKILL.md` の変更履歴を更新した
- [ ] Task 2 Step 1-B: arch-state-management.md の persist 設定テーブルを更新した
- [ ] Task 2 Step 1-C: 関連仕様書を検索し、必要な更新を行った
- [ ] Task 2 Step 1-D: `node generate-index.js` を実行し、topic-map.md を再生成した（**P2対策**）
- [ ] Task 2 Step 2: arch-state-management.md のシステム仕様（persist対象フィールド・version）を更新した
- [ ] Task 3: outputs/phase-12/documentation-changelog.md に全 Step の実行結果を事後記録した（**P4対策: 完了は最後**）
- [ ] Task 4: outputs/phase-12/unassigned-task-detection.md を作成した（**0件でも必須**）
- [ ] Task 4: 未タスクを3ステップで登録した（指示書作成 → task-workflow登録 → 仕様書リンク追加）
- [ ] `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認した（**P51対策**）

## 次Phase

Phase 13: 完了（`phase-13-pr-creation.md`）
