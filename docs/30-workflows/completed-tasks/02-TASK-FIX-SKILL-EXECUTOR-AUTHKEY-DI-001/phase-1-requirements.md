# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 1                                             |
| 機能名     | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001        |
| タスク名   | SkillExecutorへのAuthKeyService注入経路の統一 |
| 前提Phase  | -                                             |
| 後続Phase  | Phase 2                                       |
| 作成日     | 2026-03-05                                    |
| ステータス | pending                                       |

## 目的

SkillExecutorの認証キー取得経路が注入あり・なしで分岐し、判定基準が分裂する。 を解消するための要件境界を固定する。

## 背景

SkillExecutorの認証キー取得経路が注入あり・なしで分岐し、判定基準が分裂する。

## Atent Team（SubAgent）編成

| SubAgent   | 関心ごと        | 主担当                     |
| ---------- | --------------- | -------------------------- |
| SubAgent-A | Main/IPC責務    | 登録順序・ライフサイクル   |
| SubAgent-B | Preload/API契約 | 型契約・公開境界           |
| SubAgent-C | Renderer/UX契約 | 状態遷移・表示整合         |
| SubAgent-D | 統合監査        | 矛盾・漏れ・整合・依存判定 |

## 実行タスク

- 要件抽出: ブランチ差分と再現ログから機能要件/非機能要件を抽出する
- aiworkflow仕様抽出: resource-map起点で必要仕様をカテゴリ単位で抽出する
- 受け入れ基準化: 矛盾なし・漏れなし・整合あり・依存整合の判定基準を定義する

## 参照資料

### 実装・コード

| 資料名             | パス                                                                        | 用途                      |
| ------------------ | --------------------------------------------------------------------------- | ------------------------- |
| Skill IPCハンドラ  | `apps/desktop/src/main/ipc/skillHandlers.ts`                                | SkillExecutor生成DIを確認 |
| SkillExecutor      | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                     | getApiKey判定順序を確認   |
| SkillService       | `apps/desktop/src/main/services/skill/SkillService.ts`                      | execute委譲境界を確認     |
| Auth連携テスト     | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts` | DI有無差分を確認          |
| Renderer preflight | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`            | 事前検知との整合を確認    |

### システム仕様（aiworkflow-requirements）

| 資料名                | パス                                                                                        | 用途                     |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Executor仕様          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`        | 実行時認証仕様           |
| Skill I/F             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | skill:execute契約        |
| Agent IPC仕様         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 失敗契約経路             |
| システムIPC仕様       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | auth-key契約             |
| 認証I/F               | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                      | 認証状態型               |
| 認証アーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`           | 認証責務分離             |
| Electronサービス層    | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | DI責務分離               |
| 全体アーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 層境界と配線確認         |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC/DI再発防止           |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | 境界防御                 |
| スキルIPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | safeInvoke/safeOn防御    |
| セキュリティ原則      | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                  | 認証キー保護原則         |
| Preloadセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Error.code伝搬境界       |
| エラーハンドリング    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | AUTHENTICATION_ERROR運用 |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 回帰検証基準             |
| タスク運用            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 台帳同期                 |
| 教訓                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | DI導入時の回帰教訓       |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                                                        | Phase実行時の再発防止    |
| リソースマップ        | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 抽出漏れ防止             |
| 検索スクリプト        | `.claude/skills/aiworkflow-requirements/scripts/search-spec.js`                             | 仕様抽出コマンド         |

## 実行手順

1. resource-map.md を起点に対象カテゴリを確定する。
2. search-spec.js でキーワード（TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001, IPC, auth, preload, renderer）を検索する。
3. 抽出した仕様を API/Interface/Security/Architecture/Error/Quality/Workflow に分類する。
4. 要件と受け入れ基準を矛盾なし・漏れなしの状態で固定する。

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- skill:execute の AUTHENTICATION_ERROR 伝搬を統合対象に固定する。
- AuthKeyService注入経路と env fallback 経路の優先順位を固定する。
- Renderer preflight と Main最終防衛の判定不一致を0件にする。
- 統合ログは `outputs/phase-1/` に保存する。

## 多角的チェック観点（20思考法）

| 思考法             | 確認内容                                  |
| ------------------ | ----------------------------------------- |
| 水平思考           | 代替経路の候補を列挙して盲点を減らす      |
| 逆説思考           | 逆の仮定から破綻条件を洗い出す            |
| システム思考       | Main/Preload/Rendererの相互作用を確認する |
| 垂直思考           | 症状から根因へ最短経路で掘り下げる        |
| 類推思考           | 既存の類似障害との共通構造を比較する      |
| if思考             | 条件分岐ごとの失敗パスを列挙する          |
| 素人思考           | 初見ユーザーの誤操作ポイントを確認する    |
| トレードオン思考   | 品質向上と速度維持を両立する案を選ぶ      |
| プラスサム思考     | 複数関係者の利益が増える設計を選ぶ        |
| 2軸思考            | 影響度×発生頻度で優先順位を決める         |
| 価値提案思考       | ユーザー価値への寄与順で施策を並べる      |
| why思考            | 五段階の理由分解で背景を固定する          |
| 改善思考           | 再発防止ルールまで設計する                |
| 戦略的思考         | 短期修正と中期運用を分離する              |
| ダブル・ループ思考 | 手順と判断基準の両方を改善する            |
| 抽象化思考         | 個別不具合を契約整合問題へ抽象化する      |
| プロセス思考       | 分析→設計→検証の流れを固定する            |
| 仮説思考           | 競合仮説を作り反証順を決める              |
| 論点思考           | 論点を排他的に分解して重複を消す          |
| 因果関係ループ     | 修正が新たな障害を生む循環を検査する      |

## 成果物

| 成果物               | パス                                                         | 説明                   |
| -------------------- | ------------------------------------------------------------ | ---------------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                 | 機能要件と非機能要件   |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                     | 検証可能なAC一覧       |
| 仕様抽出結果         | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | aiworkflow仕様抽出結果 |
| 差分カバレッジ       | `outputs/phase-1/branch-diff-coverage.md`                    | ブランチ差分反映確認   |
| トレーサビリティ行列 | `outputs/phase-1/implementation-spec-traceability-matrix.md` | 要件と仕様の対応表     |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001
```

## 次のPhase

Phase 2: 設計
