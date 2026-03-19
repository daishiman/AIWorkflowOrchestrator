# Phase 10 最終レビュー - SkillLifecyclePanel Terminal 統合

## メタ情報

| 項目       | 内容                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001                                                                                                        |
| Phase      | 10 - 最終レビュー                                                                                                                                  |
| ステータス | 未着手                                                                                                                                             |
| 前提 Phase | Phase 9 完了（`outputs/phase-9/quality-report.md` が存在し、Lint・型チェック・全テストが PASS であること）                                         |
| 成果物     | `outputs/phase-10/final-review-report.md`                                                                                                          |
| 次 Phase   | PASS → Phase 11、MINOR → 未タスク仕様書作成後 Phase 11（省略不可）、MAJOR → 影響範囲に応じて Phase 1-5 へ戻る、CRITICAL → Phase 1 へ戻り要件再確認 |

## サブタスク管理

本 Phase をサブエージェントに委譲する場合、以下のルールを厳守すること。

- 更新対象が 4 ファイル以上の場合はサブエージェントを複数に分割し、各エージェントの更新対象を 3 ファイル以下に制限する（P43 対策）
- サブエージェントの完了報告を待ってから、メインエージェントが成果物の存在を `ls` / `git diff --stat` で検証する

## 目的

実装全体を多角的に検証し、terminal handoff 5契約・UX 禁止事項・アーキテクチャ・セキュリティ・GAP 解消の全観点で品質基準を満たしていることを確認する。

## 実行タスク

### Task 10-1: terminal handoff 5契約カバレッジ確認

`outputs/phase-1/requirements-analysis.md` に記録された受入基準を参照し、実装コードが全5契約を満たしているかを確認する。

| 契約番号 | 場面                               | 確認観点                                                                                                          | 確認対象ファイルと箇所                                        | 合否   |
| -------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------ |
| TH-01    | create を terminal へ渡す          | TerminalHandoffCard が terminalCommand・contextSummary・reason を1カードに表示していること                        | `SkillLifecyclePanel.tsx`（TerminalHandoffCard 埋め込み箇所） | 未確認 |
| TH-02    | execute を terminal へ渡す         | execute フェーズの handoff で「この画面では自動実行しない」旨の文言が reason または contextSummary に含まれること | `TerminalHandoffBuilder.ts`（buildForSkillExecution 実装）    | 未確認 |
| TH-03    | improve を terminal へ渡す         | buildForSkillImprovement() の生成する terminalCommand に improvementSummary が含まれること                        | `TerminalHandoffBuilder.ts`（buildForSkillImprovement 実装）  | 未確認 |
| TH-04    | どの画面でも terminal を開く       | create・execute・improve の全フェーズで Terminal ボタンが常時表示されること                                       | `SkillLifecyclePanel.tsx`（Terminal ボタン実装箇所）          | 未確認 |
| TH-05    | terminal transcript を chat へ戻す | onDismiss が clearHandoffGuidance() のみを呼び出し、autopilot bridge（自動送信）を行っていないこと                | `SkillLifecyclePanel.tsx`（onDismiss ハンドラ実装箇所）       | 未確認 |

- 未達の契約が1件以上ある場合は MAJOR 判定とする
- 各契約の受入基準（Phase 1 成果物）と実装の対応箇所を具体的なコード行番号で記録する

### Task 10-2: UX 禁止事項遵守確認

`ui-ux-realization.md` L65-71 の5項目に対して実装が抵触していないかを確認する。

| 禁止事項                                                  | 確認観点                                                                                                                          | 合否   |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Planner/Executor/Improver を mode switch として露出しない | Terminal ボタンのラベルが `"Terminal"` の固定文字列であり、内部 role 名（Planner 等）が含まれていないこと                         | 未確認 |
| create/execute/improve を別アプリのように分断しない       | Terminal ボタンが単一の SkillLifecyclePanel ヘッダーに統合されており、フェーズごとに別 URL や別ウィンドウに遷移しないこと         | 未確認 |
| chat surface が主導線を食い潰す構造にしない               | TerminalHandoffCard が supporting surface として配置されており、SkillLifecyclePanel の主 CTA（スキルを作る 等）を隠していないこと | 未確認 |
| terminal transcript を hidden panel に閉じ込めない        | TerminalHandoffCard が表示状態でユーザーに閲覧可能であり、`hidden` クラスまたは visibility:hidden で隠されていないこと            | 未確認 |
| terminal 入口を画面ごとに別名へばらさない                 | create・execute・improve の全フェーズで Terminal ボタンのラベルが同一文字列（`"Terminal"`）であること                             | 未確認 |

- 1項目でも抵触している場合は MAJOR 判定とする

### Task 10-3: アーキテクチャ準拠確認

`01-architecture.md` のレイヤー依存方向ルールに従い、実装が正しい依存方向を守っているかを確認する。

確認項目:

- Renderer 側（`SkillLifecyclePanel.tsx` 等）が `TerminalHandoffBuilder` を直接 import していないこと（Renderer→Main の直接依存禁止）
- Terminal ボタンクリック時の handoff データ取得が IPC 経由（`safeInvoke(IPC_CHANNELS.SKILL_BUILD_IMPROVEMENT_HANDOFF, ...)` 等）で行われていること
- 新規 IPC チャンネル `skill:buildImprovementHandoff` が `apps/desktop/src/preload/channels.ts` のホワイトリストに登録されていること（`04-electron-security.md` IPC セキュリティ原則）
- Main Process のハンドラ登録関数が `TerminalHandoffBuilder` の具象クラスではなくインターフェース型を引数に取っていること（P61 DIP 準拠）

### Task 10-4: セキュリティ準拠確認

既知の落とし穴（`06-known-pitfalls.md`）に対して実装が準拠しているかを確認する。

| Pitfall | 確認観点                                                                                                                                                       | 確認対象                                                                 | 合否   |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------ |
| P42     | `buildForSkillImprovement()` の文字列引数（skillName・improvementSummary 等）に3段バリデーション（`typeof` → `=== ""` → `.trim() === ""`）が適用されていること | `TerminalHandoffBuilder.ts`（buildForSkillImprovement 内バリデーション） | 未確認 |
| P55     | `sanitizePrompt()` が `escapeRegExp()` を使用して正規表現メタ文字をエスケープしていること                                                                      | `TerminalHandoffBuilder.ts`（sanitizePrompt 実装）                       | 未確認 |
| P61     | IPC ハンドラ登録関数の引数型がインターフェース（Port 型）であり、具象クラスを直接受け取っていないこと                                                          | Main ハンドラ登録ファイル                                                | 未確認 |
| P48     | `handoffGuidance` 参照箇所に `!`（non-null assertion）が使用されていないこと                                                                                   | `SkillLifecyclePanel.tsx`（handoffGuidance 参照箇所）                    | 未確認 |
| P19/P49 | `as` キャストによる実行時検証バイパスが行われていないこと（型ガードまたは `in` 演算子を使用していること）                                                      | `TerminalHandoffBuilder.ts`・`SkillLifecyclePanel.tsx`                   | 未確認 |

### Task 10-5: GAP 解消確認

`artifacts.json` に記録された4件の GAP が全て解消されていることを確認する。

| GAP ID | 解消条件                                                                                                                                 | 確認対象ファイル                                                     | 解消可否 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------- |
| C-02   | `SkillLifecyclePanel.tsx` のヘッダー（L419-435 周辺）に Terminal ボタンが存在し、全フェーズで表示されること                              | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 未確認   |
| C-03   | `SkillLifecyclePanel.tsx` に `TerminalHandoffCard` が import され、`handoffGuidance !== null` の条件で表示されること                     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 未確認   |
| C-07   | `buildForSkillImprovement()` が実装され、生成する handoff prompt に `improvementSummary` の内容が含まれること                            | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`   | 未確認   |
| D-02   | TerminalDock への接続パスが確保されており（または TerminalHandoffCard 経由で terminal を開く手段が存在し）、TH-04 の受入基準を満たすこと | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 未確認   |

### Task 10-6: 判定と指摘事項記録

Task 10-1〜10-5 の全確認結果を集計し、以下の判定基準に従って最終判定を下す。

| 判定     | 条件                                                                                                                         | 対応                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| PASS     | TH-01〜TH-05 全5契約合格・UX 禁止事項全5項目合格・アーキテクチャ準拠・全セキュリティ項目合格・全 GAP 解消                    | Phase 11 へ進む                                        |
| MINOR    | 機能仕様に影響しない軽微な不整合（型コメントの表記ゆれ・ログ文言の微調整・不使用インポートの残存など）                       | 全指摘を未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | TH-01〜TH-05 のいずれかが未達・UX 禁止事項に抵触・アーキテクチャ違反・GAP 未解消のいずれかに該当                             | 影響範囲に応じて Phase 1-5 へ戻る                      |
| CRITICAL | terminal handoff 5契約の設計仕様そのものに根本的な欠陥が見つかった場合、または UX 禁止事項の禁止事項定義自体に矛盾がある場合 | Phase 1 へ戻り要件再確認                               |

指摘事項の記録形式:

- 指摘番号（例: R10-01）
- 指摘分類（MINOR / MAJOR / CRITICAL）
- 指摘内容（具体的なファイル・行番号・問題の記述）
- 修正内容（具体的な修正手順）
- 対応 Phase（MINOR の場合は未タスク仕様書パス）

### MINOR 追跡テーブル

Phase 10 で MINOR 判定とした指摘事項のライフサイクルを追跡する。

| 指摘番号                             | 指摘内容 | 解決予定 Phase | 解決確認 Phase | ステータス |
| ------------------------------------ | -------- | -------------- | -------------- | ---------- |
| （MINOR 指摘なし、または以下に記録） |          |                |                |            |

- MINOR 指摘は**全て**未タスク仕様書に変換する（「機能影響なし」でも省略不可）
- 解決確認 Phase は、指摘が修正されたことを確認する Phase を記録する

## 参照資料

| 資料                               | パス                                                                                                                    | 参照目的                                    |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Phase 1 成果物（受入基準）         | `outputs/phase-1/requirements-analysis.md`                                                                              | terminal handoff 5契約の受入基準照合        |
| Phase 9 成果物（品質検証レポート） | `outputs/phase-9/quality-report.md`                                                                                     | Lint・型チェック・テスト PASS の前提確認    |
| UI/UX 正本（UX 禁止事項）          | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md` L65-71                                             | UX 禁止事項5項目の確認                      |
| UI/UX 正本（terminal handoff）     | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md` L42-50                                             | terminal handoff 5契約の確認                |
| artifacts.json（GAP 一覧）         | `docs/30-workflows/skill-lifecycle-unification/tasks/step-07-par-task-09-lifecycle-terminal-integration/artifacts.json` | GAP C-02・C-03・C-07・D-02 の解消確認       |
| SkillLifecyclePanel                | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                                    | Terminal ボタン・TerminalHandoffCard の確認 |
| TerminalHandoffBuilder             | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`                                                      | buildForSkillImprovement 実装確認           |
| アーキテクチャルール               | `.claude/rules/01-architecture.md`                                                                                      | レイヤー依存方向の確認                      |
| IPC セキュリティルール             | `.claude/rules/04-electron-security.md`                                                                                 | チャンネルホワイトリスト管理の確認          |
| P42 バリデーションルール           | `.claude/rules/06-known-pitfalls.md#P42`                                                                                | 3段バリデーション準拠確認                   |
| P48 non-null assertion ルール      | `.claude/rules/06-known-pitfalls.md#P48`                                                                                | non-null assertion 未使用確認               |
| P55 escapeRegExp ルール            | `.claude/rules/06-known-pitfalls.md#P55`                                                                                | sanitizePrompt の escapeRegExp 適用確認     |
| P61 DIP 準拠ルール                 | `.claude/rules/06-known-pitfalls.md#P61`                                                                                | IPC ハンドラ引数型のインターフェース確認    |
| タスク実行ワークフロー（Phase 10） | `.claude/rules/05-task-execution.md`                                                                                    | Phase 10 判定基準と MINOR 対応ルール        |

## 実行手順

1. `outputs/phase-9/quality-report.md` を読み取り、Lint・型チェック・全テスト PASS の前提を確認する
2. `outputs/phase-1/requirements-analysis.md` を読み取り、TH-01〜TH-05 の受入基準リストを確認する
3. Task 10-1: `SkillLifecyclePanel.tsx` と `TerminalHandoffBuilder.ts` を読み取り、TH-01〜TH-05 の実装対応箇所を特定して合否を記録する
4. Task 10-2: 実装コードを読み取り、UX 禁止事項5項目それぞれへの抵触有無を確認して合否を記録する
5. Task 10-3: `SkillLifecyclePanel.tsx` の import 文と IPC 呼び出し箇所、`apps/desktop/src/preload/channels.ts` のホワイトリストを確認してアーキテクチャ準拠を記録する
6. Task 10-4: `TerminalHandoffBuilder.ts` のバリデーション実装・`sanitizePrompt` 実装・`SkillLifecyclePanel.tsx` の handoffGuidance 参照箇所を確認してセキュリティ準拠を記録する
7. Task 10-5: `artifacts.json` の GAP 4件それぞれについて、対応ファイルの実装内容を確認して解消可否を記録する
8. Task 10-6: 全確認結果を集計し、PASS / MINOR / MAJOR / CRITICAL を判定する
9. 指摘事項を R10-XX 形式で番号付けし、修正内容と対応 Phase を記録する
10. MINOR 判定の場合は全指摘事項について未タスク仕様書を作成する（省略不可）
11. `outputs/phase-10/final-review-report.md` に判定結果と全指摘事項を記録する

## 成果物テーブル

| 成果物                 | パス                                      | 完了条件                                                                                         |
| ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| final-review-report.md | `outputs/phase-10/final-review-report.md` | PASS/MINOR/MAJOR/CRITICAL の判定と、全指摘事項（指摘番号・分類・内容・修正内容）が記録されている |

## タスク100%実行確認【必須】

本 Phase の全タスクを完全に実行したことを確認する。

- [ ] 上記「実行タスク」セクションの全タスク（Task 10-1〜10-6）を実行した
- [ ] 各タスクの確認結果が全て記録されている
- [ ] PASS/MINOR/MAJOR/CRITICAL の判定が明記されている

## 統合テスト連携

本 Phase の判定結果は、Phase 11 への進行可否と Phase 1-5 への差戻しを決定する。

- PASS: Phase 11 へ進む
- MINOR: 未タスク仕様書に変換後 Phase 11 へ（省略不可）
- MAJOR: 影響範囲に応じて Phase 1-5 へ差戻し
- CRITICAL: Phase 1 へ全面差戻し

## 多角的チェック観点

| 観点            | 確認内容                                                     |
| --------------- | ------------------------------------------------------------ |
| 5契約カバレッジ | TH-01〜TH-05 の全契約が実装で満たされていること              |
| UX 禁止事項     | ui-ux-realization.md L65-71 の5項目に抵触していないこと      |
| セキュリティ    | P42/P48/P49/P55/P61 の全準拠を確認すること                   |
| GAP 完全解消    | C-02・C-03・C-07・D-02 の4 GAP が全て解消されていること      |
| MINOR 追跡      | MINOR 判定の指摘事項が全て未タスク仕様書に変換されていること |

## 完了条件チェックリスト

- [ ] Task 10-1: TH-01〜TH-05 の全5契約について、実装コードの対応箇所（ファイル名・行番号）と合否が記録されている
- [ ] Task 10-2: UX 禁止事項（`ui-ux-realization.md` L65-71）全5項目について合否と根拠が記録されている
- [ ] Task 10-3: Renderer が TerminalHandoffBuilder を直接 import していないこと、IPC チャンネルがホワイトリスト登録されていること、DIP 準拠が確認されている
- [ ] Task 10-4: P42・P55・P61・P48・P19/P49 の全セキュリティ項目について合否が記録されている
- [ ] Task 10-5: GAP C-02・C-03・C-07・D-02 の全4件について解消可否と確認根拠が記録されている
- [ ] Task 10-6: PASS / MINOR / MAJOR / CRITICAL のいずれかの判定が明記されている
- [ ] MINOR 判定の場合、全指摘事項が未タスク仕様書（`outputs/phase-10/unassigned-task/` 配下）に変換されている（省略不可）
- [ ] MAJOR 判定の場合、戻り先 Phase（1〜5）と理由が明記されている
- [ ] CRITICAL 判定の場合、要件の根本的欠陥の内容が明記されている
- [ ] `outputs/phase-10/final-review-report.md` が作成されている

## 次 Phase

- PASS → Phase 11 手動テスト (`phase-11-manual-test.md`)
- MINOR 指摘対応後（未タスク仕様書作成完了後）→ Phase 11 手動テスト (`phase-11-manual-test.md`)
- MAJOR → 影響範囲に応じて Phase 1-5 の該当 Phase へ戻る
- CRITICAL → Phase 1 要件定義 (`phase-1-requirements.md`) へ戻り要件再確認
