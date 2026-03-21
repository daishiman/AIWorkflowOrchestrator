# 変更ファイルスコープと Ownership

## 変更ファイル一覧

| ファイル                                                   | concern                   | 変更種別             | 担当Task |
| ---------------------------------------------------------- | ------------------------- | -------------------- | -------- |
| `packages/shared/src/types/runtime.ts`                     | 全concern（型定義基盤）   | 新規                 | Task03   |
| `packages/shared/src/types/health.ts`                      | health check              | 確認のみ             | Task03   |
| `apps/desktop/src/main/services/RuntimePolicyResolver.ts`  | runtime実行可否           | 新規                 | Task03   |
| `apps/desktop/src/main/services/RuntimeResolver.ts`        | runtime実行可否           | 削除（deprecated後） | Task09   |
| `apps/desktop/src/main/services/TerminalHandoffBuilder.ts` | handoff bundle            | 修正                 | Task05   |
| `apps/desktop/src/main/handlers/aiHandlers.ts`             | runtime実行可否           | 修正                 | Task04   |
| `apps/desktop/src/main/handlers/agentHandlers.ts`          | runtime実行可否 + handoff | 修正                 | Task04   |
| `apps/desktop/src/main/handlers/skillHandlers.ts`          | runtime実行可否 + handoff | 修正                 | Task05   |
| `apps/desktop/src/renderer/stores/authModeSlice.ts`        | authMode参照              | 確認のみ             | Task04   |
| `apps/desktop/src/renderer/stores/llmSlice.ts`             | health check              | 確認のみ             | Task04   |

## concern 分類

| concern         | 説明                                     | 関連ファイル数 |
| --------------- | ---------------------------------------- | -------------- |
| runtime実行可否 | integrated_api / terminal_handoff の判定 | 5              |
| health check    | LLM プロバイダーの接続状態確認           | 2              |
| handoff bundle  | TerminalHandoffBundle の生成と変換       | 3              |
| authMode参照    | 認証モード（apikey / oauth）の参照       | 1              |

## 変更種別の定義

| 変更種別 | 説明                                               |
| -------- | -------------------------------------------------- |
| 新規     | ファイルを新規作成する                             |
| 修正     | 既存ファイルの一部を変更する                       |
| 削除     | ファイルを削除する（deprecated 期間経過後）        |
| 確認のみ | 変更は行わないが、インターフェース整合性を確認する |

## ファイル別変更詳細

### 新規ファイル

#### `packages/shared/src/types/runtime.ts`（Task03）

```
新規追加する型:
- SurfaceType
- RuntimeDecision
- RuntimeDecisionForRenderer
- HandoffGuidance
- IRuntimePolicyResolver（インターフェース）
```

#### `apps/desktop/src/main/services/RuntimePolicyResolver.ts`（Task03）

```
新規追加する実装:
- RuntimePolicyResolver クラス（IRuntimePolicyResolver 実装）
- resolve(surface: SurfaceType): RuntimeDecision メソッド
- sanitizeForRenderer(decision: RuntimeDecision): RuntimeDecisionForRenderer 関数
- convertBundleToGuidance(bundle: TerminalHandoffBundle): HandoffGuidance 関数
```

### 修正ファイル

#### `apps/desktop/src/main/handlers/aiHandlers.ts`（Task04）

```
変更内容:
- policyResolver.resolve("ai_chat") 呼び出しを冒頭に追加
- RuntimeDecision に基づく分岐ロジック追加
- DEFAULT_CONFIG への暗黙 fallback を除去
- 旧 RuntimeResolver 直接参照を除去
```

#### `apps/desktop/src/main/handlers/agentHandlers.ts`（Task04）

```
変更内容:
- policyResolver.resolve("agent_execution") 呼び出しを冒頭に追加
- terminal_handoff 時の sanitizeForRenderer() 適用
- 旧 RuntimeResolver 直接参照を除去
```

#### `apps/desktop/src/main/handlers/skillHandlers.ts`（Task05）

```
変更内容:
- policyResolver.resolve("skill_execution") 呼び出しを冒頭に追加
- buildForSurface("skill_execution") への移行
- 旧 buildForSkillExecution() 呼び出しを除去
```

#### `apps/desktop/src/main/services/TerminalHandoffBuilder.ts`（Task05）

```
変更内容:
- buildForSurface(surface: SurfaceType) メソッド追加
- buildForAgentExecution() に @deprecated 付与
- buildForSkillExecution() に @deprecated 付与
```

### 削除ファイル

#### `apps/desktop/src/main/services/RuntimeResolver.ts`（Task09）

```
削除条件:
- 全参照箇所が IRuntimePolicyResolver に移行済み
- grep -rn "RuntimeResolver" で新規参照が0件
- Task03〜Task08 全完了後
```

### 確認のみ

#### `packages/shared/src/types/health.ts`（Task03）

```
確認内容:
- HealthCheckResult 型の現在の定義を確認
- RuntimePolicyResolver から参照可能であることを確認
- 変更は不要（既存型をそのまま使用）
```

#### `apps/desktop/src/renderer/stores/authModeSlice.ts`（Task04）

```
確認内容:
- authMode の取得パスを確認（policyResolver が内部で参照するため）
- Renderer 側から直接 runtime 判定に使用されていないことを確認
- 変更は不要（policyResolver が Main Process 側で参照する）
```

#### `apps/desktop/src/renderer/stores/llmSlice.ts`（Task04）

```
確認内容:
- health check 結果の取得パスを確認
- policyResolver が health check 結果を内部で参照するフローを確認
- 変更は不要（既存の health check ロジックをそのまま使用）
```

## 統合テスト連携

### テストファイル対応表

| プロダクションファイル      | テストファイル                   | 担当Task |
| --------------------------- | -------------------------------- | -------- |
| `RuntimePolicyResolver.ts`  | `RuntimePolicyResolver.test.ts`  | Task03   |
| `aiHandlers.ts`             | `aiHandlers.test.ts`             | Task04   |
| `agentHandlers.ts`          | `agentHandlers.test.ts`          | Task04   |
| `skillHandlers.ts`          | `skillHandlers.test.ts`          | Task05   |
| `TerminalHandoffBuilder.ts` | `TerminalHandoffBuilder.test.ts` | Task05   |

### 統合テストシナリオ

#### シナリオ 1: integrated_api フロー（Task04 完了後に実施可能）

```
1. RuntimePolicyResolver.resolve("ai_chat") -> { type: "integrated_api", ... }
2. aiHandlers が integrated_api 分岐を実行
3. API リクエストが正常に送信される
4. Renderer に { type: "integrated_api" } が返却される
```

#### シナリオ 2: terminal_handoff フロー（Task04 + Task05 完了後に実施可能）

```
1. RuntimePolicyResolver.resolve("agent_execution") -> { type: "terminal_handoff", ... }
2. agentHandlers が terminal_handoff 分岐を実行
3. sanitizeForRenderer() で HandoffGuidance に変換
4. Renderer に { type: "terminal_handoff", guidance: {...} } が返却される
5. apiKey / bundle / permissionMode が Renderer に漏洩しないことを検証
```

#### シナリオ 3: surface 別分岐一貫性テスト（Task03〜Task05 完了後に実施可能）

```
1. 同一設定で3つの surface を resolve
   - resolve("ai_chat")
   - resolve("agent_execution")
   - resolve("skill_execution")
2. 全 surface で同一の type（integrated_api / terminal_handoff）が返却されることを検証
3. surface ごとの bundle/guidance 差分が仕様通りであることを検証
```

#### シナリオ 4: 禁止事項違反検出テスト（全Task完了後に実施）

```
1. grep ベースで禁止パターンの残存を検出
2. DEFAULT_CONFIG 直接参照が0件
3. AI_CHECK_CONNECTION 新規参照が0件
4. buildForAgentExecution / buildForSkillExecution 新規使用が0件
5. Renderer からの TerminalHandoffBundle / RuntimeResolution import が0件
```

### テスト実行順序

```
[Task03 完了] -> RuntimePolicyResolver.test.ts 実行
                    |
[Task04 完了] -> aiHandlers.test.ts + agentHandlers.test.ts 実行
                 + 統合シナリオ 1 実行
                    |
[Task05 完了] -> skillHandlers.test.ts + TerminalHandoffBuilder.test.ts 実行
                 + 統合シナリオ 2, 3 実行
                    |
[全Task完了] -> 統合シナリオ 4 実行
                 + 全テスト一括実行（回帰確認）
```
