# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| タスクID   | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 |
| 機能名     | gitattributes-merge-union-reeval          |
| 前提Phase  | Phase 3（設計レビューゲート通過）         |
| 後続Phase  | Phase 5（実装）                           |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

`.gitattributes` の `merge=union` 適用範囲を縮小する変更が、既存の append-only 追記運用を破壊せず、構造化ドキュメントへの誤適用を防げることを検証するためのテスト戦略・テストケース・期待挙動マトリクスを設計する。本 Phase ではテスト本体の実装は行わず、**Red 状態で失敗する仕様**を Markdown として固定する。

## 背景

本タスクの検証対象はソースコードではなく Git のマージ挙動そのものである。Vitest など既存のユニットテスト基盤は適用できないため、`git init` した一時リポジトリで 2 ブランチを作り、同一ファイルを並列に編集してから `git merge` を実行し、結果ファイルの状態を assert する **マージシミュレーション** を採用する。Phase 4 ではシミュレーションスクリプトの入出力契約とテストケース・期待挙動を確定する。

## 実行タスク

### タスク0: テスト戦略の決定

**目的**: Vitest を使わない理由と、bash + git によるシミュレーションテストの正当性を整理する。

**実行手順**:

1. テスト対象が「`.gitattributes` の glob とドライバー定義に基づく Git マージの実挙動」であることを明示する。
2. 採用する戦略を以下の通り定義する。
   - 一時ディレクトリ（`mktemp -d`）に `git init` し、`user.email` / `user.name` をローカル設定。
   - `.gitattributes` を被テスト内容で配置し、必要に応じて `setup-merge-drivers.sh` を実行。
   - `main` から `feature-a` / `feature-b` の 2 ブランチを切り、同一ファイルを別々に編集 → コミット。
   - `main` に `feature-a` を merge → `feature-b` を merge し、最終ファイル内容と exit code、コンフリクトマーカー有無を検査。
3. 不採用案（Vitest snapshot, GitHub Actions のみでの検証）の理由をリスクとセットで記述。

**期待される成果物**: `outputs/phase-4/test-design.md` の「戦略」章。

### タスク1: テストケース設計

**目的**: append-only / 構造化 × `merge=union` / デフォルト × ドライバー有無のマトリクスでテストケースを網羅する。

**実行手順**:

1. 以下のテストケースをマトリクス形式で定義する。

   | ID    | 対象パターン                              | 操作                                         | 期待挙動                                                 |
   | ----- | ----------------------------------------- | -------------------------------------------- | -------------------------------------------------------- |
   | TC-01 | `LOGS.md`（append-only）                  | 2 ブランチで末尾に異なる行を追加             | `merge=union` により両方の行が重複なく残る               |
   | TC-02 | `task-workflow.md`（構造化想定）          | 同一見出し配下で並列追記                     | デフォルトマージで Conflict マーカーが出る               |
   | TC-03 | `indexes/<name>.json`                     | 同一キーの値を双方で変更                     | `merge=ours` により main 側の値が保持される              |
   | TC-04 | `indexes/<name>.json`（ドライバー未登録） | 同上を `setup-merge-drivers.sh` 未実行で実施 | warning が出力され、デフォルトマージにフォールバックする |
   | TC-05 | `.gitattributes` 各エントリ               | エントリ直前/直後にコメント有無を grep 検査  | 全エントリに「適用意図」「新規追加時の判断ガイド」が存在 |

2. 各テストケースに対し、入力ファイル例（before/after）、実行コマンド列、assert 内容（exit code・grep パターン・行数）を文章化する。
3. TC-02 については「現行 `.gitattributes`（修正前）では `merge=union` が誤って適用される」ため Phase 4 時点では FAIL する。これが TDD Red の根拠となる旨を明記する。

**期待される成果物**: `outputs/phase-4/test-design.md` の「テストケース」章。

### タスク2: マージシミュレーションスクリプト仕様

**目的**: Phase 5 以降で実装する `scripts/test/simulate-merge.sh` の入出力契約を確定する（実装はしない）。

**実行手順**:

1. 引数仕様を定義する。
   - `--scenario <ID>`: 実行する TC-ID
   - `--gitattributes <path>`: 適用する `.gitattributes` のパス（被テスト版を差し替え可能）
   - `--with-drivers`: `setup-merge-drivers.sh` を事前実行するフラグ
   - `--workdir <path>`: 一時ディレクトリ指定（省略時 `mktemp -d`）
2. 出力契約を定義する。
   - stdout: シナリオ ID と最終 exit code、assert 結果（PASS/FAIL）
   - stderr: git コマンドの raw 出力（デバッグ用）
   - 終了コード: 0=PASS、1=FAIL、2=セットアップ失敗
3. 副作用範囲を明示する（CWD 配下にファイルを残さない / トラップで cleanup）。
4. 本スクリプトの実装は Phase 5 の補助として最低限のスタブのみ作成し、Phase 6 で fail path を含めて拡充する旨を記載。

**期待される成果物**: `outputs/phase-4/merge-simulation-script.md`。

### タスク3: 期待挙動マトリクス作成

**目的**: pattern × scenario × expected outcome を 1 表で俯瞰できる資料を作成し、Phase 5/6 のチェックリストとして機能させる。

**実行手順**:

1. 行: ファイルパターン（`LOGS.md` / `SKILL-changelog.md` / `task-workflow-completed.md` / `references/*.md`（構造化）/ `indexes/*.json`）。
2. 列: シナリオ（並列追記 / 同一行編集 / 新規ファイル追加 / ドライバー未登録）。
3. セル: 期待される最終状態（union / conflict / ours / fallback）+ 根拠コメント番号（`.gitattributes` のコメント行を将来追跡できるよう ID 付与）。
4. マトリクス末尾に「未分類セル」が存在しないことを確認するチェック欄を設ける。

**期待される成果物**: `outputs/phase-4/expected-behavior-matrix.md`。

## 参照資料

| 参照資料                       | パス                                       | 内容                                |
| ------------------------------ | ------------------------------------------ | ----------------------------------- |
| 現行 `.gitattributes`          | `.gitattributes`                           | 修正前のマージ戦略                  |
| マージドライバー登録スクリプト | `.claude/scripts/setup-merge-drivers.sh`   | `merge.ours.driver` 登録            |
| Phase 2 設計書                 | `outputs/phase-2/merge-strategy-design.md` | 採用するマージ戦略・分類ルール      |
| index.md                       | `index.md`                                 | タスク全体の Phase 構成と非スコープ |

## 成果物

| 成果物                         | パス                                          | 内容                                |
| ------------------------------ | --------------------------------------------- | ----------------------------------- |
| テスト設計書                   | `outputs/phase-4/test-design.md`              | 戦略・テストケース定義              |
| シミュレーションスクリプト仕様 | `outputs/phase-4/merge-simulation-script.md`  | スクリプト入出力契約                |
| 期待挙動マトリクス             | `outputs/phase-4/expected-behavior-matrix.md` | pattern × scenario × outcome 一覧表 |

## 統合テスト連携【必須】

| 判定項目                                   | 基準                                                              | 結果    |
| ------------------------------------------ | ----------------------------------------------------------------- | ------- |
| TC-01〜TC-05 が網羅されているか            | 全 5 件が test-design.md に記載され、assert 内容まで具体化        | pending |
| シミュレーションスクリプトの契約が定義済み | 引数・出力・終了コード・cleanup が文書化                          | pending |
| TDD Red 状態が論理的に成立                 | 修正前 `.gitattributes` で TC-02 が FAIL することが理由付きで明記 | pending |
| マトリクスに未分類セルが存在しない         | 全セルに期待結果と根拠 ID が割り振られている                      | pending |

## 完了条件

- [ ] `outputs/phase-4/test-design.md` を作成し、テスト戦略と TC-01〜TC-05 を含める
- [ ] `outputs/phase-4/merge-simulation-script.md` でスクリプトの入出力契約を確定
- [ ] `outputs/phase-4/expected-behavior-matrix.md` を作成し、未分類セルが無いこと
- [ ] TDD Red 状態（現行 `.gitattributes` で TC-02 が FAIL する想定）が記述されている
- [ ] 本 Phase ではコード変更を一切行っていないことを確認
- [ ] `complete-phase.js` で Phase 4 を complete に更新
