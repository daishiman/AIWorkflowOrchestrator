# TASK-RALLY-002-HANDOFF-VALIDATION-001 RALLY-002→RALLY-010〜013 handoff条件相互検証 - タスク指示書

## メタ情報

```yaml
issue_number: 2406
```

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | TASK-RALLY-002-HANDOFF-VALIDATION-001                        |
| タスク名     | RALLY-002→RALLY-010〜013 handoff条件相互検証                 |
| 分類         | 品質保証 / 横断連携                                          |
| 対象機能     | ConversationalInterview - restoredPendingRequest handoff契約 |
| 優先度       | 高                                                           |
| 見積もり規模 | 中規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | TASK-RALLY-002 Phase 12 Step 1-C handoff条件記録             |
| 発見日       | 2026-04-22                                                   |
| 関連タスク   | TASK-RALLY-002（前提）, RALLY-010〜RALLY-013（後続）         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-RALLY-002 の Phase 12 Step 1-C にて「RALLY-010〜013 が前提とする通常復帰条件は維持」と明記した。
RALLY-002 で確立した以下のルールを RALLY-010〜013 の実装者が正しく理解・実装する必要がある。

1. `restored requestId` を `submitAnswer` の `buildSubmission` 引数として使う
2. 新しい `workflowSnapshot.awaitingUserInput.requestId` が到着するまで restored UI を維持する
3. `restoredPendingRequest` の clear は submit 成功時ではなく、新 snapshot 到着時に行う

これらのルールは RALLY-002 で発見・修正した **requestId drift** バグ（submit 生成元の乖離）に起因する。
当初「コメント整流のみ」と判定されていたが、Phase 3 のレビューで実害バグと再判定された経緯を持つ。

### 1.2 問題点・課題

- RALLY-010〜013 の実装者が RALLY-002 の修正内容を正確に把握していない可能性がある
- `requestId drift` バグが後続タスクで再発するリスクがある
- handoff 条件が Phase 12 ドキュメントにのみ記録されており、後続タスクの仕様書に明示されていない

### 1.3 放置した場合の影響

RALLY-010〜013 で requestId drift が再発し、restore 後の submission が誤った requestId を持つ状態になる。
これはユーザーの入力が正しく処理されない実害バグにつながる。具体的には、会話「戻る」操作後の回答が
意図した質問ではなく別の質問へ送信される状態が発生する。

---

## 2. 何を達成するか（What）

### 2.1 目的

RALLY-010〜013 の各タスク仕様書に RALLY-002 の handoff 条件を明示的に記載し、
後続実装で requestId drift が再発しないことを保証する。

### 2.2 最終ゴール

| ID   | 達成すること                                                                                                     |
| ---- | ---------------------------------------------------------------------------------------------------------------- |
| G-01 | RALLY-010〜013 の各仕様書 Phase 1 に「RALLY-002 前提条件チェックリスト」が記載されている                         |
| G-02 | RALLY-010〜013 のテストケースに requestId 整合性の回帰テストが含まれている                                       |
| G-03 | handoff 条件チェックリスト（`docs/30-workflows/unassigned-task/RALLY-002-handoff-checklist.md`）が作成されている |

### 2.3 スコープ

#### 含むもの

- RALLY-002 Phase 12 Step 1-C の内容を元にした handoff 条件チェックリスト作成
- RALLY-010〜013 の各仕様書 Phase 1 への前提条件セクション追加
- RALLY-010〜013 の各仕様書 Phase 4（テスト計画）への requestId 整合性テストケース追加
- クロスチェック: 各タスクで RALLY-002 修正前のコードを誤って参照していないか確認

#### 含まないもの

- RALLY-010〜013 の実装そのもの
- `ConversationalInterview.tsx` の追加変更
- RALLY-010〜013 以外のタスク仕様書への影響調査

### 2.4 受入条件（Acceptance Criteria）

| AC   | 条件                                                                                                    | 検証方法                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| AC-1 | `RALLY-002-handoff-checklist.md` が作成されており、3つの handoff ルールが列挙されている                 | ファイル存在確認 + 内容確認                                                     |
| AC-2 | RALLY-010〜013 の各仕様書 Phase 1 に RALLY-002 前提条件チェックリストへの参照または内容が記載されている | 各仕様書を読み、前提条件セクションの存在を確認                                  |
| AC-3 | RALLY-010〜013 の各仕様書 Phase 4 に requestId 整合性テストケースが含まれている                         | 各仕様書 Phase 4 を読み、requestId に関するテスト観点が記載されていることを確認 |
| AC-4 | 各タスクで `buildSubmission` の引数が `restoredPendingRequest` 優先のコードを参照していることを確認済み | コードレビューまたは仕様書上のコード例でパターンを確認                          |

### 2.5 成果物

| 成果物                                                             | 内容                                           |
| ------------------------------------------------------------------ | ---------------------------------------------- |
| `docs/30-workflows/unassigned-task/RALLY-002-handoff-checklist.md` | handoff 条件チェックリスト（単独ドキュメント） |
| RALLY-010〜013 各仕様書への前提条件記載（差分）                    | 各仕様書 Phase 1 への追記                      |
| RALLY-010〜013 各仕様書への requestId 整合性テストケース（差分）   | 各仕様書 Phase 4 への追記                      |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| 確認項目                                                     | 確認方法                                                                                                             |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| TASK-RALLY-002 が完了済みであること                          | `git log --oneline` で RALLY-002 関連コミットを確認する                                                              |
| RALLY-002 Phase 12 Step 1-C の内容を把握していること         | `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/outputs/phase-12/system-spec-update-summary.md` を読む |
| RALLY-010〜013 のタスク仕様書が作成されていること            | `docs/30-workflows/unassigned-task/` を検索し、RALLY-010〜013 に相当する仕様書の存在を確認する                       |
| `ConversationalInterview.tsx` の現在の実装を把握していること | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` を読む                                      |

### 3.2 依存タスク

| タスクID       | 状態                             | 関係                                                             |
| -------------- | -------------------------------- | ---------------------------------------------------------------- |
| TASK-RALLY-002 | 完了済み                         | handoff 条件の発生源。本タスクの前提                             |
| RALLY-010〜013 | 仕様書作成待ち（存在しない場合） | 本タスクの変更対象。仕様書が存在しない場合は仕様書作成から始める |

> **注意**: RALLY-010〜013 の仕様書が存在しない場合は、本タスクの Phase 1 で仕様書作成を優先する。

### 3.3 RALLY-002 で確立した handoff ルール（必読）

```ts
// 優先規則（requestId drift を防ぐ）
const pendingRequest =
  restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null;

// buildSubmission 引数は restored 優先の pendingRequest を使う
const submission = interview.buildSubmission(
  {
    ...workflowSnapshot,
    awaitingUserInput: pendingRequest,
  },
  answer,
);
```

| ルール番号 | 内容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| R-1        | `restored requestId` を `submitAnswer` の `buildSubmission` 引数として使う                  |
| R-2        | 新しい `workflowSnapshot.awaitingUserInput.requestId` が到着するまで restored UI を維持する |
| R-3        | `restoredPendingRequest` の clear は submit 成功時ではなく、新 snapshot 到着時に行う        |

### 3.4 推奨アプローチ

1. RALLY-002 Phase 12 Step 1-C の内容を元に handoff 条件チェックリストを作成する
2. RALLY-010〜013 の各仕様書 Phase 1 に前提条件セクションを追加する
3. RALLY-010〜013 の各仕様書 Phase 4（テスト計画）に requestId 整合性テストケースを追加する
4. クロスチェック: 各タスクで RALLY-002 修正前のコードを誤って参照していないか確認する

---

## 4. 実行手順（Phase 構成）

### Phase 1: 要件定義

**目的**: RALLY-010〜013 の仕様書存在確認と handoff 条件の棚卸しを行う。

**作業内容**:

1. `docs/30-workflows/unassigned-task/` を検索し、RALLY-010〜013 に相当する仕様書を特定する
2. 仕様書が存在しない場合は Phase 1 の範囲で仕様書作成の着手を判断する
3. RALLY-002 の実装ガイド（`outputs/phase-12/implementation-guide.md`）を読み、handoff 必須事項を確定する
4. AC-1〜AC-4 を本タスクの文脈で確認可能な形で文書化する

**完了条件**:

- RALLY-010〜013 の各仕様書の存在・不存在が確認されている
- handoff 対象の 3 ルール（R-1〜R-3）が文書化されている

---

### Phase 2: 設計

**目的**: handoff チェックリストと各仕様書への追記内容を設計する。

**作業内容**:

1. `RALLY-002-handoff-checklist.md` の構成を設計する（ルール一覧・コード例・検証観点）
2. RALLY-010〜013 各仕様書 Phase 1 への追記フォーマットを統一する
3. RALLY-010〜013 各仕様書 Phase 4 への requestId 整合性テストケースのドラフトを作成する
4. 設計内容を `outputs/phase-2/design.md` に記録する

**完了条件**:

- チェックリストの構成が確定している
- 各仕様書への追記内容（前提条件 + テストケース）のドラフトが揃っている

---

### Phase 3: 設計レビューゲート

**目的**: Phase 2 の設計を Phase 4 へ進めるか判定する。

**レビュー観点**:

| 観点                                | 確認内容                                                               |
| ----------------------------------- | ---------------------------------------------------------------------- |
| handoff ルールの網羅性              | R-1〜R-3 が全て handoff チェックリストに含まれているか                 |
| RALLY-010〜013 への追記内容の整合性 | 各仕様書の文脈に合った記述になっているか                               |
| requestId 整合性テストの具体性      | テストケースが「requestId が restored 由来であること」を検証できる形か |
| RALLY-002 修正後コードの参照確認    | `buildSubmission` の引数パターンが正しく記載されているか               |

**判定基準**:

- PASS: 全観点がクリアされれば Phase 4 へ進む
- MAJOR: 追記内容に不整合がある場合は Phase 2 に戻る
- CRITICAL: RALLY-010〜013 の仕様書が存在しない場合は Phase 1 に戻る

---

### Phase 4: テスト設計

**目的**: 変更後の検証方法を設計する。

**検証ケース**:

| VC ID | 対応 AC | 検証内容                                                                       | 確認方法                                                           |
| ----- | ------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| VC-01 | AC-1    | `RALLY-002-handoff-checklist.md` に R-1〜R-3 が記載されている                  | ファイルを読み、3ルールの存在を確認                                |
| VC-02 | AC-2    | RALLY-010〜013 各仕様書 Phase 1 に前提条件セクションが存在する                 | 各仕様書を読み、「RALLY-002 前提条件」に関する記述があることを確認 |
| VC-03 | AC-3    | RALLY-010〜013 各仕様書 Phase 4 に requestId 整合性テストが含まれる            | 各仕様書 Phase 4 を読み、requestId 検証の観点があることを確認      |
| VC-04 | AC-4    | `buildSubmission` 引数に `restoredPendingRequest` 優先パターンが反映されている | 仕様書上のコード例または実装コードを確認                           |

---

### Phase 5: 実装

**目的**: handoff チェックリストと各仕様書への追記を実施する。

**実装ステップ**:

1. `docs/30-workflows/unassigned-task/RALLY-002-handoff-checklist.md` を作成する
2. RALLY-010〜013 の各仕様書 Phase 1 に前提条件セクションを追記する
3. RALLY-010〜013 の各仕様書 Phase 4 に requestId 整合性テストケースを追記する
4. VC-01〜VC-04 を実行して検証する

---

### Phase 6: テスト拡充

**目的**: requestId 整合性テストのカバレッジを確認し、不足があれば補完する。

**確認項目**:

| 確認項目                                                                    | 基準                                                             |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| undo 復元後の submit が restored requestId を使うテストが存在するか         | `ConversationalInterview.restoredPendingRequest.test.tsx` を確認 |
| 新 snapshot 到着時に restored state がクリアされるテストが存在するか        | 同テストファイルを確認                                           |
| stale fallback 防止（submit 成功直後の早期 clear を防ぐ）テストが存在するか | 同テストファイルを確認                                           |

---

### Phase 7: カバレッジ確認

**目的**: 全 AC・VC が達成されていることを確認する。

**確認コマンド**:

```bash
# handoff チェックリストの存在確認
ls docs/30-workflows/unassigned-task/RALLY-002-handoff-checklist.md

# RALLY-010〜013 仕様書への前提条件記載確認（ファイル名は Phase 1 で確定）
grep -l "RALLY-002" docs/30-workflows/unassigned-task/RALLY-01*.md

# requestId 整合性テストの存在確認
grep -n "requestId" apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx
```

---

### Phase 8: リファクタリング

**目的**: 追記内容のフォーマットを統一し、読みやすさを改善する。

**作業内容**:

1. RALLY-010〜013 各仕様書の前提条件セクションのフォーマットを統一する
2. handoff チェックリストの表記を揃える
3. 重複記述がある場合はチェックリストへの参照に統一する

---

### Phase 9: 品質保証

**目的**: 変更ファイルの品質ゲートをクリアする。

**実行コマンド**:

```bash
# Markdown lint（フォーマット崩れがないか）
pnpm --filter @repo/desktop lint

# TypeScript 型チェック（テスト追加がある場合）
pnpm --filter @repo/desktop typecheck

# handoff チェックリストの R-1〜R-3 存在確認
grep -c "R-1\|R-2\|R-3\|restored requestId\|restoredPendingRequest" \
  docs/30-workflows/unassigned-task/RALLY-002-handoff-checklist.md
```

**合格基準**:

- lint・typecheck がエラーなし
- `RALLY-002-handoff-checklist.md` に 3 ルール全てが記載されている
- RALLY-010〜013 各仕様書に前提条件セクションが存在する

---

### Phase 10: 最終レビュー

**目的**: AC-1〜AC-4 の完了判定を行い、マージ可能かどうかを判断する。

**確認チェックリスト**:

- [ ] AC-1: `RALLY-002-handoff-checklist.md` が作成されており、R-1〜R-3 が列挙されている
- [ ] AC-2: RALLY-010〜013 の各仕様書 Phase 1 に RALLY-002 前提条件が記載されている
- [ ] AC-3: RALLY-010〜013 の各仕様書 Phase 4 に requestId 整合性テストケースが含まれている
- [ ] AC-4: `buildSubmission` 引数パターンが正しく反映されていることを確認済み

**判定基準**:

- PASS: 全 AC がクリアされれば Phase 11 へ進む
- MAJOR: AC 未達の場合は対応 Phase に戻る
- CRITICAL: RALLY-010〜013 仕様書が存在しない場合は Phase 1 に戻る

---

### Phase 11: 手動テスト

**目的**: 追記内容が実際に後続実装者の手引きとして機能するかを確認する。

> **注記**: 本タスクは NON_VISUAL タスク。スクリーンショット取得は不要。
> 代替証跡として `outputs/phase-11/manual-test-result.md` を作成する。

**確認手順**:

1. `RALLY-002-handoff-checklist.md` を読み、R-1〜R-3 が明確に説明されているかを確認する
2. RALLY-010〜013 の仕様書を読み、前提条件セクションが「実装者が見落とさないレベルの記述」になっているかを確認する
3. requestId 整合性テストケースが「100人中100人が同じ実装をできる具体性」かを確認する
4. 確認結果を `outputs/phase-11/manual-test-result.md` に記録する

**Phase 11 NON_VISUAL 宣言**:

本タスクは `NON_VISUAL` タスクのため、`outputs/phase-11/manual-test-checklist.md` に
`NON_VISUAL: true` を明示して記録する。

---

### Phase 12: ドキュメント更新

**目的**: 実装ガイド・未タスク検出・フィードバックレポートを記録する。

**作成する成果物**:

| 成果物                                          | 内容                                                    |
| ----------------------------------------------- | ------------------------------------------------------- |
| `outputs/phase-12/implementation-guide.md`      | 変更ファイル一覧・handoff 条件記録・苦戦箇所の記録      |
| `outputs/phase-12/unassigned-task-detection.md` | 本タスク実施中に発見された未タスクの一覧（0件でも記録） |
| `outputs/phase-12/skill-feedback-report.md`     | スキルへのフィードバック・改善点（なしでも記録）        |

**記録必須項目（implementation-guide.md）**:

- 追記した仕様書ファイル一覧と変更概要
- RALLY-002 handoff ルール R-1〜R-3 の最終確認内容
- 苦戦箇所と解決策（セクション 5 を参照）

---

### Phase 13: PR 作成

**目的**: ユーザーの承認を得た後に PR を作成する。

> **重要**: このフェーズはユーザーの明示的な承認なしに実行禁止。

**PR 作成手順**:

1. `git status` で変更ファイルを確認する
2. `git diff` で変更内容を最終確認する
3. コミットメッセージ案をユーザーに提示し承認を得る
4. `gh pr create` で PR を作成する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-1: `RALLY-002-handoff-checklist.md` が作成されており、R-1〜R-3 が列挙されている
- [ ] AC-2: RALLY-010〜013 の各仕様書 Phase 1 に RALLY-002 前提条件が記載されている
- [ ] AC-3: RALLY-010〜013 の各仕様書 Phase 4 に requestId 整合性テストケースが含まれている
- [ ] AC-4: `buildSubmission` 引数パターンが `restoredPendingRequest` 優先で統一されていることを確認済み

### 品質要件

- [ ] lint・typecheck がエラーなし
- [ ] `RALLY-002-handoff-checklist.md` の Markdown 構文が崩れていない
- [ ] RALLY-010〜013 各仕様書の Markdown 構文が崩れていない

### ドキュメント要件

- [ ] `outputs/phase-12/implementation-guide.md` が作成されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件でも出力）
- [ ] `outputs/phase-12/skill-feedback-report.md` が作成されている

---

## 6. 検証方法

### 6.1 handoff チェックリスト存在確認

```bash
ls -la docs/30-workflows/unassigned-task/RALLY-002-handoff-checklist.md
```

### 6.2 前提条件記載確認

```bash
# RALLY-010〜013 仕様書への RALLY-002 言及確認（ファイル名は Phase 1 で確定）
grep -rn "RALLY-002" docs/30-workflows/unassigned-task/ | grep -i "rally-01"
```

### 6.3 requestId テストケース確認

```bash
# 既存テストファイルの requestId テスト確認
grep -n "requestId" \
  apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx
```

### 6.4 手動検証ポイント（AC-4）

| 確認項目                                                                   | 確認方法                                                            |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `buildSubmission` の引数に `restoredPendingRequest` 優先ロジックが存在する | `ConversationalInterview.tsx` を読み、`pendingRequest` の定義を確認 |
| RALLY-010〜013 がこのパターンを前提として仕様書に記載している              | 各仕様書の前提条件セクションを確認                                  |

---

## 7. リスクと対策

| リスク                                                                         | 影響度 | 発生確率 | 対策                                                                                                         |
| ------------------------------------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------------------------------------ |
| RALLY-010〜013 の仕様書が存在しない                                            | 高     | 高       | Phase 1 で存在確認を行い、存在しない場合は仕様書作成を優先する                                               |
| RALLY-010〜013 の仕様書フォーマットが本タスクの想定と異なる                    | 中     | 中       | Phase 2 でフォーマットを確認し、追記方法を仕様書のスタイルに合わせる                                         |
| requestId drift が RALLY-010〜013 の他の箇所でも発生している可能性             | 高     | 中       | Phase 6 のテスト拡充で `useCallback` 依存配列と `buildSubmission` 引数の両方を確認する                       |
| 「変更不要」と初期判定したものに後から実害バグが発見される（RALLY-002 の再現） | 高     | 中       | Phase 3 のレビューゲートで「コメント変更のみ」の判定を特に慎重に再検証し、実害バグの見落としがないか確認する |
| handoff チェックリストの内容が実装者に届かない（仕様書未参照）                 | 中     | 低       | チェックリストへの参照リンクを各仕様書 Phase 1 の冒頭に配置し、見落としを防ぐ                                |

---

## 8. 参照情報

| 参照先                                                                                                                    | 目的                                    |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/outputs/phase-12/system-spec-update-summary.md`（Step 1-C） | handoff 条件の発生源（本タスクの根拠）  |
| `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/outputs/phase-12/implementation-guide.md`                   | R-1〜R-3 の技術的根拠・コード例         |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                                                  | handoff ルールが実装された現在のコード  |
| `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx`            | requestId 整合性テストの実装例          |
| `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/phase-12-documentation.md`                                  | Phase 12 仕様（Task 12-1〜12-5 の構造） |

---

## 9. 備考（苦戦箇所【記入必須】）

### 9.1 RALLY-002 の教訓（本タスクに直接関係する再発防止ポイント）

RALLY-002 の `verify_existing` タスクで発見されたバグ（requestId drift）は、初期判定では「コメント整流のみ」とされていた。
Phase 3 のレビューで実害バグと再判定された経緯がある。

> 後続タスクでも「変更不要」と判定したものを慎重に再検証する習慣が重要。

以下の確認ポイントを RALLY-010〜013 の実装者が必ず確認すること:

| 確認ポイント                                                          | 誤った実装パターン                              | 正しい実装パターン                                                    |
| --------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------- |
| `useCallback` の依存配列に `pendingRequest` が含まれているか          | `[workflowSnapshot]` のみ                       | `[pendingRequest, workflowSnapshot]`（または適切な派生値）            |
| `buildSubmission` の引数が正しい `awaitingUserInput` を参照しているか | `workflowSnapshot.awaitingUserInput` を直接渡す | `restoredPendingRequest ?? workflowSnapshot.awaitingUserInput` を渡す |
| `restoredPendingRequest` の clear タイミング                          | submit 成功のコールバックで即時 clear           | 新 snapshot の `requestId` が変化したときに clear                     |

### 9.2 事前に予測される苦戦箇所

実施前の時点での予測リスクを記録する。**実施後は各行の「実際の結果」列を更新すること**。

| 苦戦箇所                                           | 原因                                                                         | 対応策（予測）                                                                           | 実際の結果（実施後に記入） |
| -------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------- |
| RALLY-010〜013 の仕様書が存在しない                | 後続タスクが未着手の場合、仕様書自体が作成されていない可能性が高い           | Phase 1 で存在確認を優先し、存在しない場合は `task-specification-creator` で仕様書を作成 | （実施後に記入）           |
| RALLY-010〜013 のスコープが不明確                  | RALLY-002 のドキュメントが RALLY-010〜013 の仕様を明示していない可能性がある | RALLY-002 の関連タスクリストや wave0 の index.md を参照してスコープを特定する            | （実施後に記入）           |
| requestId drift の再発箇所を網羅的に特定しにくい   | `ConversationalInterview.tsx` が複数の requestId 参照箇所を持つ場合がある    | Phase 1 でコードを全文読み、`requestId` の参照箇所を全てリストアップする                 | （実施後に記入）           |
| 「変更不要」判定の再発（RALLY-002 と同じパターン） | 差分が小さく見えるため、実害バグを見落とすリスクが高い                       | Phase 3 レビューで「コメント変更のみ」「変更不要」と判定したものを特に厳しく再検証する   | （実施後に記入）           |

### 9.3 背景コンテキスト（将来実装者へ）

- 本タスクは TASK-RALLY-002 Phase 12 `system-spec-update-summary.md` の Step 1-C で記録された
  handoff 条件を RALLY-010〜013 の実装者に確実に伝達するための品質保証タスクである。

- RALLY-002 で修正した requestId drift バグの核心は、**「表示中の質問」と「送信先の質問」のズレ**である。
  undo 操作後に restored されたリクエストを画面に表示しているにもかかわらず、
  submit 時に live snapshot の requestId を使ってしまうと、ユーザーの回答が意図しない質問へ送信される。

- **100人中100人が同じ理解で実行できる**ために特に重要なポイント:
  1. Phase 1 で RALLY-010〜013 の仕様書存在確認を必ず行い、存在しない場合は仕様書作成から着手する
  2. handoff チェックリストは「実装者が見落とさないレベルの具体性」で記述する（コード例必須）
  3. Phase 3 のレビューゲートで「変更不要」「コメントのみ」の判定は特に慎重に再検証する
  4. Phase 13 はユーザーの明示的な承認なしに絶対に実行しない
