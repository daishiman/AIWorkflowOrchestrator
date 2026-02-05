# 受け入れ基準

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 1               |
| 作成日 | 2026-02-04      |
| 作成者 | Claude Opus 4.5 |

---

## AC-001: チャンネル名統一

| AC ID    | 基準                                                 | 検証方法                          |
| -------- | ---------------------------------------------------- | --------------------------------- |
| AC-001-1 | `skill:list-available`が`skill:list`に統一されている | grepで`skill:list-available`が0件 |
| AC-001-2 | `skill:list-imported`が`skill:getImported`に統一     | grepで`skill:list-imported`が0件  |
| AC-001-3 | 仕様書定義の12チャンネルが全て登録されている         | channels.tsの定数確認             |

---

## AC-002: ハードコード文字列排除

| AC ID    | 基準                                             | 検証方法                              |
| -------- | ------------------------------------------------ | ------------------------------------- |
| AC-002-1 | `"skill:*" as string`パターンが排除されている    | grepで`as string`が0件（skill関連）   |
| AC-002-2 | 全てのスキルチャンネル呼び出しがIPC_CHANNELS経由 | コードレビュー + TypeScriptコンパイル |

---

## AC-003: 定義一元化

| AC ID    | 基準                                                        | 検証方法     |
| -------- | ----------------------------------------------------------- | ------------ |
| AC-003-1 | IPC_CHANNELS定義が`preload/channels.ts`に集約               | ファイル確認 |
| AC-003-2 | `packages/shared`のスキル関連定義が削除または再エクスポート | ファイル確認 |

---

## AC-004: ホワイトリスト整合性

| AC ID    | 基準                                                | 検証方法       |
| -------- | --------------------------------------------------- | -------------- |
| AC-004-1 | ALLOWED_INVOKE_CHANNELSに必要なチャンネルが全て登録 | ユニットテスト |
| AC-004-2 | ALLOWED_ON_CHANNELSに必要なチャンネルが全て登録     | ユニットテスト |
| AC-004-3 | 旧チャンネルがホワイトリストから削除されている      | ユニットテスト |

---

## AC-005: セキュリティ維持

| AC ID    | 基準                                            | 検証方法                                        |
| -------- | ----------------------------------------------- | ----------------------------------------------- |
| AC-005-1 | safeInvoke/safeOnパターンが全ての呼び出しで使用 | コードレビュー                                  |
| AC-005-2 | sender検証が全ハンドラーで実施されている        | skillHandlers.tsのvalidateIpcSender呼び出し確認 |

---

## AC-006: 型安全性

| AC ID    | 基準                          | 検証方法         |
| -------- | ----------------------------- | ---------------- |
| AC-006-1 | TypeScriptコンパイルエラー0件 | `pnpm typecheck` |
| AC-006-2 | ESLintエラー0件               | `pnpm lint`      |

---

## AC-007: テスト成功

| AC ID    | 基準                            | 検証方法             |
| -------- | ------------------------------- | -------------------- |
| AC-007-1 | 全ユニットテストがPASS          | `pnpm test`          |
| AC-007-2 | カバレッジ基準達成（Line 80%+） | `pnpm test:coverage` |

---

## 検証コマンド一覧

```bash
# AC-001: チャンネル名統一
grep -rn "skill:list-available" apps/desktop/src/ --include="*.ts" | grep -v test
grep -rn "skill:list-imported" apps/desktop/src/ --include="*.ts" | grep -v test

# AC-002: ハードコード文字列
grep -rn '"skill:' apps/desktop/src/ --include="*.ts" | grep -v test | grep "as string"

# AC-006: 型安全性
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint

# AC-007: テスト
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:coverage
```
