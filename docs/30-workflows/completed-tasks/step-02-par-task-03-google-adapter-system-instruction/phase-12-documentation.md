# Phase 12: ドキュメント更新 - GoogleAdapter system_instruction 対応

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 12                                |
| 機能名   | google-adapter-system-instruction |
| 作成日   | 2026-03-23                        |
| タスクID | TASK-LLM-MOD-03                   |
| 依存     | phase-11-manual-testing.md        |

## 目的

実装完了後のドキュメントを整備し、実装ガイド・システム仕様書更新・未タスク検出を行う。

## 事前チェック【必須】

本Phase開始前に以下を確認:

- [ ] Phase 11 の完了条件が全て満たされている
- [ ] Phase 10 の判定結果が PASS または MINOR（対応済み）である

## 実行タスク

### テーブル形式

| タスク    | 名称                         | 成果物パス                                       |
| --------- | ---------------------------- | ------------------------------------------------ |
| Task 12-1 | 実装ガイド作成               | `outputs/phase-12/implementation-guide.md`       |
| Task 12-2 | システム仕様書更新           | `outputs/phase-12/system-spec-update-summary.md` |
| Task 12-3 | ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`    |
| Task 12-4 | 未タスク検出                 | `outputs/phase-12/unassigned-task-detection.md`  |
| Task 12-5 | スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`      |

### 箇条書き形式

- Task 12-1: 実装ガイド作成（Part 1: 中学生レベル概念説明、Part 2: 開発者向け技術詳細）
- Task 12-2: システム仕様書更新（spec-update-workflow.md 準拠）
- Task 12-3: ドキュメント更新履歴（全 Step 完了後に記録。P4対策）
- Task 12-4: 未タスク検出（0件でも記録必須。P3/P38の3ステップ完了）
- Task 12-5: スキルフィードバックレポート（改善点なしでもレポート作成。P28対策）

## 参照資料

| 資料名           | パス                                                  | 内容                                      |
| ---------------- | ----------------------------------------------------- | ----------------------------------------- |
| タスク実行ルール | `.claude/rules/05-task-execution.md`                  | Phase 12 必須チェックリスト               |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                  | P1〜P4・P25〜P28（Phase 12 インシデント） |
| 仕様書更新手順   | `task-specification-creator: spec-update-workflow.md` | Step 1-A〜Step 3 の詳細手順               |
| PR作成コマンド   | `task-specification-creator: commands.md`             | `/ai:diff-to-pr` の使用方法               |

## 実行手順

### Task 12-1: 実装ガイド作成

本タスクの変更内容を2つのパートで説明する。

---

#### Part 1: 中学生レベルの概念説明

**タイトル**: Gemini AI に「役割」を正しく伝える方法

**日常例えで理解する「system_instruction」**

お父さんやお母さんが新しいアルバイトの人に「あなたはカフェの接客係です。お客様には丁寧な言葉遣いで対応してください」と最初に説明する、これが `system_instruction` の役割です。

**変更前の問題点**

AIWorkflowOrchestrator で Google の Gemini AI を使うとき、今まではこんな感じで会話していました:

```
[ユーザー役 / "ねえ、あなたは丁寧な口調のアシスタントね、よろしく"] <- システム指示をこっそり混ぜていた
[ユーザー役 / "今日の天気は？"]
```

これは「受付の人がカウンターに近づいてきたお客さんに、こっそりカンペを見せながら演技させる」ようなもので、本来の会話の流れとは違います。

**変更後の正しい方法**

Gemini API には専用の「役割指示フォーム」（`system_instruction`）があります。これを使うと:

```
[システム役割指示 / "あなたは丁寧な口調のアシスタントです"]  <- 専用フォームで指示
[ユーザー役 / "今日の天気は？"]  <- 純粋な会話だけ
```

受付の人にあらかじめ「マニュアル」を渡しておくイメージです。会話の中に変な割り込みが入らなくなります。

**APIバージョンの変更（v1 -> v1beta）**

Gemini API には「安定版（v1）」と「ベータ版（v1beta）」があります。`system_instruction` という新しい機能は「v1beta」で確実に使えるため、接続先を v1beta に変更しました。v1beta は「新機能を試す開発者向けバージョン」と思ってください。

---

#### Part 2: 開発者向け技術詳細

**変更ファイル**: `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`

**変更概要**:

1. `constructor` の `baseUrl` デフォルト値を `v1` から `v1beta` に変更した
2. `formatContents` メソッドから `systemPrompt` の `user` ロール挿入ロジックを削除した
3. `buildRequestBody` プライベートメソッドを新規追加した
4. `sendChat` / `streamChat` のリクエストボディ構築を `buildRequestBody` に委譲した

**buildRequestBody の設計**:

```typescript
private buildRequestBody(request: LLMChatRequestInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    contents: this.formatContents(request),
    generationConfig: {
      temperature: request.temperature,
      maxOutputTokens: request.maxTokens,
    },
  };
  if (request.systemPrompt?.trim()) {
    body.system_instruction = {
      parts: [{ text: request.systemPrompt }],
    };
  }
  return body;
}
```

- 戻り値型 `Record<string, unknown>`: `system_instruction` フィールドが条件付きのため、Union 型の複雑な定義を避けた
- `system_instruction` は `request.systemPrompt` が truthy（非空文字列）の場合のみ追加される
- `sendChat` と `streamChat` の両方で `JSON.stringify(this.buildRequestBody(request))` を使用する

**テストへの影響**:

- MSW モック URL を全件 `v1` -> `v1beta` に更新
- `"should prepend systemPrompt as user message"` を削除し `"should send systemPrompt as system_instruction field"` に置換
- 新規テスト 5 件追加（`ADP-012-SI-01`〜`ADP-012-SI-03`、`ADP-STREAM-SI-01`、`T6-01`〜`T6-03`）

**Gemini API の system_instruction 仕様** (参照: `research/google-models.md`):

```json
{
  "system_instruction": {
    "parts": [{ "text": "システムプロンプトの内容" }]
  },
  "contents": [{ "role": "user", "parts": [{ "text": "ユーザーメッセージ" }] }],
  "generationConfig": { "temperature": 0.7, "maxOutputTokens": 4096 }
}
```

**成果物**: `outputs/phase-12/implementation-guide.md`

---

### Task 12-2: システム仕様書更新

#### Step 1-A: タスク完了記録

**対象仕様書を特定する**:

```bash
# GoogleAdapter に関連する仕様書を検索
grep -rn "GoogleAdapter\|system_instruction\|TASK-LLM-MOD-03" \
  .claude/skills/aiworkflow-requirements/references/ | grep -v ".json" | head -20
```

**更新対象仕様書** (検索結果に応じて記録):

- `LOGS.md` (`aiworkflow-requirements/`)
- `LOGS.md` (`task-specification-creator/`)
- `SKILL.md` (`aiworkflow-requirements/`) - 変更履歴
- `SKILL.md` (`task-specification-creator/`) - 変更履歴
- LLM アダプター関連の仕様書（存在する場合）

#### Step 1-B: 実装状況テーブル更新

LLM アダプターの実装ステータステーブルが仕様書に存在する場合は更新する:

- `GoogleAdapter` の `system_instruction` 対応: 未実装 -> 実装済み
- `baseUrl`: `v1` -> `v1beta`

#### Step 1-C: 関連タスクテーブルの確認

```bash
grep -rn "TASK-LLM-MOD-03" .claude/skills/aiworkflow-requirements/references/
```

関連タスクテーブルに `TASK-LLM-MOD-03` の完了ステータスを記録する。

#### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

#### Step 2: システム仕様の更新（新規インターフェースが存在する場合）

`buildRequestBody` は `private` メソッドのためインターフェース変更なし。仕様書への追記は不要。

#### Step 3: IPC 契約検証（IPC 修正なしのため省略）

本タスクは IPC ハンドラーを変更しないため、IPC 契約チェックリストの実施は不要。

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

---

### Task 12-3: documentation-changelog.md の更新

**注意**: 全 Step 完了後に記録する（P4 対策: 実行前に「完了」と記載しない）。

`documentation-changelog.md` に以下を追記する（存在しない場合は新規作成する）:

```markdown
## TASK-LLM-MOD-03: GoogleAdapter system_instruction 対応（2026-03-23）

### 変更ファイル

- `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`
- `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts`

### 変更内容

- `baseUrl` デフォルト値を `v1beta` に変更
- `formatContents` から systemPrompt 挿入ロジックを削除
- `buildRequestBody` メソッドを追加
- `sendChat` / `streamChat` を `buildRequestBody` に委譲
- 既存テストの MSW モック URL を `v1beta` に更新
- 新規テスト 5 件追加

### ドキュメント更新

- Step 1-A: LOGS.md 2ファイル更新
- Step 1-B: 実装ステータステーブル更新
- Step 1-C: 関連タスクテーブル更新
- Step 1-D: topic-map.md 再生成
- Phase 12 実装ガイド (Part1/Part2) 作成
```

**成果物**: `outputs/phase-12/documentation-changelog.md`

---

### Task 12-4: 未タスク検出

本タスクで発見した改善点を未タスクとして登録する。

| 検出事項                                                                        | タスクID候補          | 優先度 | 対応                                              |
| ------------------------------------------------------------------------------- | --------------------- | ------ | ------------------------------------------------- |
| `buildRequestBody` 戻り値型の厳密化（`GeminiRequestBody` 型定義）               | UT-LLM-MOD-03-TYPE-01 | 低     | `docs/30-workflows/unassigned-task/` に指示書作成 |
| `GeminiGenerateContentResponse` の `usageMetadata` フィールドの optional 化検討 | UT-LLM-MOD-03-TYPE-02 | 低     | 同上                                              |

**未タスク 0 件の場合**: 0 件であることを明示して完了とする。

**未タスク配置先**: `docs/30-workflows/unassigned-task/` に指示書を作成（P38対策: `tasks/` 直下ではなく `unassigned-task/` 配下に配置）

**未タスク管理の 3 ステップ** (P3 対策):

1. `docs/30-workflows/unassigned-task/` に指示書ファイル作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書（本ファイル `phase-12-documentation.md`）に参照リンク追加

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

---

### Task 12-5: スキルフィードバックレポート

本タスク実行を通じて発見したスキル改善点を記録する。

**確認項目**:

- Phase テンプレートの過不足
- ワークフロー上のボトルネック
- ドキュメント品質基準の妥当性

**改善点がない場合**: 「改善点なし」として skill-feedback-report.md を作成する（P28対策: レポート未作成を許容しない）。

**成果物**: `outputs/phase-12/skill-feedback-report.md`

## 漏れやすいポイント

Phase 12 は漏れが最も発生しやすい Phase。以下を特に注意:

- LOGS.md は2箇所（aiworkflow-requirements / task-specification-creator）の**両方**を更新する（P1/P25対策）
- topic-map.md はセクション追加だけでなく削除・更新時も再生成する（P2/P27対策）
- 未タスクは3ステップ全完了: (1)指示書作成 -> (2)task-workflow残課題テーブル登録 -> (3)関連仕様書リンク追加（P3対策）
- documentation-changelog には全Step完了**後**に記録する（P4対策: 実行前に「完了」と書かない）

## フォールバック手順

サブエージェントが rate limit で中断した場合（P43対策）:

1. `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認
2. 未完了の Step を特定して手動完了
3. LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする

## 苦戦箇所の記録【推奨】

Phase 12 実行中に困難を感じた箇所を記録し、次回以降のタスクに活かす。

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点           | 適用判断                           | 仕様参照先                                   |
| -------------- | ---------------------------------- | -------------------------------------------- |
| セキュリティ   | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計        | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |

## 成果物

| 成果物               | パス                                             | 説明                                 |
| -------------------- | ------------------------------------------------ | ------------------------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`       | Part1（日常例え）・Part2（技術詳細） |
| 仕様書更新サマリー   | `outputs/phase-12/system-spec-update-summary.md` | Step 1-A〜Step 3 の実行結果          |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`    | 変更ファイル・Step完了結果           |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`  | 検出件数・対応記録                   |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`      | スキル改善提案または「改善点なし」   |

## 完了条件

- [ ] 実装ガイド Part 1（中学生レベル、日常例えを使用）が作成されている
- [ ] 実装ガイド Part 2（開発者向け技術詳細）が作成されている
- [ ] `aiworkflow-requirements/LOGS.md` が更新されている
- [ ] `task-specification-creator/LOGS.md` が更新されている（**2ファイル両方**: P1・P25対策）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴が更新されている
- [ ] `task-specification-creator/SKILL.md` の変更履歴が更新されている
- [ ] `topic-map.md` が再生成されている（P2・P27対策）
- [ ] `documentation-changelog.md` に全 Step 完了後に記録されている（P4対策）
- [ ] 未タスク検出を実施している（0 件でも記録する）
- [ ] 未タスクが存在する場合は P3 の 3 ステップが全て完了している
- [ ] スキルフィードバックレポートが作成されている（P28対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 13: 完了
