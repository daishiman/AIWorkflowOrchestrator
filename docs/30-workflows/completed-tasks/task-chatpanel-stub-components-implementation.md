# UT-CHATPANEL-STUB-001 ChatPanel スタブコンポーネント本格実装

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | UT-CHATPANEL-STUB-001                       |
| タスク名     | ChatPanel スタブコンポーネント本格実装      |
| 分類         | 機能実装                                    |
| 対象機能     | ChatPanel 配下の 10 スタブコンポーネント    |
| 優先度       | 低                                          |
| 見積もり規模 | 大規模                                      |
| ステータス   | 未実施                                      |
| 発見元       | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 Phase 7 |
| 発見日       | 2026-03-18                                  |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 5 で 10 個のスタブコンポーネントが最小実装（TypeScript インターフェース + placeholder JSX）として作成された。Coverage は全て 0%。

### 1.2 問題点・課題

スタブ状態では UI/UX が不完全であり、ユーザー向けの機能として利用できない。

### 1.3 放置した場合の影響

ChatPanel のリアルチャット機能が UI 上でスタブ表示のまま残る。

## 2. 何を達成するか（What）

### 2.1 目的

10 個のスタブコンポーネントを Phase 2 設計に基づいて本格実装する。

### 2.2 対象コンポーネント

| コンポーネント             | 種別     | 行数 |
| -------------------------- | -------- | ---- |
| RuntimeBanner              | atom     | 31   |
| ChatMessage                | atom     | 17   |
| ChatMessageList            | molecule | 50   |
| ErrorGuidance              | molecule | 38   |
| HandoffBlock               | molecule | 30   |
| PersistentTerminalLauncher | atom     | 20   |
| ComposerInput              | atom     | 35   |
| SendButton                 | atom     | 25   |
| ComposerArea               | molecule | 60   |
| LLMSelectorPanel           | molecule | 24   |

### 2.3 受入基準

- [ ] 全 10 コンポーネントがスタブから本格実装に置換されている
- [ ] 各コンポーネントに専用テストファイルが存在する
- [ ] 各コンポーネントの Lines Coverage が 80% 以上
- [ ] Apple HIG 準拠のスタイリングが適用されている

## 3.5 実装課題と解決策（親タスクからの教訓）

親タスク TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 の実装で発見された共通教訓:

| 課題                                        | 発見経緯                                                                                                                            | 解決策                                                     | 教訓                                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| streaming disabled/canSubmit の二重制御混乱 | Phase 6 テスト EC-06 で canSubmit=false 時も disabled=false となる条件式 `disabled={!canSubmit && !isStreaming}` が直感的でなく混乱 | 各制御の設計意図を JSDoc に明記する                        | 状態から派生する UI 制御が複数ある場合、各制御の設計意図をコンポーネント上で明示する |
| P62 DEFAULT_CONFIG fallback 禁止の UX 影響  | Phase 5 で Provider/Model 未選択時に blocked 状態遷移を実装した際、初回起動 UX に影響                                               | ErrorGuidance → Settings 誘導 CTA を blocked 状態で表示    | fallback 禁止は安全性向上だが UX への影響を設計段階で明示的に評価する                |
| 8状態×4 capability の組み合わせ爆発         | Phase 4 テスト設計で 32 通りの組み合わせのうち有効な組み合わせが限定的                                                              | 有効組み合わせマトリクスを Phase 2 で定義し Phase 4 で活用 | 状態機械設計時に有効組み合わせマトリクスを明示的に定義する                           |
| Phase 9 tsc エラーの発見遅延                | Phase 9 で providerId 型不一致と onSend prop 不存在エラーを発見。Phase 5 で検出可能だった                                           | Phase 5 完了条件に `tsc --noEmit PASS` を必須化            | 設計タスクでもスタブの型整合性を Phase 5 で確認する                                  |

STUB-001 固有の教訓:

- 10 スタブコンポーネントの本格実装では、8 状態 × capability のレンダリング分岐が複雑。TL-3（組み合わせ爆発）から学び、有効な組み合わせマトリクスを参照してテストケースを設計すること
- 各スタブは Phase 2 の component-hierarchy.md と ui-ux-realization.md の設計に基づく。Apple HIG 準拠のスタイリング適用時は `01-architecture.md` のカラーパレットを参照
- Phase 5 完了時に `tsc --noEmit` を実行し型整合性を確認すること（WF-3 教訓）

参照先:

- `outputs/phase-12/skill-feedback-report.md`（TL-1〜TL-3, WF-3）
- `.claude/rules/06-known-pitfalls.md`（P31, P39, P44, P48, P60, P62）
- `outputs/phase-2/state-machine.md`（8状態遷移図）
- `outputs/phase-2/component-hierarchy.md`（12コンポーネント階層）

## 3. 参照

- Phase 2 設計: `outputs/phase-2/component-hierarchy.md`
- Phase 8 リファクタリング: `outputs/phase-8/refactor-plan.md`
