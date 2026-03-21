# リスクレジスタ

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 9 - 品質検証                          |
| タスク     | TASK-02-RUNTIME-POLICY-CENTRALIZATION |
| 作成日     | 2026-03-21                            |
| 前提成果物 | phase-1 ~ phase-8 の全成果物          |

---

## リスク一覧

| ID  | リスク                                                            | 深刻度 | Mitigation                                                                                                                                                     | 担当 Phase         |
| --- | ----------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| R-1 | M-1: RuntimeDecisionForRenderer 型未定義                          | 中     | Phase 5 で型ファイルを作成。仕様は確定済み（apiKey を除外した RuntimeDecision のサブセット）                                                                   | 実装タスク Phase 5 |
| R-2 | M-2: resolve シグネチャの実装適用確認                             | 低     | Phase 4 で `resolve(authMode, apiKey): RuntimeDecision` として確定済み。実装時に contract-matrix.md との照合を実施                                             | 実装タスク Phase 5 |
| R-3 | M-3: AI_CHECK_CONNECTION cleanup タスクID 未割当                  | 低     | Phase 12 で未タスク仕様書として割当。既存参照の段階的除去計画を作成                                                                                            | Phase 12           |
| R-4 | AI_CHECK_CONNECTION の新規参照防止 lint ルールが未実装            | 中     | 実装タスクで ESLint カスタムルールまたは `no-restricted-imports` で制御。暫定は grep ベースの CI チェック                                                      | 実装タスク         |
| R-5 | RuntimeResolver deprecated 宣言が未実施                           | 低     | Task03（settings-shell-access-matrix-mainline）実装時に JSDoc `@deprecated` を追加。resolve() への移行ガイドをコメントに記載                                   | Task03 Phase 5     |
| R-6 | buildForAgentExecution / buildForSkillExecution deprecated 未実施 | 低     | Task05（terminal-handoff-surface-realization）で `@deprecated` 宣言を追加。buildForSurface() への移行を促す                                                    | Task05 Phase 5     |
| R-7 | packages/shared への型定義移動時の monorepo ビルド影響            | 中     | Task03 で HandoffGuidance 型を shared に移動する際、`pnpm typecheck` で全パッケージのビルド整合性を確認。P8（幽霊依存）に注意し、package.json の依存宣言を検証 | Task03 Phase 5     |

---

## リスク深刻度の定義

| 深刻度 | 定義                                                                 |
| ------ | -------------------------------------------------------------------- |
| 高     | 実装着手をブロックする。解決まで Phase 5 に進行不可                  |
| 中     | 実装タスク内で対応が必要。対応しない場合、後続タスクに影響が波及する |
| 低     | 対応が望ましいが、後続タスクで対応可能。設計段階での解決は不要       |

---

## リスク対応状況サマリ

| 深刻度 | 件数 | ブロッキング                   |
| ------ | ---- | ------------------------------ |
| 高     | 0    | なし                           |
| 中     | 3    | なし（実装タスク内で対応可能） |
| 低     | 4    | なし（後続タスクで対応予定）   |

**結論**: 高深刻度のリスクはゼロ。実装タスクへの着手をブロックするリスクは存在しない。中深刻度の R-1, R-4, R-7 は実装タスク内で対応する。
