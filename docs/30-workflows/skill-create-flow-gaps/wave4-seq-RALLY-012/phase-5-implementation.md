# Phase 5: 実装

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 5                  |
| タスクID   | TASK-RALLY-012     |
| 機能名     | エラー回復導線追加 |
| 前提Phase  | Phase 4            |
| 後続Phase  | Phase 6            |
| 作成日     | 2026-04-21         |
| ステータス | pending            |

## 目的

Phase 2 の設計通りに `ConversationalInterview.tsx` を変更し、Phase 4 で Red になったテストを Green にする。

## 直列/並列情報

- **本タスク（RALLY-012）完了後にRALLY-013が着手可能**
- 同一ファイルへの変更のため、RALLY-013 と並列実行不可

## 実装手順

1. `ConversationalInterviewProps` に `onReset?: () => void` を追加する
2. `localError` state と `lastAnswerRef` を追加する
3. `submitAnswer` を変更して `setLocalError` と `lastAnswerRef` への保持を追加する
4. `handleRetry` と `handleReset` ハンドラを追加する
5. コンポーネントの分割代入に `onReset` を追加する
6. JSX の入力エリア分岐の前にエラーUI分岐を追加する（4分岐構成）
7. `pnpm typecheck` と `pnpm lint` を実行しエラーがないことを確認する
8. `pnpm test` で Green になることを確認する

## 主な変更点

- `ConversationalInterviewProps` に `onReset` を追加
- `localError` state と `lastAnswerRef` の追加
- `submitAnswer` のエラー処理に `setLocalError` と `lastAnswerRef` への保持を追加
- `handleRetry` / `handleReset` ハンドラの追加
- JSX にエラー回復UI（`data-testid="interview-error-recovery"`）の追加
- レンダリング分岐: エラー → 入力 → 完了 → 待機 の4分岐

## 参照資料

| 資料名         | パス                                      | 説明           |
| -------------- | ----------------------------------------- | -------------- |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`  | Phase 1 成果物 |
| 回復導線設計書 | `outputs/phase-2/recovery-flow-design.md` | Phase 2 成果物 |
| テスト仕様書   | `outputs/phase-4/test-specification.md`   | Phase 4 成果物 |

## 成果物

| 成果物           | パス                                        | 説明                 |
| ---------------- | ------------------------------------------- | -------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容の要約       |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更したファイル一覧 |

## 完了条件

- [ ] `localError` state と `lastAnswerRef` が実装されていること
- [ ] `handleRetry` / `handleReset` ハンドラが実装されていること
- [ ] エラーUI（4分岐）が実装されていること
- [ ] `pnpm typecheck` でエラー 0 件
- [ ] `pnpm lint` でエラー 0 件
- [ ] Phase 4 のテストが Green になっていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p12-seq-RALLY-012
```

## 次のPhase

Phase 6: テスト拡充
