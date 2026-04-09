# スキルフィードバックレポート

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | TASK-SC-13 |
| 作成日   | 2026-04-08 |

## テンプレート改善

- verify 系タスクのテンプレートに `preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` 追記チェックが抜けやすい
- `RuntimeSkillCreatorFacade` に同名に近い内部 util (`verifySkill(skillDir)`) が既にある場合、公開 IPC method との差分を明記する欄が必要

## ワークフロー改善

- `skillName` を受ける公開 surface と `skillDir` を受ける内部 engine の間に解決レイヤが必要なケースは、Phase 2 で明示させた方が設計の揺れを減らせる
- `outputs/artifacts.json` の status 更新タイミングを、コード実装完了と文書生成完了で分けて扱うルールがあると運用が安定する

## ドキュメント改善

- `validateSender + isBlank + sanitizeErrorMessage` だけでなく、`preload/channels.ts` の whitelist 更新を IPC surface 追加時の定型としてガイドライン化すべき
- `VerifyResult` のような公開 DTO を既存内部型からどう変換するかを、Phase 2 成果物に必須化した方がよい

## 総評

今回のズレは、実装漏れそのものよりも「公開 surface の配線に必要な補助層」の記述不足に起因していた。テンプレートで `shared` / `preload` / `main` / `DTO mapping` を一段細かく分けると再発しにくい。
