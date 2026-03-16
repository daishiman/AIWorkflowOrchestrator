# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| タスク ID  | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001                                         |
| Phase      | 8 / 13                                                                      |
| 作成日     | 2026-03-16                                                                  |
| 担当       | 実装担当者                                                                  |
| 依存 Phase | Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）— 完了済み |
| 成果物パス | `docs/30-workflows/electron-app-menu-zoom/phase-8-refactoring.md`           |

---

## 目的

Phase 5 で実装した `apps/desktop/src/main/index.ts` のメニュー関連コードを、単一責務原則（SRP）・重複排除・型安全の観点からレビューし、コード品質を改善する。リファクタリング後もすべてのテストが PASS し、既存のセキュリティ設定・IPC ハンドラが変更されていないことを確認する。

---

## 実行タスク

| No. | タスク名                  | 目的                                                                  |
| --- | ------------------------- | --------------------------------------------------------------------- |
| 1   | 共通 submenu の抽出検討   | `buildMacTemplate()` と `buildDefaultTemplate()` の共通部分を評価する |
| 2   | role 定数の整理           | マジック文字列が使用されていないことを確認する                        |
| 3   | SRP 準拠確認              | 各関数が単一の責務のみを持つことを確認する                            |
| 4   | `index.ts` 肥大化チェック | メニュー関連コードの行数を計測し、ファイル分離の判断基準を適用する    |
| 5   | リファクタリング後の検証  | テスト再実行により動作が変わっていないことを確認する                  |

---

## 参照資料

| 資料                                                               | 参照理由                                         |
| ------------------------------------------------------------------ | ------------------------------------------------ |
| `docs/30-workflows/electron-app-menu-zoom/phase-1-requirements.md` | NFR-5（100 行以内）の基準確認                    |
| `docs/30-workflows/electron-app-menu-zoom/phase-2-design.md`       | コード配置設計（選択肢 A の判断理由）の再確認    |
| `apps/desktop/src/main/index.ts`                                   | リファクタリング対象ファイル                     |
| `apps/desktop/src/main/__tests__/menu.test.ts`                     | リファクタリング後に再実行するテストファイル     |
| `.claude/rules/02-code-quality.md`                                 | TypeScript 型安全、SRP、`any` 型禁止のルール確認 |

---

## 実行手順

### Step 1: 共通 submenu の抽出検討

`buildMacTemplate()` と `buildDefaultTemplate()` の「表示」メニューは以下の同一 submenu を持つ。

```typescript
{ role: "zoomIn" },
{ role: "zoomOut" },
{ role: "resetZoom" },
{ type: "separator" },
{ role: "togglefullscreen" },
```

**判断基準の適用**:

- 重複コードが 2 箇所のみ（5 行）であり、抽出によって得られる保守性向上と、関数が増えることによる可読性低下のトレードオフを評価する。
- 共通 submenu を `buildViewSubmenu()` として抽出した場合、`buildMacTemplate()` と `buildDefaultTemplate()` の両方がこの関数を参照するため、表示メニュー構造の変更が 1 箇所で完結する。
- 一方、現在の重複は 5 行であり、視認性は高い。過度な抽象化は避ける（CLAUDE.md: 「三つの似たコードは早すぎる抽象化より良い」）。

**判断**: 両関数で「表示」submenu が完全に同一の構造を持つ場合のみ `buildViewSubmenu()` を抽出する。macOS テンプレートに将来的に表示メニューの差分（開発者ツール等）が追加される可能性がある場合は抽出しない。

**実施手順**:

1. `apps/desktop/src/main/index.ts` を読み込み、`buildMacTemplate()` と `buildDefaultTemplate()` の「表示」submenu が一致しているか確認する。
2. 完全に一致している場合: `buildViewSubmenu()` を抽出し、両関数から参照する。
3. 差分がある場合: 抽出せず、コメントで「将来の統合を検討する」旨を記載する。

### Step 2: role 定数の整理

Electron の `MenuItemConstructorOptions` の `role` フィールドは TypeScript の型システムで制限されており、`'zoomIn' | 'zoomOut' | 'resetZoom' | ...` の union 型に対してコンパイル時検査が行われる。

**確認項目**:

1. `role` の値がすべて string literal（マジック文字列）でなく、型チェックが通ることを確認する。
   - OK: `{ role: "zoomIn" }` — TypeScript が `MenuItemConstructorOptions.role` の union 型で検証する。
   - NG: `{ role: "zoomIn" as any }` — `any` によりコンパイル時検証を回避している。
2. `type: "separator"` についても同様に型チェックが通ることを確認する。
3. `as any` / `as unknown` が使用されていないことを確認する。

**実施手順**:

```bash
# index.ts 内の any 使用箇所を検索する
grep -n "as any\|: any\|as unknown" apps/desktop/src/main/index.ts
```

出力が 0 件であることを確認する。出力がある場合、該当箇所を適切な型定義に修正する。

### Step 3: SRP 準拠確認

メニュー関連の各関数が単一の責務のみを持つことを確認する。

| 関数名                       | 責務                                                           | SRP 準拠の確認ポイント                             |
| ---------------------------- | -------------------------------------------------------------- | -------------------------------------------------- |
| `createApplicationMenu()`    | プラットフォームを判定し `Menu` オブジェクトを生成して返す     | `Menu.setApplicationMenu()` を呼び出していないこと |
| `buildMacTemplate()`         | macOS 向け `MenuItemConstructorOptions[]` を返す               | `process.platform` の判定を行っていないこと        |
| `buildDefaultTemplate()`     | Windows/Linux 向け `MenuItemConstructorOptions[]` を返す       | `process.platform` の判定を行っていないこと        |
| `buildViewSubmenu()`（任意） | 表示メニューの submenu 配列を返す（Step 1 で抽出した場合のみ） | テンプレート全体の構造を組み立てていないこと       |

**実施手順**:

1. 各関数の実装を確認し、上記「確認ポイント」の条件が満たされているか判定する。
2. 条件を満たしていない場合、関数を分割してそれぞれが単一の責務を持つよう修正する。
3. 修正後は Step 5（テスト再実行）を必ず実施する。

### Step 4: `index.ts` 肥大化チェック

NFR-5 の基準（メニュー関連コードが 100 行以内）および Phase 2 設計の「選択肢 A（`index.ts` に直接追加）」判断基準を再評価する。

**計測方法**:

```bash
# メニュー関連関数の行数を計測する
grep -n "function createApplicationMenu\|function buildMacTemplate\|function buildDefaultTemplate\|function buildViewSubmenu" apps/desktop/src/main/index.ts
```

上記コマンドで各関数の開始行を特定し、次の関数の開始行との差分でそれぞれの行数を算出する。

**ファイル分離の判断基準**:

| 条件                                                                       | 対応                                                                       |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| メニュー関連コードの合計行数が 100 行以内                                  | 現状維持（`index.ts` に残す）                                              |
| メニュー関連コードの合計行数が 101 行以上                                  | `apps/desktop/src/main/menu.ts` を新規作成し、3関数を移動する              |
| `index.ts` の総行数が 500 行を超えており、メニュー分離が可読性を向上させる | `apps/desktop/src/main/menu.ts` への分離を検討し、今回の変更として記録する |

ファイル分離を行う場合:

1. `apps/desktop/src/main/menu.ts` を新規作成する。
2. 3つの関数（`createApplicationMenu`, `buildMacTemplate`, `buildDefaultTemplate`）を移動する。
3. `index.ts` に `import { createApplicationMenu } from "./menu"` を追加する。
4. `menu.ts` で必要な import（`Menu` 等）を宣言する。
5. テストファイル（`menu.test.ts`）の import パスが正しいことを確認する。

### Step 5: リファクタリング後の検証

リファクタリングによりコードの振る舞いが変わっていないことを確認する。

**実施手順**:

```bash
# デスクトップアプリのテストを実行する
pnpm --filter @repo/desktop test

# TypeScript 型チェックを実行する
pnpm typecheck

# ESLint を実行する
pnpm lint
```

**期待される結果**:

- `pnpm --filter @repo/desktop test`: 全テスト PASS、失敗 0 件
- `pnpm typecheck`: エラー 0 件
- `pnpm lint`: エラー 0 件（警告は許容するが、`error` レベルは 0 件）

いずれかが失敗した場合:

- テスト失敗 → リファクタリングにより振る舞いが変わった可能性があるため、差分を確認して修正する。
- 型エラー → 型アノテーションが不適切な可能性があるため、`Electron.MenuItemConstructorOptions[]` 型を明示する。
- ESLint エラー → import 順序・未使用変数等を修正する。

---

## 成果物

| 成果物                                                            | 種別                 |
| ----------------------------------------------------------------- | -------------------- |
| `apps/desktop/src/main/index.ts`（リファクタリング済み）          | 修正ファイル         |
| `apps/desktop/src/main/menu.ts`（分離判断で必要な場合のみ）       | 新規ファイル（任意） |
| `docs/30-workflows/electron-app-menu-zoom/phase-8-refactoring.md` | 本仕様書             |
| `docs/30-workflows/electron-app-menu-zoom/phase-9-quality.md`     | 次 Phase 成果物      |

---

## 完了条件

- [ ] `buildMacTemplate()` と `buildDefaultTemplate()` の共通 submenu 抽出の判断（抽出する/しない）が記録されている
- [ ] `index.ts` 内に `as any` / `as unknown` が存在しないことが確認されている（`grep` 出力 0 件）
- [ ] `createApplicationMenu()`、`buildMacTemplate()`、`buildDefaultTemplate()` が各自単一の責務のみを持つことが確認されている
- [ ] メニュー関連コードの合計行数が計測済みであり、100 行以内であることが確認されている（または分離対応済み）
- [ ] `pnpm --filter @repo/desktop test` が全 PASS であること
- [ ] `pnpm typecheck` がエラー 0 件であること
- [ ] `pnpm lint` がエラー 0 件であること
- [ ] 曖昧表現（「適切に」「必要に応じて」「など」）が本仕様書に含まれていない

---

## 次 Phase

Phase 9（品質検証）へ進む。
前提条件: 本 Phase の完了条件チェックリストが全て満たされていること。
