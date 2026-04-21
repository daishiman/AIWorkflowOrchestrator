# Phase 12: ドキュメント更新 -- OpenAICompatibleAdapter 統一アーキテクチャ実装

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase番号  | 12                        |
| 機能名     | openai-compatible-adapter |
| タスクID   | TASK-LLM-MOD-06           |
| 作成日     | 2026-03-23                |
| 依存 Phase | Phase 11（手動テスト）    |

## 目的

TASK-LLM-MOD-06 の実装完了を受け、実装ガイド・システム仕様書・ログを更新し、未タスクを検出・記録する。全 Step の実行後に documentation-changelog.md を作成する（P4 対策: 全 Step 完了前に「完了」と記載しない）。

## 実行タスク

### Task 12-1: 実装ガイド作成

#### Part 1: 中学生レベル概念説明

`outputs/phase-12/implementation-guide.md` に Part 1 として以下を記述する。

---

**USB アダプターの話 -- 1 つの汎用アダプターで複数のデバイスを接続する**

パソコンに周辺機器をつなぐとき、「USB-C アダプター」1 つあれば、HDMI モニターも、SD カードリーダーも、有線 LAN ケーブルも、全部同じアダプター経由で接続できますよね。

AI チャットアプリでも、同じことが起きていました。OpenAI、xAI、OpenRouter という 3 つの AI サービスは、実は「ほぼ同じ電話番号の書式」（API の形式）を使っていました。でも今までは、サービスごとに「専用の電話帳」（個別アダプター）を作っていました。OpenAI 用の電話帳、xAI 用の電話帳... 中身はほとんど同じなのに。

今回やったことは、USB-C アダプターのように「1 つの汎用電話帳」を作ったことです。この電話帳は「どこに電話するか」（API の住所）と「特別な合言葉」（追加ヘッダー）だけが違います。

具体的には:

- OpenAI: `https://api.openai.com/v1` に電話する。合言葉なし
- xAI: `https://api.x.ai/v1` に電話する。合言葉なし
- OpenRouter: `https://openrouter.ai/api/v1` に電話する。「うちのアプリ名は AIWorkflowOrchestrator です」という合言葉付き

新しい AI サービスを追加するときも、電話帳に 5 行書き足すだけで OK です。もう専用の電話帳を丸ごと 1 冊作る必要はありません。

---

#### Part 2: 開発者向け技術詳細

`outputs/phase-12/implementation-guide.md` に Part 2 として以下を記述する。

---

**変更ファイル**:

| ファイル                                                        | 変更種別 | 行数 |
| --------------------------------------------------------------- | -------- | ---- |
| `apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts` | 新規     | 243  |
| `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`       | 更新     | 169  |
| `apps/desktop/src/main/adapters/llm/index.ts`                   | 更新     | 28   |

**アーキテクチャ変更**:

1. `OpenAICompatibleAdapter` クラスを新規作成
   - `BaseLLMAdapter` を継承
   - コンストラクタで `OpenAICompatibleProviderConfig`（providerId, defaultBaseUrl, extraHeaders?）を受け取る
   - `sendChat`: POST /chat/completions（非ストリーミング）
   - `streamChat`: POST /chat/completions（SSE ストリーミング）
   - `checkHealth`: GET /models（リトライなし）
   - `formatMessages`: systemPrompt + messages を OpenAI 形式に変換

2. `LLMAdapterFactory` を設定駆動化
   - `OPENAI_COMPATIBLE_CONFIGS` マップで OpenAI / xAI / OpenRouter の 3 プロバイダーを一括定義
   - コンストラクタ内のループ登録で個別の `this.register()` コールを排除
   - `xAIAdapter` の個別登録を `OpenAICompatibleAdapter` 経由に置換

3. 新規プロバイダー追加手順（設定 5 行）:
   ```typescript
   // OPENAI_COMPATIBLE_CONFIGS に追加するだけ
   newProvider: {
     providerId: "new-provider",
     defaultBaseUrl: "https://api.new-provider.com/v1",
     extraHeaders: { "X-Custom": "value" }, // 不要なら省略
   },
   ```

**設計判断**:

- 旧 `OpenAIAdapter.ts` / `xAIAdapter.ts` は本タスクでは削除しない（共存を許容）
- `ILLMAdapter` インターフェースへの変更なし（後方互換性を維持）
- `extraHeaders` をオプショナルにすることで、追加ヘッダー不要なプロバイダーとの共存を実現

---

### Task 12-2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

以下の 2 ファイルを更新する（P25 対策: 2 ファイル同時更新）:

1. `.claude/skills/aiworkflow-requirements/LOGS.md` に以下を追記:

   ```
   ## 2026-03-23 TASK-LLM-MOD-06 完了
   - OpenAICompatibleAdapter 統一アーキテクチャ実装
   - OpenAI/xAI/OpenRouter を設定駆動で統一
   - LLMAdapterFactory を OPENAI_COMPATIBLE_CONFIGS マップで設定駆動化
   ```

2. `.claude/skills/task-specification-creator/LOGS.md` に以下を追記:
   ```
   ## 2026-03-23 TASK-LLM-MOD-06 Phase 1-13 仕様書作成完了
   - docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/ 配下に14ファイル作成
   ```

#### Step 1-B: 実装状況テーブル更新

`.claude/skills/aiworkflow-requirements/references/` 配下の LLM アダプター関連仕様書を確認し、実装ステータステーブルが存在する場合は更新する。

確認ファイル:

- `references/arch-llm-adapter.md`（存在する場合）
- `references/interfaces-llm-adapter.md`（存在する場合）

#### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "TASK-LLM-MOD-06" .claude/skills/aiworkflow-requirements/references/
```

マッチするファイルがある場合、TASK-LLM-MOD-06 のステータスを「完了」に更新する。

#### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

### Task 12-3: documentation-changelog.md 作成

**注意**: このファイルは Task 12-1 から Task 12-4 の全 Step を実行した後に作成する（P4 対策）。

`outputs/phase-12/documentation-changelog.md` に以下を記録する:

```markdown
# Documentation Changelog -- TASK-LLM-MOD-06

## 作成日: 2026-03-23

## Task 12-1: 実装ガイド

- [x] implementation-guide.md Part 1（中学生レベル概念説明: USB アダプターのアナロジー）作成
- [x] implementation-guide.md Part 2（開発者向け技術詳細）作成

## Task 12-2: システム仕様書更新

### Step 1-A: タスク完了記録

- [x] aiworkflow-requirements/LOGS.md 更新
- [x] task-specification-creator/LOGS.md 更新

### Step 1-B: 実装状況テーブル

- [x] 対象ファイル確認済み（更新対象の有無を記録）

### Step 1-C: 関連タスクテーブル

- [x] grep で関連仕様書を確認済み（更新対象の有無を記録）

### Step 1-D: topic-map.md 再生成

- [x] generate-index.js を実行済み
- 実行ログ:（実行結果を貼付）

## Task 12-3: documentation-changelog.md

- [x] 全 Step 完了後に本ファイルを作成（P4 遵守）

## Task 12-4: 未タスク検出

- [x] unassigned-task-report.md を作成済み
- 検出件数:（実際の件数を記録）
```

### Task 12-4: 未タスク検出

#### Step 4-1: 未タスク検出の実施

以下の観点で未タスクを検出する:

| 検出観点                                | 内容                                                                                     |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| U-01 の後続作業                         | 旧 OpenAIAdapter / xAIAdapter の削除                                                     |
| U-02 の後続作業                         | OPENAI_COMPATIBLE_CONFIGS キーの型安全化（string -> LLMProviderId）                      |
| OpenRouter extraHeaders のテスト拡充    | 実際の HTTP リクエストで extraHeaders が送信されることの統合テスト                       |
| BaseLLMAdapter の fetchWithRetry モック | OpenAICompatibleAdapter の単体テストで BaseLLMAdapter の内部を直接モックする手法の標準化 |

#### Step 4-2: unassigned-task-report.md の作成

`outputs/phase-12/unassigned-task-report.md` を作成する。検出した未タスクが 0 件の場合も「0 件」として作成する（P3 対策）。

#### Step 4-3: 未タスク指示書の作成（0 件超の場合）

検出した未タスクがある場合、以下の 3 ステップを全て実施する（P3 / P38 対策）:

1. `docs/30-workflows/llm-provider-model-modernization/tasks/unassigned-task/` 配下に指示書ファイルを作成
2. `docs/30-workflows/llm-provider-model-modernization/tasks/` 内の task-workflow 相当ファイルの残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

## 参照資料

| 資料名                  | パス                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase 11 手動テスト結果 | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/outputs/phase-11/manual-test-results.md` |
| タスク実行ルール        | `.claude/rules/05-task-execution.md`（Phase 12 必須チェックリスト）                                                                              |
| 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md`（P1-P4, P25, P43, P51, P58, P59 対策）                                                                      |

## 成果物

| 成果物                        | パス                                                                                                                                                 | 形式     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 実装ガイド（Part 1 + Part 2） | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/outputs/phase-12/implementation-guide.md`    | Markdown |
| documentation-changelog       | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/outputs/phase-12/documentation-changelog.md` | Markdown |
| 未タスク検出レポート          | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/outputs/phase-12/unassigned-task-report.md`  | Markdown |

## 完了条件

- [ ] implementation-guide.md の Part 1（中学生レベル概念説明: USB アダプターのアナロジー）を作成した
- [ ] implementation-guide.md の Part 2（開発者向け技術詳細）を作成した
- [ ] aiworkflow-requirements/LOGS.md を更新した
- [ ] task-specification-creator/LOGS.md を更新した（2 ファイル両方）
- [ ] 関連仕様書を grep で確認し、更新要否を判断した
- [ ] topic-map.md を generate-index.js で再生成した
- [ ] unassigned-task-report.md を作成した（0 件でも作成）
- [ ] 未タスクがある場合は 3 ステップ（指示書・残課題テーブル・参照リンク）を全て完了した
- [ ] documentation-changelog.md を全 Task 完了後に作成した（P4 対策）

## 次の Phase

Phase 13: 完了（`phase-13-completion.md`）
