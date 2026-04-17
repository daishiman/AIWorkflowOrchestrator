# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 12                   |
| Phase名    | ドキュメント更新     |
| 対象機能   | TASK-SW-CANCEL-001   |
| 前提Phase  | Phase 11: 手動テスト |
| 次Phase    | Phase 13: PR作成     |
| ステータス | 未実施               |
| 作成日     | 2026-04-16           |

## 目的

本タスクの実装内容を中学生レベルの概念説明と技術者向けの実装ガイドとして記録する。
未タスクの検出を行い、後続の TASK-SW-CANCEL-002 への引き継ぎ情報を整備する。
Phase 12 標準に合わせ、`TASK-SW-CANCEL-001-skill-feedback-report.md` と
`TASK-SW-CANCEL-001-phase12-task-spec-compliance-check.md` も同波で作成する。

## 実行タスク

### Task 1: 中学生レベルの概念説明

**何を追加したか（誰でもわかる説明）**:

このタスクでは、スキル作成アプリの「キャンセル機能」を作るための準備をしました。

アプリでスキルを作るとき、途中でやめたい（キャンセルしたい）ことがあります。
そのために、「キャンセルしてください」という合言葉（チャンネル定数）を1つ追加しました。

具体的には `"skill-creator:cancel"` という名前の合言葉を、
みんなが共有して使えるファイル（`channels.ts`）に追加しました。

このような合言葉を共有ファイルに書いておくと、
アプリの色々な部品が同じ合言葉を使って「キャンセル」の信号を送れるようになります。

今回の追加で、次のタスク（TASK-SW-CANCEL-002）でキャンセルボタンを押したときに
アプリの裏側（メインプロセス）へ信号を送る仕組みを作れるようになります。

### Task 2: 技術者向け実装ガイド

**修正ファイル**: `packages/shared/src/ipc/channels.ts`

**修正箇所**: `SKILL_CREATOR_RUNTIME_CHANNELS` オブジェクト（行 195 付近）

**変更内容**:

- `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` を `SKILL_CREATOR_RUNTIME_CHANNELS` に追加
- `apps/desktop/src/preload/channels.ts` は `SKILL_CREATOR_RUNTIME_CHANNELS` をスプレッドしているため、
  Preload 側への変更は不要で自動有効化される

**後続タスクへの引き継ぎ**:

- TASK-SW-CANCEL-002 は本タスク完了後に着手できる
- TASK-SW-CANCEL-002 では `apps/desktop/src/preload/skill-creator-api.ts` に
  `cancelGeneration: () => Promise<IpcResult<void>>` メソッドを追加し、
  `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を実装する
- TASK-SW-CANCEL-003 ではメインプロセスに `SKILL_CREATOR_CANCEL` チャンネルのハンドラーを追加する
- TASK-SW-CANCEL-004 では `useCancelGeneration.ts` を更新して IPC 経由でキャンセルを送信する

### Task 3: system spec 反映確認

本タスクの変更は `packages/shared/src/ipc/channels.ts` へのチャンネル定数追加であり、
IPC チャンネル定義の拡張に該当する。既存チャンネルの変更はない。

`SKILL_CREATOR_RUNTIME_CHANNELS` に新チャンネルが追加されたことを system spec へ反映する。

### Task 4: 未タスク検出

本タスクの実施中に判明した未タスク候補:

| 未タスクID | 内容                                                        | 優先度 |
| ---------- | ----------------------------------------------------------- | ------ |
| FUTURE-001 | `SKILL_CREATOR_CANCEL` チャンネルのメインプロセスハンドラー | High   |
| FUTURE-002 | Preload API への `cancelGeneration` メソッド追加            | High   |
| FUTURE-003 | `useCancelGeneration` の IPC 連携実装                       | High   |

これらはすでに TASK-SW-CANCEL-002〜004 として分解済みである。

### Task 5: スキルフィードバックレポート

Phase 12 の実行で得られた学びを整理し、今後の同系タスクに再利用できる観点を残す。

- `SKILL_CREATOR_RUNTIME_CHANNELS` へのスプレッド設計により Preload 側への変更が不要になる
  設計の利点が本タスクで実証された
- 極小規模（1行追加）のタスクでも Phase 1-13 フローを完全に踏むことで、
  後続タスクへの引き継ぎ情報が整備される
- チャンネル定数追加のテストは値の検証・IPC_CHANNELS への包含確認・既存値の回帰の3観点が有効

### Task 6: 準拠チェック

4成果物が揃っていること、task prefix 付きファイル名が spec と一致していること、
planned wording がないことを確認する。

## 参照資料

- `outputs/phase-11/TASK-SW-CANCEL-001-manual-test-result.md` — 手動テスト結果
- `outputs/phase-10/TASK-SW-CANCEL-001-final-review-result.md` — 最終レビュー結果

## 統合テスト連携

- 本フェーズはドキュメント作成のみ。統合テストの変更は不要。

## 成果物

| 成果物                                                   | パス                                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------------------- |
| TASK-SW-CANCEL-001-implementation-guide.md               | `outputs/phase-12/TASK-SW-CANCEL-001-implementation-guide.md`               |
| TASK-SW-CANCEL-001-documentation-changelog.md            | `outputs/phase-12/TASK-SW-CANCEL-001-documentation-changelog.md`            |
| TASK-SW-CANCEL-001-skill-feedback-report.md              | `outputs/phase-12/TASK-SW-CANCEL-001-skill-feedback-report.md`              |
| TASK-SW-CANCEL-001-phase12-task-spec-compliance-check.md | `outputs/phase-12/TASK-SW-CANCEL-001-phase12-task-spec-compliance-check.md` |

## 完了条件

- [ ] 中学生レベルの概念説明が記述されている
- [ ] 技術者向け実装ガイドが完成している
- [ ] system spec 反映確認が完了している
- [ ] 未タスク検出が記録されている
- [ ] スキルフィードバックレポートが記録されている
- [ ] 準拠チェックが完了している
- [ ] TASK-SW-CANCEL-002 への引き継ぎ情報が整備されている

## タスク100%実行確認【必須】

- [ ] Task 1（中学生レベルの概念説明）を100%実行した
- [ ] Task 2（技術者向け実装ガイド）を100%実行した
- [ ] Task 3（system spec 反映確認）を100%実行した
- [ ] Task 4（未タスク検出）を100%実行した
- [ ] Task 5（スキルフィードバックレポート）を100%実行した
- [ ] Task 6（準拠チェック）を100%実行した
- [ ] 全成果物が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
