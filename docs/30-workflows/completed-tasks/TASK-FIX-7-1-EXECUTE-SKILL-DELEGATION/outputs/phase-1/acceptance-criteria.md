# 受け入れ基準

## タスク情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 作成日   | 2026-02-11                            |

## 受け入れ基準一覧

### AC-1: 委譲動作

**Given**: SkillExecutor が setSkillExecutor() で設定されている
**When**: executeSkill() が呼び出される
**Then**: SkillExecutor.execute() に処理が委譲される

**ステータス**: ✅ 合格

### AC-2: 型変換

**Given**: UI層の Skill 型オブジェクトが存在する
**When**: executeSkill() 内で型変換が行われる
**Then**: SDK層の SkillMetadata 型に正しく変換される

**ステータス**: ✅ 合格

### AC-3: 初期化エラー

**Given**: SkillExecutor が設定されていない
**When**: executeSkill() が呼び出される
**Then**: SkillExecutorNotInitializedError がスローされる

**ステータス**: ✅ 合格

### AC-4: スキル未検出エラー

**Given**: 指定されたスキルIDが存在しない
**When**: executeSkill() が呼び出される
**Then**: SkillNotFoundError がスローされる

**ステータス**: ✅ 合格

### AC-5: E2Eスモークテスト

**Given**: アプリケーションが起動している
**When**: スキル実行フローを実行する
**Then**: Renderer → IPC → SkillService → SkillExecutor → SDK の全経路が動作する

**ステータス**: ✅ 合格
