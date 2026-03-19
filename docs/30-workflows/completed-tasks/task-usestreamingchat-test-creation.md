# UT-CHATPANEL-COV-003 useStreamingChat 専用テストファイル作成

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | UT-CHATPANEL-COV-003                        |
| タスク名     | useStreamingChat 専用テストファイル作成     |
| 分類         | テスト補完                                  |
| 対象機能     | useStreamingChat.ts                         |
| 優先度       | 高                                          |
| 見積もり規模 | 中規模                                      |
| ステータス   | 未実施                                      |
| 発見元       | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 Phase 7 |
| 発見日       | 2026-03-18                                  |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

useStreamingChat.ts は ChatPanel のリアルチャット機能の IPC 統合フックであり、Coverage が 0% である。専用テストファイルが未作成。

### 1.2 問題点・課題

IPC 統合フックのテスト不在は、Preload/Main 間の契約変更時にリグレッションを検出できないリスクが高い。

### 1.3 放置した場合の影響

IPC チャンネルやレスポンス形式の変更時にリグレッションを検出できない。P44/P60 パターンの再発リスクがある。

## 2. 何を達成するか（What）

### 2.1 目的

useStreamingChat.ts の専用テストファイルを作成し、IPC 統合の正常系・異常系をカバーする。

### 2.2 受入基準

- [ ] useStreamingChat.test.ts が作成されている
- [ ] startStream 正常系テストが存在する
- [ ] API 未存在時のフォールバックテストが存在する
- [ ] エラーレスポンスのハンドリングテストが存在する
- [ ] useStreamingChat.ts の Lines Coverage が 80% 以上
- [ ] P39 準拠: happy-dom 環境では fireEvent を使用

## 3.5 実装課題と解決策（親タスクからの教訓）

### 全タスク共通の教訓

| 課題                                        | 発見経緯                                                                                                                            | 解決策                                                     | 教訓                                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| streaming disabled/canSubmit の二重制御混乱 | Phase 6 テスト EC-06 で canSubmit=false 時も disabled=false となる条件式 `disabled={!canSubmit && !isStreaming}` が直感的でなく混乱 | 各制御の設計意図を JSDoc に明記する                        | 状態から派生する UI 制御が複数ある場合、各制御の設計意図をコンポーネント上で明示する |
| P62 DEFAULT_CONFIG fallback 禁止の UX 影響  | Phase 5 で Provider/Model 未選択時に blocked 状態遷移を実装した際、初回起動 UX に影響                                               | ErrorGuidance → Settings 誘導 CTA を blocked 状態で表示    | fallback 禁止は安全性向上だが UX への影響を設計段階で明示的に評価する                |
| 8状態×4 capability の組み合わせ爆発         | Phase 4 テスト設計で 32 通りの組み合わせのうち有効な組み合わせが限定的                                                              | 有効組み合わせマトリクスを Phase 2 で定義し Phase 4 で活用 | 状態機械設計時に有効組み合わせマトリクスを明示的に定義する                           |
| Phase 9 tsc エラーの発見遅延                | Phase 9 で providerId 型不一致と onSend prop 不存在エラーを発見。Phase 5 で検出可能だった                                           | Phase 5 完了条件に `tsc --noEmit PASS` を必須化            | 設計タスクでもスタブの型整合性を Phase 5 で確認する                                  |

### COV-003 固有の教訓

- useStreamingChat は IPC モック戦略が複雑。P44（IPC インターフェース不整合）と P60（IPC レスポンス wrapper 形式）の両方に準拠する必要がある
- `window.electronAPI` のモック化時に P48 準拠（Array.isArray で実行時型検証）を忘れやすい
- happy-dom 環境では P39 準拠で fireEvent のみ使用すること

### 参照

- `outputs/phase-12/skill-feedback-report.md`（TL-1〜TL-3, WF-3）
- `.claude/rules/06-known-pitfalls.md`（P39, P44, P48, P60）
- `outputs/phase-2/state-machine.md`（8状態遷移図）

## 3. どのように実施するか（How）

### 3.1 対象ファイル

- `apps/desktop/src/renderer/hooks/useStreamingChat.ts`
- `apps/desktop/src/renderer/hooks/__tests__/useStreamingChat.test.ts`（新規作成）

### 3.2 実装方針

1. `renderHook` で useStreamingChat をテスト
2. `window.electronAPI` のモック化（P48 準拠: `Array.isArray` で実行時検証）
3. IPC レスポンスの wrapper 形式（P60 準拠: `{ success, data?, error? }`）を正しくテスト
4. ストリーミングイベントリスナーの登録・解除テスト

## 4. 参照

- Phase 7 カバレッジレポート: `outputs/phase-7/coverage-report.md`
- P39: happy-dom 環境での fireEvent 使用
- P44/P60: IPC インターフェース不整合
