# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 7                                         |
| タスクID   | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 |
| 機能名     | gitattributes-merge-union-reeval          |
| 前提Phase  | Phase 6: テスト拡充                       |
| 後続Phase  | Phase 8: リファクタリング                 |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

Phase 4-6 で構築した Git マージシミュレーションテストが、`.gitattributes` の各エントリ・各マージ戦略・各ファイルタイプを十分に被覆していることを確認する。コードカバレッジツールが使えない設定ファイル領域のため、**パターン × テストケース** のマトリクスでカバレッジを可視化し、未カバー領域とその残存リスクを評価する。

## 背景

`.gitattributes` は実行コードではなく宣言型ルールであるため、line/branch カバレッジは意味を持たない。代わりに以下の3次元でカバレッジを測る:

1. **ファイルパターン次元**: 各 glob (`.claude/skills/*/references/append-only/*.md` 等) がテストで参照されているか
2. **マージ戦略次元**: `merge=union` / `merge=ours` / デフォルト3-way の3戦略全てが検証されているか
3. **ファイルタイプ次元**: append-only / 構造化 / auto-generated の3種類が網羅されているか

依存タスク TASK-CONFLICT-PREVENT-001 の検証範囲を引き継ぎつつ、本タスクで縮小・追加したパターンに対して新規カバレッジを保証する必要がある。

## 実行タスク

### タスク0: パターン別カバレッジマトリクスの作成

**目的**: `.gitattributes` の全エントリに対し、Phase 4-6 のテストケースが何を検証しているかを表で可視化する。

**実行手順**:

1. Phase 5 で確定した `.gitattributes` の全行を抽出し、コメント行を除いたエントリ一覧を作成
2. Phase 4-6 で作成した bash テストケースの ID 一覧を取得
3. 以下の形式でマトリクスを作成:

   | エントリ (glob)                                  | 期待戦略    | ファイルタイプ | テストID                    | カバー状態 |
   | ------------------------------------------------ | ----------- | -------------- | --------------------------- | ---------- |
   | `.claude/skills/*/references/append-only/*.md`   | merge=union | append-only    | T-UNION-01, T-UNION-02      | covered    |
   | `.claude/skills/*/references/task-workflow.md`   | default     | structured     | T-DEFAULT-01, T-CONFLICT-01 | covered    |
   | `.agents/skills/*/references/lessons-learned.md` | default     | structured     | T-DEFAULT-02                | covered    |
   | `.claude/skills/*/indexes/*.json` (既存)         | merge=ours  | auto-generated | T-OURS-01                   | covered    |

4. カバー状態を `covered` / `partial` / `uncovered` の3値で記録
5. `partial` / `uncovered` の行に対して理由をコメント列に追記

**期待される成果物**: `outputs/phase-7/coverage-report.md` 内のセクション「パターン別カバレッジ」

### タスク1: 依存エッジカバレッジの確認

**目的**: `.gitattributes` の `merge=ours` 指定が `setup-merge-drivers.sh` による `git config merge.ours.driver` 登録と組み合わせて初めて機能する依存関係を検証する。

**実行手順**:

1. `setup-merge-drivers.sh` を未実行の状態でマージシミュレーションを実行し、`merge=ours` 指定行が**期待通り失敗 or fallback** することを確認
2. `setup-merge-drivers.sh` を実行後、`git config --get merge.ours.driver` が `true` を返すことを確認
3. 再度マージシミュレーションを実行し、`merge=ours` 指定行が期待通り「ours 側のみ採用」となることを確認
4. テストID (例: `T-DRIVER-DEP-01`, `T-DRIVER-DEP-02`) でケースを記録

**期待される成果物**: `outputs/phase-7/coverage-report.md` 内のセクション「依存エッジカバレッジ」

### タスク2: エッジケースの列挙と評価

**目的**: 通常テストでは見落とされがちなエッジケースを列挙し、各ケースの被覆状況とリスクを評価する。

**実行手順**:

1. 以下のエッジケース候補をリストアップし、テスト有無を判定:
   - カスタムマージドライバー (`merge.ours.driver`) が未登録の環境
   - ユーザー側 `core.attributesfile` で `.gitattributes` を上書きしている環境
   - submodule 内の `.gitattributes` が親リポジトリと衝突するケース
   - `references/` 配下に新規ディレクトリが追加されたケース（glob 拾い漏れ検出）
   - シンボリックリンクが `references/` 配下に存在するケース
2. 各エッジケースに対して `tested` / `manually-verified` / `not-tested` を割り当て
3. `not-tested` のケースに対して残存リスク（影響範囲・発生頻度）を 3段階で評価

**期待される成果物**: `outputs/phase-7/coverage-report.md` 内のセクション「エッジケース評価」

### タスク3: 未カバー領域の特定とリスク評価

**目的**: タスク0-2の結果を統合し、未カバー領域を一覧化、Phase 8 以降での対応要否を判定する。

**実行手順**:

1. `partial` / `uncovered` / `not-tested` の項目を集約
2. 各項目に対して以下を記録:
   - 影響範囲（特定パターンのみ / 全 references / グローバル）
   - 発生条件（通常マージ / 並行作業 / 環境依存）
   - 推奨対応（Phase 8でテスト追加 / Phase 11手動検証 / 受容）
3. カバレッジ目標との照合:
   - **パターン別カバレッジ: 100%**（全 `.gitattributes` エントリがいずれかのテストで参照されること）
   - **エッジケースカバレッジ: 80%以上**（5ケース中4ケース以上が tested / manually-verified）
4. 目標未達の場合は Phase 6 への戻りを提案

**期待される成果物**: `outputs/phase-7/coverage-report.md` 内のセクション「未カバー領域とリスク評価」

## 参照資料

| 資料名                         | パス                                                              | 用途                       |
| ------------------------------ | ----------------------------------------------------------------- | -------------------------- |
| `.gitattributes` 最新版        | `.gitattributes`                                                  | パターン抽出元             |
| マージドライバー登録スクリプト | `.claude/scripts/setup-merge-drivers.sh`                          | 依存エッジ検証対象         |
| Phase 4 テスト設計             | `outputs/phase-4/test-design.md`                                  | テストID 一覧              |
| Phase 6 テスト拡充記録         | `outputs/phase-6/test-expansion-record.md`                        | 追加テストID取得元         |
| 依存タスク仕様                 | `docs/30-workflows/completed-tasks/.../TASK-CONFLICT-PREVENT-001` | 既存検証範囲の引き継ぎ確認 |

## 成果物

| 成果物             | パス                                 | 説明                                                            |
| ------------------ | ------------------------------------ | --------------------------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | パターン別 / 依存エッジ / エッジケース / 未カバー領域評価を記載 |

## 統合テスト連携【必須】

| 判定項目                              | 基準             | 結果    |
| ------------------------------------- | ---------------- | ------- |
| パターン別カバレッジ                  | 100%             | pending |
| 依存エッジ (merge=ours ドライバー)    | 全ケース covered | pending |
| エッジケースカバレッジ                | 80%以上          | pending |
| 既存テスト（Phase 4-6）リグレッション | 全PASS           | pending |

## 完了条件

- [ ] `.gitattributes` の全エントリがマトリクスに登録されている
- [ ] パターン別カバレッジが 100% を達成している
- [ ] 依存エッジ (setup-merge-drivers.sh × `.gitattributes`) のカバレッジが確認済み
- [ ] エッジケース 5件中 4件以上が tested / manually-verified である
- [ ] 未カバー領域に対するリスク評価と推奨対応が記録されている
- [ ] `outputs/phase-7/coverage-report.md` が生成されている
- [ ] Phase 6 への戻りが必要な場合、理由が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
