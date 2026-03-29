# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| Phase      | 12                                   |
| Phase名    | ドキュメント更新                     |
| 前提Phase  | Phase 11                             |
| 後続Phase  | Phase 13                             |
| ステータス | spec_created                         |
| 作成日     | 2026-03-29                           |
| 機能名     | task-rt-02-api-key-ui-adapter-status |
| タスク分類 | UI task                              |

## 目的

実装ガイド、same-wave sync、未タスク、feedback を Phase 12 ガイドに沿って完了させる。

## 実行タスク

- 実装ガイド作成: Part 1/2 を満たす
- same-wave sync: Step 1-A〜1-C を必須実施する
- Phase 12 close-out: changelog / unassigned / feedback / compliance-check を作成する

## Task 12-1: 実装ガイド作成

### Part 1

- `たとえば` を含む
- なぜ必要か → 何をするかの順で書く
- API key 登録と接続確認の違いを日常語で説明する

### Part 2

- `ProviderStatus` / `HealthCheckResult` / 局所 state の役割を書く
- `apiKey.list()` / `llm.checkHealth()` の使用例を書く
- retry / error / no-key の edge case を書く
- 今回は新規 public IPC 追加なしであることを明記する

## Task 12-2: system spec update summary

### Step 1-A〜1-C

- 完了タスク記録
- 関連ドキュメントリンク
- LOGS.md x2 更新
- 実装状況と関連タスク更新

### Step 2 判定

今回のエレガント方針では、新規 public IPC / shared 型 / preload surface を追加しないため、Step 2 は **原則 no-op**。
ただし、実装時に public contract を実際に変更した場合は no-op にせず current fact を更新する。

## Task 12-3〜12-6

- `documentation-changelog.md`
- `unassigned-task-detection.md`
- `skill-feedback-report.md`
- `phase12-task-spec-compliance-check.md`

上記 4 点を `outputs/phase-12/` に揃える。

## 参照資料

| 参照資料             | パス                                                                                   | 内容           |
| -------------------- | -------------------------------------------------------------------------------------- | -------------- |
| Phase 12 ガイド      | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | 必須 close-out |
| spec update workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1/2       |

## 成果物

| 成果物               | パス                                                     | 説明                |
| -------------------- | -------------------------------------------------------- | ------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1/2            |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1/2 判定       |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | same-wave sync 記録 |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも必須         |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | 改善点の有無        |
| 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 最終確認   |

## 完了条件

- [ ] Part 1/2 実装ガイドが揃っている
- [ ] Step 1-A〜1-C が完了している
- [ ] Step 2 判定理由が記録されている
- [ ] changelog / unassigned / feedback / compliance-check が揃っている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR作成
