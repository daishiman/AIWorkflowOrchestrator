# Phase 3: 設計レビュー - IPC契約ドリフト自動検出スクリプト

## メタ情報

| 項目   | 値                                           |
| ------ | -------------------------------------------- |
| Phase  | 3                                            |
| 機能名 | UT-TASK06-007-ipc-contract-drift-auto-detect |
| 作成日 | 2026-03-18                                   |

## 目的

Phase 1（要件定義）とPhase 2（設計）の成果物をレビューし、Phase 4（テスト作成）へ進行可能か判定する。設計の妥当性・完全性・実現可能性を検証する。

## 実行タスク

- 要件-設計トレーサビリティ確認: FR/NFR/ACが設計に反映されているか検証
- 設計妥当性レビュー: grepベースの抽出精度・検出ルールの網羅性を評価
- simpler alternative検討: より単純な設計代替案の有無を評価
- Phase 4開始条件の確認: テスト作成に必要な情報が揃っているか検証

## 参照資料

| 資料名        | パス                              | 説明          |
| ------------- | --------------------------------- | ------------- |
| Phase 1成果物 | `outputs/phase-1/requirements.md` | FR/NFR/AC定義 |
| Phase 2成果物 | `outputs/phase-2/design.md`       | 設計書        |
| Phase 2仕様書 | `phase-2-design.md`               | 設計仕様書    |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                   |
| -------------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 既存の手動チェック手順 |
| セキュリティ-Electron IPC  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ設計    |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC実装パターンの正本  |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | Phase 9品質ゲート基準  |

## 実行手順

### ステップ1: 要件-設計トレーサビリティマトリクス

| 要件ID | 要件概要                        | 設計での反映箇所                | 反映状態   |
| ------ | ------------------------------- | ------------------------------- | ---------- |
| FR-01  | Mainハンドラ引数型抽出          | ステップ3: 抽出パターン設計     | {{STATUS}} |
| FR-02  | Preload API呼び出しパターン抽出 | ステップ3: 抽出パターン設計     | {{STATUS}} |
| FR-03  | チャンネル名照合・引数形式検出  | ステップ4: 検出ルール R-02      | {{STATUS}} |
| FR-04  | 片方のみ存在するチャンネル検出  | ステップ4: 検出ルール R-01/R-04 | {{STATUS}} |
| FR-05  | exit code による成否判定        | ステップ5: CLI設計              | {{STATUS}} |
| FR-06  | JSON/Markdownレポート出力       | ステップ6: レポート形式設計     | {{STATUS}} |
| FR-07  | `--report-only` モード          | ステップ5: CLI設計              | {{STATUS}} |
| FR-08  | `--strict` モード               | ステップ5: CLI設計              | {{STATUS}} |
| NFR-01 | 実行時間10秒以内                | grepベース（AST不使用）で担保   | {{STATUS}} |
| NFR-04 | worktree対応                    | `__dirname` ベースパス          | {{STATUS}} |

### ステップ2: 設計妥当性レビュー

#### 2.1 抽出精度の評価

| 評価観点               | 判定基準                                   | 結果       |
| ---------------------- | ------------------------------------------ | ---------- |
| grepパターンの網羅性   | `ipcMain.handle` の全パターンをカバー      | {{RESULT}} |
| 動的チャンネル名の扱い | IPC_CHANNELS定数のみ対応（既存ルール準拠） | {{RESULT}} |
| false positive率       | 非IPCの `handle` 呼び出しを除外できるか    | {{RESULT}} |
| コメント内のコード無視 | コメントアウトされたコードを除外できるか   | {{RESULT}} |

#### 2.2 検出ルールの評価

| ルールID | P対応 | カバレッジ評価                              | 結果       |
| -------- | ----- | ------------------------------------------- | ---------- |
| R-01     | -     | チャンネル孤児の検出は有用か                | {{RESULT}} |
| R-02     | P44   | オブジェクト/プリミティブ判定の精度は十分か | {{RESULT}} |
| R-03     | P27   | ハードコード文字列の検出は補助的で十分か    | {{RESULT}} |
| R-04     | -     | 未登録チャンネルの検出はerror相当か         | {{RESULT}} |

#### 2.3 simpler alternative検討

| 代替案                                  | メリット                 | デメリット                        | 採用判定 |
| --------------------------------------- | ------------------------ | --------------------------------- | -------- |
| TypeScript Compiler APIでAST解析        | 精度が高い               | 依存増・実行時間増・複雑          | 不採用   |
| shell scriptのみ（.sh）                 | Node.js不要              | パターンマッチの柔軟性が低い      | 不採用   |
| ESLintカスタムルール                    | 既存ツールチェーンに統合 | IPC特有のクロスファイル検証が困難 | 不採用   |
| **grep/rgベースのTypeScriptスクリプト** | **バランス良好**         | **精度はAST未満**                 | **採用** |

### ステップ3: Phase 4開始条件の確認

| 確認項目                                | 条件                                            | 結果       |
| --------------------------------------- | ----------------------------------------------- | ---------- |
| テスト対象が明確か                      | `check-ipc-contracts.ts` のモジュール構成が決定 | {{RESULT}} |
| テストデータが準備可能か                | 既存のP44/P45パターンの具体例がある             | {{RESULT}} |
| IPCレスポンス形式が事前合意されているか | スクリプトのexit code仕様が決定（P60対策）      | {{RESULT}} |
| 既存テストへの影響がないか              | 新規スクリプトのため既存テストに影響なし        | {{RESULT}} |

### ステップ4: ゲート判定

| 判定  | 条件             | 戻り先            |
| ----- | ---------------- | ----------------- |
| PASS  | 設計に問題なし   | Phase 4           |
| MINOR | 軽微な修正で解決 | Phase 4（修正後） |
| MAJOR | 要件問題         | Phase 1           |
| MAJOR | 設計問題         | Phase 2           |

#### MINOR追跡テーブル

| MINOR ID           | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| ------------------ | -------- | ------------- | ------------- | ---- |
| (レビュー時に記入) |          |               |               |      |

## 統合テスト連携

| テスト観点   | 確認内容                             | 結果       |
| ------------ | ------------------------------------ | ---------- |
| 設計完全性   | 全FR/NFRが設計に反映されている       | {{RESULT}} |
| テスト可能性 | 各検出ルールのテストケースが設計可能 | {{RESULT}} |
| 統合ポイント | Phase 9への統合方法が明確            | {{RESULT}} |

## 多角的チェック観点（AIが判断）

Phase 10最終レビュー基準を先取りし、以下の7観点で設計を検証する:

| 観点               | 適用判断                                        | 仕様参照先                                                         |
| ------------------ | ----------------------------------------------- | ------------------------------------------------------------------ |
| 機能完全性         | FR-01〜FR-08が設計に網羅されているか            | Phase 1 要件定義書                                                 |
| コード品質         | 単一ファイル200行制約内でのモジュール分割       | `aiworkflow-requirements: quality-requirements.md`                 |
| テスト品質         | 各検出ルールのテストケースが設計可能か          | `aiworkflow-requirements: quality-requirements.md`                 |
| セキュリティ       | IPCチャンネルホワイトリストとの整合             | `aiworkflow-requirements: security-electron-ipc.md`                |
| パフォーマンス     | NFR-01（10秒以内）をgrepベースで達成可能か      | Phase 1 NFR定義                                                    |
| ドキュメント整合性 | Phase 9統合設計がphase-templates.mdと整合するか | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| エラーハンドリング | 検出レポートのexit code/形式が明確か            | `aiworkflow-requirements: error-handling.md`                       |

## 成果物

| 成果物           | パス                               | 説明           |
| ---------------- | ---------------------------------- | -------------- |
| 設計レビュー結果 | `outputs/phase-3/gate-decision.md` | ゲート判定結果 |

## 完了条件

- [ ] 要件-設計トレーサビリティマトリクスで全要件の反映を確認
- [ ] 抽出精度・検出ルールの妥当性を評価
- [ ] simpler alternative を検討し、採用判断を記録
- [ ] Phase 4開始条件を満たすことを確認
- [ ] ゲート判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR判定の場合、追跡テーブルに記入されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認（Phase 1/2成果物）
2. 要件-設計トレーサビリティ確認
3. 設計妥当性レビュー
4. simpler alternative検討
5. Phase 4開始条件の確認
6. ゲート判定
7. 成果物の作成・配置
8. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect --phase 3
```

## 次のPhase

Phase 4: テスト作成（TDD: Red）

**Phase 4 開始条件**: Phase 3のゲート判定がPASSまたはMINOR（指摘対応後）であること。
**Phase 13 blocked条件**: ユーザーの明示承認がない限り、Phase 13はblocked。
