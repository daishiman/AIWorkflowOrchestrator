# 変更ファイル一覧

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 5               |
| 作成日 | 2026-02-04      |
| 作成者 | Claude Opus 4.5 |

---

## 変更ファイル

| ファイルパス                                 | 変更種別 | 変更内容                                 |
| -------------------------------------------- | -------- | ---------------------------------------- |
| `apps/desktop/src/preload/channels.ts`       | 修正     | 旧チャンネル定義削除、ホワイトリスト更新 |
| `apps/desktop/src/preload/skill-api.ts`      | 修正     | ハードコード文字列を定数に置換           |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | 修正     | ハンドラーを統一チャンネル名に更新       |

---

## 詳細

### 1. apps/desktop/src/preload/channels.ts

**変更行（概算）:**

- L171-174: `SKILL_LIST_AVAILABLE`, `SKILL_LIST_IMPORTED` 削除
- L380-382: `ALLOWED_INVOKE_CHANNELS` から旧チャンネル削除

### 2. apps/desktop/src/preload/skill-api.ts

**変更行:**

- L232-235: `onComplete` のハードコード文字列をIPC_CHANNELS定数に置換
- L241-244: `onError` のハードコード文字列をIPC_CHANNELS定数に置換

### 3. apps/desktop/src/main/ipc/skillHandlers.ts

**変更行:**

- L41-69: `SKILL_LIST_AVAILABLE` → `SKILL_LIST` ハンドラー更新
- L71-113: `SKILL_LIST_IMPORTED` → `SKILL_GET_IMPORTED` ハンドラー更新
- L432-434: `unregisterSkillHandlers()` の removeHandler 更新
