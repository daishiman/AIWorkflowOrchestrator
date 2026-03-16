# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| タスク ID  | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001                                 |
| Phase      | 3 / 13                                                              |
| 作成日     | 2026-03-16                                                          |
| 担当       | spec-designer（作成） / レビュアー（実施）                          |
| 依存 Phase | Phase 1（要件定義）、Phase 2（設計）— 両方完了済み                  |
| 成果物パス | `docs/30-workflows/electron-app-menu-zoom/phase-3-design-review.md` |

---

## 目的

Phase 1（要件定義）および Phase 2（設計）の成果物を多角的に検証し、Phase 4（テスト作成）に進むための品質ゲートを通過できることを確認する。PASS / MINOR / MAJOR の三段階で判定し、判定に応じた戻り先 Phase を明示する。

---

## 実行タスク

| No. | タスク名                        | 目的                                                            |
| --- | ------------------------------- | --------------------------------------------------------------- |
| 1   | 成果物の参照                    | Phase 1-2 の成果物を読み込み、レビューの基礎情報を準備する      |
| 2   | 要件カバレッジ検証              | FR-1〜FR-7、NFR-1〜NFR-6 がすべて設計に反映されているか確認     |
| 3   | セキュリティレビュー            | 既存のセキュリティ設定に対する影響がないことを確認する          |
| 4   | パフォーマンスレビュー          | 同期処理のみであり `app.whenReady()` のブロッキングがないか確認 |
| 5   | アクセシビリティレビュー        | メニュー項目の label 定義が適切か確認                           |
| 6   | 設計の simpler alternative 検討 | より単純な実装方式が存在しないか検討する                        |
| 7   | 判定の決定と記録                | PASS / MINOR / MAJOR を判定し、結果を記録する                   |

---

## 参照資料

| 資料                                                                              | 参照理由                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------ |
| `docs/30-workflows/electron-app-menu-zoom/phase-1-requirements.md`                | 要件（FR/NFR/AC/スコープ）の参照                 |
| `docs/30-workflows/electron-app-menu-zoom/phase-2-design.md`                      | メニュー構造テーブル・コード配置設計の参照       |
| `apps/desktop/src/main/index.ts`                                                  | 現在の実装（修正前の状態）の確認                 |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | BrowserWindow セキュリティ設定要件（比較対照）   |
| `.claude/rules/04-electron-security.md`                                           | Electron セキュリティ原則（contextIsolation 等） |
| `.claude/rules/02-code-quality.md`                                                | TypeScript 型安全・単一責務原則                  |

---

## 実行手順

### Step 1: 成果物の準備確認

以下の2ファイルが存在し、内容が読み込める状態であることを確認する。

- `docs/30-workflows/electron-app-menu-zoom/phase-1-requirements.md`
- `docs/30-workflows/electron-app-menu-zoom/phase-2-design.md`

### Step 2: 要件カバレッジ検証（FR/NFR/AC の追跡）

Phase 1 で定義した各要件が Phase 2 の設計に反映されているかをトレースする。

### Step 3: セキュリティ検証

Phase 2 のセキュリティ影響分析テーブルを根拠に、変更が既存のセキュリティ設定を侵害しないことを確認する。

### Step 4: simpler alternative の検討

「`Menu.setApplicationMenu(null)` のまま IPC 経由でズームを制御する」代替案を検討し、その採用/不採用を記録する。

### Step 5: 判定の決定

以下の判定基準に基づき PASS / MINOR / MAJOR を決定し、判定結果テンプレートを記入する。

---

## レビュー観点マトリクス

### A. 要件カバレッジ

| 要件 ID | 要件内容（要約）                              | Phase 2 での実現方法                                              | カバレッジ状態 |
| ------- | --------------------------------------------- | ----------------------------------------------------------------- | -------------- |
| FR-1    | Cmd++/Ctrl++ でズームインできること           | `zoomIn` role を「表示」メニューに定義                            | 要確認         |
| FR-2    | Cmd+-/Ctrl+- でズームアウトできること         | `zoomOut` role を「表示」メニューに定義                           | 要確認         |
| FR-3    | Cmd+0/Ctrl+0 でズームリセットできること       | `resetZoom` role を「表示」メニューに定義                         | 要確認         |
| FR-4    | macOS 向け標準メニュー（HIG 準拠）            | `buildMacTemplate()` でアプリ名/編集/表示/ウィンドウを定義        | 要確認         |
| FR-5    | Windows/Linux 向け「表示」メニュー            | `buildDefaultTemplate()` で「表示」メニューを定義                 | 要確認         |
| FR-6    | `Menu.setApplicationMenu()` でアプリ全体設定  | `app.whenReady()` 内で `Menu.setApplicationMenu(menu)` を呼び出し | 要確認         |
| FR-7    | `autoHideMenuBar: true` を維持                | `createWindow()` の `autoHideMenuBar: true` を変更しない          | 要確認         |
| NFR-1   | contextIsolation/nodeIntegration/sandbox 維持 | `webPreferences` を変更しない。`Menu` は Main Process の API      | 要確認         |
| NFR-2   | CSP ポリシーに影響なし                        | `getCSPPolicy()` 関数を変更しない                                 | 要確認         |
| NFR-3   | プラットフォーム分岐                          | `process.platform === "darwin"` の単一フラグで分岐                | 要確認         |
| NFR-4   | パフォーマンス（100ms 増加なし）              | `createApplicationMenu()` は同期処理のみ（I/O なし）              | 要確認         |
| NFR-5   | メニュー定義 100 行以内                       | 設計上は 50 行以内に収まる見通し                                  | 要確認         |
| NFR-6   | IPC ハンドラ登録フローを変更しない            | `Menu.setApplicationMenu()` は IPC ハンドラと独立して呼び出し     | 要確認         |

**カバレッジ判定基準**: 全 FR/NFR が「実現方法」に対応付けられていれば PASS。未対応の FR/NFR が 1 件以上あれば MAJOR。

#### AC（受入基準）カバレッジ追跡

| AC   | 内容                                      | Phase 2 での実現方法                  | カバレッジ状態 |
| ---- | ----------------------------------------- | ------------------------------------- | -------------- |
| AC-1 | Cmd+= でズームイン動作                    | FR-1 の zoomIn role で実現            | 要確認         |
| AC-2 | Cmd+- でズームアウト動作                  | FR-2 の zoomOut role で実現           | 要確認         |
| AC-3 | Cmd+0 でズームリセット動作                | FR-3 の resetZoom role で実現         | 要確認         |
| AC-4 | 全プラットフォームでメニュー正常表示      | FR-4 のプラットフォーム別分岐で実現   | 要確認         |
| AC-5 | セキュリティ設定に影響しない              | NFR-1/NFR-2 で保証                    | 要確認         |
| AC-6 | 編集メニューが正しく動作                  | FR-5 の edit role セットで実現        | 要確認         |
| AC-7 | メニューバーからズーム操作可能            | FR-1〜FR-3 の View メニュー配置で実現 | 要確認         |
| AC-8 | autoHideMenuBar 動作維持（Windows/Linux） | FR-7 の BrowserWindow 設定維持で実現  | 要確認         |

### B. セキュリティ検証

| チェック項目                                                    | 期待値                       | 確認方法                                                                                 |
| --------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| `contextIsolation` が変更されないこと                           | `true` のまま                | Phase 2 設計の「コード配置設計」セクションに `webPreferences` 変更なしと明記されているか |
| `nodeIntegration` が変更されないこと                            | `false` のまま               | 同上                                                                                     |
| `sandbox` が変更されないこと                                    | `true` のまま                | 同上                                                                                     |
| メニューラベルにユーザー入力が含まれないこと                    | 全ラベルがハードコード文字列 | Phase 2 設計の XSS リスク分析で確認済みか                                                |
| `Menu.setApplicationMenu()` が IPC ハンドラより前に呼ばれること | `createWindow()` より前      | Phase 2 の「`app.whenReady()` への統合」セクションで確認                                 |

### C. パフォーマンス検証

| チェック項目                                             | 期待値       | 根拠                                           |
| -------------------------------------------------------- | ------------ | ---------------------------------------------- |
| `createApplicationMenu()` が非同期処理を含まないこと     | 同期処理のみ | Phase 2 設計の NFR-4 分析                      |
| `Menu.buildFromTemplate()` が `await` なしで呼ばれること | `await` なし | Phase 2 のコードイメージで確認                 |
| `app.whenReady()` ブロッキングが追加されないこと         | Promise なし | Phase 2 の実装イメージのコードスニペットで確認 |

### D. アクセシビリティ検証

| チェック項目                                     | 期待値                                  | 確認基準                                                                     |
| ------------------------------------------------ | --------------------------------------- | ---------------------------------------------------------------------------- |
| 全メニュー項目に `label` が定義されていること    | role ベースの項目は Electron が自動付与 | role を持つ項目はElectronが OS 言語に応じた label を自動付与するため問題なし |
| スクリーンリーダーでメニューが読み上げられること | OS 標準の読み上げ                       | Electron の role ベースメニューは OS ネイティブ API を使用するため自動対応   |
| カラー・コントラストへの影響                     | なし                                    | メニューのビジュアル設定は OS テーマに依存（アプリ側では変更不可）           |

### E. simpler alternative の検討

**代替案**: `Menu.setApplicationMenu(null)` のままにし、IPC ハンドラで `webContents.setZoomLevel()` / `setZoomFactor()` を呼び出す方式。

| 観点                  | 採用案（Menu role）                                | 代替案（IPC + webContents）                                |
| --------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| コード量              | 約 50 行（メニューテンプレート）                   | 約 80 行（IPC ハンドラ + Preload + Renderer 呼び出し側）   |
| OS ショートカット対応 | Electron が OS 標準の accelerator を自動マップ     | 独自 `globalShortcut.register()` が必要                    |
| セキュリティ          | Main Process のみで完結、IPC 不要                  | IPC チャンネル追加が必要（攻撃面の拡大）                   |
| プラットフォーム      | macOS/Win/Linux で OS 標準のキーバインドを自動解決 | 全プラットフォームで accelerator を手動定義が必要          |
| 保守性                | Electron が内部でショートカット管理                | 独自管理のショートカットは OS 更新で動作が変わるリスクあり |

**結論**: 採用案（Menu role）は代替案より実装量が少なく、セキュリティ面でも優れているため、代替案は不採用。

---

## PASS / MINOR / MAJOR 判定基準

| 判定              | 定義                                                                                                                                                                           | 対応                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| PASS              | 全 FR/NFR が設計に対応付けられており、セキュリティ影響なし、simpler alternative 不採用の根拠が記録されている                                                                   | Phase 4 へ進む            |
| MINOR             | 以下のいずれか1件以上が該当する場合:<br>・メニュー構造テーブルの label 記載が不明瞭<br>・NFR-5（100 行以内）の見通しが不明<br>・テスト設計上の注意点が不十分                   | 指摘対応後 Phase 4 へ進む |
| MAJOR（設計問題） | 以下のいずれか1件以上が該当する場合:<br>・FR-1〜FR-3 のいずれかが設計で未実現<br>・`contextIsolation`/`sandbox` 変更のリスクがある<br>・プラットフォーム分岐が設計されていない | Phase 2 へ戻る            |
| MAJOR（要件問題） | 以下のいずれか1件以上が該当する場合:<br>・FR/NFR が矛盾している<br>・スコープ定義が不明瞭で実装範囲が特定できない                                                              | Phase 1 へ戻る            |

---

### MINOR 追跡テーブル

| MINOR ID | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| -------- | -------- | ------------- | ------------- | ---- |

---

## 判定結果テンプレート

レビュアーは以下のテンプレートを記入して判定結果を記録する。

```markdown
## 判定結果

**判定**: [PASS / MINOR / MAJOR（設計問題） / MAJOR（要件問題）]
**レビュー日**: YYYY-MM-DD
**レビュアー**: [担当者名]

### A. 要件カバレッジ

- [ ] FR-1〜FR-7 全件: 設計で実現方法が定義されている
- [ ] NFR-1〜NFR-6 全件: 設計で実現方法が定義されている
- [ ] AC-1〜AC-8 全件: 検証方法が明記されている

### B. セキュリティ

- [ ] `contextIsolation: true` が変更されない設計になっている
- [ ] `nodeIntegration: false` が変更されない設計になっている
- [ ] `sandbox: true` が変更されない設計になっている
- [ ] メニューラベルにユーザー入力が含まれない（XSS リスクなし）
- [ ] `Menu.setApplicationMenu()` が `createWindow()` より前に呼ばれる設計

### C. パフォーマンス

- [ ] `createApplicationMenu()` が同期処理のみ（`await` / Promise なし）

### D. アクセシビリティ

- [ ] role ベースの全メニュー項目に Electron 自動付与の label が機能する

### E. simpler alternative

- [ ] 代替案（IPC + webContents）の検討結果が記録されている
- [ ] 採用案（Menu role）の優位性が根拠付きで説明されている

### 指摘事項（MINOR / MAJOR の場合のみ）

| 指摘 No. | 重要度 | 指摘内容 | 対応方針 |
| -------- | ------ | -------- | -------- |
| —        | —      | —        | —        |
```

---

## 判定結果

**判定**: PASS
**レビュー日**: 2026-03-16
**レビュアー**: design-reviewer

### A. 要件カバレッジ

- [x] FR-1〜FR-7 全件: 設計で実現方法が定義されている
- [x] NFR-1〜NFR-6 全件: 設計で実現方法が定義されている
- [x] AC-1〜AC-8 全件: 検証方法が明記されている

**FR/NFR カバレッジ確認結果**:

| 要件 ID | カバレッジ状態 | 確認内容                                                                       |
| ------- | -------------- | ------------------------------------------------------------------------------ |
| FR-1    | 確認済み       | `zoomIn` role が macOS/Win/Linux 両テンプレートの「表示」メニューに定義済み    |
| FR-2    | 確認済み       | `zoomOut` role が macOS/Win/Linux 両テンプレートの「表示」メニューに定義済み   |
| FR-3    | 確認済み       | `resetZoom` role が macOS/Win/Linux 両テンプレートの「表示」メニューに定義済み |
| FR-4    | 確認済み       | `buildMacTemplate()` でアプリ名/編集/表示/ウィンドウの4メニューを定義          |
| FR-5    | 確認済み       | `buildDefaultTemplate()` で「表示」メニューを定義                              |
| FR-6    | 確認済み       | `app.whenReady()` 内で `Menu.setApplicationMenu(menu)` を呼び出す設計          |
| FR-7    | 確認済み       | `createWindow()` の `autoHideMenuBar: true` は変更しない設計                   |
| NFR-1   | 確認済み       | `webPreferences` を変更しない設計。`Menu` は Main Process の API のみ          |
| NFR-2   | 確認済み       | `getCSPPolicy()` 関数を変更しない設計                                          |
| NFR-3   | 確認済み       | `process.platform === "darwin"` の単一フラグで macOS/その他を分岐              |
| NFR-4   | 確認済み       | `createApplicationMenu()` は同期処理のみ（非同期 I/O なし）                    |
| NFR-5   | 確認済み       | 設計上 50 行以内に収まる見通し（100 行以内の NFR を満たす）                    |
| NFR-6   | 確認済み       | `Menu.setApplicationMenu()` は IPC ハンドラ登録サイクルと独立した呼び出し      |

### B. セキュリティ

- [x] `contextIsolation: true` が変更されない設計になっている
- [x] `nodeIntegration: false` が変更されない設計になっている
- [x] `sandbox: true` が変更されない設計になっている
- [x] メニューラベルにユーザー入力が含まれない（XSS リスクなし）
- [x] `Menu.setApplicationMenu()` が `createWindow()` より前に呼ばれる設計

**根拠**: Phase 2 セキュリティ影響分析で全7項目が「影響なし」と判定済み。`Menu` は Main Process の API であり、BrowserWindow の `webPreferences` とは独立。メニューラベルはハードコード文字列のみ。

### C. パフォーマンス

- [x] `createApplicationMenu()` が同期処理のみ（`await` / Promise なし）

**根拠**: Phase 2 の実装イメージコードに `await` なし。`Menu.buildFromTemplate()` は同期 API。

### D. アクセシビリティ

- [x] role ベースの全メニュー項目に Electron 自動付与の label が機能する

**根拠**: Electron の `role` ベースメニュー項目は OS 言語に応じた label を自動付与するため、スクリーンリーダーによる読み上げが OS 標準で対応される。

### E. simpler alternative

- [x] 代替案（IPC + webContents）の検討結果が記録されている
- [x] 採用案（Menu role）の優位性が根拠付きで説明されている

**根拠**: Phase 2 の「simpler alternative の検討」セクションに比較テーブルが記録済み。採用案（Menu role）は代替案（IPC + webContents）よりコード量が少なく（約50行 vs 約80行）、セキュリティ面でも優れている（IPC チャンネル追加不要）。

### 指摘事項（MINOR / MAJOR の場合のみ）

| 指摘 No. | 重要度 | 指摘内容 | 対応方針 |
| -------- | ------ | -------- | -------- |
| —        | —      | 指摘なし | —        |

---

## Phase 4 開始条件

以下の全条件が満たされた場合に Phase 4（テスト作成）を開始できる。

1. 判定が PASS または MINOR（指摘対応完了後）であること
2. 判定結果テンプレートの全チェックボックスに回答済みであること
3. MINOR 判定の場合、全指摘事項に対応方針が記入されており、対応完了後に再レビューが不要であることをレビュアーが承認していること

---

## Phase 13 blocked 条件

以下のいずれかに該当する場合、Phase 13（完了）への進行を停止し、指定の Phase に戻る。

| 条件                                                       | 戻り先  |
| ---------------------------------------------------------- | ------- |
| Phase 10（最終レビュー）で FR-1〜FR-3 の AC が未達成       | Phase 5 |
| `pnpm typecheck` でエラーが検出される                      | Phase 5 |
| セキュリティ設定（contextIsolation 等）の変更が検出される  | Phase 2 |
| Phase 11（手動テスト）でプラットフォーム動作が確認できない | Phase 5 |

---

## 統合テスト連携

Phase 4 のテスト作成で以下を確認する。

| 確認項目                                                                   | テストの種別     |
| -------------------------------------------------------------------------- | ---------------- |
| `buildMacTemplate()` が `zoomIn`/`zoomOut`/`resetZoom` を含む              | Unit Test        |
| `buildDefaultTemplate()` が `zoomIn`/`zoomOut`/`resetZoom` を含む          | Unit Test        |
| `process.platform === "darwin"` のとき `buildMacTemplate()` が呼ばれる     | Unit Test        |
| `process.platform !== "darwin"` のとき `buildDefaultTemplate()` が呼ばれる | Unit Test        |
| `Menu.setApplicationMenu()` が `app.whenReady()` 内で呼ばれる              | Integration Test |

---

## 多角的チェック観点（AIが判断）

| 観点               | 確認内容                                                                                                                       | 判断基準                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 設計の完全性       | Phase 2 の「メニュー構造設計」に macOS と Windows/Linux 両方のテーブルが存在するか                                             | 両方のテーブルが存在し、`zoomIn`/`zoomOut`/`resetZoom` が含まれる |
| セキュリティ一貫性 | Phase 2 のセキュリティ影響分析テーブルで全項目「影響なし」と判定されているか                                                   | 全項目「影響なし」かつ理由が記述されている                        |
| 設計の実現可能性   | Phase 2 の実装イメージコードが TypeScript として型安全か                                                                       | `Electron.MenuItemConstructorOptions[]` 型が使用されている        |
| 依存関係の明確性   | `Menu` が `electron` パッケージから import される設計であるか                                                                  | `import { Menu } from "electron"` の形式                          |
| テスト可能性       | `createApplicationMenu()` が `process.platform` に依存するため、モックなしでは一方のパスしかテストできないことを認識しているか | Phase 2 の「テスト設計上の注意点」でモック方法が明記されている    |

---

## サブタスク管理

| No. | サブタスク                             | 担当 Phase |
| --- | -------------------------------------- | ---------- |
| 1   | Phase 1-2 の成果物ロード               | Phase 3    |
| 2   | 要件カバレッジ検証（FR/NFR/AC）        | Phase 3    |
| 3   | セキュリティ影響の確認                 | Phase 3    |
| 4   | simpler alternative の検討と記録       | Phase 3    |
| 5   | 判定テンプレートへの記入               | Phase 3    |
| 6   | MINOR 指摘の対応（指摘ありの場合のみ） | Phase 3    |

---

## 成果物

| 成果物         | パス                                                                | 説明                |
| -------------- | ------------------------------------------------------------------- | ------------------- |
| 設計レビュー書 | `docs/30-workflows/electron-app-menu-zoom/phase-3-design-review.md` | Phase 3の主要成果物 |

---

## タスク100%実行確認【必須】

| No. | タスク名                        | 結果    | 備考 |
| --- | ------------------------------- | ------- | ---- |
| 1   | 成果物の参照                    | ✅ 完了 |      |
| 2   | 要件カバレッジ検証              | ✅ 完了 |      |
| 3   | セキュリティレビュー            | ✅ 完了 |      |
| 4   | パフォーマンスレビュー          | ✅ 完了 |      |
| 5   | アクセシビリティレビュー        | ✅ 完了 |      |
| 6   | 設計の simpler alternative 検討 | ✅ 完了 |      |
| 7   | 判定の決定と記録                | ✅ 完了 |      |

---

## 完了条件

- [ ] Phase 1-2 の成果物が参照資料に含まれている
- [ ] 要件カバレッジマトリクス（FR-1〜FR-7、NFR-1〜NFR-6）が記入されている
- [ ] セキュリティ検証チェックリストが記入されている
- [ ] simpler alternative（IPC + webContents）の検討結果が記録されている
- [ ] PASS / MINOR / MAJOR の判定基準が定義されている
- [ ] 判定結果テンプレートが記入されている（レビュー実施後）
- [ ] Phase 4 開始条件と Phase 13 blocked 条件が明記されている
- [ ] 曖昧表現（「適切に」「必要に応じて」「など」）が含まれていない

---

## 次 Phase

判定 PASS または MINOR（指摘対応完了後）の場合: Phase 4（テスト作成）へ進む。
判定 MAJOR（設計問題）の場合: Phase 2（設計）へ戻る。
判定 MAJOR（要件問題）の場合: Phase 1（要件定義）へ戻る。
