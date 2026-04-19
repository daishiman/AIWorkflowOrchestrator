# TASK-SKILL-SPEC-NON-VISUAL-RULE-001 - タスク指示書

## メタ情報

```yaml
issue_number: 2295
```

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | TASK-SKILL-SPEC-NON-VISUAL-RULE-001                        |
| タスク名     | NON_VISUALタスクのPhase 11/12補助成果物ルール強化          |
| 分類         | ドキュメント改善 / 運用強化                                |
| 対象機能     | task-specification-creator スキル（Phase 11/12 close-out） |
| 優先度       | 低                                                         |
| 見積もり規模 | 小規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | TASK-SW-STRUCT-LLM-002 Phase 12 skill-feedback-report.md   |
| 発見日       | 2026-04-19                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SW-STRUCT-LLM-002 の実装（LLM features 自動生成）は UI/UX 変更なし（NON_VISUAL タスク）であった。
このとき、`manual-test-result.md` だけで Phase 11 の証跡を閉じようとしたが、`task-specification-creator`
スキルは Phase 11/12 close-out として以下の補助成果物も必要としている：

- `manual-test-checklist.md`
- `discovered-issues.md`
- `phase11-capture-metadata.json`
- `screenshot-plan.json`

これらが「同一 wave（同一実行ターン）」で生成される必要があることが `SKILL.md` に明記されていなかったため、
実装担当者が手動確認中に漏れを発見した。担当者は `manual-test-result.md` に事後記録（「validator 互換のため
同 wave で生成」）を残すことで対処したが、次回の NON_VISUAL タスク実施時に同様の漏れが再発するリスクが残っている。

### 1.2 問題の構造

| 問題                                               | 内容                                                                                                                                         |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| SKILL.md の記述が不完全                            | Phase 11/12 close-out の NON_VISUAL タスク向け補助成果物（4ファイル）の「同一 wave 生成」ルールが明記されていない                            |
| NON_VISUAL 判定条件が暗黙的                        | 「UI/UX 変更なし」という判定基準が定義されているが、判定に迷うケース（例：main process のみ変更・shared 型追加）に対する具体例が不足している |
| 漏れ発見が実装担当者の手動確認に依存している       | 現状は担当者が Phase 11 を実施する時点で気づく構造であり、チェックリストやゲート条件として機能していない                                     |
| `.agents` mirror が `.claude` canonical から遅れる | NON_VISUAL ルールの追記を `.claude` canonical に行っても `.agents` mirror への同期タイミングが保証されていない                               |

### 1.3 放置した場合の影響

- NON_VISUAL タスクの Phase 11 close-out で補助成果物が毎回手動で後付け生成される
- `manual-test-result.md` に「validator 互換のため生成」という事後説明コメントが再発する
- `task-specification-creator` スキルを使って実装するすべての NON_VISUAL タスクで同一の手戻りが発生する
- `.agents` mirror と `.claude` canonical の乖離が蓄積し、スキル品質の二重管理コストが増大する

---

## 2. 何を達成するか（What）

### 2.1 目的

`task-specification-creator` スキルの `SKILL.md` と関連ドキュメントに、NON_VISUAL タスクの
Phase 11/12 close-out における補助成果物の「同一 wave 生成」ルールを明示的に追記する。
これにより、将来の実装担当者が漏れなく補助成果物を生成できる定型チェックを確立する。

### 2.2 最終ゴール

| ID   | 達成すること                                                                                                    |
| ---- | --------------------------------------------------------------------------------------------------------------- |
| G-01 | `SKILL.md` の Phase 11/12 記述に NON_VISUAL タスク向け補助成果物（4ファイル）の同一 wave 生成ルールが追記される |
| G-02 | NON_VISUAL タスクの判定条件（UI/UX 変更なし）が SKILL.md に具体例付きで定義される                               |
| G-03 | `.agents` mirror が `.claude` canonical と同期される                                                            |
| G-04 | `pnpm --filter @repo/desktop typecheck` がエラー 0 であることが確認される（コード変更なし想定）                 |

### 2.3 スコープ

**含むもの**:

- `.claude/skills/task-specification-creator/SKILL.md` への追記
  - Phase 11/12 close-out セクションの NON_VISUAL タスク向け補助成果物生成ルール
  - NON_VISUAL 判定条件の具体例（main process のみ変更・shared 型追加・スクリプト追加 など）
  - 同一 wave 生成が必要な 4 ファイルの明示
- `.agents/skills/task-specification-creator/SKILL.md` への同期（mirror 更新）

**含まないもの**:

- `task-specification-creator` スキルのロジック変更（スクリプト・JSON スキーマへの変更）
- 既存の Phase 11/12 close-out 手順全体の再設計
- 他スキルへの影響（`aiworkflow-requirements` など）
- コードベースへの変更（TypeScript ファイルの修正）

### 2.4 受入条件

| AC   | 条件                                                                                                                                              | 検証方法                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| AC-1 | `task-specification-creator/SKILL.md` の Phase 11/12 記述に、NON_VISUAL タスク向け補助成果物（4ファイル）の「同一wave生成」ルールが追記されている | SKILL.md を開き、Phase 11/12 セクションに 4ファイル名と「同一 wave」という記述があることを確認     |
| AC-2 | NON_VISUAL タスクの判定条件（UI変更なし）が SKILL.md に定義されている                                                                             | SKILL.md に「NON_VISUAL 判定基準」セクションまたは対応する記述があることを確認                     |
| AC-3 | `.agents` mirror が `.claude` canonical と同期されている                                                                                          | `.agents/skills/task-specification-creator/SKILL.md` と `.claude/` 版の diff が 0 であることを確認 |
| AC-4 | `pnpm --filter @repo/desktop typecheck` がエラー 0                                                                                                | ローカルで typecheck を実行し、エラー 0 を確認                                                     |

### 2.5 成果物

| 成果物                                                       | 内容                                                     |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| `.claude/skills/task-specification-creator/SKILL.md`         | Phase 11/12 close-out セクションに NON_VISUAL ルール追記 |
| `.agents/skills/task-specification-creator/SKILL.md`         | `.claude` canonical から mirror 同期                     |
| `outputs/phase-12/implementation-guide.md`（本タスク出力先） | 追記した内容の概要・変更箇所・苦戦箇所の記録             |
| `outputs/phase-12/unassigned-task-detection.md`（同上）      | 本タスク実施中に発見された未タスク一覧（0件でも記録）    |
| `outputs/phase-12/skill-feedback-report.md`（同上）          | スキルへのフィードバック・改善点（なしでも記録）         |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| 確認項目                                                                               | 確認方法                                                                                                                |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/task-specification-creator/SKILL.md` の現状 Phase 11/12 記述を把握する | SKILL.md の Phase 11/12 セクションを読み、現在の NON_VISUAL ルール記述の有無を確認する                                  |
| TASK-SW-STRUCT-LLM-002 の `skill-feedback-report.md` の内容を把握する                  | `docs/30-workflows/TASK-SW-STRUCT-LLM-002/outputs/phase-12/skill-feedback-report.md` を参照する                         |
| TASK-SW-STRUCT-LLM-002 の `manual-test-result.md` の末尾記録を把握する                 | `outputs/phase-11/manual-test-result.md` の「実行記録」セクションを確認する                                             |
| `.agents` mirror と `.claude` canonical の現在の diff を確認する                       | `diff .claude/skills/task-specification-creator/SKILL.md .agents/skills/task-specification-creator/SKILL.md` を実行する |

### 3.2 依存タスク

| タスクID                  | 状態         | 関係                                                               |
| ------------------------- | ------------ | ------------------------------------------------------------------ |
| TASK-SW-STRUCT-LLM-002    | 完了済み想定 | 発見元タスク。本タスクの背景コンテキストを提供する                 |
| TASK-CONFLICT-PREVENT-001 | 完了済み想定 | `.claude/skills` 系コンフリクト防止仕様（mirror 同期ルールの前提） |

### 3.3 アーキテクチャ設計方針

**変更前（現状）**:

```markdown
# SKILL.md（現状）

## Phase 12 重要仕様

...

- VISUAL タスクでは Phase 11 の screenshot references と capture metadata を `implementation-guide.md` へ必ず明記する
- **NON_VISUAL タスク（UI/UX変更なし）** では `## 視覚証跡` セクションに
  `UI/UX変更なしのため Phase 11 スクリーンショット不要` と明記し、
  `screenshots/.gitkeep` を削除する。代替証跡として `phase-10/final-review-result.md` と
  `phase-11/manual-test-result.md` を参照する
```

**変更後（追記後）**:

```markdown
# SKILL.md（追記後）

## Phase 11/12 close-out: NON_VISUAL タスクの補助成果物ルール

### NON_VISUAL 判定条件

以下の**すべてに該当する**場合は NON_VISUAL タスクとして扱う：

- renderer / UI コンポーネントへの変更がない
- CSS / Tailwind クラスへの変更がない
- IPC チャネルの追加・変更がない（main process 内部変更のみ）

典型例：

- main process サービス（`*.ts` in `services/`）のロジック追加
- 補助スクリプト（`scripts/*.js`）の追加
- shared 型定義のみの変更（renderer 参照なし）

### 補助成果物の同一 wave 生成ルール

NON_VISUAL タスクの Phase 11 close-out では、`manual-test-result.md` に加えて
**以下 4 ファイルを同一 wave（同一実行ターン）で必ず生成する**：

| ファイル                        | 内容                                                  |
| ------------------------------- | ----------------------------------------------------- |
| `manual-test-checklist.md`      | テスト項目チェックリスト（NON_VISUAL 判定理由を含む） |
| `discovered-issues.md`          | 発見された課題一覧（0件でも出力）                     |
| `phase11-capture-metadata.json` | キャプチャメタデータ（`CAPTURE_BLOCKED` を明示）      |
| `screenshot-plan.json`          | スクリーンショット計画（`non_visual: true` を明示）   |

> **重要**: これらを別ターンで生成したり `manual-test-result.md` に後付けで言及するだけでは
> validator 互換として不十分。**必ず同一 wave で全 5 ファイルを出力すること。**
```

### 3.4 主要ファイルと役割

| ファイル                                                                             | 役割                                                       |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `.claude/skills/task-specification-creator/SKILL.md`                                 | canonical 版。追記対象（Phase 11/12 close-out セクション） |
| `.agents/skills/task-specification-creator/SKILL.md`                                 | mirror 版。canonical 追記後に同期対象                      |
| `docs/30-workflows/TASK-SW-STRUCT-LLM-002/outputs/phase-12/skill-feedback-report.md` | 本タスク発見元。追記内容の要件定義ソース                   |

---

## 4. 実行手順（Phase 構成）

### Phase 1: 要件定義

**目的**: 追記内容と受入条件を確定する。

**作業内容**:

1. `.claude/skills/task-specification-creator/SKILL.md` の Phase 11/12 close-out セクション現状を読む
2. TASK-SW-STRUCT-LLM-002 の `skill-feedback-report.md` と `manual-test-result.md` を確認し、
   漏れた補助成果物 4 ファイルの正確な名前とコンテンツ形式を把握する
3. NON_VISUAL 判定条件の具体例（main process のみ変更・補助スクリプト追加・shared 型追加）を整理する
4. 追記する内容の構造（セクション位置・記述粒度）を決定する
5. AC-1〜AC-4 を検証可能な形で確定する

**完了条件**:

- 補助成果物 4 ファイルの正確な名前（`manual-test-checklist.md` など）が文書化されている
- NON_VISUAL 判定条件の具体例が 3 件以上リストアップされている
- 追記するセクションの位置（既存テキストの何行目付近）が特定されている

---

### Phase 2: 設計

**目的**: SKILL.md の具体的な追記内容を設計する。

**作業内容**:

1. NON_VISUAL 判定条件の定義文（箇条書き形式）を設計する
2. 補助成果物 4 ファイルの同一 wave 生成ルールの説明文を設計する
3. 各ファイルの内容ひな型（`CAPTURE_BLOCKED` 明示など）を設計する
4. 既存の `VISUAL タスク` との対比で記述が矛盾しないことを確認する
5. `.agents` mirror への同期手順を確認する

**完了条件**:

- SKILL.md に追記する全テキストが Draft として出力されている
- 既存の Phase 11/12 記述との矛盾がないことが確認されている

---

### Phase 3: 設計レビューゲート

**目的**: Phase 2 の設計を Phase 5 へ進めるか判定する。

**レビュー観点**:

| 観点                         | 確認内容                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| 既存記述との整合性           | 現状の `VISUAL タスク` 向けルールと NON_VISUAL 向けルールが矛盾していないか            |
| 補助成果物ファイル名の正確性 | 4 ファイル名が TASK-SW-STRUCT-LLM-002 の実際の成果物と一致しているか                   |
| 判定条件の明確性             | NON_VISUAL と判定できない曖昧なケース（例：IPC 変更あり＋UI 変更なし）に対応しているか |
| mirror 同期手順の妥当性      | `.agents` mirror への同期が TASK-CONFLICT-PREVENT-001 の仕様に準拠しているか           |

**判定基準**:

- PASS: 全観点がクリアされれば Phase 5 へ進む
- MAJOR: 記述に矛盾がある場合は Phase 2 に戻る
- CRITICAL: 前提条件（依存タスク未確認など）がある場合は Phase 1 に戻る

---

### Phase 4: テスト設計

**目的**: 変更後の SKILL.md を検証するためのレビューチェックリストを設計する。

> 本タスクはドキュメント変更のみのため、コードテストは不要。
> 代わりに「SKILL.md が AC を満たしているか」を確認するレビューチェックリストを設計する。

**チェック項目**:

| チェック ID | 対応 AC | 確認内容                                                                                                                                                                |
| ----------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CHK-01      | AC-1    | Phase 11/12 セクションに `manual-test-checklist.md` / `discovered-issues.md` / `phase11-capture-metadata.json` / `screenshot-plan.json` の 4 ファイル名が記載されている |
| CHK-02      | AC-1    | 「同一 wave」または「同一実行ターン」という記述が含まれている                                                                                                           |
| CHK-03      | AC-2    | NON_VISUAL 判定条件（renderer 変更なし・CSS 変更なし・IPC 追加なし）が明記されている                                                                                    |
| CHK-04      | AC-2    | NON_VISUAL の具体例が 2 件以上記載されている                                                                                                                            |
| CHK-05      | AC-3    | `.agents` mirror と `.claude` canonical の diff が 0 である                                                                                                             |
| CHK-06      | AC-4    | `pnpm --filter @repo/desktop typecheck` がエラー 0 である                                                                                                               |

---

### Phase 5: 実装計画

**目的**: Phase 3 でレビュー済みの設計を元に、SKILL.md への追記手順を決定する。

**実装ステップ**:

1. `.claude/skills/task-specification-creator/SKILL.md` のバックアップ状況を確認する（git 管理下のため不要）
2. SKILL.md の Phase 11/12 close-out セクションを特定し、追記位置を確定する
3. NON_VISUAL 判定条件の定義文を追記する
4. 補助成果物 4 ファイルの同一 wave 生成ルールを追記する
5. `.agents/skills/task-specification-creator/SKILL.md` を `.claude` canonical と同期する
6. CHK-01〜CHK-06 のチェックリストで検証する

---

### Phase 6: テスト実装（レビューチェック）

**目的**: Phase 4 で設計したチェックリストを使って SKILL.md の追記内容を検証する。

**作業内容**:

1. 変更後の SKILL.md を読み、CHK-01〜CHK-04 を一つずつ確認する
2. `.agents` mirror と `.claude` canonical の diff を確認し、CHK-05 を検証する
3. `pnpm --filter @repo/desktop typecheck` を実行し、CHK-06 を検証する

---

### Phase 7: カバレッジ確認

**目的**: 追記内容が意図した範囲をカバーしていることを確認する。

**確認項目**:

| 確認項目                                  | 基準                                                              |
| ----------------------------------------- | ----------------------------------------------------------------- |
| NON_VISUAL 判定条件の網羅性               | 典型的な NON_VISUAL タスクパターン（3種類以上）がカバーされている |
| 補助成果物 4 ファイルが全て明示されている | CHK-01 が PASS                                                    |
| 同一 wave 生成の強制力が記述されている    | CHK-02 が PASS（強調形式で記載されている）                        |
| VISUAL タスクとの記述整合性               | 既存の VISUAL 向けルールと矛盾がない                              |

---

### Phase 8: リファクタリング

**目的**: 追記した記述の表現を最適化し、可読性を向上させる。

**確認観点**:

- NON_VISUAL 判定条件の箇条書きが簡潔で曖昧でないか
- 補助成果物の同一 wave ルールが強調形式（`> **重要**` など）で記載されているか
- 既存の Phase 12 記述との文体・スタイルが統一されているか
- ファイル名がコードスタイル（バッククォート）で記述されているか

---

### Phase 9: 品質保証

**目的**: SKILL.md の追記内容が品質ゲートをクリアしていることを確認する。

**実行コマンド**:

```bash
# mirror と canonical の差分確認
diff .claude/skills/task-specification-creator/SKILL.md \
     .agents/skills/task-specification-creator/SKILL.md

# 型チェック（コード変更なし確認）
pnpm --filter @repo/desktop typecheck 2>&1 | grep -E "error|Error" | head -20
```

**合格基準**:

- `diff` の出力が 0 行（完全一致）
- `typecheck` エラー 0

---

### Phase 10: 最終レビュー

**目的**: AC-1〜AC-4 の完了判定を行い、マージ可能かどうかを判断する。

**確認チェックリスト**:

- [ ] AC-1: Phase 11/12 記述に NON_VISUAL タスク向け補助成果物（4ファイル）の同一 wave 生成ルールが追記されている
- [ ] AC-2: NON_VISUAL 判定条件が SKILL.md に定義されている
- [ ] AC-3: `.agents` mirror が `.claude` canonical と同期されている
- [ ] AC-4: `pnpm --filter @repo/desktop typecheck` がエラー 0

**判定基準**:

- PASS: 全 AC がクリアされれば Phase 11 へ進む
- MAJOR: AC 未達の場合は対応 Phase に戻る

---

### Phase 11: 手動テスト

**目的**: 追記内容が将来の実装担当者に伝わるかどうかを人間が確認する。

> 本タスクは NON_VISUAL タスク（UI 変更なし）のため、スクリーンショットは不要。
> 補助成果物 4 ファイルを同一 wave で生成する。

**確認手順**:

1. `.claude/skills/task-specification-creator/SKILL.md` を開く
2. Phase 11/12 close-out セクションを読み、追記した内容が自然な流れで読めることを確認する
3. NON_VISUAL 判定条件の記述を読み、「main process のみ変更」が NON_VISUAL に該当することが
   判断できることを確認する
4. 補助成果物 4 ファイルの同一 wave 生成ルールが強調形式で明記されていることを確認する

**生成する補助成果物（同一 wave）**:

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/discovered-issues.md`
- `outputs/phase-11/phase11-capture-metadata.json`
- `outputs/phase-11/screenshot-plan.json`

---

### Phase 12: ドキュメント更新

**目的**: 実装ガイド・未タスク検出・フィードバックレポートを記録する。

**作成する成果物**:

| 成果物                                          | 内容                                                    |
| ----------------------------------------------- | ------------------------------------------------------- |
| `outputs/phase-12/implementation-guide.md`      | 追記内容の概要・変更ファイル一覧・苦戦箇所の記録        |
| `outputs/phase-12/unassigned-task-detection.md` | 本タスク実施中に発見された未タスクの一覧（0件でも記録） |
| `outputs/phase-12/skill-feedback-report.md`     | スキルへのフィードバック・改善点（なしでも記録）        |

**記録必須項目（implementation-guide.md）**:

- 変更したファイルのパスと変更概要（追記箇所の前後）
- NON_VISUAL 判定条件の最終定義内容
- 補助成果物 4 ファイルの同一 wave ルールの最終表現
- 苦戦箇所と解決策（セクション 9 を参照）

---

### Phase 13: PR 作成

**目的**: ユーザーの承認を得た後に PR を作成する。

> **重要**: このフェーズはユーザーの明示的な承認なしに実行禁止。

**PR 作成手順**:

1. `git status` で変更ファイルを確認する
2. `pnpm --filter @repo/desktop typecheck` でエラー 0 を最終確認する
3. コミットメッセージ案をユーザーに提示し承認を得る
4. `gh pr create` で PR を作成する

**コミットメッセージ案**:

```
docs(skills): NON_VISUALタスクのPhase 11/12補助成果物ルールをSKILL.mdに追記
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-1: SKILL.md の Phase 11/12 記述に、NON_VISUAL タスク向け補助成果物（4ファイル）の「同一 wave 生成」ルールが追記されている
- [ ] AC-2: NON_VISUAL タスクの判定条件（UI変更なし）が SKILL.md に定義されている
- [ ] AC-3: `.agents` mirror が `.claude` canonical と同期されている
- [ ] AC-4: `pnpm --filter @repo/desktop typecheck` がエラー 0

### ドキュメント要件

- [ ] `outputs/phase-12/implementation-guide.md` が作成されている（追記内容の概要・苦戦箇所を含む）
- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件でも出力）
- [ ] `outputs/phase-12/skill-feedback-report.md` が作成されている

### 品質要件

- [ ] `.agents` mirror と `.claude` canonical の diff が 0
- [ ] `pnpm --filter @repo/desktop typecheck` エラー 0

---

## 6. 検証方法

### 6.1 SKILL.md 差分確認

```bash
# canonical と mirror の差分を確認
diff .claude/skills/task-specification-creator/SKILL.md \
     .agents/skills/task-specification-creator/SKILL.md

# 追記内容の確認（NON_VISUAL ルールの存在）
grep -n "NON_VISUAL" .claude/skills/task-specification-creator/SKILL.md
grep -n "同一 wave\|同一wave" .claude/skills/task-specification-creator/SKILL.md
grep -n "manual-test-checklist\|discovered-issues\|phase11-capture-metadata\|screenshot-plan" \
     .claude/skills/task-specification-creator/SKILL.md
```

### 6.2 型チェック

```bash
pnpm --filter @repo/desktop typecheck 2>&1 | grep -E "error|Error" | head -20
```

### 6.3 手動確認ポイント

| 確認項目                                                  | 確認方法                                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| NON_VISUAL 判定条件が具体例付きで記述されている           | SKILL.md を開き、「NON_VISUAL」セクションを読んで 3 種類以上の具体例があることを確認 |
| 補助成果物 4 ファイルが同一 wave 強制として明記されている | `> **重要**` などの強調形式で「同一 wave」ルールが記述されていることを確認           |
| `.agents` mirror が更新されている                         | `diff` コマンドの出力が 0 行であることを確認                                         |

---

## 7. リスクと対策

| リスク                                                                           | 影響度 | 発生確率 | 対策                                                                                                          |
| -------------------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------- |
| SKILL.md が大きく変更されており、追記位置の特定が難しい                          | 中     | 低       | Phase 1 で既存の Phase 11/12 セクションの行番号を特定してから追記する。grep で「Phase 12 重要仕様」を検索する |
| `.agents` mirror の同期時にコンフリクトが発生する                                | 中     | 低       | TASK-CONFLICT-PREVENT-001 の仕様に従い、`.claude` canonical を先に更新した後に `.agents` mirror をコピーする  |
| NON_VISUAL 判定条件の記述が既存の VISUAL 向けルールと矛盾する                    | 中     | 中       | Phase 3 レビューゲートで既存記述との整合性チェックを必須とする                                                |
| 補助成果物ファイル名にタイポが発生する                                           | 低     | 中       | TASK-SW-STRUCT-LLM-002 の `manual-test-result.md` 末尾の「実行記録」セクションから正確なファイル名を転写する  |
| `pnpm --filter @repo/desktop typecheck` がコード変更なしでも既存エラーを検出する | 低     | 低       | typecheck エラーが発生した場合は本タスクのスコープ外であることを確認し、別タスクとして管理する                |

---

## 8. 参照情報

| 参照先                                                                               | 目的                                                                    |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `docs/30-workflows/TASK-SW-STRUCT-LLM-002/outputs/phase-12/skill-feedback-report.md` | 本タスクの発見元。追記要件の一次ソース                                  |
| `docs/30-workflows/TASK-SW-STRUCT-LLM-002/outputs/phase-11/manual-test-result.md`    | 補助成果物 4 ファイルの正確な名前と「同一 wave 生成」という事後対処記録 |
| `.claude/skills/task-specification-creator/SKILL.md`                                 | 追記対象ファイル（Phase 11/12 セクションの現状確認）                    |
| `.agents/skills/task-specification-creator/SKILL.md`                                 | mirror 同期対象ファイル                                                 |
| `docs/30-workflows/unassigned-task/TASK-SW-LLM-PURPOSE-AUTO-EXTRACT.md`              | フォーマット参照例                                                      |

---

## 9. 備考（苦戦箇所【記入必須】）

### 9.1 事前に予測される苦戦箇所

実施前の時点での予測リスクを記録する。**実施後は各行の「実際の結果」列を更新すること**
（Phase 12 の `skill-feedback-report.md` へ転記できる粒度で記載する）。

| 苦戦箇所                                                                             | 原因                                                                                                                                     | 対応策（予測）                                                                                                          | 実際の結果（実施後に記入） |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| SKILL.md が大きく、追記位置の特定に時間がかかる                                      | SKILL.md は数百行以上あり、Phase 11/12 close-out セクションが複数箇所に分散している可能性がある                                          | Phase 1 で `grep -n "Phase 11\|Phase 12\|NON_VISUAL"` を実行して行番号を事前に特定する                                  | （実施後に記入）           |
| NON_VISUAL 判定条件の境界が曖昧（例：IPC 変更はあるが UI 変更なし）                  | 「UI/UX 変更なし」という定義はレンダラー変更の有無であるが、IPC 変更の位置づけが曖昧                                                     | Phase 2 で「IPC 追加あり = renderer 受信処理が増える = VISUAL に準じる」という判定基準を設計する                        | （実施後に記入）           |
| 補助成果物 4 ファイルのうち `.json` ファイルのスキーマが SKILL.md に記載されていない | `phase11-capture-metadata.json` と `screenshot-plan.json` の具体的なフィールドが SKILL.md に明記されていないと「何を書けばよいか」が不明 | TASK-SW-STRUCT-LLM-002 の実際の成果物を参照し、最小限のひな型（`CAPTURE_BLOCKED` フィールドなど）を SKILL.md に追記する | （実施後に記入）           |
| `.agents` mirror の同期後に git でコンフリクトが発生する                             | 別ブランチや worktree で `.agents` 側が先に更新されている場合、同期時に差分が生じる                                                      | `diff` で事前確認し、コンフリクトがある場合は `.claude` canonical を正として `.agents` を上書きする                     | （実施後に記入）           |
| 既存の「NON_VISUAL」記述と追記内容が重複する                                         | SKILL.md の既存記述にすでに NON_VISUAL に言及している箇所があり、追記後に重複・矛盾が生じる可能性がある                                  | Phase 3 レビューゲートで既存の NON_VISUAL 記述を全て洗い出し、追記内容と整合性を確認してから Phase 5 に進む             | （実施後に記入）           |

### 9.2 背景コンテキスト（将来実装者へ）

- 本タスクが発生した経緯は TASK-SW-STRUCT-LLM-002 の Phase 12 `skill-feedback-report.md` に記録されている。
  要約すると「NON_VISUAL タスクで `manual-test-result.md` のみで Phase 11 を閉じようとしたが、
  validator 互換のために他 4 ファイルも必要であることに手動確認中に気づいた」という事後対処である。

- `manual-test-result.md` の末尾「実行記録」セクションには以下の一行がある：

  > `validator 互換のため manual-test-checklist.md / discovered-issues.md / phase11-capture-metadata.json / screenshot-plan.json を同 wave で生成`
  > この一行が本タスクの直接の動機であり、この情報を SKILL.md に昇格させることが本タスクのゴールである。

- `.claude` canonical を先に更新し、`.agents` mirror を追従させるというルールは
  TASK-CONFLICT-PREVENT-001 で定められている。本タスクでも必ずこの順序で更新すること。

- 本タスクはコード変更を含まないが、`pnpm --filter @repo/desktop typecheck` の実行は
  「コード変更が誤って混入していないこと」の確認として AC-4 に含めている。

- **100人中100人が同じ理解で実行できる**ために特に重要なポイント:
  1. Phase 1 で SKILL.md の現状を読んでから追記位置を決める（読まずに追記すると重複が生じる）
  2. 補助成果物の 4 ファイル名は TASK-SW-STRUCT-LLM-002 の `manual-test-result.md` から転写する
     （記憶に頼らず必ず参照すること）
  3. `.agents` mirror の同期は必ず `.claude` canonical の更新後に行う
  4. Phase 13 はユーザーの承認なしに絶対に実行しない
