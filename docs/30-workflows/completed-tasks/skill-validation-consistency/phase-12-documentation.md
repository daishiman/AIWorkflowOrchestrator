# Phase 12: ドキュメント — skill:ハンドラP42準拠バリデーション形式統一

> **最重要Phase**: Phase 12 は漏れが最も発生しやすい Phase。全チェックリスト項目を逐次確認すること。
> **苦戦防止**: P1/P2/P3/P4/P25/P28/P43 の落とし穴を事前に確認すること。

## メタ情報

| 項目               | 内容                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| タスクID           | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001                                            |
| タスク名           | skill:ハンドラP42準拠バリデーション形式統一                                        |
| Phase              | 12                                                                                 |
| 名称               | ドキュメント                                                                       |
| 分類               | セキュリティ                                                                       |
| 規模               | 小規模                                                                             |
| Issue              | #874                                                                               |
| 前提Phase          | Phase 11（手動テスト — 全シナリオ PASS）                                           |
| 次Phase            | Phase 13（PR作成）                                                                 |
| ステータス         | completed                                                                          |
| 成果物ディレクトリ | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-12/` |

## 目的

実装ガイド・システム仕様書更新・documentation-changelog・未タスク検出の4タスクを実行し、skillHandlers.ts の P42 準拠バリデーション形式統一の実装内容をドキュメントに反映する。全タスク完了後に本 Phase を完了とする。

---

## 実行タスク

- 実装ガイド作成: Part 1/2構成で利用者別に記述する。
- 仕様同期更新: 参照仕様・LOGS/SKILL/topic-mapを更新する。
- 変更履歴作成: documentation-changelogを生成する。
- 未タスク監査: 0件でもunassigned-task-reportを出力する。

| Task | 名称                    | 概要                                                                   |
| ---- | ----------------------- | ---------------------------------------------------------------------- |
| 1    | 実装ガイド作成          | Part 1（中学生レベル概念説明）+ Part 2（開発者向け実装詳細）を作成する |
| 2    | システム仕様書更新      | タスク完了記録・LOGS.md・SKILL.md・topic-map.md等を更新する            |
| 3    | documentation-changelog | 更新した全仕様書の変更内容を記録する                                   |
| 4    | 未タスク検出            | unassigned-task-report.md を作成する（0件でも必須）                    |

## 参照資料

| 資料                                              | パス / リンク                                                                                            |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Phase 11 手動テスト                               | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-11-manual-test.md`                 |
| Phase 11 手動テスト結果                           | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-11/manual-test-summary.md` |
| Phase 10 最終レビュー結果                         | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-10/final-review-result.md` |
| Phase 3 設計レビュー結果                          | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-3/design-review-result.md` |
| Phase 1 要件定義                                  | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-1-requirements.md`                 |
| Phase 2 設計                                      | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-2-design.md`                       |
| Phase 5 実装                                      | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-5-implementation.md`               |
| Phase 6 テスト拡充                                | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-6-test-expansion.md`               |
| Phase 7 カバレッジ確認                            | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-7-coverage-check.md`               |
| Phase 8 リファクタリング                          | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-8-refactoring.md`                  |
| Phase 9 品質検証                                  | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-9-quality-assurance.md`            |
| タスク実行ワークフロー（Phase 12 チェックリスト） | `.claude/rules/05-task-execution.md#Phase 12 必須チェックリスト`                                         |
| 既知の落とし穴（P1, P2, P3, P4, P25, P28, P43）   | `.claude/rules/06-known-pitfalls.md`                                                                     |
| 仕様書更新ワークフロー                            | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`                              |
| Phase 11/12 実行ガイド                            | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                              |
| security-skill-ipc.md                             | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                |
| security-api-electron.md                          | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                             |
| interfaces-agent-sdk-skill.md                     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                        |
| ipc-contract-checklist.md                         | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                            |
| api-ipc-agent.md                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                     |
| error-handling.md                                 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                    |

---

## aiworkflow-requirements 抽出要件の文書更新反映

| 要件ID | 出典仕様                        | 文書更新で反映する内容                                               | 本Phaseでの反映先       |
| ------ | ------------------------------- | -------------------------------------------------------------------- | ----------------------- |
| D12-1  | `security-skill-ipc.md`         | P42準拠3段バリデーションが全11ハンドラに適用完了した旨を完了記録する | Task 2 Step 1-A         |
| D12-2  | `security-api-electron.md`      | IPCセキュリティ原則準拠のバリデーション統一が完了した旨を記録する    | Task 2 Step 1-A, Task 3 |
| D12-3  | `interfaces-agent-sdk-skill.md` | 6ハンドラのバリデーションパターンを「P42準拠」に更新する             | Task 2 Step 1-B         |
| D12-4  | `ipc-contract-checklist.md`     | P42パターン適用完了タスクとして記録する                              | Task 2 Step 1-C         |
| D12-5  | `api-ipc-agent.md`              | skill系IPCチャネルの契約差分がないことを記録する                     | Task 2 Step 1-B/1-C     |
| D12-6  | `error-handling.md`             | Validation Error分類と実装メッセージ方針の整合を記録する             | Task 2 Step 1-A, Task 3 |

---

## Task 1: 実装ガイド作成

### 成果物

`docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-12/implementation-guide.md`

---

### Part 1: 中学生レベル概念説明

> 専門用語を使わず、日常的なたとえでP42準拠バリデーションの仕組みを説明する。

#### タイトル例

「お店の入口の警備員さんが『入場券を3回チェック』する仕組み」

#### 説明する概念

| 概念                   | 日常のたとえ                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| IPCハンドラ            | **お店の受付カウンター**（お客さんから注文を受け付ける場所。注文内容が正しいか最初にチェックする）             |
| バリデーション         | **入場券チェック**（チケットを持っているか確認する作業。偽チケットや白紙のチケットを弾く）                     |
| 3段バリデーション      | **3回チェックの仕組み**: (1)チケットが本物の紙か？→ (2)白紙ではないか？→ (3)スペースだけで埋められていないか？ |
| throw形式エラー        | **入場拒否の宣言**（「このチケットは無効です！」と大きな声でハッキリ宣言して入場を止める）                     |
| return形式エラー（旧） | **小さなメモで拒否**（小さなメモに「ダメ」と書いて渡すだけ。見落としやすい）                                   |
| バリデーション統一     | **全カウンターで同じチェックリストを使う**（6つの受付カウンターが同じ手順でチケットをチェックする）            |

#### セクション構成

1. なぜバリデーション（確認作業）が必要なの？
2. 「スペースだけの名前」が問題になる理由 — 過去に空白だけの入力で問題が起きた（P42の教訓）
3. 3段階チェックの仕組み（図解付き）
   - (1)チケットが紙か確認（型チェック）
   - (2)白紙でないか確認（空文字列チェック）
   - (3)スペースだけで埋められていないか確認（トリムチェック）
4. 「大きな声で宣言」vs「小さなメモ」の違い（throw vs return）
5. 全ハンドラで同じルールにする理由 — 正面入口だけチェックして裏口はノーチェックでは意味がない
6. まとめ

#### 記述ルール

- 専門用語は使わない（使う場合は即座にカッコ書きで説明）
- 図や表を活用して視覚的に説明
- 読者が「なぜそうするのか」を理解できるように動機を先に説明する

---

### Part 2: 開発者向け技術詳細

#### 2.1 P42準拠3段バリデーション標準パターン

```typescript
// P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
// value.trim() === "" は value === "" を内包するため、2条件で3段チェックを達成
if (typeof value !== "string" || value.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: `${paramName} must be a non-empty string`,
  };
}
```

**設計判断:**

- `value.trim() === ""` は空文字列 `""` を内包するため、別途 `value === ""` チェックは不要
- `typeof` チェックは `null` / `undefined` / 数値型を全て拒否
- throw 形式は safeInvoke の Error ハンドリングと整合
- return 形式ではなく throw 形式を選択した理由: safeInvoke は throw されたエラーを Promise の reject として Renderer に返す。return 形式では呼び出し元が返り値の構造を個別に判定する必要があるが、throw 形式なら catch 一箇所でエラーハンドリングが完結する

#### 2.2 修正対象6ハンドラの修正前後比較

| ハンドラ           | 引数パターン   | パラメータ名  | 修正前エラー形式                                                   | 修正後エラー形式                                                                        |
| ------------------ | -------------- | ------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `skill:get-detail` | オブジェクト型 | `skillId`     | `return { success: false, error: "skillId must be a string" }`     | `throw { code: "VALIDATION_ERROR", message: "skillId must be a non-empty string" }`     |
| `skill:execute`    | オブジェクト型 | `skillId`     | `return { success: false, error: "skillId must be a string" }`     | `throw { code: "VALIDATION_ERROR", message: "skillId must be a non-empty string" }`     |
| `skill:abort`      | 直接引数型     | `executionId` | `return false`                                                     | `throw { code: "VALIDATION_ERROR", message: "executionId must be a non-empty string" }` |
| `skill:get-status` | 直接引数型     | `executionId` | `return null`                                                      | `throw { code: "VALIDATION_ERROR", message: "executionId must be a non-empty string" }` |
| `skill:analyze`    | オブジェクト型 | `skillName`   | `return { success: false, error: "スキル名が指定されていません" }` | `throw { code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }`   |
| `skill:improve`    | オブジェクト型 | `skillName`   | `return { success: false, error: "スキル名が指定されていません" }` | `throw { code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }`   |

#### 2.3 引数アクセスパターンの分類

**オブジェクト型（4ハンドラ: skill:get-detail, skill:execute, skill:analyze, skill:improve）:**

```typescript
ipcMain.handle("skill:xxx", async (_event, args) => {
  const value = args?.paramName;
  if (typeof value !== "string" || value.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "paramName must be a non-empty string",
    };
  }
  // 正常処理...
});
```

**直接引数型（2ハンドラ: skill:abort, skill:get-status）:**

```typescript
ipcMain.handle("skill:xxx", async (_event, executionId) => {
  if (typeof executionId !== "string" || executionId.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "executionId must be a non-empty string",
    };
  }
  // 正常処理...
});
```

#### 2.4 バリデーション対象入力パターン

| 入力           | typeof             | trim()         | 期待結果         |
| -------------- | ------------------ | -------------- | ---------------- |
| `"validSkill"` | `"string"` PASS    | `"validSkill"` | 正常処理         |
| `""`           | `"string"` PASS    | `""` FAIL      | VALIDATION_ERROR |
| `"   "`        | `"string"` PASS    | `""` FAIL      | VALIDATION_ERROR |
| `null`         | `"object"` FAIL    | -              | VALIDATION_ERROR |
| `undefined`    | `"undefined"` FAIL | -              | VALIDATION_ERROR |
| `123`          | `"number"` FAIL    | -              | VALIDATION_ERROR |

#### 2.5 テストパターン

```typescript
describe("P42準拠バリデーションテスト", () => {
  it("空文字列を VALIDATION_ERROR で拒否する", async () => {
    await expect(handler("")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  it("スペースのみ文字列を VALIDATION_ERROR で拒否する", async () => {
    await expect(handler("   ")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  it("非文字列（数値）を VALIDATION_ERROR で拒否する", async () => {
    await expect(handler(123)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });
});
```

#### 2.6 既知の落とし穴と本タスクでの適用

| Pitfall | タイトル                   | 本タスクでの適用                                                                            |
| ------- | -------------------------- | ------------------------------------------------------------------------------------------- |
| P42     | trim()バリデーション漏れ   | 全6ハンドラに `.trim() === ""` チェックを追加                                               |
| P44     | IPC インターフェース不整合 | skill:import/remove の修正パターンを踏襲し、同一のバリデーション形式を適用                  |
| P45     | 引数命名の契約ドリフト     | 引数名の修正は本タスクスコープ外（別タスク UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001 で対応） |

#### 2.7 修正対象ファイル

| ファイル                                                               | 修正内容                             |
| ---------------------------------------------------------------------- | ------------------------------------ |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                           | 6ハンドラのバリデーション修正        |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`            | 既存テストのthrow形式対応            |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.validation.test.ts` | バリデーション専用テスト（新規作成） |

---

## Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

> **P43 対策**: 仕様書更新は3ファイル以下/バッチに分割する。LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする。

### Step 1-A: タスク完了記録

以下のファイルにタスク完了記録を追加する:

| #   | ファイル                                             | 追加内容                                            |
| --- | ---------------------------------------------------- | --------------------------------------------------- |
| 1   | `security-skill-ipc.md`                              | P42準拠3段バリデーション全11ハンドラ適用完了の記録  |
| 2   | `security-api-electron.md`                           | IPCセキュリティ原則準拠バリデーション統一完了の記録 |
| 3   | `.claude/skills/aiworkflow-requirements/LOGS.md`     | タスク完了ログ追加                                  |
| 4   | `.claude/skills/task-specification-creator/LOGS.md`  | タスク完了ログ追加（**P1/P25対策: 2ファイル両方**） |
| 5   | `.claude/skills/aiworkflow-requirements/SKILL.md`    | 変更履歴テーブルに追記（**P29対策**）               |
| 6   | `.claude/skills/task-specification-creator/SKILL.md` | 変更履歴テーブルに追記（**P29対策**）               |

#### バッチ分割計画（P43対策）

| バッチ | 対象ファイル                                                              | ファイル数 |
| ------ | ------------------------------------------------------------------------- | ---------- |
| 1      | `security-skill-ipc.md`, `security-api-electron.md`                       | 2          |
| 2      | `aiworkflow-requirements/LOGS.md`, `task-specification-creator/LOGS.md`   | 2          |
| 3      | `aiworkflow-requirements/SKILL.md`, `task-specification-creator/SKILL.md` | 2          |

#### LOGS.md 更新フォーマット

```markdown
### UT-FIX-SKILL-VALIDATION-CONSISTENCY-001

- **日付**: 2026-02-24
- **ステータス**: 完了
- **概要**: skillHandlers.ts 6ハンドラにP42準拠3段バリデーションとthrow形式エラーレスポンスを適用し、全11ハンドラのバリデーション形式を統一
- **成果物**: apps/desktop/src/main/ipc/skillHandlers.ts（バリデーション修正）、skillHandlers.validation.test.ts（新規テスト）
- **Issue**: #874
```

#### SKILL.md 変更履歴フォーマット

```markdown
| 2026-02-24 | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 | skill:ハンドラP42準拠バリデーション形式統一 | security-skill-ipc.md, security-api-electron.md, interfaces-agent-sdk-skill.md |
```

#### P1/P25/P29 対策チェック

- [ ] `aiworkflow-requirements/LOGS.md` を更新した
- [ ] `task-specification-creator/LOGS.md` を更新した
- [ ] 2ファイル両方の LOGS.md 更新を確認した（P1/P25）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴を更新した
- [ ] `task-specification-creator/SKILL.md` の変更履歴を更新した
- [ ] 2ファイル両方の SKILL.md 更新を確認した（P29）

### Step 1-B: 実装状況テーブル更新

本タスクに該当する実装状況テーブルを確認する。

| ファイル                        | 該当する場合の更新内容                                                      | 更新要否 |
| ------------------------------- | --------------------------------------------------------------------------- | -------- |
| `api-endpoints.md`              | 該当なし（API エンドポイントの変更なし）                                    | 不要     |
| `interfaces-agent-sdk-skill.md` | 6ハンドラのバリデーション状況テーブルを「未対応」→「P42準拠」に更新         | **必要** |
| `security-skill-ipc.md`         | バリデーション実装ステータステーブルがある場合、全ハンドラ「P42準拠」に更新 | 条件付き |

### Step 1-C: 関連タスクテーブル更新

以下のコマンドで関連仕様書を検索し、該当箇所を更新する:

```bash
grep -rn "UT-FIX-SKILL-VALIDATION-CONSISTENCY-001" .claude/skills/aiworkflow-requirements/references/
grep -rn "UT-FIX-SKILL-VALIDATION-CONSISTENCY-001" .claude/skills/task-specification-creator/references/
grep -rn "UT-FIX-SKILL-VALIDATION-CONSISTENCY-001" docs/30-workflows/
```

追加で以下のコマンドも実行し、P42 パターン関連の仕様書を特定する:

```bash
grep -rn "P42" .claude/skills/*/references/ | grep -i "validation\|バリデーション"
```

検索結果に基づき実施する作業:

- [ ] 検索で発見された全仕様書のタスク参照テーブルでステータスを「完了」に更新
- [ ] `task-workflow.md` の残課題テーブルに完了記録を追加

### Step 1-D: topic-map.md 再生成

> **P2/P27 対策**: セクションの追加・更新・削除があれば必ず再生成する。仕様書に変更があれば必ず再生成を実行する。

以下の2コマンドを順に実行する:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

```bash
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/skill-validation-consistency --regenerate
```

#### P2/P27 対策チェック

- [ ] aiworkflow-requirements の topic-map.md を再生成した
- [ ] task-specification-creator の topic-map.md を再生成した
- [ ] 生成結果を確認した（エラーなし）

### Step 2: システム仕様更新

本タスクで新規インターフェースやアーキテクチャ変更が発生した場合のみ対応する。

| 確認項目                 | 判定     | 対応                                                                                            |
| ------------------------ | -------- | ----------------------------------------------------------------------------------------------- |
| 新規インターフェース追加 | 該当なし | バリデーション修正のみでインターフェース変更なし                                                |
| アーキテクチャ変更       | 該当なし | 既存ハンドラのバリデーション形式統一のみ                                                        |
| IPC チャンネル変更       | 該当なし | IPC チャンネルの追加・削除・名称変更なし                                                        |
| 仕様書セクション更新     | **必要** | `security-skill-ipc.md` と `interfaces-agent-sdk-skill.md` のバリデーション関連セクションを更新 |

> `security-skill-ipc.md` と `interfaces-agent-sdk-skill.md` のバリデーション関連セクションを更新する。`api-ipc-agent.md` / `security-electron-ipc.md` は skill ハンドラに関するセクションが存在する場合のみ更新し、存在しない場合は「該当セクションなし — 更新不要」と記録する。

### Step 3: IPC 契約検証

本タスクは IPC ハンドラのバリデーション修正タスクであるため、IPC 契約チェックリストの該当項目を検証する。

| チェック項目                                      | 検証内容                                                                     | 確認  |
| ------------------------------------------------- | ---------------------------------------------------------------------------- | ----- |
| ハンドラ引数形式とPreload側の呼び出し形式が一致   | 6ハンドラの引数形式が Preload の safeInvoke 呼び出しと一致していること       | - [ ] |
| 引数名のセマンティクスが実際の値と一致（P45対策） | `skillId` / `executionId` / `skillName` の命名が渡される値と一致していること | - [ ] |
| P42準拠3段バリデーション                          | `typeof !== "string" \|\| .trim() === ""` が全6ハンドラに適用されていること  | - [ ] |

> **注意**: 本タスクでは引数名の変更は行わない（引数名修正は UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001 で対応）。現行の引数名がPreload側の渡す値と一致していることの確認のみ実施する。

---

## Task 3: documentation-changelog.md

### 成果物

`docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-12/documentation-changelog.md`

### 記載ルール

> **P4 対策**: 全 Step の確認・記録が完了するまで「完了」と記載しない。

| ルール# | 内容                                                                 |
| ------- | -------------------------------------------------------------------- |
| 1       | 更新した全仕様書の変更内容を1ファイルずつ記録する                    |
| 2       | 各 Step の完了結果を詳細に記録する（「該当なし」も明示記録）         |
| 3       | Step 1-A から Step 3 まで全て記録してから「Phase 12 完了」を記載する |
| 4       | LOGS.md の2ファイル更新を個別に記録する                              |
| 5       | SKILL.md の2ファイル更新を個別に記録する                             |
| 6       | topic-map.md の再生成結果を記録する                                  |

### フォーマット

```markdown
## documentation-changelog

### Task 1: 実装ガイド

| #   | 成果物 | 内容                                   | ステータス |
| --- | ------ | -------------------------------------- | ---------- |
| 1   | Part 1 | 中学生レベル概念説明（入場券のたとえ） | ✅ / ❌    |
| 2   | Part 2 | 開発者向け実装詳細                     | ✅ / ❌    |

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

| #   | ファイル                            | 更新内容                         | ステータス |
| --- | ----------------------------------- | -------------------------------- | ---------- |
| 1   | security-skill-ipc.md               | P42準拠全ハンドラ適用完了記録    | ✅ / ❌    |
| 2   | security-api-electron.md            | IPCバリデーション統一完了記録    | ✅ / ❌    |
| 3   | aiworkflow-requirements/LOGS.md     | タスク完了ログ追加               | ✅ / ❌    |
| 4   | task-specification-creator/LOGS.md  | タスク完了ログ追加（P1/P25対策） | ✅ / ❌    |
| 5   | aiworkflow-requirements/SKILL.md    | 変更履歴更新（P29対策）          | ✅ / ❌    |
| 6   | task-specification-creator/SKILL.md | 変更履歴更新（P29対策）          | ✅ / ❌    |

#### Step 1-B: 実装状況テーブル

| #   | ファイル                      | 更新内容                         | ステータス    |
| --- | ----------------------------- | -------------------------------- | ------------- |
| 1   | interfaces-agent-sdk-skill.md | バリデーション状況テーブル更新   | ✅ / 該当なし |
| 2   | security-skill-ipc.md         | バリデーション実装ステータス更新 | ✅ / 該当なし |

#### Step 1-C: 関連タスクテーブル

- grep 実行結果: （結果を記載）
- 更新したファイル数: X 件
- task-workflow.md 更新: ✅ / ❌

#### Step 1-D: topic-map.md 再生成

| #   | スキル                     | 実行コマンド                     | 結果    |
| --- | -------------------------- | -------------------------------- | ------- |
| 1   | aiworkflow-requirements    | `node .../generate-index.js`     | ✅ / ❌ |
| 2   | task-specification-creator | `node .../generate-index.js ...` | ✅ / ❌ |

#### Step 2: システム仕様更新

| #   | ファイル                      | 更新内容                         | ステータス    |
| --- | ----------------------------- | -------------------------------- | ------------- |
| 1   | security-skill-ipc.md         | バリデーション関連セクション更新 | ✅ / 該当なし |
| 2   | interfaces-agent-sdk-skill.md | バリデーションパターン更新       | ✅ / 該当なし |
| 3   | api-ipc-agent.md              | 該当セクション確認               | ✅ / 該当なし |
| 4   | security-electron-ipc.md      | 該当セクション確認               | ✅ / 該当なし |

#### Step 3: IPC 契約検証

- ハンドラ引数形式: Preload側と一致確認 ✅ / ❌
- 引数名セマンティクス: 確認 ✅ / ❌（引数名修正は別タスク）
- P42準拠バリデーション: 全6ハンドラ適用確認 ✅ / ❌

### 全 Step 完了確認

- [ ] Step 1-A: 6ファイル全て更新完了
- [ ] Step 1-B: 確認完了
- [ ] Step 1-C: grep 実行・更新完了
- [ ] Step 1-D: 2スキルの topic-map.md 再生成完了
- [ ] Step 2: 仕様書更新完了（または該当なし確認）
- [ ] Step 3: IPC 契約検証完了

→ 全 Step 完了を確認した上で **Phase 12 Task 3 完了**
```

---

## Task 4: 未タスク検出

### 成果物

`docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-12/unassigned-task-report.md`

### 検出手順

#### Step 1: 自動検出スクリプトの実行

```bash
node scripts/detect-unassigned-tasks.js --scan apps/desktop/src/main/ipc --output .tmp/unassigned-candidates.json
```

#### Step 2: 手動検出ソース確認

| #   | 検出ソース                       | 検出方法                                                                   |
| --- | -------------------------------- | -------------------------------------------------------------------------- |
| 1   | Phase 3 設計レビュー MINOR 指摘  | `outputs/phase-3/design-review-result.md` から MINOR 指摘を全て抽出する    |
| 2   | Phase 10 最終レビュー MINOR 指摘 | `outputs/phase-10/final-review-result.md` から MINOR 指摘を全て抽出する    |
| 3   | Phase 11 手動テスト Minor 問題   | `outputs/phase-11/manual-test-summary.md` から Minor 問題を全て抽出する    |
| 4   | 実装中の TODO/FIXME              | `grep -rn "TODO\|FIXME" apps/desktop/src/main/ipc/skillHandlers.ts` で検索 |
| 5   | 関連タスクの発見                 | 本タスクのスコープ外だが関連するタスク                                     |
| 6   | 自動検出スクリプト結果           | `.tmp/unassigned-candidates.json` の内容を確認                             |

#### Step 3: 既知の関連タスク確認

Phase 1 で定義したスコープ外事項を再確認し、未タスク化の漏れがないか確認する:

| スコープ外事項                         | 対応タスク                                | 未タスク化状況 |
| -------------------------------------- | ----------------------------------------- | -------------- |
| レスポンス形式の統一（成功時の戻り値） | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 | 確認 - [ ]     |
| 引数名の修正（skillId→skillName等）    | UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001   | 確認 - [ ]     |

### 未タスク処理の3ステップ（P3/P38 対策）

検出した未タスクは以下の3ステップを**全て**完了する:

| ステップ | 内容                                                    | 確認  |
| -------- | ------------------------------------------------------- | ----- |
| 1        | `docs/30-workflows/unassigned-task/` に指示書を作成する | - [ ] |
| 2        | `task-workflow.md` の残課題テーブルに登録する           | - [ ] |
| 3        | 関連仕様書に参照リンクを追加する                        | - [ ] |

> **P38 対策**: 未タスク指示書は `docs/30-workflows/unassigned-task/` 直下に配置する。`tasks/` 直下に配置しない。

### 未タスクレポートのフォーマット

```markdown
## 未タスク検出レポート

### 検出結果

| #   | 未タスク名             | 検出ソース     | 重要度 | 指示書パス                    |
| --- | ---------------------- | -------------- | ------ | ----------------------------- |
| 1   | （検出した場合に記載） | Phase 10 MINOR | 中     | `unassigned-task/task-xxx.md` |
| -   | 検出なし               | -              | -      | -                             |

### 3ステップ完了確認

| 未タスク# | ステップ1（指示書） | ステップ2（残課題テーブル） | ステップ3（参照リンク） |
| --------- | ------------------- | --------------------------- | ----------------------- |
| （記入）  | ✅ / ❌             | ✅ / ❌                     | ✅ / ❌                 |

### 件数

- 検出数: X 件
- 未タスク仕様書作成数: X 件
- 0件の場合もこのレポートは作成する（**省略不可**）
```

### 未タスク検出対象チェックリスト

- [ ] Phase 3 レビューレポートの MINOR 指摘を全て確認した
- [ ] Phase 10 レビューレポートの MINOR 指摘を全て確認した
- [ ] Phase 11 手動テストの Minor 問題を全て確認した
- [ ] `grep -rn "TODO\|FIXME"` でコードベースを確認した
- [ ] 自動検出スクリプトの結果を確認した
- [ ] Phase 1 のスコープ外事項の未タスク化状況を確認した
- [ ] `unassigned-task-detection.md` の件数・ステータスを更新した
- [ ] `artifacts.json` の Phase 12 ステータスを更新した

---

## Phase 12 苦戦防止Tips

> 過去のインシデントから学んだ教訓を事前確認する。

### 事前空欄チェックリスト作成

Phase 12 開始前に、以下のチェックリストを手元に用意する。各項目を完了したら即座にチェックを入れ、最後に全項目がチェック済みであることを確認する:

**LOGS.md / SKILL.md 4ファイル更新チェック（最重要）:**

- [ ] `aiworkflow-requirements/LOGS.md` — 更新済み
- [ ] `task-specification-creator/LOGS.md` — 更新済み
- [ ] `aiworkflow-requirements/SKILL.md` — 変更履歴更新済み
- [ ] `task-specification-creator/SKILL.md` — 変更履歴更新済み

**topic-map.md 再生成チェック:**

- [ ] aiworkflow-requirements の topic-map.md — 再生成済み
- [ ] task-specification-creator の topic-map.md — 再生成済み

**完了記載チェック:**

- [ ] documentation-changelog.md — 全Step記録後に「完了」記載（P4対策）
- [ ] unassigned-task-report.md — 0件でも作成済み

### Pitfall 対策一覧

| Pitfall | 内容                                 | 対策                                                                    |
| ------- | ------------------------------------ | ----------------------------------------------------------------------- |
| P1/P25  | LOGS.md 2ファイル更新漏れ            | aiworkflow-requirements と task-specification-creator の**2箇所**を更新 |
| P2/P27  | topic-map.md 再生成忘れ              | セクション追加・更新・削除時に必ず再生成                                |
| P3/P38  | 未タスク管理の3ステップ不完全        | ①指示書 → ②残課題テーブル → ③関連仕様書リンク                           |
| P4      | documentation-changelog 早期「完了」 | 全Step記録後に「完了」記載                                              |
| P25     | LOGS.md 2ファイル再発                | P1 と同じ対策（明示的に2ファイル確認）                                  |
| P28     | スキルフィードバックレポート未作成   | 改善点の有無を検討し記録する                                            |
| P29     | SKILL.md 変更履歴の更新漏れ          | LOGS.md だけでなく SKILL.md の変更履歴も2ファイル更新                   |
| P43     | サブエージェントの rate limit 中断   | 仕様書更新は3ファイル以下/バッチに分割                                  |

---

## よくある漏れパターン（詳細対策）

### P1/P25: LOGS.md 2ファイル更新漏れ

**問題**: LOGS.md は `aiworkflow-requirements` と `task-specification-creator` の2箇所に存在する。片方の更新を忘れやすい。

**対策手順**:

1. `aiworkflow-requirements/LOGS.md` を開いてタスク完了ログを追加する
2. 追加した内容をコピーする
3. `task-specification-creator/LOGS.md` を開いて同じ内容を追加する
4. 2ファイルの差分を確認し、同じ内容であることを検証する

### P2/P27: topic-map.md 再生成忘れ

**問題**: 仕様書のセクション追加・更新・削除があっても、topic-map.md の再生成を忘れるとインデックスが古いまま残る。

**対策手順**:

1. 仕様書に1つでも変更があれば、必ず2つのスクリプトを実行する
2. 実行後、生成されたファイルのタイムスタンプを確認する
3. エラーが出力されていないことを確認する

### P3/P38: 未タスク管理の3ステップ不完全

**問題**: 指示書作成だけで完了と思い込み、残課題テーブルへの登録や関連仕様書へのリンク追加を忘れる。

**対策手順**:

1. `docs/30-workflows/unassigned-task/` に指示書を作成する（`tasks/` 直下に配置しない！ P38対策）
2. `task-workflow.md` の残課題テーブルに行を追加する
3. 関連仕様書（本タスクの場合 `security-skill-ipc.md` 等）に参照リンクを追加する

### P4: documentation-changelog への早期「完了」記載

**問題**: 全 Step 完了前に「Phase 12 完了」と書くと、後続 Step の漏れに気付けない。

**対策手順**:

1. documentation-changelog には各 Step の結果を1つずつ記録する
2. 「該当なし」の場合も明示的に「該当なし」と記録する（空欄にしない）
3. 全 Step の記録が完了した**後に初めて**「Phase 12 完了」を記載する

### P43: サブエージェントの rate limit 中断

**問題**: 仕様書更新を1つのバッチで大量に実行すると rate limit に到達する。

**対策手順**:

1. 仕様書更新は3ファイル以下/バッチに分割する（本タスクではバッチ1〜3に分割済み）
2. LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする
3. 中断が発生した場合、`git diff --stat -- .claude/skills/` で実際の変更ファイルを確認する

---

## 統合テスト連携

### Renderer 側への影響確認

throw 形式への変更により、Renderer 側の safeInvoke エラーハンドリングが正常に動作することを Phase 11 手動テストで確認済みであること。documentation-changelog にその結果を記録する。

### IPC 契約整合性

Task 2 Step 3 の IPC 契約検証で、Preload 側の呼び出し形式とハンドラ側の引数形式が一致していることを確認済みであること。

### 既存テスト回帰

Phase 9 品質検証で全テストが PASS していること。Phase 12 のドキュメント更新でコードファイルを変更していないことを確認する。

---

## 多角的チェック観点

| 観点             | 確認事項                                                                            |
| ---------------- | ----------------------------------------------------------------------------------- |
| ドキュメント品質 | 実装ガイドの Part 1 が日常的なたとえを使い、専門用語なしで理解可能か                |
| ドキュメント品質 | 実装ガイドの Part 2 が全6ハンドラの修正内容・入力パターン・コード例を網羅しているか |
| 仕様書整合性     | LOGS.md / SKILL.md の2ファイル x 2スキル = 4ファイルが全て更新されているか          |
| 仕様書整合性     | topic-map.md が2スキル分再生成されているか                                          |
| 完全性           | documentation-changelog に全 Step の結果が記録されているか                          |
| 完全性           | unassigned-task-report.md が作成されているか（0件でも）                             |
| セキュリティ     | IPC 契約検証（Step 3）が実施されているか                                            |
| 漏れ防止         | P1/P2/P3/P4/P25/P28/P29/P38/P43 の全対策が実施されているか                          |

---

## 実行手順

1. **Task 1**: 実装ガイドを作成する
   - Part 1（中学生レベル概念説明）を作成する — 「入場券チェック」のたとえを使用
   - Part 2（開発者向け実装詳細）を作成する — 全6ハンドラの修正内容、コード例、入力パターンを記載
   - 成果物パス: `outputs/phase-12/implementation-guide.md`
2. **Task 2**: システム仕様書を更新する
   - Step 1-A: タスク完了記録を6ファイルに追加する（3ファイル以下/バッチで分割）
     - バッチ1: `security-skill-ipc.md`, `security-api-electron.md`
     - バッチ2: `aiworkflow-requirements/LOGS.md`, `task-specification-creator/LOGS.md`
     - バッチ3: `aiworkflow-requirements/SKILL.md`, `task-specification-creator/SKILL.md`
   - Step 1-B: `interfaces-agent-sdk-skill.md` のバリデーション状況テーブルを更新する
   - Step 1-C: `grep -rn "UT-FIX-SKILL-VALIDATION-CONSISTENCY-001" .claude/skills/*/references/` で関連仕様書を検索・更新する
   - Step 1-D: topic-map.md を2スキル分再生成する
   - Step 2: `security-skill-ipc.md` と `interfaces-agent-sdk-skill.md` のバリデーション関連セクションを更新する
   - Step 3: IPC 契約検証を実施する（バリデーション修正タスクのため必須）
3. **Task 3**: documentation-changelog.md を作成する
   - 全 Step の完了結果を記録する
   - 全 Step 完了を確認してから「Phase 12 完了」を記載する（P4対策）
   - 成果物パス: `outputs/phase-12/documentation-changelog.md`
4. **Task 4**: 未タスク検出を実施する
   - 自動検出スクリプトを実行する: `node scripts/detect-unassigned-tasks.js --scan apps/desktop/src/main/ipc --output .tmp/unassigned-candidates.json`
   - Phase 3/10 MINOR 指摘と Phase 11 Minor 問題を確認する
   - 未タスクが存在する場合、3ステップを全て完了する（P3/P38対策）
   - `unassigned-task-report.md` を作成する（0件でも必須）
   - 成果物パス: `outputs/phase-12/unassigned-task-report.md`
5. `artifacts.json` の Phase 12 ステータスを `completed` に更新する（**全タスク完了後に実行 — P4/P43対策**）

---

## 成果物

| #   | 成果物                         | パス                                                                                                         |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 1   | 実装ガイド                     | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-12/implementation-guide.md`    |
| 2   | documentation-changelog        | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-12/documentation-changelog.md` |
| 3   | 未タスクレポート               | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-12/unassigned-task-report.md`  |
| 4   | 更新済み仕様書（複数）         | `.claude/skills/aiworkflow-requirements/references/` 配下                                                    |
| 5   | 更新済み LOGS.md（2ファイル）  | `.claude/skills/aiworkflow-requirements/LOGS.md`, `.claude/skills/task-specification-creator/LOGS.md`        |
| 6   | 更新済み SKILL.md（2ファイル） | `.claude/skills/aiworkflow-requirements/SKILL.md`, `.claude/skills/task-specification-creator/SKILL.md`      |
| 7   | 再生成済み topic-map.md        | 各スキルディレクトリの `topic-map.md`                                                                        |

---

## 完了条件チェックリスト

- [ ] Phase 12内のTask 1〜4を完了する

### Task 1: 実装ガイド

- [ ] Part 1（中学生レベル概念説明）が日常的なたとえ（入場券チェック）を使って記述されている
- [ ] Part 1 で専門用語を使っていない（使用時はカッコ書き説明あり）
- [ ] Part 2（開発者向け実装詳細）に全6ハンドラの修正前後比較が記載されている
- [ ] Part 2 に P42 準拠3段バリデーション標準パターンのコード例が記載されている
- [ ] Part 2 に引数アクセスパターン（オブジェクト型 / 直接引数型）の分類が記載されている
- [ ] Part 2 にバリデーション対象入力パターン表が記載されている
- [ ] Part 2 にテストパターンのコード例が記載されている
- [ ] Part 2 に P42/P44/P45 の既知の落とし穴と本タスクでの適用が記載されている

### Task 2: システム仕様書更新

- [ ] Step 1-A: `security-skill-ipc.md` にタスク完了記録を追加した
- [ ] Step 1-A: `security-api-electron.md` にタスク完了記録を追加した
- [ ] Step 1-A: `aiworkflow-requirements/LOGS.md` を更新した
- [ ] Step 1-A: `task-specification-creator/LOGS.md` を更新した（**P1/P25対策**）
- [ ] Step 1-A: `aiworkflow-requirements/SKILL.md` の変更履歴を更新した（**P29対策**）
- [ ] Step 1-A: `task-specification-creator/SKILL.md` の変更履歴を更新した（**P29対策**）
- [ ] Step 1-B: `interfaces-agent-sdk-skill.md` のバリデーション状況テーブルを更新した
- [ ] Step 1-C: `grep -rn` で関連仕様書を検索し、該当箇所を更新した
- [ ] Step 1-C: `task-workflow.md` の残課題テーブルに完了記録を追加した
- [ ] Step 1-D: aiworkflow-requirements の topic-map.md を再生成した（**P2/P27対策**）
- [ ] Step 1-D: task-specification-creator の topic-map.md を再生成した（**P2/P27対策**）
- [ ] Step 2: `security-skill-ipc.md` のバリデーション関連セクションを更新した（または「該当なし」の判断記録あり）
- [ ] Step 2: `interfaces-agent-sdk-skill.md` のバリデーションパターンを更新した（または「該当なし」の判断記録あり）
- [ ] Step 3: IPC 契約検証を実施し、結果を記録した

### Task 3: documentation-changelog

- [ ] 更新した全仕様書の変更内容が記録されている
- [ ] 各 Step の完了結果が詳細に記録されている（「該当なし」も含む）
- [ ] 全 Step 確認後に「Phase 12 完了」が記載されている（P4対策）

### Task 4: 未タスク検出

- [ ] 自動検出スクリプトの実行結果を確認した
- [ ] `unassigned-task-report.md` が作成されている（0件でも必須）
- [ ] Phase 3/10 MINOR 指摘が全て未タスク仕様書に変換されている
- [ ] Phase 11 Minor 問題が全て未タスク仕様書に変換されている
- [ ] 未タスクが存在する場合、3ステップ（指示書・残課題テーブル・参照リンク）が全て完了している（P3/P38対策）
- [ ] `unassigned-task-detection.md` の件数・ステータスを更新した
- [ ] `artifacts.json` の Phase 12 ステータスが `completed` に更新されている

---

## Phase末端アクション【必須】

- [ ] `artifacts.json` の Phase 12 ステータスを `completed` に更新
- [ ] 全4タスクの完了を確認してからステータスを更新（**P4対策**: 早期完了記載禁止）
- [ ] LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする（**P43対策**）

## 依存関係

| 方向 | Phase / タスク           | 内容                               |
| ---- | ------------------------ | ---------------------------------- |
| 前提 | Phase 11（手動テスト）   | 手動テスト結果を未タスク検出に活用 |
| 前提 | Phase 10（最終レビュー） | レビュー結果を未タスク検出に活用   |
| 前提 | Phase 3（設計レビュー）  | レビュー結果を未タスク検出に活用   |
| 後続 | Phase 13（PR作成）       | ドキュメント完了後にPR準備         |

## 次Phase

Phase 13（PR作成）へ進む。 → `phase-13-pr-creation.md`
