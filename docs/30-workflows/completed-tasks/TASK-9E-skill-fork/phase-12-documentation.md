# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 値                               |
| --------- | -------------------------------- |
| Phase     | 12                               |
| タスクID  | TASK-9E-SKILL-FORK               |
| 機能名    | skill-fork（スキルフォーク機能） |
| 作成日    | 2026-02-28                       |
| 前提Phase | Phase 11（手動テスト検証）       |
| 次Phase   | Phase 13（PR作成）               |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 事前チェック【必須】

Phase 12 実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む:
   - **P1**: LOGS.md 2ファイル更新漏れ
   - **P2**: topic-map.md 再生成忘れ
   - **P3**: 未タスク管理の3ステップ不完全
   - **P4**: documentation-changelog への早期「完了」記載
   - **P25**: LOGS.md 2ファイル更新漏れ（再発）
   - **P26**: システム仕様書更新遅延
   - **P27**: topic-map.md 再生成トリガーの判断ミス
   - **P28**: スキルフィードバックレポート未作成
   - **P29**: SKILL.md 変更履歴の更新漏れ
   - **P43**: サブエージェントの rate limit 中断（仕様書更新は3ファイル以下/エージェントに分割）

## 実行タスク

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

#### Part 1: 概念的説明（中学生レベル）

**必須要素**:

- 日常の例えを使った概念説明（「ファイルコピーのお手本」「レシピの写し」のようなアナロジー）
- 専門用語を使わない説明
- スキルフォークが「なぜ必要か」の動機説明
- 「何が起きるか」のステップバイステップ説明

**記載内容例**:

> 「スキルフォーク」は、お気に入りのレシピをノートに書き写すようなものです。
> 元のレシピ（フォーク元スキル）はそのまま残り、写したノート（新しいスキル）を自分好みにアレンジできます。
> 材料リスト（agents）、作り方の参考文献（references）、調理手順メモ（scripts）、写真（assets）のうち、
> 必要なものだけ選んで書き写すこともできます。

#### Part 2: 技術的詳細（開発者レベル）

**必須要素**:

- SkillForker API のインターフェース定義
- SkillForkOptions の各フィールドの説明と型
- SkillForkResult の各フィールドの説明
- SkillForkMetadata の構造と用途
- IPC チャンネル `skill:fork` の使用例
- エラーハンドリングパターン（バリデーションエラー、ファイルシステムエラー）
- Preload API の呼び出し例

```typescript
// 使用例
const result = await window.electronAPI.skill.fork({
  sourceSkill: "my-skill",
  newName: "my-skill-v2",
  description: "カスタマイズ版",
  copyAgents: true,
  copyReferences: true,
  copyScripts: false,
  copyAssets: false,
});
```

**成果物**: `outputs/phase-12/implementation-guide.md`

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**2ステップで実行**（両方必須確認）:

#### Step 1: タスク完了記録【必須・全タスク】

##### Step 1-A: 仕様書完了記録

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加（**2ファイル両方必須** — P1, P25）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新（⚠️ P29: 漏れやすい）
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新（⚠️ P29: 漏れやすい）

```markdown
## 完了タスク

### タスク: TASK-9E-SKILL-FORK スキルフォーク機能実装（2026-XX-XX完了）

| 項目       | 内容                 |
| ---------- | -------------------- |
| タスクID   | TASK-9E-SKILL-FORK   |
| ステータス | **完了**             |
| テスト数   | N（自動）+ 8（手動） |

> **注意**: テスト数は `pnpm test` 実行結果の実測値のみを記載すること。推定値・概算値は使用不可。
```

##### Step 1-B: 実装状況テーブル更新

- [ ] `api-ipc-agent.md` の IPC チャンネル一覧に `skill:fork` を追加（ステータス: 完了）
- [ ] `interfaces-agent-sdk-skill.md` に SkillForkOptions/SkillForkResult/SkillForkMetadata インターフェースを追加

##### Step 1-C: 関連タスクテーブル更新

```bash
# 関連仕様書の検索
grep -rn "TASK-9E" .claude/skills/aiworkflow-requirements/references/
grep -rn "skill-fork\|skill:fork\|SkillForker" .claude/skills/aiworkflow-requirements/references/
```

- [ ] 検索結果の関連仕様書を全て確認し、ステータスを更新

##### Step 1-D: topic-map.md 再生成（**仕様書に変更があれば必ず実行** — P2, P27）

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] 再生成された topic-map.md に新規セクションの行番号が正しく反映されていることを確認

#### Step 2: システム仕様更新【必須】

**TASK-9E はスキルフォーク機能という新規インターフェース追加のため、システム仕様更新は必須。**

更新対象ファイル:

| #   | 更新対象ファイル                          | 更新内容                                                                    | 必須/任意 |
| --- | ----------------------------------------- | --------------------------------------------------------------------------- | --------- |
| 1   | `api-ipc-agent.md`                        | skill:fork チャンネル追加、SkillForkOptions/SkillForkResult 型定義          | 必須      |
| 2   | `security-electron-ipc.md`                | skill:fork のセキュリティ検証パターン（sender検証、パス検証）               | 必須      |
| 3   | `architecture-overview.md`                | registerAllIpcHandlers に skill:fork 追加                                   | 必須      |
| 4   | `interfaces-agent-sdk-skill.md`           | SkillForkOptions/SkillForkResult/SkillForkMetadata インターフェース定義追加 | 必須      |
| 5   | `task-workflow.md`                        | 残課題テーブル更新、TASK-9E 完了タスクセクション追加                        | 必須      |
| 6   | `lessons-learned.md`                      | 実装教訓（新規パターン・落とし穴がある場合）                                | 任意      |
| 7   | `architecture-implementation-patterns.md` | 実装パターン（新規パターンがある場合）                                      | 任意      |

> **P43 対策**: 仕様書更新は3ファイル以下/エージェントに分割する。LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする。

#### Step 3: IPC 契約検証（**IPC 機能開発タスクのため必須**）

- [ ] `ipc-contract-checklist.md` Phase 1-6 を実施
- [ ] ハンドラー引数形式と Preload 側の呼び出し形式が一致（P44 対策）
- [ ] 引数名のセマンティクスが実際の値と一致（P45 対策）
- [ ] P42 準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）

> **SKILL 検証**: `spec-update-workflow.md` Step 1-G.3 に定義された正規経路コマンドで3スキル全てが Error 0件であることを確認する。

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

### Task 3: ドキュメント更新履歴 & artifacts.json 更新【必須】

ドキュメント更新履歴（documentation-changelog.md）を作成し、artifacts.json を更新する:

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/completed-tasks/TASK-9E-skill-fork

# Step 2: Phase 12完了登録（artifacts.json更新）
node scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/TASK-9E-skill-fork \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート,outputs/phase-12/skill-feedback-report.md:スキルフィードバック"
```

**artifacts.json 必須項目**:

- Phase 12 のステータスが `completed` に更新されていること
- 全 Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics` セクションに品質指標が記録されていること

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を更新
- 更新したドキュメントと変更内容を一覧化

> **P4 対策**: 全 Step 確認前に「完了」と記載しない。documentation-changelog.md への「完了」記載は全ステップ終了後に行う。

### Task 4: 未タスク検出【必須】

| #   | ソース                  | 確認項目                      |
| --- | ----------------------- | ----------------------------- |
| 1   | Phase 3 レビュー結果    | MINOR 判定の指摘事項          |
| 2   | Phase 10 レビュー結果   | MINOR 判定の指摘事項          |
| 3   | Phase 11 手動テスト結果 | スコープ外の発見事項          |
| 4   | 各 Phase 成果物         | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース            | TODO/FIXME/HACK/XXX コメント  |

**検出時の3ステップ（P3 準拠・P38 対策）**:

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成（**`tasks/` 直下ではない** — P38 対策）
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に未タスク参照リンクを追加

**0件の場合の出力形式**:

```markdown
# 未タスク検出レポート

## 検出結果

検出された未タスク: **0件**

## 確認ソース

| #   | ソース                  | 確認結果     |
| --- | ----------------------- | ------------ |
| 1   | Phase 3 レビュー結果    | 未タスクなし |
| 2   | Phase 10 レビュー結果   | 未タスクなし |
| 3   | Phase 11 手動テスト結果 | 未タスクなし |
| 4   | 各Phase成果物           | 未タスクなし |
| 5   | コードベース            | 未タスクなし |
```

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

### Task 5: スキルフィードバックレポート作成【必須】

ワークフロー改善点と技術的教訓を記録する。**改善点がなくても「改善点なし」としてレポートを作成する（省略不可）。**

| セクション         | 記載内容                                                |
| ------------------ | ------------------------------------------------------- |
| ワークフロー改善点 | Phase 実行中に発見したワークフロー上の改善提案          |
| 技術的教訓         | 実装中に得られた技術的な知見・注意点                    |
| スキル改善提案     | task-specification-creator / skill-creator への改善提案 |
| 新規 Pitfall 候補  | 06-known-pitfalls.md に追加すべき新規 Pitfall           |

**成果物**: `outputs/phase-12/skill-feedback-report.md`

## 仕様書別SubAgent分担（関心ごと分離）

| SubAgent | 担当関心ごと         | 担当仕様書                                                                                             | 必須成果                                                              |
| -------- | -------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| A        | IPC 契約整合         | `api-ipc-agent.md`, `ipc-contract-checklist.md`                                                        | `skill:fork` 契約追加、P44/P45 検証結果                               |
| B        | セキュリティ整合     | `security-electron-ipc.md`, `security-api-electron.md`, `error-handling.md`                            | sender 検証、sanitizeError、エラー分類同期                            |
| C        | インターフェース整合 | `interfaces-agent-sdk-skill.md`, `architecture-overview.md`                                            | `SkillForkOptions/SkillForkResult/SkillForkMetadata` と責務境界の同期 |
| D        | ワークフロー台帳整合 | `task-workflow.md`, `lessons-learned.md`                                                               | 完了タスク記録、残課題更新、教訓追記                                  |
| E        | スキル運用台帳整合   | `aiworkflow-requirements/LOGS.md`, `task-specification-creator/LOGS.md`, 両 `SKILL.md`, `topic-map.md` | Step 1-A/1-D 必須更新の完了                                           |

**統合責任者（本エージェント）**:

- SubAgent A〜E の出力を `documentation-changelog.md` と `spec-update-summary.md` に統合する
- `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` の最終結果を固定する

## 整合性監査マトリクス（2軸）

| 2軸（層 × 仕様）      | チェック項目                                                                    | 参照正本                        | 検証コマンド                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Main × API            | `skillHandlers.ts` が `skill:fork` を受理し `IpcResult<SkillForkResult>` を返す | `api-ipc-agent.md`              | `pnpm --filter @repo/desktop test -- --grep \"skill:fork\"`                                                                                  |
| Main × Security       | sender 検証、3段バリデーション、サニタイズが実装と一致                          | `security-electron-ipc.md`      | `pnpm --filter @repo/desktop test -- --grep \"validateIpcSender                                                                              | sanitize\"` |
| Preload × Security    | `skill-api.ts` が `IPC_CHANNELS.SKILL_FORK` を使用                              | `security-api-electron.md`      | `pnpm --filter @repo/desktop typecheck`                                                                                                      |
| Shared × Interface    | `SkillForkOptions/SkillForkResult/SkillForkMetadata` が shared 正本で単一管理   | `interfaces-agent-sdk-skill.md` | `pnpm --filter @repo/shared typecheck`                                                                                                       |
| Workflow × Governance | Phase 12 の Step 1-A〜1-G と成果物5点が揃う                                     | `spec-update-workflow.md`       | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-9E-skill-fork` |

## IF判定ルール（矛盾防止）

1. IF `skill-creator:fork` と `skill:fork` が同時に出現したら、用途を分離する
   `skill-creator:fork` は SkillCreator ドメイン、`skill:fork` は Skill API ドメインとして記述する。
2. IF Phase 依存参照が不足したら、依存Phase成果物を `参照資料` に追加する
   追加後に `verify-all-specs` を再実行する。
3. IF Step 2 対象仕様書に差分が出たら、Step 1-A を先に完了してから Step 2 を実施する
   更新順序は完了記録 → 実装状況更新 → 関連タスク更新 → 仕様差分更新。
4. IF 未タスク候補が 1 件以上なら、検出レポート作成で終了しない
   `unassigned-task` 作成と `task-workflow.md` 登録まで実施する。

## アーキテクチャ層別ドキュメント

実装ガイド Part 2 では、以下の層別にドキュメントを作成する:

| 層                 | ドキュメント内容                                               | 更新対象                        |
| ------------------ | -------------------------------------------------------------- | ------------------------------- |
| Main Process       | SkillForker サービス設計、fork アルゴリズム                    | `architecture-*.md`, `api-*.md` |
| IPC通信            | skill:fork チャンネル定義、SkillForkOptions/SkillForkResult 型 | `interfaces-*.md`, `api-*.md`   |
| Preload            | skill.fork API 公開、セキュリティ考慮事項                      | `security-api-electron.md`      |
| Shared             | SkillForkOptions/SkillForkResult/SkillForkMetadata 型定義      | `interfaces-agent-sdk-skill.md` |
| エラーハンドリング | バリデーションエラー、ファイルシステムエラーの処理             | `error-handling.md`             |

## 漏れやすいポイント（06-known-pitfalls.md 参照）

| ID  | ポイント                            | 対策                                                                |
| --- | ----------------------------------- | ------------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ           | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2  | topic-map.md 再生成忘れ             | セクション変更時は必ず `generate-index.js` を実行                   |
| P27 | topic-map.md 再生成トリガー判断ミス | 追加だけでなく削除・更新も再生成トリガー                            |
| P29 | SKILL.md 変更履歴の更新漏れ         | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新              |
| P3  | 未タスク管理の3ステップ不完全       | ①指示書 → ②task-workflow.md登録 → ③関連仕様書リンク                 |

## 参照資料

| 資料名                 | パス                                                                           | 説明                  |
| ---------------------- | ------------------------------------------------------------------------------ | --------------------- |
| Phase 2 成果物         | `outputs/phase-2/architecture-design.md`                                       | 設計仕様              |
| Phase 5 成果物         | `outputs/phase-5/implementation-summary.md`                                    | 実装結果              |
| Phase 6 成果物         | `outputs/phase-6/test-expansion.md`                                            | 拡充テスト結果        |
| Phase 7 成果物         | `outputs/phase-7/coverage-report.md`                                           | カバレッジ判定結果    |
| Phase 8 成果物         | `outputs/phase-8/refactoring-notes.md`                                         | リファクタリング結果  |
| Phase 9 成果物         | `outputs/phase-9/quality-verification.md`                                      | 品質ゲート結果        |
| Phase 11 成果物        | `outputs/phase-11/`                                                            | 手動テスト結果        |
| Phase 10 成果物        | `outputs/phase-10/final-review-result.md`                                      | 最終レビュー結果      |
| 仕様書更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新手順の正本        |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                           | Phase 12 関連 Pitfall |
| IPC契約チェックリスト  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | IPC 検証手順          |

## 成果物

| 成果物                       | パス                                            | 必須 | 説明                                 |
| ---------------------------- | ----------------------------------------------- | ---- | ------------------------------------ |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的 + 技術的ドキュメント          |
| 仕様書更新サマリー           | `outputs/phase-12/spec-update-summary.md`       | ✅   | 更新した仕様書の一覧                 |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                             |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（**0件でも出力必須**）      |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | ✅   | 改善点（**改善点なしでも出力必須**） |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成                       |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明・日常例え使用）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細・API使用例）が作成されている
- [ ] 実装ガイドのテストカテゴリテーブルが Phase 6 後の実測値を反映している
- [ ] **【Task 2 Step 1-A】該当仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1-A】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.md にタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.md にタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/SKILL.md 変更履歴テーブルを更新した** ⚠️ 漏れやすい（P29）
- [ ] **【Task 2 Step 1-A】task-specification-creator/SKILL.md 変更履歴テーブルを更新した** ⚠️ 漏れやすい（P29）
- [ ] **【Task 2 Step 1-B】api-ipc-agent.md に skill:fork チャンネルを追加した**
- [ ] **【Task 2 Step 1-B】interfaces-agent-sdk-skill.md に SkillForkOptions/SkillForkResult/SkillForkMetadata を追加した**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した（該当する場合）**
- [ ] **【Task 2 Step 1-D】topic-map.md を再生成した** ⚠️ 漏れやすい（P2, P27 参照）
  - 再生成トリガー: セクション追加/削除/更新、行数変更
  - コマンド: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- [ ] **【Task 2 Step 2】システム仕様更新の7ファイルを確認し、必須ファイルを全て更新した**
- [ ] **【Task 2 Step 2】SubAgent A〜E の担当仕様書更新が完了している**
- [ ] **【Task 2 Step 3】IPC 契約検証を実施した（ipc-contract-checklist.md Phase 1-6）**
- [ ] **【Task 2 Step 3】P42 準拠3段バリデーション確認済み**
- [ ] **【Task 2 Step 3】P44/P45 準拠（引数形式・命名の整合性）確認済み**
- [ ] **アーキテクチャ層別のドキュメントが作成されている（Main/IPC/Preload/Shared/エラーハンドリング）**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] 未タスク指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/` で検証）
- [ ] **スキルフィードバックレポートが出力されている**【必須・改善点なしでも作成】
- [ ] documentation-changelog.md が作成されている
- [ ] artifacts.json が更新されている
- [ ] **artifacts.json の全完了 Phase（1-12）のステータスが completed であること**
- [ ] **苦戦箇所セクションを記録した**（苦戦なしの場合は「0件」と明記）
- [ ] **スキル検証（quick_validate.js）で3スキル全て Error 0件**
- [ ] **本Phase内の全タスクを100%実行完了**

## 苦戦箇所の記録【推奨】

タスク実行中に苦戦した箇所があれば、以下に記録する。将来の類似タスクの参考になる。

### 記録テンプレート

```markdown
## 苦戦箇所

### 1. {{問題の概要}}

- **症状**: {{発生した問題の具体的な症状}}
- **原因**: {{問題の根本原因}}
- **解決策**: {{採用した解決策}}
- **学び**: {{将来のタスクへの教訓}}
- **関連Pitfall**: {{該当する場合はPitfall ID（例: P31）}}
```

### 苦戦箇所を未タスク化する3ステップ（P3 準拠）

苦戦箇所を記録した場合は、以下を同一ターンで実行する:

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成する
2. `task-workflow.md` の残課題テーブルへ登録する
3. 関連仕様書に未タスク参照リンクを追加する

苦戦箇所が 0 件の場合でも、成果物に「苦戦箇所なし（0件）」を明記する。

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| `generate-documentation-changelog.js` | 手動で documentation-changelog.md を作成                                             |
| `complete-phase.js`                   | 手動で artifacts.json を更新                                                         |
| `detect-unassigned-tasks.js`          | 手動で各 Phase のレビュー結果・発見課題を確認し、unassigned-task-detection.md を作成 |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                   |
| `generate-index.js`                   | 手動で topic-map.md のセクション行番号を更新                                         |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 事前チェック（既知の落とし穴確認）
2. Task 1: 実装ガイド作成（Part 1 + Part 2）
3. Task 2 Step 1: タスク完了記録（LOGS.md×2、SKILL.md×2 含む）
4. Task 2 Step 2: システム仕様更新（7ファイル確認・更新）
5. Task 2 Step 3: IPC 契約検証
6. Task 2 Step 1-D: topic-map.md 再生成
7. Task 3: ドキュメント更新履歴 & artifacts.json 更新
8. Task 4: 未タスク検出レポート作成
9. Task 5: スキルフィードバックレポート作成
10. スキル検証（quick_validate.js）
11. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9E-skill-fork --phase 12
```

## 次のPhase

Phase 13: PR作成
