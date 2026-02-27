# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 12                         |
| Phase名    | ドキュメント更新           |
| タスクID   | TASK-9H                    |
| 前提Phase  | Phase 11（手動テスト検証） |
| 後続Phase  | Phase 13（PR作成）         |
| ステータス | 完了                       |
| 作成日     | 2026-02-27                 |
| 機能名     | TASK-9H-skill-debug        |

---

## 目的

実装内容を文書化し、システム仕様書を更新する。
未タスクがあれば検出・記録する。
スキルフィードバックレポートを作成する。

## 背景

ドキュメントは将来のメンテナンスに不可欠である。
Phase 12 は漏れが最も発生しやすい Phase であるため、以下の既知の落とし穴を事前に確認すること。

### 事前確認必須: 既知の落とし穴（06-known-pitfalls.md）

| Pitfall ID | タイトル                                 | 対策                                                                            |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| P1         | LOGS.md 2ファイル更新漏れ                | aiworkflow-requirements と task-specification-creator の**2ファイル両方**を更新 |
| P2         | topic-map.md 再生成忘れ                  | 仕様書に変更があれば**必ず**再生成を実行                                        |
| P27        | topic-map.md 再生成トリガー判断ミス      | セクション削除・更新も再生成トリガーに含める                                    |
| P29        | SKILL.md 変更履歴の更新漏れ              | LOGS.md だけでなく SKILL.md も更新                                              |
| P3         | 未タスク管理の3ステップ不完全            | 1.指示書 → 2.残課題テーブル → 3.関連仕様書リンク の全ステップ                   |
| P38        | 未タスク配置ディレクトリ間違い           | `unassigned-task/` に配置（`tasks/` 直下ではない）                              |
| P4         | documentation-changelog 早期「完了」記載 | 全 Step 確認前に「完了」と記載しない                                            |
| P25        | LOGS.md 2ファイル更新漏れ（再発）        | P1と同様。明示的にチェック                                                      |
| P28        | スキルフィードバックレポート未作成       | 改善点がなくても「改善点なし」として作成                                        |
| P31        | システム仕様書更新漏れ（複数ファイル）   | IPC関連では5ファイル以上を確認                                                  |
| P43        | サブエージェントの rate limit 中断       | 仕様書更新は3ファイル以下/エージェントに分割                                    |

---

## 実行タスク

> 以下のタスク5つを全て実行してください（全タスク必須）。

### タスク1: 実装ガイド作成

**目的**: スキルデバッグ機能の使用方法を文書化する

**実行手順**:

1. Part 1: 概念的説明（初学者・非技術者向け、中学生レベル）を作成する
2. Part 2: 技術的詳細（開発者向け）を作成する
3. IPC ドキュメント（チャンネル仕様）を作成する

#### Part 1: 概念的説明（中学生レベル — 日常例え必須）

以下の構成で作成すること:

```markdown
# スキルデバッグ機能 実装ガイド

## Part 1: 概念的説明（中学生レベル）

### デバッグとは？

デバッグは、**虫取り（バグ取り）**のようなものです。

プログラムの中にいる「虫（バグ）」を見つけて退治する作業です。
でも、虫がどこにいるかわからないと捕まえられません。
デバッグ機能は、プログラムの中身を覗ける「虫眼鏡」のようなものです。

### ブレークポイントとは？

ブレークポイントは、**動画の一時停止ボタン**のようなものです。

動画を再生中に気になる場面があったら、一時停止して じっくり見ますよね。
プログラムも同じで、「ここで止めて」と指定しておくと、
その場所でプログラムが一時停止して、今どんな状態か確認できます。

### ステップ実行とは？

ステップ実行は、**コマ送り再生**のようなものです。

| 操作      | 日常の例え                           |
| --------- | ------------------------------------ |
| Step Over | 次のコマに進む（サブ動画はスキップ） |
| Step Into | サブ動画の中に入って再生する         |
| Step Out  | サブ動画を抜けて元の動画に戻る       |

### 変数インスペクションとは？

変数インスペクションは、**X線検査**のようなものです。

プログラムの「箱（変数）」の中身を透かして見ることができます。
「この箱には何が入っているかな？」と確認できる機能です。

### 式評価とは？

式評価は、**電卓**のようなものです。

プログラムが一時停止している間に、
「この計算の結果はどうなる？」と聞くことができます。
ただし安全のため、危険な操作（ファイルを消す等）はできません。

### 7つの操作

| 操作              | 日常の例え                             |
| ----------------- | -------------------------------------- |
| debug:start       | 虫眼鏡を取り出してデバッグモードに入る |
| debug:command     | 再生・一時停止・コマ送りを操作する     |
| breakpoint:add    | 「ここで止めて」と付箋を貼る           |
| breakpoint:remove | 付箋をはがす                           |
| debug:inspect     | X線で箱の中身を確認する                |
| debug:evaluate    | 電卓で計算結果を確認する               |
| debug:event       | プログラムからのお知らせを受け取る     |
```

#### Part 2: 技術者向け実装詳細

以下の構成で作成すること:

```markdown
## Part 2: 技術者向け実装詳細

### 実装概要

| 項目            | 値                                                      |
| --------------- | ------------------------------------------------------- |
| IPCチャンネル数 | 7（invoke 6 + event 1）                                 |
| SkillDebugger   | `apps/desktop/src/main/services/skill/SkillDebugger.ts` |
| DebugSession    | `apps/desktop/src/main/services/skill/DebugSession.ts`  |
| 共有型定義      | `packages/shared/src/types/skill-debug.ts`              |
| Preload API     | `apps/desktop/src/preload/skill-api.ts`                 |

### アーキテクチャ

SkillDebugger（セッションライフサイクル管理）
└── DebugSession（個別セッション状態管理）
├── ブレークポイント管理
├── ステップ実行制御
├── 変数インスペクション
└── サンドボックス式評価

### 7チャンネルのインターフェース

（各チャンネルの引数型、戻り値型、TypeScriptインターフェースを
packages/shared/src/types/skill-debug.ts から引用して記載）

### セキュリティ検証フロー

1. validateIpcSender → 2. 3段バリデーション → 3. try/catch → 4. sanitizeErrorMessage

### 式評価のサンドボックス設計

（サンドボックスの実装方式、制限されるグローバルオブジェクト、
タイムアウト設定を記載）

### エラーハンドリングパターン

（統一されたエラーレスポンス形式の説明）
```

#### IPC ドキュメント

以下の構成で作成すること:

```markdown
### IPC チャンネル仕様

| チャンネル名                  | 方向          | 引数                                  | 戻り値           | 説明                 |
| ----------------------------- | ------------- | ------------------------------------- | ---------------- | -------------------- |
| skill:debug:start             | invoke→handle | { skillName }                         | { sessionId }    | デバッグ開始         |
| skill:debug:command           | invoke→handle | { sessionId, command }                | void             | コマンド送信         |
| skill:debug:breakpoint:add    | invoke→handle | { sessionId, line, file, condition? } | { breakpointId } | ブレークポイント追加 |
| skill:debug:breakpoint:remove | invoke→handle | { sessionId, breakpointId }           | void             | ブレークポイント削除 |
| skill:debug:inspect           | invoke→handle | { sessionId, scope }                  | { variables }    | 変数一覧取得         |
| skill:debug:evaluate          | invoke→handle | { sessionId, expression }             | { result, type } | 式評価               |
| skill:debug:event             | send→on       | { type, sessionId, ...payload }       | -                | イベント通知         |
```

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（Part 1 + Part 2 + IPC仕様を含む1ファイル）

---

### タスク2: システム仕様書更新

**目的**: aiworkflow-requirements のシステム仕様を更新する

> **重要**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照してください。

**2ステップで実行:**

#### Step 1: タスク完了記録（必須）

##### Step 1-A: タスク完了記録

以下の5項目を**全て**実施する:

- [x] 該当仕様書にタスク完了記録を追加する（`api-ipc-agent.md`, `security-electron-ipc.md`, `interfaces-agent-sdk-skill.md`, `architecture-overview.md`）
- [x] `aiworkflow-requirements/LOGS.md` を更新する
- [x] `task-specification-creator/LOGS.md` を更新する（**2ファイル両方** — P1/P25対策）
- [x] `aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- [x] `task-specification-creator/SKILL.md` の変更履歴を更新する（P29対策）

##### Step 1-B: 実装状況テーブル更新

- [x] `api-ipc-agent.md` に7チャンネルの実装ステータスを追加する

##### Step 1-C: 関連タスクテーブル更新

```bash
# TASK-9H を含む仕様書を検索する
grep -rn "TASK-9H\|skill-debug\|SkillDebugger" .claude/skills/aiworkflow-requirements/references/
grep -rn "TASK-9H\|skill-debug\|SkillDebugger" .claude/skills/task-specification-creator/references/
```

- [x] 検出された仕様書の関連タスクテーブルを更新する

##### Step 1-D: topic-map.md 再生成

```bash
# topic-map.md を再生成する（P2/P27対策 — 仕様書に変更があれば必ず実行）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/TASK-9H-skill-debug --regenerate
```

- [x] `aiworkflow-requirements/references/topic-map.md` を再生成した
- [x] `task-specification-creator/references/topic-map.md` を再生成した

##### Step 1-E: 未タスク参照整合チェック（検出件数1件以上で必須）

```bash
# 未タスク参照リンク整合
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# 今回対象（current）監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD

# 全体（baseline）監視
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
```

- [x] `verify-unassigned-links.js` で `ALL_LINKS_EXIST` を確認した
- [x] `audit-unassigned-tasks --diff-from HEAD` の `currentViolations.total = 0` を記録した
- [x] `audit-unassigned-tasks --json` の baseline 結果を記録した

#### Step 2: システム仕様更新（本タスクでは**必須**）

**更新判断**: 新規IPCチャンネル7つを追加し、デバッグサービスを追加するため、システム仕様の更新が**必要**。

**IPC機能開発のため必須の更新対象ファイル**:

| #   | 更新対象ファイル                          | 更新内容                                                    | 必須/任意 |
| --- | ----------------------------------------- | ----------------------------------------------------------- | --------- |
| 1   | `api-ipc-agent.md`                        | デバッグIPCチャンネルセクション追加（7チャンネル仕様）      | 必須      |
| 2   | `security-electron-ipc.md`                | 式評価サンドボックスのセキュリティパターン追加              | 必須      |
| 3   | `architecture-overview.md`                | SkillDebugger/DebugSession サービス登録追加                 | 必須      |
| 4   | `interfaces-agent-sdk-skill.md`           | デバッグ型定義（DebugSession, Breakpoint, InspectResult等） | 必須      |
| 5   | `task-workflow.md`                        | 完了タスクセクション追加、残課題テーブル更新                | 必須      |
| 6   | `lessons-learned.md`                      | 式評価サンドボックス実装で得られた教訓                      | 任意      |
| 7   | `architecture-implementation-patterns.md` | サンドボックスパターン追加                                  | 任意      |

**更新チェックリスト（P31対策 — 複数ファイル更新漏れ防止）**:

- [x] `api-ipc-agent.md` にデバッグIPCチャンネルセクションを追加した
- [x] `security-electron-ipc.md` に式評価サンドボックスのセキュリティパターンを追加した
- [x] `architecture-overview.md` にSkillDebugger/DebugSessionサービスを追加した
- [x] `interfaces-agent-sdk-skill.md` にデバッグ型定義を追加した
- [x] `task-workflow.md` に完了タスクとして TASK-9H を記録した

#### Step 3: IPC 契約検証（本タスクでは**必須**）

> **重要**: `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` の Phase 1-6 を実施してください。

- [x] ハンドラ引数形式と Preload 側の呼び出し形式が一致している
- [x] 引数名のセマンティクスが実際の値と一致している（P45対策）
- [x] P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）が全チャンネルで実装されている

**期待される成果物**:

- `outputs/phase-12/spec-update-summary.md`

---

### タスク3: ドキュメント更新履歴作成 & artifacts.json更新

**目的**: 本タスクで行ったドキュメント更新を記録する

**実行手順**:

1. 更新した全仕様書の変更内容を記録する
2. 各 Step の完了結果を詳細に記録する（漏れの可視化）
3. `artifacts.json` の Phase 12 ステータスを `completed` に更新する

**DON'T**: 全 Step 確認前に「完了」と記載しない（P4対策）

**更新履歴テンプレート**:

```markdown
# TASK-9H ドキュメント更新履歴

## 作成日

2026-02-27

## 更新したファイル

| ファイル         | 変更種別 | 内容                      |
| ---------------- | -------- | ------------------------- |
| SkillDebugger.ts | 新規     | デバッグサービス実装      |
| DebugSession.ts  | 新規     | セッション管理実装        |
| skill-debug.ts   | 新規     | 共有型定義                |
| skill-api.ts     | 修正     | デバッグAPI 7メソッド追加 |
| channels.ts      | 修正     | 7チャンネル定数追加       |
| types.ts         | 修正     | Preload型定義追加         |

## Step 完了ステータス

### Step 1-A: タスク完了記録

- [x] / [ ] 各項目の実施状況

### Step 1-B: 実装状況テーブル

- [x] / [ ] 各項目の実施状況

### Step 1-C: 関連タスクテーブル

- [x] / [ ] 各項目の実施状況

### Step 1-D: topic-map.md 再生成

- [x] / [ ] 各項目の実施状況

### Step 2: システム仕様更新

- [x] / [ ] 各ファイルの更新状況

### Step 3: IPC 契約検証

- [x] / [ ] 各項目の実施状況
```

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出レポート作成

**目的**: 残課題や未対応事項を検出・記録する（**0件でも出力必須**）

**実行手順**:

1. Phase 3（設計レビュー）の指摘事項を確認する
2. Phase 10（最終レビュー）の指摘事項を確認する
3. Phase 11（手動テスト）の発見課題を確認する
4. コードベースの TODO/FIXME を検索する
5. 検出結果を記録する（0件でも「検出タスクなし」と明記する）

**検出コマンド**:

```bash
# TODO/FIXME検索
grep -rn "TODO\|FIXME" apps/desktop/src/main/services/skill/SkillDebugger.ts
grep -rn "TODO\|FIXME" apps/desktop/src/main/services/skill/DebugSession.ts
grep -rn "TODO\|FIXME" packages/shared/src/types/skill-debug.ts
grep -rn "TODO\|FIXME" apps/desktop/src/preload/skill-api.ts
```

**未タスク検出時の3ステップ（P3/P38対策）**:

検出した未タスクは以下の3ステップを**全て**完了する:

1. `docs/30-workflows/unassigned-task/` に指示書を作成する（**`tasks/` 直下ではない** — P38対策）
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

---

### タスク5: スキルフィードバックレポート作成

**目的**: 実装プロセスで得られたスキル改善点を記録する（**改善点なしでも作成必須** — P28対策）

**実行手順**:

1. Phase 1〜11 の実行で発見したワークフロー改善点を振り返る
2. task-specification-creator スキルの改善提案があれば記録する
3. 改善点がない場合は「改善点なし」の理由を記載する

**レポートテンプレート**:

```markdown
# スキルフィードバックレポート - TASK-9H

## 対象スキル

- task-specification-creator

## 改善提案

（改善点がある場合は記載。ない場合は以下）

### 改善点なし

- 理由: （具体的な理由を記載）

## ワークフロー改善点

（Phase実行中に発見した改善点）
```

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

## 参照資料

| 参照資料                | パス                                                                                 | 内容                     |
| ----------------------- | ------------------------------------------------------------------------------------ | ------------------------ |
| Phase 2 成果物          | `outputs/phase-2/architecture-design.md`                                             | 設計仕様                 |
| Phase 5 成果物          | `apps/desktop/src/main/services/skill/SkillDebugger.ts`                              | 実装成果物               |
| Phase 6 成果物          | `outputs/phase-6/coverage-report.md`                                                 | 拡充テスト結果           |
| Phase 7 成果物          | `outputs/phase-7/coverage-report.md`                                                 | カバレッジ結果           |
| Phase 8 成果物          | `outputs/phase-8/refactoring-log.md`                                                 | リファクタリング結果     |
| Phase 9 成果物          | `outputs/phase-9/quality-report.md`                                                  | 品質保証結果             |
| Phase 10 成果物         | `outputs/phase-10/final-review-result.md`                                            | 最終レビュー結果         |
| 仕様更新フロー          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`       | 更新判断基準             |
| Phase 11/12 ガイド      | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`          | ドキュメント作成ガイド   |
| 未タスクガイドライン    | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク作成規則         |
| IPC契約チェックリスト   | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`        | IPC契約検証手順          |
| 実装ファイル            | `apps/desktop/src/main/services/skill/SkillDebugger.ts`                              | 実装コード               |
| Phase 11 発見課題       | `outputs/phase-11/discovered-issues.md`                                              | 発見課題                 |
| 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md`                                                 | P1-P4, P25-P31, P38, P43 |
| Phase 12 チェックリスト | `.claude/rules/05-task-execution.md`                                                 | 必須チェック項目         |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容     |
| -------------------------- | --------------------------------------------------------------------------------- | -------- |
| IPC Agent仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | 更新対象 |
| セキュリティIPC仕様        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | 更新対象 |
| アーキテクチャ概要         | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | 更新対象 |
| Skill SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 更新対象 |
| タスクワークフロー         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | 更新対象 |

---

## 実行手順

1. タスク1で実装ガイドを作成し、Part 1/Part 2/IPC仕様を1ファイルに統合する。
2. タスク2で Step 1-A〜1-E を順番に実行し、仕様更新と監査結果を記録する。
3. タスク3〜5で changelog、未タスク検出、スキルフィードバックを完了し、成果物を確定する。

---

## 成果物

| 成果物               | パス                                            | 内容                      |
| -------------------- | ----------------------------------------------- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 + Part 2 + IPC仕様 |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | Step 1-3 の実施結果       |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 全更新内容の記録          |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-detection.md` | 残課題（0件でも必須）     |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | スキル改善提案            |

---

## 完了条件

- [x] 実装ガイド（Part 1: 中学生レベル概念説明 + Part 2: 技術詳細 + IPC仕様）が作成されている
- [x] Step 1-A: LOGS.md **2ファイル両方**が更新されている
- [x] Step 1-A: SKILL.md **2ファイル両方**の変更履歴が更新されている
- [x] Step 1-B: `api-ipc-agent.md` に7チャンネルの実装ステータスが追加されている
- [x] Step 1-C: `grep` で検出された関連仕様書が更新されている
- [x] Step 1-D: `topic-map.md` が再生成されている（**2ファイル両方**）
- [x] Step 1-E: `verify-unassigned-links.js` で `ALL_LINKS_EXIST` を確認している
- [x] Step 1-E: `audit-unassigned-tasks --diff-from HEAD` の current 監査結果を記録している
- [x] Step 1-E: baseline 監査結果を記録している
- [x] Step 2: 5つの必須更新対象ファイルが全て更新されている
- [x] Step 3: IPC契約検証（ipc-contract-checklist.md Phase 1-6）が完了している
- [x] ドキュメント更新履歴が各Stepの実施状況を含めて作成されている
- [x] `artifacts.json` の Phase 12 ステータスが更新されている
- [x] 未タスク検出レポートが作成されている（0件でも必須）
- [x] 検出した未タスクは3ステップ（指示書・残課題テーブル・関連仕様書リンク）全完了している
- [x] 未タスク指示書の配置先が `unassigned-task/` であることを確認した（P38対策）
- [x] `unassigned-task-detection.md` の件数・ステータスが更新されている
- [x] スキルフィードバックレポートが作成されている（改善点なしでも必須）

---

## フォールバック手順

Step 1-AでLOGS.md/SKILL.mdが見つからない場合:

1. ワークツリー環境のため、スキルディレクトリが存在しない場合がある
2. その場合は `outputs/phase-12/spec-update-summary.md` に「ワークツリー環境のためスキップ」と理由を記載する
3. メインリポジトリへのマージ後にLOGS.md/SKILL.mdを更新する旨を記録する

---

## Phase末端アクション【必須】

- [x] 本Phase内の全タスク（5タスク）を100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物（5ファイル）が全て生成されていることを確認
- [x] 全完了条件チェックリストを確認済み

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9H-skill-debug/phase-13-pr-creation.md`
