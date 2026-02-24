# Phase 7: カバレッジ確認 — skill:ハンドラP42準拠バリデーション形式統一

## メタ情報

| 項目          | 内容                                        |
| ------------- | ------------------------------------------- |
| タスクID      | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001     |
| タスク名      | skill:ハンドラP42準拠バリデーション形式統一 |
| Phase         | 7 — カバレッジ確認                          |
| 分類          | セキュリティ                                |
| 優先度        | 中                                          |
| 規模          | 小規模                                      |
| Issue         | #874                                        |
| 作成日        | 2026-02-24                                  |
| ステータス    | 未着手                                      |
| 前Phase成果物 | Phase 6（テスト拡充）完了、全テスト Green   |
| 後続Phase     | Phase 8（リファクタリング）                 |
| 機能名        | skill-validation-consistency                |

---

## 目的

Phase 4〜6 で作成・修正したテストにより、skillHandlers.ts のテストカバレッジがプロジェクト基準（02-code-quality.md 準拠）を充足しているか計測・判定する。基準未達の場合は Phase 6 に差し戻してテストを追加する。特にバリデーション分岐（6ハンドラ x True/Falseパス = 12分岐）は100%カバーを目標とする。

### カバレッジ基準（02-code-quality.md 準拠）

| 指標              | 最低基準 | 推奨基準 | 本タスク目標                      |
| ----------------- | -------- | -------- | --------------------------------- |
| Line Coverage     | 80%      | 90%      | 80%以上（推奨90%以上）            |
| Branch Coverage   | 60%      | 70%      | 70%以上（バリデーション分岐100%） |
| Function Coverage | 80%      | 90%      | 80%以上                           |

### バリデーション分岐の100%カバー目標

各ハンドラのバリデーション分岐は以下の2パスを持つ:

- **True パス**: バリデーション失敗 → throw VALIDATION_ERROR
- **False パス**: バリデーション通過 → 正常処理継続

6ハンドラ x 2パス = **12分岐** すべてがテストでカバーされていることを確認する。

---

## 実行タスク

- 計測実行: `vitest --coverage` で数値を取得する。
- 結果解析: Line/Branch/Function を基準と照合する。
- 分岐検証: 6ハンドラのTrue/False分岐網羅を確認する。
- ゲート判定: Phase 8進行かPhase 6差し戻しかを決定する。
- 記録整備: カバレッジ結果を成果物へ記録する。

| #   | タスク                       | 説明                                                     |
| --- | ---------------------------- | -------------------------------------------------------- |
| 1   | カバレッジ計測実行           | vitest --coverage でカバレッジレポートを生成する         |
| 2   | カバレッジ結果の解析         | Line / Branch / Function 各指標を基準値と照合する        |
| 3   | バリデーション分岐の個別確認 | 6ハンドラの True パス / False パスが100%カバーか確認する |
| 4   | ゲート判定                   | 基準充足 → Phase 8、未達 → Phase 6 差し戻しの判定を行う  |
| 5   | カバレッジ結果の記録         | 結果を outputs/phase-7/ に記録する                       |

---

## 参照資料

### 前Phase成果物

- `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-6-test-expansion.md` — テスト拡充仕様書
- `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-5-implementation.md` — 実装仕様書
- `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-6/coverage-gap-analysis.md` — Phase 6 カバレッジ不足箇所分析

### テストファイル（6ファイル）

| ファイル                                                                | テスト数（概算）                    |
| ----------------------------------------------------------------------- | ----------------------------------- |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`             | 既存 + Phase 6 追加                 |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`     | 既存 + Phase 6 追加                 |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.improve.test.ts`     | 既存 + Phase 6 追加                 |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts`    | 既存                                |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.integration.test.ts` | 既存                                |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.validation.test.ts`  | Phase 4 新規28件 + Phase 6 追加12件 |

### システム仕様

- `.claude/rules/02-code-quality.md` — カバレッジ基準定義
- `.claude/rules/06-known-pitfalls.md` — P41: v8カバレッジプロバイダのインライン関数カウント
- `.claude/rules/06-known-pitfalls.md` — P40: テスト実行ディレクトリ依存

### システム仕様（aiworkflow-requirements 抽出）

| 参照資料                      | パス                                                                              | 抽出した要件                                    |
| ----------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------- |
| security-skill-ipc.md         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | skill系IPCの検証必須観点（sender・入力検証）    |
| api-ipc-agent.md              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPCチャネル契約とテスト対象の整合確認           |
| ipc-contract-checklist.md     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | P42準拠テスト（空文字/空白/型不一致）の網羅確認 |
| interfaces-agent-sdk-skill.md | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Preload呼び出し契約とMain実装の整合確認         |
| error-handling.md             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | Validation Errorの分類に基づく失敗系分岐確認    |

---

## 実行手順

### Step 1: カバレッジ計測コマンド

以下のコマンドを **`apps/desktop` ディレクトリから** 実行する（P40準拠）:

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/skillHandlers
```

> **注意（P40）**: プロジェクトルートから `pnpm vitest run apps/desktop/src/...` を実行すると `vitest.config.ts` が正しく読み込まれず、`document is not defined` エラーが発生する。必ず `cd apps/desktop` してから実行すること。

#### 1.1 カバレッジレポートの出力先

vitest の設定に応じて、以下のいずれかにカバレッジレポートが出力される:

| 出力形式 | パス                     | 用途                     |
| -------- | ------------------------ | ------------------------ |
| text     | コンソール出力           | 即座に確認（数値の読取） |
| html     | `apps/desktop/coverage/` | 詳細な行単位の確認       |
| json     | `apps/desktop/coverage/` | CI連携用                 |

#### 1.2 全テストの PASS 確認

カバレッジ計測の前提として、全テストが PASS していることを確認する。1件でも FAIL がある場合はカバレッジ計測結果が不正確になるため、Phase 6 に戻ってテストを修正する。

**確認基準**: コンソール出力の `Tests:` 行が `X passed, 0 failed` であること（failed が 0）

---

### Step 2: カバレッジ結果の解析（Line / Branch / Function 各指標）

#### 2.1 結果記録テンプレート

カバレッジ計測結果を以下のテーブルに記録する:

```markdown
## skillHandlers.ts カバレッジ結果

| 指標              | 測定値  | 最低基準 | 推奨基準 | 判定      |
| ----------------- | ------- | -------- | -------- | --------- |
| Line Coverage     | \_\_\_% | 80%      | 90%      | PASS/FAIL |
| Branch Coverage   | \_\_\_% | 60%      | 70%      | PASS/FAIL |
| Function Coverage | \_\_\_% | 80%      | 90%      | PASS/FAIL |
```

#### 2.2 指標ごとの確認ポイント

##### Line Coverage

- カバレッジレポートの「Stmts」または「Lines」列を確認する
- 80%未満の場合: 未カバー行を特定し、バリデーション関連かサービス層かを分類する

##### Branch Coverage

- カバレッジレポートの「Branch」列を確認する
- 60%未満の場合: 未カバー分岐を特定する。バリデーション分岐（if文のTrue/False両パス）が未カバーの場合は Phase 6 差し戻し
- 60%以上70%未満の場合: バリデーション分岐が100%カバーされていれば PASS。サービス層の分岐が原因の場合は記録のみ

##### Function Coverage

- カバレッジレポートの「Funcs」列を確認する
- 80%未満の場合: P41（v8カバレッジプロバイダのインライン関数カウント）が原因か確認する
- P41が原因の場合: `validateIpcSender` のオプションオブジェクト内の `getAllowedWindows` コールバックをテストで明示的に呼び出すことで対処する

```typescript
// P41対策: インラインarrow functionのカバレッジ向上
const options = mockValidateIpcSender.mock.calls[0][2];
expect(options.getAllowedWindows()).toEqual([mockMainWindow]);
```

---

### Step 3: 基準判定テーブル

#### 3.1 判定フロー

```
テスト全PASS？ ─── No ──→ Phase 6 に戻る（テスト修正）
      |
     Yes
      |
全指標が最低基準以上？ ─── No ──→ Step 3.2 の詳細判定へ
      |
     Yes
      |
バリデーション分岐100%？ ─── No ──→ Phase 6 に戻る（バリデーションテスト追加）
      |
     Yes
      |
Phase 8 へ進む
```

#### 3.2 詳細判定テーブル

| 状態                                                       | 判定                 | 対応                                                                                            |
| ---------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------- |
| 全指標が最低基準以上 かつ バリデーション分岐100%           | **PASS → Phase 8**   | カバレッジ結果を記録し、Phase 8（リファクタリング）に進む                                       |
| 全指標が最低基準以上 だが バリデーション分岐が100%未満     | **FAIL → Phase 6**   | バリデーション分岐の未カバー箇所を特定し、Phase 6 に戻ってテストを追加する                      |
| Line Coverage 80%未満 かつ バリデーション関連行が原因      | **FAIL → Phase 6**   | 未カバーのバリデーション行に対するテストを Phase 6 で追加する                                   |
| Line Coverage 80%未満 かつ サービス層が原因                | **PASS（条件付き）** | バリデーション分岐が100%カバーされていれば PASS。サービス層のカバレッジ不足は未タスクとして記録 |
| Branch Coverage 60%未満 かつ バリデーション分岐が原因      | **FAIL → Phase 6**   | 未カバーのバリデーション分岐に対するテストを Phase 6 で追加する                                 |
| Branch Coverage 60%未満 かつ サービス層が原因              | **PASS（条件付き）** | バリデーション分岐が100%カバーされていれば PASS。サービス層のカバレッジ不足は未タスクとして記録 |
| Function Coverage 80%未満 かつ P41（インライン関数）が原因 | **PASS（条件付き）** | P41の原因を記録し、テストで `getAllowedWindows()` を明示的に呼び出してカバー率向上を試みる      |
| Function Coverage 80%未満 かつ バリデーション関数が原因    | **FAIL → Phase 6**   | 未カバーのバリデーション関数に対するテストを Phase 6 で追加する                                 |

#### 3.3 「条件付きPASS」の記録要件

「条件付きPASS」で Phase 8 に進む場合、以下の内容を coverage-results.md に記録する:

1. 未達指標の具体値と基準値の差分
2. 未カバー箇所の行番号とコード内容
3. サービス層 / P41 が原因であるという根拠
4. 未タスク化の要否（未タスクとする場合は `unassigned-task/` に指示書を作成）

---

### Step 4: 未達時のPhase 6戻りフロー

Phase 6 に差し戻す場合、以下の手順で実施する。

#### 4.1 差し戻し判定の記録

outputs/phase-7/gate-decision.md に以下を記録する:

```markdown
## Phase 6 差し戻し判定

| 項目           | 内容                              |
| -------------- | --------------------------------- |
| 差し戻し理由   | [具体的な理由を記載]              |
| 未達指標       | [Line/Branch/Function のいずれか] |
| 未達値         | [具体的なパーセンテージ]          |
| 基準値         | [最低基準のパーセンテージ]        |
| 未カバー箇所   | [行番号とコード内容]              |
| 追加テスト方針 | [追加すべきテストケースの概要]    |
```

#### 4.2 Phase 6 での追加テスト作成

1. 未カバー箇所を特定する（カバレッジレポートの html 版で行単位を確認）
2. 未カバー行がバリデーション分岐に該当するか判定する
3. 該当する場合: エッジケーステストを追加する
4. 非該当の場合: サービス層のテストを追加する（正常系の追加パターン等）

#### 4.3 Phase 7 への再突入

Phase 6 での追加テスト完了後、再度 Phase 7 の Step 1 から実行する。差し戻しは最大3回まで許容する。3回差し戻しても基準未達の場合は、未達理由を詳細に記録した上で Phase 8 に進む（「条件付きPASS」として扱う）。

| 差し戻し回数 | 対応                                                   |
| ------------ | ------------------------------------------------------ |
| 1回目        | Phase 6 でテスト追加 → Phase 7 再計測                  |
| 2回目        | Phase 6 でテスト追加 → Phase 7 再計測                  |
| 3回目        | Phase 6 でテスト追加 → Phase 7 再計測                  |
| 4回目以上    | 条件付きPASS → 未達理由を記録し Phase 8 へ（上限到達） |

---

### Step 5: バリデーション分岐の個別確認

#### 5.1 確認対象

各ハンドラのバリデーション if 文は2つのパス（True: throw / False: 正常処理継続）を持つ。6ハンドラ x 2パス = 12分岐 すべてがカバーされていることを確認する。

#### 5.2 バリデーション分岐カバレッジ記録テンプレート

```markdown
## バリデーション分岐カバレッジ（12分岐）

| #   | ハンドラ         | パラメータ名 | True パス（throw VALIDATION_ERROR） | False パス（正常処理継続） | カバー率   |
| --- | ---------------- | ------------ | ----------------------------------- | -------------------------- | ---------- |
| 1   | skill:get-detail | skillId      | ✅ / ❌                             | ✅ / ❌                    | 100% / 50% |
| 2   | skill:execute    | skillId      | ✅ / ❌                             | ✅ / ❌                    | 100% / 50% |
| 3   | skill:abort      | executionId  | ✅ / ❌                             | ✅ / ❌                    | 100% / 50% |
| 4   | skill:get-status | executionId  | ✅ / ❌                             | ✅ / ❌                    | 100% / 50% |
| 5   | skill:analyze    | skillName    | ✅ / ❌                             | ✅ / ❌                    | 100% / 50% |
| 6   | skill:improve    | skillName    | ✅ / ❌                             | ✅ / ❌                    | 100% / 50% |

**合計**: ** / 12 分岐カバー（**%）
```

#### 5.3 確認方法

1. カバレッジレポートの html 版（`apps/desktop/coverage/index.html`）をブラウザで開く
2. `skillHandlers.ts` をクリックして行単位のカバレッジを表示する
3. 各ハンドラのバリデーション if 文の行を確認する
4. 色による判定:
   - **緑色**: カバー済み（True / False 両パスが実行されている）
   - **赤色**: 未カバー（当該行が一度も実行されていない）
   - **黄色**: 部分カバー（True / False のどちらか一方のみ実行されている）
5. 部分カバー（黄色）の場合は True / False のどちらが未カバーかを特定し、Phase 6 で対応するテストを追加する

---

## ゲート判定基準（未達 → Phase 6 へ戻る）

### 判定サマリ

Phase 7 のゲート判定は以下の3条件を **全て** 満たした場合に PASS とする:

| #   | 条件                                     | 必須/推奨 |
| --- | ---------------------------------------- | --------- |
| 1   | 全テストが PASS している（0 failed）     | 必須      |
| 2   | 全カバレッジ指標が最低基準以上           | 必須      |
| 3   | バリデーション分岐（12分岐）が100%カバー | 必須      |

### 判定結果の記録テンプレート

```markdown
## Phase 7 ゲート判定

| 判定項目                 | 結果          | 備考 |
| ------------------------ | ------------- | ---- |
| 全テスト PASS            | PASS/FAIL     |      |
| Line Coverage >= 80%     | PASS/FAIL     |      |
| Branch Coverage >= 60%   | PASS/FAIL     |      |
| Function Coverage >= 80% | PASS/FAIL     |      |
| バリデーション分岐 100%  | PASS/FAIL     |      |
| **総合判定**             | **PASS/FAIL** |      |

→ PASS の場合: Phase 8（リファクタリング）へ進む
→ FAIL の場合: Phase 6 へ差し戻し（差し戻し理由を上記テーブルに記録）
```

---

## 統合テスト連携【必須】

### カバレッジ計測対象テストファイル

カバレッジ計測は全6テストファイルを一括実行して行う。個別ファイル実行ではカバレッジが分散するため、ゲート判定には必ず一括実行の結果を使用すること。

```bash
# 必須: 全テストファイル一括実行（カバレッジ付き）
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/skillHandlers
```

### テストファイル別のカバレッジ寄与確認（未達時の原因調査用）

未カバー箇所の原因調査のため、個別ファイルのカバレッジ寄与を確認する場合に使用する。ゲート判定には使用しない。

```bash
# 個別実行（寄与確認用 — ゲート判定には使用しない）
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/skillHandlers.test.ts
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/skillHandlers.execute.test.ts
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/skillHandlers.improve.test.ts
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/skillHandlers.validation.test.ts
```

---

## 多角的チェック観点

| 観点               | 確認事項                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------ |
| カバレッジ基準充足 | Line 80%+ / Branch 60%+ / Function 80%+ の3指標すべてが最低基準以上か                      |
| バリデーション網羅 | 6ハンドラ x 2パス = 12分岐が100%カバーされているか                                         |
| P41対策            | Function Coverage 低下がインライン arrow function（validateIpcSender等）に起因していないか |
| P40対策            | テスト実行が `cd apps/desktop` から行われているか                                          |
| 差し戻し判定       | 基準未達時の差し戻し理由と追加テスト方針が明確に記録されているか                           |
| 条件付きPASS       | サービス層/P41 による未達の場合、根拠が詳細に記録されているか                              |
| 計測の正確性       | 全テスト PASS の状態でカバレッジを計測しているか（FAIL状態での計測は不正確）               |

---

## 成果物

| #   | 成果物             | パス                                                                                                 | 形式      |
| --- | ------------------ | ---------------------------------------------------------------------------------------------------- | --------- |
| 1   | カバレッジレポート | `apps/desktop/coverage/`（vitest 自動生成）                                                          | HTML/JSON |
| 2   | カバレッジ結果記録 | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-7/coverage-results.md` | Markdown  |
| 3   | ゲート判定記録     | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-7/gate-decision.md`    | Markdown  |

---

## 完了条件チェックリスト

- [ ] Step 1: `cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/skillHandlers` が正常に完了している
- [ ] Step 1: 全テストが PASS している（0 failed）
- [ ] Step 2: Line Coverage が80%以上である
- [ ] Step 2: Branch Coverage が60%以上である（推奨70%以上）
- [ ] Step 2: Function Coverage が80%以上である
- [ ] Step 3: ゲート判定テーブルに全項目の判定結果が記録されている
- [ ] Step 4:（未達の場合のみ）Phase 6 差し戻し理由と追加テスト方針が記録されている
- [ ] Step 5: バリデーション分岐（6ハンドラ x True/False = 12分岐）が100%カバーされている
- [ ] カバレッジ結果が `outputs/phase-7/coverage-results.md` に記録されている
- [ ] ゲート判定結果が `outputs/phase-7/gate-decision.md` に記録されている
- [ ] P41（インライン関数）による Function Coverage 低下がある場合、原因と対策が記録されている

---

## 次のPhase

-> Phase 8: リファクタリング（`phase-8-refactoring.md`）

> **ゲート**: 本 Phase の全完了条件を満たした場合のみ Phase 8 に進む。バリデーション分岐のカバレッジが100%未満の場合は Phase 6 に差し戻す。
