# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 4                                              |
| Phase名    | テスト作成                                     |
| 前提Phase  | Phase 3 (設計レビューゲート) ※本タスクでは省略 |
| 後続Phase  | Phase 5 (実装)                                 |
| ステータス | 未実施                                         |
| 作成日     | 2026-02-08                                     |
| タスクID   | TASK-FIX-12-1-IPC-HARDCODE-FIX                 |
| タスク名   | SkillExecutorのIPCチャネル名定数化             |
| 分類       | リファクタリング（小規模）                     |

---

## 目的

既存テストが通ることを確認し、リファクタリング前の動作が正常であることを保証する。

## 背景

本タスクは動作変更を伴わない小規模リファクタリングであり、ハードコードされた `"skill:stream"` を `SKILL_CHANNELS.SKILL_STREAM` 定数に置き換えるのみ。既存のテストカバレッジで十分に検証されているため、新規テスト追加は不要。

---

## 問題箇所

| ファイル         | 行番号 | 現状コード                                                   |
| ---------------- | ------ | ------------------------------------------------------------ |
| SkillExecutor.ts | L918   | `this.mainWindow.webContents.send("skill:stream", message);` |
| SkillExecutor.ts | L1214  | `this.mainWindow.webContents.send("skill:stream", message);` |

---

## 参照資料

| 参照資料           | パス                                                                         | 内容               |
| ------------------ | ---------------------------------------------------------------------------- | ------------------ |
| 対象コード         | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                      | 修正対象           |
| 定数定義           | `packages/shared/src/ipc/channels.ts`                                        | SKILL_CHANNELS定義 |
| 既存テスト         | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`       | メインテスト       |
| 既存テスト (Hooks) | `apps/desktop/src/main/services/skill/__tests__/hooks.test.ts`               | Hooks関連テスト    |
| 既存テスト (Retry) | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts` | リトライテスト     |

### IPC セキュリティルール参照

> `.claude/rules/04-electron-security.md` より:
>
> - DO: チャンネル名はホワイトリストで管理し、定数で参照
> - DON'T: ハードコード文字列でチャンネル名を指定しない

---

## 成果物

| 成果物             | パス             | 内容               |
| ------------------ | ---------------- | ------------------ |
| テスト実行結果確認 | (コンソール出力) | 既存テストPASS確認 |

---

## 実行手順

### Step 1: 既存テストの実行確認

```bash
# SkillExecutor関連テストを実行
pnpm --filter @repo/desktop test -- SkillExecutor

# Hooks関連テストを実行
pnpm --filter @repo/desktop test -- hooks.test
```

### Step 2: テスト結果確認

- [ ] `SkillExecutor.test.ts` が全てPASS
- [ ] `hooks.test.ts` が全てPASS
- [ ] `SkillExecutor.retry.test.ts` が全てPASS

### Step 3: 定数参照のテスト確認

既存テストでは `"skill:stream"` がハードコードされているが、本リファクタリングでは:

1. プロダクションコードのみ定数化する
2. テストコード側のハードコードはそのまま維持（テストの意図を明確に保つ）

**理由**: テストコードは「期待される具体的な値」を検証するため、ハードコードが許容される。プロダクションコードのみ定数参照に統一する。

---

## TDD検証

### 確認項目

- [x] 既存テストで `"skill:stream"` チャネルへの送信が検証されている（SkillExecutor.test.ts L177, L338等）
- [x] sendStreamメソッドの動作が既存テストでカバーされている
- [x] sendHooksStreamメソッドの動作が hooks.test.ts でカバーされている

---

## 統合テスト連携

**該当なし**: 本タスクは動作変更を伴わないリファクタリング（IPCチャネル名の定数化）のため、統合テストへの影響はありません。既存のテストスイートがPASSすることで動作互換性を確認します。

---

## 完了条件

- [ ] 既存テストが全てPASSすることを確認
- [ ] テスト失敗がないことを確認
- [ ] TypeScriptコンパイルエラーがないことを確認

---

## 依存関係

- **前提**: なし（既存コードの動作確認のみ）
- **後続**: Phase 5 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-fix-12-1-ipc-hardcode-fix/phase-5-implementation.md`
