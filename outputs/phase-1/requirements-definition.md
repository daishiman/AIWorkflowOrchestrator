# Phase 1: 要件定義書

## タスクID: TASK-SW-FIX-FEEDBACK-001

## 機能要件 (FR)

| 要件ID | 問題番号 | 要件内容                                                                        |
| ------ | -------- | ------------------------------------------------------------------------------- |
| FR-001 | 問題6/8  | LLMモード（handleExecutePlan）成功時にスキル一覧をリフレッシュする              |
| FR-002 | 問題14   | skillPath === null のままStep 3到達時にエラーメッセージを表示する               |
| FR-003 | 問題20   | skillPath === null の場合「✓ スキルの骨格を生成しました」ヘッダーを非表示にする |
| FR-004 | 問題14   | skillPath === null の場合「もう一度試す」ボタンでリトライ誘導する               |

## 非機能要件 (NFR)

| 要件ID  | 要件内容                                   |
| ------- | ------------------------------------------ |
| NFR-001 | templateモードの既存動作を破壊しない       |
| NFR-002 | fetchSkills失敗時もステップ遷移を妨げない  |
| NFR-003 | コミット・PR作成はユーザー指示あるまで禁止 |

## 調査結果

### fetchSkillsの現状

- `useFetchSkills` フックが `../../store` から提供済み (`store/index.ts:664`)
- `createSkill` (agentSlice.ts:1125) は内部で `get().fetchSkills()` を自動実行
- templateモードは `createSkill` 経由のため自動リフレッシュ済み
- LLMモードは `api.executePlan()` 直接呼び出しのため fetchSkills が欠落

### skillPath state の現状

- `SkillCreateWizard.tsx`: `useState<string | null>(null)` で初期値 null
- `handleGenerate` (template): `if (!path)` で空文字・null をガード
- `handleExecutePlan` (LLM): `persistedSkillPath` が取得できない場合 null のまま遷移
- `CompleteStep.tsx`: `skillPath` は `string | null | undefined` 型、null 時のエラー表示なし
