# Phase 11: 手動テスト計画

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase    | 11                                             |
| 作成日   | 2026-03-24                                     |
| 前提     | Phase 10 Gate Decision: PASS                   |

## Walkthrough シナリオ

### WT-1: App Shell - ナビゲーション遷移

| 項目     | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| 目的     | GlobalNavStrip の nav item クリックで `executionConsole` に遷移できることを確認 |
| 前提条件 | アプリが起動し、ダッシュボードが表示されている                                  |

**手順**:

1. GlobalNavStrip 内の「実行コンソール」nav item を確認する
2. nav item をクリックする
3. `ExecutionConsoleView` が描画されることを確認する
4. nav item のアイコンが `play-circle` であることを確認する
5. nav item の label が「実行コンソール」であることを確認する

**期待結果**:

- `ExecutionConsoleView` stub が表示される（「実行コンソール -- Task02/03 で内部コンポーネントを実装」）
- nav item の active 状態が視覚的に反映される

**検証ポイント**:

- [ ] nav item が「実行コンソール」ラベルで表示されている
- [ ] クリック後に `ExecutionConsoleView` が描画される
- [ ] active 状態のスタイルが適用される

---

### WT-2: App Shell - ExecutionConsoleLauncher

| 項目     | 内容                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------- |
| 目的     | AppLayout の ExecutionConsoleLauncher（旧 TerminalLauncher）が `openExecutionConsole()` を呼ぶことを確認 |
| 前提条件 | アプリが起動し、任意の画面が表示されている                                                               |

**手順**:

1. AppLayout 内の ExecutionConsoleLauncher ボタンを確認する
2. ボタンの label が「実行コンソール」系であることを確認する（「ターミナルを開く」でないこと）
3. ボタンをクリックする
4. `ExecutionConsoleView` に遷移することを確認する

**期待結果**:

- ボタンの aria-label が「ターミナルを開く」ではなく「実行コンソール」系になっている
- クリック後に `ExecutionConsoleView` が描画される

**検証ポイント**:

- [ ] ボタンの aria-label に「ターミナル」が含まれない
- [ ] クリック後に `ExecutionConsoleView` が描画される

---

### WT-3: Chat Surface - Handoff Block 遷移

| 項目     | 内容                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| 目的     | ChatPanel の handoff 状態で HandoffBlock の CTA が `openExecutionConsole()` を呼ぶことを確認 |
| 前提条件 | Chat surface で handoff 状態のメッセージが表示されている                                     |

**手順**:

1. Chat surface を開く
2. AI からの handoff ブロックが表示される状態にする
3. HandoffBlock 内のボタンを確認する
4. ボタンの label が「端末で続ける」であることを確認する（「ターミナルを開く」でないこと）
5. ボタンをクリックする
6. `ExecutionConsoleView` に遷移することを確認する

**期待結果**:

- HandoffBlock のボタン label が「端末で続ける」
- クリック後に `ExecutionConsoleView` に遷移

**検証ポイント**:

- [ ] HandoffBlock のボタンが「端末で続ける」と表示される
- [ ] 「ターミナルを開く」が表示されていない
- [ ] クリック後に `executionConsole` view に遷移する

---

### WT-4: Chat Surface - LLMGuidanceBanner 遷移

| 項目     | 内容                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| 目的     | プロバイダー/モデル未選択時の LLMGuidanceBanner の secondaryAction が `openExecutionConsole()` を呼ぶことを確認 |
| 前提条件 | LLM プロバイダーまたはモデルが未選択の状態                                                                      |

**手順**:

1. 設定画面で LLM プロバイダーを未選択にする
2. Chat surface を開く
3. LLMGuidanceBanner が表示されることを確認する
4. secondary CTA（「実行コンソールを開く」）をクリックする
5. `ExecutionConsoleView` に遷移することを確認する

**期待結果**:

- secondary CTA の label が「実行コンソールを開く」
- クリック後に `ExecutionConsoleView` に遷移

**検証ポイント**:

- [ ] secondary CTA が「実行コンソールを開く」と表示される
- [ ] 「ターミナルを開く」が表示されていない
- [ ] クリック後に `executionConsole` view に遷移する

---

### WT-5: Chat Surface - TerminalHandoffCard 遷移

| 項目     | 内容                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| 目的     | TerminalHandoffCard の「開く」CTA が `openExecutionConsole()` を呼ぶことを確認 |
| 前提条件 | terminal handoff 状態のカードが表示されている                                  |

**手順**:

1. terminal handoff カードが表示される状態にする
2. カード内の CTA ボタンを確認する
3. ボタンの label が「端末で続ける」であることを確認する（「terminal を開く」でないこと）
4. ボタンをクリックする
5. `ExecutionConsoleView` に遷移することを確認する

**期待結果**:

- CTA ボタンの label が「端末で続ける」
- クリック後に `ExecutionConsoleView` に遷移

**検証ポイント**:

- [ ] CTA ボタンが「端末で続ける」と表示される
- [ ] 「terminal を開く」が表示されていない
- [ ] クリック後に `executionConsole` view に遷移する

---

### WT-6: Workspace Surface - GuidanceBanner 遷移

| 項目     | 内容                                                                                      |
| -------- | ----------------------------------------------------------------------------------------- |
| 目的     | WorkspaceChatPanel の guidance secondary CTA が `openExecutionConsole()` を呼ぶことを確認 |
| 前提条件 | プロバイダー/モデル未選択の状態で Workspace surface を表示                                |

**手順**:

1. LLM プロバイダーを未選択にする
2. Workspace surface を開く
3. guidance banner の secondary CTA を確認する
4. CTA の label が「実行コンソールを開く」であることを確認する
5. CTA をクリックする
6. `ExecutionConsoleView` に遷移することを確認する

**期待結果**:

- secondary CTA が「実行コンソールを開く」
- クリック後に `ExecutionConsoleView` に遷移

**検証ポイント**:

- [ ] secondary CTA が「実行コンソールを開く」と表示される
- [ ] 「ターミナルを開く」が表示されていない
- [ ] クリック後に `executionConsole` view に遷移する

---

### WT-7: Skill Creator Surface（stub 確認）

| 項目     | 内容                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| 目的     | Skill Creator surface の CTA interface が定義されていることを確認（詳細は Task02/03 で実装） |
| 前提条件 | Skill Creator surface が表示されている                                                       |

**手順**:

1. Skill Creator surface を開く
2. 本タスクでの CTA 追加は interface のみのため、visual CTA は未配置
3. コード上で `openExecutionConsole` が import 可能であることを確認する

**期待結果**:

- Skill Creator surface に新規 CTA は未表示（Task02/03 で配置予定）
- `actions/executionConsole.ts` の `openExecutionConsole()` が import 可能

**検証ポイント**:

- [ ] 既存の Skill Creator 機能に回帰がない
- [ ] `openExecutionConsole` が export されている

---

### WT-8: Label 全面確認

| 項目     | 内容                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 目的     | front に「ターミナルを開く」「terminal を開く」が表示されないことを全面確認 |
| 前提条件 | Phase 5 実装が完了している                                                  |

**手順**:

1. 以下のコマンドを実行する:
   ```bash
   grep -rn "ターミナルを開く" apps/desktop/src/renderer/ --include="*.tsx" --include="*.ts" | grep -v ".test." | grep -v "__tests__"
   ```
2. 以下のコマンドを実行する:
   ```bash
   grep -rn "terminal を開く" apps/desktop/src/renderer/ --include="*.tsx" --include="*.ts" | grep -v ".test." | grep -v "__tests__"
   ```
3. 両方のコマンドで front 露出（非テスト）が 0 件であることを確認する

**期待結果**:

- 非テストファイルでの「ターミナルを開く」「terminal を開く」が 0 件

**検証ポイント**:

- [ ] `grep` 結果が 0 件（テストファイル除外後）
- [ ] `RuntimePolicyResolver.ts` 内の runbook 文字列は backend 用途のため front 露出ではない（除外対象）

---

### WT-9: Back 遷移

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| 目的     | `ExecutionConsoleView` から前の画面に戻れることを確認 |
| 前提条件 | 任意の画面から `ExecutionConsoleView` に遷移済み      |

**手順**:

1. ダッシュボードを表示する
2. 「実行コンソール」nav item をクリックして遷移する
3. ブラウザの戻るボタン、またはキーボードショートカット（Cmd+[）で前の画面に戻る
4. ダッシュボードが再表示されることを確認する

**期待結果**:

- `viewHistory` に基づいて直前の view（ダッシュボード）に戻る
- viewHistory が空の場合はダッシュボードに fallback する

**検証ポイント**:

- [ ] Cmd+[ で前の画面に戻れる
- [ ] 戻り先が直前の画面（ダッシュボード）である
- [ ] viewHistory が空の場合、ダッシュボードに fallback する

## P53 準拠: CLI 環境での代替検証手段

CLI 環境ではスクリーンショットの直接撮影が困難なため、以下の代替手段を使用する:

| 手段                        | 用途                                  | コマンド例                               |
| --------------------------- | ------------------------------------- | ---------------------------------------- |
| Playwright スクリプト       | 画面遷移 + スクリーンショット自動取得 | `npx playwright test --project=electron` |
| `webContents.capturePage()` | Electron 内蔵のページキャプチャ       | スクリプト化して実行                     |
| Vitest + Testing Library    | DOM 構造の間接検証                    | `pnpm --filter @repo/desktop vitest run` |
| `grep` 検証                 | label 文字列の全面確認                | WT-8 参照                                |

## テスト実行環境

| 項目           | 値                                     |
| -------------- | -------------------------------------- |
| 実行場所       | `apps/desktop/`                        |
| テストランナー | Vitest（自動テスト）+ 手動 walkthrough |
| ブラウザ環境   | happy-dom（Vitest） / Electron（手動） |
| テーマ         | Light / Dark 両方で確認                |
