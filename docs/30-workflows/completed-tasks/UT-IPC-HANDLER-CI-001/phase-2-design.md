# Phase 2: 設計

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 2                                                 |
| 機能名     | UT-IPC-HANDLER-CI-001                             |
| タスク名   | ipcMain.handle() の重複・欠損を CI で自動検出する |
| 前提Phase  | Phase 1                                           |
| 後続Phase  | Phase 3                                           |
| 作成日     | 2026-04-18                                        |
| ステータス | pending                                           |

## 目的

スナップショットテストの設計と CI 統合方針を確定する。

## 背景

`SKILL_CREATOR_GET_ADAPTER_STATUS` チャンネルの二重登録によって後続14ハンドラが全て未登録になる連鎖障害が発生した。スナップショットテストにより登録チャンネル一覧を静的に固定し、重複・欠損を CI で自動検出できる設計を確立する。

## SubAgentチーム編成

| SubAgent   | 関心ごと             | 主担当                                  |
| ---------- | -------------------- | --------------------------------------- |
| SubAgent-A | テスト設計           | mock capture パターン・初期化タイミング |
| SubAgent-B | スナップショット戦略 | inline vs file snapshot 選択            |
| SubAgent-C | CI統合設計           | 既存 workflow との統合確認              |
| SubAgent-D | 統合監査             | 矛盾・漏れ・整合・依存判定              |

## 設計方針

- `vi.hoisted` + `vi.mock("electron")` + `mockImplementation` で `ipcMain.handle` 登録チャンネル名配列を capture する
- `toMatchSnapshot()` でチャンネル一覧をスナップショット固定する
- `new Set(handles).size !== handles.length` で重複検出する
- テストファイル: `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts`

## 実行タスク

1. テストアーキテクチャ設計（mock capture パターン・初期化タイミング）
2. スナップショット戦略設計（inline vs file snapshot の選択）
3. CI ワークフロー統合設計（既存 workflow との統合確認）
4. 依存整合マトリクス作成

## 参照資料

| 参照資料             | パス                                                                                        | 説明                       |
| -------------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                                                | Phase 1 成果物             |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                                                    | Phase 1 成果物             |
| 登録チャンネル一覧   | `outputs/phase-1/channel-list.md`                                                           | Phase 1 成果物             |
| creatorHandlers      | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                              | 対象ファイル               |
| 既存 CI ワークフロー | `.github/workflows/`                                                                        | 統合先の既存 workflow 確認 |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPCライフサイクルパターン  |

## 実行手順

1. Phase 1 成果物を入力として確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. mock capture パターンとスナップショット戦略の設計書を作成する。
4. CI 統合設計書を作成する。
5. 依存整合マトリクスを作成する。
6. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- Phase 4 の `integration-test-plan.md` には、ここで設計した mock capture パターンと CI 実行経路を入力として渡す。
- Phase 5 では本設計に沿って `registerRuntimeSkillCreatorHandlers()` の public registration surface のみを検証対象にする。

## 多角的チェック観点

| 観点     | 確認内容                                                                          |
| -------- | --------------------------------------------------------------------------------- |
| 矛盾     | mock capture パターンが既存テストの mock 設定と干渉しないか確認する               |
| 漏れ     | inline snapshot と file snapshot のトレードオフが設計書に明記されているか確認する |
| 整合性   | CI ジョブの実行順序がテスト依存関係と一致しているか確認する                       |
| 依存関係 | Vitest バージョンでスナップショット API が利用可能か確認する                      |

## 成果物

| 成果物             | パス                                               | 説明                              |
| ------------------ | -------------------------------------------------- | --------------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`           | mock capture パターン・テスト構成 |
| テスト戦略         | `outputs/phase-2/test-strategy.md`                 | スナップショット戦略              |
| CI統合設計         | `outputs/phase-2/ci-integration-design.md`         | CI ワークフロー統合方針           |
| 依存整合マトリクス | `outputs/phase-2/dependency-consistency-matrix.md` | 依存関係表                        |

## 完了条件

- [ ] mock capture パターンとスナップショット戦略が設計書に明記されている
- [ ] CI 統合方法が確定している
- [ ] 既存テストとの干渉がない設計になっている
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-IPC-HANDLER-CI-001
```

## 次のPhase

Phase 3: 設計レビューゲート
