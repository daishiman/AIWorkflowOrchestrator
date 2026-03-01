# Phase 12 仕様書別SubAgent N/A判定ログガード: 実装ガイド

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001          |
| Phase      | 12                                                |
| 実行日     | 2026-03-01                                        |
| 機能名     | Phase 12 仕様書別SubAgent N/A判定ログガード       |
| 成果物種別 | 実装ガイド（Part 1: 概念説明 + Part 2: 技術詳細） |

---

## Part 1: 概念的説明（中学生レベル）

この Part 1 では、今回の仕組みが「なぜ必要なのか」「何をするのか」を、日常生活の例え話を使って説明します。専門的な言葉は使わず、初めて読む人でも理解できるように書いています。

---

### 1. N/A判定ログとは何か

#### なぜ必要か

大きなプロジェクトでは、たくさんの「説明書」（仕様書）を管理しています。何か作業をしたとき、「どの説明書を書き直して、どの説明書はそのままでよいか」を記録しておかないと、後から見た人が「この説明書の確認を忘れたのか、それとも変える必要がなかったのか」を区別できなくなります。

N/A判定ログは、「変える必要がなかった説明書」にも「変えなくてよい」という判断と、その理由をきちんと書き残す仕組みです。

#### 日常生活での例え（宿題チェックリスト）

毎週、先生から「宿題チェックリスト」が配られるとします。リストには国語、算数、理科、社会、英語の5教科が書かれています。

今週は国語と算数と英語だけ宿題が出ました。理科と社会の宿題は出ていません。

このとき、もしチェックリストの理科と社会の欄を空欄のままにしてしまうと、あとから先生やお母さんが見たとき、こう思うかもしれません。

- 「理科の宿題、やるの忘れたんじゃない？」
- 「社会の宿題、提出し忘れたのでは？」

でも、理科の欄に「今週は実験週間のため宿題なし」、社会の欄に「来週のテスト範囲発表前のため宿題なし」と書いておけば、誰が見ても「ああ、ちゃんと確認した上で宿題がなかったんだな」と分かります。

N/A判定ログも同じです。「この説明書は今回の作業に関係がないから変えなかった」という判断と理由を書いておくことで、確認漏れではないことを証明します。

#### 何をするか

すべての説明書について、1つずつ「書き直す（更新）」か「今回は関係ない（N/A）」かを判断して記録します。N/Aの場合は、なぜ関係ないのかの理由も一緒に書きます。空欄（判断していない状態）は許されません。

---

### 2. 三点突合とは何か

#### なぜ必要か

作業が完了したかどうかを判断するとき、1つの情報だけで「終わった」と決めてしまうと、見落としが起きることがあります。複数の場所から確認して、すべてが「完了」を示しているときだけ本当に終わったと判断する仕組みが必要です。

#### 日常生活での例え（3つの確認スタンプ）

お店で商品を買うときのことを考えてみてください。お店が「ちゃんと商品が売れた」と確認するには、3つの場所を確認します。

1. **商品棚の確認**: 商品が棚からなくなっている（お客さんが持っていった）
2. **レジの記録**: レジに「この商品を販売した」という記録がある（お金のやり取りがあった）
3. **店員のチェックリスト**: 店員の「売れた商品リスト」にチェックが入っている（人の目でも確認した）

この3つが全部そろっていれば、「お買い物は完了した」と安心できます。でも、たとえばレジの記録がないのに商品だけ棚からなくなっていたら、「万引きかもしれない」と気づけます。

三点突合も同じ考え方です。3つの別々の場所を確認して、全部が「完了」を示しているときだけ「作業完了」と判断します。1つでも「まだ」の場所があれば、「まだ途中です」と報告します。

#### 何をするか

以下の3つの場所を確認します。

1. 成果物のファイルが本当に存在するか（商品棚の確認に相当）
2. 管理ファイルに「完了」と記録されているか（レジの記録に相当）
3. チェックリストの全項目にチェックが入っているか（店員の確認に相当）

---

### 3. current/baseline分離とは何か

#### なぜ必要か

プロジェクトには、以前からずっと残っている問題と、今回の作業で新しく発生した問題の2種類があります。もし全部まとめて「問題あり！不合格！」と判定してしまうと、以前から残っていた問題のせいで、今回の作業がどんなに完璧でも合格にできなくなってしまいます。それでは公平ではありませんし、作業が永遠に完了しなくなってしまいます。

#### 日常生活での例え（今回のテストの点数 vs 前回までの平均点）

学校のテストを考えてみてください。

- **今回のテストの点数（current）**: 今回のテストで100点満点中、何点取ったか
- **前回までの平均点（baseline）**: 1学期の最初からこれまでのテストの平均点

たとえば、今回のテストで100点を取ったとします。でも、前回までの平均点は70点です。

このとき、「合格かどうか」を判断するのは「今回のテストの点数」だけです。今回100点なら合格です。前回までの平均が70点だからといって、今回のテストが不合格になることはありません。

ただし、前回までの平均点は「参考情報」として別に記録しておきます。通算の成績を上げていくのは別の取り組みとして対応すればよいのです。

#### 何をするか

問題チェックの結果を「今回の作業で生まれた問題（current）」と「以前から存在していた問題（baseline）」に分けて記録します。合格・不合格の判定は「今回の作業で生まれた問題が0件かどうか」だけで決めます。以前からの問題は参考値として記録しますが、今回の合否判定には影響しません。

---

## Part 2: 技術的詳細（開発者向け）

以降は、開発者やメンテナンス担当者向けに、実装の技術的な詳細を記述します。

---

### 1. N/A判定ログテンプレートの詳細仕様

#### フィールド定義

N/A判定ログの各エントリは、`NaLogEntry` 型として以下の5フィールドで構成される。

| フィールド名          | 型                  | 必須 | 説明                                                               |
| --------------------- | ------------------- | ---- | ------------------------------------------------------------------ |
| `specName`            | `string`            | 必須 | 対象仕様書のファイル名（例: `architecture-overview.md`）           |
| `status`              | `"更新"` \| `"N/A"` | 必須 | 判定結果。仕様書に変更がある場合は「更新」、ない場合は「N/A」      |
| `reason`              | `string`            | 条件 | N/A判定の理由。`status === "N/A"` の場合は必須                     |
| `alternativeEvidence` | `string`            | 条件 | N/A判定の代替証跡パス。`status === "N/A"` の場合は必須             |
| `updatedBy`           | `string`            | 必須 | 担当SubAgent識別子。許可値: `SubAgent-A` 〜 `SubAgent-E`, `leader` |

#### バリデーションルール

`na-log-validator.ts` の `validateNaLogEntry()` 関数で以下のバリデーションを実施する。

**specName の3段バリデーション（P42対策）**:

```typescript
// 第1段: 型チェック
if (typeof entry.specName !== "string") {
  /* エラー */
}
// 第2段: 空文字列チェック
else if (entry.specName === "") {
  /* エラー */
}
// 第3段: トリム空文字列チェック
else if (entry.specName.trim() === "") {
  /* エラー */
}
```

**status の許可値チェック**:

```typescript
const VALID_STATUS = ["更新", "N/A"] as const;
if (!VALID_STATUS.includes(entry.status)) {
  /* エラー */
}
```

**N/A時の reason・alternativeEvidence の必須チェック**:

`status === "N/A"` の場合のみ、`reason` と `alternativeEvidence` の両方に対して3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）を実施する。`status === "更新"` の場合はこれらのフィールドのバリデーションをスキップする。

**理由フィールドの記述ルール**:

- 「本タスクは〜のため〜に影響しない」の形式で1文以上記述する
- 曖昧表現（「適切に」「必要に応じて」「など」）は禁止
- 具体的な根拠を明示する

記述例（合格）:

```
本タスクはPhase 12の運用手順改善であり、アーキテクチャ構造を変更しないため、architecture-overview.mdに影響しない
```

記述例（不合格 -- 曖昧表現）:

```
特に関係なさそうなため
```

**判定基準**:

| 条件                             | 判定 |
| -------------------------------- | ---- |
| 仕様書の内容に直接的な変更がある | 更新 |
| 仕様書の内容に直接的な変更がない | N/A  |

**複数エントリの一括バリデーション**:

`validateNaLogEntries()` 関数は配列を受け取り、各エントリに対して `validateNaLogEntry()` を実行する。エラーメッセージにはエントリ番号のプレフィックスが付与される（例: `[1] specName: 空文字列は許可されていません`）。空配列の場合はバリデーション失敗となる。

#### Markdown テンプレート形式

```markdown
| #   | 仕様書名                 | 判定 | 理由                                                                 | 代替証跡                                      | 判定者     |
| --- | ------------------------ | ---- | -------------------------------------------------------------------- | --------------------------------------------- | ---------- |
| 1   | architecture-overview.md | N/A  | 本タスクはアーキテクチャ構造を変更しないため、概要仕様への影響がない | phase-5-implementation.mdに変更なしの記録あり | SubAgent-A |
| 2   | task-workflow.md         | 更新 | 完了タスクセクション追加・残課題テーブル更新が必要                   | -                                             | SubAgent-B |
```

---

### 2. 三点突合の検証手順

三点突合は `triple-check-validator.ts` の `validateTripleCheck()` 関数で実装されている。以下の4ステップで検証を行う。

#### ステップ 1: 成果物実体確認

Phase 12 の成果物ディレクトリに、必要な5ファイルが物理的に存在することを確認する。

```bash
ls outputs/phase-12/
```

期待される5ファイル:

| #   | ファイル名                     | 説明                         |
| --- | ------------------------------ | ---------------------------- |
| 1   | `implementation-guide.md`      | 実装ガイド（本ファイル）     |
| 2   | `spec-update-summary.md`       | 仕様更新サマリー             |
| 3   | `documentation-changelog.md`   | ドキュメント更新履歴         |
| 4   | `unassigned-task-detection.md` | 未タスク検出レポート         |
| 5   | `skill-feedback-report.md`     | スキルフィードバックレポート |

**PASS条件**: 5ファイル全てが存在する。

#### ステップ 2: artifacts.json 確認

`artifacts.json` の Phase 12 エントリにおいて、`status` フィールドが `"completed"` であることを確認する。

```json
{
  "phase12": {
    "status": "completed",
    "artifacts": [...]
  }
}
```

**PASS条件**: `status === "completed"`。

検証コード上は、`validateTripleCheck()` の `artifactsJsonPath` パラメータに `"completed"` が渡されたときに PASS となる。

```typescript
const artifactsStatus =
  input.artifactsJsonPath === "completed" ? "PASS" : "FAIL";
```

#### ステップ 3: チェックリスト確認

`phase-12-documentation.md` の「完了条件」セクションにある全チェックボックスが `[x]`（チェック済み）であることを確認する。

**PASS条件**: 全チェックボックスが `[x]` になっている。

検証コード上は、`changelogPath` パラメータに `"synced"` が渡されたときに PASS となる。

```typescript
const changelogStatus = input.changelogPath === "synced" ? "PASS" : "FAIL";
```

#### ステップ 4: 合否判定

3つの検証項目すべてが PASS の場合のみ、総合判定を PASS とする。1つでも FAIL がある場合は総合判定を FAIL とし、`failedChecks` 配列に FAIL 項目名を格納する。

```typescript
const overallStatus: "PASS" | "FAIL" =
  failedChecks.length === 0 ? "PASS" : "FAIL";
```

**判定結果の型構造** (`TripleCheckResult`):

```typescript
interface TripleCheckResult {
  overallStatus: "PASS" | "FAIL";
  checks: {
    artifacts: { status: "PASS" | "FAIL"; detail: string };
    changelog: { status: "PASS" | "FAIL"; detail: string };
    audit: { status: "PASS" | "FAIL"; detail: string };
  };
  failedChecks: string[]; // 例: ["artifacts", "changelog"]
}
```

---

### 3. current/baseline 分離の判定アルゴリズム

`audit-output-parser.ts` の `parseAuditOutput()` と `evaluateAuditResult()` で実装されている。

#### 入力データの構造

`audit-unassigned-tasks.js --json` の出力は以下の JSON 構造を持つ。

```json
{
  "currentViolations": {
    "total": 0,
    "details": []
  },
  "baselineViolations": {
    "total": 5,
    "details": ["task-workflow.md: 未タスクUT-XXXへの参照リンクが欠落", "..."]
  }
}
```

#### パース処理 (`parseAuditOutput`)

1. `stdout` の空文字列チェック（P42対策: `typeof !== "string"` + `.trim() === ""`)
2. `JSON.parse()` による JSON パース（失敗時はエラーメッセージに先頭100文字を含める）
3. オブジェクト型チェック（`null` や配列は拒否）
4. `currentViolations` フィールドの存在確認と構造検証
5. `baselineViolations` フィールドの存在確認と構造検証
6. 各 violation ブロックの `total`（0以上の整数）と `details`（配列）を検証

#### 合否判定 (`evaluateAuditResult`)

```typescript
if (result.currentViolations.total === 0) {
  // PASS: 本タスク起因の違反なし
  // baselineViolations.total > 0 の場合は参考注記を付与
  return { status: "PASS", message: "..." };
}
// FAIL: 本タスク起因の違反あり
return { status: "FAIL", message: "..." };
```

| 条件                            | 判定 | 説明                                     |
| ------------------------------- | ---- | ---------------------------------------- |
| `currentViolations.total === 0` | PASS | 本タスク起因の違反なし                   |
| `currentViolations.total > 0`   | FAIL | 本タスク起因の違反あり（詳細を報告）     |
| `baselineViolations.total` の値 | -    | 合否判定に影響しない（参考値として記録） |

#### baseline の記録方法

`baselineViolations.total` は合否判定には使用せず、`spec-update-summary.md` に以下の形式で別枠記録する。

```markdown
## 監査結果

| スコープ | violations.total | 合否判定       |
| -------- | ---------------- | -------------- |
| current  | 0                | PASS（合格）   |
| baseline | 5                | 参考値（別枠） |

**判定基準**: `currentViolations.total === 0` で合格。baseline値は合否判定に使用しない。
```

#### スコープ制御オプション

- `--target-file <path>`: 特定ファイルに対する current scope の監査
- `--diff-from HEAD`: HEAD からの差分を current scope として限定
- オプションなし: 全体監査（baseline scope を含む）

---

### 4. SubAgent 分担表テンプレートの詳細仕様

#### 設計意図

Phase 12 Task 2（システム仕様書更新）では、複数の仕様書を更新する必要がある。P43（SubAgent の rate limit 中断）対策として、更新対象ファイルを3ファイル以下に分割して各 SubAgent に割り当てる。

#### テンプレート構造

全仕様書を列挙し、各行に「更新」または「N/A」を必ず割り当てる。空白行は許容しない（網羅性の保証）。

```markdown
## SubAgent 分担表

### 更新対象ファイル割り当て

| SubAgent   | 担当ファイル                                | 最大ファイル数 |
| ---------- | ------------------------------------------- | -------------- |
| SubAgent-A | task-workflow.md, lessons-learned.md        | 3              |
| SubAgent-B | spec-update-workflow.md（該当する場合）     | 3              |
| leader     | LOGS.md（2ファイル）, SKILL.md（2ファイル） | 3              |

### 全仕様書判定一覧

| #   | 仕様書名                 | 判定 | 理由                       | 担当SubAgent |
| --- | ------------------------ | ---- | -------------------------- | ------------ |
| 1   | task-workflow.md         | 更新 | 完了タスク記録が必要       | SubAgent-A   |
| 2   | lessons-learned.md       | 更新 | 運用教訓の追加が必要       | SubAgent-A   |
| 3   | spec-update-workflow.md  | 更新 | テンプレート追記が該当     | SubAgent-B   |
| 4   | architecture-overview.md | N/A  | アーキテクチャ変更なし     | -            |
| 5   | architecture-monorepo.md | N/A  | モノレポ構造の変更なし     | -            |
| 6   | security-principles.md   | N/A  | セキュリティ機能の変更なし | -            |
| ... |
```

#### P43 対策ルール

1. **3ファイル上限**: 「更新」判定のファイルは1つの SubAgent あたり最大3ファイルまで
2. **超過時の対応**: 3ファイルを超える場合は追加の SubAgent を割り当てる
3. **LOGS.md 記録の順序**: LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする（中断時の誤判定を防止）
4. **中断後の検証**: `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認する

#### 網羅性の保証

- 全仕様書を列挙する（`grep -rn` で参照される仕様書を漏れなくリストアップ）
- 各行に「更新」または「N/A」のいずれかが割り当てられている
- 空白行（判定が未記入の行）が存在しない
- 「更新」ファイルには必ず担当 SubAgent が割り当てられている
- 「N/A」ファイルの理由欄が空でない

---

### 5. 監査スクリプトとの連携方法

Phase 12 の完了判定で使用する監査スクリプトの一覧と、各コマンドの用途を記述する。

#### 5.1 仕様書整合検証

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 \
  --json
```

- **用途**: ワークフロー内の全仕様書の整合性を検証する
- **出力**: JSON 形式の検証結果
- **PASS条件**: エラー0件

#### 5.2 対象ファイル監査（current scope）

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/<対象ファイル>.md
```

- **用途**: 今回の作業で変更した特定ファイルに対する監査
- **出力**: JSON 形式の `currentViolations` と `baselineViolations`
- **PASS条件**: `currentViolations.total === 0`
- **判定への影響**: current scope の結果のみが合否判定に使用される

#### 5.3 全体監査（baseline scope）

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
```

- **用途**: プロジェクト全体の未タスク監査（baseline の把握）
- **出力**: JSON 形式の `currentViolations` と `baselineViolations`
- **判定への影響**: baseline 値は合否判定には使用しない（参考値として `spec-update-summary.md` に記録）

#### 5.4 Phase 成果物検証

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 \
  --phase 12
```

- **用途**: Phase 12 の成果物が規定のファイル構成を満たしているかを検証する
- **出力**: 成果物の存在チェック結果
- **PASS条件**: 必須成果物が全て存在する

#### 5.5 未タスクリンク検証

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

- **用途**: 未タスク指示書と関連仕様書間の参照リンクが切れていないことを確認する
- **PASS条件**: 参照切れ0件

#### 5.6 SKILL frontmatter 検証

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

- **用途**: 各スキルの SKILL.md frontmatter 構造が正しいことを検証する
- **PASS条件**: 3スキル全てで Error 0件
- **Warning の扱い**: Step 1-G.2 の3段階分類（合格/要監視/要対応）で判定する

---

### 6. 関連 Pitfall

本タスクの実装で特に注意すべき既知の落とし穴（`.claude/rules/06-known-pitfalls.md` 記載）を以下にまとめる。

| Pitfall ID | タイトル                                     | 本タスクでの適用場面                               | 対策                                                                                                                             |
| ---------- | -------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| P1         | LOGS.md 2ファイル更新漏れ                    | Phase 12 Task 2 Step 1-A の LOGS.md 更新           | `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の両方を同時更新する                                   |
| P2         | topic-map.md 再生成忘れ                      | Phase 12 Task 2 Step 1-D の topic-map 再生成       | 仕様書に変更があれば必ず `generate-index.js` を実行する                                                                          |
| P3         | 未タスク管理の3ステップ不完全                | Phase 12 Task 4 の未タスク検出・登録               | (1) `unassigned-task/` に指示書作成 (2) `task-workflow.md` 残課題テーブルに登録 (3) 関連仕様書に参照リンク追加 の3ステップ全完了 |
| P4         | documentation-changelog への早期「完了」記載 | Phase 12 Task 3 のドキュメント更新履歴作成         | 全 Step 確認前に「完了」と記載しない。各 Step の結果を逐次記録する                                                               |
| P43        | Phase 12 サブエージェントの rate limit 中断  | Phase 12 Task 2 の仕様書更新における SubAgent 分割 | 更新ファイルは3ファイル以下/SubAgent に分割する。LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする                  |

---

### 実装ファイル一覧

| #   | ファイル                                                      | 責務                                         | テスト数 |
| --- | ------------------------------------------------------------- | -------------------------------------------- | -------- |
| 1   | `.claude/scripts/na-log-validator.ts`                         | N/A判定ログのバリデーション                  | 31       |
| 2   | `.claude/scripts/triple-check-validator.ts`                   | 三点突合による完了判定検証                   | 22       |
| 3   | `.claude/scripts/audit-output-parser.ts`                      | 監査出力のパースと current/baseline 分離判定 | 36       |
| 4   | `.claude/scripts/__tests__/phase12-guard-integration.test.ts` | 統合テスト（パイプライン全体）               | 4        |

### テンプレートファイル一覧

| #   | ファイル                                                                      | 説明                                 |
| --- | ----------------------------------------------------------------------------- | ------------------------------------ |
| 1   | `.claude/skills/skill-creator/assets/phase12-na-judgment-log-template.md`     | N/A判定ログ記録テンプレート          |
| 2   | `.claude/skills/skill-creator/assets/phase12-subagent-assignment-template.md` | SubAgent分担表テンプレート           |
| 3   | `.claude/skills/skill-creator/assets/phase12-completion-guard-checklist.md`   | Phase 12完了判定ガードチェックリスト |
| 4   | `.claude/skills/skill-creator/assets/phase12-audit-record-template.md`        | current/baseline分離記録テンプレート |
