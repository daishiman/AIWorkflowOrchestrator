# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 1                                                      |
| 機能名     | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001             |
| タスク名   | auth-key IPCハンドラ登録漏れとライフサイクル整合の修正 |
| 前提Phase  | -                                                      |
| 後続Phase  | Phase 2                                                |
| 作成日     | 2026-03-05                                             |
| ステータス | pending                                                |

## 目的

`auth-key:exists` で `No handler registered` が発生し、実行前認証確認が停止する。 を解消するための要件境界を固定する。

## 背景

`auth-key:exists` で `No handler registered` が発生し、実行前認証確認が停止する。

## SubAgentチーム編成

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

| 資料名             | パス                                                                  | 用途                             |
| ------------------ | --------------------------------------------------------------------- | -------------------------------- |
| Main IPC登録       | `apps/desktop/src/main/ipc/index.ts`                                  | 登録順序と解除順序を確認         |
| authKeyハンドラ    | `apps/desktop/src/main/ipc/authKeyHandlers.ts`                        | handlersRegistered状態管理を確認 |
| Preload公開API     | `apps/desktop/src/preload/index.ts`                                   | authKey.exists公開契約を確認     |
| Renderer preflight | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`      | 実行前停止条件を確認             |
| 二重登録回帰テスト | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` | 再登録回帰を確認                 |

### システム仕様（aiworkflow-requirements）

| 資料名                | パス                                                                                        | 用途                      |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約監査基準           |
| システムIPC仕様       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | auth-keyチャネル仕様      |
| Agent IPC仕様         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | preflightとexecute境界    |
| 認証インターフェース  | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                      | Auth型契約                |
| 認証アーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`           | 責務分離境界              |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender検証順序            |
| Preloadセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | 公開境界                  |
| セキュリティ原則      | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                  | 認証キー運用原則          |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPCライフサイクルパターン |
| エラーハンドリング    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 失敗契約                  |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質ゲート                |
| タスク運用            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 台帳同期ルール            |
| 教訓                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発防止知見              |
| リソースマップ        | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 抽出漏れ防止              |
| 検索スクリプト        | `.claude/skills/aiworkflow-requirements/scripts/search-spec.js`                             | 仕様抽出コマンド          |

## 実行手順

1. resource-map.md を起点に対象カテゴリを確定する。
2. search-spec.js でキーワード（TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001, IPC, auth, preload, renderer）を検索する。
3. 抽出した仕様を API/Interface/Security/Architecture/Error/Quality/Workflow に分類する。
4. 要件と受け入れ基準を矛盾なし・漏れなしの状態で固定する。

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- auth-key:set / auth-key:exists / auth-key:validate / auth-key:delete を統合対象に固定する。
- Main登録完了時刻とRenderer呼び出し時刻をログで突合する。
- 再登録シナリオで `No handler registered` を再発させない。
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001
```

## 次のPhase

Phase 2: 設計
