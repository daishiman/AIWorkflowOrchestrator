# [#1365] "[UT-SLIDE-UI-001] Slide Workspace UI 4領域実装"

## メタ情報

```yaml
task_id: UT-SLIDE-UI-001
task_name: Slide Workspace UI 4領域実装
category: UI実装
target_feature: slide-ai-runtime-alignment
priority: 高
scale: 中規模
status: 完了
source_phase: TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 Phase 11/12 再監査
created_date: 2026-03-19
completed_date: 2026-03-21
dependencies:
  - UT-SLIDE-IMPL-001（部分依存。runtime 契約の残件のみ継続）
spec_path: docs/30-workflows/completed-tasks/task-ut-slide-ui-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 完了   |

## 実施結果

- `SlideSyncCard` / `SlideProgressRow` / `SlideWatchStatus` / `SlideGuidanceBlock` / `TerminalLauncher` を current branch の `SlideWorkspace` に統合
- `handoffGuidance` を UI 状態判定へ接続し、settings 遷移と CLI コマンド表示を有効化
- degraded の再試行を `manualSync` へ結線
- focus ring 追加と synced badge コントラスト修正を同時反映
- Phase 11 証跡を current workflow 配下へ 5状態 x Light/Dark の 10枚で再構成
- Task09 正本、issue/completed-task、follow-up 台帳の stale 記述を更新

## 検証証跡

| 項目               | 結果                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| スクリーンショット | `docs/30-workflows/ut-slide-ui-001/outputs/phase-11/screenshots/` に 10枚生成             |
| メタデータ         | `phase11-capture-metadata.json` に static fallback 理由を記録                             |
| 視覚確認           | guidance light/dark を目視確認済み                                                        |
| 自動テスト         | targeted vitest を試行したが `@esbuild/darwin-arm64` / `darwin-x64` mismatch で起動前失敗 |

## 残課題

| 未タスクID                    | 内容                                                          |
| ----------------------------- | ------------------------------------------------------------- |
| `UT-SLIDE-IMPL-001`           | native terminal 起動、IPC rename、reverse-sync 表現の完全収束 |
| `UT-SLIDE-UI-CLOSE-ERROR-001` | close/cancel エラーの UI surfacing                            |
| `UT-SLIDE-UI-HIG-LEGACY-001`  | legacy slide コンポーネントの色統一                           |

## 備考

live preview は `esbuild` native binary mismatch により起動できなかったため、この issue では static fallback capture を current 証跡として採用した。環境差分の解消後に live capture へ置換する余地は残るが、今回の UI 差分確認には十分な証跡が揃っている。
