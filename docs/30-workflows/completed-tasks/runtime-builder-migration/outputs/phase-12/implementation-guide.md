# Implementation Guide: UT-RUNTIME-BUILDER-MIGRATION-001

## Part 1: 概念説明（統一窓口パターン）

市役所には、住民票の発行窓口、転入届の受付窓口、税金の支払い窓口など、用件ごとに別々の窓口があります。しかし「総合窓口」として1つの窓口で全ての用件を受け付けてくれる市役所が増えています。

`TerminalHandoffBuilder.buildForSurface()` はこの「総合窓口」です。

以前は用途ごとに別々のメソッドを呼び分ける必要がありました:

- チャット編集用: `build()`
- エージェント実行用: `buildForAgentExecution()`
- スキル実行用: `buildForSkillExecution()`

`buildForSurface()` に統一することで:

- 「どのメソッドを使えばいいか」を考えなくてよくなった
- 新しい surface が追加されても同じメソッドで対応できる
- `surfaceType` パラメータに `"chat-edit"` / `"runtime"` / `"skill-docs"` を渡すだけ

---

## Part 2: 開発者向け実装詳細

### メソッドシグネチャ

```typescript
buildForSurface(
  request: BuildForSurfaceRequest,
  reason: HandoffGuidance["reason"],
): HandoffGuidance
```

### リクエスト型（discriminated union）

```typescript
type BuildForSurfaceRequest =
  | ChatEditSurfaceRequest // surfaceType: "chat-edit"
  | RuntimeSurfaceRequest // surfaceType: "runtime"
  | SkillDocsSurfaceRequest; // surfaceType: "skill-docs"
```

### 変更ファイル一覧

| ファイル                                    | 変更内容                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `runtime/TerminalHandoffBuilder.ts`         | `buildForSurface()` 追加、旧メソッド @deprecated                                                  |
| `chatEditHandlers.ts`                       | `build()` → `buildForSurface({ surfaceType: "chat-edit", ... })`                                  |
| `agentHandlers.ts`                          | `buildForAgentExecution()` → `buildForSurface({ surfaceType: "runtime", runtimeType: "agent" })`  |
| `skillHandlers.ts`                          | `buildForSkillExecution()` → `buildForSurface({ surfaceType: "runtime", runtimeType: "skill" })`  |
| `RuntimeSkillCreatorFacade.ts`              | `build()` → `buildForSurface()`, 戻り値 `bundle` → `guidance`                                     |
| `chat-edit/TerminalHandoffBuilder.ts`       | `@deprecated` 付与                                                                                |
| `packages/shared/src/types/skillCreator.ts` | `RuntimeSkillCreatorPlanResponse` / `RuntimeSkillCreatorImproveResponse` の `bundle` → `guidance` |

### テスト構成

- 37 テストケース（16 基本 + 5 境界値 + 1 skill サブタイプ + 7 旧メソッド回帰 + 8 既存）
- カバレッジ: Line 100%, Branch 91.11%, Function 100%

### セキュリティ

- P55: sanitizePrompt() が全 surface で適用
- P62: never 型 exhaustive check で未知 surfaceType をエラー throw
- NFR-3: HandoffGuidance のみ返却（TerminalHandoffBundle は IPC 非通過）
