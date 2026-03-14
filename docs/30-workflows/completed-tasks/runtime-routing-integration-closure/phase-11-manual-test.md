# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 11                                                         |
| Phase名    | 手動テスト                                                 |
| タスクID   | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 |
| 前提Phase  | Phase 10（最終レビュー）                                   |
| 後続Phase  | Phase 12（ドキュメント更新）                               |
| ステータス | completed                                                  |
| 作成日     | 2026-03-14                                                 |
| 機能名     | runtime-routing-integration-closure                        |

## 目的

自動テストでは検証できないユーザー体験・UI/UX・実環境動作を手動で確認し、TerminalHandoffCard の表示品質と authMode 分岐による runtime routing の E2E 動作を検証する。

## 実行タスク

- 機能テスト: authMode 分岐の手動検証（subscription → handoff、api-key → integrated）
- UI/UX テスト: TerminalHandoffCard のレイアウト、コピーボタン、閉じるボタン、Apple HIG 準拠確認
- 統合テスト: Skill 実行 → runtime routing → handoff/integrated 分岐 → UI 表示 の E2E 手動確認
- リグレッションテスト: 既存の chat-edit runtime routing が引き続き動作すること

## 参照資料

| 参照資料                   | パス                                                                           | 内容                         |
| -------------------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| Phase 2 設計サマリー       | `outputs/phase-2/design-summary.md`                                            | runtime 分岐設計の意図       |
| Phase 5 実装サマリー       | `outputs/phase-5/implementation-summary.md`                                    | 実装対象ファイルと変更点     |
| Phase 6 テスト拡充サマリー | `outputs/phase-6/test-expansion-summary.md`                                    | 異常系テストの観点           |
| Phase 7 カバレッジ結果     | `outputs/phase-7/coverage-report.md`                                           | カバレッジ達成の証跡         |
| Phase 8 リファクタリング   | `outputs/phase-8/refactoring-summary.md`                                       | コード品質改善のサマリー     |
| Phase 9 品質検証結果       | `outputs/phase-9/quality-report.md`                                            | Lint・型チェック・テスト結果 |
| Phase 10 最終レビュー結果  | `outputs/phase-10/final-review-result.md`                                      | 最終レビュー判定と指摘事項   |
| interfaces-agent-sdk-ui    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md` | UI / Hook 正本               |
| ui-ux-agent-execution      | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`   | UI 契約                      |

## 実行手順

### ステップ1: テスト環境を準備する

1. アプリケーションを起動する: `pnpm --filter @repo/desktop dev`
2. subscription モード用の設定（API Key 未設定）を確認する
3. api-key モード用の設定（有効な API Key 設定済み）を準備する
4. DevTools を開き、コンソールエラーがないことを確認する
5. light モード / dark モードの切り替えが可能な状態であることを確認する

### ステップ2: 機能テストを実行する（TC-01 〜 TC-03）

各テストケースで以下を実施する:

1. authMode を指定のモードに切り替える
2. 操作手順を実行する
3. 期待結果と実際の結果を比較する
4. 結果を `outputs/phase-11/manual-test-result.md` に記録する

### ステップ3: UI/UX テストを実行する（TC-04 〜 TC-07）

1. TC-04: TerminalHandoffCard のレイアウトを確認する
   - 角丸が 8-12px 範囲であることを目視確認する
   - コマンド文字列が monospace フォントで表示されていることを確認する
   - 8px グリッドに沿ったスペーシングであることを確認する
   - カードの影が `0 1px 3px rgba(0,0,0,0.04)` 相当の繊細な表現であることを確認する
2. TC-05: コピーボタンのフィードバックを確認する
   - クリック後に「コピーしました」等の視覚フィードバックが表示されることを確認する
   - クリップボードに正確なコマンド文字列がコピーされることを確認する（テキストエディタに貼り付けて検証）
3. TC-06: 閉じるボタンの動作を確認する
   - クリック後にカードが非表示になることを確認する
   - 閉じた後の画面レイアウトが崩れないことを確認する
4. TC-07: ダークモードでの表示を確認する
   - ダークモードに切り替えて TC-01 を実行する
   - テキストと背景のコントラスト比が 4.5:1 以上であることを DevTools の Accessibility タブで確認する

### ステップ4: 統合テストを実行する（TC-08 〜 TC-09）

1. TC-08: chat-edit の既存動作を確認する
   - chat-edit 画面で runtime routing を実行する
   - 既存の動作（Phase 10 以前と同一の結果）が維持されることを確認する
2. TC-09: api-key モードでの既存 Skill 実行を確認する
   - api-key モードで既存のスキルを実行する
   - 実行結果が Phase 10 以前と同一であることを確認する

### ステップ5: スクリーンショットを撮影する

P53 対策として、以下のいずれかの方法でスクリーンショットを取得する:

- Playwright の `page.screenshot()` を使用する
- Electron の `webContents.capturePage()` を使用する

撮影対象（必須）:

1. TerminalHandoffCard のデフォルト表示（light モード）
2. TerminalHandoffCard のデフォルト表示（dark モード）
3. コピーボタン押下後のフィードバック表示
4. 長文コマンドテキストの表示（折り返し / スクロール動作）

撮影したスクリーンショットを `outputs/phase-11/screenshots/` に保存する。

### ステップ6: 発見した問題を記録する

`outputs/phase-11/discovered-issues.md` に以下の形式で記録する:

| No  | テストケース | 問題内容 | 重大度（Critical/Major/Minor） | 対応方針 |
| --- | ------------ | -------- | ------------------------------ | -------- |

### ステップ7: screenshot-coverage.md を作成する

撮影したスクリーンショットのカバレッジマトリクスを記録する。

## 統合テスト連携

手動テストで確認する統合ポイント:

- SkillExecutor / AgentExecutor の authMode 分岐が実環境で正しく動作すること
- RuntimeResolver が subscription / api-key を正しく判定し、handoff / integrated を返すこと
- TerminalHandoffCard が IPC 経由の handoff guidance データを正しく表示すること
- 既存の chat-edit runtime routing が本タスクの変更で破壊されていないこと

## テストケース

| No    | カテゴリ       | テスト項目             | 操作手順                           | 期待結果                                        |
| ----- | -------------- | ---------------------- | ---------------------------------- | ----------------------------------------------- |
| TC-01 | 機能           | Skill handoff 分岐     | subscription モードで Skill 実行   | TerminalHandoffCard が表示される                |
| TC-02 | 機能           | Skill integrated 分岐  | api-key モードで Skill 実行        | 通常の実行フローで完了する                      |
| TC-03 | 機能           | Agent handoff 分岐     | subscription モードで Agent 実行   | TerminalHandoffCard が表示される                |
| TC-04 | UI/UX          | HandoffCard レイアウト | TC-01 実行後に表示確認             | 角丸 8-12px、繊細なシャドウ、monospace コマンド |
| TC-05 | UI/UX          | コピーボタン           | HandoffCard のコピーボタンクリック | クリップボードにコマンドがコピーされる          |
| TC-06 | UI/UX          | 閉じるボタン           | HandoffCard の閉じるボタンクリック | カードが非表示になる                            |
| TC-07 | UI/UX          | ダークモード           | TC-01 をダークモードで実行         | コントラスト比 4.5:1 以上                       |
| TC-08 | 統合           | chat-edit 既存動作     | chat-edit で runtime routing 実行  | 既存動作が維持される                            |
| TC-09 | リグレッション | 既存 Skill 実行        | api-key モードで既存 Skill を実行  | 既存の結果が変わらない                          |

## 画面カバレッジマトリクス

| TC-ID | 画面要素                  | 証跡                                                                 | 備考                         |
| ----- | ------------------------- | -------------------------------------------------------------------- | ---------------------------- |
| TC-01 | Skill handoff（light）    | `outputs/phase-11/screenshots/TC-01-skill-handoff-light.png`         | subscription の handoff 表示 |
| TC-02 | Skill integrated（light） | `outputs/phase-11/screenshots/TC-02-skill-integrated-light.png`      | api-key の integrated 実行   |
| TC-03 | Agent handoff（light）    | `outputs/phase-11/screenshots/TC-03-agent-handoff-light.png`         | agent:start の handoff 表示  |
| TC-04 | HandoffCard レイアウト    | `outputs/phase-11/screenshots/TC-04-handoff-layout-long-command.png` | 長文 command の可読性        |
| TC-05 | Copy feedback             | `outputs/phase-11/screenshots/TC-05-copy-feedback.png`               | copy 成功トースト            |
| TC-06 | Dismiss 動作              | `outputs/phase-11/screenshots/TC-06-dismiss-handoff.png`             | card 非表示                  |
| TC-07 | Skill handoff（dark）     | `outputs/phase-11/screenshots/TC-07-skill-handoff-dark.png`          | dark モード表示              |
| TC-08 | chat-edit 回帰            | `outputs/phase-11/screenshots/TC-08-chat-edit-regression.png`        | 既存 runtime routing 維持    |
| TC-09 | api-key 実行回帰          | `outputs/phase-11/screenshots/TC-09-skill-regression-apikey.png`     | 既存 skill 実行維持          |

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                           | 仕様参照先                                                  |
| ---------------- | ---------------------------------- | ----------------------------------------------------------- |
| UI/UX            | 該当（TerminalHandoffCard 新規）   | `aiworkflow-requirements: ui-ux-agent-execution.md`         |
| アクセシビリティ | 該当（コントラスト比 4.5:1 以上）  | WCAG 2.1 AA / Apple HIG                                     |
| セキュリティ     | 該当（API Key が UI に漏洩しない） | `aiworkflow-requirements: security-skill-execution.md`      |
| リグレッション   | 該当（chat-edit 既存動作維持）     | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |

## 成果物

| 成果物                       | パス                                      | 内容                                      |
| ---------------------------- | ----------------------------------------- | ----------------------------------------- |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`  | 全テストケースの実行結果と PASS/FAIL 記録 |
| 発見した問題                 | `outputs/phase-11/discovered-issues.md`   | テスト中に発見した問題と対応方針          |
| スクリーンショット           | `outputs/phase-11/screenshots/`           | 撮影した全スクリーンショット              |
| スクリーンショット計画       | `outputs/phase-11/screenshot-plan.md`     | 撮影対象と撮影方法の計画                  |
| スクリーンショットカバレッジ | `outputs/phase-11/screenshot-coverage.md` | 撮影した画面のカバレッジマトリクス        |

## 完了条件

- [x] TC-01 〜 TC-09 の全テストケースを実行し、PASS/FAIL を記録している
- [x] TerminalHandoffCard の light / dark 両モードのスクリーンショットを撮影している
- [x] コピー成功フィードバックのスクリーンショットを撮影している
- [x] 発見した問題を `outputs/phase-11/discovered-issues.md` に記録している（0件の場合も「問題なし」と記録する）
- [x] Critical / Major 問題がある場合、Phase 10 レビュー判定に従い該当 Phase に差し戻している
- [x] Minor 問題がある場合、未タスク仕様書に変換して `unassigned-task/` に配置している
- [x] chat-edit の既存 runtime routing が動作維持されていることを確認している（TC-08）
- [x] `outputs/phase-11/screenshot-coverage.md` でカバレッジマトリクスを作成している
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 12（ドキュメント更新）](./phase-12-documentation.md) に進む
