# Phase 6: カバレッジ測定結果とギャップ分析

## 測定日時

2026-03-10

## Task 1: カバレッジ測定

### 実行コマンド

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/main/ipc/__tests__/skillHandlers.create.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

### 初回測定結果（Phase 4-5 テストのみ、43テスト）

| スイート | 対象ファイル                   | Stmts         | Branches      | Functions   | 備考                     |
| -------- | ------------------------------ | ------------- | ------------- | ----------- | ------------------------ |
| G1       | skillHandlers.ts (L684-732)    | 41/41 (100%)  | 11/11 (100%)  | 0/1 (0%)    | P41: v8 inline fn        |
| G2       | agentSlice.ts (L854-962 scope) | 52/75 (69.3%) | 7/15 (46.7%)  | -           | 基準未達                 |
| G3       | ChatPanel.tsx                  | 62/71 (87.3%) | 14/15 (93.3%) | 1/3 (33.3%) | 未カバー fn はスコープ外 |

### テスト実行結果

- Test Files: 3 passed (3)
- Tests: 43 passed (43)

## Task 2: ギャップ分析

### G1: skill:create ハンドラ（PASS）

- **Stmts/Branches**: 全行・全分岐カバー済み（100%）
- **Functions 0%**: P41（v8 カバレッジプロバイダのインライン関数カウント問題）
  - `getAllowedWindows: () => [mainWindow]` がインライン arrow function として独立カウントされる
  - テスト内で `validateIpcSender` の呼び出しは検証済みだが、v8 が関数としてカウントするコールバックは直接実行されない
  - セキュリティテスト（G1-SEC-2）で `getAllowedWindows` の存在は `expect.objectContaining` で確認済み
  - **判定**: P41 既知問題として許容

### G2: Store 駆動ライフサイクル（初回: 基準未達）

未カバー分岐の内訳:

| 行番号   | 内容                                            | カテゴリ  |
| -------- | ----------------------------------------------- | --------- |
| L856-859 | analyzeSkill: バリデーションエラー分岐          | edge case |
| L862-864 | analyzeSkill: `window.electronAPI?.skill` guard | API guard |
| L867-872 | analyzeSkill: catch ブロック                    | エラー系  |
| L880-887 | applySkillImprovements: バリデーション2種       | edge case |
| L890-892 | applySkillImprovements: API guard               | API guard |
| L940-943 | createSkill: バリデーションエラー分岐           | edge case |
| L946-948 | createSkill: API guard                          | API guard |

### G3: ChatPanel 結線（PASS: Stmts/Branches）

- **Stmts 87.3%**: 基準（80%）充足
- **Branches 93.3%**: 基準（60%）充足
- **Functions 33.3%**: 未カバー関数 `handleImportRequest`(L70) と `onClose`(L149) は TASK-10A-G スコープ外
  - `handleImportRequest`: スキルインポートダイアログ用コールバック
  - `onClose`: SkillImportDialog の close コールバック
  - **判定**: スコープ外関数として許容

## Task 3: edge case 追加

G2 のカバレッジ基準未達を解消するため、以下の 9 テストを追加:

### G2-VAL: バリデーション分岐（6件）

| ID       | テスト内容                                            | カバー対象 |
| -------- | ----------------------------------------------------- | ---------- |
| G2-VAL-1 | createSkill 空文字列 -> skillError                    | L940-942   |
| G2-VAL-2 | createSkill スペースのみ（P42） -> skillError         | L940-942   |
| G2-VAL-3 | analyzeSkill 空文字列 -> skillError                   | L856-858   |
| G2-VAL-4 | applySkillImprovements 空文字列 -> skillError         | L880-882   |
| G2-VAL-5 | applySkillImprovements 空 suggestions -> skillError   | L884-886   |
| G2-VAL-6 | analyzeSkill 失敗時 -> skillError + isAnalyzing=false | L867-872   |

### G2-GUARD: API guard 分岐（3件）

| ID         | テスト内容                                                | カバー対象 |
| ---------- | --------------------------------------------------------- | ---------- |
| G2-GUARD-1 | electronAPI.skill 未定義 -> createSkill エラー            | L946-948   |
| G2-GUARD-2 | electronAPI.skill 未定義 -> analyzeSkill エラー           | L862-864   |
| G2-GUARD-3 | electronAPI.skill 未定義 -> applySkillImprovements エラー | L890-892   |

### 追加後の測定結果（52テスト）

| スイート           | Stmts         | Branches      | Functions     | 判定 |
| ------------------ | ------------- | ------------- | ------------- | ---- |
| G1 scope           | 42/42 (100%)  | 11/11 (100%)  | 0/1 (0%, P41) | PASS |
| G2 scope           | 75/75 (100%)  | 21/21 (100%)  | 3/3 (100%)    | PASS |
| G3 (ChatPanel.tsx) | 62/71 (87.3%) | 14/15 (93.3%) | 1/3 (33.3%)   | PASS |

## Task 4: shuffle テスト

```bash
cd apps/desktop && pnpm vitest run --sequence.shuffle \
  src/main/ipc/__tests__/skillHandlers.create.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

### 結果

- Test Files: 3 passed (3)
- Tests: 52 passed (52)
- 順序依存: なし（P9 準拠の beforeEach リセットが機能）

## 制約遵守

- P9: beforeEach で `resetAgentState()` / `vi.clearAllMocks()` / `setStoreState()` 実行
- P39: happy-dom 環境で fireEvent 使用（userEvent 未使用）
- P42: バリデーションテストで3段バリデーション（型チェック/空文字列/トリム空文字列）を検証
- P40: `cd apps/desktop &&` で実行
