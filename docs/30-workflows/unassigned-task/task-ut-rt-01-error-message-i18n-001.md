# TASK-UT-RT-01-ERROR-MESSAGE-I18N-001

## 1. メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| タスクID | TASK-UT-RT-01-ERROR-MESSAGE-I18N-001 |
| 種別     | follow-up / improvement              |
| 優先度   | Low                                  |
| 親タスク | TASK-RT-01                           |
| 作成日   | 2026-03-29                           |
| 状態     | open                                 |

## 2. 背景

TASK-RT-01 で実装した `toActionableMessage()` 関数と `LLM_ADAPTER_INITIALIZING` エラーのメッセージ文字列が日本語でハードコードされている。

```typescript
// 現状（RuntimeSkillCreatorFacade.ts）
// "APIキーを設定してください"
// "LLMAdapterの初期化中です。しばらくお待ちください"
```

多言語対応（i18n）が実施された際に、これらの文字列を i18n キーへ置換する必要がある。

### 苦戦箇所（TASK-RT-01 より引継ぎ）

- TASK-RT-01 の実装時、i18n 対応を行うべきか検討したが、プロジェクト全体の i18n 基盤（`task-i18n-multi-language-support.md` 等）が未整備のため、一時的に日本語ハードコードで実装した。
- `toActionableMessage()` の判定ロジック（reason 文字列に `API key` / `ANTHROPIC_API_KEY` が含まれるかのキーワードマッチ）は、将来の i18n キー設計に影響する可能性がある。

## 3. 実施スコープ

- `RuntimeSkillCreatorFacade.ts` 内の日本語ハードコード文字列を i18n キーに置換する
- 対象文字列:
  - `"APIキーを設定してください"` → i18n キー `skillCreator.error.apiKeyRequired`
  - `"LLMAdapterの初期化中です。しばらくお待ちください"` → i18n キー `skillCreator.error.llmAdapterInitializing`
  - `"LLMAdapterの設定に失敗しました。設定を確認してください"` → i18n キー `skillCreator.error.llmAdapterFailed`
- プロジェクトの i18n 基盤に合わせたキー命名規則に従う

### スコープ外

- i18n 基盤の整備（別タスク: `task-i18n-multi-language-support.md` に委任）
- `toActionableMessage()` のキーワードマッチ判定ロジックの変更

## 4. 成果物

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — ハードコード文字列を i18n キーに置換
- i18n リソースファイル（英語・日本語の翻訳文字列追加）
- テスト: `RuntimeSkillCreatorFacade.adapter-status.test.ts` の文字列アサーションをキーベースに更新

## 5. 完了条件

- `RuntimeSkillCreatorFacade.ts` 内に日本語ハードコード文字列が存在しない
- 英語・日本語の翻訳リソースに対応するキーが追加されている
- 既存テストがリグレッションなし
- i18n 基盤が整備されていない場合は本タスクをブロック状態に設定する
