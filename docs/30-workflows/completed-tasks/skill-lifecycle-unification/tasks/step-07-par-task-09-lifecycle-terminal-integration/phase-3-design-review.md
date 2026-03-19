# Phase 3 設計レビュー - SkillLifecyclePanel Terminal 統合

## メタ情報

| 項目       | 内容                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001                                                                              |
| Phase      | 3 - 設計レビュー                                                                                                         |
| ステータス | 未着手                                                                                                                   |
| 前提 Phase | Phase 1・Phase 2 完了（`outputs/phase-1/requirements-analysis.md`、`outputs/phase-2/design-document.md` が存在すること） |
| 成果物     | `outputs/phase-3/design-review-report.md`                                                                                |
| 次 Phase   | PASS または MINOR → Phase 4、MAJOR（要件問題）→ Phase 1、MAJOR（設計問題）→ Phase 2                                      |

## 目的

Phase 1 の要件定義と Phase 2 の設計成果物を多角的に検証し、実装フェーズ（Phase 4 以降）へ安全に進めるか判定する。

## 実行タスク

### Task 3-1: terminal handoff 5契約の完全カバレッジ確認

Phase 2 設計成果物（`outputs/phase-2/design-document.md`）が、terminal handoff 5契約（TH-01〜TH-05）を全てカバーしているかを以下の観点で検証する。

| 契約番号 | 検証観点                                                                                       | 合否   |
| -------- | ---------------------------------------------------------------------------------------------- | ------ |
| TH-01    | TerminalHandoffCard が prompt bundle・context summary・open terminal を1カードに表示しているか | 未検証 |
| TH-02    | execute→terminal handoff 時に「自動実行しない」旨がカード内に明記されているか                  | 未検証 |
| TH-03    | buildForSkillImprovement() の prompt に improvementSummary が含まれているか                    | 未検証 |
| TH-04    | Terminal ボタンが全フェーズ（create/execute/improve）で常時表示されるか                        | 未検証 |
| TH-05    | onDismiss が clearHandoffGuidance() を呼び出すだけで、autopilot bridge にならないか            | 未検証 |

各契約について「合格」または「不合格（理由）」を記録する。不合格の場合は MAJOR 判定とする。

### Task 3-2: UX 禁止事項への準拠確認

`ui-ux-realization.md` L65-71 の UX 禁止事項に対して、Phase 2 設計が抵触していないかを確認する。

| 禁止事項                                                  | 設計での対応                                                     | 合否   |
| --------------------------------------------------------- | ---------------------------------------------------------------- | ------ |
| Planner/Executor/Improver を mode switch として露出しない | Terminal ボタンのラベルが `Terminal` 固定であること              | 未検証 |
| create/execute/improve を別アプリのように分断しない       | Terminal ボタンが単一 SkillLifecyclePanel に統合されていること   | 未検証 |
| chat surface が主導線を食い潰す構造にしない               | TerminalHandoffCard が supporting surface として扱われていること | 未検証 |
| terminal transcript を hidden panel に閉じ込めない        | TerminalHandoffCard が閲覧可能な状態で表示されること             | 未検証 |
| terminal 入口を画面ごとに別名へばらさない                 | Terminal ボタンラベルが全フェーズで `Terminal` であること        | 未検証 |

### Task 3-3: TerminalHandoffCard props 仕様との整合性確認

Phase 2 Task 2-2 の props マッピング設計が、実際の `TerminalHandoffCard.tsx` の Props インターフェースと一致しているかを確認する。

確認項目:

- `guidance.terminalCommand`（`string` 型）が `HandoffGuidance.terminalCommand` と型一致しているか
- `guidance.contextSummary`（`string` 型）が `HandoffGuidance.contextSummary` と型一致しているか
- `guidance.reason`（`string` 型）が `HandoffGuidance.reason` と型一致しているか
- `onCopyCommand: () => void` と `onDismiss: () => void` のシグネチャが一致しているか
- `localizeContextSummary()` の入力フォーマット（`surface=skill skill={token}` または `surface=skill skill={token} improve=true`）に `buildForSkillImprovement()` の contextSummary が適合しているか

### Task 3-4: agentSlice handoffGuidance 管理との一貫性確認

Phase 2 Task 2-4 の接続設計が、agentSlice.ts の実装と一貫しているかを確認する。

確認項目:

- `HandoffGuidance | null` 型の初期値が `null`（L408）であることと、表示条件設計（`handoffGuidance !== null`）が一致しているか
- `setHandoffGuidance(guidance)` がアクション L1038 で定義されていることと、設計の呼び出し方が一致しているか
- `clearHandoffGuidance()` がアクション L1040 で定義されていることと、`onDismiss` ハンドラの設計が一致しているか
- agentSlice が既存の `executeSkill` で `handoffGuidance` を更新する箇所（L796-824）と、手動 Terminal ボタンによる `setHandoffGuidance()` の呼び出しが競合しないか（上書き可能な設計であるか）

### Task 3-5: アーキテクチャ依存方向の確認

Phase 2 Task 2-4 の IPC ハンドラ設計が、アーキテクチャルール（`01-architecture.md` レイヤー依存方向）に準拠しているかを確認する。

確認項目:

- Renderer 側が `TerminalHandoffBuilder` を直接 import していないこと
- 新規 IPC チャンネル `skill:buildImprovementHandoff` が IPC チャンネル定数（ホワイトリスト）に登録される設計になっているか（`04-electron-security.md` IPC セキュリティ原則）
- IPC ハンドラ登録関数の引数型がインターフェースであること（P61 DIP 準拠）

## 参照資料

| 資料                      | パス                                                                                         | 参照目的                             |
| ------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 1 成果物            | `outputs/phase-1/requirements-analysis.md`                                                   | 受入基準の確認                       |
| Phase 2 成果物            | `outputs/phase-2/design-document.md`                                                         | 設計仕様の検証対象                   |
| UI/UX 正本（UX 禁止事項） | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md` L65-71                  | UX 禁止事項への準拠確認              |
| TerminalHandoffCard       | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/TerminalHandoffCard.tsx` | Props インターフェースとの整合性確認 |
| agentSlice                | `apps/desktop/src/renderer/store/slices/agentSlice.ts` L179、L408、L796-824、L1038-1040      | handoffGuidance 管理との一貫性確認   |
| アーキテクチャルール      | `.claude/rules/01-architecture.md`                                                           | レイヤー依存方向の確認               |
| IPC セキュリティルール    | `.claude/rules/04-electron-security.md` IPC セキュリティ原則                                 | チャンネルホワイトリスト管理の確認   |
| P42 バリデーションルール  | `.claude/rules/06-known-pitfalls.md#P42`                                                     | 文字列引数の trim バリデーション確認 |
| P61 DIP 準拠ルール        | `.claude/rules/06-known-pitfalls.md#P61`                                                     | IPC ハンドラ引数型の確認             |

## 実行手順

1. `outputs/phase-1/requirements-analysis.md` を読み取り、受入基準リストを確認する
2. `outputs/phase-2/design-document.md` を読み取り、Task 2-1〜2-4 の全設計を把握する
3. Task 3-1: 5契約（TH-01〜TH-05）それぞれについて、設計文書内の対応箇所を特定し、合否を記録する
4. Task 3-2: UX 禁止事項（L65-71）5項目それぞれについて、設計文書内の根拠を確認し、合否を記録する
5. Task 3-3: `TerminalHandoffCard.tsx` を読み取り、props 型と設計の props マッピング表を照合する
6. Task 3-4: `agentSlice.ts` の L179、L408、L796-824、L1038-1040 を読み取り、設計の接続フローと照合する
7. Task 3-5: 設計文書のアーキテクチャ記述を `01-architecture.md` および `04-electron-security.md` と照合する
8. 全観点の合否を集計し、PASS / MINOR / MAJOR を判定する
9. MINOR 指摘は全て具体的な修正内容として記録する
10. `outputs/phase-3/design-review-report.md` に判定結果と指摘事項を記録する

## 統合テスト連携

Phase 3 レビューで PASS または MINOR となった場合、Phase 4 テスト作成のインプットとして以下を確認する。

- Task 3-3 で確認した `localizeContextSummary()` の入力フォーマット（`improve=true` フラグの有無）
- Task 3-4 で確認した `handoffGuidance` の型定義（`HandoffGuidance | null`）
- Task 3-1 の TH-02 確認結果（「自動実行しない」旨の表示有無）

## 多角的チェック観点

| 観点                 | チェック内容                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------- |
| 要件カバレッジ完全性 | TH-01〜TH-05 の全5契約に対応する設計が存在しているか                                     |
| UX 禁止事項完全性    | L65-71 の全5禁止事項に対して設計上の対応が明記されているか                               |
| 型整合性             | props マッピングの全フィールドが TypeScript 型定義と一致しているか                       |
| 状態管理一貫性       | setHandoffGuidance / clearHandoffGuidance の呼び出しが agentSlice の定義と一致しているか |
| セキュリティ準拠     | 新規 IPC チャンネルがホワイトリスト管理の対象として設計されているか                      |
| バリデーション準拠   | buildForSkillImprovement() の文字列引数が P42 の3段バリデーション要件を満たしているか    |

## 判定基準

| 判定              | 条件                                                                                        | 対応                      |
| ----------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| PASS              | 全5契約カバレッジ確認完了、UX 禁止事項全5項目準拠、型整合性全項目一致、セキュリティ準拠     | Phase 4 へ進む            |
| MINOR             | 軽微な不整合（型名の表記ゆれ、コメント不足など）があるが機能仕様に影響しない                | 指摘対応後 Phase 4 へ進む |
| MAJOR（要件問題） | TH-01〜TH-05 のいずれかが受入基準に変換されていない、または UX 禁止事項に抵触する設計がある | Phase 1 へ戻る            |
| MAJOR（設計問題） | アーキテクチャ違反・型不整合・handoffGuidance 接続フローの欠陥がある                        | Phase 2 へ戻る            |

## 成果物テーブル

| 成果物                  | パス                                      | 完了条件                                            |
| ----------------------- | ----------------------------------------- | --------------------------------------------------- |
| design-review-report.md | `outputs/phase-3/design-review-report.md` | PASS/MINOR/MAJOR の判定と全指摘事項が記録されている |

## 完了条件チェックリスト

- [ ] Task 3-1: TH-01〜TH-05 の全5契約について合否と根拠が記録されている
- [ ] Task 3-2: UX 禁止事項（L65-71）全5項目について合否と根拠が記録されている
- [ ] Task 3-3: TerminalHandoffCard の props 型と設計の props マッピングが全フィールド一致していることが確認されている
- [ ] Task 3-4: agentSlice の handoffGuidance 管理（setHandoffGuidance / clearHandoffGuidance）との一貫性が確認されている
- [ ] Task 3-5: IPC チャンネルのホワイトリスト管理・アーキテクチャ依存方向・DIP 準拠が確認されている
- [ ] PASS / MINOR / MAJOR の判定が明記されている
- [ ] MINOR 指摘の場合は全指摘事項に具体的な修正内容が記述されている
- [ ] MAJOR 判定の場合は戻り先 Phase（1 または 2）と理由が明記されている
- [ ] `outputs/phase-3/design-review-report.md` が作成されている

## 次 Phase

- PASS または MINOR 指摘対応後 → Phase 4 テスト作成 (`phase-4-test-creation.md`)
- MAJOR（要件問題）→ Phase 1 要件定義 (`phase-1-requirements.md`)
- MAJOR（設計問題）→ Phase 2 設計 (`phase-2-design.md`)
