# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| タスク ID  | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001                                 |
| Phase      | 10 / 13                                                             |
| 作成日     | 2026-03-16                                                          |
| 担当       | 実装担当者（作成） / レビュアー（実施）                             |
| 依存 Phase | Phase 9（品質検証）— 完了済み（全品質ゲート PASS 確認済み）         |
| 成果物パス | `docs/30-workflows/electron-app-menu-zoom/phase-10-final-review.md` |

---

## 目的

Phase 5（実装）〜 Phase 9（品質検証）の成果物を多角的にレビューし、Phase 11（手動テスト）に進むための最終品質ゲートを通過させる。PASS / MINOR / MAJOR / CRITICAL の四段階で判定し、判定に応じた次のアクションを明示する。

---

## 実行タスク

| No. | タスク名                     | 目的                                                              |
| --- | ---------------------------- | ----------------------------------------------------------------- |
| 1   | 要件カバレッジ確認           | AC-1〜AC-8 がすべて実装で充足されているか確認する                 |
| 2   | セキュリティ影響確認         | CSP・contextIsolation・sandbox の設定が変更されていないか確認する |
| 3   | コード品質確認               | SRP・型安全・`any` 未使用が実装で守られているか確認する           |
| 4   | テスト品質確認               | カバレッジ基準が充足されているか確認する                          |
| 5   | ドキュメント整合性確認       | Phase 1-9 の仕様書と実装の内容が一致しているか確認する            |
| 6   | 判定の決定と記録             | PASS / MINOR / MAJOR / CRITICAL を判定し、結果を記録する          |
| 7   | MINOR 指摘の未タスク仕様書化 | MINOR 判定の指摘を未タスク仕様書に変換する（省略不可）            |

---

## 参照資料

| 資料                                                               | 参照理由                                                 |
| ------------------------------------------------------------------ | -------------------------------------------------------- |
| `docs/30-workflows/electron-app-menu-zoom/phase-1-requirements.md` | AC-1〜AC-8、FR-1〜FR-7、NFR-1〜NFR-6 の定義確認          |
| `docs/30-workflows/electron-app-menu-zoom/phase-2-design.md`       | メニュー構造・コード配置・セキュリティ影響分析の設計確認 |
| `apps/desktop/src/main/index.ts`                                   | 実装コードの最終確認                                     |
| `apps/desktop/src/main/__tests__/menu.test.ts`                     | テストコードのカバレッジ・品質確認                       |
| `.claude/rules/04-electron-security.md`                            | セキュリティ原則（contextIsolation / sandbox / CSP）     |
| `.claude/rules/02-code-quality.md`                                 | TypeScript 型安全・SRP・テストカバレッジ基準             |

---

## 実行手順

### Step 1: 要件カバレッジ確認（AC-1〜AC-8）

Phase 1 で定義した受入基準（AC）が実装で充足されているか、以下のマトリクスで一項目ずつ確認する。

| AC ID | 受入基準（要約）                                        | 確認方法                                                     | 充足状態 |
| ----- | ------------------------------------------------------- | ------------------------------------------------------------ | -------- |
| AC-1  | macOS で `Cmd++` でズームインする                       | `buildMacTemplate()` に `{ role: "zoomIn" }` が存在するか    | 要確認   |
| AC-2  | macOS で `Cmd+-` でズームアウトする                     | `buildMacTemplate()` に `{ role: "zoomOut" }` が存在するか   | 要確認   |
| AC-3  | macOS で `Cmd+0` でズームリセットする                   | `buildMacTemplate()` に `{ role: "resetZoom" }` が存在するか | 要確認   |
| AC-4  | macOS のメニューバーに「表示」メニューと3項目が存在する | `buildMacTemplate()` の「表示」ラベルの submenu を確認       | 要確認   |
| AC-5  | Windows で `Ctrl++` / `Ctrl+-` / `Ctrl+0` が動作する    | `buildDefaultTemplate()` に3つの role が存在するか           | 要確認   |
| AC-6  | `pnpm typecheck` が PASS する                           | Phase 9 Step 2 の実行結果を記録から確認                      | 要確認   |
| AC-7  | `pnpm lint` が PASS する                                | Phase 9 Step 1 の実行結果を記録から確認                      | 要確認   |
| AC-8  | 既存の認証フロー・IPC ハンドラ・CSP が変更されていない  | `git diff apps/desktop/src/main/index.ts` で変更範囲を確認   | 要確認   |

**確認手順**:

1. `apps/desktop/src/main/index.ts` を読み込む。
2. `buildMacTemplate()` の実装に `zoomIn`、`zoomOut`、`resetZoom` の role が含まれることを確認する。
3. `buildDefaultTemplate()` の実装に同様の 3 role が含まれることを確認する。
4. `createApplicationMenu()` が `Menu.buildFromTemplate()` を呼び出し、戻り値の `Menu` オブジェクトを返すことを確認する。
5. `app.whenReady()` 内で `Menu.setApplicationMenu()` が `createWindow()` より前に呼ばれることを確認する。
6. `registerAllIpcHandlers()`、`getCSPPolicy()` の呼び出しが変更されていないことを確認する。

### Step 2: セキュリティ影響確認

以下のすべての項目が「影響なし」であることを確認する。

| チェック項目                               | 期待値                       | 確認方法                                                                      |
| ------------------------------------------ | ---------------------------- | ----------------------------------------------------------------------------- |
| `contextIsolation` の値                    | `true` のまま                | `index.ts` の `webPreferences` に `contextIsolation: true` が存在すること     |
| `nodeIntegration` の値                     | `false` のまま               | `index.ts` の `webPreferences` に `nodeIntegration: false` が存在すること     |
| `sandbox` の値                             | `true` のまま                | `index.ts` の `webPreferences` に `sandbox: true` が存在すること              |
| `getCSPPolicy()` 関数                      | 変更なし                     | `git diff` に `getCSPPolicy` の変更が含まれていないこと                       |
| メニューラベルのユーザー入力               | 全ラベルがハードコード文字列 | `buildMacTemplate()` と `buildDefaultTemplate()` に変数ラベルが含まれないこと |
| `Menu.setApplicationMenu()` の呼び出し位置 | `createWindow()` より前      | `app.whenReady()` 内のコード順序で確認                                        |

セキュリティ設定の変更が 1 件でも検出された場合: CRITICAL 判定とし、Phase 1 に戻って要件を再確認する。

### Step 3: コード品質確認

以下の観点でコードを確認する。

**型安全性**:

1. `createApplicationMenu()` の戻り値型が `Menu` として明示されているか確認する（または TypeScript の型推論で `Menu` 型になることを確認する）。
2. `buildMacTemplate()` と `buildDefaultTemplate()` の戻り値型が `Electron.MenuItemConstructorOptions[]` として明示されているか確認する。
3. 以下のコマンドで `any` の使用がないことを確認する:
   ```bash
   grep -n "as any\|: any\|as unknown" apps/desktop/src/main/index.ts
   ```
   出力が 0 件であることを確認する。出力がある場合: MAJOR 判定の根拠とする。

**SRP 準拠**:

| 関数名                    | 確認内容                                           | 判定   |
| ------------------------- | -------------------------------------------------- | ------ |
| `createApplicationMenu()` | `Menu.setApplicationMenu()` を呼び出していないこと | 要確認 |
| `buildMacTemplate()`      | `process.platform` の判定を行っていないこと        | 要確認 |
| `buildDefaultTemplate()`  | `process.platform` の判定を行っていないこと        | 要確認 |

**アクセシビリティ**:

- `role` を持つすべてのメニュー項目は Electron が OS 言語に応じたラベルを自動付与するため、明示的な `label` は不要。
- ただし、`label: "表示"` のように日本語ラベルをハードコードしている場合、英語環境で日本語表示になることを確認する（Phase 11 手動テストで検証する項目として記録する）。

### Step 4: テスト品質確認

`apps/desktop/src/main/__tests__/menu.test.ts` の内容を確認する。

**確認項目**:

1. `buildMacTemplate()` に `zoomIn`、`zoomOut`、`resetZoom` role が含まれるテストケースが存在するか。
2. `buildDefaultTemplate()` に同様のテストケースが存在するか。
3. `process.platform === "darwin"` のとき `buildMacTemplate()` が呼ばれるテストケースが存在するか。
4. `process.platform !== "darwin"` のとき `buildDefaultTemplate()` が呼ばれるテストケースが存在するか。
5. `Menu.setApplicationMenu()` が呼ばれることを検証するテストが存在するか。
6. `process.platform` のモックが `afterEach` でリストアされているか（テスト間リーク防止、P9 対策）。

Phase 9 Step 3 で実行した `pnpm --filter @repo/desktop test --coverage` の結果を確認し、以下の基準を充足しているか確認する:

| 指標              | 最低基準 | 充足状態 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 要確認   |
| Branch Coverage   | 60%      | 要確認   |
| Function Coverage | 80%      | 要確認   |

カバレッジが最低基準を下回る場合: MAJOR 判定とし、Phase 6（テスト拡充）に戻る。

### Step 5: ドキュメント整合性確認

以下の整合性を確認する。

| 確認項目                                                                                | 期待値                                                                                             |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Phase 2 の「メニュー構造設計」と実装の `buildMacTemplate()` が一致するか                | テーブルに記載された全 role が実装に存在すること                                                   |
| Phase 2 の「Windows/Linux メニュー構造」と `buildDefaultTemplate()` が一致するか        | テーブルに記載された全 role が実装に存在すること                                                   |
| Phase 2 の「コード配置設計」の選択（選択肢 A または B）と実際のファイル構成が一致するか | 「選択肢 A」の場合 `menu.ts` が存在しないこと（または「選択肢 B」の場合 `menu.ts` が存在すること） |
| Phase 1 の NFR-5（100 行以内）と実装の行数が一致するか                                  | メニュー関連コードが 100 行以内であること                                                          |

### Step 6: 判定の決定と記録

以下の基準で判定を行い、判定結果テンプレートに記録する。

| 判定     | 定義                                                                                                                                                                                                                                    | 次のアクション                                                     |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| PASS     | AC-1〜AC-8 がすべて充足されており、セキュリティ設定の変更がなく、コード品質・テスト品質・ドキュメント整合性のすべてに問題がない                                                                                                         | Phase 11（手動テスト）へ進む                                       |
| MINOR    | 以下のいずれか 1 件以上に該当する場合:<br>・日本語メニューラベルの英語環境での表示（機能には影響なし）<br>・コメントの記述が不十分<br>・NFR-5 の行数がギリギリ 100 行以内で、将来の拡張リスクがある<br>・テストのコメントが不足している | 未タスク仕様書に変換後（省略不可）、Phase 11 へ進む                |
| MAJOR    | 以下のいずれか 1 件以上に該当する場合:<br>・AC-1〜AC-5 のいずれかが充足されていない（ズーム関連ショートカットが動作しない設計）<br>・カバレッジが最低基準（Line 80%、Function 80%）を下回る<br>・`as any` が使用されている              | 影響範囲に応じて Phase 5（実装）または Phase 6（テスト拡充）に戻る |
| CRITICAL | 以下のいずれかに該当する場合:<br>・`contextIsolation`、`nodeIntegration`、`sandbox` のいずれかが変更されている<br>・CSP ポリシーが変更されている<br>・IPC ハンドラ登録フローが変更されている                                            | Phase 1（要件定義）へ戻り、セキュリティ要件を再確認する            |

### Step 7: MINOR 指摘の未タスク仕様書化（MINOR 判定の場合のみ）

MINOR 判定の指摘は、機能影響の有無にかかわらず、すべて未タスク仕様書に変換する（省略不可）。

1. 各 MINOR 指摘について、`docs/30-workflows/electron-app-menu-zoom/unassigned-task/` 配下に指示書を作成する。
2. `task-workflow.md` の残課題テーブルに登録する。
3. 関連仕様書（該当する Phase の仕様書）に参照リンクを追加する。

---

## 判定結果テンプレート

レビュアーは以下のテンプレートを記入して判定結果を記録する。

```markdown
## 判定結果

**判定**: [PASS / MINOR / MAJOR / CRITICAL]
**レビュー日**: YYYY-MM-DD
**レビュアー**: [担当者名]

### A. 要件カバレッジ（AC-1〜AC-8）

- [ ] AC-1: buildMacTemplate() に `{ role: "zoomIn" }` が存在する
- [ ] AC-2: buildMacTemplate() に `{ role: "zoomOut" }` が存在する
- [ ] AC-3: buildMacTemplate() に `{ role: "resetZoom" }` が存在する
- [ ] AC-4: buildMacTemplate() に label "表示" の submenu が存在し、3つのズーム role を含む
- [ ] AC-5: buildDefaultTemplate() に `zoomIn`、`zoomOut`、`resetZoom` role が存在する
- [ ] AC-6: Phase 9 で `pnpm typecheck` が PASS 済みである
- [ ] AC-7: Phase 9 で `pnpm lint` が PASS 済みである
- [ ] AC-8: `git diff` で IPC ハンドラ・CSP・webPreferences の変更がない

### B. セキュリティ

- [ ] `contextIsolation: true` が変更されていない
- [ ] `nodeIntegration: false` が変更されていない
- [ ] `sandbox: true` が変更されていない
- [ ] `getCSPPolicy()` 関数が変更されていない
- [ ] メニューラベルにユーザー入力が含まれていない（全ハードコード文字列）
- [ ] `Menu.setApplicationMenu()` が `createWindow()` より前に呼ばれている

### C. コード品質

- [ ] `grep -n "as any\|: any" apps/desktop/src/main/index.ts` の出力が 0 件
- [ ] `createApplicationMenu()` が `Menu.setApplicationMenu()` を呼び出していない（SRP）
- [ ] `buildMacTemplate()` が `process.platform` 判定を行っていない（SRP）
- [ ] `buildDefaultTemplate()` が `process.platform` 判定を行っていない（SRP）

### D. テスト品質

- [ ] `buildMacTemplate()` の `zoomIn`/`zoomOut`/`resetZoom` テストが存在する
- [ ] `buildDefaultTemplate()` の `zoomIn`/`zoomOut`/`resetZoom` テストが存在する
- [ ] `process.platform` モックが `afterEach` でリストアされている
- [ ] Line Coverage が 80% 以上である
- [ ] Function Coverage が 80% 以上である

### E. ドキュメント整合性

- [ ] Phase 2 のメニュー構造テーブルと実装の role が一致している
- [ ] Phase 2 のコード配置選択と実際のファイル構成が一致している
- [ ] Phase 1 の NFR-5（100 行以内）が充足されている

### 指摘事項（MINOR / MAJOR / CRITICAL の場合のみ）

| 指摘 No. | 重要度 | 指摘内容 | 対応方針 |
| -------- | ------ | -------- | -------- |
| —        | —      | —        | —        |
```

---

## 成果物

| 成果物                                                              | 種別            |
| ------------------------------------------------------------------- | --------------- |
| `docs/30-workflows/electron-app-menu-zoom/phase-10-final-review.md` | 本仕様書        |
| `docs/30-workflows/electron-app-menu-zoom/phase-11-manual-test.md`  | 次 Phase 成果物 |

---

## 完了条件

- [ ] AC-1〜AC-8 の全項目が確認済みであり、充足状態が記録されている
- [ ] セキュリティチェック（contextIsolation / nodeIntegration / sandbox / CSP / IPC）が全項目確認済みである
- [ ] コード品質（型安全・SRP・`any` 未使用）が確認済みである
- [ ] テスト品質（カバレッジ基準・モックリストア）が確認済みである
- [ ] ドキュメント整合性が確認済みである
- [ ] 判定結果テンプレートが記入されている（PASS / MINOR / MAJOR / CRITICAL）
- [ ] MINOR 判定がある場合、全指摘が未タスク仕様書に変換されている（0 件でも確認済みの記録が必要）
- [ ] 曖昧表現（「適切に」「必要に応じて」「など」）が本仕様書に含まれていない

---

## 次 Phase

判定 PASS または MINOR（未タスク仕様書変換完了後）の場合: Phase 11（手動テスト）へ進む。
判定 MAJOR（AC 未充足またはカバレッジ不足）の場合: Phase 5（実装）または Phase 6（テスト拡充）へ戻る。
判定 MAJOR（コード品質問題）の場合: Phase 8（リファクタリング）へ戻る。
判定 CRITICAL（セキュリティ設定変更）の場合: Phase 1（要件定義）へ戻り、セキュリティ要件を再確認する。
