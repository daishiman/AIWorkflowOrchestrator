# フェーズ1 要件定義書

## タスクID: TASK-SW-FIX-DATAFLOW-001

## 問題の本質

`SkillCreateWizard.tsx:553` で `createSkill(formData.purpose, SKILL_GENERATION_OPTIONS)` しか呼ばれておらず、
Step 1 で収集した Q1〜Q6 の回答がスキル生成に渡されていない。

## 修正方針

1. `SkillCreationContext` 型を `packages/shared/src/types/skillCreator.ts` に追加
2. `buildSkillContext(formData, answers): SkillCreationContext` を同ファイルに追加（pure function）
3. `buildSkillGenerationPrompt(context): string` を同ファイルに追加（pure function）
4. `handleGenerate` で `buildSkillContext` を呼び出し `createSkill` に渡す
5. `createSkill` Thunk シグネチャを拡張（`context?: SkillCreationContext`）
6. IPC ハンドラ `skill:create` を拡張（context を受け取り enriched prompt を生成）

## 受け入れ基準 (AC)

| ID   | 内容                                                                  |
| ---- | --------------------------------------------------------------------- |
| AC-1 | `buildSkillContext(formData, answers)` が全フィールドを正しく変換する |
| AC-2 | 空文字フィールドが `undefined` に正規化される                         |
| AC-3 | `handleGenerate` が `SkillCreationContext` を `createSkill` に渡す    |
| AC-4 | `createSkill` Thunk が `context` を IPC 経由で渡す                    |
| AC-5 | IPC ハンドラが context からエンリッチされた説明でスキルを作成する     |
| AC-6 | context なし呼び出しが既存動作と同一（後方互換）                      |

## スコープ

### 含む

- `SkillCreationContext` 型定義
- `buildSkillContext()` 関数
- `buildSkillGenerationPrompt()` 関数
- `handleGenerate` 修正
- `createSkill` Thunk シグネチャ拡張
- IPC ハンドラ拡張（skill:create）
- preload `skill.create` 拡張
- 単体テスト TC-01〜TC-18

### 含まない

- UI 変更（ウィザード画面の表示変更）
- Step 2 以降の変更
- 既存の `createSkillFromWizard` シグネチャ変更
