# TASK-FIX-IPC-SKILL-NAME-001: IPCハンドラ重複登録とスキル名バリデーション不整合の修正

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | TASK-FIX-IPC-SKILL-NAME-001                                              |
| タスク名     | IPCハンドラ重複登録とスキル名バリデーション不整合の修正                  |
| ディレクトリ | `docs/30-workflows/fix-creator-handler-duplicate-skill-name-validation/` |
| 作成日       | 2026-04-06                                                               |
| ステータス   | 完了（Phase 1-12 完了 / Phase 13 保留）                                  |
| 分類         | Bug Fix                                                                  |
| 優先度       | P0 (スキル作成機能が全面停止)                                            |

## 背景・発見経緯

30種の思考法による多角的検証（elegant-review）を実施した結果、以下の2バグを特定した。

### Bug 1: IPCハンドラ重複登録 (致命的)

- **ファイル**: `apps/desktop/src/main/ipc/creatorHandlers.ts`
- **現象**: `registerRuntimeSkillCreatorHandlers()` 内で `IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS` の `ipcMain.handle()` が2回登録
- **影響**: 同一チャンネルの二重登録により 2回目で例外が発生し、後続の**14ハンドラが全て未登録**
- **ステータス**: 修正済み（重複ブロック削除完了）

### Bug 2: スキル名生成とバリデーション不整合

- **ファイル**: `apps/desktop/src/main/services/skill/SkillService.ts`
- **現象**: `toWizardSkillName()` が `init_skill.js` の受け入れ規則と一致しない文字を残す
- **影響**: `init_skill.js` の `/^[a-z0-9]+(-[a-z0-9]+)*$/` 検証に失敗 → `skill:create` が常にエラー
- **ステータス**: 修正済み（`toWizardSkillName()` 正規化完了）

## 影響範囲

```
Bug 1 影響ハンドラ（14ハンドラ）:
  skill-creator:execute-plan
  skill-creator:get-workflow-state
  skill-creator:submit-user-input
  skill-creator:improve-skill
  skill-creator:apply-improvement
  skill-creator:get-verify-detail
  skill-creator:reverify-workflow
  skill-creator:normalize-sdk-messages
  skill-creator:list-sessions
  skill-creator:get-session-detail
  skill-creator:resume-session
  skill-creator:delete-session
  skill-creator:cleanup-expired-sessions
  skill-creator:get-governance-state

Bug 2 影響ユーザーシナリオ:
  - 日本語説明でのスキル作成 → 失敗
  - 大文字を含む名前でのスキル作成 → 失敗
  - アンダースコアを含む名前でのスキル作成 → 失敗
```

## Phase一覧

| Phase    | 名前             | ステータス |
| -------- | ---------------- | ---------- |
| Phase 1  | 要件定義         | 完了       |
| Phase 2  | 設計             | 完了       |
| Phase 3  | 設計レビュー     | 完了       |
| Phase 4  | テスト作成       | 完了       |
| Phase 5  | 実装             | 完了       |
| Phase 6  | テスト拡充       | 完了       |
| Phase 7  | カバレッジ確認   | 完了       |
| Phase 8  | リファクタリング | 完了       |
| Phase 9  | 品質保証         | 完了       |
| Phase 10 | 最終レビュー     | 完了       |
| Phase 11 | 手動テスト       | 完了       |
| Phase 12 | ドキュメント更新 | 完了       |
| Phase 13 | PR作成           | 保留       |

## 成功基準

- [x] AC-1: `registerRuntimeSkillCreatorHandlers()` が例外なく完走する
- [x] AC-2: 全16のskill-creatorチャンネルが登録される
- [x] AC-3: `toWizardSkillName()` 出力が常に `/^[a-z0-9]+(-[a-z0-9]+)*$/` に適合する
- [x] AC-4: 日本語・大文字・アンダースコアを含む入力でもスキル作成が成功する
- [x] AC-5: 既存スキルへの後方互換性が維持される

## 関連ファイル

| ファイル                                               | 役割                             |
| ------------------------------------------------------ | -------------------------------- |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`         | Bug 1修正対象（修正済み）        |
| `apps/desktop/src/main/services/skill/SkillService.ts` | Bug 2修正対象（修正済み）        |
| `.agents/skills/skill-creator/scripts/init_skill.js`   | スキル名バリデーション仕様の権威 |
| `docs/00-requirements/18-skills.md`                    | スキル名規則の仕様書             |
