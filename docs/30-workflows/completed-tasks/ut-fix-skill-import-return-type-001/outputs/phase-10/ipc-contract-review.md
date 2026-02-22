# Phase 10: IPC契約整合性レビュー

## 確認日時

2026-02-21

## P44（skill:import/remove インターフェース不整合）解決確認

### 修正前（P44問題）

- ハンドラ: `args: { skillIds: string[] }` を期待（オブジェクト形式）
- Preload: `safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)` で文字列を送信
- 結果: `args?.skillIds` が undefined → VALIDATION_ERROR

### 修正後

- ハンドラ: `skillName: string` を受け取る（文字列形式）
- Preload: `safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)` で文字列を送信
- 結果: インターフェース一致 ✅

## 引数契約

| 項目           | Main (skillHandlers.ts) | Preload (skill-api.ts) | 一致 |
| -------------- | ----------------------- | ---------------------- | ---- |
| 引数名         | skillName               | skillName              | ✅   |
| 引数型         | string                  | string                 | ✅   |
| バリデーション | 3段（型+空+trim）       | -                      | ✅   |

## 戻り値契約

| 項目   | Main (skillHandlers.ts) | Preload (types.ts)     | 一致 |
| ------ | ----------------------- | ---------------------- | ---- |
| 成功時 | ImportedSkill           | Promise<ImportedSkill> | ✅   |
| 失敗時 | throw { code, message } | Promise rejection      | ✅   |

## エラー形式

| コード           | 条件             | メッセージ                                          |
| ---------------- | ---------------- | --------------------------------------------------- |
| VALIDATION_ERROR | 型不正・空文字列 | "skillName must be a non-empty string"              |
| IMPORT_ERROR     | インポート失敗   | result.errors.join(", ") またはデフォルトメッセージ |

## P45（引数命名ドリフト）確認

- skillHandlers.ts: `skillName` ✅
- skill-api.ts: `skillName` ✅
- 命名とセマンティクスが一致 ✅

## 判定: PASS
