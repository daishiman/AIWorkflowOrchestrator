# UT-CHATPANEL-REFACTOR-001 パルスカーソル表示ロジック共通化

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | UT-CHATPANEL-REFACTOR-001                            |
| タスク名     | パルスカーソル表示ロジック共通化                     |
| 分類         | リファクタリング                                     |
| 対象機能     | SkillStreamingView / StreamingMessage                |
| 優先度       | 低                                                   |
| 見積もり規模 | 小規模                                               |
| ステータス   | 未実施                                               |
| 発見元       | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 Phase 8 Task 8-3 |
| 発見日       | 2026-03-18                                           |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

SkillStreamingView（スキル実行のストリーミング表示）と StreamingMessage（LLM チャットのストリーミング表示）の両方にパルスカーソル表示ロジックが存在する。

### 1.2 問題点・課題

同一の視覚パターン（パルスカーソル）が 2 箇所に重複実装されており、デザイントークン変更時に 2 箇所の修正が必要。

### 1.3 放置した場合の影響

パルスカーソルのアニメーション・スタイル変更時に修正漏れが発生するリスクがある。

## 2. 何を達成するか（What）

### 2.1 目的

パルスカーソル表示ロジックを共通コンポーネント（PulseCursor atom）として抽出し、両コンポーネントから参照する。

### 2.2 受入基準

- [ ] PulseCursor atom コンポーネントが作成されている
- [ ] SkillStreamingView が PulseCursor を使用している
- [ ] StreamingMessage が PulseCursor を使用している
- [ ] PulseCursor に専用テストが存在する
- [ ] 既存テストが全て PASS

## 3.5 実装課題と解決策（親タスクからの教訓）

親タスク TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 の実装で発見された共通教訓:

| 課題                                        | 発見経緯                                                                                                                            | 解決策                                                     | 教訓                                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| streaming disabled/canSubmit の二重制御混乱 | Phase 6 テスト EC-06 で canSubmit=false 時も disabled=false となる条件式 `disabled={!canSubmit && !isStreaming}` が直感的でなく混乱 | 各制御の設計意図を JSDoc に明記する                        | 状態から派生する UI 制御が複数ある場合、各制御の設計意図をコンポーネント上で明示する |
| P62 DEFAULT_CONFIG fallback 禁止の UX 影響  | Phase 5 で Provider/Model 未選択時に blocked 状態遷移を実装した際、初回起動 UX に影響                                               | ErrorGuidance → Settings 誘導 CTA を blocked 状態で表示    | fallback 禁止は安全性向上だが UX への影響を設計段階で明示的に評価する                |
| 8状態×4 capability の組み合わせ爆発         | Phase 4 テスト設計で 32 通りの組み合わせのうち有効な組み合わせが限定的                                                              | 有効組み合わせマトリクスを Phase 2 で定義し Phase 4 で活用 | 状態機械設計時に有効組み合わせマトリクスを明示的に定義する                           |
| Phase 9 tsc エラーの発見遅延                | Phase 9 で providerId 型不一致と onSend prop 不存在エラーを発見。Phase 5 で検出可能だった                                           | Phase 5 完了条件に `tsc --noEmit PASS` を必須化            | 設計タスクでもスタブの型整合性を Phase 5 で確認する                                  |

REFACTOR-001 固有の教訓:

- SkillStreamingView と StreamingMessage のパルスカーソル実装差異がある。共通化時に既存のアニメーション動作を壊さないよう、リファクタリング前に既存テストの回帰確認が重要
- Atomic Design で PulseCursor を atom として抽出する際、既存の Tailwind CSS アニメーションクラスが異なる可能性がある

参照先:

- `outputs/phase-12/skill-feedback-report.md`（TL-1〜TL-3, WF-3）
- `.claude/rules/06-known-pitfalls.md`（P31, P39, P44, P48, P60, P62）
- `outputs/phase-2/state-machine.md`（8状態遷移図）
- `outputs/phase-2/component-hierarchy.md`（12コンポーネント階層）

## 3. 参照

- Phase 8 リファクタリング: `outputs/phase-8/refactor-plan.md` Task 8-3
