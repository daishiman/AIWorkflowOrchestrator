# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 12                   |
| Phase名    | ドキュメント更新     |
| 対象機能   | TASK-SW-TODO-001     |
| 前提Phase  | Phase 11: 手動テスト |
| 次Phase    | Phase 13: PR作成     |
| ステータス | 未実施               |
| 作成日     | 2026-04-16           |

## 目的

本タスクの実装内容を中学生レベルの概念説明と技術者向けの実装ガイドとして記録する。
未タスクの検出を行い、将来の参照に備えたトレーサビリティを確保する。
Phase 12 標準に合わせ、`TASK-SW-TODO-001-skill-feedback-report.md` と
`TASK-SW-TODO-001-phase12-task-spec-compliance-check.md` も同波で作成する。

## 実行タスク

### Task 1: 中学生レベルの概念説明

**何を直したか（誰でもわかる説明）**:

このタスクでは、スキルウィザード画面の「主ツールバッジ」に関するメモ（TODOコメント）を
整理しました。

TODOコメントとは「後でやること」を書いたメモのようなものです。
このメモには「`resolveExternalIntegration` という機能を直したら、このバッジを消してね」
と書かれていましたが、その機能を直す予定（`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001`）の
状況が不明なままメモだけが残っていました。

**オプション A を採用した場合**:
「もうバッジは消さなくていい」と判断したので、「後でやること」のメモを削除しました。
バッジはそのまま表示し続けます。

**オプション B を採用した場合**:
「将来まだ変更が必要かもしれない」と判断したので、メモをもっと具体的な内容に書き直しました。
「この条件が変わったら対応してね」と分かりやすくなりました。

どちらのオプションでも、画面上のバッジの見た目・動作は変わりません。

### Task 2: 技術者向け実装ガイド

**修正ファイル**: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

**修正箇所**: 行 456-489 のTODOコメント、行 116 付近の `MAIN_TOOL_BADGE_ENABLED` フラグ（オプション A-1 の場合）

**変更内容（オプション A 採用時）**:

- TODOコメント（`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 参照）を削除
- `MAIN_TOOL_BADGE_ENABLED = true` フラグを削除して直接 `true` を使用（方針 A-1 採用時のみ）
- バッジ表示は恒久化

**変更内容（オプション B 採用時）**:

- TODOコメントを具体的な条件・参照先を含む内容に書き換え
- `MAIN_TOOL_BADGE_ENABLED` フラグは維持

**後続タスクへの引き継ぎ**:

- オプション A 採用時: `resolveExternalIntegration` の主ツール参照ロジック変更は将来タスクで対応
- オプション B 採用時: `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 完了後に改めてコメント削除・バッジ対応を行う

### Task 3: system spec 反映確認

本タスクの変更は `ConversationRoundStep.tsx` 内部のコメント整理であり、
外部仕様（IPC 契約・API）に変更はない。system spec への反映は最小限。

### Task 4: 未タスク検出

本タスクの実施中に判明した未タスク候補:

| 未タスクID | 内容                                                                             | 優先度 |
| ---------- | -------------------------------------------------------------------------------- | ------ |
| FUTURE-001 | `resolveExternalIntegration` の主ツール参照ロジック変更の実装                    | Medium |
| FUTURE-002 | オプション B 採用時: `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 完了後のTODO削除 | Low    |

### Task 5: スキルフィードバックレポート

Phase 12 の実行で得られた学びを整理し、今後の同系タスクに再利用できる観点を残す。

- コメント整理タスクでもオプション選択（A/B）の根拠を設計書に明記することが重要
- `UT-` プレフィックスのタスクIDを含むTODOは、参照先の完了状況を確認してから対応方針を決める
- 極小規模タスクでもPhase 1 で調査を完了させてから設計に入ることで手戻りを防げる

### Task 6: 準拠チェック

5 成果物が揃っていること、task prefix 付きファイル名が spec と一致していること、
planned wording がないことを確認する。

## 参照資料

- `outputs/phase-11/TASK-SW-TODO-001-manual-test-result.md` — 手動テスト結果
- `outputs/phase-10/TASK-SW-TODO-001-final-review-result.md` — 最終レビュー結果

## 統合テスト連携

- 本フェーズはドキュメント作成のみ。統合テストの変更は不要。

## 成果物

| 成果物                                                 | パス                                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------- |
| TASK-SW-TODO-001-implementation-guide.md               | `outputs/phase-12/TASK-SW-TODO-001-implementation-guide.md`               |
| TASK-SW-TODO-001-documentation-changelog.md            | `outputs/phase-12/TASK-SW-TODO-001-documentation-changelog.md`            |
| TASK-SW-TODO-001-unassigned-task-detection.md          | `outputs/phase-12/TASK-SW-TODO-001-unassigned-task-detection.md`          |
| TASK-SW-TODO-001-skill-feedback-report.md              | `outputs/phase-12/TASK-SW-TODO-001-skill-feedback-report.md`              |
| TASK-SW-TODO-001-phase12-task-spec-compliance-check.md | `outputs/phase-12/TASK-SW-TODO-001-phase12-task-spec-compliance-check.md` |

## 完了条件

- [ ] 中学生レベルの概念説明が記述されている
- [ ] 技術者向け実装ガイドが完成している
- [ ] system spec 反映確認が完了している
- [ ] 未タスク検出が記録されている
- [ ] スキルフィードバックレポートが記録されている
- [ ] 準拠チェックが完了している

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
