# イベントモデルテスト仕様書

## メタ情報

| 項目       | 内容                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| Phase      | 4（テスト作成）                                                                                         |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                                 |
| 作成日     | 2026-03-16                                                                                              |
| 入力成果物 | `outputs/phase-2/event-model-design.md`                                                                 |
| テスト状態 | Red（未実装のため全テスト失敗）                                                                         |
| 実装先     | `packages/shared/src/skill/lifecycle/__tests__/types.test.ts`, `factory.test.ts`, `store-slice.test.ts` |

---

## 1. テスト対象

- `toSkillName()`: SkillName ブランド型ファクトリ
- `createSkillLifecycleEventFactory()`: イベント生成ファクトリ
- `SkillLifecycleEvent` 型の必須フィールド検証
- カテゴリ別 metadata スキーマ準拠検証
- `parentEventId` による因果関係チェーン構築
- Zustand Store (`lifecycleCacheSlice`) のイベント追加・取得・フィルタリング・ソート

---

## 2. テストケース一覧

### 2-1. `toSkillName` バリデーション（P42準拠3段バリデーション）

| テストID  | テストケース                                  | 入力値              | 期待結果                                             | 分類   |
| --------- | --------------------------------------------- | ------------------- | ---------------------------------------------------- | ------ |
| EVT-V-001 | 正常なスキル名を SkillName に変換できる       | `"code-review"`     | SkillName 型の `"code-review"` を返す                | 正常系 |
| EVT-V-002 | ハイフン・アンダースコア・数字を含むスキル名  | `"my_skill-2"`      | SkillName 型の `"my_skill-2"` を返す                 | 正常系 |
| EVT-V-003 | 大文字を含むスキル名                          | `"CodeReview"`      | SkillName 型の `"CodeReview"` を返す                 | 正常系 |
| EVT-V-004 | 空文字列を拒否する（P42 Stage 2）             | `""`                | Error: "SkillName must be a non-empty string"        | 異常系 |
| EVT-V-005 | スペースのみの文字列を拒否する（P42 Stage 3） | `"   "`             | Error: "SkillName must be a non-empty string"        | 異常系 |
| EVT-V-006 | 不正文字（スペース含む）を拒否する            | `"code review"`     | Error: "SkillName must contain only alphanumeric..." | 異常系 |
| EVT-V-007 | 不正文字（ドット含む）を拒否する              | `"my.skill"`        | Error: "SkillName must contain only alphanumeric..." | 異常系 |
| EVT-V-008 | 不正文字（スラッシュ含む）を拒否する          | `"path/skill"`      | Error: "SkillName must contain only alphanumeric..." | 異常系 |
| EVT-V-009 | 前後の空白をトリムして評価する                | `"  code-review  "` | SkillName 型の `"code-review"` を返す                | 正常系 |

### 2-2. イベント生成ファクトリ - creation カテゴリ

| テストID  | テストケース                                                         | eventType                | 期待結果                                                                                          | 分類   |
| --------- | -------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------- | ------ |
| EVT-C-001 | skill:created イベントを生成できる                                   | `skill:created`          | 全必須フィールドが設定された SkillLifecycleEvent を返す                                           | 正常系 |
| EVT-C-002 | skill:created の metadata が CreatedEventMetadata スキーマに準拠する | `skill:created`          | `skillName`, `creationMethod`, `templateId`, `initialPromptLength`, `tags`, `isPublic` が存在する | 正常系 |
| EVT-C-003 | skill:draft_saved イベントを生成できる                               | `skill:draft_saved`      | `draftNumber`, `promptLength`, `changedFields`, `autoSaved` が存在する                            | 正常系 |
| EVT-C-004 | skill:template_applied イベントを生成できる                          | `skill:template_applied` | `templateId`, `templateName`, `templateVersion`, `overriddenFields` が存在する                    | 正常系 |

### 2-3. イベント生成ファクトリ - evaluation カテゴリ

| テストID  | テストケース                             | eventType             | 期待結果                                                                                                                                         | 分類   |
| --------- | ---------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| EVT-E-001 | skill:evaluated イベントを生成できる     | `skill:evaluated`     | `score`, `evaluatorModel`, `evaluationDurationMs`, `scoringDimensions`, `promptTokensUsed`, `completionTokensUsed`, `evaluationRound` が存在する | 正常系 |
| EVT-E-002 | skill:score_updated イベントを生成できる | `skill:score_updated` | `previousScore`, `newScore`, `scoreDelta`, `updateReason`, `updatedBy` が存在する                                                                | 正常系 |
| EVT-E-003 | skill:gate_passed イベントを生成できる   | `skill:gate_passed`   | `score`, `thresholdScore`, `gateId`, `unlockedActions` が存在する                                                                                | 正常系 |
| EVT-E-004 | skill:gate_failed イベントを生成できる   | `skill:gate_failed`   | `score`, `thresholdScore`, `gateId`, `scoreDeficit`, `blockedActions`, `suggestedImprovements` が存在する                                        | 正常系 |

### 2-4. イベント生成ファクトリ - execution カテゴリ

| テストID  | テストケース                                   | eventType                   | 期待結果                                                                                                        | 分類   |
| --------- | ---------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------- | ------ |
| EVT-X-001 | skill:executed イベントを生成できる            | `skill:executed`            | `executionId`, `triggerSource`, `inputTokenCount`, `executionContext`, `modelId`, `permissionMode` が存在する   | 正常系 |
| EVT-X-002 | skill:execution_succeeded イベントを生成できる | `skill:execution_succeeded` | `executionId`, `durationMs`, `outputTokenCount`, `totalTokenCount`, `toolCallCount` が存在する                  | 正常系 |
| EVT-X-003 | skill:execution_failed イベントを生成できる    | `skill:execution_failed`    | `executionId`, `durationMs`, `errorCode`, `errorCategory`, `errorMessage`, `retryable`, `retryCount` が存在する | 正常系 |
| EVT-X-004 | skill:execution_timeout イベントを生成できる   | `skill:execution_timeout`   | `executionId`, `timeoutMs`, `elapsedMs`, `lastCompletedStep`, `partialOutputSaved` が存在する                   | 正常系 |

### 2-5. イベント生成ファクトリ - improvement カテゴリ

| テストID  | テストケース                                      | eventType                | 期待結果                                                                                                            | 分類   |
| --------- | ------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------ |
| EVT-I-001 | skill:improved イベントを生成できる               | `skill:improved`         | `previousVersion`, `improvementType`, `changedFields`, `improvementSource`, `relatedFeedbackIds` が存在する         | 正常系 |
| EVT-I-002 | skill:improved の promptDiffLength はオプショナル | `skill:improved`         | `promptDiffLength` が undefined でもイベント生成可能                                                                | 正常系 |
| EVT-I-003 | skill:version_bumped イベントを生成できる         | `skill:version_bumped`   | `previousVersion`, `newVersion`, `bumpType`, `changelogSummary`, `isBreakingChange`, `triggeredByUserId` が存在する | 正常系 |
| EVT-I-004 | skill:feedback_applied イベントを生成できる       | `skill:feedback_applied` | `feedbackEventId`, `feedbackType`, `appliedChanges`, `applicationMethod` が存在する                                 | 正常系 |

### 2-6. イベント生成ファクトリ - reuse カテゴリ

| テストID  | テストケース                           | eventType           | 期待結果                                                                                                                     | 分類   |
| --------- | -------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------ |
| EVT-R-001 | skill:reused イベントを生成できる      | `skill:reused`      | `reuseContext`, `previousUseCount`, `daysSinceLastUse`, `selectedBy` が存在する                                              | 正常系 |
| EVT-R-002 | skill:recommended イベントを生成できる | `skill:recommended` | `recommendationRank`, `recommendationAlgorithm`, `recommendationScore`, `contextSignals`, `wasAccepted` が存在する           | 正常系 |
| EVT-R-003 | skill:imported イベントを生成できる    | `skill:imported`    | `importSource`, `importedSkillName`, `skillFileHash`, `importedVersion`, `validationResult`, `validationMessages` が存在する | 正常系 |
| EVT-R-004 | skill:forked イベントを生成できる      | `skill:forked`      | `sourceSkillId`, `sourceVersion`, `forkedSkillId`, `forkReason`, `inheritedFields`, `divergedFields` が存在する              | 正常系 |

### 2-7. 共通フィールド検証

| テストID  | テストケース                                           | 入力                                     | 期待結果                                                                            | 分類   |
| --------- | ------------------------------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------- | ------ |
| EVT-F-001 | id が UUID v4 形式である                               | ファクトリで生成                         | `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i` にマッチ | 正常系 |
| EVT-F-002 | timestamp が ISO 8601 UTC 形式である                   | ファクトリで生成                         | `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/` にマッチ                           | 正常系 |
| EVT-F-003 | skillId が SkillName 型として設定される                | `toSkillName("test-skill")`              | `event.skillId === "test-skill"`                                                    | 正常系 |
| EVT-F-004 | skillVersion が semver 形式である                      | `"1.2.3"`                                | `event.skillVersion === "1.2.3"`                                                    | 正常系 |
| EVT-F-005 | userId が null 許容である                              | `null`                                   | `event.userId === null`                                                             | 正常系 |
| EVT-F-006 | userId が UUID v4 文字列を受け入れる                   | `"550e8400-e29b-41d4-a716-446655440000"` | `event.userId` が一致する                                                           | 正常系 |
| EVT-F-007 | source が "main" / "renderer" / "cli" のいずれかである | `"main"`                                 | `event.source === "main"`                                                           | 正常系 |
| EVT-F-008 | parentEventId が省略時に null になる                   | 省略                                     | `event.parentEventId === null`                                                      | 正常系 |
| EVT-F-009 | parentEventId が指定時に設定される                     | `"parent-uuid"`                          | `event.parentEventId === "parent-uuid"`                                             | 正常系 |
| EVT-F-010 | カスタム generateId 関数が使用される                   | `() => "fixed-id"`                       | `event.id === "fixed-id"`                                                           | 正常系 |
| EVT-F-011 | カスタム getTimestamp 関数が使用される                 | `() => "2026-01-01T00:00:00.000Z"`       | `event.timestamp === "2026-01-01T00:00:00.000Z"`                                    | 正常系 |

### 2-8. 不正値の拒否テスト

| テストID  | テストケース                            | 入力                                                   | 期待結果                                                   | 分類   |
| --------- | --------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- | ------ |
| EVT-N-001 | 不正な eventType を拒否する（型レベル） | `"invalid:event"`                                      | TypeScript コンパイルエラー（テストでは `as any` で検証）  | 異常系 |
| EVT-N-002 | skillVersion が空文字列のイベント       | `""`                                                   | バリデーションエラー（実装によりランタイムまたは型エラー） | 異常系 |
| EVT-N-003 | category と eventType の不整合          | `category: "creation"` + `eventType: "skill:executed"` | バリデーションエラー                                       | 異常系 |

### 2-9. 因果関係チェーン構築テスト

| テストID  | テストケース                                               | シナリオ                                                                                                 | 期待結果                                                                                                      | 分類   |
| --------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------ |
| EVT-P-001 | 実行シーケンス: executed → execution_succeeded             | 1. executed イベントを生成（parentEventId=null）2. succeeded イベントを生成（parentEventId=executed.id） | succeeded.parentEventId === executed.id かつ succeeded.metadata.executionId === executed.metadata.executionId | 正常系 |
| EVT-P-002 | 実行シーケンス: executed → execution_failed                | 同上（failed）                                                                                           | failed.parentEventId === executed.id                                                                          | 正常系 |
| EVT-P-003 | 実行シーケンス: executed → execution_timeout               | 同上（timeout）                                                                                          | timeout.parentEventId === executed.id                                                                         | 正常系 |
| EVT-P-004 | 評価チェーン: evaluated → gate_passed                      | 1. evaluated イベント 2. gate_passed（parentEventId=evaluated.id）                                       | gate_passed.parentEventId === evaluated.id                                                                    | 正常系 |
| EVT-P-005 | 評価チェーン: evaluated → gate_failed                      | 同上（gate_failed）                                                                                      | gate_failed.parentEventId === evaluated.id                                                                    | 正常系 |
| EVT-P-006 | 評価チェーン: evaluated → score_updated                    | 同上（score_updated）                                                                                    | score_updated.parentEventId === evaluated.id                                                                  | 正常系 |
| EVT-P-007 | 改善チェーン: feedback_applied → improved → version_bumped | 3段チェーン構築                                                                                          | improved.parentEventId === feedback_applied.id かつ version_bumped.parentEventId === improved.id              | 正常系 |
| EVT-P-008 | 作成チェーン: template_applied → created                   | テンプレート起源                                                                                         | created.parentEventId === template_applied.id                                                                 | 正常系 |
| EVT-P-009 | 作成チェーン: forked → created                             | フォーク起源                                                                                             | created.parentEventId === forked.id                                                                           | 正常系 |
| EVT-P-010 | 推薦チェーン: recommended → reused                         | 推薦経由再利用                                                                                           | reused.parentEventId === recommended.id                                                                       | 正常系 |
| EVT-P-011 | 手動再利用は parentEventId が null                         | 手動選択の reused                                                                                        | reused.parentEventId === null                                                                                 | 正常系 |
| EVT-P-012 | 自己参照は不許可                                           | parentEventId === id                                                                                     | バリデーションエラー（自己参照禁止ルール）                                                                    | 異常系 |

### 2-10. Zustand Store テスト（lifecycleCacheSlice）

| テストID  | テストケース                                                           | 操作                             | 期待結果                                                       | 分類         |
| --------- | ---------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------- | ------------ |
| EVT-S-001 | 初期状態で cachedEvents が空配列                                       | ストア初期化                     | `cachedEvents.length === 0`                                    | 正常系       |
| EVT-S-002 | addEvent でイベントが先頭に追加される                                  | 1件追加                          | `cachedEvents[0]` が追加イベント                               | 正常系       |
| EVT-S-003 | 50件まで保持可能                                                       | 50件追加                         | `cachedEvents.length === 50`                                   | 正常系       |
| EVT-S-004 | 51件目追加で最古イベントが削除される                                   | 51件追加                         | `cachedEvents.length === 50` かつ最古の1件目が消えている       | 境界値       |
| EVT-S-005 | skillId でフィルタリングできる                                         | 異なる skillId のイベント3件追加 | フィルタ結果が対象 skillId のイベントのみ含む                  | 正常系       |
| EVT-S-006 | eventType でフィルタリングできる                                       | 異なる eventType のイベント追加  | フィルタ結果が対象 eventType のイベントのみ含む                | 正常系       |
| EVT-S-007 | category でフィルタリングできる                                        | 異なる category のイベント追加   | フィルタ結果が対象 category のイベントのみ含む                 | 正常系       |
| EVT-S-008 | timestamp 降順でソートされている                                       | 異なる timestamp のイベント追加  | `cachedEvents` が新しい順に並んでいる                          | 正常系       |
| EVT-S-009 | clearCache でキャッシュが空になる                                      | 10件追加後 clearCache            | `cachedEvents.length === 0`                                    | 正常系       |
| EVT-S-010 | persist partialize が cachedEvents のみ含む                            | persist 設定を検証               | `partialize` の返値に `addEvent` / `clearCache` が含まれない   | 正常系       |
| EVT-S-011 | ExecutionFailedEventMetadata の errorMessage が persist から除外される | execution_failed イベントを追加  | persist 対象のキャッシュで errorMessage が除外またはサニタイズ | セキュリティ |

---

## 3. テスト実装方針

### 3-1. テストファイル構成

```
packages/shared/src/skill/lifecycle/__tests__/
  types.test.ts         # EVT-V-* (toSkillName バリデーション)
  factory.test.ts       # EVT-C-*, EVT-E-*, EVT-X-*, EVT-I-*, EVT-R-*, EVT-F-*, EVT-N-*
  causal-chain.test.ts  # EVT-P-* (因果関係チェーン)
  store-slice.test.ts   # EVT-S-* (Zustand Store)
```

### 3-2. テストデータ依存

- `createMockLifecycleEvent()` ファクトリ（`test-data-factory-definition.md` 参照）を使用
- カスタム `generateId` / `getTimestamp` の DI によりテストを決定論的にする

### 3-3. 既知パターン対策

| パターン | 対策                                                                        |
| -------- | --------------------------------------------------------------------------- |
| P42      | `toSkillName` テストで3段バリデーション（型→空文字列→トリム空文字列）を検証 |
| P31      | Store テストでは個別セレクタのみ使用（合成 Hook 不使用）                    |
| P48      | 配列を返すセレクタ（フィルタリング結果）には `useShallow` 適用を検証        |
| P9       | 各テストで `beforeEach` により Store 状態をリセット                         |
| P39      | happy-dom 環境では `fireEvent` を使用（Store テストは happy-dom 不要）      |

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 4_
