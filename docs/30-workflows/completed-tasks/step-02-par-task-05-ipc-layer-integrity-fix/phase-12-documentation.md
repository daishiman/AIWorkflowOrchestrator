# Phase 12: ドキュメント

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 12                                                |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001              |
| 機能名   | skill-lifecycle-routing / ipc-layer-integrity-fix |
| 作成日   | 2026-03-17                                        |
| 前Phase  | [Phase 11: 手動テスト](./phase-11-manual-test.md) |
| 後Phase  | [Phase 13: PR 作成](./phase-13-pr-creation.md)    |

## 目的

実装内容を文書化し、システム仕様書を更新する。
未タスクがあれば検出・記録する。
スキルフィードバックレポートを作成する。

## 背景

Phase 12 は漏れが最も発生しやすい Phase であるため、既知の落とし穴を事前に確認すること。

### 事前確認必須: 既知の落とし穴

| Pitfall ID | タイトル                                 | 対策                                                                            |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| P1         | LOGS.md 2ファイル更新漏れ                | aiworkflow-requirements と task-specification-creator の**2ファイル両方**を更新 |
| P2         | topic-map.md 再生成忘れ                  | 仕様書に変更があれば**必ず**再生成を実行                                        |
| P27        | topic-map.md 再生成トリガー判断ミス      | セクション削除・更新も再生成トリガーに含める                                    |
| P29        | SKILL.md 変更履歴の更新漏れ              | LOGS.md だけでなく SKILL.md も更新                                              |
| P3         | 未タスク管理の3ステップ不完全            | 指示書 → 残課題テーブル → 関連仕様書リンク の全ステップ                         |
| P4         | documentation-changelog 早期「完了」記載 | 全 Step 確認前に「完了」と記載しない                                            |
| P25        | LOGS.md 2ファイル更新漏れ（再発）        | P1 と同様。明示的にチェック                                                     |
| P28        | スキルフィードバックレポート未作成       | 改善点がなくても「改善点なし」として作成                                        |
| P31        | システム仕様書更新漏れ（複数ファイル）   | IPC 関連では5ファイル以上を確認                                                 |

## 実行タスク

- 実装ガイド作成: Part 1（中学生レベル概念説明）と Part 2（技術者向け詳細）を作成する
- システム仕様書更新: Step 1-A（完了記録）、Step 1-B（実装状況）、Step 1-C（関連タスク）、Step 2（条件付きシステム仕様更新）を実施する
- ドキュメント更新履歴作成: documentation-changelog.md と artifacts.json / outputs/artifacts.json を更新する
- 未タスク検出レポート作成: 0件でも `outputs/phase-12/unassigned-task-detection.md` を出力する
- スキルフィードバックレポート作成: 改善点なしでも skill-feedback-report.md を出力する

> 以下の5タスクを全て実行してください（全タスク必須）。

### タスク 1: 実装ガイド作成

**目的**: SKILL_UPDATE ハンドラおよび getDetail / update Preload API の使用方法を文書化する

**実行手順**:

1. Part 1: 概念的説明（初学者・非技術者向け、中学生レベル）を作成する
2. Part 2: 技術的詳細（開発者向け）を作成する
3. IPC ドキュメント（チャンネル仕様）を作成する

#### Part 1: 概念的説明（中学生レベル — 日常例え必須）

以下の構成で作成すること:

```markdown
# IPC層整合性修正 実装ガイド

## Part 1: 概念的説明（中学生レベル）

### 「デッドチャンネル」とは？

デッドチャンネルとは、**存在するが誰も取り次いでくれない電話番号**のようなものです。

電話帳（チャンネル定数）には番号が載っている。
電話（invoke）はかけられる。
でも受話器を取る人（ipcMain.handle）がいない。
→ 永遠に呼び出し音が鳴り続ける、またはエラーになる。

本タスクはこの「受話器を取る人」を追加しました。

### 修正した2つの問題

| 問題                                | 例え                               | 解決策                         |
| ----------------------------------- | ---------------------------------- | ------------------------------ |
| SKILL_UPDATE デッドチャンネル       | 受話器を取る人がいない電話番号     | ipcMain.handle を追加した      |
| SKILL_GET_DETAIL Preload API 未公開 | 窓口看板はあるが窓口が開いていない | getDetail() メソッドを追加した |
```

#### Part 2: 技術者向け実装詳細

以下の構成で作成すること:

```markdown
## Part 2: 技術者向け実装詳細

### 実装概要

| 項目               | 値                                           |
| ------------------ | -------------------------------------------- |
| 修正ファイル数     | 2                                            |
| ハンドラーファイル | `apps/desktop/src/main/ipc/skillHandlers.ts` |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`      |

### 追加した IPC ハンドラー / Preload API

#### SKILL_UPDATE ハンドラ（skillHandlers.ts）

- P42 準拠3段バリデーション（typeof → 空文字列 → trim）
- P45 準拠命名（update は skillName、getDetail は skillId）
- P5 対策 unregister 登録済み

#### getDetail / update Preload API（skill-api.ts）

- safeInvokeUnwrap で IPC_CHANNELS 定数を使用し、business error は Preload 側で throw する
- P42 準拠バリデーションエラー処理
```

#### IPC ドキュメント

以下の構成で作成すること:

```markdown
### IPC チャンネル仕様（追加分）

| チャンネル名     | 引数                                                      | 戻り値                                                                | 説明                 |
| ---------------- | --------------------------------------------------------- | --------------------------------------------------------------------- | -------------------- |
| skill:update     | `{ skillName: string, updates: Record<string, unknown> }` | `{ success: true, data: void } \| { success: false, error: string }`  | スキルを更新する     |
| skill:get-detail | `{ skillId: string }`                                     | `{ success: true, data: Skill } \| { success: false, error: string }` | スキル詳細を取得する |
```

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク 2: システム仕様書更新

**目的**: aiworkflow-requirements のシステム仕様を更新する

> 参照: `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

**2ステップで実行**:

#### Step 1: タスク完了記録（必須）

##### Step 1-A: タスク完了記録

- [ ] 該当仕様書にタスク完了記録を追加する（child companion canonical set: `interfaces-*` / `security-*` / `architecture-*` / `task-workflow-*` / `lessons-*` を優先し、必要時のみ `indexes/quick-reference.md` / `indexes/resource-map.md` を補助参照する）
- [ ] `aiworkflow-requirements/LOGS.md` を更新する
- [ ] `.claude/skills/task-specification-creator/LOGS.md` を更新する（**2ファイル両方** — P1/P25 対策）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- [ ] `.claude/skills/task-specification-creator/SKILL.md` の変更履歴を更新する（P29 対策）

##### Step 1-B: 実装状況テーブル更新

- [ ] `interfaces-agent-sdk-skill-core.md` / `interfaces-agent-sdk-skill-details.md` / `architecture-overview-core.md` / `security-skill-ipc-core.md` / `security-electron-ipc-core.md` に current contract / 実装ステータスを更新する

##### Step 1-C: 関連タスクテーブル更新

```bash
# TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 を含む仕様書を検索する
grep -rn "TASK-IMP-IPC-LAYER-INTEGRITY-FIX\|SKILL_UPDATE\|SKILL_GET_DETAIL" \
  .claude/skills/aiworkflow-requirements/references/
grep -rn "TASK-IMP-IPC-LAYER-INTEGRITY-FIX\|SKILL_UPDATE\|SKILL_GET_DETAIL" \
  .claude/skills/task-specification-creator/references/
```

- [ ] 検出された仕様書の関連タスクテーブルを更新する

##### Step 1-D: generated index / workflow index 再生成

```bash
# aiworkflow-requirements の generated index を再生成する
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js

# task-specification-creator の workflow index を再生成する
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix \
  --regenerate
```

- [ ] `aiworkflow-requirements/indexes/topic-map.md` を再生成した
- [ ] `aiworkflow-requirements/indexes/keywords.json` を再生成した
- [ ] workflow `index.md` を `artifacts.json` と一致する状態へ再生成した

#### Step 2: システム仕様更新（IPC追加更新対象）

**更新判断**: SKILL_UPDATE ハンドラ新規追加・SKILL_GET_DETAIL Preload API 追加のため、IPC 関連仕様書の更新が**必要**。

**IPC 追加更新対象ファイル**:

| #   | 更新対象ファイル                                                                                              | 更新内容                                                           | 必須/任意 |
| --- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------- |
| 1   | `security-skill-ipc-core.md`                                                                                  | P42 3段バリデーション・P45 命名統一・object payload 標準を追記     | 必須      |
| 2   | `interfaces-agent-sdk-skill-core.md`                                                                          | getDetail / update の正式インターフェース定義を同期                | 必須      |
| 3   | `interfaces-agent-sdk-skill-details.md`                                                                       | `skill:get-detail` / `skill:update` の current contract 詳細を同期 | 必須      |
| 4   | `architecture-overview-core.md`                                                                               | IPCハンドラー一覧に SKILL_UPDATE を追加                            | 必須      |
| 5   | `security-electron-ipc-core.md`                                                                               | sender / whitelist / unwrap の追記                                 | 必須      |
| 6   | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-contract-preload-alignment.md` | 完了記録・current canonical set・残課題同期の反映                  | 必須      |
| 7   | `lessons-learned-auth-ipc-contract-bridge-audit-scope.md`                                                     | P42/P44/P45 対応の実装教訓                                         | 必須      |
| 8   | `lessons-learned-auth-ipc-phase12-type-gaps-preload-alignment.md`                                             | 型ギャップ / Phase 12 同期の教訓                                   | 必須      |

> 注: このタスクでは `api-ipc-agent*.md` 系は補助参照であり、primary canonical set には含めない。

**更新チェックリスト（P31 対策 — 複数ファイル更新漏れ防止）**:

- [ ] `security-skill-ipc-core.md` に P42/P45 バリデーションパターンを追記した
- [ ] `interfaces-agent-sdk-skill-core.md` に getDetail / update のインターフェースを追加した
- [ ] `interfaces-agent-sdk-skill-details.md` に `skill:get-detail` / `skill:update` の契約詳細を追加した
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-contract-preload-alignment.md` に完了タスクを記録した
- [ ] `architecture-overview-core.md` のIPCハンドラー一覧を更新した

#### Step 3: IPC 契約検証（IPC修正タスクのため必須）

- [ ] ipc-contract-checklist.md Phase 1-6 を実施済み（Phase 10 タスク 1 の結果を参照）
- [ ] ハンドラー引数形式と Preload 側の呼び出し形式が一致していることを確認済み
- [ ] 引数名のセマンティクスが実際の値と一致していることを確認済み（P45 対策）
- [ ] P42 準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）が実装済みであることを確認済み

**期待される成果物**:

- `outputs/phase-12/spec-update-summary.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

### タスク 3: ドキュメント更新履歴作成 & artifacts.json 更新

**目的**: 本タスクで行ったドキュメント更新を記録する

**実行手順**:

1. 更新した全仕様書の変更内容を記録する
2. 各 Step の完了結果を詳細に記録する（漏れの可視化）
3. `artifacts.json` と `outputs/artifacts.json` の Phase 12 ステータスを `completed` に更新する

**DON'T**: 全 Step 確認前に「完了」と記載しない（P4 対策）

**更新履歴テンプレート**:

```markdown
# TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 ドキュメント更新履歴

## 作成日

2026-03-17

## 更新したファイル

| ファイル                                   | 変更種別 | 内容                                      |
| ------------------------------------------ | -------- | ----------------------------------------- |
| apps/desktop/src/main/ipc/skillHandlers.ts | 修正     | SKILL_UPDATE ハンドラ追加・unregister追加 |
| apps/desktop/src/preload/skill-api.ts      | 修正     | getDetail / update メソッド追加           |

## Step 完了ステータス

### Step 1-A: タスク完了記録

- [ ] 各項目の実施状況

### Step 1-B: 実装状況テーブル

- [ ] 各項目の実施状況

### Step 1-C: 関連タスクテーブル

- [ ] 各項目の実施状況

### Step 1-D: indexes/topic-map.md 再生成

- [ ] 各項目の実施状況

### Step 2: システム仕様更新（IPC追加更新対象）

- [ ] 各ファイルの更新状況

### Step 3: IPC 契約検証

- [ ] 各項目の確認状況
```

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク 4: 未タスク検出レポート作成

**目的**: 残課題や未対応事項を検出・記録する（**0件でも出力必須**）

**実行手順**:

1. Phase 3（設計レビュー）の指摘事項を確認する
2. Phase 10（最終レビュー）の指摘事項（MINOR 判定分）を確認する
3. Phase 11（手動テスト）の発見課題を確認する
4. コードベースの TODO/FIXME を検索する
5. 検出結果を記録する（0件でも「検出タスクなし」と明記する）

**検出コマンド**:

```bash
# TODO/FIXME 検索
grep -rn "TODO\|FIXME" \
  apps/desktop/src/main/ipc/skillHandlers.ts \
  apps/desktop/src/preload/skill-api.ts

# P52 対策: 同ファイル内の non-null assertion 残存確認
grep -n '!' \
  apps/desktop/src/main/ipc/skillHandlers.ts | grep -v "!=" | head -20
```

**未タスク検出時の3ステップ（P3 対策）**:

検出した未タスクは以下の3ステップを**全て**完了する:

1. `docs/30-workflows/unassigned-task/` に指示書を作成する
2. `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-contract-preload-alignment.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**再評価クローズ時の注意（P56 対策）**:

- 未タスクを再評価クローズする場合は、対応する GitHub Issue も `gh issue close` で同時にクローズする

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

---

### タスク 5: スキルフィードバックレポート作成

**目的**: 実装プロセスで得られたスキル改善点を記録する（**改善点なしでも作成必須** — P28 対策）

**実行手順**:

1. Phase 1〜11 の実行で発見したワークフロー改善点を振り返る
2. task-specification-creator スキルの改善提案があれば記録する
3. 改善点がない場合は「改善点なし」の理由を記載する

**レポートテンプレート**:

```markdown
# スキルフィードバックレポート - TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001

## 対象スキル

- task-specification-creator

## 改善提案

（改善点がある場合は記載。ない場合は以下）

### 改善点なし

- 理由: （具体的な理由を記載）

## ワークフロー改善点

（Phase 実行中に発見した改善点。IPC タスク特有の知見があれば記載）

## P42/P45 対応における学び

（3段バリデーション・命名統一の実装で得られた教訓）
```

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

## 参照資料

| 参照資料                 | パス                                                                                                                                                                          | 内容                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 2 設計書           | `outputs/phase-2/design.md`                                                                                                                                                   | Phase 2 で確定した設計       |
| Phase 5 実装成果物       | `outputs/phase-5/implementation-report.md`                                                                                                                                    | 実装コード                   |
| Phase 6 テスト拡充       | `outputs/phase-6/coverage-after.md`                                                                                                                                           | 拡充後テストとカバレッジ結果 |
| Phase 7 カバレッジ       | `outputs/phase-7/coverage-report.md`                                                                                                                                          | カバレッジ結果               |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-report.md`                                                                                                                                       | リファクタリング結果         |
| Phase 9 品質検証         | `outputs/phase-9/quality-gate-result.md`                                                                                                                                      | 品質検証結果                 |
| Phase 10 最終レビュー    | `outputs/phase-10/final-review-result.md`                                                                                                                                     | 最終レビュー結果             |
| 仕様更新フロー           | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                                                                                | 更新判断基準                 |
| IPC 契約チェックリスト   | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                                                                                 | Phase 1-6 手順               |
| 実装ファイル             | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                                                                                                  | 実装コード                   |
| Phase 11 手動テスト      | `outputs/phase-11/manual-test-result.md` / `outputs/phase-11/devtools-test-result.md` / `outputs/phase-11/error-handling-result.md` / `outputs/phase-11/discovered-issues.md` | 手動テスト結果               |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                                                                                                          | P1-P4, P25-P31               |
| Phase 12 チェックリスト  | `.claude/rules/05-task-execution.md`                                                                                                                                          | 必須チェック項目             |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                                                | 内容     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------- |
| クイックリファレンス       | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                                 | 補助参照 |
| リソースマップ             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                    | 補助参照 |
| セキュリティ IPC 仕様      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`                                   | 更新対象 |
| Skill IPC 仕様             | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`                                      | 更新対象 |
| アーキテクチャ概要         | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`                                   | 更新対象 |
| Skill SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-core.md`                              | 更新対象 |
| Skill 詳細仕様             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md`                           | 更新対象 |
| タスクワークフロー         | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-contract-preload-alignment.md`       | 更新対象 |
| 教訓 1                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-contract-bridge-audit-scope.md`         | 更新対象 |
| 教訓 2                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-phase12-type-gaps-preload-alignment.md` | 更新対象 |

---

## 成果物

| 成果物               | パス                                                     | 内容                      |
| -------------------- | -------------------------------------------------------- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1 + Part 2 + IPC仕様 |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`                | Step 1-3 の実施結果       |
| 仕様準拠チェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | task-spec 準拠確認        |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`            | 全更新内容の記録          |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-detection.md`          | 残課題（0件でも必須）     |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | スキル改善提案            |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 中学生レベル概念説明 + Part 2: 技術詳細 + IPC仕様）が作成されている
- [ ] Step 1-A: LOGS.md **2ファイル両方**が更新されている
- [ ] Step 1-A: SKILL.md **2ファイル両方**の変更履歴が更新されている
- [ ] Step 1-B: `interfaces-agent-sdk-skill-core.md` / `interfaces-agent-sdk-skill-details.md` / `architecture-overview-core.md` に current contract / 実装ステータスが更新されている
- [ ] Step 1-C: `grep` で検出された関連仕様書が更新されている
- [ ] Step 1-D: `aiworkflow-requirements/indexes/topic-map.md` / `keywords.json` と workflow `index.md` が再生成されている
- [ ] Step 2: 8個の更新対象ファイルが全て更新されている
- [ ] Step 3: IPC 契約検証が完了している
- [ ] ドキュメント更新履歴が各 Step の実施状況を含めて作成されている
- [ ] `artifacts.json` と `outputs/artifacts.json` の Phase 12 ステータスが更新されている
- [ ] `index.md` と Phase 1-13 の関連記述が同期されている
- [ ] 未タスク検出レポートが作成されている（0件でも必須）
- [ ] 検出した未タスクは3ステップ（指示書・残課題テーブル・関連仕様書リンク）全完了している
- [ ] `outputs/phase-12/unassigned-task-detection.md` の件数・ステータスが更新されている
- [ ] スキルフィードバックレポートが作成されている（改善点なしでも必須）

---

## フォールバック手順

Step 1-A で LOGS.md/SKILL.md が見つからない場合:

1. まず path / branch / worktree の誤認を疑い、`.claude/skills/` 正本の実在を確認する
2. worktree を理由に Step 1-A を先送りしない。正本が存在する限り、その場で LOGS.md×2 / SKILL.md×2 を更新する
3. それでもファイルが存在しない場合のみ blocker として `outputs/phase-12/spec-update-summary.md` に記録し、Phase 12 を閉じずに解消方針を確定する

---

## タスク100%実行確認【必須】

- [ ] **本Phase内の全タスクを100%実行完了**
- [ ] 各タスクの成果物（6ファイル）が生成されている
- [ ] 全完了条件チェックリストを確認済み

```bash
# Phase 完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix \
  --phase 12
```

## 次Phase

Phase 13: PR 作成（[phase-13-pr-creation.md](./phase-13-pr-creation.md)）
