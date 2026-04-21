# Phase 5: 実装

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 5                    |
| タスクID   | TASK-RALLY-011       |
| 機能名     | 送信中競合防止UI強化 |
| 前提Phase  | Phase 4              |
| 後続Phase  | Phase 6              |
| 作成日     | 2026-04-21           |
| ステータス | pending              |

## 目的

Phase 2 の設計通りに `ConversationalInterview.tsx` を変更し、Phase 4 で Red になったテストを Green にする。

## 直列/並列情報

- **本タスク（RALLY-011）完了後にRALLY-012が着手可能**
- 同一ファイルへの変更のため、RALLY-012 と並列実行不可

## 実装手順

1. `ConversationalInterview.tsx` の `useRef` インポートを確認する（既存）
2. `pendingSnapshotRef` と `activeSnapshot` state を追加する
3. `workflowSnapshot` props変化を監視するuseEffectを追加する
4. `isSubmitting` 変化を監視してバッファを適用するuseEffectを追加する
5. UI表示での `workflowSnapshot` 参照を `activeSnapshot` に順次置き換える（UI表示用途のみ）
6. `submitAnswer` 内の IPC 呼び出し箇所は引き続き `workflowSnapshot`（props）を参照することを示すコメントを追加する
7. RALLY-010 で追加した `isRallyCompleted` が `activeSnapshot` を参照するよう修正する
8. `pnpm typecheck` と `pnpm lint` を実行しエラーがないことを確認する
9. `pnpm test` で Green になることを確認する

## 主な変更点

- `pendingSnapshotRef` の追加（`useRef<SkillCreatorWorkflowUiSnapshot | null>(null)`）
- `activeSnapshot` state の追加
- `workflowSnapshot` props変化バッファリングuseEffect の追加
- `isSubmitting` 変化バッファ適用useEffect の追加
- UI表示での `workflowSnapshot` 参照を `activeSnapshot` に置き換え

## 参照資料

| 資料名               | パス                                     | 説明           |
| -------------------- | ---------------------------------------- | -------------- |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md` | Phase 1 成果物 |
| バッファリング設計書 | `outputs/phase-2/buffering-design.md`    | Phase 2 成果物 |
| テスト仕様書         | `outputs/phase-4/test-specification.md`  | Phase 4 成果物 |

## 成果物

| 成果物           | パス                                        | 説明                 |
| ---------------- | ------------------------------------------- | -------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容の要約       |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更したファイル一覧 |

## 完了条件

- [ ] `pendingSnapshotRef` と `activeSnapshot` が実装されていること
- [ ] バッファリング制御 useEffect が実装されていること
- [ ] UI表示が `activeSnapshot` を参照していること
- [ ] IPC呼び出し（submit）が props の `workflowSnapshot` を参照していること
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
  docs/30-workflows/skill-create-flow-gaps/p11-seq-RALLY-011
```

## 次のPhase

Phase 6: テスト拡充
