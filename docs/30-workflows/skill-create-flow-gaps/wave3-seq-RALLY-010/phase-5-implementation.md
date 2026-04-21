# Phase 5: 実装

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 5                        |
| タスクID   | TASK-RALLY-010           |
| 機能名     | ラリー完了状態UI表示追加 |
| 前提Phase  | Phase 4                  |
| 後続Phase  | Phase 6                  |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

Phase 2 の設計通りに `ConversationalInterview.tsx` を変更し、Phase 4 で Red になったテストを Green にする。

## 直列/並列情報

- **本タスク（RALLY-010）完了後にRALLY-011が着手可能**
- 同一ファイルへの変更のため、RALLY-011と並列実行不可

## 実装手順

1. `packages/shared/src/types/skillCreator.ts` を読み、`SkillCreatorWorkflowUiSnapshot` 型の `phase` / `status` フィールドの型と取りうる値を確認する
2. 完了フェーズを示す値の定数または型ガード関数を定義する（インラインまたは別ユーティリティ）
3. `isRallyCompleted` 変数を `pendingRequest` 導出の直後に追加する
4. JSX の `pendingRequest` 三項演算子の else 節を3分岐（完了/待機/入力中）に差し替える
5. `data-testid="interview-completed"` の追加
6. 待機メッセージを「次の質問を準備しています...」に変更
7. `pnpm typecheck` と `pnpm lint` を実行しエラーがないことを確認する
8. `pnpm test` で Green になることを確認する

## 主な変更点

- L44付近: `isRallyCompleted` 変数の追加
- L419〜L426付近: else節を3分岐（完了/待機/入力中）に変更
- `data-testid="interview-completed"` の追加
- 待機メッセージを「次の質問を準備しています...」に変更

## 参照資料

| 資料名       | パス                                     | 説明           |
| ------------ | ---------------------------------------- | -------------- |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md` | Phase 1 成果物 |
| UI設計書     | `outputs/phase-2/ui-design.md`           | Phase 2 成果物 |
| 変更差分設計 | `outputs/phase-2/change-diff-design.md`  | Phase 2 成果物 |
| テスト仕様書 | `outputs/phase-4/test-specification.md`  | Phase 4 成果物 |

## 成果物

| 成果物           | パス                                        | 説明                 |
| ---------------- | ------------------------------------------- | -------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容の要約       |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更したファイル一覧 |

## 完了条件

- [ ] `isRallyCompleted` 判定ロジックが実装されていること
- [ ] 3分岐レンダリングが実装されていること
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
  docs/30-workflows/skill-create-flow-gaps/p10-seq-RALLY-010
```

## 次のPhase

Phase 6: テスト拡充
