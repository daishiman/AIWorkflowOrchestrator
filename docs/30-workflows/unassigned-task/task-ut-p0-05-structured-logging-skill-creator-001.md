# UT-P0-05-STRUCTURED-LOGGING-SKILL-CREATOR-001

## メタ情報

| 項目       | 値                                                         |
| ---------- | ---------------------------------------------------------- |
| ステータス | 未着手                                                     |
| 優先度     | Low                                                        |
| 起票日     | 2026-03-30                                                 |
| 起票元     | TASK-P0-05 Phase 12 / unassigned-task-detection.md (UT-02) |
| 関連タスク | TASK-P0-05 (execute-skill-file-writer-integration)         |
| Issue番号  | #1768                                                      |

## 1. なぜこのタスクが必要か（Why）

TASK-P0-05 の実装において、persist 失敗時のログとして `console.warn` を一時的に採用した（MR-01）。
これは本番環境でのデバッグが困難になる技術的負債であり、プロジェクト全体の構造化ロギング方針（Logger サービス使用）と乖離している。

構造化ロギング（Logger）に移行することで、ログの検索・フィルタリング・集約が可能になり、
Electron のメインプロセスログとも統合できる。

## 2. 何を達成するか（What）

以下を実装する：

- `SkillFileWriter` 内の `console.warn` / `console.log` を Logger サービス呼び出しに置き換える
- `SkillCreatorWorkflowEngine` 内の `console.*` を Logger に置き換える
- ログレベル（info / warn / error）を適切に設定する
- Logger インスタンスをコンストラクタインジェクションまたはサービスロケータで取得する

## 3. どのように実行するか（How）

1. プロジェクト内の Logger サービス実装を確認する（`apps/desktop/src/main/services/` 等）
2. `SkillFileWriter` と `SkillCreatorWorkflowEngine` の `console.*` 呼び出し箇所を列挙する
3. Logger の DI（依存注入）パターンをプロジェクトの慣習に従って適用する
4. `console.warn` → `logger.warn`、`console.log` → `logger.info` に置き換える
5. 既存テストが Logger をモック対応できるよう調整する

## 3.5 苦戦箇所と解決策

| 苦戦箇所                              | 原因                                              | 解決策                                                               |
| ------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------- |
| Logger の DI 方法がクラスごとに異なる | プロジェクト内に複数の DI パターンが混在している  | 既存の `SkillService` 等の実装を参照し、同パターンを踏襲する         |
| テストでの Logger モックの書き方      | Logger をモックしないとテスト出力にログが混入する | `vi.mock` で Logger モジュールをスタブし、`warn`/`info` をスパイする |

## 受入基準

| ID   | 基準                                                                 |
| ---- | -------------------------------------------------------------------- |
| AC-1 | `SkillFileWriter` 内に `console.*` が残存しない                      |
| AC-2 | `SkillCreatorWorkflowEngine` 内に `console.*` が残存しない           |
| AC-3 | Logger 呼び出しにログレベルが適切に設定されている（warn/info/error） |
| AC-4 | 既存ユニットテストが引き続き pass する                               |
| AC-5 | Logger がテストでモック可能な設計になっている                        |
