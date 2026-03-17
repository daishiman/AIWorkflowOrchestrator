# UT-06-005-A: PreToolUse Hook フォールバック統合 - タスク指示書

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | UT-06-005-A                              |
| タスク名     | PreToolUse Hook フォールバック統合       |
| 分類         | 機能追加                                 |
| 対象機能     | SkillExecutor Permission Fallback        |
| 優先度       | 高                                       |
| 見積もり規模 | 小規模                                   |
| ステータス   | 完了（Phase 1-12 実施済み、PR未作成）    |
| 発見元       | Phase 12（UT-06-005 レビュー GAP-02/03） |
| 発見日       | 2026-03-16                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-06-005 で実装した processPermissionFallback/executeAbortFlow/executeSkipFlow を、SkillExecutor の PreToolUse Hook に統合する必要がある。現状これらのメソッドはテストからのみ呼ばれており、実行時フローに接続されていない。

### 1.2 問題点・課題

- processPermissionFallback/executeAbortFlow/executeSkipFlow が実装済みだが、実際のスキル実行パス（PreToolUse Hook）から呼び出されていない
- sendPermissionRequest の timeout エラー発生時に abort フローへの自動接続がない
- retry フロー時の再 Permission 要求ループが未実装

### 1.3 放置した場合の影響

- Permission Fallback が SkillExecutor 内部に閉じたまま、PreToolUse Hook から利用不可となる
- Hook ベースのスキル開発者が fallback を利用できず、Permission 拒否時に安全な中止やスキップができない
- timeout 発生時にプロセスがハングする可能性がある

---

## 2. 何を達成するか（What）

### 2.1 目的

- abort/skip/retry フローを実際のスキル実行パスに組み込み、PermissionResolver のレスポンスに応じて適切な分岐を実現する
- sendPermissionRequest の timeout エラーを abort フローに自動接続し、ユーザー操作なしで安全に中止できるようにする

### 2.2 最終ゴール

PreToolUse Hook 内で Permission 拒否が発生した場合に、processPermissionFallback が呼び出され、abort/skip/retry の各フローが正しく実行される状態。

### 2.3 スコープ

#### 含むもの

- PreToolUse Hook 内での processPermissionFallback 統合
- sendPermissionRequest の timeout エラーハンドリング
- retry フロー時の再 Permission 要求ループ（最大 PERMISSION_MAX_RETRIES=3 回）
- 統合シナリオのテスト追加

#### 含まないもの

- processPermissionFallback/executeAbortFlow/executeSkipFlow 自体のロジック変更（UT-06-005 で実装済み）
- Renderer 側の UI 変更（UT-06-005-C で対応）
- PermissionStore のセッション別管理（UT-06-005-B で対応）

### 2.4 成果物

- 修正済み `apps/desktop/src/main/services/skill/SkillExecutor.ts`（PreToolUse Hook 統合）
- PreToolUse Hook 統合シナリオのテストファイル
- Phase 1〜12 の成果物一式（`docs/30-workflows/` 配下）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-06-005 が完了済みであること（processPermissionFallback/executeAbortFlow/executeSkipFlow 実装済み）
- 既存テスト 275 ケースが全 PASS であること

### 3.2 依存タスク

- UT-06-005（完了済み: processPermissionFallback/executeAbortFlow/executeSkipFlow 実装）

### 3.3 必要な知識

- SkillExecutor の PreToolUse Hook の処理フロー（L1126-1184）
- sendPermissionRequest の実装（L1480-1516）
- processPermissionFallback/executeAbortFlow/executeSkipFlow の API と戻り値
- Electron IPC のエラーハンドリングパターン

### 3.4 推奨アプローチ

PreToolUse Hook の PermissionRequest イベントに processPermissionFallback を接続するアダプタパターンを採用する。具体的には:

1. PreToolUse Hook 内の sendPermissionRequest 呼び出し後のエラーハンドリングブロックで processPermissionFallback を呼び出す
2. timeout エラーを catch して executeAbortFlow("timeout") に接続する
3. retry フローでは Promise ベースのループで最大 PERMISSION_MAX_RETRIES=3 回まで再試行する

---

## 4. 実行手順

### Phase構成

標準 Phase 1〜12 構成に従う。本タスクは小規模のため、Phase 4（テスト作成）と Phase 5（実装）が中心となる。

### Phase 1: 要件定義

#### 目的

PreToolUse Hook 統合の詳細要件を確定する。

#### 手順

1. SkillExecutor.ts の PreToolUse Hook（L1126-1184）の現在の処理フローを分析する
2. sendPermissionRequest（L1480-1516）の timeout 条件を特定する
3. 統合ポイントと分岐条件を要件として定義する

#### 成果物

- phase-1-requirements.md

#### 完了条件

- 統合ポイントが特定され、分岐条件が明文化されていること

### Phase 2-3: 設計・設計レビュー

#### 目的

アダプタパターンの詳細設計を行い、レビューする。

#### 手順

1. PreToolUse Hook 内の processPermissionFallback 呼び出しシーケンスを設計する
2. timeout → abort 自動接続のフローを設計する
3. retry ループの制御フローを設計する

#### 成果物

- phase-2-design.md, phase-3-design-review.md

#### 完了条件

- 設計レビューが PASS または MINOR であること

### Phase 4: テスト作成

#### 目的

PreToolUse Hook 統合シナリオのテストを作成する。

#### 手順

1. PreToolUse Hook で processPermissionFallback が呼ばれるシナリオのテストを作成する
2. timeout 時に executeAbortFlow("timeout") が呼ばれるテストを作成する
3. retry フロー時に Permission 要求が再発行されるテストを作成する
4. 既存テスト 275 ケースの PASS 維持を確認する

#### 成果物

- 統合テストファイル

#### 完了条件

- テストケースが Red 状態であること（実装前）

### Phase 5: 実装

#### 目的

PreToolUse Hook に processPermissionFallback を統合する。

#### 手順

1. PreToolUse Hook 内で sendPermissionRequest → processPermissionFallback の連携を実装する
2. sendPermissionRequest の timeout エラーを catch して executeAbortFlow("timeout") を呼び出す
3. retry フロー時の再 Permission 要求ループを実装する（最大 PERMISSION_MAX_RETRIES=3 回）

#### 成果物

- 修正済み SkillExecutor.ts

#### 完了条件

- Phase 4 のテストが全 PASS であること

### Phase 6-12: テスト拡充〜完了

標準フェーズに従い、カバレッジ確認・リファクタリング・品質検証・最終レビュー・手動テスト・ドキュメント更新・PR 作成を実施する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] PreToolUse Hook で processPermissionFallback が実行時フローから呼ばれること
- [ ] timeout 時に executeAbortFlow("timeout") が呼ばれること
- [ ] retry フロー時に Permission 要求が再発行されること（最大 3 回）

### 品質要件

- [ ] 既存テスト 275 ケースが全 PASS であること
- [ ] 新規テストで PreToolUse Hook 統合シナリオを検証すること
- [ ] Line Coverage 80% 以上、Branch Coverage 60% 以上

### ドキュメント要件

- [ ] implementation-guide.md（Part 1: 概念説明、Part 2: 実装詳細）が作成されていること
- [ ] Phase 12 の全チェックリストが完了していること

---

## 6. 検証方法

### テストケース

| #   | テストケース                                             | 期待結果                                    |
| --- | -------------------------------------------------------- | ------------------------------------------- |
| 1   | Permission 拒否時に processPermissionFallback が呼ばれる | processPermissionFallback が1回呼ばれること |
| 2   | timeout 発生時に abort フローが実行される                | executeAbortFlow("timeout") が呼ばれること  |
| 3   | retry フローで Permission 要求が再発行される             | sendPermissionRequest が最大3回呼ばれること |
| 4   | 3回 retry 後に最終的に abort される                      | executeAbortFlow が呼ばれること             |
| 5   | 既存テスト 275 ケースが全 PASS                           | テスト結果に failure がないこと             |

### 検証手順

1. `pnpm --filter @repo/desktop test` で全テスト実行
2. 新規テストの PASS 確認
3. カバレッジレポートで基準達成を確認

---

## 7. リスクと対策

| リスク                            | 影響度 | 発生確率 | 対策                                                                     |
| --------------------------------- | ------ | -------- | ------------------------------------------------------------------------ |
| Hook API 変更時の breaking change | 高     | 低       | アダプタパターンで Hook と fallback ロジックを疎結合に保つ               |
| retry ループの無限ループ          | 高     | 低       | PERMISSION_MAX_RETRIES 定数で上限を厳守、P13（タイマー無限ループ）を参照 |
| 既存テストへの影響                | 中     | 中       | 既存テスト 275 ケースの全 PASS を Phase 5 完了条件に含める               |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/UT-06-005-abort-skip-retry-fallback/` （親タスクの完了成果物）
- `.claude/rules/06-known-pitfalls.md` - P5（リスナー二重登録）、P13（タイマーテスト無限ループ）

### 参考資料

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`
  - L1126-1184: PreToolUse Hook
  - L1480-1516: sendPermissionRequest

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
UT-06-005 Phase 12 レビューにて GAP-02/03 として検出:
processPermissionFallback/executeAbortFlow/executeSkipFlow が
テストからのみ呼ばれており、PreToolUse Hook の実行時フローに
接続されていない。
```

### 補足事項

- 発見元: UT-06-005 Phase 10/12 レビュー
- 関連 GAP: GAP-02（PreToolUse Hook からの processPermissionFallback 呼び出し未接続）、GAP-03（timeout → abort 自動接続未実装）
