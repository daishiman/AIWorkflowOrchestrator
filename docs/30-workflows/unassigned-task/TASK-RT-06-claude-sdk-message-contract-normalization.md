# Claude Code SDK `query()` メッセージ契約の正規化 - タスク指示書

## メタ情報

```yaml
issue_number: 1882
```

## メタ情報

| 項目         | 値                                                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-RT-06                                                                                                              |
| タスク名     | Claude Code SDK `query()` メッセージ契約の正規化                                                                        |
| 分類         | リファクタリング（Runtime系）                                                                                           |
| 対象機能     | Skill Creator Agent SDK Lane - SDK messageコントラクト                                                                  |
| 優先度       | 高                                                                                                                      |
| 見積もり規模 | 中規模                                                                                                                  |
| ステータス   | 未実施                                                                                                                  |
| 発見元       | P0是正パック（実動作調査・SDK契約分析）                                                                                 |
| 発見日       | 2026-04-04                                                                                                              |
| Step         | 08（並列実行可能）                                                                                                      |
| 依存タスク   | なし                                                                                                                    |
| 関連UTタスク | UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001（完了）、UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001（未着手） |

---

## 1. なぜこのタスクが必要か（Why）

### 1-1. 現状の問題

Claude Agent SDK の `query()` API は以下のメッセージ種別を返す:

| メッセージ種別 | 内容                                       |
| -------------- | ------------------------------------------ |
| `system/init`  | セッション開始通知。`session_id` を含む    |
| `assistant`    | LLMの応答テキスト。content配列を含む       |
| `result`       | 実行結果。`session_id`・`stop_reason` 含む |
| `session_id`   | セッション識別子（複数箇所に散在）         |

これらの raw メッセージを現状のコードは**直接UIや WorkflowEngine が処理**している。その結果:

1. **SDK内部変更の影響が全レイヤーに波及する**: `sdkMessageNormalizer.ts`（skill-creator lane）と `RuntimeSkillCreatorFacade.ts` 内の `normalizeSkillCreatorSdkMessage()` に類似ロジックが並立している。
2. **`result` と `assistant` の解釈が実装ごとにバラバラ**: `SkillCreatorWorkflowEngine` と `RuntimeSkillCreatorFacade` でメッセージ分岐ロジックが重複する。
3. **セッションIDの抽出ロジックが散在**: `extractSessionId()` が `RuntimeSkillCreatorFacade.ts` 内に局所実装されており、`sdkMessageNormalizer.ts` の正規化フローと整合が取れていない。
4. **後続タスクの前提条件**: P0-05（SkillFileWriter統合）、P0-08（セッション復元）、P0-09（permission/hooks）はすべてRT-06の契約正規化を前提とする。

### 1-2. 影響範囲の概念図

```
[Claude Agent SDK query()]
        |
        | raw messages (unknown[])
        v
[正規化レイヤー（現在:分散）]  <-- ここを一本化するのが本タスク
   ├── RuntimeSkillCreatorFacade.normalizeSkillCreatorSdkMessage()
   └── sdkMessageNormalizer.normalizeSdkMessage()
        |
        | SkillCreatorSdkEvent[]
        v
[WorkflowEngine / UI / IPC]
```

---

## 2. 何を達成するか（What）

### 2-1. 完了時の状態

- SDK `query()` から返される全メッセージ種別（`system/init`、`assistant`、`result`）の正規化ロジックが**単一の `SDKMessageNormalizer`（または既存 `sdkMessageNormalizer.ts`）に集約**されている。
- `RuntimeSkillCreatorFacade` 内の `normalizeSkillCreatorSdkMessage()` / `normalizeSkillCreatorSdkEvents()` を削除し、`sdkMessageNormalizer.ts` の `normalizeSdkMessage()` / `normalizeSdkStream()` に一本化する。
- `session_id` 抽出ロジックが1箇所（Normalizer内）に統一されている。
- WorkflowEngine、UI、IPC は `SkillCreatorSdkEvent[]` のみを受け取り、SDK rawメッセージに触れない。

### 2-2. スコープ境界

| 含むもの                                                                       | 含まないもの                                                                                                    |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `sdkMessageNormalizer.ts` への重複ロジック統合                                 | UI層のコンポーネント変更（RT-03/P0-06の責務）                                                                   |
| `RuntimeSkillCreatorFacade` 内の重複正規化関数の削除                           | セッション永続化（P0-08の責務）                                                                                 |
| セッションID抽出の統一（`extractSessionId` の正規化器内一元化）                | permission/hooks境界（P0-09の責務）                                                                             |
| `mapQuestionToRequest()` / `mapAnswerToUserInputAnswer()` のNormalizer整合確認 | `SkillStreamMessage` と `SkillCreatorSdkEvent` 型統合（UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001 の責務） |

---

## 3. どのように実行するか（How）

### 3-1. 正規化アーキテクチャ

本タスク完了後の責務境界:

```
sdkMessageNormalizer.ts
  ├── normalizeSdkMessage(rawMessage, context)  → SkillCreatorSdkEvent
  └── normalizeSdkStream(rawMessages, context)  → SkillCreatorSdkEvent[]

sdkMessageUtils.ts（既存）
  ├── asSdkMessageRecord(value)      → Record<string, unknown> | null
  └── getSdkMessageType(msg)         → "system" | "assistant" | "result" | string | null

RuntimeSkillCreatorFacade
  ├── normalizeSdkMessage()  →  sdkMessageNormalizer.normalizeSdkMessage() に委譲（既存）
  ├── normalizeSdkStream()   →  sdkMessageNormalizer.normalizeSdkStream() に委譲（既存）
  ├── normalizeSkillCreatorSdkMessage()  →  削除対象（sdkMessageNormalizer に統合）
  └── normalizeSkillCreatorSdkEvents()   →  削除対象（sdkMessageNormalizer に統合）
```

### 3-2. 重複ロジックの現在の位置

以下の2つの関数が同じ責務を持って並立している:

**`RuntimeSkillCreatorFacade.ts` 内（L1748-L1788）**:

```typescript
export function normalizeSkillCreatorSdkMessage(
  message: unknown,
  sequence: number,
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance,
): SkillCreatorSdkEvent | null { ... }
```

- `resolveSkillCreatorSdkEventType()` で type判定
- `extractSessionId()` でセッションID抽出（4パスのfallback）
- `extractSkillCreatorSdkText()` でテキスト抽出

**`sdkMessageNormalizer.ts`（L31-L56）**:

```typescript
export function normalizeSdkMessage(
  rawMessage: unknown,
  context: NormalizerContext,
): SkillCreatorSdkEvent { ... }
```

- `asSdkMessageRecord()` / `getSdkMessageType()` で前処理
- `normalizeSystemMessage()` / `normalizeAssistantMessage()` / `normalizeResultMessage()` に分岐
- sessionId 伝播は `normalizeSdkStream()` で管理

### 3-3. 型マッピングの二重体系（苦戦箇所に詳述）

Session Bridge型とWorkflow型の境界を `sdkMessageNormalizer.ts` に明示する:

- **Session Bridge型**: `UserInputQuestion` / `UserInputAnswer`（UI↔SDK間）
- **Workflow型**: `SkillCreatorUserInputRequest` / `InterviewUserAnswer`（WorkflowEngine内）

現在これらのマッピングは `SkillCreatorConversationPanel`（Organism）内に局所化されており、Normalizer層として明示されていない。本タスクでは「どこで変換するか」の境界を文書化し、必要なら `NormalizerContext` に型変換フックを追加する。

---

## 4. 実行手順

### Phase 1: 現状分析（所要: 30分）

**目的**: 重複ロジックの全貌を把握する。

1. 以下のファイルを読み、重複する関数・ロジックを一覧化する:
   - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（L1725-L1940）
   - `apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts`（全体）
   - `apps/desktop/src/main/services/runtime/sdkMessageUtils.ts`（全体）

2. 重複ロジックマトリクスを手元で作成する（以下テンプレート）:

   | ロジック          | Facade内の関数             | Normalizer内の関数        | 差分                        |
   | ----------------- | -------------------------- | ------------------------- | --------------------------- |
   | type判定          | resolveSkillCreatorSdk…    | getSdkMessageType()       | 確認要                      |
   | sessionId抽出     | extractSessionId()         | normalizeResultMessage    | Facade側は4パスfallback有   |
   | テキスト抽出      | extractSkillCreatorSdkText | normalizeAssistantMessage | content配列の扱い方が異なる |
   | permissionDenials | extractPermissionDenials   | normalizeAssistantMessage | 確認要                      |

3. `mapQuestionToRequest()` / `mapAnswerToUserInputAnswer()` が呼ばれるファイルを `Grep` で特定する:

   ```
   pattern: mapQuestionToRequest|mapAnswerToUserInputAnswer
   ```

4. 分析結果を元に「統合方針」を決定する。**統合が困難な場合は理由を記録し、見送り判断も可**。

**Phase 1 完了条件**: 重複ロジックマトリクスが完成し、統合方針が決定している。

---

### Phase 2: 型設計（所要: 45分）

**目的**: `SkillCreatorSdkEvent` の型定義が統合後も整合することを確認する。

1. `packages/shared/src/types/skillCreator.ts` で `SkillCreatorSdkEvent` の型定義を確認する。
   - `eventType`: `"init" | "assistant" | "result" | "error"`
   - `sessionId`, `text`, `resultSubtype`, `stopReason`, `permissionDenials`, `errorMessage`, `sourceProvenance` の各フィールド

2. `sdkMessageNormalizer.ts` の既存実装と、`RuntimeSkillCreatorFacade.ts` の `normalizeSkillCreatorSdkMessage()` が返す型を比較する:
   - 差分フィールドがあれば `SkillCreatorSdkEvent` 型に追加を検討（`sequence` フィールドなど）
   - 不要な差分なら Facade側の実装を削除対象として確定

3. `NormalizerContext` に追加が必要なフィールドがあれば型定義を更新する:

   ```typescript
   export interface NormalizerContext {
     sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
     sessionId?: string;
     // 追加検討: sequence?: number;
   }
   ```

4. `mapQuestionToRequest()` / `mapAnswerToUserInputAnswer()` が正規化の前後どちらで呼ばれるべきかを確認し、`NormalizerContext` との関係を明文化する。

**Phase 2 完了条件**: 型定義の更新差分が確定しており、`pnpm typecheck` がパスする見通しが立っている。

---

### Phase 3: Normalizer実装（所要: 90分）

**目的**: 重複ロジックを `sdkMessageNormalizer.ts` に統合する。

1. `sdkMessageNormalizer.ts` の `normalizeAssistantMessage()` に `extractPermissionDenials()` のロジックを移植する:
   - Facade内の `extractPermissionDenials()` が持つfallbackパス（`permission_denials`, `permissionDenials`, `result.permission_denials`, `result.permissionDenials`）を確認し、必要なら `normalizeAssistantMessage()` に追加

2. `normalizeResultMessage()` の `sessionId` 抽出を強化する:
   - Facade内の `extractSessionId()` が持つ4パスfallback（`session_id`, `sessionId`, `result.session_id`, `result.sessionId`）を `normalizeResultMessage()` に反映

3. `normalizeSdkStream()` を `normalizeSkillCreatorSdkEvents()` の代替として使えることを確認する:
   - 空配列入力時のフォールバック（`missing_sdk_events` エラーイベント生成）を Normalizer に追加:

   ```typescript
   // normalizeSdkStream() の最後に追加
   if (events.length === 0) {
     events.push(
       buildErrorEvent(
         "SDK stream did not emit any normalizable events.",
         context,
       ),
     );
   }
   return events;
   ```

4. `sdkMessageNormalizer.ts` のエクスポートに `normalizeSdkStream` が含まれていることを確認する（既存）。

**Phase 3 完了条件**: `sdkMessageNormalizer.ts` 単体で `normalizeSkillCreatorSdkEvents()` と同等の動作ができる。

---

### Phase 4: 既存コードへの適用（所要: 60分）

**目的**: `RuntimeSkillCreatorFacade.ts` 内の重複関数を削除し、`sdkMessageNormalizer.ts` に置き換える。

1. `RuntimeSkillCreatorFacade.ts` 内の以下の関数を削除する（または `sdkMessageNormalizer.ts` へのre-exportに変更する）:
   - `normalizeSkillCreatorSdkEvents()`（L1725-L1746）
   - `normalizeSkillCreatorSdkMessage()`（L1748-L1788）
   - `resolveSkillCreatorSdkEventType()`（L1790-L1818）
   - `extractSessionId()`（L1832-L1841）
   - `extractSkillCreatorSdkText()`（L1843-L1875）
   - `extractPermissionDenials()`（L1877-L1913）

2. 削除した関数の呼び出し箇所を `sdkMessageNormalizer.ts` の `normalizeSdkMessage()` / `normalizeSdkStream()` に置き換える:
   - `_executeInternal()` 内（L1125-L1135）:
     ```typescript
     // Before
     const sdkEvents = normalizeSkillCreatorSdkEvents(
       response.sdkMessages ?? [],
       sourceProvenance,
     );
     // After
     const sdkEvents = normalizeSdkStream(
       response.sdkMessages ?? [],
       this.buildNormalizerContext(),
     );
     ```
   - `executeAsync()` のエラーハンドリング内（L1096-L1103）も同様に置き換え

3. `readString()`, `readValue()`, `isRecord()` のヘルパー関数を確認し、`sdkMessageUtils.ts` に移動が必要かどうかを判断する（型ガード `isRecord` が他でも使われている場合は `sdkMessageUtils.ts` に移動）。

4. `buildNormalizerContext()` が返す `NormalizerContext` が正規化に必要な全フィールドを持つことを確認する:
   ```typescript
   buildNormalizerContext(): NormalizerContext {
     const root = this.getExplicitSkillCreatorRoot();
     return {
       sourceProvenance: root ? { resolvedSkillCreatorRoot: root } : undefined,
     };
   }
   ```

**Phase 4 完了条件**: `RuntimeSkillCreatorFacade.ts` 内に SDK メッセージ正規化ロジックが残っておらず、`sdkMessageNormalizer.ts` / `sdkMessageUtils.ts` に委譲されている。

---

### Phase 5: テスト（所要: 60分）

**目的**: 既存の動作を壊していないことを確認する。

1. 既存テストを実行する:

   ```bash
   pnpm --filter @repo/desktop test -- --testPathPattern="sdkMessageNormalizer"
   pnpm --filter @repo/desktop test -- --testPathPattern="sdkMessageUtils"
   pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"
   ```

2. 型チェックを実行する:

   ```bash
   pnpm --filter @repo/desktop typecheck
   # または
   pnpm typecheck
   ```

3. Lintを実行する:

   ```bash
   pnpm --filter @repo/desktop lint
   ```

4. `normalizeSdkStream()` に対して以下のケースのユニットテストが存在することを確認し、なければ追加する:
   - 空配列 → `missing_sdk_events` エラーイベントが返ること
   - `system/init` の `session_id` が後続 `assistant` / `result` に伝播すること
   - `result` メッセージの `session_id` が `sessionId` として取得できること（4パスfallback）
   - permissionDenials が正しく抽出されること

**Phase 5 完了条件**: 全テストがパスし、型エラー・Lintエラーが0件。

---

### Phase 6: レビュー（所要: 30分）

**目的**: 設計意図と実装内容を整合させ、後続タスク（P0-05/P0-08/P0-09）への影響を確認する。

1. `sdkMessageNormalizer.ts` の冒頭コメントを更新し、統合内容を記録する:

   ```typescript
   /**
    * SDK Message Normalizer
    * TASK-RT-06: Claude Code SDK SDKMessage → SkillCreatorSdkEvent 正規化
    *
    * 変更履歴:
    * - TASK-RT-06（初期）: sdkMessageNormalizer 新設
    * - TASK-RT-06（正規化強化）: RuntimeSkillCreatorFacade の重複ロジックを統合
    */
   ```

2. P0-05（SkillFileWriter統合）、P0-08（セッション復元）、P0-09（permission/hooks）の担当者に「RT-06の正規化レイヤーが単一化された」ことを周知する（Issueコメントで通知）。

3. `UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001` の前提条件（`sdkMessageNormalizer.ts` と `sdkMessageUtils.ts` の整合）が本タスクで満たされることを確認する。

**Phase 6 完了条件**: コードレビュー指摘が解消され、PR がマージ可能な状態。

---

## 5. 完了条件チェックリスト

### 必須条件

- [ ] `sdkMessageNormalizer.ts` の `normalizeSdkMessage()` / `normalizeSdkStream()` が `RuntimeSkillCreatorFacade` 内の重複関数と同等の動作をする
- [ ] `RuntimeSkillCreatorFacade.ts` 内から `normalizeSkillCreatorSdkMessage()` / `normalizeSkillCreatorSdkEvents()` が削除されている（または Normalizer へのラッパーのみ）
- [ ] `extractSessionId()` の4パスfallbackロジックが `sdkMessageNormalizer.ts` 内に統合されている
- [ ] `extractPermissionDenials()` のロジックが `sdkMessageNormalizer.ts` の `normalizeAssistantMessage()` に統合されている
- [ ] 空ストリーム入力時に `missing_sdk_events` エラーイベントが返ること
- [ ] `pnpm typecheck` が PASS すること
- [ ] `pnpm lint` が PASS すること（0 errors）
- [ ] 既存テスト（`sdkMessageNormalizer.test.ts`、`sdkMessageUtils.test.ts`）が全件 PASS すること

### 推奨条件

- [ ] `normalizeSdkStream()` の sessionId 伝播テストが追加されている
- [ ] `NormalizerContext` の型定義が `sequence` フィールドの扱い（含む/含まない）について明示的なコメントを持つ
- [ ] Phase 6 の後続タスクへの周知が完了している

---

## 6. 検証方法

### 動作確認手順

1. **デスクトップアプリを起動し、Skill Creator を操作する**:
   - スキル作成フローを開始する
   - LLMが応答を返す際に `sdkEvents` が `SkillCreatorSdkEvent[]` として正しく格納されることをデバッグログで確認する

2. **SDK メッセージの正規化を確認する**:
   - `system/init` メッセージ → `eventType: "init"`, `sessionId` が取得される
   - `assistant` メッセージ → `eventType: "assistant"`, `text` が取得される
   - `result` メッセージ → `eventType: "result"`, `sessionId` / `stopReason` が取得される

3. **エラーケースを確認する**:
   - 空のSDKメッセージ配列 → `eventType: "error"`, `rawType: "missing_sdk_events"` が返る
   - 不正な型のメッセージ → `eventType: "error"` が返り、例外が発生しない

### ユニットテスト確認

```bash
# sdkMessageNormalizer のテストを実行
pnpm --filter @repo/desktop test -- --testPathPattern="sdkMessageNormalizer"

# 型チェック
pnpm typecheck

# Lint
pnpm lint
```

---

## 7. リスクと対策

| リスク                                                                                    | 発生確率 | 影響度 | 対策                                                                                                      |
| ----------------------------------------------------------------------------------------- | -------- | ------ | --------------------------------------------------------------------------------------------------------- |
| `normalizeSkillCreatorSdkMessage()` と `normalizeSdkMessage()` の動作差分見落とし         | 中       | 高     | Phase 1の重複ロジックマトリクスを丁寧に作成する。差分が見つかった場合はNormalizerに優先的に取り込む       |
| `sequence` フィールドの扱い差分（FacadeはsequenceをSdkEventに含むがNormalizerは含まない） | 高       | 中     | `sequence` をNormalizerで扱うか否かを明示的に決定し、`NormalizerContext` または型定義にコメントで記録する |
| permissionDenials の4パスfallbackが不完全なまま統合される                                 | 中       | 高     | Phase 3で両実装を並べて比較し、すべてのfallbackパスを `normalizeAssistantMessage()` に移植する            |
| P0-08（セッション復元）が `normalizeSkillCreatorSdkEvents()` に依存している               | 低       | 高     | Grep で `normalizeSkillCreatorSdkEvents` の呼び出し箇所を全検索し、削除前にすべて置き換えを完了させる     |
| テスト環境のesbuildミスマッチによるテスト実行失敗                                         | 低       | 中     | `UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001` の教訓に従い、worktree外のCI環境で実行確認する     |

---

## 8. 参照情報（苦戦箇所の記録）

### 苦戦箇所1: Session Bridge型とWorkflow型の二重体系

**TASK-SDK-SC-02（SkillCreatorConversationPanel実装）での実体験に基づく記録。**

| 項目   | 内容                                                                                                                                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題   | SDKが返す質問フォーマット（`UserInputQuestion`）とWorkflowEngineが扱うフォーマット（`SkillCreatorUserInputRequest`）が異なる型体系として共存しており、どのレイヤーで変換するかが不明確だった                  |
| 解決策 | Organism（`SkillCreatorConversationPanel`）内に `mapQuestionToRequest()` / `mapAnswerToUserInputAnswer()` を局所化して一時的に解決したが、本来はNormalizerレイヤーで処理すべきだった                          |
| 教訓   | **SDKのメッセージ型とWorkflow内部型の変換は、必ずNormalizerレイヤーで行い、UIコンポーネントが変換ロジックを持ってはならない**。本タスクでこの境界を明示的に文書化し、必要なら変換フックをNormalizerに追加する |

**具体的な型の対応**:

```
SDK layer                    →  Normalizer  →  Workflow layer
------------------------------------------------------------------
UserInputQuestion            →  変換        →  SkillCreatorUserInputRequest
UserInputAnswer              →  変換        →  SkillCreatorUserInputSubmission
system/init (raw)            →  変換        →  SkillCreatorSdkEvent {eventType: "init"}
assistant (raw)              →  変換        →  SkillCreatorSdkEvent {eventType: "assistant"}
result (raw)                 →  変換        →  SkillCreatorSdkEvent {eventType: "result"}
```

現在 `SkillExecutor` 側との整合が取れていない箇所:

- `mapQuestionToRequest()` は `SkillCreatorConversationPanel` 内に存在（UI層に型変換が混入）
- `mapAnswerToUserInputAnswer()` も同様
- これらをNormalizerに移動するか、または明示的に「UI層の変換として許容する」と文書化する必要がある

### 苦戦箇所2: 重複ロジックの発見タイミング

| 項目     | 内容                                                                                                                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題     | TASK-RT-06の初期実装時に `sdkMessageNormalizer.ts` を新設したが、同時期に `RuntimeSkillCreatorFacade.ts` 内に `normalizeSkillCreatorSdkMessage()` も実装されており、二重実装が生まれた              |
| 根本原因 | Facadeがインクリメンタルに拡張されていく中で、Normalizerとの責務分離が後手に回った                                                                                                                  |
| 教訓     | 新しい変換関数を追加する際は必ず「同等の変換ロジックが他に存在しないか」を `Grep` で確認すること。特にSDKメッセージを扱う関数名（`normalize`, `extract`, `convert`, `transform`）で事前検索すること |

### 苦戦箇所3: sessionIdの散在

| 項目   | 内容                                                                                                                                                                                                                       |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題   | `session_id` が `system/init`, `result`, および `result.session_id`, `result.sessionId` の4パスに分散しており、どのパスが実際に値を持つかがSDKのバージョンによって異なる可能性がある                                       |
| 解決策 | `sdkMessageNormalizer.ts` の `normalizeSdkStream()` がstreamレベルでsessionIdを伝播する設計になっている。これにより個別メッセージがsessionIdを持たなくても、`init` イベントで取得したsessionIdが後続イベントに引き継がれる |
| 教訓   | sessionIdは「最初にinitで取得し、streamレベルで伝播する」パターンが最も堅牢。個別メッセージのfallbackパスを増やすより、initからの伝播を信頼し、結果として得られるsessionIdは検証済みであることを型で保証する設計が望ましい |

### 関連タスクとの連携

`UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001`（完了済み）で確認された知見:

- `sdkMessageUtils.ts` に `asSdkMessageRecord()` / `getSdkMessageType()` が共通化されている
- 型ガード `isValidSDKMessage` は削除済み
- **この基盤を本タスクでさらに活用し、FacadeとNormalizerの完全統合を達成する**

`UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001`（未着手）との関係:

- 本タスクは「正規化ロジックの統合」に留まり、`SkillStreamMessage` と `SkillCreatorSdkEvent` の型統合は行わない
- 本タスク完了により、`UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001` の前提条件が整う

---

## 9. 備考

### 作業ディレクトリ

```
/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260404-095836-wt-6
```

### 主要関連ファイル

| ファイルパス                                                                                | 役割                                                   |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                       | 重複正規化ロジックの削除対象（L1725-L1940）            |
| `apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts`                            | 正規化の一元管理先                                     |
| `apps/desktop/src/main/services/runtime/sdkMessageUtils.ts`                                 | 共有前処理ユーティリティ                               |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                      | WorkflowEngineはSdkEventのみ受け取る（変更不要の想定） |
| `packages/shared/src/types/skillCreator.ts`                                                 | `SkillCreatorSdkEvent` 型定義                          |
| `docs/30-workflows/unassigned-task/UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001.md` | 完了済み関連タスク（知見参照）                         |
| `docs/30-workflows/unassigned-task/UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001.md`      | 後続関連タスク（本タスク完了後に着手）                 |

### コマンドリファレンス

```bash
# 型チェック
pnpm typecheck
# または特定パッケージのみ
pnpm --filter @repo/desktop typecheck

# Lint
pnpm lint
# または
pnpm --filter @repo/desktop lint

# テスト（特定ファイル）
pnpm --filter @repo/desktop test -- --testPathPattern="sdkMessageNormalizer"
pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"

# 重複ロジックの所在確認（Grep等を使用）
# normalizeSkillCreatorSdkMessage / normalizeSkillCreatorSdkEvents の呼び出し箇所を特定すること
```

### Step 08 並列実行について

本タスクはStep 08として他のP0是正タスクと**並列実行可能**。ただし以下の点に注意:

- P0-08（セッション復元）が `normalizeSkillCreatorSdkEvents()` を直接呼び出している場合、本タスクのリファクタリングと競合する可能性がある。作業開始前に `normalizeSkillCreatorSdkEvents` の呼び出し箇所を全件確認すること。
- P0-09（permission/hooks）は本タスクの成果物（統合されたNormalizer）を前提とするため、P0-09の担当者に本タスクの進捗を随時共有すること。
