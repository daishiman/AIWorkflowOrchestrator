# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 12                                           |
| Phase名    | ドキュメント更新                             |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT            |
| 機能名     | sdk-test-enablement                          |
| 前提Phase  | Phase 11 (手動テスト検証)                    |
| 後続Phase  | Phase 13 (PR作成)                            |
| ステータス | 未実施                                       |
| 作成日     | 2026-02-13                                   |
| 関連Issue  | #641                                         |
| 前提タスク | TASK-9B-I-SDK-FORMAL-INTEGRATION（完了済み） |

---

## 目的

実装内容のドキュメント化、システムドキュメント更新、未タスク検出、スキルフィードバック記録を行う。

## 背景

Phase 12 は漏れが最も発生しやすい Phase である。過去のインシデント（P1, P2, P3, P4, P25-P29）を踏まえ、全チェック項目を逐次確認しながら実行する必要がある。

---

## 事前チェック【必須】

Phase 12 実行前に、以下の既知の落とし穴を確認すること:

| Pitfall ID | 内容                                     | 対策                                                                                                    |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| P1 / P25   | LOGS.md 2ファイル更新漏れ                | `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の両方を更新                  |
| P2 / P27   | topic-map.md 再生成忘れ                  | 仕様書に変更があれば必ず `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行 |
| P3 / P38   | 未タスク管理の3ステップ不完全            | 指示書作成 + 残課題テーブル登録 + 関連仕様書リンク追加                                                  |
| P4         | documentation-changelog への早期完了記載 | 全Step確認前に「完了」と記載しない                                                                      |
| P28        | スキルフィードバックレポート未作成       | 改善点がなくても「改善点なし」としてレポートを作成                                                      |
| P29        | SKILL.md 変更履歴の更新漏れ              | LOGS.md だけでなく SKILL.md の変更履歴テーブルも更新                                                    |

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: aiworkflow-requirements【必須】

**パス**: `.claude/skills/aiworkflow-requirements/SKILL.md`

**Trigger条件**:

- システム仕様（references配下）の検索・参照・更新要否判断が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. `indexes/resource-map.md` から今回タスクに必要な仕様を特定する
3. `scripts/search-spec.js` を使って関連仕様書を抽出する
4. Task 2 Step 1/2 の更新要否判定に利用する

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md` に更新要否の判定根拠を記録
- `aiworkflow-requirements` 側の更新対象仕様書一覧（必要時）

### スキル2: skill-creator【必須】

**パス**: `.claude/skills/skill-creator/SKILL.md`

**Trigger条件**:

- スキルフィードバック記録・改善・新規作成が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「record-feedback」タスクに従って実行
3. 改善提案がある場合は「update」、新規スキル化が必要な場合は「create」モードを実行

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`
- 各スキルのLOGS.md更新

---

## 参照資料

| 参照資料         | パス                                                            | 内容                         |
| ---------------- | --------------------------------------------------------------- | ---------------------------- |
| 要件定義書       | `docs/30-workflows/sdk-test-enablement/phase-1-requirements.md` | 要件・スコープ定義           |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                        | 手動テスト実行結果           |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                       | レビュー判定結果             |
| テスト対象1      | `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`  | スキル実行テスト             |
| テスト対象2      | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`    | エージェントクライアント     |
| テスト対象3      | `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | SDK統合テスト                |
| 落とし穴集       | `.claude/rules/06-known-pitfalls.md`                            | Phase 12 関連 P1-P4, P25-P29 |
| タスク実行ルール | `.claude/rules/05-task-execution.md`                            | Phase 12 必須チェックリスト  |

- 依存Phase成果物: `phase-2-design.md`, `phase-5-implementation.md`, `phase-6-test-expansion.md`, `phase-7-coverage-check.md`, `phase-8-refactoring.md`, `phase-9-quality-assurance.md`, `phase-10-final-review.md`, `phase-11-manual-test.md`

---

## 成果物

| 成果物                       | パス                                            | 内容                     |
| ---------------------------- | ----------------------------------------------- | ------------------------ |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | 概念的説明・技術的詳細   |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | 更新したドキュメント一覧 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | 検出された未タスク       |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | スキル実行結果・改善提案 |

---

## 実行タスク

- 実装ガイド作成: 中学生向け概念説明と開発者向け技術詳細を作成する
- システム仕様更新: Step 1-A〜1-D と Step 2 の要否判断・記録を完了する
- 未タスク管理: 0件でも未タスク検出レポートを出力し、検出時は3ステップを完遂する
- フィードバック記録: 使用スキルの結果と改善提案をレポート化する

---

## Phase 12 の5つの必須作業

---

### Task 1: 実装ガイド作成【必須】

実装した内容を「概念的な説明」と「技術的な詳細」の両面からドキュメント化する。

#### Part 1: 概念的説明（中学生レベル）

以下の構成で中学生にもわかる説明を作成する:

| セクション   | 内容                                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 日常の例え話 | 「テストは教科書の練習問題のようなもの。答えが載っていなかった問題（TODO）に答えを書き込む作業」                             |
| なぜ必要か   | 空欄のままだと、プログラムが正しく動いているかわからない。テストという答え合わせがあって初めて「合格」と言える               |
| 何をしたか   | 17問の空欄（TODO）を埋めた。具体的には、認証チェック・エラー処理・タイムアウト制御が正しく動くことを確認する問題を完成させた |

#### Part 2: 開発者向け技術詳細

以下のカテゴリ別に実装パターンを記載する:

| カテゴリ                     | テスト数 | 実装パターン                                                                                                  |
| ---------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| スキル名マッピング・パス検証 | 2        | `mockCreate` の引数検証（`expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({...}))` パターン） |
| タイムアウト制御             | 1        | `vi.advanceTimersByTimeAsync` による30秒タイムアウトシミュレーション                                          |
| エラーハンドリング           | 4        | SDK例外のスロー + `expect(...).rejects.toThrow()` パターン                                                    |
| 認証・リクエスト設定         | 6        | `mockCreate` 設定でAPIキー・Bearer トークン・ヘッダー検証                                                     |
| HTTPエラー・APIエラー        | 3        | HTTPステータス（401, 500）とAPIレベルエラーのシミュレーション                                                 |
| SDK障害・パラメータ検証      | 1        | 無効パラメータによるSDKエラーシミュレーション                                                                 |

**コード例（mockCreate設定パターン）:**

```typescript
// モック戦略: vi.mock でSDKモジュール全体を差し替え
vi.mock("@anthropic-ai/claude-code", () => ({
  claudeCode: {
    create: vi.fn(),
  },
}));

// テスト内でモックの戻り値を設定
mockCreate.mockResolvedValue({
  id: "test-id",
  status: "completed",
  // ...
});
```

**コード例（vi.advanceTimersByTimeAsync活用）:**

```typescript
vi.useFakeTimers();
const promise = executor.execute(params);
await vi.advanceTimersByTimeAsync(30000); // 30秒タイムアウト
await expect(promise).rejects.toThrow("timeout");
vi.useRealTimers();
```

**成果物**: `outputs/phase-12/implementation-guide.md`

---

### Task 2: システムドキュメント更新【必須】

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書にタスク完了記録を追加
  - 対象: SDK統合関連仕様書（`interfaces-agent-sdk.md` 等）
- [ ] `aiworkflow-requirements/LOGS.md` 更新
  - 記録内容: `TASK-FIX-11-1-SDK-TEST-ENABLEMENT` 完了記録
- [ ] `task-specification-creator/LOGS.md` 更新（**2ファイル両方** -- P1/P25対策）
  - 記録内容: 同上
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新（P29対策）
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新（P29対策）

#### Step 1-B: 実装状況テーブル更新

- [ ] `api-endpoints.md` 等の実装ステータス確認
  - **判定**: 本タスクはテスト有効化のみ。API追加・変更なし → 「該当なし」が想定される

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "TASK-FIX-11-1" references/` で関連仕様書を検索
- [ ] `grep -rn "TASK-9B-I" references/` で前提タスクの関連仕様書を検索
- [ ] 検出された仕様書の関連タスクテーブルにステータス更新を記録

#### Step 1-D: topic-map.md 再生成（P2/P27対策）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成
- [ ] `node .claude/skills/task-specification-creator/scripts/generate-index.js` を実行して topic-map.md を再生成
  - **注意**: セクションの追加だけでなく、削除・更新も再生成トリガーに含む。仕様書に変更があれば必ず再生成を実行する

#### Step 2: システム仕様更新（条件付き）

- [ ] 新規インターフェース・アーキテクチャ変更の有無を確認
  - **判定**: 本タスクはテスト有効化のみ。新規インターフェース追加なし → 「該当なし」が想定される
  - ただし、テスト有効化によりSDK統合テストの網羅状況が変わるため、テスト関連仕様書への記録は Step 1-A で実施する

---

### Task 3: ドキュメント更新履歴【必須】

`outputs/phase-12/documentation-changelog.md` を作成し、以下を記録する:

#### 記録要件

- [ ] 更新した全仕様書の変更内容を個別に記録
- [ ] 各Step（1-A, 1-B, 1-C, 1-D, Step 2）の完了結果を明記
  - 「該当なし」の場合もその判定理由を記録する
- [ ] **全Step確認前に「完了」と記載しない**（P4対策）

#### 記録フォーマット

```markdown
## documentation-changelog.md

### Step 1-A: タスク完了記録

- [ ] LOGS.md (aiworkflow-requirements): {{完了/未完了}}
- [ ] LOGS.md (task-specification-creator): {{完了/未完了}}
- [ ] SKILL.md (aiworkflow-requirements): {{完了/未完了}}
- [ ] SKILL.md (task-specification-creator): {{完了/未完了}}
- [ ] 該当仕様書: {{ファイル名}} - {{完了/未完了}}

### Step 1-B: 実装状況テーブル

- 判定: {{該当あり/該当なし}}
- 理由: {{判定理由}}

### Step 1-C: 関連タスクテーブル

- 検索結果: {{件数}}件
- 更新ファイル: {{ファイル名一覧}}

### Step 1-D: topic-map.md 再生成

- 実行結果: {{完了/未完了}}

### Step 2: システム仕様更新

- 判定: {{該当あり/該当なし}}
- 理由: {{判定理由}}
```

**成果物**: `outputs/phase-12/documentation-changelog.md`

---

### Task 4: 未タスク検出【必須、0件でも出力必須】

以下の全ソースから未タスクを検出する:

| ソース                 | 確認項目                      | Grepパターン例                                                             | 必須 |
| ---------------------- | ----------------------------- | -------------------------------------------------------------------------- | ---- |
| 元タスク仕様書         | 「スコープ外」項目            | `phase-1-requirements.md` の「スコープ外」セクション                       | YES  |
| Phase 10レビュー結果   | MINOR判定の指摘事項           | `outputs/phase-10/final-review-result.md`                                  | YES  |
| Phase 11手動テスト結果 | スコープ外の発見事項          | `outputs/phase-11/manual-test-result.md`                                   | YES  |
| 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`                                 | YES  |
| コードベース           | TODO/FIXME/HACK/XXX コメント  | `grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/slide/__tests__/` | YES  |
| 使用スキルのLOGS.md    | partial/failure記録           | 各使用スキルのLOGS.md                                                      | YES  |

#### 検出した未タスクの処理（P3/P38対策）

検出した未タスクは**3ステップ全て**を完了すること:

1. **指示書作成**: `unassigned-task/` ディレクトリに指示書を作成（`tasks/` 直下ではない -- P38対策）
2. **残課題テーブル登録**: `task-workflow.md` の残課題テーブルに登録
3. **関連仕様書リンク追加**: 関連する仕様書に参照リンクを追加

#### 未タスク品質基準（Why/What/How）

| カテゴリ | 項目                       | 基準                                         |
| -------- | -------------------------- | -------------------------------------------- |
| Why      | 背景が明確                 | このタスクが必要になった経緯が説明されている |
| Why      | 問題点が具体的             | 現状の問題が定量的/定性的に説明されている    |
| What     | 目的が具体的               | 達成すべきことが一意に解釈できる             |
| What     | スコープが明確             | 含む/含まないが明記されている                |
| How      | 使用スキルが選定されている | タスクに適したスキルが選定されている         |
| How      | 完了条件が検証可能         | チェックリスト形式で確認可能                 |

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

---

### Task 5: スキルフィードバックレポート【必須】

ワークフロー全体（Phase 1-11）で使用したスキルの実行結果を評価し、改善点を記録する。

#### 評価基準

| 評価    | 基準                                           |
| ------- | ---------------------------------------------- |
| success | スキルの指示通りに実行し、期待通りの成果を得た |
| partial | 実行できたが、一部期待と異なる結果があった     |
| failure | スキルの指示が不明確で実行できなかった         |

#### 記録内容

- [ ] 各Phase で使用したスキルの評価記録
- [ ] ワークフロー改善点の識別
- [ ] 技術的教訓の記録
- [ ] スキル改善提案（改善点がない場合は「改善点なし」と明記 -- P28対策）

**成果物**: `outputs/phase-12/skill-feedback-report.md`

---

## 漏れやすいポイント一覧

| ID     | ポイント                         | 対策                                                                                                |
| ------ | -------------------------------- | --------------------------------------------------------------------------------------------------- |
| P1/P25 | LOGS.md 両ファイル更新           | `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の両方                    |
| P2/P27 | topic-map.md 再生成              | 仕様書変更があれば必ず `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` 実行 |
| P3/P38 | 未タスク3ステップ                | 指示書(`unassigned-task/`配下) + 残課題テーブル + 関連仕様書リンク                                  |
| P4     | documentation-changelog 早期完了 | 全Step確認前に「完了」と記載しない                                                                  |
| P28    | スキルフィードバック未作成       | 改善点なしでもレポートは必須作成                                                                    |
| P29    | SKILL.md 変更履歴更新漏れ        | LOGS.md と合わせて SKILL.md の変更履歴テーブルも更新                                                |

---

## 完了条件

- [ ] **Task 1**: 実装ガイド（Part 1: 概念的説明 + Part 2: 技術的詳細）が作成されている
- [ ] **Task 2 Step 1-A**: タスク完了記録が全ファイルに記録されている（LOGS.md x2, SKILL.md x2, 該当仕様書）
- [ ] **Task 2 Step 1-B**: 実装状況テーブルの更新判定が完了している
- [ ] **Task 2 Step 1-C**: 関連タスクテーブルの検索・更新が完了している
- [ ] **Task 2 Step 1-D**: topic-map.md の再生成が完了している
- [ ] **Task 2 Step 2**: システム仕様更新の判定が完了している
- [ ] **Task 3**: documentation-changelog.md に全Stepの完了結果が個別に記録されている
- [ ] **Task 4**: 未タスク検出レポートが作成されている（0件でも必須）
- [ ] **Task 4**: 検出された未タスクの3ステップが全て完了している（該当する場合）
- [ ] **Task 5**: スキルフィードバックレポートが作成されている
- [ ] **本Phase内の全作業を100%完了**

---

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 本タスクでの適用判断                                      | 仕様参照先                                                                                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | APIキー・認証情報・エラー表示を扱うため適用               | `.claude/skills/aiworkflow-requirements/references/security-principles.md`, `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                      |
| インターフェース   | SkillExecutor と Agent SDK の接続仕様確認が必要なため適用 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`                                                                             |
| エラーハンドリング | timeout/API key not configured/SDK failure を扱うため適用 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                                                                                                         |
| テスト品質         | TODO有効化・回帰防止・カバレッジ判定が必要なため適用      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` |
| タスク運用         | 未タスク発生時の記録・追跡が必要なため適用                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                                                                          |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成して進捗管理する。

1. 参照資料の確認
2. 実行タスクの実施（各タスクごと）
3. 統合テスト連携の実施（Phase 1-11）
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] `artifacts.json` が更新されている
- [ ] Phase末端アクションで完了を明記している

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスク（Task 1-5）を100%完了し、完了を明記
- [ ] スキルフィードバックが skill-creator で記録されている
- [ ] スキル改善/新規作成の判定が完了している

---

## 依存関係

- **前提**: Phase 5, 8, 9, 10, 11 が完了していること
- **後続**: Phase 13 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 使用スキル

| スキル                  | 結果                        | 備考     |
| ----------------------- | --------------------------- | -------- |
| aiworkflow-requirements | {{success/partial/failure}} | {{備考}} |
| skill-creator           | {{success/partial/failure}} | {{備考}} |

### 成果物

- 実装ガイド: {{作成/未作成}}
- ドキュメント更新履歴: {{作成/未作成}}
- 未タスク検出レポート: {{作成/未作成}}
- スキルフィードバックレポート: {{作成/未作成}}
- システム仕様更新: {{実施/不要}}

### Task 2 各Step完了状況

- Step 1-A タスク完了記録: {{完了/未完了}}
- Step 1-B 実装状況テーブル: {{完了/該当なし}}
- Step 1-C 関連タスクテーブル: {{完了/未完了}}
- Step 1-D topic-map.md再生成: {{完了/未完了}}
- Step 2 システム仕様更新: {{完了/該当なし}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/sdk-test-enablement/phase-13-pr-creation.md`
