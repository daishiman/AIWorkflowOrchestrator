# Phase 12: ドキュメント更新 — PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## メタ情報

| 項目       | 値                      |
| ---------- | ----------------------- |
| Phase番号  | 12                      |
| 機能名     | provider-configs-update |
| タスクID   | TASK-LLM-MOD-01         |
| 作成日     | 2026-03-23              |
| 依存 Phase | Phase 11（手動テスト）  |

## 目的

TASK-LLM-MOD-01 の実装完了を受け、実装ガイド・システム仕様書・ログを更新し、未タスクを検出・記録する。全 Step の実行後に documentation-changelog.md を作成する（P4 対策: 全 Step 完了前に「完了」と記載しない）。

## 事前チェック【必須】

Phase 12 開始前に以下を確認する（P1-P4, P25-P28 対策）:

- [ ] Phase 11 の全手動テストが PASS であること
- [ ] `artifacts.json` が Phase 11 まで completed であること
- [ ] LOGS.md は aiworkflow-requirements と task-specification-creator の **2ファイル** を更新対象として認識していること
- [ ] SKILL.md は aiworkflow-requirements と task-specification-creator の **2ファイル** の変更履歴を更新対象として認識していること

## 実行タスク

| Task      | 内容                             | 主成果物                                      |
| --------- | -------------------------------- | --------------------------------------------- |
| Task 12-1 | 実装ガイド作成（2パート構成）    | `outputs/phase-12/implementation-guide.md`    |
| Task 12-2 | システム仕様書更新               | LOGS.md x2 + SKILL.md x2 + topic-map.md       |
| Task 12-3 | ドキュメント更新履歴作成         | `outputs/phase-12/documentation-changelog.md` |
| Task 12-4 | 未タスク検出レポート作成         | `outputs/phase-12/unassigned-task-report.md`  |
| Task 12-5 | スキルフィードバックレポート作成 | `outputs/phase-12/skill-feedback-report.md`   |

### Task 12-1: 実装ガイド作成

#### Part 1: 中学生レベル概念説明

`outputs/phase-12/implementation-guide.md` に Part 1 として以下を記述する。

---

**AI が話しかける相手（AI モデル）を最新版に切り替えた話**

AI チャットアプリは、メッセージを送ると AI モデルという「頭脳」が考えて返事をしてくれます。この「頭脳」には OpenAI の GPT や Anthropic の Claude など、複数の種類があります。

プログラムの中には「どの頭脳が使えるか」のリストが書いてありました。しかし時間が経つにつれ、新しいバージョンの頭脳が登場し、古いリストでは「最新の頭脳」が選べない状態になっていました。

今回やったことは、その「頭脳のリスト」を最新版に書き換えることです。例えば：

- 「GPT-4o」という古い頭脳を「GPT-5.4」という新しい頭脳に入れ替えた
- 「Claude 3.5 Sonnet」を「Claude Sonnet 4.6」に入れ替えた

さらに、「このモデル名はどの会社の頭脳か」を判断するプログラム（`inferProviderId`）が、新しいモデル名（`o3`, `o4-mini`）も正しく認識できることを確認しました。

---

#### Part 2: 開発者向け技術詳細

`outputs/phase-12/implementation-guide.md` に Part 2 として以下を記述する。

---

**変更ファイル**: `apps/desktop/src/main/handlers/llm.ts`

**変更内容**:

1. `PROVIDER_CONFIGS` の型定義に `description?: string` を追加（L33〜L41）

2. 各プロバイダーのモデル定義を差し替え:
   - OpenAI: 3モデル → 6モデル（`gpt-5.4`, `gpt-5.4-mini`, `gpt-5.4-nano`, `gpt-5.4-pro`, `o3`, `o4-mini`）
   - Anthropic: 3モデル → 3モデル（`claude-sonnet-4-6`, `claude-opus-4-6`, `claude-haiku-4-5`）
   - Google: 2モデル → 3モデル（`gemini-3.1-flash-lite-preview`, `gemini-3-flash-preview`, `gemini-3.1-pro-preview`）
   - xAI: 1モデル → 3モデル（`grok-3-mini`, `grok-4-1-fast-non-reasoning`, `grok-4-1-fast-reasoning`）
   - OpenRouter: 変更なし（4モデル維持）

3. `inferProviderId`: 変更なし（`o3`/`o4` パターンは実装済みだったため）

**設計判断**:

- `description` をオプショナル（`?:`）にすることで OpenRouter の既存モデル定義との後方互換を維持
- `LLMProvider` 共有型への `description` 追加は本タスクのスコープ外（別タスク化）

**テスト追加**:

- `apps/desktop/src/main/handlers/__tests__/llm.test.ts` に 38テストケース（Phase 4: 21ケース + Phase 6: 17ケース）を追加
  - T-01〜T-06: PROVIDER_CONFIGS 検証（新モデル存在・旧モデル非存在・isDefault・contextWindow）
  - T-07〜T-08: inferProviderId の o3/o4 パターン確認
  - T-09〜T-13: テスト拡充（OpenRouter 維持・contextWindow 精度・プロバイダー総数・モデル数）

---

### Task 12-2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

以下の2ファイルを更新する（P25 対策: 2ファイル同時更新）:

1. `.claude/skills/aiworkflow-requirements/LOGS.md` に以下を追記:

   ```
   ## 2026-03-23 TASK-LLM-MOD-01 完了
   - PROVIDER_CONFIGS のモデル定義を最新化（OpenAI/Anthropic/Google/xAI）
   - description フィールド追加
   - inferProviderId は変更不要を確認（既存コードで対応済み）
   ```

2. `.claude/skills/task-specification-creator/LOGS.md` に以下を追記:

   ```
   ## 2026-03-23 TASK-LLM-MOD-01 Phase 1-13 仕様書作成完了
   - docs/30-workflows/step-01-seq-task-01-provider-configs-update/ 配下に13ファイル作成
   ```

3. `.claude/skills/aiworkflow-requirements/SKILL.md` 変更履歴テーブルに以下を追記:

   ```
   | vX.X.X | 2026-03-23 | **TASK-LLM-MOD-01 完了**: PROVIDER_CONFIGS モデル定義更新（4プロバイダー）、description フィールド追加 |
   ```

4. `.claude/skills/task-specification-creator/SKILL.md` 変更履歴テーブルに以下を追記:
   ```
   | vX.X.X | 2026-03-23 | **TASK-LLM-MOD-01 Phase 1-13 仕様書作成完了** |
   ```

#### Step 1-B: 実装状況テーブル更新

`.claude/skills/aiworkflow-requirements/references/` 配下の LLM プロバイダー関連仕様書を確認し、実装ステータステーブルが存在する場合は更新する。

確認ファイル:

- `references/api-ipc-llm.md`（存在する場合）
- `references/interfaces-llm-providers.md`（存在する場合）

#### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "TASK-LLM-MOD-01" .claude/skills/aiworkflow-requirements/references/
```

マッチするファイルがある場合、そのファイルの TASK-LLM-MOD-01 のステータスを「完了」に更新する。

#### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

期待する出力:

```
✅ indexes/topic-map.md
✅ indexes/keywords.json
```

#### Step 2: システム仕様更新（新規インターフェース・アーキテクチャ変更がある場合のみ）

本タスクの変更内容（`PROVIDER_CONFIGS` のデータ定義と `description` フィールド追加）は既存インターフェースへの変更ではなく、データ更新であるため、システムアーキテクチャの変更はない。

ただし、以下の仕様書に「最新モデルID」として記載がある場合は更新する:

- `references/arch-llm-provider.md`（存在する場合）

### Task 12-3: documentation-changelog.md 作成

**注意**: このファイルは Task 12-1〜Task 12-4 の全 Step を実行した後に作成する（P4 対策）。

`outputs/phase-12/documentation-changelog.md` に以下を記録する:

```markdown
# Documentation Changelog — TASK-LLM-MOD-01

## 作成日: 2026-03-23

## Task 12-1: 実装ガイド

- [x] implementation-guide.md Part 1（中学生レベル概念説明）作成
- [x] implementation-guide.md Part 2（開発者向け技術詳細）作成

## Task 12-2: システム仕様書更新

### Step 1-A: タスク完了記録

- [x] aiworkflow-requirements/LOGS.md 更新
- [x] task-specification-creator/LOGS.md 更新

### Step 1-B: 実装状況テーブル

- [x] 対象ファイル確認済み（更新対象の有無を記録）

### Step 1-C: 関連タスクテーブル

- [x] grep で関連仕様書を確認済み（更新対象の有無を記録）

### Step 1-D: topic-map.md 再生成

- [x] generate-index.js を実行済み
- 実行ログ: （実行結果を貼付）

## Task 12-3: documentation-changelog.md

- [x] 全 Step 完了後に本ファイルを作成（P4 遵守）

## Task 12-4: 未タスク検出

- [x] unassigned-task-report.md を作成済み
- 検出件数: （実際の件数を記録）
```

### Task 12-4: 未タスク検出

#### Step 4-1: 未タスク検出の実施

以下の観点で未タスクを検出する：

| 検出観点                     | 内容                                                                    |
| ---------------------------- | ----------------------------------------------------------------------- |
| U-01 の後続作業              | 保存済みユーザー設定（旧モデルID）の移行戦略                            |
| U-02 の後続作業              | `LLMProvider` 共有型への `description` フィールド追加                   |
| description の Renderer 表示 | Renderer 側 UI（Settings 画面）で `description` を tooltip 等で表示する |
| Phase 10 MINOR 指摘          | description の文末句点統一等                                            |

#### Step 4-2: unassigned-task-report.md の作成

`docs/30-workflows/step-01-seq-task-01-provider-configs-update/outputs/phase-12/unassigned-task-report.md` を作成する。

検出した未タスクが 0 件の場合も「0件」として作成する（P3 対策）。

#### Step 4-3: 未タスク指示書の作成（0件超の場合）

検出した未タスクがある場合、以下の3ステップを全て実施する（P3/P38 対策）:

1. `docs/30-workflows/step-01-seq-task-01-provider-configs-update/unassigned-task/` 配下に指示書ファイルを作成
2. `docs/30-workflows/step-01-seq-task-01-provider-configs-update/` 内の task-workflow 相当ファイルの残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

### Task 12-5: スキルフィードバックレポート作成【必須】

改善点がなくても「改善点なし」としてレポートを作成する（省略不可）。

| 観点             | 記録内容                               |
| ---------------- | -------------------------------------- |
| テンプレート改善 | Phase テンプレートの漏れや曖昧さ       |
| ワークフロー改善 | 機械検証や手順分岐の改善余地           |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補 |

出力: `outputs/phase-12/skill-feedback-report.md`

## 参照資料

| 資料名                  | パス                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| Phase 11 手動テスト結果 | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/outputs/phase-11/manual-test-results.md` |
| タスク実行ルール        | `.claude/rules/05-task-execution.md`（Phase 12 必須チェックリスト）                                     |
| 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md`（P1-P4, P25, P43, P51, P58, P59 対策）                             |
| spec-update-workflow    | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`（存在する場合）             |

## 成果物

| 成果物                        | パス                                                                                                        | 形式     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| 実装ガイド（Part 1 + Part 2） | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/outputs/phase-12/implementation-guide.md`    | Markdown |
| documentation-changelog       | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/outputs/phase-12/documentation-changelog.md` | Markdown |
| 未タスク検出レポート          | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/outputs/phase-12/unassigned-task-report.md`  | Markdown |
| スキルフィードバックレポート  | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/outputs/phase-12/skill-feedback-report.md`   | Markdown |

## 完了条件

- [ ] implementation-guide.md の Part 1（中学生レベル概念説明）を作成した
- [ ] implementation-guide.md の Part 2（開発者向け技術詳細）を作成した
- [ ] aiworkflow-requirements/LOGS.md を更新した
- [ ] task-specification-creator/LOGS.md を更新した（2ファイル両方）
- [ ] 関連仕様書を grep で確認し、更新要否を判断した
- [ ] topic-map.md を generate-index.js で再生成した
- [ ] unassigned-task-report.md を作成した（0件でも作成）
- [ ] 未タスクがある場合は3ステップ（指示書・残課題テーブル・参照リンク）を全て完了した
- [ ] documentation-changelog.md を全 Task 完了後に作成した（P4 対策）
- [ ] aiworkflow-requirements/SKILL.md 変更履歴を更新した
- [ ] task-specification-creator/SKILL.md 変更履歴を更新した
- [ ] skill-feedback-report.md を作成した（改善点なしでも必須）
- [ ] artifacts.json の Phase 12 ステータスを更新した

## 統合テスト連携

Phase 12 では統合テストは実施しない。

## 多角的チェック観点

| 観点         | 確認項目                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------- |
| P1/P25 対策  | LOGS.md 2ファイル（aiworkflow-requirements + task-specification-creator）を同時更新したか |
| P2/P27 対策  | topic-map.md を generate-index.js で再生成し、実行ログを記録したか                        |
| P3/P38 対策  | 未タスクがある場合は3ステップ（指示書・残課題テーブル・参照リンク）を全て完了したか       |
| P4/P51 対策  | documentation-changelog.md を全 Task 完了後に作成したか（早期「完了」記載をしていないか） |
| P28/P29 対策 | SKILL.md 変更履歴を2ファイルとも更新したか                                                |
| P43 対策     | サブエージェントへの委譲は3ファイル以下/エージェントに分割したか                          |
| P59 対策     | changelog の件数と unassigned-task-detection の件数が一致しているか                       |

## サブタスク管理

Phase 12 のサブタスク委譲時は以下を遵守する:

- 1サブエージェントあたりの更新対象ファイルは **3ファイル以下**（P43 対策）
- changelog への記録は **全 Task 完了後** にメインエージェントが一括実施（P59 対策）
- サブエージェント完了後は `git diff --stat -- .claude/skills/` で実際の変更ファイルを検証

## タスク100%実行確認

Phase 12 完了時に以下を確認する:

- [ ] Task 12-1〜Task 12-5 の全タスクを実行した
- [ ] 全完了条件にチェックが入っている
- [ ] documentation-changelog.md の記載内容が実際の作業と一致している
- [ ] artifacts.json を Phase 12 completed に更新した

## 次の Phase

Phase 13: 完了（`phase-13-completion.md`）
