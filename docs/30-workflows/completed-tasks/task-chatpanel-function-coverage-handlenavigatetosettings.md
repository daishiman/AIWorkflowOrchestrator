# UT-CHATPANEL-COV-001 ChatPanel handleNavigateToSettings テスト追加

## メタ情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | UT-CHATPANEL-COV-001                          |
| タスク名     | ChatPanel handleNavigateToSettings テスト追加 |
| 分類         | テスト補完                                    |
| 対象機能     | ChatPanel.tsx                                 |
| 優先度       | 低                                            |
| 見積もり規模 | 小規模                                        |
| ステータス   | 未実施                                        |
| 発見元       | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 Phase 7   |
| 発見日       | 2026-03-18                                    |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ChatPanel.tsx の Function Coverage が 50% であり、`handleNavigateToSettings`（L129-132）がテストでカバーされていない。

### 1.2 問題点・課題

Function Coverage 基準 80% を満たしていない。Settings 画面遷移のハンドラが未テストのため、リグレッションリスクがある。

### 1.3 放置した場合の影響

Settings 遷移ロジックの変更時にリグレッションを検出できない。

## 2. 何を達成するか（What）

### 2.1 目的

`handleNavigateToSettings` を呼び出すテストケースを追加し、Function Coverage を 80% 以上にする。

### 2.2 受入基準

- [ ] handleNavigateToSettings を直接テストするテストケースが存在する
- [ ] ChatPanel.tsx の Function Coverage が 80% 以上
- [ ] 既存テスト 139 件が全て PASS

## 3.5 実装課題と解決策（親タスクからの教訓）

### 全タスク共通の教訓

| 課題                                        | 発見経緯                                                                                                                            | 解決策                                                     | 教訓                                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| streaming disabled/canSubmit の二重制御混乱 | Phase 6 テスト EC-06 で canSubmit=false 時も disabled=false となる条件式 `disabled={!canSubmit && !isStreaming}` が直感的でなく混乱 | 各制御の設計意図を JSDoc に明記する                        | 状態から派生する UI 制御が複数ある場合、各制御の設計意図をコンポーネント上で明示する |
| P62 DEFAULT_CONFIG fallback 禁止の UX 影響  | Phase 5 で Provider/Model 未選択時に blocked 状態遷移を実装した際、初回起動 UX に影響                                               | ErrorGuidance → Settings 誘導 CTA を blocked 状態で表示    | fallback 禁止は安全性向上だが UX への影響を設計段階で明示的に評価する                |
| 8状態×4 capability の組み合わせ爆発         | Phase 4 テスト設計で 32 通りの組み合わせのうち有効な組み合わせが限定的                                                              | 有効組み合わせマトリクスを Phase 2 で定義し Phase 4 で活用 | 状態機械設計時に有効組み合わせマトリクスを明示的に定義する                           |
| Phase 9 tsc エラーの発見遅延                | Phase 9 で providerId 型不一致と onSend prop 不存在エラーを発見。Phase 5 で検出可能だった                                           | Phase 5 完了条件に `tsc --noEmit PASS` を必須化            | 設計タスクでもスタブの型整合性を Phase 5 で確認する                                  |

### COV-001 固有の教訓

- blocked 状態での Settings 誘導 CTA のテスト設計が複雑。`handleNavigateToSettings` が `setActiveView('settings')` を呼ぶだけだが、chatPanelStatus が `blocked` の時のみ ErrorGuidance が表示されるため、テスト前提条件の設定が重要

### 参照

- `outputs/phase-12/skill-feedback-report.md`（TL-1〜TL-3, WF-3）
- `.claude/rules/06-known-pitfalls.md`（P62）
- `outputs/phase-2/state-machine.md`（8状態遷移図）

## 3. どのように実施するか（How）

### 3.1 対象ファイル

- `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`（L129-132）
- `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.settings-sync.test.tsx`（追加先候補）

### 3.2 実装方針

1. ErrorGuidance の Settings 遷移 CTA クリック時に `handleNavigateToSettings` が呼ばれるシナリオをテスト
2. `setActiveView('settings')` が呼ばれることを検証

## 4. 参照

- Phase 7 カバレッジレポート: `outputs/phase-7/coverage-report.md`
