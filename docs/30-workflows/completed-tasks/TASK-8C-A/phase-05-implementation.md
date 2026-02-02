# Phase 5: 実装（TDD Green） - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 5                        |
| Phase名    | 実装                     |
| 前提Phase  | Phase 4（テスト作成）    |
| 後続Phase  | Phase 6（テスト拡充）    |
| ステータス | 未実施                   |
| 作成日     | 2026-02-01               |
| 機能名     | TASK-8C-A: IPC統合テスト |

---

## 目的

Phase 4 で作成したテストを全てパスさせるための最小限の実装を行う（TDD Green フェーズ）。基本12テストケース（TC-01〜TC-12）は既存ハンドラーで対応可能なため、テストコード側の Mock 設定を調整する。IMP-002 追加テストケース（TC-13〜TC-22）は対応するIPCハンドラーの追加実装が必要な場合、最小限のハンドラーを追加する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 基本テストケースのGreen化（TC-01〜TC-12）

**目的**: 既存ハンドラーに対する基本12テストケースを全てパスさせる

**実行手順**:

1. `skillIpc.integration.test.ts` のテストを実行する：

   ```bash
   pnpm --filter @repo/desktop vitest run apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts
   ```

2. 失敗しているテストを確認し、原因を特定する：
   - Mock 設定の不整合（SkillService メソッド名の不一致など）
   - ハンドラー登録パスの不一致（`registerSkillHandlers` の引数パターン）
   - `OperationResult` 戻り値フォーマットの不一致
   - `validateIpcSender` Mock の呼び出し方の不整合

3. テストコードの Mock 設定を修正して全テストをパスさせる：
   - `registerSkillHandlers(mockMainWindow, mockSkillService)` の呼び出しが正しいことを確認
   - 各ハンドラーの引数パターン（`event`, `...args`）が正しいことを確認
   - 戻り値の `OperationResult<T>` ラッピングが正しいことを確認

4. 修正後にテストを再実行し、TC-01〜TC-12 が全てパスすることを確認する

**期待される成果物**:

- TC-01〜TC-12 が全てパスする `skillIpc.integration.test.ts`

---

### タスク2: IMP-002 テストケースのGreen化（TC-13〜TC-22）

**目的**: 設定管理・権限管理・キャッシュ機能のテストをパスさせる

**実行手順**:

1. TC-13〜TC-22 のテスト実行結果を確認する
2. 対応ハンドラーの実装状況を確認する：

| チャネル                 | ハンドラー存在 | 対応                                 |
| ------------------------ | -------------- | ------------------------------------ |
| skill:settings:get       | 要確認         | 未存在なら `skillHandlers.ts` に追加 |
| skill:settings:update    | 要確認         | 未存在なら `skillHandlers.ts` に追加 |
| skill:permissions:get    | 要確認         | 未存在なら `skillHandlers.ts` に追加 |
| skill:permissions:grant  | 要確認         | 未存在なら `skillHandlers.ts` に追加 |
| skill:permissions:revoke | 要確認         | 未存在なら `skillHandlers.ts` に追加 |
| skill:cache:get          | 要確認         | 未存在なら `skillHandlers.ts` に追加 |
| skill:cache:set          | 要確認         | 未存在なら `skillHandlers.ts` に追加 |
| skill:cache:invalidate   | 要確認         | 未存在なら `skillHandlers.ts` に追加 |

3. 未存在のハンドラーについて、以下のパターンで最小実装を追加する：

   ```typescript
   ipcMain.handle("skill:settings:get", async (event, skillName: string) => {
     validateIpcSender(event);
     try {
       const settings = await skillService.getSettings(skillName);
       return { success: true, data: settings };
     } catch (error) {
       return { success: false, error: (error as Error).message };
     }
   });
   ```

4. 対応する `SkillService` メソッドが未実装の場合：
   - `SkillService` に最小限のメソッドスタブを追加する
   - メソッドスタブは `throw new Error("Not implemented")` を返す
   - テスト側の Mock で実際の動作をシミュレートする

5. `channels.ts` にチャネル定数が未定義の場合、追加する

6. 全テストを再実行し、TC-13〜TC-22 が全てパスすることを確認する

**期待される成果物**:

- TC-13〜TC-22 が全てパスする `skillIpc.integration.test.ts`
- 必要に応じて更新された `skillHandlers.ts`
- 必要に応じて更新された `channels.ts`

---

### タスク3: 全テスト実行と結果記録

**目的**: 22テスト全件のパスを確認し、結果を記録する

**実行手順**:

1. 全テストを実行する：

   ```bash
   pnpm --filter @repo/desktop vitest run apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts
   ```

2. 以下を確認する：
   - 22テストが全てパスする
   - テスト実行時間が妥当（10秒以内）
   - コンソールに予期しない警告やエラーが出力されていない

3. 既存テストへの影響がないことを確認する：

   ```bash
   pnpm --filter @repo/desktop vitest run apps/desktop/src/main/ipc/__tests__/
   ```

4. TypeScript コンパイルが成功することを確認する：

   ```bash
   pnpm --filter @repo/desktop tsc --noEmit
   ```

5. `outputs/phase-05/implementation-summary.md` に結果を記録する

**期待される成果物**:

- `outputs/phase-05/implementation-summary.md`

---

## 参照資料

| 参照資料               | パス                                                               | 内容                 |
| ---------------------- | ------------------------------------------------------------------ | -------------------- |
| Phase 4 テストファイル | `apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts` | テスト対象           |
| Phase 4 テスト仕様書   | `outputs/phase-04/test-specification.md`                           | テスト一覧           |
| 既存ハンドラー         | `apps/desktop/src/main/ipc/skillHandlers.ts`                       | 実装対象             |
| チャネル定義           | `apps/desktop/src/preload/channels.ts`                             | チャネル追加先       |
| SkillService           | `apps/desktop/src/main/services/skill/SkillService.ts`             | メソッドスタブ追加先 |
| Agent SDK スキル仕様   | `aiworkflow-requirements: interfaces-agent-sdk-skill.md`           | IPC仕様              |

---

## 成果物

| 成果物             | パス                                                               | 内容                 |
| ------------------ | ------------------------------------------------------------------ | -------------------- |
| 統合テストファイル | `apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts` | 全22テストパス       |
| 実装サマリー       | `outputs/phase-05/implementation-summary.md`                       | テスト結果・変更内容 |

---

## 統合テスト連携

Phase 5 では以下の統合テスト観点を実装で検証する：

- **IPC登録→ハンドラー実行パス**: `registerSkillHandlers` 呼び出し後に `handlers.get()` で取得可能
- **ハンドラー→Service呼び出しパス**: ハンドラー内で `SkillService` の正しいメソッドが呼ばれる
- **エラー変換パス**: `SkillService` の例外が `{ success: false, error: "..." }` に変換される
- **セキュリティ検証パス**: 各ハンドラーの先頭で `validateIpcSender` が呼ばれる

---

## 多角的チェック観点

| 観点               | 確認内容                                                    |
| ------------------ | ----------------------------------------------------------- |
| テスタビリティ     | 全22テストが独立して実行可能か                              |
| IPC通信            | 追加ハンドラーが既存チャネルと衝突しないか                  |
| セキュリティ       | 追加ハンドラーに `validateIpcSender` が含まれているか       |
| エラーハンドリング | `OperationResult` パターンが統一的に適用されているか        |
| 型安全             | 追加コードが TypeScript strict モードでコンパイル可能か     |
| Electron固有       | Main Process のファイル配置が `apps/desktop/src/main/` 内か |

---

## 完了条件

- [ ] 基本12テストケース（TC-01〜TC-12）が全てパスする
- [ ] IMP-002 追加10テストケース（TC-13〜TC-22）が全てパスする
- [ ] 既存テスト（skillHandlers.test.ts 等）に影響がない
- [ ] TypeScript コンパイルが成功する
- [ ] `outputs/phase-05/implementation-summary.md` が配置されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: 基本テストケースのGreen化
3. タスク2: IMP-002 テストケースのGreen化
4. タスク3: 全テスト実行と結果記録
5. 成果物の作成・配置
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-06-test-expansion.md`
