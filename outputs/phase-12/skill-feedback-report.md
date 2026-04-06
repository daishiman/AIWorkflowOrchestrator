# skill-feedback-report.md — TASK-P0-09-U1

## テンプレート改善観点

### 1. TDD サイクルの明確化

**観点**: Phase 4（Red）でテストを書く際に「プライベートメソッドのテスト方法」が仕様書に記載されていなかった。

# Phase 12: スキルフィードバック — TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

**改善案**: Phase 4 仕様書テンプレートに「private method テストは `(facade as unknown as FacadePrivate)` キャストを使う」等の補足を追加するか、「public callback 経由でテスト」を推奨するガイドを記載する。

### 2. improve phase の canUseTool 配線の明確化

**観点**: `improve()` フローが `llmAdapter.sendChat()` を使用するため SDK callback が適用されないことが仕様書から読み取れなかった。Phase 5 のタスク2で「`createImproveGovernanceCanUseTool()` を接続」と書かれているが、接続先（`applyImprovement()` vs SDK callback）が曖昧だった。

1. runtime guard は入口で統一すると UI/IPC/テストの一貫性が保たれる
2. structured error を shared type で定義し、renderer は message 正規化に専念させると責務が分離できる
3. execute ack 後の snapshot 再読込で failure path の取りこぼしを防げる
4. improve failure の snapshot は `recordImproveFailure()` に寄せると phase 遷移の整合が保てる
5. Phase 11 NON_VISUAL は証跡ファイルの current facts 化まで含めないと drift が残る

**改善案**: 仕様書に「improve フローでの canUseTool 適用可能範囲と制約」を明記する。

## ワークフロー改善観点

### 小規模タスクの outputs 省略許可

**観点**: 小規模タスク（phase-1〜3 で既に設計が自明な場合）でも全 Phase outputs が必須となっており、ドキュメント作成コストが実装コストを上回るケースがある。

**改善案**: 規模（小/中/大）に応じて必須 outputs を tier 分けする仕組みを検討する。

## 改善点なしの判断

- Phase 仕様書の構造（目的・実行タスク・成果物・完了条件）は明確で実用的
- TDD フローの Phase 4（Red）→ Phase 5（Green）→ Phase 6（拡充）は正しい順序
- 知見セクション（苦戦箇所）が実装の助けになった
  特になし（follow-up は未タスク検出レポートに記録済み）。
