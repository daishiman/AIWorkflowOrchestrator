# spec-extraction-map.md — Phase 1 成果物

## 受入基準テスト変換

| AC   | 検証可能条件                                                                      | 対応テスト                                               |
| ---- | --------------------------------------------------------------------------------- | -------------------------------------------------------- |
| AC-1 | `PLAN_PROMPT_CONSTANTS.AGENT_NAMES` 定数が削除され、コード全体で参照が 0 件になる | grep で定数参照が存在しないことを確認                    |
| AC-2 | `ManifestLoader.extractAgentConfig(manifest)` が agent 種別リソース ID を返す     | ManifestLoader の新メソッドのユニットテスト              |
| AC-3 | マニフェストに agent リソースが 0 件の場合、デフォルト名リストが返る              | AgentNameResolver のフォールバックテスト                 |
| AC-4 | 異なる agent リソースを持つマニフェストを渡すと、その ID 列が返る                 | AgentNameResolver.resolveFromManifest の多パターンテスト |
| AC-5 | 既存テストスイートが全て pass する                                                | `pnpm vitest run` で確認                                 |
| AC-6 | AgentNameResolver の全パターン（manifest あり/なし/空）がテストされている         | AgentNameResolver.test.ts で網羅                         |

## 正本・差分対応表

| 検証項目               | 正本                         | 対応するコード箇所                                      |
| ---------------------- | ---------------------------- | ------------------------------------------------------- |
| AGENT_NAMES hardcode   | PLAN_RESOURCE_REQUESTS       | planPromptConstants.ts L15-19 → 削除                    |
| AGENT_NAME hardcode    | IMPROVE_RESOURCE_REQUESTS    | improvePromptConstants.ts L9 → 削除                     |
| ManifestLoader 拡張    | ManifestLoader.ts            | extractAgentConfig メソッド追加                         |
| 動的解決ユーティリティ | AgentNameResolver.ts         | 新規ファイル作成                                        |
| Facade legacy branch   | RuntimeSkillCreatorFacade.ts | L437 の AGENT_NAMES 参照を AgentNameResolver 経由に変更 |
| 型定義                 | skillCreator.ts              | AgentConfig interface 追加                              |

## スコープ境界

### 含む

- `PLAN_PROMPT_CONSTANTS.AGENT_NAMES` 定数の削除
- `IMPROVE_PROMPT_CONSTANTS.AGENT_NAME` 定数の削除
- `AgentNameResolver` ユーティリティ作成
- `ManifestLoader.extractAgentConfig()` 追加
- `packages/shared/src/types/skillCreator.ts` への `AgentConfig` 型追加
- `RuntimeSkillCreatorFacade.ts` legacy path 更新

### 含まない

- ManifestLoader のコア読み込みロジック変更
- manifest ファイルの配置変更
- UI への変更
- dynamic pipeline path の変更（既に動的）

## 完了宣言

Task 1-5 完了。受入基準 AC-1〜AC-6 が全て検証可能な形に変換された。
