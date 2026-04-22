# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 8                                    |
| タスクID   | UNASSIGNED-EVALS-VALIDATOR-GUARD-001 |
| ステータス | pending                              |
| 作成日     | 2026-04-21                           |
| 前Phase    | 7: カバレッジ確認                    |
| 次Phase    | 9: 品質保証                          |

---

## 目的

`validate-evals.js` 追加後のスクリプト群を見渡し、コードの重複排除とナビゲーションドリフトの解消を行う。
リファクタリング後も全テストが引き続き PASS することを確認し、変更の理由を `refactoring-log.md` に記録する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### Step 1: `validate-evals.js` の重複ロジック確認（他スクリプトとの共通化機会）

**目的**: `validate-evals.js` と既存スクリプト群の間にある重複ロジックを特定し、共通化すべき箇所を洗い出す

**実行手順**:

1. 以下のスクリプトのソースコードを読み、共通処理の有無を確認する
   - `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`
   - `.claude/skills/skill-fixture-runner/scripts/validate-schemas.js`
   - `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js`
   - `.claude/skills/skill-fixture-runner/scripts/validate-agent-spec.js`
   - `.claude/skills/skill-fixture-runner/scripts/validate-skill-frontmatter.js`
2. 以下の観点で重複パターンを特定する
   - ファイルスキャン（`glob` / `fs.readdirSync` 等）の重複
   - エラー収集・報告パターンの重複
   - スキルパス一覧の構築ロジックの重複
3. 共通化のコスト対効果を判断し、導入可否を記録する

**重複パターン記録形式（例）**:

```
対象: ファイルスキャンロジック
重複箇所: validate-evals.js L12-25, validate-schemas.js L8-20
内容: skills ディレクトリの glob によるスキャン処理
共通化判断: Yes / No
理由: （メリット・デメリットを記述）
```

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md` の重複ロジック確認セクション

---

### Step 2: エラーメッセージの統一（既存スクリプトとの一貫性）

**目的**: `validate-evals.js` のエラーメッセージのフォーマットが既存スクリプトと一貫しているかを確認し、不一致があれば統一する

**実行手順**:

1. 既存スクリプト群のエラーメッセージの形式（プレフィックス・スキル名の表示方法・色付け有無等）を調査する
2. `validate-evals.js` のエラーメッセージ形式と比較し、差異を特定する
3. 差異がある場合は `validate-evals.js` を修正して既存スクリプトの形式に合わせる
4. 修正後に validator を実行し、エラーメッセージが期待どおりに出力されることを確認する

**変更記録テーブル**:

| 対象                | Before（変更前）           | After（変更後）            | 理由               |
| ------------------- | -------------------------- | -------------------------- | ------------------ |
| `validate-evals.js` | （実際の変更前内容を記録） | （実際の変更後内容を記録） | （変更理由を記録） |

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md` のエラーメッセージ統一セクション
- 修正済み `validate-evals.js`（差異があった場合のみ）

---

### Step 3: allowlist 定数の外部化検討（コードレベル vs 設定ファイル）

**目的**: L3 チェックで使用する 6 スキルの allowlist（対象スキル名一覧）をコード内定数として保持するか、設定ファイルに外部化するかを判断する

**実行手順**:

1. `validate-evals.js` 内の allowlist 定数（対象スキル名一覧）の現在の定義方法を確認する
2. 以下の観点で外部化の要否を評価する
   - スキル追加時の変更箇所数（コード内定数 vs 設定ファイル）
   - 設定ファイル化した場合のスキーマ管理コスト
   - 他スクリプトからの再利用可能性
3. 判断結果と理由を記録する
4. 外部化する場合は設定ファイルのパスとフォーマットを決定し、実装する

**外部化判断の観点**:

| 観点                     | コード内定数         | 設定ファイル                 |
| ------------------------ | -------------------- | ---------------------------- |
| スキル追加時の変更箇所   | スクリプト本体のみ   | 設定ファイルのみ             |
| スキーマ管理             | 不要                 | JSON Schema 等が必要         |
| 他スクリプトからの再利用 | import が必要        | どのスクリプトからも参照可能 |
| 変更の追跡容易性         | git blame で追跡可能 | git blame で追跡可能         |

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md` の allowlist 外部化判断セクション
- 外部化設定ファイル（外部化する場合のみ）

---

### Step 4: `run-all-validations.js` の統合パターンの統一

**目的**: `run-all-validations.js` が `validate-evals.js` を他のスクリプトと同じパターンで呼び出しているかを確認し、不一致があれば統一する

**実行手順**:

1. `run-all-validations.js` の各スクリプト呼び出しパターン（`require` / `import`・エラーハンドリング・exit code 処理）を確認する
2. `validate-evals.js` の呼び出し部分が既存スクリプトの呼び出しパターンと一致しているかを確認する
3. 不一致がある場合は `run-all-validations.js` を修正して統一する
4. 修正後に統合実行して全スクリプトが PASS することを確認する

```bash
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js
```

**変更記録テーブル**:

| 対象                     | Before（変更前）           | After（変更後）            | 理由               |
| ------------------------ | -------------------------- | -------------------------- | ------------------ |
| `run-all-validations.js` | （実際の変更前内容を記録） | （実際の変更後内容を記録） | （変更理由を記録） |

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md` の統合パターン統一セクション
- 修正済み `run-all-validations.js`（差異があった場合のみ）

---

### Step 5: `.agents/` ミラーの同期確認（リファクタリング後）

**目的**: リファクタリングで変更したファイルが `.agents/` ミラーに正しく反映されていることを確認する

**実行手順**:

1. リファクタリングで変更したスクリプトを特定し、`.agents/` ミラーと diff を取る

```bash
diff -u .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
       .agents/skills/skill-fixture-runner/scripts/validate-evals.js

diff -u .claude/skills/skill-fixture-runner/scripts/run-all-validations.js \
       .agents/skills/skill-fixture-runner/scripts/run-all-validations.js

diff -u .claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js \
       .agents/skills/skill-fixture-runner/scripts/validate-skill-structure.js
```

2. 差分がある場合は `.claude/` 側を正本として `.agents/` 側を更新する
3. 更新後に再度 diff を取り、ゼロ差分であることを確認する

**ミラー同期確認表**:

| スクリプト名                  | 差分の有無 | 対応内容 |
| ----------------------------- | ---------- | -------- |
| `validate-evals.js`           |            |          |
| `validate-skill-structure.js` |            |          |
| `run-all-validations.js`      |            |          |

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md` のミラー同期確認セクション
- 更新済み `.agents/` ミラーファイル群（差分があった場合のみ）

---

## 変更記録テーブル（全体サマリー）

| 対象                          | Before                     | After                      | 理由           |
| ----------------------------- | -------------------------- | -------------------------- | -------------- |
| `validate-evals.js`           | （Step 2, 3 での変更内容） | （Step 2, 3 での変更内容） | （変更理由）   |
| `run-all-validations.js`      | （Step 4 での変更内容）    | （Step 4 での変更内容）    | （変更理由）   |
| `validate-skill-structure.js` | （共通化が発生した場合）   | （共通化が発生した場合）   | （変更理由）   |
| `.agents/` ミラー             | （Step 5 での差分内容）    | （Step 5 での更新内容）    | dual root 同期 |

---

## 参照資料

| 参照資料               | パス                                                                 | 内容                         |
| ---------------------- | -------------------------------------------------------------------- | ---------------------------- |
| Phase 7 成果物         | `outputs/phase-7/coverage-report.md`                                 | カバレッジ確認結果           |
| validate-evals.js      | `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`      | リファクタリング対象（正本） |
| run-all-validations.js | `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js` | 統合実行スクリプト（正本）   |
| agents ミラー群        | `.agents/skills/skill-fixture-runner/scripts/`                       | dual root ミラー             |

---

## 統合テスト連携

- Phase 3 の `elegance-thinking-audit.md` を再参照し、重複削除が 30 思考法の結論と矛盾しないか確認する
- Phase 9 では本 Phase 後の CLI / mirror / error message 契約を最終確認する

## 成果物

| 成果物               | パス                                                                   | 内容                                                                     |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`                                   | 重複確認・エラーメッセージ統一・allowlist 判断・統合パターン・ミラー同期 |
| 修正済みスクリプト群 | `.claude/skills/skill-fixture-runner/scripts/`（変更があった場合のみ） | リファクタリング適用済みスクリプト                                       |
| 更新済みミラー群     | `.agents/skills/skill-fixture-runner/scripts/`（差分があった場合のみ） | ミラー同期済みスクリプト                                                 |

---

## 完了条件

- [ ] `validate-evals.js` と既存スクリプト群の重複ロジックが特定され、共通化の要否が判断・記録されている
- [ ] エラーメッセージの形式が既存スクリプトと一致していることが確認されている（差異があれば修正済み）
- [ ] allowlist 定数の外部化要否が判断・記録されている
- [ ] `run-all-validations.js` の統合パターンが統一されていることが確認されている（差異があれば修正済み）
- [ ] `.agents/` ミラーがリファクタリング後のスクリプトと同期されており、ゼロ差分であることが確認されている
- [ ] リファクタリング後に全スクリプトが引き続き PASS していることを確認している
- [ ] `outputs/phase-8/refactoring-log.md` が生成されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EVALS-VALIDATOR-GUARD-001/phase-9-quality-assurance.md`
