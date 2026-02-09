# Phase 1: 要件定義書

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | TASK-FIX-12-1-IPC-HARDCODE-FIX                        |
| フェーズ     | Phase 1: 要件定義                                     |
| 作成日       | 2026-02-09                                            |
| ステータス   | 完了                                                  |
| 関連ルール   | 04-electron-security.md (IPCセキュリティ原則)         |
| 対象ファイル | apps/desktop/src/main/services/skill/SkillExecutor.ts |

---

## 1. 目的

SkillExecutor.ts 内で IPC チャネル名 `"skill:stream"` がハードコードされている箇所を、定数 `SKILL_CHANNELS.SKILL_STREAM` への参照に置き換える。

### 1.1 背景

- プロジェクトのセキュリティルール（04-electron-security.md）では、IPC チャネル名のハードコードを禁止している
- SkillExecutor.ts の L918 および L1214 で `"skill:stream"` がハードコードされている
- 同ファイルの L22 で `SKILL_CHANNELS` は既にインポート済みであり、最小限の変更で対応可能

### 1.2 期待される効果

- IPC セキュリティ原則への準拠
- チャネル名の一元管理による保守性向上
- チャネル名変更時の影響範囲を定数定義ファイルに限定

---

## 2. 機能要件

### FR-1: IPC チャネル名のハードコード置換

| ID     | 要件                                                                  | 優先度 |
| ------ | --------------------------------------------------------------------- | ------ |
| FR-1-1 | L918 の `"skill:stream"` を `SKILL_CHANNELS.SKILL_STREAM` に置換する  | 必須   |
| FR-1-2 | L1214 の `"skill:stream"` を `SKILL_CHANNELS.SKILL_STREAM` に置換する | 必須   |

### FR-2: 既存機能の動作維持

| ID   | 要件                                                         | 優先度 |
| ---- | ------------------------------------------------------------ | ------ |
| FR-2 | `sendStream()` および `sendHooksStream()` の動作に変更がない | 必須   |

#### 対象メソッド詳細

**sendStream() (L911-L919)**

```typescript
private sendStream(message: SkillStreamMessage): void {
  if (this.mainWindow.isDestroyed()) {
    return;
  }
  this.mainWindow.webContents.send("skill:stream", message);  // L918: 変更対象
}
```

**sendHooksStream() (L1209-L1219)**

```typescript
private sendHooksStream(message: HooksStreamMessage): void {
  try {
    if (this.mainWindow.isDestroyed()) {
      return;
    }
    this.mainWindow.webContents.send("skill:stream", message);  // L1214: 変更対象
  } catch (error) {
    console.error("[SkillExecutor] Failed to send hooks stream:", error);
  }
}
```

---

## 3. 非機能要件

| ID    | 要件                                                           | 優先度 |
| ----- | -------------------------------------------------------------- | ------ |
| NFR-1 | IPC セキュリティ原則（04-electron-security.md）への準拠        | 必須   |
| NFR-2 | 保守性向上: チャネル名の一元管理により、変更時の影響範囲を限定 | 必須   |

### NFR-1 詳細: IPC セキュリティ原則

04-electron-security.md より抜粋:

> - DO: チャンネル名はホワイトリストで管理し、定数で参照
> - DON'T: ハードコード文字列でチャンネル名を指定しない

---

## 4. 受け入れ基準

| ID   | 基準                                                                        | 検証方法       |
| ---- | --------------------------------------------------------------------------- | -------------- |
| AC-1 | L918 および L1214 の両箇所が `SKILL_CHANNELS.SKILL_STREAM` に変更されている | コードレビュー |
| AC-2 | 既存テスト（SkillExecutor.test.ts 等）が全て PASS する                      | テスト実行     |
| AC-3 | プロダクションコード内に `"skill:stream"` のハードコードが残っていない      | grep 検索      |

### AC-3 検証コマンド

```bash
grep -r '"skill:stream"' apps/desktop/src/main/services/skill/SkillExecutor.ts
# 期待結果: 該当なし（0件）
```

---

## 5. スコープ

### 5.1 対象範囲

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`
  - L918: `sendStream()` メソッド内
  - L1214: `sendHooksStream()` メソッド内

### 5.2 対象外

- テストファイル（テストでは文字列リテラルの使用を許容）
- ドキュメント内のチャネル名記載
- `SKILL_CHANNELS` 定数の定義自体の変更

---

## 6. 依存関係

### 6.1 利用する既存リソース

| リソース                    | 場所                                   | 説明                     |
| --------------------------- | -------------------------------------- | ------------------------ |
| SKILL_CHANNELS.SKILL_STREAM | `@repo/shared/src/ipc/channels.ts:179` | 定数値: `"skill:stream"` |
| SKILL_CHANNELS インポート   | SkillExecutor.ts L22                   | 既にインポート済み       |

### 6.2 変更による影響

- **影響範囲**: SkillExecutor.ts のみ
- **テスト変更**: 不要（既存テストがそのまま動作）
- **API 変更**: なし（ランタイム動作は同一）

---

## 7. 完了条件チェックリスト

- [ ] FR-1-1: L918 の置換完了
- [ ] FR-1-2: L1214 の置換完了
- [ ] FR-2: 既存テスト全 PASS
- [ ] AC-1: コードレビューで置換確認
- [ ] AC-2: `pnpm --filter @repo/desktop test` PASS
- [ ] AC-3: grep で残存ハードコードなし確認
- [ ] NFR-1: セキュリティ原則準拠確認
- [ ] NFR-2: 保守性向上確認（定数参照化）

---

## 8. 次フェーズ

Phase 2: 設計 → `outputs/phase-2/architecture-design.md`
