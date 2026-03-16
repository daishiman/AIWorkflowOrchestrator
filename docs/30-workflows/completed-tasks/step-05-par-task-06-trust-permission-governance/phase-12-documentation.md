# Phase 12: ドキュメント - TASK-SKILL-LIFECYCLE-06「信頼・権限・ガバナンス統合」

## メタ情報

| 項目       | 値                                                           |
| ---------- | ------------------------------------------------------------ |
| タスク ID  | TASK-SKILL-LIFECYCLE-06                                      |
| Phase      | 12: ドキュメント                                             |
| ステータス | not_started                                                  |
| 依存成果物 | `phase-11-manual-test.md`（Phase 11 総合判定 PASS 後に開始） |
| 作成日     | 2026-03-16                                                   |

> **警告**: Phase 12 は漏れが最も発生しやすい Phase（P1-P4, P25-P28, P43, P51）。
> 全 Task を逐次確認し、`documentation-changelog.md` への「完了」記録は全 Step 完了後の最終ステップとする（P4対策）。
> サブエージェントに委譲する場合は1エージェントあたり3ファイル以下とし、完了後に `git diff --stat -- .claude/skills/` で実際の変更を確認する（P43対策）。

---

## 目的

権限モデル・危険操作分類・承認履歴仕様・安全性ゲート契約を以下の3目的でドキュメント化する。

1. 将来の実装担当者（TASK-SKILL-LIFECYCLE-08 等）が設計意図を正確に理解できる実装ガイドを作成する
2. システム仕様書（LOGS.md・SKILL.md・各 references/\*.md）を本タスクの成果に同期する
3. 設計タスクとして定義された未タスク（実装・テスト）を検出・登録する

---

## 実行タスク

- 実装ガイド作成: Part 1/Part 2 を validator 要件どおりに作成する
- system spec 同期: Step 1-A〜1-D と Step 2 を完遂し正本へ反映する
- 記録完了: changelog・未タスク・feedback を出力して完了条件を満たす

### Task 1: 実装ガイド（Part 1/Part 2）の作成

### Task 2: system spec 同期（Step 1-A〜1-D + Step 2）

### Task 3: changelog / 未タスク / feedback の完了

1. Task 1: 実装ガイド（Part 1/Part 2）を作成し validator 要件を満たす
2. Task 2: Step 1-A〜1-D と Step 2 を完遂し、aiworkflow 正本仕様へ同期する
3. Task 3: documentation-changelog を実績ベースで作成する
4. Task 4: 未タスク検出を実施し、0件でもレポートを出力する
5. Task 5: スキルフィードバックを作成し、改善なしでも記録する
6. 仕上げ: artifacts/index/phase本文の状態同期を確認する

---

## 参照資料

| 資料名                        | パス                                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義              | `phase-1-requirements.md`                                                                                           |
| Phase 2 設計                  | `phase-2-design.md`                                                                                                 |
| Phase 5 実装成果物            | `outputs/phase-5/`                                                                                                  |
| Phase 6 テスト拡充成果物      | `outputs/phase-6/`                                                                                                  |
| Phase 7 カバレッジ成果物      | `outputs/phase-7/`                                                                                                  |
| Phase 8 リファクタ成果物      | `outputs/phase-8/`                                                                                                  |
| Phase 9 QA成果物              | `outputs/phase-9/`                                                                                                  |
| Phase 10 最終レビュー成果物   | `outputs/phase-10/`                                                                                                 |
| Phase 11 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                                                            |
| LOGS.md (aiworkflow)          | `.claude/skills/aiworkflow-requirements/LOGS.md`                                                                    |
| LOGS.md (task-spec)           | `.claude/skills/task-specification-creator/LOGS.md`                                                                 |
| SKILL.md (aiworkflow)         | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                                   |
| SKILL.md (task-spec)          | `.claude/skills/task-specification-creator/SKILL.md`                                                                |
| task-workflow.md              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                |
| security-skill-execution      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                     |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md`                        |
| arch-state-management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` |
| security-api-electron         | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                        |
| ui-ux-agent-execution         | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                                        |
| workflow-skill-lifecycle-04   | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`             |
| workflow-skill-lifecycle-05   | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`         |
| resource-map                  | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                    |
| generate-index.js             | `.claude/skills/aiworkflow-requirements/generate-index.js`                                                          |

---

## 必須 Task 一覧

| Task | 名称                                     | 必須成果物                                       | P対策          |
| ---- | ---------------------------------------- | ------------------------------------------------ | -------------- |
| 1    | 実装ガイド作成（2パート構成）            | `outputs/phase-12/implementation-guide.md`       | -              |
| 2    | システム仕様書更新（Step 1-A〜1-D + 2）  | `outputs/phase-12/system-spec-update-summary.md` | P1/P2/P25〜P28 |
| 3    | ドキュメント更新履歴作成                 | `outputs/phase-12/documentation-changelog.md`    | P4/P51         |
| 4    | 未タスク検出レポート作成（0件でも必須）  | `outputs/phase-12/unassigned-task-detection.md`  | P3/P38/P56     |
| 5    | スキルフィードバックレポート作成（必須） | `outputs/phase-12/skill-feedback-report.md`      | P28            |

---

## Task 1: 実装ガイド作成

### 成果物

`outputs/phase-12/implementation-guide.md`

### Part 1: 中学生レベルの概念説明（日常例え必須）

以下の5項目を日常のたとえ話で説明する。専門用語は使わず、「なぜ必要か」を先に示す。

#### 例え話ガイドライン

| 設計要素                      | 使用すべき例え話                                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| ToolRiskLevel（リスクレベル） | スマホのアプリ権限と同じ。「写真を見る（Low）」「位置情報を送る（High）」「全データを消去する（Critical）」のように危険度が違う |
| AllowedToolEntryV2（承認）    | 友だちにゲームコントローラーを渡すのと同じ。「今回だけ（session）」「1日だけ（24h）」「ずっと（permanent）」の3種類             |
| SafetyGatePort（安全ゲート）  | 映画の年齢制限と同じ。スキルをネットに公開する前に「このスキルはR指定（Critical）か確認する係」が審査する                       |
| INS-01〜03（説明責任UI）      | ATMの操作確認画面と同じ。「この操作でいいですか？」と聞いてくれることで、後で「知らなかった」が言えなくなる                     |
| fallback（abort/skip/retry）  | 電車が遅延したときと同じ。「乗るのをやめる（abort）」「別の車両に乗る（skip）」「もう一度確認する（retry）」の3択               |

#### Part 1 必須セクション

```markdown
## なぜ権限管理が必要か（中学生向け）

AIツールはとても便利ですが、使い方を間違えると大切なファイルを消したり、
パスワードを外に送ってしまうこともあります。

スマホのアプリが「カメラを使ってもいいですか？」と聞いてくるのと同じように、
AIスキルも「このファイルを変更してもいいですか？」と確認する仕組みが必要です。

## 4段階の危険レベル（リスクレベル）

低い ←────────────────────────────────────→ 高い
Low Medium High Critical
ファイル読む ファイル書く コマンド実行 データ全消去

Critical のスキルは「許可する」ボタンが表示されません。
なぜなら、間違えた時に取り返しがつかないからです。

## 権限は「いつまで有効か」が選べる

「今回だけ OK」（セッション）
「1日だけ OK」（24時間）
「1週間 OK」（7日間）
「ずっと OK」（永久）

ただし、危険度が Critical や High のスキルは「ずっと OK」は選べません。
```

### Part 2: 開発者向け実装詳細

以下の項目を全て記載する。

#### 2-1. 型定義一覧

```typescript
// packages/shared/src/constants/security.ts に追加
export type ToolRiskLevel = "critical" | "high" | "medium" | "low";

export interface ToolRiskConfig {
  level: ToolRiskLevel;
  allowApproveOnce: boolean; // 「今回のみ許可」表示
  allowPermanent: boolean; // 「恒久許可」表示
  autoDenyDefault: boolean; // デフォルト自動拒否
  headerColorToken: string; // CSS変数トークン
  dialogWidth: 400 | 480 | 640;
}

// packages/shared/src/types/safety-gate.ts（新規ファイル）
export type SafetyGrade = "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE";

export interface SafetyGateResult {
  skillName: string;
  evaluatedAt: number; // Unix timestamp (ms)
  overallGrade: SafetyGrade;
  details: SafetyCheckDetail[];
}

export interface SafetyCheckDetail {
  checkId: string;
  toolName: string;
  riskLevel: ToolRiskLevel;
  status: "passed" | "warned" | "blocked";
  message: string; // ユーザー向けメッセージ（曖昧表現禁止）
}

export interface SafetyGatePort {
  evaluate(skillName: string): Promise<SafetyGateResult>;
}

// apps/desktop の既存型拡張
interface AllowedToolEntryV2 extends AllowedToolEntry {
  expiresAt?: number; // undefined = 無期限（後方互換）
  skillName?: string;
  expiryPolicy?: "session" | "time_24h" | "time_7d" | "permanent";
}
```

#### 2-2. 安全性チェックルール一覧

| チェック ID            | 判定条件                                                 | Grade 影響               | 実装時の注意事項                                      |
| ---------------------- | -------------------------------------------------------- | ------------------------ | ----------------------------------------------------- |
| CRITICAL_TOOL_REQUIRED | スキルが Critical ツールを要求する                       | → UNSAFE（公開ブロック） | DANGEROUS_PATTERNS.BASH_COMMANDS の正規表現でチェック |
| HIGH_TOOL_REQUIRED     | スキルが High ツールを要求するが Critical ではない       | → SAFE_WITH_WARNINGS     | Bash・chmod 等が該当                                  |
| NO_PERMANENT_APPROVAL  | 全ツールが approve_once/session のみで動作する           | → SAFE_WITH_WARNINGS     | electron-store の AllowedToolEntryV2 で確認           |
| ALL_LOW_TOOLS          | スキルが要求するツールが全て Low リスク                  | → SAFE                   | Read/Glob/Grep/WebSearch 等                           |
| PROTECTED_PATH_ACCESS  | PROTECTED_PATHS に該当するパスへの Write/Edit を要求する | → UNSAFE（公開ブロック） | `~/.ssh/`・`~/.aws/` 等 25パターン                    |

#### 2-3. 説明責任 UI 挿入ポイント

| 挿入点 ID | 挿入先コンポーネント               | 発火条件                                      | 非表示条件                           |
| --------- | ---------------------------------- | --------------------------------------------- | ------------------------------------ |
| INS-01    | Task-05 CTA コンポーネント上部     | スキルが High/Critical ツールを1件以上含む    | スキルが Medium/Low ツールのみの場合 |
| INS-02    | Task-03 AgentView ストリーミング部 | `PermissionResolver.pendingCount > 0`         | pending が 0件の場合                 |
| INS-03    | Task-05 実行結果コンポーネント下部 | セッション中に1件以上の権限承認が発生した場合 | 権限承認が 0件だった場合             |

#### 2-4. fallback フロー実装ガイド

```typescript
// abort フロー①: PermissionResolver.cancelAll() の後に必ず4ステップを実行する
async function onPermissionDeniedAbort(sessionId: string): Promise<void> {
  // Step 1: 全待機中リクエストをキャンセル
  await permissionResolver.cancelAll();
  // Step 2: セッション中の approve_once エントリを削除
  permissionStore.clearSessionEntries(sessionId);
  // Step 3: 実行ログに abort イベントを記録
  executionLogger.recordAbort(sessionId, {
    reason: "permission_denied",
    timestamp: Date.now(),
  });
  // Step 4: Renderer に IPC イベントを送信
  mainWindow.webContents.send(IPC_CHANNELS.SKILL_EXECUTION_ABORTED, {
    sessionId,
  });
}

// skip フロー②: PermissionResolver のレスポンスに skip フラグを付加する
// 戻り値: { approved: false, skip: true } — SkillExecutor がこのフラグを確認して操作をスキップする

// retry フロー③: 最大3回まで PermissionDialog を再表示する（タイムアウト300000msの範囲内）
// retryCount >= 3 の場合は abort フロー①に自動遷移する
```

#### 2-5. TASK-08 への接続手順

Task-08 が `SafetyGatePort.evaluate(skillName)` を呼び出す際の手順:

1. `packages/shared/src/types/safety-gate.ts` の `SafetyGatePort` インターフェースを実装するクラスを作成する
2. IPC チャンネル `skill:evaluate-safety` を登録し、Main Process で `SafetyGatePort.evaluate()` を呼び出す
3. 戻り値の `SafetyGateResult.overallGrade` に応じて公開可否を判定する:
   - `SAFE`: 即座に公開可能
   - `SAFE_WITH_WARNINGS`: ユーザーに `SafetyCheckDetail[].message` を提示した後に公開可能
   - `UNSAFE`: 公開ブロック（`SafetyCheckDetail[].message` でブロック理由を表示）

---

## Task 2: システム仕様書更新

> **P43/P51対策**: サブエージェントに委譲する場合は3ファイル以下/エージェントとする。
> 全 Step 完了後に `git diff --stat -- .claude/skills/` で実際の変更ファイル数を確認する。
> LOGS.md は 2ファイル両方を更新する（P1/P25 対策）。

### Step 1-A: タスク完了記録（全4ファイルを更新）

#### 対象ファイル 1: `.claude/skills/aiworkflow-requirements/LOGS.md`

追加する記録の形式:

```markdown
## TASK-SKILL-LIFECYCLE-06 完了（2026-03-16）

- タスク名: 信頼・権限・ガバナンス統合
- 種別: 設計タスク
- 主要成果物:
  - ToolRiskConfig: リスクレベル4段階 × 確認スタイル4種の型定義
  - AllowedToolEntryV2: 失効ポリシー付き権限エントリの拡張型定義
  - SafetyGatePort: Task-08 公開前安全性ゲート契約インターフェース
  - 権限状態4モード: denied/approved_once/approved/revoked の遷移定義
  - 説明責任UI: INS-01(CTA) / INS-02(実行中) / INS-03(結果) の挿入点定義
  - 拒否fallback: abort/skip/retry フロー定義
```

#### 対象ファイル 2: `.claude/skills/task-specification-creator/LOGS.md`

同一内容を記録する（P1/P25: LOGS.md は2ファイル両方の更新が必須）。

#### 対象ファイル 3: `.claude/skills/aiworkflow-requirements/SKILL.md`

変更履歴テーブルに追加する（P29 対策）:

```markdown
| 2026-03-16 | TASK-SKILL-LIFECYCLE-06 | 信頼・権限・ガバナンス統合の設計定義を追加 |
```

#### 対象ファイル 4: `.claude/skills/task-specification-creator/SKILL.md`

同一内容を変更履歴テーブルに追加する。

### Step 1-B: 実装状況テーブル更新

設計タスクのため、ステータスは `spec_created` として更新する。

対象: `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の TASK-SKILL-LIFECYCLE-06 行

```markdown
| TASK-SKILL-LIFECYCLE-06 | 信頼・権限・ガバナンス統合 | spec_created | 2026-03-16 | TASK-SKILL-LIFECYCLE-08 | - |
```

### Step 1-C: 関連タスクテーブル更新

以下のコマンドで関連仕様書を検索してから更新する:

```bash
grep -rn "TASK-SKILL-LIFECYCLE-06" .claude/skills/aiworkflow-requirements/references/
```

確認が必要な仕様書:

- `security-skill-execution.md`: 本タスクが ToolRiskLevel 分類を参照することを注釈追加
- `interfaces-agent-sdk-executor-details.md`: AllowedToolEntryV2 拡張設計への参照リンク追加
- `arch-state-management-reference-permissions-import-lifecycle.md`: permissionHistorySlice 拡張設計への参照リンク追加

### Step 1-D: topic-map.md 再生成（必須）

> **P2/P27 対策**: セクション追加・更新・削除のいずれがあっても必ず再生成する。本タスクは ToolRiskConfig・SafetyGatePort の新規型定義を追加しているため再生成が必須。

```bash
cd .claude/skills/aiworkflow-requirements && node generate-index.js
```

実行後: `indexes/topic-map.md` が更新されていることを `git diff --stat -- .claude/skills/` で確認する。

### Step 2: システム仕様書更新（新規インターフェース追加のため必須）

本タスクでは以下の新規インターフェースが定義されたため、システム仕様書の更新が必要。

#### 更新対象 1: `security-skill-execution.md`

追加する内容:

- `ToolRiskLevel` 型定義への参照セクション（TASK-SKILL-LIFECYCLE-06 の成果物）
- `TOOL_RISK_CONFIG` 定数定義の所在（`packages/shared/src/constants/security.ts`）
- DANGEROUS_PATTERNS とリスクレベルの対応表へのリンク（`outputs/phase-1/risk-level-classification.md`）

#### 更新対象 2: `interfaces-agent-sdk-executor-details.md`

追加する内容:

- `AllowedToolEntryV2` 拡張型の仕様（既存 `AllowedToolEntry` との後方互換性説明）
- 失効ポリシー4種（session/time_24h/time_7d/permanent）の定義
- `SafetyGatePort` インターフェースの所在（`packages/shared/src/types/safety-gate.ts`）

#### 更新対象 3: `arch-state-management-reference-permissions-import-lifecycle.md`

追加する内容:

- `permissionHistorySlice` の `revokedAt` フィールド拡張仕様
- INS-01〜INS-03 の挿入点と Zustand store との関係

### Phase 12 漏れ防止チェックリスト

> **実施タイミング**: Task 2 完了後、Task 3（documentation-changelog）に記録する前に実施する。

- [ ] **P1/P25**: LOGS.md を2ファイル（aiworkflow-requirements・task-specification-creator）両方更新したか
- [ ] **P2/P27**: `node generate-index.js` を実行し、`git diff --stat` で `topic-map.md` が変更されたことを確認したか
- [ ] **P29**: SKILL.md 変更履歴テーブルを2ファイル（aiworkflow-requirements・task-specification-creator）両方更新したか
- [ ] **P3/P38**: 未タスク検出（Task 4）の3ステップ全て（指示書作成 → task-workflow.md 登録 → 関連仕様書リンク）が完了しているか
- [ ] **P56**: 再評価クローズした未タスクがある場合、対応する GitHub Issue を `gh issue close` で同時に Close したか

---

## Task 3: ドキュメント更新履歴作成

### 成果物

`outputs/phase-12/documentation-changelog.md`

> **P4/P51 対策**: 各 Step の実行結果を「事後記録」する。実行前に「完了」と記載しない。全 Step 完了後に初めて「完了」と記録する。

### documentation-changelog.md の必須フォーマット

```markdown
# ドキュメント更新履歴 - TASK-SKILL-LIFECYCLE-06 Phase 12

記録日: YYYY-MM-DD
作成者: [エージェント名]

## Task 1: 実装ガイド

- ステータス: [完了/未完了]
- 成果物: `outputs/phase-12/implementation-guide.md`
- Part 1（中学生向け）: [完了/未完了] - 例え話 5項目を記載
- Part 2（開発者向け）: [完了/未完了] - 型定義・チェックルール・fallbackガイドを記載

## Task 2: システム仕様書更新

### Step 1-A: タスク完了記録

- aiworkflow-requirements/LOGS.md: [更新済み/未更新]
- task-specification-creator/LOGS.md: [更新済み/未更新]
- aiworkflow-requirements/SKILL.md: [更新済み/未更新]
- task-specification-creator/SKILL.md: [更新済み/未更新]

### Step 1-B: 実装状況テーブル

- task-workflow.md TASK-SKILL-LIFECYCLE-06: [spec_created に更新済み/未更新]

### Step 1-C: 関連タスクテーブル

- grep 実行結果: [件数]件ヒット
- 更新したファイル: [ファイル名リスト]

### Step 1-D: topic-map.md 再生成

- node generate-index.js 実行: [完了/未完了]
- git diff --stat 確認: [topic-map.md が変更されたことを確認/変更なし（調査が必要）]

### Step 2: システム仕様書更新

- security-skill-execution.md: [更新済み/未更新] - [更新内容の要約]
- interfaces-agent-sdk-executor-details.md: [更新済み/未更新] - [更新内容の要約]
- arch-state-management-reference-permissions-import-lifecycle.md: [更新済み/未更新] - [更新内容の要約]

## Task 3: ドキュメント更新履歴

- 本ファイル（documentation-changelog.md）作成: 完了

## Task 4: 未タスク検出

- unassigned-task-detection.md: [完了/未完了]
- 検出件数: [N件]
- 3ステップ完了確認: [全完了/未完了箇所あり]

## Task 5: スキルフィードバックレポート

- skill-feedback-report.md: [完了/未完了]

## 全Task完了確認

（全 Task 完了後にここに「全 Task 完了」と記録する）
```

---

## Task 4: 未タスク検出レポート作成

### 成果物

`outputs/phase-12/unassigned-task-detection.md`

> **P3/P38 対策**: 検出件数が 0件でもファイルを作成する。未タスクは3ステップ全完了が必須。

### 設計タスクにおける未タスクの典型パターン

TASK-SKILL-LIFECYCLE-06 は設計タスクのため、以下の未タスクが発生しやすい:

| カテゴリ                | 未タスク候補                                                  | 理由                                         |
| ----------------------- | ------------------------------------------------------------- | -------------------------------------------- |
| 実装タスク              | ToolRiskConfig・TOOL_RISK_CONFIG の実装                       | 本タスクは型定義のみ、実装は別タスクスコープ |
| 実装タスク              | AllowedToolEntryV2 の PermissionStore 適用                    | 同上                                         |
| 実装タスク              | SafetyGatePort の具象クラス実装                               | 同上                                         |
| 実装タスク              | INS-01〜INS-03 の UI コンポーネント実装                       | 同上                                         |
| 実装タスク              | abort/skip/retry fallback フローの SkillExecutor への組み込み | 同上                                         |
| Phase 10 MINOR 指摘事項 | Phase 10 レビューで MINOR 判定になった指摘事項                | 仕様書に変換して登録                         |
| テストタスク            | SafetyGatePort の単体テスト設計                               | 設計タスクのためテスト設計は未実施           |

### unassigned-task-detection.md の必須フォーマット

```markdown
# 未タスク検出レポート - TASK-SKILL-LIFECYCLE-06 Phase 12

検出日: YYYY-MM-DD

## 検出件数: N件

## 検出した未タスク一覧

| UT ID     | タスク名   | カテゴリ                   | 依存         | 優先度     | 登録ステータス                                  |
| --------- | ---------- | -------------------------- | ------------ | ---------- | ----------------------------------------------- |
| UT-06-001 | [タスク名] | [実装/テスト/ドキュメント] | [依存タスク] | [高/中/低] | [指示書作成済/task-workflow登録済/リンク追加済] |

## 各未タスクの3ステップ完了確認

### UT-06-001: [タスク名]

- [ ] Step 1: `tasks/unassigned-task/UT-06-001-[タスク名].md` を作成した
- [ ] Step 2: `task-workflow.md` 残課題テーブルに登録した
- [ ] Step 3: 関連仕様書に参照リンクを追加した

## 再評価クローズした未タスク（存在する場合）

| UT ID | クローズ理由 | GitHub Issue | Close 操作 |
| ----- | ------------ | ------------ | ---------- |
| -     | -            | -            | -          |
```

---

## Task 5: スキルフィードバックレポート作成

### 成果物

`outputs/phase-12/skill-feedback-report.md`

> **P28 対策**: 改善点がなくても「改善点なし」としてファイルを作成する。

### 確認観点

本タスクを通じて以下の観点でスキル改善点を検討する:

1. **タスク仕様書テンプレートの改善点**: 設計タスク向けの Phase 11 テンプレートが Phase 12 仕様書に明示されていたか
2. **Phase 12 チェックリストの精度**: P1-P4/P25-P28/P43/P51 の再発防止チェックリストで漏れが発生したか
3. **未タスク検出の精度**: 設計タスク特有の未タスクパターン（実装・テスト）が正しく検出できたか
4. **Task-08 接続仕様の記述粒度**: SafetyGatePort の型定義が Task-08 チームへの引き継ぎとして十分か

### skill-feedback-report.md の必須フォーマット

```markdown
# スキルフィードバックレポート - TASK-SKILL-LIFECYCLE-06 Phase 12

作成日: YYYY-MM-DD

## 総合評価: [改善点あり/改善点なし]

## 検出した改善点

| ID  | 改善対象 | 現状の問題 | 提案する改善 | 優先度 |
| --- | -------- | ---------- | ------------ | ------ |
| -   | -        | -          | -            | -      |

## 改善なしの理由（改善点なしの場合）

[なぜ改善点がないかの説明]
```

---

## 成果物一覧

| 成果物 ID | ファイルパス                                     | 内容                                                            |
| --------- | ------------------------------------------------ | --------------------------------------------------------------- |
| OUT-12-1  | `outputs/phase-12/implementation-guide.md`       | 実装ガイド（Part 1: 中学生向け例え話 + Part 2: 開発者向け詳細） |
| OUT-12-2  | `outputs/phase-12/system-spec-update-summary.md` | システム仕様書更新サマリー（Step 1-A〜1-D + Step 2 の実行記録） |
| OUT-12-3  | `outputs/phase-12/documentation-changelog.md`    | ドキュメント更新履歴（全 Task の事後記録）                      |
| OUT-12-4  | `outputs/phase-12/unassigned-task-detection.md`  | 未タスク検出レポート（0件でも必須）                             |
| OUT-12-5  | `outputs/phase-12/skill-feedback-report.md`      | スキルフィードバックレポート（改善点なしでも必須）              |

---

## 完了条件

以下のチェックボックスを全て満たすことで Phase 12 完了とする。

### Task 1 完了確認

- [ ] `outputs/phase-12/implementation-guide.md` が作成されている
- [ ] Part 1 に日常例え話が5項目全て含まれている（ToolRiskLevel/AllowedToolEntryV2/SafetyGatePort/INS-01〜03/fallback）
- [ ] Part 2 に型定義一覧・安全性チェックルール・INS挿入ポイント・fallbackガイド・TASK-08接続手順が全て含まれている

### Task 2 完了確認

- [ ] `aiworkflow-requirements/LOGS.md` を更新した（P1/P25 対策）
- [ ] `task-specification-creator/LOGS.md` を更新した（P1/P25 対策: 2ファイル両方必須）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴テーブルを更新した（P29 対策）
- [ ] `task-specification-creator/SKILL.md` の変更履歴テーブルを更新した（P29 対策: 2ファイル両方必須）
- [ ] `task-workflow.md` の TASK-SKILL-LIFECYCLE-06 を `spec_created` に更新した
- [ ] `grep -rn "TASK-SKILL-LIFECYCLE-06" .claude/skills/aiworkflow-requirements/references/` を実行し、関連仕様書を確認した
- [ ] `node generate-index.js` を実行した（P2/P27 対策）
- [ ] `git diff --stat -- .claude/skills/` で `topic-map.md` が変更されていることを確認した（P2/P51 対策）
- [ ] `security-skill-execution.md` に ToolRiskLevel・TOOL_RISK_CONFIG への参照を追加した
- [ ] `interfaces-agent-sdk-executor-details.md` に AllowedToolEntryV2・SafetyGatePort への参照を追加した
- [ ] `arch-state-management-reference-permissions-import-lifecycle.md` に permissionHistorySlice 拡張仕様を追加した
- [ ] `outputs/phase-12/system-spec-update-summary.md` に Step 1-A〜1-D + Step 2 の実行結果を記録した

### Task 3 完了確認

- [ ] `outputs/phase-12/documentation-changelog.md` が作成されている
- [ ] 全 Step の実行結果が「事後記録」として記載されている（P4 対策: 実行前に「完了」と書いていない）
- [ ] 全 Task 完了後に「全 Task 完了」を記録した

### Task 4 完了確認

- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件でも必須）
- [ ] 検出した各未タスクの3ステップ（指示書作成 → task-workflow.md 登録 → 関連仕様書リンク）が全て完了している（P3/P38 対策）
- [ ] 再評価クローズした未タスクがある場合、GitHub Issue を `gh issue close` で Close した（P56 対策）

### Task 5 完了確認

- [ ] `outputs/phase-12/skill-feedback-report.md` が作成されている（改善点なしでも必須: P28 対策）

---

## 次 Phase

**Phase 13: PR作成** (`phase-13-pr-creation.md`)

Phase 13 開始条件: 本ファイルの完了条件チェックリストが全項目 CHECKED であること。
