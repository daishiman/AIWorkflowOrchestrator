# Phase 2: 設計

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 2                           |
| Phase名    | 設計                        |
| 前提Phase  | Phase 1（要件定義）         |
| 後続Phase  | Phase 3（設計レビュー）     |
| ステータス | 完了                        |
| 作成日     | 2026-04-06                  |
| タスクID   | TASK-FIX-IPC-SKILL-NAME-001 |

## 修正設計

### Bug 1: creatorHandlers.ts 重複ブロック削除

**変更種別**: 純粋削除（追加・変更なし）

**削除対象**

ファイル: `apps/desktop/src/main/ipc/creatorHandlers.ts`

`registerRuntimeSkillCreatorHandlers()` 内の 2回目の
`ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS, ...)` ブロックを削除する。

削除後は、1回目の `SKILL_CREATOR_GET_ADAPTER_STATUS` ハンドラの直後に
`IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN` の登録が続く。

**修正後の登録順序（正常）**

| 順番 | チャンネル                       | 位置                                       |
| ---- | -------------------------------- | ------------------------------------------ |
| 1    | SKILL_CREATOR_PLAN               | registerRuntimeSkillCreatorHandlers() 先頭 |
| 2    | SKILL_CREATOR_GET_ADAPTER_STATUS | 1回のみ登録                                |
| 3    | SKILL_CREATOR_EXECUTE_PLAN       | GET_ADAPTER_STATUS の直後                  |
| 4    | SKILL_CREATOR_GET_WORKFLOW_STATE | EXECUTE_PLAN の直後                        |
| 5    | SKILL_CREATOR_SUBMIT_USER_INPUT  | GET_WORKFLOW_STATE の直後                  |
| ...  | （以下14ハンドラが連続登録）     | ...                                        |

**IPC 4層整合性チェック**

| 層             | 対象                   | 変更     | 影響      |
| -------------- | ---------------------- | -------- | --------- |
| チャンネル定数 | `src/ipc/channels.ts`  | なし     | なし      |
| ホワイトリスト | `preload/channels.ts`  | なし     | なし      |
| ハンドラ登録   | `creatorHandlers.ts`   | 重複削除 | Bug 1解消 |
| Preload API    | `preload/skill-api.ts` | なし     | なし      |

→ IPC 4層は下位2層のみ関与。チャンネル定数・Preload APIは無変更で整合性維持。

---

### Bug 2: SkillService.toWizardSkillName() 変換ロジック修正

**変更種別**: 既存メソッド内の局所修正

**Before（修正前の実装）**

```typescript
// SkillService.ts 行317〜326
private toWizardSkillName(description: string): string {
  const normalized = description
    .slice(0, 50)
    .trim()
    .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "new-skill";
}
```

**After（修正後の実装）**

```typescript
private toWizardSkillName(description: string): string {
  const normalized = description
    .slice(0, 50)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "new-skill";
}
```

**変更差分の詳細**

| 変更 | Before                                                     | After            | 理由                                           |
| ---- | ---------------------------------------------------------- | ---------------- | ---------------------------------------------- | -------------------- |
| 追加 | （なし）                                                   | `.toLowerCase()` | 大文字を小文字化                               |
| 変更 | `/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF_-]/g` | `/[^a-z0-9-]/g`  | 日本語・大文字・アンダースコアをハイフンに変換 |
| 維持 | `.replace(/-+/g, "-")`                                     | 変更なし         | 連続ハイフン正規化                             |
| 維持 | `.replace(/^-+                                             | -+$/g, "")`      | 変更なし                                       | 先頭末尾ハイフン除去 |

**変換例**

| 入力                | Before出力          | After出力         | init_skill.js判定 |
| ------------------- | ------------------- | ----------------- | ----------------- |
| `"マイスキル"`      | `"マイスキル"`      | `"new-skill"`     | After: ✓          |
| `"My Data Skill"`   | `"My-Data-Skill"`   | `"my-data-skill"` | After: ✓          |
| `"my_skill"`        | `"my_skill"`        | `"my-skill"`      | After: ✓          |
| `"test-skill"`      | `"test-skill"`      | `"test-skill"`    | 両方: ✓           |
| `"データ分析-tool"` | `"データ分析-tool"` | `"tool"`          | After: ✓          |
| `""`                | `"new-skill"`       | `"new-skill"`     | 両方: ✓           |

**設計上のトレードオフ判断**

| 案     | 内容                                      | 採用理由                                   |
| ------ | ----------------------------------------- | ------------------------------------------ |
| 採用   | 日本語→ハイフン→`new-skill`フォールバック | 最小変更・仕様準拠・既存フォールバック活用 |
| 不採用 | 日本語→ローマ字変換ライブラリ導入         | 依存追加・スコープ外・過剰設計             |
| 不採用 | init_skill.jsのバリデーション緩和         | 仕様権威（18-skills.md）の劣化             |

---

## 修正ファイル一覧

| ファイル                                               | 変更種別 | 変更内容                                  |
| ------------------------------------------------------ | -------- | ----------------------------------------- |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`         | 削除     | 重複ハンドラブロック（35行）削除          |
| `apps/desktop/src/main/services/skill/SkillService.ts` | 修正     | `toWizardSkillName()` 変換ロジック（3行） |

## テスト設計概要（Phase 4で詳細化）

| テスト対象                            | テスト種別     | 検証内容                         |
| ------------------------------------- | -------------- | -------------------------------- |
| `registerRuntimeSkillCreatorHandlers` | 統合テスト     | 例外なく完走すること             |
| 全16チャンネル                        | ユニットテスト | 登録後にipcMainで応答可能なこと  |
| `toWizardSkillName`                   | ユニットテスト | 全入力パターンがAC-3を満たすこと |

## 依存関係

- Bug 1修正 ⊥ Bug 2修正（独立・並列実施可能）
- テスト設計は Bug 1/Bug 2 修正と並列に進め、修正後に再検証する
