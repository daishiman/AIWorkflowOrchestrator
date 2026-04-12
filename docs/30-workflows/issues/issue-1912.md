# [#1912] "[UT-FIX-EP-01-CONSOLE-ERROR-TO-LOGGER] executeAsync 内の console.error を Logger に置き換え"

## メタ情報

```yaml
task_id: UT-FIX-EP-01-CONSOLE-ERROR-TO-LOGGER
task_name: executeAsync 内の console.error を Logger に置き換え
category: リファクタリング / ログ基盤改善
target_feature: -
priority: 低
scale: 小規模
status: 未着手
source_phase: -
created_date: 2026-04-04
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-FIX-EP-01-CONSOLE-ERROR-TO-LOGGER.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未着手 |

---

## 概要

`RuntimeSkillCreatorFacade.executeAsync()` 内および `creatorHandlers.ts` の `.catch()` ブロック内で `console.error` を使用している。これをログレベル付き Logger（`electron-log` 等）に置き換え、ログの構造化と出力先制御を可能にする。

## 影響範囲

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — `executeAsync` の catch ブロック
- `apps/desktop/src/main/ipc/creatorHandlers.ts` — fire-and-forget の `.catch()` ハンドラー

## 対応方針

1. 既存のロギングサービス（`LoggingService` / `electron-log`）のインターフェースを確認
2. `console.error` を `logger.error()` に置き換え（ログレベル: `error`）
3. 構造化ログフォーマット（planId、エラーメッセージ、タイムスタンプ）を採用
4. 既存テストが全 PASS することを確認

## 苦戦箇所（TASK-FIX-EP-01 からの知見）

- **console.error 採用の理由**: fire-and-forget パターンの実装時、未処理 rejection 防止を最優先としたため、最もシンプルな `console.error` を採用した。Logger への移行は機能的な影響がないため MINOR として後回しにした
- **推奨**: プロジェクト全体のログ基盤整備（UT-06-002-UT-4-logger-unification）と合わせて対応すると一貫性が保てる

## 参照

- TASK-FIX-EP-01 Phase 3 要件レビュー: MINOR 指摘
- UT-06-002-UT-4-logger-unification: Logger 統一タスク（関連）
- `docs/30-workflows/fix-step3-seq-execute-plan-nonblocking/outputs/phase-12/unassigned-task-detection.md`: U-2
