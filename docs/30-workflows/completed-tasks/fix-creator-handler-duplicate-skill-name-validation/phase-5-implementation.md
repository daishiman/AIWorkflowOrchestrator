# Phase 5: 実装（TDD Green フェーズ）

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 5                           |
| Phase名    | 実装                        |
| 前提Phase  | Phase 4（テスト作成）       |
| 後続Phase  | Phase 6（テスト実行・確認） |
| ステータス | 完了                        |
| 作成日     | 2026-04-06                  |
| タスクID   | TASK-FIX-IPC-SKILL-NAME-001 |

---

## 目的

Phase 4 で作成した回帰・境界テストを **Green（全通過）** にする最小実装を行う。

- Bug 1: 削除済みであることを確認し、完了を記録する
- Bug 2: `SkillService.ts` の `toWizardSkillName()` を `init_skill.js` に合わせて kebab-case 正規化する

変更は必要最小限に留め、関係のない既存ロジックには一切手を加えない。

---

## Bug 1: IPCハンドラ重複登録（実装完了）

### 完了ステータス

**修正済み** — Phase 3 完了時点で対応済み。

### 削除された内容

`apps/desktop/src/main/ipc/creatorHandlers.ts` から `SKILL_CREATOR_GET_ADAPTER_STATUS` の重複 `ipcMain.handle()` ブロックを削除した。

削除後は `SKILL_CREATOR_EXECUTE_PLAN` のハンドラが直後に続いており、全16チャンネルが重複なく連続登録される構造になっている。

### 完了確認方法

```bash
# SKILL_CREATOR_GET_ADAPTER_STATUS が1回だけ登場することを確認
grep -n "SKILL_CREATOR_GET_ADAPTER_STATUS" \
  apps/desktop/src/main/ipc/creatorHandlers.ts
```

出力に `ipcMain.handle(` が1箇所のみ含まれることを確認する。

---

## Bug 2: toWizardSkillName() バリデーション不整合

### 対象ファイル

`apps/desktop/src/main/services/skill/SkillService.ts`

### 実装結果

`SkillService.ts` の `toWizardSkillName()` は、`init_skill.js` が受け入れる
`/^[a-z0-9]+(-[a-z0-9]+)*$/` に合わせて正規化済みである。

### 実装手順

1. `apps/desktop/src/main/services/skill/SkillService.ts` を開く
2. `toWizardSkillName()` メソッドを特定する（`private toWizardSkillName(description: string): string`）
3. 下記の Before/After 差分を参照して修正を適用する

### Before / After コード差分

**Before（修正前の実装）**:

```typescript
private toWizardSkillName(description: string): string {
  // TODO(human): ここの変換ロジックを修正してください。
  // init_skill.js が受け入れるスキル名の仕様: /^[a-z0-9]+(-[a-z0-9]+)*$/
  // 現在の問題: 大文字・アンダースコア・日本語文字が通過してしまいバリデーション失敗する
  // 設計上の判断が必要: 日本語文字をどう変換するか（ハイフンに変換 vs 削除）
  const normalized = description
    .slice(0, 50)
    .trim()
    .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "new-skill";
}
```

**After（修正後の実装）**:

```typescript
private toWizardSkillName(description: string): string {
  // init_skill.js が受け入れるスキル名の仕様: /^[a-z0-9]+(-[a-z0-9]+)*$/
  // 日本語・大文字・アンダースコアはすべてハイフンに変換し、小文字化する
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

### 変更点の説明

| 変更                    | Before                                                     | After                  | 理由                                                                                                          |
| ----------------------- | ---------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `.toLowerCase()` を追加 | なし                                                       | `.trim()` の直後に挿入 | 大文字（例: `My Skill` → `my-skill`）を処理するため                                                           |
| 正規表現パターン変更    | `/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF_-]/g` | `/[^a-z0-9-]/g`        | `toLowerCase()` 後に大文字は存在しないため `A-Z` 不要。アンダースコア・日本語文字をハイフンに変換するため除去 |
| TODO コメント削除       | あり                                                       | なし                   | 実装完了のため                                                                                                |

---

## 実装後のテスト確認手順

### 1. Bug 2 ユニットテストの実行

```bash
# SkillService のテストのみ実行
pnpm --filter @repo/desktop test:run -- src/main/services/skill/__tests__/SkillService.test.ts
```

SS-TWSN-01〜SS-TWSN-11 と SS-CSW-01 が全て Green になることを確認する。

### 2. Bug 1 回帰テストの実行

```bash
# creatorHandlers の adapterStatus テストを実行
pnpm --filter @repo/desktop test:run -- src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts
```

T-IPC-13〜T-IPC-14 および既存 T-IPC-01〜T-IPC-12 が全て Green であることを確認する。

### 3. 全テストの実行

```bash
# desktop パッケージの全テストを実行
pnpm --filter @repo/desktop test:run
```

### 4. 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

---

## 既存テストへの影響確認リスト

以下のテストファイルは今回の変更によって影響を受ける可能性がある。修正後に全て Green であることを確認すること。

| テストファイル                             | 影響範囲          | 確認観点                                                                          |
| ------------------------------------------ | ----------------- | --------------------------------------------------------------------------------- |
| `creatorHandlers.adapterStatus.test.ts`    | Bug 1（修正済み） | T-IPC-01〜T-IPC-14 が引き続き通過すること                                         |
| `creatorHandlers.test.ts`                  | Bug 1 の間接影響  | 全ハンドラ登録後の動作が正常であること                                            |
| `creatorHandlers.fire-and-forget.test.ts`  | Bug 1 の間接影響  | `SKILL_CREATOR_EXECUTE_PLAN` ハンドラの動作が正常であること                       |
| `creatorHandlers.applyImprovement.test.ts` | Bug 1 の間接影響  | `SKILL_CREATOR_APPLY_IMPROVEMENT` ハンドラの動作が正常であること                  |
| `creatorHandlers.sessionResume.test.ts`    | Bug 1 の間接影響  | セッション関連ハンドラの動作が正常であること                                      |
| `SkillService.test.ts`                     | Bug 2（主要対象） | SS-TWSN-01〜SS-TWSN-11 と SS-CSW-01 が Green になること、既存テストが通過すること |
| `SkillService.delegate.test.ts`            | Bug 2 の間接影響  | `createSkillFromWizard` 経由での呼び出しが正常であること                          |
| `SkillService.execute.test.ts`             | Bug 2 の間接影響  | `executeSkill` 関連に影響がないこと                                               |

### 後方互換性に関する注意

- `toWizardSkillName("test-skill")` は修正後も `"test-skill"` を返す（英小文字＋ハイフン入力はそのまま通過）
- 修正は Main プロセス側のファイル生成時の変換ロジックのみを対象としており、既存のスキルファイルシステムには影響しない
- `resolveUniqueSkillName()` の動作は変わらないため、重複名解消ロジックは引き続き正常に機能する

---

## フェーズゲート条件

- [ ] `toWizardSkillName()` の `TODO(human)` コメントが削除され、簡潔な実装注釈に置き換わっていること
- [ ] SS-TWSN-01〜SS-TWSN-11 と SS-CSW-01 が全て Green であること
- [ ] T-IPC-13〜T-IPC-14 が全て Green であること
- [ ] `creatorHandlers.*.test.ts` の既存テストが全て Green であること
- [ ] `SkillService.*.test.ts` の既存テストが全て Green であること
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなく完了すること

全条件を満たした後、Phase 6（テスト実行・確認）に進む。
