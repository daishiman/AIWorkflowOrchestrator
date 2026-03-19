# UT-CHATPANEL-REFACTOR-002 旧 callLLMAPI パス廃止計画

## メタ情報

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | UT-CHATPANEL-REFACTOR-002                                                   |
| タスク名     | 旧 callLLMAPI パス廃止計画                                                  |
| 分類         | リファクタリング                                                            |
| 対象機能     | chatSlice 旧 LLM 呼び出しパス                                               |
| 優先度       | 中                                                                          |
| 見積もり規模 | 中規模                                                                      |
| ステータス   | 未実施                                                                      |
| 発見元       | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 エレガンスレビュー NOTE-3（2026-03-18） |
| 発見日       | 2026-03-18                                                                  |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

chatSlice には旧 `callLLMAPI` パス（非ストリーミング）が残存している。新しい real chat 配線では `useStreamingChat` → IPC streaming を経由するため、旧パスは不要だが、まだ参照が残っている可能性がある。

### 1.2 問題点・課題

- 旧パスと新パスが共存し、どちらが正しい経路か判断しにくい
- 旧パスを経由すると非ストリーミングの UX になり、設計意図と異なる
- コードの複雑性が増し、保守コストが上がる

### 1.3 放置した場合の影響

新しい開発者が旧パスを使用してしまうリスクがある。二重経路の保守コストが継続する。

## 2. 何を達成するか（What）

### 2.1 目的

旧 `callLLMAPI` パスの全参照箇所を特定し、新しい streaming パスへの移行計画を策定・実行する。

### 2.2 受入基準

- [ ] `grep -rn "callLLMAPI" apps/desktop/src/` で旧パス参照箇所が 0 件
- [ ] chatSlice から callLLMAPI 関連のコードが削除されている
- [ ] 関連するテストが新パス経由に更新されている
- [ ] 既存テスト 185 件が全て PASS
- [ ] `tsc --noEmit` PASS

## 3. どのように実施するか（How）

### 3.1 前提条件

- UT-CHATPANEL-STUB-001（スタブ本格実装）が完了していること
- useStreamingChat が全 ChatPanel 経路で使用されていること

### 3.2 対象ファイル

- `apps/desktop/src/renderer/store/slices/chatSlice.ts`（callLLMAPI 削除）
- chatSlice の callLLMAPI を参照する全ファイル（grep で特定）

### 3.3 実装手順

1. `grep -rn "callLLMAPI" apps/desktop/src/` で全参照箇所を特定
2. 各参照箇所を useStreamingChat 経由に書き換え
3. chatSlice から callLLMAPI アクションとその関連状態を削除
4. 関連テストを更新
5. `tsc --noEmit` と全テスト実行で回帰確認

## 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                        | 発見経緯                                          | 解決策                           | 教訓                                                        |
| ------------------------------------------- | ------------------------------------------------- | -------------------------------- | ----------------------------------------------------------- |
| streaming disabled/canSubmit の二重制御混乱 | Phase 6 テスト EC-06 で混乱                       | 各制御の設計意図を JSDoc に明記  | UI 制御が複数ある場合、設計意図をコンポーネント上で明示する |
| Phase 9 tsc エラーの発見遅延                | Phase 5 で検出可能だった型エラーが Phase 9 で発見 | Phase 5 で `tsc --noEmit` 必須化 | 廃止作業後は必ず型チェックを実行し、残存参照を検出する      |

**固有の教訓**:

- 旧パス削除時に、Store のテストファイル全てに影響が波及する（P35: DI 追加時のテストモック大規模修正と同パターン）。影響範囲を事前に `grep -rn` で調査すること
- callLLMAPI を参照するコンポーネントが ChatPanel 以外にもある可能性がある。grep 結果を全てリストアップしてから作業に着手すること

## 4. 参照

- エレガンスレビュー NOTE-3: `outputs/verification-report.md`
- chatSlice 拡張: `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`
- P35: `.claude/rules/06-known-pitfalls.md`（DI テストモック大規模修正）
