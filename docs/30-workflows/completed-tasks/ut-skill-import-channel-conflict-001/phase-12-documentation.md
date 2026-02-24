# Phase 12: ドキュメント — UT-SKILL-IMPORT-CHANNEL-CONFLICT-001

## メタ情報

| 項目               | 値                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------ |
| タスクID           | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001                                                       |
| Phase              | 12 — ドキュメント                                                                          |
| 機能名             | ut-skill-import-channel-conflict-001                                                       |
| 前提Phase          | Phase 11（手動テスト）完了                                                                 |
| 成果物ディレクトリ | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/` |
| 作成日             | 2026-02-24                                                                                 |

## 目的

実装ガイド・システム仕様書・変更履歴・未タスク検出レポート・スキルフィードバックレポートを作成し、タスク完了に必要な全ドキュメントを整備する。

## 背景

> **最重要**: Phase 12 は漏れが最も発生しやすい Phase。必ず全項目を逐次確認する。
> 参照: P1（LOGS.md 2ファイル）、P2（topic-map.md）、P3（未タスク3ステップ）、P4（早期完了記載）、P25-P29（Phase 12固有の落とし穴）、P43（サブエージェントrate limit）

### 事前チェック（Phase 12 開始時の必須確認）

- [ ] **P1対策**: LOGS.md 2ファイル更新が必要（aiworkflow-requirements + task-specification-creator）
- [ ] **P2/P27対策**: topic-map.md 再生成が必要（仕様書に変更があれば必ず再生成）
- [ ] **P3対策**: 未タスク管理は3ステップ全完了が必要（指示書 → 残課題テーブル → 関連仕様書リンク）
- [ ] **P4対策**: documentation-changelog.md に全Step確認前に「完了」と記載しない
- [ ] **P25対策**: LOGS.md は2箇所あり、片方の更新忘れに注意
- [ ] **P26対策**: Phase 12完了時点でシステム仕様書を更新する。PRマージを待たない
- [ ] **P27対策**: セクションの追加・削除・更新があれば topic-map.md を再生成
- [ ] **P28対策**: スキルフィードバックレポートは改善点なしでも作成必須
- [ ] **P29対策**: SKILL.md 変更履歴テーブルも更新が必要

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 1: 実装ガイド作成

#### Part 1: 中学生レベル概念説明

**出力先**: `outputs/phase-12/implementation-guide.md` の前半部分

**必須要件**:

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座にカッコ書きで説明）
- 図や表を活用して視覚的に説明

**推奨する日常例え**:

| 概念                                       | 推奨する日常例え                                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| IPC チャネル名                             | お店の商品棚の「棚番号」。同じ番号の棚が2つあったら、商品を間違った棚に置いてしまう      |
| チャネル名競合                             | 同じ住所に2軒の家がある状態。郵便局が手紙をどちらに届けるか分からなくなる                |
| `skill:import` vs `skill:importFromSource` | 「近所のお店で買う」と「ネット通販で買う」の違い。どちらも「買う」だけど、方法が全く違う |
| 仕様書修正（予防的タスク）                 | 建物を建てる前に設計図の住所表記を直す。建ててからでは修正が大変                         |

**構成テンプレート**:

```markdown
## 1. なぜチャネル名が重要なの？

### 1.1 IPC チャネルって何？

[お店の棚番号の例えで IPC チャネルを説明]

### 1.2 チャネル名が被るとどうなる？

[同じ住所に2軒の家がある例えで競合問題を説明]

### 1.3 今回やったこと

[「近所のお店」と「ネット通販」の例えで改名の意図を説明]

### 1.4 なぜ「建てる前」に直すの？

[設計図の修正が安い段階で行う例えで予防的タスクの意義を説明]
```

#### Part 2: 技術者向け実装詳細

**出力先**: `outputs/phase-12/implementation-guide.md` の後半部分

**必須セクション**:

1. **修正内容の技術的説明**

   | 修正対象           | 修正前                                    | 修正後                   | 理由                               |
   | ------------------ | ----------------------------------------- | ------------------------ | ---------------------------------- |
   | task-022 Step 3    | `skill:import`（外部インポート用）        | `skill:importFromSource` | 既存ローカルインポートとの名前衝突 |
   | task-030 §15B.2    | `skill:import`（IPC テーブル 4行）        | `skill:importFromSource` | task-022 と整合                    |
   | task-030 §11       | チャネル不足                              | 3チャネル追加            | TASK-9F 必要チャネルの網羅         |
   | task-022 artifacts | `channels.ts` / `preload/types.ts` 未記載 | modifies に追加          | TASK-9F 実装時の変更範囲明示       |

2. **IPC チャネル命名規則**

   ```
   skill:{動詞}           — 既存ローカル操作（list, import, remove, get, update 等）
   skill:{動詞}FromSource — 外部ソース操作（importFromSource）
   skill:{動詞}Source     — ソース関連操作（validateSource）
   skill:{動詞}           — 新規単純操作（export）
   ```

3. **関連する既知の落とし穴**

   | Pitfall | 概要                          | 本タスクとの関連                                      |
   | ------- | ----------------------------- | ----------------------------------------------------- |
   | P5      | ipcMain.handle() 二重登録例外 | 同名チャネルを2つ定義すると実行時例外が発生する       |
   | P44     | IPCハンドラとPreloadの不整合  | チャネル名不一致で引数が undefined になるバグパターン |
   | P45     | IPC引数命名の契約ドリフト     | 引数名と実際の値のセマンティクス不一致                |

4. **TASK-9F 実装者向けの注意事項**
   - `channels.ts` に `SKILL_IMPORT_FROM_SOURCE = "skill:importFromSource"` を追加する
   - `preload/types.ts` に新チャネルの型定義を追加する
   - 既存の `SKILL_IMPORT = "skill:import"` は変更しない

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

以下のファイルを**全て**更新する:

| #   | 更新対象ファイル                      | 更新内容                                    |
| --- | ------------------------------------- | ------------------------------------------- |
| 1   | `aiworkflow-requirements/LOGS.md`     | タスク完了記録追加                          |
| 2   | `task-specification-creator/LOGS.md`  | タスク完了記録追加（**P1: 2ファイル両方**） |
| 3   | `aiworkflow-requirements/SKILL.md`    | 変更履歴テーブル更新（**P29対策**）         |
| 4   | `task-specification-creator/SKILL.md` | 変更履歴テーブル更新（**P29対策**）         |

**LOGS.md 更新フォーマット**:

```markdown
### UT-SKILL-IMPORT-CHANNEL-CONFLICT-001: skill:import IPCチャネル名競合の解消（{完了日}完了）

| 項目         | 値                                                                   |
| ------------ | -------------------------------------------------------------------- |
| タスク種別   | 仕様書修正のみ（コード変更なし）                                     |
| 修正ファイル | task-022-task-9f-skill-share.md, task-030-ui-05-skill-center-view.md |
| 修正内容     | チャネル名 skill:import → skill:importFromSource（TASK-9F外部用）    |
| ドキュメント | implementation-guide.md, documentation-changelog.md                  |
```

#### Step 1-B: 実装状況テーブル更新

- [ ] 本タスクは仕様書修正のみのため、実装ステータスは `spec_created` を適用
- [ ] 関連する仕様書の実装状況テーブルがある場合、ステータスを更新

#### Step 1-C: 関連タスクテーブル更新

以下のコマンドで関連仕様書を検索し、全て更新する:

```bash
grep -rn "UT-SKILL-IMPORT-CHANNEL-CONFLICT-001" .claude/skills/aiworkflow-requirements/references/
grep -rn "UT-SKILL-IMPORT-CHANNEL-CONFLICT-001" .claude/skills/task-specification-creator/references/
grep -rn "UT-SKILL-IMPORT-CHANNEL-CONFLICT-001" docs/30-workflows/
```

- [ ] 検索で発見された全仕様書のタスク参照テーブルでステータスを更新

#### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] 上記コマンドを実行し、topic-map.md が再生成された
- [ ] 再生成後の diff を確認し、想定通りの更新内容である

#### Step 2: システム仕様更新

**更新判断**: 本タスクは仕様書修正のみであり、新規インターフェースやアーキテクチャ変更を含まない。

| 条件                     | 対象仕様書 | 更新有無                       |
| ------------------------ | ---------- | ------------------------------ |
| 新規インターフェース追加 | なし       | **更新なし**（仕様書修正のみ） |
| アーキテクチャ変更       | なし       | **更新なし**（仕様書修正のみ） |
| IPC チャネル定義変更     | なし       | **更新なし**（コード未変更）   |

**理由**: 本タスクは既存コード・システム仕様への変更を伴わない。仕様書（Markdown）内のチャネル名を事前に改名するのみであり、システムの動作仕様は変わらない。TASK-9F 実装時に初めてシステム仕様への反映が必要となる。

### Task 3: documentation-changelog.md

**出力先**: `outputs/phase-12/documentation-changelog.md`

**必須要件**:

- 更新した**全**仕様書の変更内容を記録
- 各 Step（1-A / 1-B / 1-C / 1-D / Step 2）の結果を**個別に**明記
- **P4対策**: 全 Step 確認前に「完了」と記載しない

**テンプレート**:

```markdown
# Documentation Changelog — UT-SKILL-IMPORT-CHANNEL-CONFLICT-001

## Step 1-A: タスク完了記録

| #   | ファイル                            | 更新内容       | 完了 |
| --- | ----------------------------------- | -------------- | ---- |
| 1   | aiworkflow-requirements/LOGS.md     | タスク完了記録 |      |
| 2   | task-specification-creator/LOGS.md  | タスク完了記録 |      |
| 3   | aiworkflow-requirements/SKILL.md    | 変更履歴更新   |      |
| 4   | task-specification-creator/SKILL.md | 変更履歴更新   |      |

## Step 1-B: 実装状況テーブル

| #   | ファイル       | 更新内容                    | 完了 |
| --- | -------------- | --------------------------- | ---- |
| 1   | （該当仕様書） | spec_created ステータス適用 |      |

## Step 1-C: 関連タスクテーブル

| #   | ファイル | 更新内容 | 完了 |
| --- | -------- | -------- | ---- |

[grep結果に基づいて記載]

## Step 1-D: topic-map.md 再生成

| #   | ファイル     | 更新内容                   | 完了 |
| --- | ------------ | -------------------------- | ---- |
| 1   | topic-map.md | generate-index.js で再生成 |      |

## Step 2: システム仕様更新

更新なし（理由: 仕様書修正のみタスクであり、システム動作仕様への影響なし）

## 最終確認

- [ ] 全 Step の結果が記録されている
- [ ] 「完了」は全項目確認後に記載した
```

**artifacts.json 更新**: Phase 12 完了時に `artifacts.json` のステータスを更新する。

### Task 4: 未タスク検出レポート

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

**必須要件**: **0件でも作成必須**

#### 検出ソース（全て実施する）

| #   | 検出ソース                       | コマンド/方法                                    |
| --- | -------------------------------- | ------------------------------------------------ |
| 1   | Phase 10 最終レビュー MINOR 指摘 | `outputs/phase-10/final-review-result.md` を参照 |
| 2   | Phase 11 手動テスト発見事項      | `outputs/phase-11/manual-test-result.md` を参照  |
| 3   | 成果物の TODO/FIXME              | outputs 配下をキーワード検索（下記コマンド）     |

#### 仕様書修正タスク固有の検出パターン

以下の観点で未タスクを検出する:

```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" outputs/
```

- [ ] 他の仕様書に同様のチャネル名競合パターンが存在しないか
- [ ] TASK-9F の他の Step で `skill:import`（ローカル用）と混同しうる記述がないか
- [ ] task-030 の他のセクションで修正漏れがないか

#### 検出した未タスクの3ステップ処理

検出件数が1件以上の場合、**全ての**未タスクに対して以下の3ステップを実施する:

1. **指示書作成**: `docs/30-workflows/unassigned-task/` に指示書を作成
   - ファイル命名規則: `ut-skill-import-channel-conflict-{改善領域}.md`
   - 品質基準: Why/What/How 構成（unassigned-task-guidelines.md 準拠）
2. **残課題テーブル登録**: `task-workflow.md` に登録
3. **関連仕様書リンク追加**: 関連する仕様書に参照リンクを追加

- [ ] 物理ファイル存在確認: `ls docs/30-workflows/unassigned-task/ut-skill-import-channel-conflict-*.md`

#### 0件の場合

以下の形式で明示的に記録する:

```markdown
## 未タスク検出結果

検出件数: 0件

### 検索実施記録

| #   | 検出ソース              | 実施日 | 結果 |
| --- | ----------------------- | ------ | ---- |
| 1   | Phase 10 レビュー MINOR | {日付} | 0件  |
| 2   | Phase 11 手動テスト     | {日付} | 0件  |
| 3   | 成果物 TODO/FIXME       | {日付} | 0件  |
| 4   | 仕様書固有パターン検索  | {日付} | 0件  |
```

### Task 5: スキルフィードバックレポート

**出力先**: `outputs/phase-12/skill-feedback-report.md`

**必須要件**: **改善点がなくても作成必須**（P28対策）

**記録すべき観点**:

- タスク仕様書の品質（仕様書修正のみタスクの Phase テンプレート適合度）
- Phase 実行フローの改善点（仕様書修正のみタスクに不要な Phase の扱い）
- ツール・スクリプトの改善要望
- 落とし穴の追加候補（仕様書間のチャネル名不整合パターン）

## 漏れやすいポイントテーブル

| Pitfall | 概要                        | 確認方法                                    |
| ------- | --------------------------- | ------------------------------------------- |
| P1      | LOGS.md 2ファイル更新漏れ   | Step 1-A で両方のパスを確認                 |
| P2      | topic-map.md 再生成忘れ     | Step 1-D で `node generate-index.js` を実行 |
| P3      | 未タスク3ステップ不完全     | Task 4 で全ステップを確認                   |
| P27     | topic-map.md 再生成トリガー | 仕様書変更があれば必ず再生成                |
| P29     | SKILL.md 変更履歴更新漏れ   | Step 1-A で SKILL.md も更新                 |

## 参照資料

> 依存Phase成果物: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                                        | 内容                                        |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| API IPC仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 既存 `skill:import` 契約の正本確認          |
| Skillインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Renderer/Preload/Main の契約整合確認        |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | チャネルホワイトリストと契約ドリフト防止    |
| Skill IPC詳細         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `skill:import` 系チャネル検証要件の詳細確認 |
| 型/チャネル調査手順   | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | チャネル名衝突時の横断確認手順              |
| IPC契約チェック       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 3層同時更新チェック（P23/P32/P42/P44）      |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC不整合再発防止パターン参照               |
| 教訓                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 類似タスクの再発防止知見                    |

| 参照                             | パス                                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| index.md（タスク定義）           | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/index.md`                                               |
| task-022（修正対象）             | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`     |
| task-030（修正対象）             | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md` |
| 仕様更新フロー                   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                                  |
| 未タスクガイドライン             | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`                                            |
| Phase 10 レビュー結果            | `outputs/phase-10/final-review-result.md`                                                                                       |
| Phase 11 手動テスト結果          | `outputs/phase-11/manual-test-result.md`                                                                                        |
| P5（リスナー二重登録）           | `.claude/rules/06-known-pitfalls.md#P5`                                                                                         |
| P44（IPCインターフェース不整合） | `.claude/rules/06-known-pitfalls.md#P44`                                                                                        |

## 成果物

| #   | 成果物                        | パス                                            |
| --- | ----------------------------- | ----------------------------------------------- |
| 1   | 実装ガイド（Part 1 + Part 2） | `outputs/phase-12/implementation-guide.md`      |
| 2   | ドキュメント変更履歴          | `outputs/phase-12/documentation-changelog.md`   |
| 3   | 未タスク検出レポート          | `outputs/phase-12/unassigned-task-detection.md` |
| 4   | スキルフィードバックレポート  | `outputs/phase-12/skill-feedback-report.md`     |

## 完了条件

- [ ] Phase 12 の全Task（Task 1〜Task 5）を完了し、成果物を作成した

### Task 1: 実装ガイド

- [ ] Part 1: IPC チャネルを「棚番号」で例えている
- [ ] Part 1: チャネル名競合を「同じ住所に2軒の家」で例えている
- [ ] Part 1: 予防的タスクの意義を「設計図の事前修正」で例えている
- [ ] Part 1: 専門用語を使っていない（使用時はカッコ書き説明あり）
- [ ] Part 2: 修正内容の技術的説明テーブルが記載されている
- [ ] Part 2: IPC チャネル命名規則が記載されている
- [ ] Part 2: 関連する既知の落とし穴（P5/P44/P45）が記載されている
- [ ] Part 2: TASK-9F 実装者向けの注意事項が記載されている

### Task 2: システム仕様書更新

- [ ] Step 1-A: `aiworkflow-requirements/LOGS.md` 更新済み
- [ ] Step 1-A: `task-specification-creator/LOGS.md` 更新済み（**P1: 2ファイル両方**）
- [ ] Step 1-A: `aiworkflow-requirements/SKILL.md` 変更履歴更新済み（**P29対策**）
- [ ] Step 1-A: `task-specification-creator/SKILL.md` 変更履歴更新済み（**P29対策**）
- [ ] Step 1-B: 実装状況テーブルに `spec_created` ステータス適用
- [ ] Step 1-C: `grep` で関連仕様書を検索し、全て更新済み
- [ ] Step 1-D: `topic-map.md` を再生成済み（**P2/P27対策**）
- [ ] Step 2: 「更新なし」と理由（仕様書修正のみ、システム動作仕様への影響なし）を明記

### Task 3: documentation-changelog.md

- [ ] 更新した全仕様書の変更内容が記録されている
- [ ] 各 Step（1-A/1-B/1-C/1-D/Step 2）の結果が個別に明記されている
- [ ] 全 Step 確認後に「完了」と記載した（**P4対策**）

### Task 4: 未タスク検出レポート

- [ ] 全3検出ソース + 仕様書固有パターンを実施した
- [ ] 0件の場合でもレポートを作成した
- [ ] 1件以上の場合、3ステップ全完了:
  - [ ] `docs/30-workflows/unassigned-task/` に指示書作成（**P38: 配置先注意**）
  - [ ] `task-workflow.md` 残課題テーブルに登録
  - [ ] 関連仕様書に参照リンク追加

### Task 5: スキルフィードバックレポート

- [ ] レポートを作成した（**P28対策: 改善点0件でも必須**）

## Phase末端アクション【必須】

- [ ] `artifacts.json` の Phase 12 ステータスを `completed` に更新
- [ ] 全5タスクの完了を確認してからステータスを更新（P4対策: 早期完了記載禁止）
- [ ] LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする（P43対策）

## 依存関係

| 方向 | Phase / タスク           | 内容                               |
| ---- | ------------------------ | ---------------------------------- |
| 前提 | Phase 11（手動テスト）   | 手動テスト結果を未タスク検出に活用 |
| 前提 | Phase 10（最終レビュー） | レビュー結果を未タスク検出に活用   |
| 後続 | Phase 13（PR作成）       | ドキュメント完了後にPR準備         |

## 次のPhase

→ Phase 13（PR作成）`phase-13-pr-creation.md`
