# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 6                                    |
| Phase名    | テスト拡充                           |
| 前提Phase  | Phase 5                              |
| 後続Phase  | Phase 7                              |
| ステータス | spec_created                         |
| 作成日     | 2026-03-29                           |
| 機能名     | task-rt-02-api-key-ui-adapter-status |

## 目的

正常系だけでなく、health failure、API 例外、未登録 provider、retry、a11y の回帰を固める。

## 実行タスク

- 異常系テスト追加: `llm.checkHealth` 失敗や errorMessage 表示を追加検証する
- 境界値テスト追加: 未登録 provider と空結果の挙動を検証する
- a11y/回帰テスト追加: retry と既存 API key フローの共存を確認する

## 実行手順

### タスク1: health failure 系

観点:

- `disconnected`
- `error`
- `errorMessage === null`
- `errorMessage` 長文

### タスク2: provider 境界値

観点:

- 未登録 provider は health 対象外
- `apiKey.list()` が空配列でもクラッシュしない
- `apiKey.list()` 異常 shape を空配列へ正規化できる

### タスク3: retry / 回帰

観点:

- retry 中だけ対象行が disabled になる
- retry 後の行更新が他 provider へ波及しない
- save/delete 後に provider 一覧と health 状態が整合する

## 統合テスト連携【必須】

| 判定項目       | 基準 | 結果   |
| -------------- | ---- | ------ |
| 異常系シナリオ | 80%+ | 未実施 |
| retry シナリオ | 100% | 未実施 |
| a11y シナリオ  | 100% | 未実施 |
| 既存フロー回帰 | 100% | 未実施 |

## 参照資料

| 参照資料          | パス                                                                              | 内容          |
| ----------------- | --------------------------------------------------------------------------------- | ------------- |
| IPC セキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | 既存 API 前提 |
| API key UI テスト | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/`        | 既存テスト群  |

## 成果物

| 成果物             | パス                                       | 説明                |
| ------------------ | ------------------------------------------ | ------------------- |
| テスト拡充レポート | `outputs/phase-6/test-expansion-report.md` | 異常系/回帰追加内容 |

## 完了条件

- [ ] 異常系テストが追加されている
- [ ] 境界値テストが追加されている
- [ ] retry と既存 API key フローの回帰が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: カバレッジ確認
