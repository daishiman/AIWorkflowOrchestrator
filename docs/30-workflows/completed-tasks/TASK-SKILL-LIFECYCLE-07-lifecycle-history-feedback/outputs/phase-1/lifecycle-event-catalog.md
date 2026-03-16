# ライフサイクルイベントカタログ

## メタ情報

| 項目         | 内容                                                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase        | 1 タスク1                                                                                                                                       |
| タスクID     | TASK-SKILL-LIFECYCLE-07                                                                                                                         |
| 作成日       | 2026-03-16                                                                                                                                      |
| 出力パス     | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/phase-1/lifecycle-event-catalog.md` |
| 対象カテゴリ | 作成 / 評価 / 実行 / 改善 / 再利用（全5カテゴリ・全17イベント）                                                                                 |

---

## 1. 共通メタデータスキーマ

全イベントに必ず記録するフィールド。

| フィールド名    | 型                                                                              | 必須 | 説明                                                                                      |
| --------------- | ------------------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------- |
| `id`            | string (UUID v4)                                                                | 必須 | イベント固有識別子。重複排除キー。`crypto.randomUUID()` で生成                            |
| `skillId`       | string (UUID v4)                                                                | 必須 | 対象スキルの識別子。`SkillMeta.id` と一致                                                 |
| `skillVersion`  | string (semver: `MAJOR.MINOR.PATCH`)                                            | 必須 | イベント発生時点のスキルバージョン。例: `"1.2.0"`                                         |
| `eventType`     | string (列挙値)                                                                 | 必須 | イベント種別識別子。例: `"skill:created"` — 後述のカテゴリ別定義参照                      |
| `category`      | `"creation"` \| `"evaluation"` \| `"execution"` \| `"improvement"` \| `"reuse"` | 必須 | イベントカテゴリ。フィルタリング・集計に使用                                              |
| `timestamp`     | string (ISO 8601: `YYYY-MM-DDTHH:mm:ss.sssZ`)                                   | 必須 | イベント発生日時（UTC）。例: `"2026-03-16T07:17:53.000Z"`                                 |
| `userId`        | string (UUID v4) \| `null`                                                      | 必須 | 操作ユーザーの識別子。CLI バッチ実行等でユーザー特定不能な場合は `null`                   |
| `source`        | `"main"` \| `"renderer"` \| `"cli"`                                             | 必須 | イベント発生プロセス。詳細は「発生元の定義」参照                                          |
| `parentEventId` | string (UUID v4) \| `null`                                                      | 任意 | 因果関係のある先行イベントID。単発イベントは `null`。詳細は「イベント因果関係ルール」参照 |
| `metadata`      | object                                                                          | 必須 | イベント固有の追加データ。各カテゴリ定義のメタデータフィールドを収録                      |

### TypeScript 型定義（参考）

```typescript
type EventCategory =
  | "creation"
  | "evaluation"
  | "execution"
  | "improvement"
  | "reuse";
type EventSource = "main" | "renderer" | "cli";

interface SkillLifecycleEventBase {
  id: string; // UUID v4
  skillId: string; // UUID v4
  skillVersion: string; // semver
  eventType: string; // カテゴリ別列挙値
  category: EventCategory;
  timestamp: string; // ISO 8601 UTC
  userId: string | null; // UUID v4 or null
  source: EventSource;
  parentEventId: string | null; // UUID v4 or null
  metadata: Record<string, unknown>;
}
```

---

## 2. 発生元の定義

| source       | 代表プロセス          | 代表ユースケース                                   |
| ------------ | --------------------- | -------------------------------------------------- |
| `"main"`     | Electron Main Process | IPC 経由の実行・評価処理、SQLite 永続化トリガー    |
| `"renderer"` | Electron Renderer     | スキル作成UI操作、フィードバック入力、ドラフト保存 |
| `"cli"`      | CLI / コマンドライン  | `aiworkflow skill` サブコマンド経由の操作          |

---

## 3. イベントカタログ（カテゴリ別）

### 3-1. 作成イベント（category: `"creation"`）

| #   | イベント名               | 説明                                         | 発生元                      |
| --- | ------------------------ | -------------------------------------------- | --------------------------- |
| 1   | `skill:created`          | スキルが新規作成され永続化された             | `main` / `renderer` / `cli` |
| 2   | `skill:draft_saved`      | 作成途中のドラフトが保存された               | `renderer`                  |
| 3   | `skill:template_applied` | 既存テンプレートをもとにスキルが初期化された | `renderer` / `cli`          |

#### skill:created — 固有メタデータ

| フィールド            | 型                                                   | 必須 | 説明                                             |
| --------------------- | ---------------------------------------------------- | ---- | ------------------------------------------------ |
| `skillName`           | string                                               | 必須 | スキル表示名                                     |
| `creationMethod`      | `"manual"` \| `"template"` \| `"fork"` \| `"import"` | 必須 | 作成手段                                         |
| `templateId`          | string (UUID v4) \| `null`                           | 任意 | 使用したテンプレートID。手動作成は `null`        |
| `initialPromptLength` | number                                               | 必須 | 初期プロンプトの文字数（バイト数ではなく文字数） |
| `tags`                | string[]                                             | 必須 | 初期タグ一覧。タグなしは空配列 `[]`              |
| `isPublic`            | boolean                                              | 必須 | 作成時点の公開フラグ（初期値は常に `false`）     |

#### skill:draft_saved — 固有メタデータ

| フィールド      | 型       | 必須 | 説明                                                          |
| --------------- | -------- | ---- | ------------------------------------------------------------- |
| `draftNumber`   | number   | 必須 | 同一スキルの通算ドラフト保存回数（1始まり）                   |
| `promptLength`  | number   | 必須 | ドラフト保存時点のプロンプト文字数                            |
| `changedFields` | string[] | 必須 | 前回保存からの変更フィールド名一覧（例: `["name","prompt"]`） |
| `autoSaved`     | boolean  | 必須 | 自動保存トリガーか手動保存トリガーかの区別                    |

#### skill:template_applied — 固有メタデータ

| フィールド         | 型               | 必須 | 説明                                                           |
| ------------------ | ---------------- | ---- | -------------------------------------------------------------- |
| `templateId`       | string (UUID v4) | 必須 | 適用したテンプレートのID                                       |
| `templateName`     | string           | 必須 | テンプレート表示名                                             |
| `templateVersion`  | string (semver)  | 必須 | 適用時点のテンプレートバージョン                               |
| `overriddenFields` | string[]         | 必須 | テンプレートのデフォルト値をユーザーが上書きしたフィールド一覧 |

---

### 3-2. 評価イベント（category: `"evaluation"`）

| #   | イベント名            | 説明                                           | 発生元 |
| --- | --------------------- | ---------------------------------------------- | ------ |
| 4   | `skill:evaluated`     | スキルの評価処理が完了した（スコア算出済み）   | `main` |
| 5   | `skill:score_updated` | 既存スコアが更新された（再評価・修正）         | `main` |
| 6   | `skill:gate_passed`   | 評価ゲートを通過した（スコアが閾値以上）       | `main` |
| 7   | `skill:gate_failed`   | 評価ゲートを通過しなかった（スコアが閾値未満） | `main` |

#### skill:evaluated — 固有メタデータ

| フィールド             | 型                                                       | 必須 | 説明                                               |
| ---------------------- | -------------------------------------------------------- | ---- | -------------------------------------------------- |
| `score`                | number (0–100)                                           | 必須 | 評価スコア（整数または小数点以下1桁まで）          |
| `evaluatorModel`       | string                                                   | 必須 | 評価に使用したLLMモデル名。例: `"claude-sonnet-4"` |
| `evaluationDurationMs` | number                                                   | 必須 | 評価処理所要時間（ミリ秒）                         |
| `scoringDimensions`    | `{ dimension: string; score: number; weight: number }[]` | 必須 | 採点ディメンション別スコアと重み                   |
| `promptTokensUsed`     | number                                                   | 必須 | 評価プロセスで消費したプロンプトトークン数         |
| `completionTokensUsed` | number                                                   | 必須 | 評価プロセスで消費した補完トークン数               |
| `evaluationRound`      | number                                                   | 必須 | 同一バージョンの通算評価回数（1始まり）            |

#### skill:score_updated — 固有メタデータ

| フィールド      | 型                                                             | 必須 | 説明                                                               |
| --------------- | -------------------------------------------------------------- | ---- | ------------------------------------------------------------------ |
| `previousScore` | number (0–100)                                                 | 必須 | 更新前のスコア                                                     |
| `newScore`      | number (0–100)                                                 | 必須 | 更新後のスコア                                                     |
| `scoreDelta`    | number                                                         | 必須 | スコア変化量（`newScore - previousScore`）。正値は改善、負値は劣化 |
| `updateReason`  | `"re_evaluation"` \| `"manual_correction"` \| `"model_change"` | 必須 | スコア更新理由                                                     |
| `updatedBy`     | string (UUID v4) \| `"system"`                                 | 必須 | 更新者のユーザーID または `"system"`                               |

#### skill:gate_passed — 固有メタデータ

| フィールド        | 型             | 必須 | 説明                                                                 |
| ----------------- | -------------- | ---- | -------------------------------------------------------------------- |
| `score`           | number (0–100) | 必須 | ゲート通過時点のスコア                                               |
| `thresholdScore`  | number (0–100) | 必須 | 適用された閾値スコア                                                 |
| `gateId`          | string         | 必須 | 通過したゲートの識別子。例: `"publish_gate"`                         |
| `unlockedActions` | string[]       | 必須 | ゲート通過で解放されたアクション一覧。例: `["publish", "recommend"]` |

#### skill:gate_failed — 固有メタデータ

| フィールド              | 型             | 必須 | 説明                                                           |
| ----------------------- | -------------- | ---- | -------------------------------------------------------------- |
| `score`                 | number (0–100) | 必須 | ゲート失敗時点のスコア                                         |
| `thresholdScore`        | number (0–100) | 必須 | 適用された閾値スコア                                           |
| `gateId`                | string         | 必須 | 失敗したゲートの識別子                                         |
| `scoreDeficit`          | number         | 必須 | 閾値との差分（`thresholdScore - score`）。改善目標値として使用 |
| `blockedActions`        | string[]       | 必須 | ゲート失敗でブロックされたアクション一覧                       |
| `suggestedImprovements` | string[]       | 必須 | 評価モデルが提案した改善箇所（最大5件）                        |

---

### 3-3. 実行イベント（category: `"execution"`）

| #   | イベント名                  | 説明                                   | 発生元 |
| --- | --------------------------- | -------------------------------------- | ------ |
| 8   | `skill:executed`            | スキルの実行が開始された               | `main` |
| 9   | `skill:execution_succeeded` | スキルの実行が正常完了した             | `main` |
| 10  | `skill:execution_failed`    | スキルの実行がエラーで終了した         | `main` |
| 11  | `skill:execution_timeout`   | スキルの実行がタイムアウトで中断された | `main` |

#### skill:executed — 固有メタデータ

| フィールド         | 型                                                                   | 必須 | 説明                                                             |
| ------------------ | -------------------------------------------------------------------- | ---- | ---------------------------------------------------------------- |
| `executionId`      | string (UUID v4)                                                     | 必須 | 実行セッション固有ID。完了/失敗イベントのparentEventIdとして使用 |
| `triggerSource`    | `"user_initiated"` \| `"scheduled"` \| `"api"` \| `"recommendation"` | 必須 | 実行トリガー種別                                                 |
| `inputTokenCount`  | number                                                               | 必須 | 実行入力のトークン数（推定値）                                   |
| `executionContext` | `{ chatId: string \| null; taskId: string \| null }`                 | 必須 | 実行が紐づくチャット/タスクのID                                  |
| `modelId`          | string                                                               | 必須 | 実行に使用するLLMモデル名                                        |
| `permissionMode`   | `"default"` \| `"acceptEdits"` \| `"bypassPermissions"` \| `"plan"`  | 必須 | 実行時のパーミッションモード                                     |

#### skill:execution_succeeded — 固有メタデータ

| フィールド             | 型                                                  | 必須 | 説明                                            |
| ---------------------- | --------------------------------------------------- | ---- | ----------------------------------------------- |
| `executionId`          | string                                              | 必須 | 対応する `skill:executed` イベントのexecutionId |
| `durationMs`           | number                                              | 必須 | 実行開始から完了までの所要時間（ミリ秒）        |
| `outputTokenCount`     | number                                              | 必須 | 実行出力のトークン数                            |
| `totalTokenCount`      | number                                              | 必須 | 入力 + 出力の合計トークン数                     |
| `toolCallCount`        | number                                              | 必須 | 実行中に呼び出したツールの総回数                |
| `userSatisfactionHint` | `"positive"` \| `"negative"` \| `"neutral"` \| null | 任意 | 実行後UIで収集した簡易満足度（未収集は `null`） |

#### skill:execution_failed — 固有メタデータ

| フィールド      | 型                                                                                           | 必須 | 説明                                                      |
| --------------- | -------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------- |
| `executionId`   | string                                                                                       | 必須 | 対応する `skill:executed` イベントのexecutionId           |
| `durationMs`    | number                                                                                       | 必須 | 開始から失敗検出までの所要時間（ミリ秒）                  |
| `errorCode`     | string                                                                                       | 必須 | エラーコード。例: `"TOOL_CALL_FAILED"`, `"LLM_API_ERROR"` |
| `errorCategory` | `"validation"` \| `"business"` \| `"external_service"` \| `"infrastructure"` \| `"internal"` | 必須 | エラーカテゴリ（`02-code-quality.md` 準拠）               |
| `errorMessage`  | string                                                                                       | 必須 | サニタイズ済みエラーメッセージ（機密情報を除去）          |
| `retryable`     | boolean                                                                                      | 必須 | リトライ可能かどうか                                      |
| `retryCount`    | number                                                                                       | 必須 | 失敗時点までのリトライ回数（初回失敗は `0`）              |

#### skill:execution_timeout — 固有メタデータ

| フィールド           | 型             | 必須 | 説明                                                              |
| -------------------- | -------------- | ---- | ----------------------------------------------------------------- |
| `executionId`        | string         | 必須 | 対応する `skill:executed` イベントのexecutionId                   |
| `timeoutMs`          | number         | 必須 | 設定されていたタイムアウト時間（ミリ秒）                          |
| `elapsedMs`          | number         | 必須 | タイムアウト検出時点での経過時間（ミリ秒）                        |
| `lastCompletedStep`  | string \| null | 必須 | タイムアウト時点で最後に完了していたステップ名。特定不能は `null` |
| `partialOutputSaved` | boolean        | 必須 | 部分的な出力が保存されたかどうか                                  |

---

### 3-4. 改善イベント（category: `"improvement"`）

| #   | イベント名               | 説明                                             | 発生元              |
| --- | ------------------------ | ------------------------------------------------ | ------------------- |
| 12  | `skill:improved`         | スキルのプロンプト/設定が変更・保存された        | `renderer` / `cli`  |
| 13  | `skill:version_bumped`   | スキルのバージョンが正式に上げられた             | `main` / `cli`      |
| 14  | `skill:feedback_applied` | ユーザーフィードバックがスキルの改善に反映された | `renderer` / `main` |

#### skill:improved — 固有メタデータ

| フィールド           | 型                                                                             | 必須 | 説明                                               |
| -------------------- | ------------------------------------------------------------------------------ | ---- | -------------------------------------------------- |
| `previousVersion`    | string (semver)                                                                | 必須 | 改善前のバージョン                                 |
| `improvementType`    | `"prompt_edit"` \| `"config_change"` \| `"tag_update"` \| `"description_edit"` | 必須 | 改善の種別                                         |
| `changedFields`      | string[]                                                                       | 必須 | 変更されたフィールド名一覧                         |
| `promptDiffLength`   | number                                                                         | 任意 | プロンプト変更の文字数差分（`prompt_edit` 時のみ） |
| `improvementSource`  | `"manual"` \| `"feedback_driven"` \| `"ai_suggested"`                          | 必須 | 改善のきっかけとなった起点                         |
| `relatedFeedbackIds` | string[]                                                                       | 任意 | 改善のもとになったフィードバックイベントIDの一覧   |

#### skill:version_bumped — 固有メタデータ

| フィールド          | 型                                  | 必須 | 説明                                                   |
| ------------------- | ----------------------------------- | ---- | ------------------------------------------------------ |
| `previousVersion`   | string (semver)                     | 必須 | バージョンアップ前のバージョン                         |
| `newVersion`        | string (semver)                     | 必須 | バージョンアップ後のバージョン                         |
| `bumpType`          | `"major"` \| `"minor"` \| `"patch"` | 必須 | セマンティックバージョニングのバンプ種別               |
| `changelogSummary`  | string                              | 必須 | バージョンアップ内容の要約（最大200文字）              |
| `isBreakingChange`  | boolean                             | 必須 | 後方互換性を破る変更かどうか（major bump 判定基準）    |
| `triggeredByUserId` | string (UUID v4) \| `"system"`      | 必須 | バージョンアップを実行したユーザーID または `"system"` |

#### skill:feedback_applied — 固有メタデータ

| フィールド          | 型                                                 | 必須 | 説明                                     |
| ------------------- | -------------------------------------------------- | ---- | ---------------------------------------- |
| `feedbackEventId`   | string (UUID v4)                                   | 必須 | 反映対象のフィードバックイベントID       |
| `feedbackType`      | `"rating"` \| `"text"` \| `"improvement_proposal"` | 必須 | フィードバックの種別                     |
| `appliedChanges`    | `{ field: string; description: string }[]`         | 必須 | フィードバックを受けて変更した内容の一覧 |
| `applicationMethod` | `"direct_apply"` \| `"ai_assisted"` \| `"partial"` | 必須 | フィードバック適用方式                   |
| `scoreBeforeApply`  | number (0–100) \| null                             | 任意 | 適用前の評価スコア（未評価は `null`）    |

---

### 3-5. 再利用イベント（category: `"reuse"`）

| #   | イベント名          | 説明                                                   | 発生元              |
| --- | ------------------- | ------------------------------------------------------ | ------------------- |
| 15  | `skill:reused`      | 既存スキルが再利用された（新規チャット等で再選択）     | `renderer` / `main` |
| 16  | `skill:recommended` | システムがスキルを推薦候補として提示した               | `main`              |
| 17  | `skill:imported`    | 外部ソース（ファイル/URL）からスキルがインポートされた | `renderer` / `cli`  |
| 18  | `skill:forked`      | 既存スキルをベースに新しいスキルが派生作成された       | `renderer` / `cli`  |

> 注: `skill:forked` は `skill:created`（`creationMethod: "fork"`）と対になるイベントであり、元スキルの観点から記録するため独立カテゴリとして定義する。

#### skill:reused — 固有メタデータ

| フィールド         | 型                                                              | 必須 | 説明                                      |
| ------------------ | --------------------------------------------------------------- | ---- | ----------------------------------------- |
| `reuseContext`     | `"chat_init"` \| `"task_start"` \| `"manual_select"` \| `"api"` | 必須 | 再利用が発生したコンテキスト              |
| `previousUseCount` | number                                                          | 必須 | この再利用前までの通算利用回数            |
| `daysSinceLastUse` | number \| null                                                  | 必須 | 前回利用からの経過日数。初回利用は `null` |
| `selectedBy`       | `"user"` \| `"system"` \| `"recommendation"`                    | 必須 | 選択主体（ユーザー手動か推薦経由か）      |
| `sessionId`        | string (UUID v4) \| null                                        | 任意 | 紐づくチャット/タスクセッションID         |

#### skill:recommended — 固有メタデータ

| フィールド                | 型                                                                        | 必須 | 説明                                                            |
| ------------------------- | ------------------------------------------------------------------------- | ---- | --------------------------------------------------------------- |
| `recommendationRank`      | number (1始まり)                                                          | 必須 | 推薦一覧内での順位（1が最上位）                                 |
| `recommendationAlgorithm` | `"usage_frequency"` \| `"score_based"` \| `"collaborative"` \| `"hybrid"` | 必須 | 使用した推薦アルゴリズム                                        |
| `recommendationScore`     | number (0.0–1.0)                                                          | 必須 | 推薦スコア（0.0=最低, 1.0=最高）                                |
| `contextSignals`          | `{ signal: string; value: unknown }[]`                                    | 必須 | 推薦判断に使用したコンテキストシグナル一覧                      |
| `wasAccepted`             | boolean \| null                                                           | 必須 | 推薦がユーザーに受け入れられたか。未確定は `null`（後から更新） |

#### skill:imported — 固有メタデータ

| フィールド           | 型                                                      | 必須 | 説明                                                          |
| -------------------- | ------------------------------------------------------- | ---- | ------------------------------------------------------------- |
| `importSource`       | `"file"` \| `"url"` \| `"clipboard"` \| `"marketplace"` | 必須 | インポート元の種別                                            |
| `importedSkillName`  | string                                                  | 必須 | インポート時のスキル名（変更前）                              |
| `skillFileHash`      | string (SHA-256)                                        | 必須 | インポートしたスキルファイルのSHA-256ハッシュ（重複検出用）   |
| `importedVersion`    | string (semver) \| null                                 | 必須 | インポートしたスキルのバージョン。バージョン情報なしは `null` |
| `validationResult`   | `"passed"` \| `"warning"` \| `"failed"`                 | 必須 | インポート時のバリデーション結果                              |
| `validationMessages` | string[]                                                | 必須 | バリデーション警告/エラーメッセージ一覧（なしは空配列）       |

#### skill:forked — 固有メタデータ

| フィールド        | 型               | 必須 | 説明                                   |
| ----------------- | ---------------- | ---- | -------------------------------------- |
| `sourceSkillId`   | string (UUID v4) | 必須 | フォーク元スキルのID                   |
| `sourceVersion`   | string (semver)  | 必須 | フォーク元のバージョン                 |
| `forkedSkillId`   | string (UUID v4) | 必須 | 新規作成されたフォーク先スキルのID     |
| `forkReason`      | string           | 必須 | フォーク理由の自由記述（最大200文字）  |
| `inheritedFields` | string[]         | 必須 | フォーク元から引き継いだフィールド一覧 |
| `divergedFields`  | string[]         | 必須 | フォーク時点で変更されたフィールド一覧 |

---

## 4. イベント因果関係ルール（parentEventId の使用パターン）

`parentEventId` は、因果関係のある先行イベントのIDを記録する。単発で発生するイベントは `null`。

### パターン A: 実行シーケンス（最重要）

```
skill:executed (parentEventId: null)
  └─ skill:execution_succeeded  (parentEventId: skill:executed.id)
  └─ skill:execution_failed     (parentEventId: skill:executed.id)
  └─ skill:execution_timeout    (parentEventId: skill:executed.id)
```

- 実行完了/失敗/タイムアウトイベントは、開始イベント（`skill:executed`）を親とする
- 各メタデータの `executionId` フィールドと `parentEventId` は同じ先行イベントを指す（二重インデックス）

### パターン B: 評価→ゲート判定

```
skill:evaluated (parentEventId: null)
  └─ skill:gate_passed  (parentEventId: skill:evaluated.id)
  └─ skill:gate_failed  (parentEventId: skill:evaluated.id)
  └─ skill:score_updated (parentEventId: skill:evaluated.id)
```

- ゲート判定は評価処理の直接結果であるため親を持つ
- スコア更新が再評価によって発生した場合も親を持つ

### パターン C: フィードバック→改善適用

```
（フィードバック収集イベント: feedback-collection-spec.md で定義）
  └─ skill:feedback_applied (parentEventId: フィードバックイベント.id)
    └─ skill:improved (parentEventId: skill:feedback_applied.id)
      └─ skill:version_bumped (parentEventId: skill:improved.id)
```

### パターン D: テンプレート/フォーク起源

```
skill:template_applied (parentEventId: null)
  └─ skill:created (parentEventId: skill:template_applied.id)

skill:forked (parentEventId: null / 先行する選択操作のイベントID)
  └─ skill:created (parentEventId: skill:forked.id)
```

### パターン E: 推薦→再利用

```
skill:recommended (parentEventId: null)
  └─ skill:reused (parentEventId: skill:recommended.id)  ← 推薦経由で再利用された場合
```

推薦を経由せず手動選択された `skill:reused` は `parentEventId: null`。

---

## 5. 永続化先の方針

### 二段階永続化アーキテクチャ

```
Renderer (Zustand persist) ←─ 最新N件キャッシュ
      ↑↓ IPC (Main Process)
Main Process ────────────────→ SQLite（全履歴）
```

### Zustand persist（Renderer層）

| 項目           | 仕様                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| 保存対象       | 最新50件のライフサイクルイベント（UIリアルタイム表示用キャッシュ）                 |
| ストレージキー | `"skill-lifecycle-events-cache"`                                                   |
| シリアライズ   | `customStorage`（`arch-state-management.md` の Set型安全シリアライゼーション準拠） |
| 除外フィールド | `metadata.errorMessage`（機密情報除去。`security-principles.md` 準拠）             |
| 更新タイミング | IPC `skill:lifecycle-event` チャンネル受信時に同期的にスライスへ反映               |

### SQLite（Main Process層）

| 項目               | 仕様                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| テーブル名         | `skill_lifecycle_events`                                                   |
| 主キー             | `id` (UUID v4, TEXT)                                                       |
| インデックス       | `(skill_id, timestamp DESC)`, `(event_type)`, `(category, timestamp DESC)` |
| `metadata` 格納    | JSON 文字列としてシリアライズ（`TEXT` カラム）                             |
| 保持期間           | 無制限（将来の公開・互換性判断の基礎データとして削除しない）               |
| パーティション方針 | `skill_id` + 年月でロジカルパーティション（実装は Task08 フェーズで検討）  |

### IPC チャンネル（Main ↔ Renderer）

| チャンネル名                   | 方向            | 説明                                     |
| ------------------------------ | --------------- | ---------------------------------------- |
| `skill:lifecycle-event`        | Main → Renderer | 新規イベント発生時のプッシュ通知         |
| `skill:lifecycle-events:query` | Renderer → Main | 条件付きイベント一覧取得（IPC invoke）   |
| `skill:lifecycle-events:stats` | Renderer → Main | 集計統計取得（実行成功率、平均スコア等） |

---

## 6. イベント一覧サマリー（全17イベント）

| #   | イベント名                  | カテゴリ    | 発生元                |
| --- | --------------------------- | ----------- | --------------------- |
| 1   | `skill:created`             | creation    | main / renderer / cli |
| 2   | `skill:draft_saved`         | creation    | renderer              |
| 3   | `skill:template_applied`    | creation    | renderer / cli        |
| 4   | `skill:evaluated`           | evaluation  | main                  |
| 5   | `skill:score_updated`       | evaluation  | main                  |
| 6   | `skill:gate_passed`         | evaluation  | main                  |
| 7   | `skill:gate_failed`         | evaluation  | main                  |
| 8   | `skill:executed`            | execution   | main                  |
| 9   | `skill:execution_succeeded` | execution   | main                  |
| 10  | `skill:execution_failed`    | execution   | main                  |
| 11  | `skill:execution_timeout`   | execution   | main                  |
| 12  | `skill:improved`            | improvement | renderer / cli        |
| 13  | `skill:version_bumped`      | improvement | main / cli            |
| 14  | `skill:feedback_applied`    | improvement | renderer / main       |
| 15  | `skill:reused`              | reuse       | renderer / main       |
| 16  | `skill:recommended`         | reuse       | main                  |
| 17  | `skill:imported`            | reuse       | renderer / cli        |
| 18  | `skill:forked`              | reuse       | renderer / cli        |

> 注: `skill:forked` は要件定義で指定された17イベントに加え、`skill:created`（`creationMethod: "fork"`）との対称性を確保するため追加定義した。Phase 2 設計レビューで採否を確定する。

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 1 タスク1_
