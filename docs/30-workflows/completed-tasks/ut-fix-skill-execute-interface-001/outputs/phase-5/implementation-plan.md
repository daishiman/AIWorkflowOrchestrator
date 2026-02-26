# Phase 5 実装計画

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- フェーズ: 5
- 入力: Phase 2設計 + Phase 4テストケース

## 前提

本フェーズは `implementation_and_spec_sync` として、実装変更・テスト更新・仕様同期を同一サイクルで実施する。

## 変更順序

### Step 1: `skill:execute` の受理契約をユニオンで明示

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`

**変更内容**:

- ハンドラ引数型を `SkillExecutionRequest | { skillId: string; params?: Record<string, unknown> }` として明示
- 新契約（`skillName`）と後方互換契約（`skillId`）の両立をコード上で固定

### Step 2: 型ガードとバリデーション境界を固定

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`

**変更内容**:

- `isSkillNameRequest` 型ガードを追加し、`skillName` パスか `skillId` パスかを分岐
- `skillName` / `skillId` に P42 準拠3段バリデーション（`typeof` -> 空文字列 -> `trim`）を適用
- `prompt` の内容バリデーションは Main Handler では追加せず、実行層で扱う責務に統一

### Step 3: `skillName -> skillId` 変換を Main Handler で実施

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`

**変更内容**:

- `scanAvailableSkills()` と `name` 一致検索で `skill.id` を解決
- 解決失敗時は `"スキルが見つかりません"` を返却
- 解決成功時は `executeSkill(skill.id, { prompt: args.prompt })` へ委譲

### Step 4: 後方互換パスの維持

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`

**変更内容**:

- `{ skillId, params }` 受理パスは保持し、`executeSkill(args.skillId, args.params)` を継続
- 既存呼び出し元への破壊的変更を回避

### Step 5: テスト3ファイルの更新

**対象ファイル**:

1. `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`
2. `apps/desktop/src/main/ipc/__tests__/skillHandlers.validation.test.ts`
3. `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts`

**変更内容**:

- `skillName` 契約の成功/失敗ケースを追加
- 旧 `skillId` 契約の互換性ケースを維持
- 型ガード分岐とバリデーションエラーの境界ケースを追加

### Step 6: 回帰確認

- 実行コマンド:
  - `cd apps/desktop && pnpm exec vitest run src/main/ipc/__tests__/skillHandlers.execute.test.ts src/main/ipc/__tests__/skillHandlers.validation.test.ts src/main/ipc/__tests__/skillHandlers.delegate.test.ts`
- 結果: 3ファイル / 90テスト PASS

## 依存管理

| Step   | 前提条件  | 後続への影響                  |
| ------ | --------- | ----------------------------- |
| Step 1 | なし      | Step 2以降の分岐設計の前提    |
| Step 2 | Step 1    | Step 3/4 の実行ルート確定     |
| Step 3 | Step 2    | Step 5 の成功系テストに影響   |
| Step 4 | Step 2    | Step 5 の後方互換テストに影響 |
| Step 5 | Step 3, 4 | Step 6 の回帰判定入力         |
| Step 6 | Step 5    | Phase 9/10 の品質判定入力     |

## セキュリティ順序

- `validateIpcSender` は変更せず、全ロジックより先に実行
- `toIPCValidationError` への変換ルールを維持
- 入力境界（IPC）と実行境界（Service/Executor）を分離

## 完了記録

- [x] 新旧契約（`skillName` / `skillId`）の両立実装を反映
- [x] 型ガードとP42準拠バリデーションを実装
- [x] テスト3ファイル（90テスト）で回帰確認
- [x] セキュリティ境界（sender検証・エラー変換）を維持
