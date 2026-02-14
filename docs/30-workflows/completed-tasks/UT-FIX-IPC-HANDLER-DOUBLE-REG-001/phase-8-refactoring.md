# Phase 8: リファクタリング - IPC ハンドラ二重登録バグ修正

## メタ情報

| 項目         | 値                                |
| ------------ | --------------------------------- |
| Phase        | 8                                 |
| Phase名      | リファクタリング（TDD Refactor）  |
| タスクID     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| 機能名       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| 種別         | バグ修正 (fix)                    |
| GitHub Issue | #815                              |
| 前提Phase    | Phase 7（カバレッジ確認）         |
| 後続Phase    | Phase 9（品質保証）               |
| ステータス   | 未実施                            |
| 作成日       | 2026-02-14                        |

---

## 目的

Phase 5-7 で実装・テストが完了した状態で、テストを維持しながらコード品質を改善する。TDD サイクルの Refactor ステップとして、DRY 原則・命名規則統一・ハードコード文字列排除を実施し、保守性を向上させる。

## 背景

IPC ハンドラの二重登録防止のために `unregisterAllIpcHandlers()` 関数を追加し、`activate` イベントでの再登録ロジックを修正した。この実装に対して、コードの重複排除・命名規則の統一・定数管理の確認を行い、長期的な保守性を確保する。

---

## 実行タスク

### Task 1: DRY 原則の検証

- `unregisterAllIpcHandlers()` と `registerAllIpcHandlers()` の間でチャンネル名リストが重複していないか確認する
- チャンネル名の管理が一元化されている（`IPC_CHANNELS` 定数から取得）ことを検証する
- 重複が3箇所以上ある場合は共通関数またはデータ構造に抽出する

### Task 2: ハードコード文字列の排除（P27対策）

- `apps/desktop/src/main/ipc/index.ts` 内の全チャンネル名が `IPC_CHANNELS` 定数経由で参照されていることを確認する
- `apps/desktop/src/main/index.ts` 内の IPC 関連文字列がハードコードされていないことを確認する
- 検出コマンド: `grep -rn "ipcMain.handle\|ipcMain.on\|ipcMain.removeHandler" apps/desktop/src/main/ | grep -v "IPC_CHANNELS"` で文字列リテラル使用箇所を検出する
- ハードコード文字列が存在する場合は `IPC_CHANNELS` 定数に置き換える

### Task 3: register/unregister ペア関数の命名規則統一

- `registerAllIpcHandlers()` と `unregisterAllIpcHandlers()` の命名が対称であることを確認する
- 各個別ハンドラ登録関数（`registerFileHandlers()` 等）に対応する解除関数が必要かどうかを判定する
  - 判定基準: `unregisterAllIpcHandlers()` が一括解除する設計であれば個別の unregister 関数は不要
  - 個別の unregister 関数が存在する場合は命名が `unregisterXxxHandlers()` で統一されていることを確認する
- 関数のエクスポート方針が統一されていることを確認する（named export の一貫性）

### Task 4: 不要な try-catch ブロックの整理

- `ipcMain.removeHandler()` 呼び出しに不要な try-catch が存在しないか確認する
  - `removeHandler()` は未登録チャンネルに対してエラーを送出しないため、try-catch は不要
- `registerAllIpcHandlers()` 内の try-catch がエラーを握りつぶさず上位へ伝播しているか確認する
- 握りつぶされているエラーハンドリング（空の catch ブロック）が存在しないか確認する

### Task 5: 関数の行数と責務の確認

- `registerAllIpcHandlers()` の行数が30行を超えている場合は分割を検討する
- `unregisterAllIpcHandlers()` の行数が30行を超えている場合は分割を検討する
- 各関数が単一責務原則（SRP）に従っていることを確認する

---

## リファクタリング対象の判定基準

| 判定基準            | 閾値      | 対応アクション                 |
| ------------------- | --------- | ------------------------------ |
| コードの重複        | 3箇所以上 | 共通関数またはデータ構造に抽出 |
| ハードコード文字列  | 1箇所以上 | `IPC_CHANNELS` 定数に置換      |
| 関数の行数          | 30行超    | 関数分割を検討                 |
| 空の catch ブロック | 1箇所以上 | エラーハンドリングの修正       |
| 命名規則の不統一    | 1箇所以上 | 統一された命名に修正           |

---

## 参照資料

| 参照資料              | パス                                                                            | 内容                         |
| --------------------- | ------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義      | `docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/phase-1-requirements.md`   | 受入基準との整合確認         |
| Phase 2 設計          | `docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/phase-2-design.md`         | 設計方針との整合確認         |
| Phase 6 テスト拡充    | `docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/phase-6-test-expansion.md` | エッジケースの維持確認       |
| Main Process エントリ | `apps/desktop/src/main/index.ts`                                                | activate イベント処理        |
| IPC 登録集約          | `apps/desktop/src/main/ipc/index.ts`                                            | registerAllIpcHandlers 関数  |
| IPC チャネル定義      | `apps/desktop/src/preload/channels.ts`                                          | ホワイトリスト定義           |
| Phase 5 実装コード    | `docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/phase-5-implementation.md` | リファクタリング対象         |
| Phase 7 カバレッジ    | `outputs/phase-7/coverage-report.md`                                            | テストカバレッジ結果         |
| 既知の落とし穴 P27    | `.claude/rules/06-known-pitfalls.md#P27`                                        | ハードコード文字列の見落とし |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                    | 内容                 |
| ---------------- | --------------------------------------- | -------------------- |
| セキュリティ原則 | `.claude/rules/04-electron-security.md` | IPC セキュリティ原則 |
| コード品質       | `.claude/rules/02-code-quality.md`      | コーディング規約     |

---

## 実行手順

### Step 1: リファクタリング前のテスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/
```

- 全テストが PASS することを確認してから作業を開始する

### Step 2: DRY 原則の検証と修正（Task 1）

- チャンネル名管理の一元化を確認する
- 重複があれば共通化する

### Step 3: ハードコード文字列の検出と修正（Task 2）

```bash
grep -rn "ipcMain.handle\|ipcMain.on\|ipcMain.removeHandler" apps/desktop/src/main/ | grep -v "IPC_CHANNELS"
```

- 検出された箇所を `IPC_CHANNELS` 定数に置換する

### Step 4: 命名規則の統一（Task 3）

- register/unregister ペアの命名規則を確認・統一する

### Step 5: try-catch ブロックの整理（Task 4）

- 不要な try-catch を削除し、適切なエラー伝播を確保する

### Step 6: 関数サイズの確認（Task 5）

- 30行超の関数を分割する

### Step 7: リファクタリング後のテスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/
```

- 全テストが引き続き PASS することを確認する

### Step 8: Lint 実行

```bash
pnpm lint
```

- エラーが0であることを確認する

---

## 統合テスト連携【必須】

- 本Phaseの決定事項・検証観点を `outputs/phase-11/manual-test-result.md` の手動テスト観点に反映する。
- `app.on("activate")` 再初期化シナリオ（unregister → createWindow → register）の確認観点を維持する。

## 成果物

| 成果物                     | パス                                 | 内容                             |
| -------------------------- | ------------------------------------ | -------------------------------- |
| リファクタリング済みコード | `apps/desktop/src/main/index.ts`     | activate イベント処理の改善      |
| リファクタリング済みコード | `apps/desktop/src/main/ipc/index.ts` | register/unregister の品質改善   |
| リファクタリング記録       | `outputs/phase-8/refactoring-log.md` | 改善内容・変更点・判定結果の記録 |

---

## 完了条件

- [ ] 全テストが Green（成功）のまま維持されている
- [ ] コードの重複が排除されている（3箇所以上の重複が0）
- [ ] ハードコード文字列が存在しない（`IPC_CHANNELS` 定数経由で管理されている）
- [ ] register/unregister の命名規則が統一されている
- [ ] 不要な try-catch ブロックが整理されている
- [ ] 30行超の関数が分割されている（分割が不要と判断した場合はその理由を記録）
- [ ] `pnpm lint` が PASS（エラー0）
- [ ] リファクタリング記録（`outputs/phase-8/refactoring-log.md`）が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（Task 1-5）を100%実行完了
- [ ] 各タスクの完了状態を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 5, 6, 7 が完了していること
- **後続**: Phase 9 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### リファクタリング内容

- DRY 原則の検証結果:
- ハードコード文字列の検出数:
- 命名規則の統一結果:
- try-catch 整理結果:
- 関数分割の結果:

### テスト結果

- リファクタリング前: 全テスト PASS / FAIL
- リファクタリング後: 全テスト PASS / FAIL

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/phase-9-quality-assurance.md`
