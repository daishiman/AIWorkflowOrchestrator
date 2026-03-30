# TASK-P0-05: workflow-manifest.json mirror 同期の自動化 - タスク実行仕様書

## メタ情報

```yaml
issue_number: 1723
```

## メタ情報

| 項目       | 値                                                                   |
| ---------- | -------------------------------------------------------------------- |
| タスクID   | TASK-P0-05                                                           |
| 機能名     | workflow-manifest-mirror-sync-automation                             |
| 作成日     | 2026-03-29                                                           |
| 優先度     | 低                                                                   |
| 依存タスク | TASK-P0-03（workflow-manifest.json canonical/mirror 配置・完了済み） |
| 後続タスク | なし（mirror 運用の恒久化が目的）                                    |
| パターン   | seq                                                                  |

## 概要

`.claude/skills/skill-creator/workflow-manifest.json`（canonical・正本）が更新された際に `.agents/skills/skill-creator/workflow-manifest.json`（mirror・複製）を自動同期する仕組みを実装する。TASK-P0-03 で canonical と mirror の二重管理ポリシーを確立したが、更新時の同期は手動コピー運用のまま残っている。本タスクは自動化により将来的な内容乖離（ドリフト）リスクを恒久的に排除する。

## 問題の背景

- TASK-P0-03 で `.claude/skills/skill-creator/workflow-manifest.json`（canonical）と `.agents/skills/skill-creator/workflow-manifest.json`（mirror）の二重管理ポリシーを確立した
- 現状は `workflow-manifest.json` 更新のたびに手動コピーが必要であり、コミット漏れや更新忘れが発生しうる
- 手動同期に依存し続ける場合、canonical と mirror の内容が乖離（ドリフト）するリスクが増加する
- 自動化なしでは ManifestLoader が参照する mirror（`.agents`）が古い内容のまま runtime に読み込まれる可能性がある

## 苦戦箇所

### 1. canonical と mirror の二重管理ポリシーの確定

TASK-P0-03 の Phase 2-3 設計レビューにおいて、canonical（`.claude`）と mirror（`.agents`）のどちらが「正本」かを明示的に固定する設計判断が必要だった。

- `.claude` が正本である理由: Claude Code が参照するスキルリソースは `.claude` 配下を起点とする設計方針
- `.agents` が mirror である理由: runtime pipeline は `.agents` 配下を参照するが、内容自体は `.claude` から派生する
- 更新フローの確定: 「`.claude` 側を更新 → `.agents` へコピー」という一方向同期を Phase 3 設計レビューで決定した

この判断が曖昧なまま自動化を設計すると、どちら方向にコピーするかが不定となり、実装が破綻する。

### 2. 自動化手段の選定と既存 Hook 構成との整合

プロジェクトには `CLAUDE.md` に定義された Claude Code Hook 群（auto-format.sh、auto-lint.sh 等）がすでに存在する。自動化候補として以下の3つを検討する必要があった。

1. **git pre-commit hook**: コミット時に canonical → mirror のコピーを実行する
2. **Claude Code Hook（PostToolUse）**: Edit/Write 後に mirror を更新する（auto-format.sh と同列）
3. **pnpm スクリプト化**: `pnpm sync:manifest` として開発者が手動で呼べるコマンドを整備する

各手段のトレードオフ（実行タイミング・実行環境・失敗時の挙動）を Phase 2-3 の設計レビューで確定する必要がある。

### 3. コミット時の手動同期依存による将来ドリフトリスク

現状は `workflow-manifest.json` の更新が発生するたびに手動での mirror コピーが必要であり、コミット時に mirror を更新し忘れると canonical と mirror の内容が乖離する。このリスクは workflow が成熟して更新頻度が上がるほど深刻になるため、初期段階で自動化を確立しておく価値がある。

## 設計方針

### 同期方向

- **canonical（`.claude`）→ mirror（`.agents`）の一方向同期** を原則とする
- mirror への直接編集は禁止し、必ず canonical を更新してから同期する

### 実装候補の比較

| 手段                            | 実行タイミング | 環境依存    | 失敗時の影響       | 優先検討 |
| ------------------------------- | -------------- | ----------- | ------------------ | -------- |
| git pre-commit hook             | コミット時     | git 環境    | コミットがブロック | ◎        |
| Claude Code Hook（PostToolUse） | ファイル編集後 | Claude Code | 非同期・通知のみ   | △        |
| pnpm スクリプト化               | 手動実行時     | Node.js     | 手動実行忘れリスク | ○        |

Phase 2-3 の設計レビューで最終手段を確定する。候補の優先順位は上記表のとおり（コミット時に自動実行される git hook が最も確実）。

### タスク分類

**コード実装タスク（UI 変更なし）**。成果物はシェルスクリプトまたは Hook 設定ファイルと、それを呼び出す設定変更ファイル。

## スコープ

### 対象

- canonical → mirror 同期スクリプトの実装（コピー + 差分確認）
- 自動実行トリガーの設定（git hook または Claude Code Hook）
- mirror parity チェックスクリプトの実装（CI/CD または手動確認用）
- 既存 Hook 構成との整合確認

### 対象外

- workflow-manifest.json の内容変更
- ManifestLoader のコード変更
- runtime pipeline の変更
- `.claude` または `.agents` 以外のディレクトリへの同期

## 依存関係

| 種別       | 参照先                                                     | 役割                                   |
| ---------- | ---------------------------------------------------------- | -------------------------------------- |
| upstream   | TASK-P0-03（workflow-manifest.json canonical/mirror 配置） | 同期対象ファイルの配置元               |
| upstream   | `CLAUDE.md`（Hook 設定）                                   | 既存 Hook 構成との整合確認先           |
| peer       | TASK-P0-04（ManifestLoader デフォルト起動）                | mirror を読み込む runtime への影響確認 |
| downstream | なし（mirror 運用の恒久化が完了ゴール）                    | -                                      |

## 現行コードアンカー

| ファイル                                              | 現状の役割                              | TASK-P0-05 での扱い              |
| ----------------------------------------------------- | --------------------------------------- | -------------------------------- |
| `.claude/skills/skill-creator/workflow-manifest.json` | canonical manifest（正本）              | 同期元。変更なし                 |
| `.agents/skills/skill-creator/workflow-manifest.json` | mirror manifest（複製）                 | 同期先。自動更新対象となる       |
| `CLAUDE.md`                                           | Hook 設定の定義場所                     | Claude Code Hook 追加時の参照先  |
| `.claude/hooks/`（既存 Hook スクリプト群）            | auto-format.sh 等の既存 Hook スクリプト | 新規 Hook スクリプトの配置先候補 |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点             | 手動同期は短期的には機能するが、将来の更新頻度増加に伴いドリフトリスクが増大する。自動化によりこのリスクを構造的に排除することが本タスクの本質的価値       |
| 依存関係・責務境界   | 本タスクは同期の自動化のみを担当する。manifest の内容変更は TASK-P0-03、manifest の読み込みロジックは TASK-P0-04 の責務に分離する                          |
| 価値とコストの不均衡 | 実装コストは小さい（シェルスクリプト数十行）が、自動化なしで放置すると将来の手動ミスリスクが累積するため、早期実装の価値が高い                             |
| 改善優先順位         | 1. 既存 Hook 構成読了 2. 自動化手段の設計確定 3. 同期スクリプト実装 4. トリガー設定 5. parity チェックテスト追加                                           |
| 4条件評価            | 価値性: 中（P0 ドリフトリスク排除）/ 実現性: 高（シェルスクリプト実装）/ 整合性: 既存 Hook 構成に準拠 / 運用性: 同期スクリプトと parity チェックで監査可能 |

## 受入基準

| ID   | 基準                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------- |
| AC-1 | canonical（`.claude`）の workflow-manifest.json を更新したとき、mirror（`.agents`）が自動的に更新される |
| AC-2 | 自動同期トリガーが設定ファイルまたはスクリプトとして管理され、レビュー可能な状態になっている            |
| AC-3 | canonical と mirror の内容が一致していることを確認するチェックスクリプトが存在する                      |
| AC-4 | 既存の Claude Code Hook 群（auto-format.sh 等）との競合または重複がない                                 |
| AC-5 | mirror への直接編集を防ぐルール（README またはコメント）が整備されている                                |
| AC-6 | 同期スクリプトが Windows / macOS / Linux いずれの環境でも動作する（または非対応環境を明示する）         |
| AC-7 | 同期失敗時（ファイル不在・パーミッションエラー等）に適切なエラーメッセージが出力される                  |

## Phase 一覧

| Phase | 名称             | ステータス |
| ----- | ---------------- | ---------- |
| 1     | 要件定義         | pending    |
| 2     | 設計             | pending    |
| 3     | 設計レビュー     | pending    |
| 4     | テスト作成       | pending    |
| 5     | 実装             | pending    |
| 6     | テスト拡充       | pending    |
| 7     | カバレッジ確認   | pending    |
| 8     | リファクタリング | pending    |
| 9     | 品質保証         | pending    |
| 10    | 最終レビュー     | pending    |
| 11    | 手動テスト       | pending    |
| 12    | ドキュメント更新 | pending    |
| 13    | PR作成           | blocked    |

## Phase 詳細

### Phase 1: 要件定義

**目的**: スコープ・受入条件・タスク分類・artifact 命名 canonical 一覧を固定する

**実行タスク**:

1. 既存 Hook 構成読了: `CLAUDE.md` の Hook 設定セクションを読み、既存 Hook スクリプト一覧を確認する
2. 既存スクリプト確認: `.claude/hooks/` 配下の既存スクリプト（auto-format.sh 等）の構造を調査する
3. 同期対象ファイルの確認: `.claude/skills/skill-creator/workflow-manifest.json` と `.agents/skills/skill-creator/workflow-manifest.json` が存在することを確認する（TASK-P0-03 完了を前提）
4. タスク分類の記録: **コード実装タスク（UI 変更なし・シェルスクリプト）** として確定する
5. artifact 命名 canonical 一覧を確定し、`artifacts.json` の骨格を作成する

**成果物**:

- `outputs/phase-1/requirements-summary.md`（要件・スコープ・タスク分類・artifact 命名一覧）
- `artifacts.json`（初期骨格）

**完了条件**: AC-1〜AC-7 の受入基準が要件として明文化され、スコープ外が確定していること

---

### Phase 2: 設計

**目的**: 自動化手段の選定と同期スクリプトのアーキテクチャを確定する

**実行タスク**:

1. 自動化手段の比較設計:
   - **git pre-commit hook** の実装方法（`.git/hooks/pre-commit` またはツール管理）を設計する
   - **Claude Code Hook（PostToolUse）** への追加方法（`CLAUDE.md` の Hook 定義を拡張）を設計する
   - **pnpm スクリプト化**（`package.json` の `scripts` への追加）を設計する
   - 3つの手段のトレードオフを整理し、採用手段を1つ（または組み合わせ）に決定する
2. 同期スクリプト設計:
   - 入力（canonical パス）・出力（mirror パス）・終了コードの仕様を設計する
   - 差分確認（コピー前後の hash 比較 or diff）の実装方針を設計する
   - エラーハンドリング（ファイル不在・書き込み失敗）の設計
3. parity チェックスクリプト設計:
   - canonical と mirror の内容一致を検証するスクリプトの仕様を設計する
   - CI/CD 組み込みの可能性（GitHub Actions 等）を検討する
4. cross-platform 対応設計:
   - macOS / Linux / Windows 環境での実行可能性を確認する
   - shell スクリプト（bash/zsh）か Node.js スクリプトかを選定する

**成果物**:

- `outputs/phase-2/design-document.md`（設計書: 自動化手段比較・採用決定・スクリプト仕様・cross-platform 対応）

**完了条件**: Phase 3 レビューに必要な設計情報が揃っていること

---

### Phase 3: 設計レビュー

**目的**: Phase 2 設計の整合性を確認し、Phase 4 へ進めるかを判定する

**実行タスク**:

1. 設計レビュー: 以下の観点でレビューを実施する
   - 採用した自動化手段が既存 Hook 構成（auto-format.sh 等）と競合しないか
   - 同期スクリプトが canonical → mirror の一方向同期を保証しているか
   - parity チェックが自動化されているか（または手動実行で十分か）
   - cross-platform 対応が AC-6 を満たしているか
   - mirror への直接編集を防ぐ仕組みが AC-5 を満たしているか
2. MINOR/MAJOR 判定: 問題があれば分類し、MINOR は未タスク化する

**成果物**:

- `outputs/phase-3/design-review.md`（PASS/FAIL 判定 + 指摘事項一覧）

**完了条件**: PASS 判定が得られ、MAJOR 指摘が 0 件であること

---

### Phase 4: テスト作成

**目的**: 同期スクリプトと parity チェックスクリプトのテストを **テストファースト** で作成する

**実行タスク**:

1. テストフレームワーク選定: シェルスクリプトのテスト手段（bash テスト、Node.js テスト等）を確定する
2. 新規テストケースの設計:
   - `TC-01`: 同期スクリプトが canonical → mirror へ正しくコピーすることを確認する
   - `TC-02`: canonical が存在しない場合にエラー終了することを確認する
   - `TC-03`: mirror ディレクトリが存在しない場合に自動作成してコピーすることを確認する
   - `TC-04`: parity チェックスクリプトが内容一致時に終了コード 0 を返すことを確認する
   - `TC-05`: parity チェックスクリプトが内容不一致時に終了コード 1 + エラーメッセージを返すことを確認する
3. テストを実行して **Red（失敗）** を確認する（テストファースト）

**成果物**:

- テストスクリプトファイル（配置先は Phase 2 設計で確定したパス）
- `outputs/phase-4/test-plan.md`（テストケース一覧・Red 確認記録）

**完了条件**: 追加したテストが Red（実装前で失敗）であることを確認できること

---

### Phase 5: 実装

**目的**: 同期スクリプト・parity チェックスクリプト・自動実行トリガーを実装し、Phase 4 のテストを Green にする

**実行タスク**:

1. 同期スクリプト実装:
   - canonical → mirror のコピー処理を実装する
   - コピー前後の内容確認（hash 比較 or diff）を実装する
   - エラーハンドリング（ファイル不在・書き込み失敗）を実装する
2. parity チェックスクリプト実装:
   - canonical と mirror の内容を比較し、不一致時にエラーを出力するスクリプトを実装する
3. 自動実行トリガーの設定（Phase 2 で採用した手段に応じて）:
   - **git pre-commit hook** を採用した場合: `.git/hooks/pre-commit`（または Hook 管理ツール）に同期スクリプト呼び出しを追加する
   - **Claude Code Hook** を採用した場合: `CLAUDE.md` の Hook 定義に同期スクリプト呼び出しを追加する
   - **pnpm スクリプト** を採用した場合: ルートまたは対象パッケージの `package.json` の `scripts` に `sync:manifest` を追加する
4. mirror への直接編集防止コメントを `.agents/skills/skill-creator/workflow-manifest.json` の先頭コメントまたは `README` に追加する（JSON はコメント不可のため README または隣接ファイルに記載）
5. テストを実行し、Phase 4 のテストが Green になることを確認する

**コード成果物**（実ファイルに配置）:

- 同期スクリプトファイル（`scripts/sync-manifest.sh` または同等のパス）
- parity チェックスクリプトファイル（`scripts/check-manifest-parity.sh` または同等のパス）
- 自動実行トリガー設定（git hook または `CLAUDE.md` または `package.json`）
- mirror 直接編集防止コメント追加先ファイル

**ドキュメント成果物**:

- `outputs/phase-5/implementation-summary.md`（実装内容・変更ファイル一覧・テスト結果）

**完了条件**: Phase 4 のテストが全て Green、スクリプトが手動実行で正常動作すること

---

### Phase 6: テスト拡充

**目的**: fail path・回帰 guard・edge case テストを追加し、テストカバレッジを強化する

**実行タスク**:

1. エラーパステスト追加:
   - `EC-01`: canonical の JSON が壊れている（パースエラー）場合の振る舞い
   - `EC-02`: mirror ディレクトリのパーミッションエラー時の振る舞い
   - `EC-03`: 同一内容の場合にコピーをスキップ（または同一コピーで正常終了）する振る舞い
2. 回帰 guard: parity チェックが canonical と mirror の同一性を保証していることを確認する
3. 自動実行トリガーのテスト: トリガーが正しく同期スクリプトを呼び出していることを確認する

**成果物**:

- テストスクリプトへの EC-01〜EC-03 追加
- `outputs/phase-6/test-expansion-report.md`（追加テスト一覧・全テスト Pass 確認）

**完了条件**: 全テストが Green であること

---

### Phase 7: カバレッジ確認

**目的**: 同期スクリプトのコードカバレッジを可視化し、未テストのブランチを特定する

**実行タスク**:

1. カバレッジ測定: 採用したテストフレームワークでカバレッジを実行する
2. 同期スクリプトおよび parity チェックスクリプトのカバレッジレポートを確認する
3. カバレッジが基準値（分岐 70% 以上）を満たさない場合はテスト追加候補を記録する

**成果物**:

- `outputs/phase-7/coverage-report.md`（カバレッジ数値・未カバーブランチ・補強候補一覧）

**完了条件**: カバレッジが基準値を満たし、critical branch（エラーパス等）が全て covered であること

---

### Phase 8: リファクタリング

**目的**: 重複・ナビゲーションドリフト・設計課題を解消する

**実行タスク**:

1. Phase 5 実装スクリプトのリファクタリング候補を確認する:
   - パス定義の重複がないか（canonical / mirror パスが複数箇所にハードコードされていないか）
   - エラーメッセージが十分に情報量のあるフォーマットか
   - スクリプトの命名と配置が既存スクリプト群のコーディングスタイルと一致するか
2. 実装が Phase 2 設計と乖離していないか確認し、設計ドリフトがあれば是正する

**成果物**:

- `outputs/phase-8/refactoring-report.md`（変更内容・リファクタリング根拠）

**完了条件**: リファクタリング後も全テストが Green であること

---

### Phase 9: 品質保証

**目的**: lint・型整合性・mirror parity を一括判定する

**実行タスク**:

1. シェルスクリプトの lint チェック: `shellcheck`（利用可能な場合）を実行する
2. Node.js スクリプトを採用した場合: `pnpm lint` と TypeScript 型チェックを実行する
3. parity チェックスクリプトを実行し、canonical と mirror が一致していることを確認する
4. 自動実行トリガーが正しく設定されていることを確認する（git hook のパーミッション等）

**成果物**:

- `outputs/phase-9/quality-report.md`（lint/typecheck/parity の結果一覧）

**完了条件**: lint・型チェックが PASS、parity が確認されること

---

### Phase 10: 最終レビュー

**目的**: 受入基準（AC-1〜AC-7）の達成状況を確認し、Phase 11 へ進めるかを判定する

**実行タスク**:

1. 受入基準チェックリストを一項目ずつ確認する（AC-1〜AC-7）
2. 残課題を MINOR/MAJOR に分類する
3. MAJOR があれば Phase 5/6 へ戻る
4. MINOR は未タスク候補として記録する

**成果物**:

- `outputs/phase-10/final-review.md`（AC チェックリスト・残課題一覧・PASS/FAIL 判定）

**完了条件**: AC-1〜AC-7 が全て PASS、MAJOR 課題が 0 件であること

---

### Phase 11: 手動テスト

**目的**: 実際の開発フローで同期が自動化されていることを人手で確認する

**タスク分類**: **NON_VISUAL**（UI 変更なし、コンソールログとファイル確認のみ）

**実行タスク**:

1. canonical ファイルを一時的に変更する（コメント行の追加等）
2. 採用した自動実行トリガーを通じて（コミット・Hook 実行等）mirror が自動更新されることを確認する
3. parity チェックスクリプトを手動実行し、内容一致を確認する
4. mirror を手動で別の内容に書き換えた後、parity チェックスクリプトが不一致を検出することを確認する
5. canonical の変更を元に戻し、mirror の内容を正常状態に復元する
6. ウォークスルー記録: 確認内容と結果をテキストで記録する

**成果物**:

- `outputs/phase-11/manual-test-result.md`（ウォークスルー記録・確認項目と結果）

**注意**: NON_VISUAL のため `screenshots/` ディレクトリは不要。`.gitkeep` も配置しないこと。

**完了条件**: 自動同期が正常動作し、parity チェックが不一致を正しく検出できることを確認できること

---

### Phase 12: ドキュメント更新

**目的**: 実装ガイド・システム仕様更新・ドキュメント変更履歴・未タスク検出・スキルフィードバックを完了する

#### Task 12-1: 実装ガイド作成（2パート構成）

**Part 1: 中学生でもわかるレベルの説明**

---

**「コピー忘れを防ぐ自動化係」を作った話**

学校で「大事なプリントを2部コピーして、1部は先生の引き出し（正本）、もう1部は掲示板（配布用）に貼る」というルールがあるとします。毎回先生が手で2部目をコピーして貼りに行かなければいけないのは、忙しいとうっかり忘れてしまうことがありますよね。

この「うっかり忘れ」が起きると、掲示板に古い版のプリントが残り続けて、それを見た人が間違った情報を読んでしまいます。

このタスクでやっていることは、まさに「うっかり忘れを防ぐ仕組み」を作ることです。

- **`.claude` フォルダ**（先生の引き出し）が「正本」です
- **`.agents` フォルダ**（掲示板）が「配布用の複製」です
- これまでは、正本を更新したら **手動で** 複製もコピーしていました
- このタスクでは、**「正本が変わったら自動で複製もコピーしてくれる係」**（スクリプト）を作りました

具体的には：

1. 「コピーを実行するスクリプト」を作りました（`sync-manifest.sh`）
2. 「2つのファイルが同じ内容か確認するスクリプト」を作りました（`check-manifest-parity.sh`）
3. コミット（保存）するタイミングに「自動でコピーが実行される」仕掛けを追加しました

これで、「正本を更新したのに複製の更新を忘れた」という事故がなくなりました。

---

**Part 2: 技術者向け詳細**

採用した自動化手段（Phase 2 設計で確定）に応じて以下のいずれかが適用される。

**パターン A: git pre-commit hook**

```bash
# .git/hooks/pre-commit（または husky/lint-staged 等のツール管理）
#!/bin/bash
set -euo pipefail

CANONICAL=".claude/skills/skill-creator/workflow-manifest.json"
MIRROR=".agents/skills/skill-creator/workflow-manifest.json"

if [[ -f "$CANONICAL" ]]; then
  cp "$CANONICAL" "$MIRROR"
  echo "[manifest-sync] mirror updated: $MIRROR"
  git add "$MIRROR"
fi
```

**パターン B: Claude Code Hook（PostToolUse 追加）**

`CLAUDE.md` の Hook 設定に以下を追加する:

```bash
# scripts/sync-manifest.sh として実装
#!/bin/bash
# workflow-manifest.json canonical → mirror sync
CANONICAL=".claude/skills/skill-creator/workflow-manifest.json"
MIRROR=".agents/skills/skill-creator/workflow-manifest.json"
if [[ -f "$CANONICAL" ]]; then
  cp "$CANONICAL" "$MIRROR"
fi
```

**パターン C: pnpm スクリプト化**

```json
// package.json（ルート）
{
  "scripts": {
    "sync:manifest": "cp .claude/skills/skill-creator/workflow-manifest.json .agents/skills/skill-creator/workflow-manifest.json",
    "check:manifest-parity": "diff .claude/skills/skill-creator/workflow-manifest.json .agents/skills/skill-creator/workflow-manifest.json && echo 'parity OK' || (echo 'PARITY MISMATCH' && exit 1)"
  }
}
```

**エラーハンドリング**:

- `ENOENT`（canonical が存在しない）: エラーメッセージを出力して exit 1
- パーミッションエラー: エラーメッセージを出力して exit 1
- 同一内容の場合: コピーを実行（冪等）して exit 0

---

#### Task 12-2: システム仕様更新

| Step     | 内容                                                                                | 状態 |
| -------- | ----------------------------------------------------------------------------------- | ---- |
| Step 1-A | タスク完了記録（aiworkflow-requirements LOGS.md ×2 更新）                           | 実施 |
| Step 1-B | 実装状況テーブル更新（`completed` に変更）                                          | 実施 |
| Step 1-C | 関連タスクテーブル更新（TASK-P0-03 との後続関係、mirror 運用方針を明記）            | 実施 |
| Step 2   | 同期スクリプトの呼び出し方法を `CLAUDE.md` または README に追記（採用手段に応じて） | 実施 |

#### Task 12-3: ドキュメント更新履歴

- `outputs/phase-12/documentation-changelog.md` を作成し、Step 1-A〜1-C と Step 2 を記録する

#### Task 12-4: 未タスク検出レポート（0件でも出力必須）

以下を確認し、`outputs/phase-12/unassigned-task-detection.md` を出力する:

- Phase 3/10 MINOR 指摘
- Phase 11 スコープ外発見事項
- コードコメント内の TODO/FIXME

#### Task 12-5: スキルフィードバックレポート（改善点なしでも出力必須）

- `outputs/phase-12/skill-feedback-report.md` を出力する

---

### Phase 13: PR作成

**目的**: ユーザーの明示的な許可を得てから PR を作成する

**重要**: PR 作成はユーザーの明示的な承認後のみ実施する。自動実行禁止。

**実行タスク**:

1. ユーザーの承認を確認する
2. `pnpm lint` と `pnpm typecheck`（対象ファイルに応じて）を最終確認する
3. `git diff --stat` で変更ファイルを確認する
4. PR タイトルと概要を作成する（英語または日本語、プロジェクト規約に従う）
5. `gh pr create` で PR を作成する

**成果物**:

- GitHub PR URL

**完了条件**: ユーザーが承認し、CI がパスすること

---

## 実行順

1. Phase 1-3 で自動化手段と同期スクリプトのアーキテクチャを固定する
2. Phase 4 でテストを先に作成し、Red を確認する（テストファースト）
3. Phase 5 で実装し、テストを Green にする
4. Phase 6-9 で edge case・カバレッジ・品質を確認する
5. Phase 10-11 で最終レビューと手動確認を行う
6. Phase 12 でドキュメントを更新する
7. Phase 13 はユーザー指示があるまで blocked のまま維持する

## 完了定義

| 状態                   | 意味                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `implementation_ready` | Phase 1-3 gate が閉じ、実行担当者が Phase 4 へ進める状態                                                  |
| `completed`            | 同期スクリプトが実装され、自動実行トリガーが設定され、parity チェックが全 Green、手動テストが通過した状態 |

## 注意事項

- **テストファーストを徹底する**: Phase 4 でテストを先に書いて Red を確認し、Phase 5 で Green にする
- **canonical → mirror の一方向同期を守る**: mirror を直接編集すると次の同期で上書きされる。必ず canonical を更新してから同期すること
- **既存 Hook 構成との競合を避ける**: `CLAUDE.md` の Hook 設定を変更する場合は既存スクリプト（auto-format.sh 等）の動作に影響しないことを確認する
- **Phase 13 はユーザー承認後のみ**: `--no-verify` オプションの使用は絶対禁止

## 関連ファイル

| ファイル                                                           | 役割                                                 |
| ------------------------------------------------------------------ | ---------------------------------------------------- |
| `.claude/skills/skill-creator/workflow-manifest.json`              | canonical manifest（正本）・同期元                   |
| `.agents/skills/skill-creator/workflow-manifest.json`              | mirror manifest（複製）・同期先                      |
| `CLAUDE.md`                                                        | Claude Code Hook 設定の定義場所（Hook 追加時に変更） |
| `scripts/sync-manifest.sh`（新規作成・配置先は設計で確定）         | canonical → mirror 同期スクリプト                    |
| `scripts/check-manifest-parity.sh`（新規作成・配置先は設計で確定） | parity チェックスクリプト                            |
