# UT-CHATPANEL-COV-002 chatSlice streaming系アクション直接テスト追加

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | UT-CHATPANEL-COV-002                           |
| タスク名     | chatSlice streaming系アクション直接テスト追加  |
| 分類         | テスト補完                                     |
| 対象機能     | chatSlice.ts                                   |
| 優先度       | 中                                             |
| 見積もり規模 | 中規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 Phase 7/10 |
| 発見日       | 2026-03-18                                     |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

chatSlice.ts の Lines Coverage が 60.49% であり、品質基準 80% を下回っている。streaming 系アクション（startStreaming, appendStreamChunk, endStreaming 等、L249-363, L366-376）が直接テストでカバーされていない。

### 1.2 問題点・課題

streaming 系アクションは ChatPanel のリアルチャット機能の中核ロジックであり、テスト不足はリグレッションリスクが高い。

### 1.3 放置した場合の影響

streaming ロジック変更時にリグレッションを検出できない。Lines Coverage が基準未達のまま残る。

## 2. 何を達成するか（What）

### 2.1 目的

chatSlice.ts の streaming 系アクションに対する直接テストを追加し、Lines Coverage を 80% 以上にする。

### 2.2 受入基準

- [ ] startStreaming アクションの直接テストが存在する
- [ ] appendStreamChunk アクションの直接テストが存在する
- [ ] endStreaming アクションの直接テストが存在する
- [ ] cancelStreaming アクションの直接テストが存在する
- [ ] chatSlice.ts の Lines Coverage が 80% 以上
- [ ] 既存テスト 46 件が全て PASS

## 3.5 実装課題と解決策（親タスクからの教訓）

### 全タスク共通の教訓

| 課題                                        | 発見経緯                                                                                                                            | 解決策                                                     | 教訓                                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| streaming disabled/canSubmit の二重制御混乱 | Phase 6 テスト EC-06 で canSubmit=false 時も disabled=false となる条件式 `disabled={!canSubmit && !isStreaming}` が直感的でなく混乱 | 各制御の設計意図を JSDoc に明記する                        | 状態から派生する UI 制御が複数ある場合、各制御の設計意図をコンポーネント上で明示する |
| P62 DEFAULT_CONFIG fallback 禁止の UX 影響  | Phase 5 で Provider/Model 未選択時に blocked 状態遷移を実装した際、初回起動 UX に影響                                               | ErrorGuidance → Settings 誘導 CTA を blocked 状態で表示    | fallback 禁止は安全性向上だが UX への影響を設計段階で明示的に評価する                |
| 8状態×4 capability の組み合わせ爆発         | Phase 4 テスト設計で 32 通りの組み合わせのうち有効な組み合わせが限定的                                                              | 有効組み合わせマトリクスを Phase 2 で定義し Phase 4 で活用 | 状態機械設計時に有効組み合わせマトリクスを明示的に定義する                           |
| Phase 9 tsc エラーの発見遅延                | Phase 9 で providerId 型不一致と onSend prop 不存在エラーを発見。Phase 5 で検出可能だった                                           | Phase 5 完了条件に `tsc --noEmit PASS` を必須化            | 設計タスクでもスタブの型整合性を Phase 5 で確認する                                  |

### COV-002 固有の教訓

- streaming 系アクション（startStreaming, appendStreamChunk, endStreaming, cancelStreaming）の状態遷移パターンが複雑。TL-1（disabled/canSubmit 二重制御）を理解してからテスト設計しないと、期待値の設定を誤る可能性がある
- P48（useShallow）準拠で派生セレクタを使用している場合、テストで状態更新の伝播を正しく検証する必要がある

### 参照

- `outputs/phase-12/skill-feedback-report.md`（TL-1〜TL-3, WF-3）
- `.claude/rules/06-known-pitfalls.md`（P31, P48）
- `outputs/phase-2/state-machine.md`（8状態遷移図）

## 3. どのように実施するか（How）

### 3.1 対象ファイル

- `apps/desktop/src/renderer/store/slices/chatSlice.ts`（L249-376）
- `apps/desktop/src/renderer/store/slices/__tests__/chatSlice.test.ts`（追加先）

### 3.2 実装方針

1. 各 streaming アクションの状態遷移を直接テスト
2. 正常系: idle -> streaming -> completed の遷移
3. 異常系: streaming 中のエラー、キャンセル
4. 境界値: 空チャンク、連続チャンク

## 4. 参照

- Phase 7 カバレッジレポート: `outputs/phase-7/coverage-report.md`
- Phase 10 MINOR-2: `outputs/phase-10/final-review-report.md`
