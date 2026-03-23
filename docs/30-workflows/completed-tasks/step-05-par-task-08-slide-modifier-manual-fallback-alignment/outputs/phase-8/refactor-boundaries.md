# Phase 8: リファクタ境界

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 8                                                     |
| 作成日   | 2026-03-23                                            |
| タイプ   | 設計タスク（プロダクションコード変更なし）            |
| 前提     | Phase 3 PASS（MINOR 1件: MN-01）                      |

## 1. リファクタリング対象の分類

設計タスクにおける「リファクタリング」は、設計ドキュメントの構造整理を指す。
プロダクションコードの変更は後続実装タスクに委譲する。

### 1.1 安全に整理できる設計構造

| 対象                           | 整理内容                                      | リスク |
| ------------------------------ | --------------------------------------------- | ------ |
| 不正遷移の禁止リスト           | 4パターンを明文化し、実装タスクへの参照を付与 | 低     |
| UI 4領域の表示ルールマトリクス | 状態×領域の組合せを確定テーブルとして固定     | 低     |
| Cleanup 順序テーブル           | 9ステップの依存関係グラフを DAG 形式で補足    | 低     |
| DTO フィールド定義             | 必須/optional の区別を型注記で補強            | 低     |

### 1.2 整理を禁止する構造（Contract は変更不可）

| 対象                                 | 理由                                                              |
| ------------------------------------ | ----------------------------------------------------------------- |
| SlideUIStatus の4状態名              | Phase 3 PASS で確定済み。変更すると下流実装タスクの参照が壊れる   |
| 不正遷移4パターン                    | 確定済み契約。追加は可能だが削除・変更は Phase 3 再レビューが必要 |
| UX-07 TC-ID（S01〜S05）              | screenshot 契約は ux-ux-realization.md の参照元。変更不可         |
| cleanup 順序の Gate 条件             | 依存タスク（UT-SLIDE-IMPL-001 等）が参照する前提                  |
| ModifierResponse optional フィールド | 後方互換性のため、必須化は禁止。追加のみ許可                      |

## 2. 確定済み Contract の明文化

### 2.1 Lane 分離契約

```
integrated lane: skill-executor.ts が Agent SDK adapter を経由して実行
manual lane:     ユーザーが手動で操作し、slide の状態を更新する
```

- 2つの lane は**並列に存在**し、degraded 時に manual lane へ誘導する
- manual lane は integrated lane の「代替」ではなく「補完」
- lane の選択ロジックは skill-executor.ts が保持し、UI には公開しない

### 2.2 不正遷移の禁止（不変）

```
禁止 1: synced   → degraded   （実行なしで品質低下は起きない）
禁止 2: synced   → guidance   （実行なしでガイダンスは発生しない）
禁止 3: guidance → degraded   （ガイダンス中に品質低下へ後退しない）
禁止 4: degraded → running    （P62 準拠: degraded からの自動再実行禁止）
```

### 2.3 UI 4領域の表示ルール（不変）

| 領域              | synced | running | degraded | guidance |
| ----------------- | ------ | ------- | -------- | -------- |
| progress row      | show   | show    | show     | show     |
| guidance block    | hide   | hide    | show     | show     |
| fallback card     | hide   | hide    | show     | hide     |
| terminal launcher | hide   | hide    | hide     | show     |

### 2.4 Ownership 境界（不変）

| ファイル           | 変更権限          | Gate 条件                 |
| ------------------ | ----------------- | ------------------------- |
| agent-client.ts    | UT-SLIDE-IMPL-001 | Task09 governance 承認    |
| modifier-skill.ts  | UT-SLIDE-IMPL-001 | ModifierResponse 型確定後 |
| skill-executor.ts  | UT-SLIDE-IMPL-001 | Phase 3 PASS（充足済み）  |
| SlideWorkspace.tsx | UT-SLIDE-UI-001   | UI 4領域契約確定後        |

## 3. Simpler Alternative の再評価

Phase 2 で検討した Alternative を Phase 8 時点で再評価する。

| Alternative                           | 再評価結果 | 追加根拠（Phase 8 観点）                                           |
| ------------------------------------- | ---------- | ------------------------------------------------------------------ |
| 1: agent-client.ts 即時削除           | 不採用維持 | cleanup 順序テーブルの Gate 条件（順序5）が未充足のため変更不可    |
| 2: UI 4領域を汎用 banner に簡略化     | 不採用維持 | UX-07 S03（degraded）・S04（guidance）を別 TC で撮影する要件が残存 |
| 3: IPC namespace 統一を Task08 で実施 | 不採用維持 | 設計タスクのスコープ外。Task09 follow-up（順序6）で実施する        |

## 4. リファクタリング不要の判断根拠

本タスクはプロダクションコードを変更しない設計タスクのため、
コードリファクタリング（変数名変更・関数分割・重複除去等）は対象外。

設計ドキュメントのリファクタリングとして、以下を Phase 8 完了とする。

| 作業                           | 状態 |
| ------------------------------ | ---- |
| Contract の明文化（2.1〜2.4）  | 完了 |
| Alternative 再評価             | 完了 |
| 禁止事項の明示                 | 完了 |
| 後続実装タスクへの委譲事項確認 | 完了 |
