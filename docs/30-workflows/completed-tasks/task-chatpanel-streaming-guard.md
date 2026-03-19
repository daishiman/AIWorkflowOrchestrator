# UT-CHATPANEL-GUARD-001 handleSendMessage ストリーミング中ガード追加

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | UT-CHATPANEL-GUARD-001                               |
| タスク名     | handleSendMessage ストリーミング中ガード追加         |
| 分類         | バグ修正                                             |
| 対象機能     | ChatPanel.tsx                                        |
| 優先度       | 低                                                   |
| 見積もり規模 | 小規模                                               |
| ステータス   | 未実施                                               |
| 発見元       | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 Phase 10 MINOR-1 |
| 発見日       | 2026-03-18                                           |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ChatPanel.tsx の `handleSendMessage`（L115-126）内に `canSubmit` ガード（streaming 中の送信抑止）が存在しない。ComposerArea の disabled 制御が主な防御だが、直接呼び出し経路でのガードがない。

### 1.2 問題点・課題

streaming 中に何らかの経路で `handleSendMessage` が直接呼び出された場合、二重リクエストが発生する可能性がある。

### 1.3 放置した場合の影響

UX レベルの問題。二重リクエストにより予期しないレスポンスが返る可能性がある。

## 2. 何を達成するか（What）

### 2.1 目的

`handleSendMessage` の先頭に `isStreaming` チェックを追加し、streaming 中の送信を早期リターンで抑止する。

### 2.2 受入基準

- [ ] handleSendMessage 内に isStreaming ガードが存在する
- [ ] streaming 中に handleSendMessage が呼ばれても送信されないテストが存在する
- [ ] 既存テスト 139 件が全て PASS

## 3. どのように実施するか（How）

### 3.1 対象ファイル

- `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`（L115-126）
- `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.chat-wiring.test.tsx`（テスト追加先）

### 3.2 実装方針

```typescript
const handleSendMessage = useCallback(() => {
  if (isStreaming) return; // ガード追加
  const trimmed = chatInput.trim();
  if (!trimmed) return;
  // ...
}, [isStreaming, chatInput, ...]);
```

## 3.5 実装課題と解決策（親タスクからの教訓）

親タスク TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 の実装で発見された共通教訓:

| 課題                                        | 発見経緯                                                                                                                            | 解決策                                                     | 教訓                                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| streaming disabled/canSubmit の二重制御混乱 | Phase 6 テスト EC-06 で canSubmit=false 時も disabled=false となる条件式 `disabled={!canSubmit && !isStreaming}` が直感的でなく混乱 | 各制御の設計意図を JSDoc に明記する                        | 状態から派生する UI 制御が複数ある場合、各制御の設計意図をコンポーネント上で明示する |
| P62 DEFAULT_CONFIG fallback 禁止の UX 影響  | Phase 5 で Provider/Model 未選択時に blocked 状態遷移を実装した際、初回起動 UX に影響                                               | ErrorGuidance → Settings 誘導 CTA を blocked 状態で表示    | fallback 禁止は安全性向上だが UX への影響を設計段階で明示的に評価する                |
| 8状態×4 capability の組み合わせ爆発         | Phase 4 テスト設計で 32 通りの組み合わせのうち有効な組み合わせが限定的                                                              | 有効組み合わせマトリクスを Phase 2 で定義し Phase 4 で活用 | 状態機械設計時に有効組み合わせマトリクスを明示的に定義する                           |
| Phase 9 tsc エラーの発見遅延                | Phase 9 で providerId 型不一致と onSend prop 不存在エラーを発見。Phase 5 で検出可能だった                                           | Phase 5 完了条件に `tsc --noEmit PASS` を必須化            | 設計タスクでもスタブの型整合性を Phase 5 で確認する                                  |

GUARD-001 固有の教訓:

- TL-1（disabled/canSubmit 二重制御）を理解してから実装すること。`isStreaming` チェック追加時に `canSubmit` との関係を整理する
- ComposerArea の `disabled={!canSubmit && !isStreaming}` は streaming 中のキャンセル操作を許可するための意図的な設計。`handleSendMessage` のガードはこの UI 制御とは別レイヤーの防御

参照先:

- `outputs/phase-12/skill-feedback-report.md`（TL-1〜TL-3, WF-3）
- `.claude/rules/06-known-pitfalls.md`（P31, P39, P44, P48, P60, P62）
- `outputs/phase-2/state-machine.md`（8状態遷移図）
- `outputs/phase-2/component-hierarchy.md`（12コンポーネント階層）

## 4. 参照

- Phase 10 MINOR-1: `outputs/phase-10/final-review-report.md`
