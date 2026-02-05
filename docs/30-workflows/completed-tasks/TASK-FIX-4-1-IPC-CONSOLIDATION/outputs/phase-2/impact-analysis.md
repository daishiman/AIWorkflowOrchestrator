# 影響範囲分析

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 2               |
| 作成日 | 2026-02-04      |
| 作成者 | Claude Opus 4.5 |

---

## 1. 修正対象ファイル一覧

### 1.1 Preload層（高影響）

| ファイル                                | 修正内容                             | 影響度 |
| --------------------------------------- | ------------------------------------ | ------ |
| `apps/desktop/src/preload/channels.ts`  | 旧チャンネル削除、ホワイトリスト更新 | 高     |
| `apps/desktop/src/preload/skill-api.ts` | ハードコード→定数置換                | 中     |

### 1.2 Main Process層（高影響）

| ファイル                                     | 修正内容                   | 影響度 |
| -------------------------------------------- | -------------------------- | ------ |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | ハンドラーチャンネル名変更 | 高     |

### 1.3 Shared層（中影響）

| ファイル                              | 修正内容       | 影響度 |
| ------------------------------------- | -------------- | ------ |
| `packages/shared/src/ipc/channels.ts` | 重複定義の削除 | 中     |

### 1.4 テスト（中影響）

| ファイル                                                           | 修正内容             | 影響度 |
| ------------------------------------------------------------------ | -------------------- | ------ |
| `apps/desktop/src/preload/__tests__/channels.skill-import.test.ts` | チャンネル名更新     | 中     |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`        | ハンドラーテスト更新 | 中     |

---

## 2. 影響を受けるコンポーネント

### 2.1 直接影響

| コンポーネント          | 影響内容                       |
| ----------------------- | ------------------------------ |
| IPC_CHANNELS定数        | 旧チャンネル定数削除           |
| ALLOWED_INVOKE_CHANNELS | 旧チャンネル削除               |
| skillHandlers           | ハンドラー登録チャンネル名変更 |
| skill-api.ts            | ハードコード文字列置換         |

### 2.2 間接影響（影響軽微）

| コンポーネント           | 影響内容                                  |
| ------------------------ | ----------------------------------------- |
| SkillService             | 変更なし（IPC層の変更のみ）               |
| Renderer（skillSlice等） | Preload API経由のため影響なし             |
| Store                    | 内部的にPreload APIを使用するため影響軽微 |

---

## 3. grepによる使用箇所特定

### 3.1 旧チャンネル使用箇所

```bash
# SKILL_LIST_AVAILABLE使用箇所
grep -rn "SKILL_LIST_AVAILABLE" apps/desktop/src/ --include="*.ts"
```

予想される検出結果:

- `preload/channels.ts` - 定義
- `main/ipc/skillHandlers.ts` - ハンドラー登録

```bash
# SKILL_LIST_IMPORTED使用箇所
grep -rn "SKILL_LIST_IMPORTED" apps/desktop/src/ --include="*.ts"
```

予想される検出結果:

- `preload/channels.ts` - 定義
- `main/ipc/skillHandlers.ts` - ハンドラー登録

### 3.2 ハードコード文字列使用箇所

```bash
# "skill:*" as string パターン
grep -rn '"skill:' apps/desktop/src/ --include="*.ts" | grep "as string"
```

予想される検出結果:

- `preload/skill-api.ts:233` - `"skill:complete" as string`
- `preload/skill-api.ts:243` - `"skill:error" as string`

---

## 4. テスト影響分析

### 4.1 修正が必要なテスト

| テストファイル                | 修正内容                     |
| ----------------------------- | ---------------------------- |
| channels.skill-import.test.ts | 旧チャンネル定数のテスト削除 |
| skillHandlers.test.ts         | ハンドラーチャンネル名更新   |

### 4.2 既存テストの期待結果変更

| テスト項目                             | 旧期待値 | 新期待値               |
| -------------------------------------- | -------- | ---------------------- |
| 旧チャンネル存在テスト                 | 存在する | 削除（テスト自体削除） |
| ホワイトリストに旧チャンネル含むテスト | true     | false                  |

---

## 5. リスク評価

### 5.1 リスク一覧

| リスク                  | 影響度 | 発生確率 | 軽減策                           |
| ----------------------- | ------ | -------- | -------------------------------- |
| 既存機能の破損          | 高     | 低       | 全テスト実行、手動テスト         |
| 型エラーの見落とし      | 中     | 低       | TypeScript厳密チェック           |
| ホワイトリスト漏れ      | 高     | 低       | ユニットテストで全チャンネル検証 |
| packages/sharedへの影響 | 中     | 中       | 依存関係の確認                   |

### 5.2 軽減策実施計画

| 軽減策                       | 実施タイミング |
| ---------------------------- | -------------- |
| TypeScriptコンパイルチェック | 各修正後       |
| ユニットテスト実行           | Phase 5実装後  |
| 統合テスト実行               | Phase 6後      |
| 手動テスト実行               | Phase 11       |

---

## 6. 移行手順

### 6.1 推奨移行順序

1. **channels.ts**: 旧チャンネル定数を削除
2. **channels.ts**: ホワイトリストから旧チャンネルを削除
3. **skill-api.ts**: ハードコード文字列を定数に置換
4. **skillHandlers.ts**: ハンドラーのチャンネル名を新チャンネルに変更
5. **packages/shared**: 重複定義を削除
6. **テスト**: 関連テストを更新

### 6.2 ロールバック計画

変更前にgitでブランチを作成し、問題発生時はブランチを切り戻す。
