# Phase 8 成果物: テスト責務境界マップ

## SkillLifecyclePanel テストファイル責務境界

| ファイル                                       | 主な責務                                           | 廃止済み API | 現行 API                                                       |
| ---------------------------------------------- | -------------------------------------------------- | ------------ | -------------------------------------------------------------- |
| `SkillLifecyclePanel.llm-generation.test.tsx`  | LLM生成フロー（createSkill/executePlan）の動作確認 | なし         | createSkill / executePlan / fetchSkills / clearGenerationState |
| `SkillLifecyclePanel.test.tsx`                 | 基本コンポーネント動作・表示の確認                 | なし         | 基本表示系                                                     |
| `SkillLifecyclePanel.auth-regression.test.tsx` | 認証リグレッション確認                             | なし         | 認証系 API                                                     |

## llm-generation.test.tsx のアクティブ describe 分類

| ID         | 責務カテゴリ                 | 内容                                           |
| ---------- | ---------------------------- | ---------------------------------------------- |
| U-3        | UI ガード                    | isGenerating による実行ボタン無効化            |
| U-5        | 表示確認                     | plan 結果表示（integrated_api）                |
| U-7        | エラー表示                   | generationError メッセージ表示                 |
| U-8        | IPC 呼び出し                 | handleExecutePlan → executePlan IPC            |
| U-NEW-1〜6 | フェッチフロー               | fetchSkills 失敗・成功パスの分岐確認           |
| U-9        | キャンセル                   | clearGenerationState 呼び出し                  |
| U-13       | terminal_handoff             | 早期リターン・disclosure summary 表示          |
| U-13b/c    | ワークフロースナップショット | provenance summary・ユーザー入力送信           |
| TASK-RT-05 | multi_select                 | checkbox 選択・送信・バリデーション            |
| U-14/15    | エラー伝播                   | executePlan 失敗・空データ時のエラーメッセージ |
| U-16〜20   | verify detail                | 検証詳細取得・表示・再検証・改善               |
| U-20b      | スナップショット管理         | cancel 後に approved spec がリセットされる     |

## 廃止済み API テスト境界の確定

`planSkill` / `detectMode` に依存する describe.skip 群（U-1/U-2/U-4/U-6/U-8b/U-10/U-11/U-12/U-18b/U-19b/U-21）は
`SkillLifecyclePanel.tsx` 本体からも削除済みのため、テスト境界から完全に除外。

→ 現行の `llm-generation.test.tsx` はすべて現行 API の動作確認に特化した状態になっている。
