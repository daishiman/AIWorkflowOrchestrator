# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 12                                               |
| 名称       | ドキュメント更新                                 |
| タスクID   | TASK-P0-09                                       |
| ステータス | 未実施                                           |
| 依存       | Phase 11 完了                                    |
| 完了条件   | 5 タスク全て完了していること（0 件でも出力必須） |

---

## 目的

実装した governance 基盤のドキュメントを整備し、システム仕様書との同期を完了する。

---

## 実行タスク

## Task 1: 実装ガイドの作成（2 パート構成）

### Part 1: 中学生レベルの概念説明

**対象読者**: 初学者・非エンジニア
**必須要素**: 日常の例え話、専門用語なし、「なぜ必要か」を先に説明

```markdown
# SDK ガバナンス基盤とは？（Part 1: やさしい説明）

## なぜ必要なの？

スキルクリエイターという AI アシスタントが、あなたのパソコンの中でいろいろな作業をします。
でも、AI がどんなファイルでも自由に書き換えられると困りますよね？

たとえば、「設計を考える（plan）」フェーズでは、AI は読むだけでよく、
ファイルを書き換えるのは「実際に作る（execute）」フェーズだけにしたいです。

## 何をしているの？

**許可証（permission）の仕組み**:
スーパーのアルバイトが「品出しはOK、レジ操作はNG」と決まっているように、
AI にも「このフェーズではこのツールだけ使えるよ」とルールを設定します。

**監視カメラ（hooks）の仕組み**:
AI が何かをしようとするとき（before）と、した後（after）に記録をつけます。
コンビニの防犯カメラみたいなものです。

**記録帳（audit）の仕組み**:
「いつ・誰が・何のツールを・使ったか」を手帳に書き留めます。
後で何か問題があったとき、この記録帳を見れば原因がわかります。
```

### Part 2: 技術者向け詳細説明

**対象読者**: 開発者・技術者
**必須要素**: TypeScript 型定義、API シグネチャ、エラーハンドリング

```typescript
// 実装ガイド Part 2: 技術的詳細

// 1. SkillCreatorPermissionPolicy: phase 別 policy 定義
// phase: 'plan' | 'execute' | 'verify' | 'improve'
import { getPolicy, canUseTool } from "./governance";

const policy = getPolicy("execute");
// { phase: 'execute', permissionMode: 'acceptEdits',
//   allowedTools: ['Read', 'Glob', 'Grep', 'Bash', 'Agent', 'Write', 'Edit'],
//   disallowedTools: ['NotebookEdit'] }

const decision = canUseTool("Write", "execute");
// { allowed: true, reason: '...', phase: 'execute', toolName: 'Write' }

// 2. SkillCreatorAuditSink: in-memory ring buffer
import { SkillCreatorAuditSink } from "./governance";

const auditSink = new SkillCreatorAuditSink(500); // maxEvents: 500
// .record(event) - イベント追加（ring buffer 管理）
// .getEvents() - 全イベント取得（read-only コピー）
// .getDenialEvents() - denial イベントのみ
// .getRecentEvents(n) - 直近 n 件
// .clear() - session 終了時にリセット

// 3. SkillCreatorHooksFactory: lifecycle hooks 生成
import { createHooks } from "./governance";

const hooks = createHooks("execute", auditSink);
hooks.onSessionStart({ sessionId: "session-1" });
const decision = hooks.onPreToolUse({
  sessionId: "session-1",
  toolName: "Write",
});
// -> { allowed: true, ... }
hooks.onPostToolUse({
  sessionId: "session-1",
  toolName: "Write",
  success: true,
});
hooks.onSessionEnd({ sessionId: "session-1", summary: "Execute completed" });

// 4. RuntimeSkillCreatorFacade.getGovernanceState(): IPC 向けレスポンス
// Returns: { phase, activePolicy, recentAuditEvents, recentDenials }
```

**validator 要件**:

- Part 1 は日常の例え話と「なぜ必要か」を先に含める
- Part 2 は TypeScript 型定義 / API シグネチャ / エラーハンドリング / 設定可能パラメータを含める
- Phase 12 の検証コマンド結果と compliance check への参照を追記する

**成果物**: `outputs/phase-12/implementation-guide.md`

---

## Task 2: システム仕様書更新（Step 1-A〜1-G + Step 2）

### Step 1-A: タスク完了記録

以下のファイルに TASK-P0-09 の完了記録を追加する:

- `docs/30-workflows/task-p0-09-sdk-permission-hooks-governance/phase-12-documentation.md` — workflow 本文の current facts 反映
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` — current facts / 完了タスク記録追加
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` — 完了タスク記録追加
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` — backlog 状態更新
- `.claude/skills/aiworkflow-requirements/LOGS.md` — 完了タスク記録追加
- `.claude/skills/task-specification-creator/LOGS.md` — 完了タスク記録追加
- `.claude/skills/aiworkflow-requirements/SKILL.md` / `.claude/skills/task-specification-creator/SKILL.md` — history 追記
- `topic-map.md` / index — 見出しや成果物名が変わった場合のみ再生成

**記録テンプレート**:

```markdown
### TASK-P0-09 完了（2026-XX-XX）

- governance 基盤（policy/hooks/audit）の実装完了
- テスト: TC-PP 18件 / TC-HF 10件 / TC-AS 12件 / TC-FG 9件 全 PASS
- カバレッジ: AuditSink branch XX% (目標 80%)
- 関連ドキュメント: docs/30-workflows/task-p0-09-sdk-permission-hooks-governance/
```

### Step 1-B: 実装状況テーブル更新

`.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` の
TASK-P0-09 ステータスを `未実施` → `completed` に更新する。
このタスクは implementation 扱いのため `completed` を使う。docs-only タスクを再利用する場合のみ `spec_created` を使用する。

### Step 1-C: 関連タスクテーブル更新

TASK-P0-09-U1 の前提条件が整ったことを以下のファイルに記録する:

- `docs/30-workflows/unassigned-task/TASK-P0-09-U1-governance-actual-enforcement-completion.md`
- `docs/30-workflows/unassigned-task/TASK-P0-09-U1-path-scoped-governance-runtime-enforcement.md`
- `task-workflow.md` / `task-workflow-backlog.md` / `task-workflow-completed.md` の関連タスク table

### Step 1-D: index 再生成

phase 名・成果物名・見出しを変更した場合は `index.md` を再生成する。

### Step 1-E: 未タスク登録

1件以上の改善候補がある場合は `docs/30-workflows/unassigned-task/` に指示書を作成する。0件でも detection report は出力する。

### Step 1-F: 補助更新

変更がある場合は lessons learned、workflow summary、関連 skill の current facts を同期する。

### Step 1-G: 検証

以下を実行し、結果を `documentation-changelog.md` と `system-spec-update-summary.md` に転記する。

- `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator --verbose`
- `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator --verbose`
- `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/task-p0-09-sdk-permission-hooks-governance --phase 12`
- `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/task-p0-09-sdk-permission-hooks-governance --json`
- `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/task-p0-09-sdk-permission-hooks-governance`
- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source outputs/phase-12/unassigned-task-detection.md`
- `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`
- `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

### Step 2: システム仕様更新（条件付き）

新規インターフェースの追加、既存インターフェースのシグネチャ変更、または関連型の追加・更新がある場合は、
`.claude/skills/aiworkflow-requirements/references/api-*.md` / `architecture-*.md` / `security-*.md` /
`ui-ux-*.md` / `task-workflow*.md` / `lessons-learned*.md` を必要範囲で更新する。
変更がない資料は no-op とし、その理由を `system-spec-update-summary.md` に記録する。
`SkillCreatorGovernancePhase` / `SkillCreatorGovernanceAuditEvent` / `SkillCreatorGovernanceState` の登録状況を確認し、
未登録なら追加する。

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

---

## Task 3: ドキュメント更新履歴作成

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/task-p0-09-sdk-permission-hooks-governance
```

**成果物**: `outputs/phase-12/documentation-changelog.md`

---

## Task 4: 未タスク検出レポート作成（0 件でも出力必須）

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/main/services/runtime/governance \
  --output outputs/phase-12/unassigned-candidates.json

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --input outputs/phase-12/unassigned-candidates.json \
  --output outputs/phase-12/unassigned-task-detection.md
```

**検出ソース**:

- コードコメント内の TODO / FIXME（特に U1 carry-forward コメント）
- Phase 3 / Phase 10 の MINOR 判定指摘事項
- 実装時に発見した改善候補

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

---

## Task 5: スキルフィードバックレポート作成（改善点なしでも出力必須）

| 観点             | 記録内容                                                         |
| ---------------- | ---------------------------------------------------------------- |
| テンプレート改善 | Phase 2 設計書テンプレートの漏れや曖昧さ                         |
| ワークフロー改善 | governance 基盤実装の教訓（policy テーブル設計の判断ポイント等） |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補                           |

**成果物**: `outputs/phase-12/skill-feedback-report.md`

---

## Task 6: Phase 12 準拠確認

Task 1〜5 と Step 1-A〜1-G / Step 2 が揃っていることを確認し、Phase 12 の完了判定を記録する。

**確認観点**:

- `implementation-guide.md` が Part 1 / Part 2 を含む
- `system-spec-update-summary.md` が Step 1 / Step 2 の根拠を含む
- `documentation-changelog.md` が current / baseline と validator 結果を含む
- `unassigned-task-detection.md` が 0件でも結論を持つ
- `skill-feedback-report.md` が改善点なしでも出力されている
- `phase12-task-spec-compliance-check.md` が Task 12-1〜12-6 の準拠を確認する
- planned wording（仕様策定のみ / 実行予定 / 保留）が残っていない

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 参照資料

- `phase-11-manual-test.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

---

## Phase 12 完了確認チェックリスト（実行前に artifacts 突合）

> [Feedback 2 準拠]: Phase 12 着手の最初の作業として `artifacts.json` と
> 各 phase spec に記載された artifact 名を 1対1 で突合する。

```bash
# artifacts 突合確認
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/task-p0-09-sdk-permission-hooks-governance
```

---

## 成果物

| 成果物名                     | パス                                                     | 必須 |
| ---------------------------- | -------------------------------------------------------- | ---- |
| 実装ガイド（Part 1/2）       | `outputs/phase-12/implementation-guide.md`               | ✅   |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | ✅   |
| ドキュメント変更履歴         | `outputs/phase-12/documentation-changelog.md`            | ✅   |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | ✅   |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | ✅   |
| Phase 12 準拠確認            | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   |

---

## 完了条件チェックリスト

- [ ] `implementation-guide.md` が Part 1（中学生レベル）と Part 2（技術者向け）を含む
- [ ] `documentation-changelog.md` が全 Step（1-A/1-B/1-C/1-D/1-E/1-F/1-G/Step 2）の結果を含む
- [ ] `system-spec-update-summary.md` が Step 1-G と Step 2 の根拠を含む
- [ ] `unassigned-task-detection.md` が 0 件でも作成されている
- [ ] `skill-feedback-report.md` が改善点なしでも作成されている
- [ ] `phase12-task-spec-compliance-check.md` が作成されている
- [ ] `outputs/phase-12/` に全 6 成果物が配置されている

---

## サブタスク管理

| SubAgent   | 責務                                             |
| ---------- | ------------------------------------------------ |
| SubAgent-A | implementation guide / compliance check          |
| SubAgent-B | system spec update / changelog / validation      |
| SubAgent-C | unassigned-task / skill feedback / step 1-G 反映 |
