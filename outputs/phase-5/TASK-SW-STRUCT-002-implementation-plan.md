# TASK-SW-STRUCT-002 実装ステップ記録

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| タスクID   | TASK-SW-STRUCT-002                            |
| 機能名     | struct-002-connect-structure-plan-to-skill-md |
| 実装参照   | PR #2209 / commit c21cc553c                   |
| 完了確認日 | 2026-04-17                                    |

## TASK-SW-STRUCT-001 完了確認

```
rg -n "purpose:\s*options\.description" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

確認結果: `extractPurposeAgent` の直接代入ではなく、`structurePlan.purpose` に `options.description` が設定されている状態を確認。

## 実装内容

### 1. `void structurePlan;` の削除（:126）

削除済み。PR #2209 にて `void structurePlan;` コメント行を削除し `structurePlan` 変数が後続コードから参照可能になった。

### 2. `generateSkillMd` プライベートメソッドの新規実装

- `structurePlan` を基に `plan` JSON を組み立て、tmp ファイル経由で `generate_skill_md.js` を呼び出す
- `purpose` の正規化（空白圧縮・trim）後 `triggerDescription` を生成
- `triggers` が空配列の場合 `[skillName]` にフォールバック
- `anchors` が未定義の場合 `[]` にフォールバック（`anchors ?? []`）
- 失敗時は `ensureSkillMdExists` へ3段階フォールバック

### 3. SKILL.md 生成フローの分岐変更（:304-329）

- `structurePlan` が非 null のとき `generateSkillMd` を呼び出す
- `structurePlan` が null かつ create モードのとき `ensureSkillMdExists` へフォールバック（warn ログ付き）
- その他モードは従来どおり `ensureSkillMdExists`

### 4. `logger` フィールド追加

console.error/warn ベースの最小実装を追加。

## テスト結果（Green 確認）

```
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts
```

- 実行: 2026-04-17
- 結果: 90 tests PASS
- 時間: 70ms

## 型チェック・lint 確認

| チェック  | 結果                                            |
| --------- | ----------------------------------------------- |
| typecheck | 0 error                                         |
| lint      | 0 error, 8 warnings（本タスク外の既存 warning） |
