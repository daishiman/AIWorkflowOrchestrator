# Phase 1 成果物: 要件抽出マップ

## 受入基準（検証可能条件）

| ID   | 基準                                                                                                                       | 検証方法                                                                                                                                                   |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | ハードコードされたエージェント名参照が全て動的解決に置き換えられている                                                     | `IMPROVE_PROMPT_CONSTANTS.AGENT_NAME` の参照が存在しないことと、plan/improve の fallback path が `PLAN/IMPROVE_RESOURCE_REQUESTS` 由来であることをgrep確認 |
| AC-2 | ManifestLoader が `workflow-manifest.json` の resources を読み込み、agent resource を提供できる                            | 既存ManifestLoader実装で対応済み（TASK-P0-04）                                                                                                             |
| AC-3 | manifest resource が未定義/参照不可の場合、`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` フォールバックが機能する | フォールバックパスのテストで確認                                                                                                                           |
| AC-4 | 異なる manifest resource 構成を持つスキル定義で正しく動作する                                                              | カスタムresourceIdsを持つmanifestテストで確認                                                                                                              |
| AC-5 | 既存テストが pass する（後方互換性維持）                                                                                   | `pnpm vitest run` で全テスト pass                                                                                                                          |
| AC-6 | エージェント名解決のユニットテストが全パターンを網羅する                                                                   | fallback・manifest両パスのテストカバレッジ確認                                                                                                             |

## スコープ

### 含む

- `improvePromptConstants.ts` から `AGENT_NAME` 定数を除去
- `RuntimeSkillCreatorFacade.plan()` / `improve()` の resource 解決を manifest 優先の動的パスへ変更
- `SkillCreatorSourceResolver` の root dedupe を source 非依存で安定化
- TASK-P0-07専用ユニットテストの追加

### 含まない

- `ManifestLoader` のコア読み込みロジック変更
- マニフェストファイルの配置変更
- UI への変更

## 依存関係

| 種別     | 参照先     | 状態   |
| -------- | ---------- | ------ |
| upstream | TASK-P0-03 | 完了済 |
| upstream | TASK-P0-04 | 完了済 |

## 変更対象ファイル（特定済み）

| ファイル                                                                       | 現状の問題                                      | 変更内容                                    |
| ------------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------- |
| `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`             | `AGENT_NAME: "improve-prompt"` がハードコード   | `AGENT_NAME` フィールドを除去               |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts:926,1607` | plan/improve の resource 解決が静的定数依存     | manifest 優先の動的解決と fallback を共通化 |
| `apps/desktop/src/main/services/runtime/SkillCreatorSourceResolver.ts`         | root 重複時の provenance が source 依存で不安定 | rootPath ベースの dedupe に変更             |
| テストファイル（新規）                                                         | plan/improve の動的解決テストが存在しない       | TASK-P0-07専用テストを追加                  |
