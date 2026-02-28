# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 11                       |
| Phase名    | 手動テスト検証           |
| 前提Phase  | Phase 10（最終レビュー） |
| 後続Phase  | Phase 12（ドキュメント） |
| ステータス | 未実施                   |
| 作成日     | 2026-02-28               |
| 機能名     | TASK-9D-skill-chain      |

---

## 目的

Phase 10（最終レビュー）で合格したスキルチェーン機能について、DevTools を使用した手動テストを実施し、IPC 通信・CRUD 操作・チェーン実行・エラーハンドリングが期待どおりに動作することを検証する。自動テストでは検出困難なランタイム挙動やプロセス間通信の実際の動作を確認する。

## 背景

スキルチェーン機能は IPC 経由で Main Process と Renderer を跨ぐため、自動テストのモック環境では再現できないプロセス間通信の実挙動を手動で確認する必要がある。特に以下の観点が自動テストでカバーしきれない:

- contextBridge 経由の実際のシリアライゼーション挙動
- sender 検証による不正ウィンドウの拒否動作
- チェーン実行中の非同期処理とタイムアウトの実動作
- 既存スキル操作へのリグレッション

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク 1: テスト環境準備

**目的**: 手動テスト実行に必要な環境をセットアップする

**実行手順**:

1. Electron アプリをデバッグモードで起動する
   ```bash
   pnpm --filter @repo/desktop dev
   ```
2. DevTools を開く（`Cmd+Option+I`）
3. Console タブで `window.electronAPI.skill` オブジェクトの存在を確認する
   ```javascript
   // chainAPI が存在することを確認
   console.log(typeof window.electronAPI.skill.chainList); // "function"
   console.log(typeof window.electronAPI.skill.chainGet); // "function"
   console.log(typeof window.electronAPI.skill.chainSave); // "function"
   console.log(typeof window.electronAPI.skill.chainDelete); // "function"
   console.log(typeof window.electronAPI.skill.chainExecute); // "function"
   ```
4. テスト用スキルが少なくとも 2 つインポートされていることを確認する（チェーン実行テスト用）

**期待される成果物**:

- DevTools でのAPI存在確認スクリーンショット

---

### タスク 2: チェーン CRUD 手動テスト

**目的**: チェーン定義の作成・取得・更新・削除が IPC 経由で正常動作することを確認する

**実行手順**:

1. チェーン定義を作成する
   ```javascript
   const chain = {
     id: "test-chain-001",
     name: "テストチェーン",
     description: "手動テスト用チェーン",
     steps: [
       {
         stepId: "step-1",
         skillName: "existing-skill-name",
         inputMapping: { type: "literal", value: "hello" },
         outputMapping: { variableName: "step1_output" },
       },
     ],
     variables: {},
     errorHandling: "stop",
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   };
   const saveResult = await window.electronAPI.skill.chainSave(chain);
   console.log("Save result:", saveResult);
   ```
2. 一覧取得でチェーンが存在することを確認する
   ```javascript
   const list = await window.electronAPI.skill.chainList();
   console.log("Chain list:", list);
   // test-chain-001 が含まれていること
   ```
3. 個別取得でチェーン内容を確認する
   ```javascript
   const detail = await window.electronAPI.skill.chainGet("test-chain-001");
   console.log("Chain detail:", detail);
   // name === "テストチェーン" であること
   ```
4. チェーンを更新する
   ```javascript
   const updated = {
     ...detail,
     name: "更新テストチェーン",
     updatedAt: new Date().toISOString(),
   };
   const updateResult = await window.electronAPI.skill.chainSave(updated);
   console.log("Update result:", updateResult);
   ```
5. 更新が反映されていることを確認する
   ```javascript
   const afterUpdate =
     await window.electronAPI.skill.chainGet("test-chain-001");
   console.log("After update:", afterUpdate.name);
   // "更新テストチェーン" であること
   ```
6. チェーンを削除する
   ```javascript
   const deleteResult =
     await window.electronAPI.skill.chainDelete("test-chain-001");
   console.log("Delete result:", deleteResult);
   ```
7. 削除後に一覧から消えていることを確認する
   ```javascript
   const afterDelete = await window.electronAPI.skill.chainList();
   console.log("After delete:", afterDelete);
   // test-chain-001 が含まれていないこと
   ```

**期待される成果物**:

- 各操作の Console 出力結果

---

### タスク 3: チェーン実行手動テスト

**目的**: チェーン実行エンジンが各種パターンで正しく動作することを確認する

**実行手順**:

1. **単純チェーン実行（2ステップ）**: 2つのスキルを順次実行し、前ステップの出力が次ステップに渡ることを確認する
   ```javascript
   const simpleChain = {
     id: "exec-test-001",
     name: "単純実行テスト",
     description: "2ステップの単純チェーン",
     steps: [
       {
         stepId: "step-1",
         skillName: "skill-a",
         inputMapping: { type: "literal", value: "入力データ" },
         outputMapping: { variableName: "step1_out" },
       },
       {
         stepId: "step-2",
         skillName: "skill-b",
         inputMapping: { type: "previousOutput" },
         outputMapping: { variableName: "step2_out" },
       },
     ],
     variables: {},
     errorHandling: "stop",
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   };
   await window.electronAPI.skill.chainSave(simpleChain);
   const result = await window.electronAPI.skill.chainExecute("exec-test-001");
   console.log("Execution result:", JSON.stringify(result, null, 2));
   ```
2. **条件分岐チェーン実行**: `ifPreviousSuccess` 条件で正しくステップがスキップまたは実行されることを確認する
   ```javascript
   const condChain = {
     id: "exec-test-002",
     name: "条件分岐テスト",
     description: "条件付きステップのチェーン",
     steps: [
       {
         stepId: "step-1",
         skillName: "skill-a",
         inputMapping: { type: "literal", value: "test" },
         outputMapping: { variableName: "result1" },
       },
       {
         stepId: "step-2",
         skillName: "skill-b",
         inputMapping: { type: "variable", value: "result1" },
         condition: { type: "ifPreviousSuccess" },
       },
     ],
     variables: {},
     errorHandling: "skip",
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   };
   await window.electronAPI.skill.chainSave(condChain);
   const condResult =
     await window.electronAPI.skill.chainExecute("exec-test-002");
   console.log("Conditional result:", JSON.stringify(condResult, null, 2));
   ```
3. **テンプレート変数チェーン実行**: Mustache テンプレートで変数が展開されることを確認する
   ```javascript
   const templateChain = {
     id: "exec-test-003",
     name: "テンプレートテスト",
     description: "テンプレート変数展開のチェーン",
     steps: [
       {
         stepId: "step-1",
         skillName: "skill-a",
         inputMapping: {
           type: "template",
           template: "処理対象: {{inputData}}",
         },
         outputMapping: { variableName: "processed" },
       },
     ],
     variables: { inputData: "サンプルデータ" },
     errorHandling: "stop",
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   };
   await window.electronAPI.skill.chainSave(templateChain);
   const tmplResult =
     await window.electronAPI.skill.chainExecute("exec-test-003");
   console.log("Template result:", JSON.stringify(tmplResult, null, 2));
   ```

**期待される成果物**:

- 各チェーン実行結果の Console 出力

---

### タスク 4: エラーハンドリング手動テスト

**目的**: エラーハンドリング（stop/skip/retry）が設計どおりに動作することを確認する

**実行手順**:

1. **stop モードテスト**: エラー発生時にチェーン全体が停止することを確認する
   ```javascript
   const stopChain = {
     id: "error-test-001",
     name: "stopモードテスト",
     description: "エラーで全体停止",
     steps: [
       {
         stepId: "step-1",
         skillName: "nonexistent-skill",
         inputMapping: { type: "literal", value: "test" },
       },
       {
         stepId: "step-2",
         skillName: "skill-a",
         inputMapping: { type: "literal", value: "到達しないはず" },
       },
     ],
     variables: {},
     errorHandling: "stop",
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   };
   await window.electronAPI.skill.chainSave(stopChain);
   const stopResult =
     await window.electronAPI.skill.chainExecute("error-test-001");
   console.log("Stop mode result:", JSON.stringify(stopResult, null, 2));
   // success === false, step-2 が実行されていないこと
   ```
2. **skip モードテスト**: エラー発生ステップをスキップし、後続ステップが実行されることを確認する
   ```javascript
   const skipChain = {
     id: "error-test-002",
     name: "skipモードテスト",
     description: "エラーをスキップして継続",
     steps: [
       {
         stepId: "step-1",
         skillName: "nonexistent-skill",
         inputMapping: { type: "literal", value: "test" },
       },
       {
         stepId: "step-2",
         skillName: "skill-a",
         inputMapping: { type: "literal", value: "スキップ後に実行" },
       },
     ],
     variables: {},
     errorHandling: "skip",
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   };
   await window.electronAPI.skill.chainSave(skipChain);
   const skipResult =
     await window.electronAPI.skill.chainExecute("error-test-002");
   console.log("Skip mode result:", JSON.stringify(skipResult, null, 2));
   // step-1 はエラー、step-2 は実行されていること
   ```
3. **retry モードテスト**: リトライ回数分の再試行が行われることを確認する
4. **タイムアウトテスト**: ステップ個別の timeout 設定が機能することを確認する

**期待される成果物**:

- 各エラーモードの実行結果

---

### タスク 5: IPC バリデーション・セキュリティ手動テスト

**目的**: P42 準拠の 3 段バリデーションと sender 検証が実際の IPC 通信で機能することを確認する

**実行手順**:

1. **空文字列バリデーション（P42 準拠）**:

   ```javascript
   // 空文字列
   try {
     await window.electronAPI.skill.chainGet("");
     console.error("FAIL: 空文字列が通過した");
   } catch (e) {
     console.log("PASS: 空文字列が拒否された", e);
   }

   // スペースのみ
   try {
     await window.electronAPI.skill.chainGet("   ");
     console.error("FAIL: スペースのみが通過した");
   } catch (e) {
     console.log("PASS: スペースのみが拒否された", e);
   }

   // undefined
   try {
     await window.electronAPI.skill.chainGet(undefined);
     console.error("FAIL: undefined が通過した");
   } catch (e) {
     console.log("PASS: undefined が拒否された", e);
   }
   ```

2. **チェーン保存の不正データバリデーション**:

   ```javascript
   // null を渡す
   try {
     await window.electronAPI.skill.chainSave(null);
     console.error("FAIL: null が通過した");
   } catch (e) {
     console.log("PASS: null が拒否された", e);
   }

   // 不正な型を渡す
   try {
     await window.electronAPI.skill.chainSave("not-an-object");
     console.error("FAIL: 文字列が通過した");
   } catch (e) {
     console.log("PASS: 不正な型が拒否された", e);
   }
   ```

3. **チェーン実行の不正 chainId バリデーション**:
   ```javascript
   // 存在しない chainId
   try {
     await window.electronAPI.skill.chainExecute("non-existent-id");
     console.error("FAIL: 存在しないIDが通過した");
   } catch (e) {
     console.log("PASS: 存在しないIDが拒否された", e);
   }
   ```

**期待される成果物**:

- バリデーションテストの PASS/FAIL 結果一覧

---

### タスク 6: リグレッションテスト

**目的**: スキルチェーン機能の追加が既存スキル操作に影響を与えていないことを確認する

**実行手順**:

1. 既存スキル一覧取得が正常動作すること
   ```javascript
   const skills = await window.electronAPI.skill.list();
   console.log("Existing skills:", skills);
   // 既存スキルが正しく表示されること
   ```
2. 既存スキルのインポート・削除が正常動作すること
3. 既存 IPC チャネル（`skill:list`, `skill:import`, `skill:remove`）が影響を受けていないこと
4. Main Process のコンソールにエラーが出力されていないこと

**期待される成果物**:

- リグレッションテスト結果

---

### タスク 7: テスト結果集約

**目的**: 全手動テスト結果を集約し、`manual-test-result.md` を作成する

**実行手順**:

1. 全テストケースの結果を以下のテーブルに記録する
2. PASS/FAIL/SKIP の集計を行う
3. 不具合が発見された場合は、再現手順と期待結果とのギャップを記録する
4. 結果ファイルを `outputs/phase-11/manual-test-result.md` に出力する

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

## テストケース一覧

| No    | カテゴリ           | テスト項目                               | 前提条件                    | 操作手順                                                           | 期待結果                                        | 実行結果 | 備考 |
| ----- | ------------------ | ---------------------------------------- | --------------------------- | ------------------------------------------------------------------ | ----------------------------------------------- | -------- | ---- |
| MT-01 | 機能テスト         | チェーン定義の作成                       | アプリ起動済み              | chainSave で新規チェーンを保存                                     | 保存成功、chainList に反映                      |          |      |
| MT-02 | 機能テスト         | チェーン一覧の取得                       | MT-01 完了                  | chainList を実行                                                   | 保存したチェーンが一覧に含まれる                |          |      |
| MT-03 | 機能テスト         | チェーンの更新                           | MT-01 完了                  | chainSave で既存チェーンを上書き保存                               | 更新内容が chainGet で確認可能                  |          |      |
| MT-04 | 機能テスト         | チェーンの削除                           | MT-01 完了                  | chainDelete を実行                                                 | 削除後に chainList から消滅                     |          |      |
| MT-05 | 機能テスト         | 単純チェーン実行（2ステップ）            | テスト用スキル2つ存在       | 2ステップチェーンを保存・実行                                      | 各ステップが順次実行、前出力が次入力に渡る      |          |      |
| MT-06 | 機能テスト         | 条件分岐チェーン実行                     | テスト用スキル存在          | ifPreviousSuccess 条件付きチェーン実行                             | 条件に応じてステップが実行/スキップ             |          |      |
| MT-07 | 機能テスト         | テンプレート変数チェーン実行             | テスト用スキル存在          | Mustache テンプレートを含むチェーン実行                            | `{{変数名}}` が展開された入力がスキルに渡る     |          |      |
| MT-08 | 機能テスト         | JSONPath 出力抽出テスト                  | テスト用スキル存在          | extractPath 付き outputMapping で実行                              | JSONPath で指定した値が変数に格納               |          |      |
| MT-09 | エラーハンドリング | stop モードでのエラー停止                | テスト用チェーン定義済み    | 存在しないスキルを含むチェーン実行                                 | エラー発生ステップで停止、後続ステップ未実行    |          |      |
| MT-10 | エラーハンドリング | skip モードでのエラースキップ            | テスト用チェーン定義済み    | errorHandling: "skip" で実行                                       | エラーステップをスキップ、後続ステップ実行      |          |      |
| MT-11 | エラーハンドリング | retry モードでのリトライ                 | テスト用チェーン定義済み    | retryCount 設定付きチェーン実行                                    | 指定回数分リトライ後に結果返却                  |          |      |
| MT-12 | エラーハンドリング | タイムアウトテスト                       | テスト用チェーン定義済み    | timeout 設定付きステップを含む実行                                 | タイムアウト超過時にエラーとして処理            |          |      |
| MT-13 | IPC通信            | 不正引数でのバリデーションエラー         | アプリ起動済み              | 空文字列・スペースのみ・null 等を送信                              | P42 準拠の 3 段バリデーションで拒否             |          |      |
| MT-14 | IPC通信            | sender 検証                              | アプリ起動済み              | 正規ウィンドウからの呼び出し確認                                   | 正規ウィンドウからのみ受理                      |          |      |
| MT-15 | リグレッション     | 既存スキル操作への影響なし確認           | 既存スキルインポート済み    | skill:list, skill:import, skill:remove                             | 既存機能が正常動作                              |          |      |
| MT-16 | リグレッション     | 既存 IPC チャネルの正常動作確認          | アプリ起動済み              | 既存の全スキル IPC チャネル呼び出し                                | エラーなし、期待結果と一致                      |          |      |
| MT-17 | リグレッション     | コールバック待機タイムアウト後の停止処理 | authCallbackServer 起動済み | `waitForCallback(100)` で timeout を発生させた後に `stop()` を実行 | `Worker exited unexpectedly` が再発せず停止完了 |          |      |

---

## 参照資料

| 参照資料                   | パス                                                                                                                         | 内容                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| TASK-9D タスク仕様         | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md` | タスク定義・検証条件                   |
| Phase 1 成果物             | `docs/30-workflows/TASK-9D-skill-chain/outputs/phase-1/`                                                                     | 要件・受け入れ基準                     |
| Phase 2 成果物             | `docs/30-workflows/TASK-9D-skill-chain/outputs/phase-2/`                                                                     | 詳細設計                               |
| Phase 5 成果物             | `docs/30-workflows/TASK-9D-skill-chain/outputs/phase-5/`                                                                     | 実装サマリー                           |
| Phase 6 成果物             | `docs/30-workflows/TASK-9D-skill-chain/outputs/phase-6/`                                                                     | 追加テスト                             |
| Phase 7 成果物             | `docs/30-workflows/TASK-9D-skill-chain/outputs/phase-7/`                                                                     | カバレッジ検証                         |
| Phase 8 成果物             | `docs/30-workflows/TASK-9D-skill-chain/outputs/phase-8/`                                                                     | リファクタリング記録                   |
| Phase 9 成果物             | `docs/30-workflows/TASK-9D-skill-chain/outputs/phase-9/`                                                                     | 品質保証記録                           |
| Phase 10 最終レビュー結果  | `docs/30-workflows/TASK-9D-skill-chain/outputs/phase-10/`                                                                    | レビュー結果                           |
| IPC 契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                                | P23/P32/P42/P44/P45検証                |
| セキュリティ IPC           | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                                    | IPC セキュリティ原則                   |
| Electron セキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                 | sender 検証                            |
| 認証セキュリティ実装       | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`                                               | authCallbackServer の timeout/停止仕様 |
| 認証実装パターン           | `.claude/skills/aiworkflow-requirements/references/patterns.md`                                                              | OAuth ローカルHTTP受信パターン         |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                                                         | P42/P44/P45                            |
| チェーンパターン集         | `.claude/skills/skill-creator/references/skill-chain-patterns.md`                                                            | テストパターン参照                     |
| オーケストレーションガイド | `.claude/skills/skill-creator/references/orchestration-guide.md`                                                             | 変数構文・実行モデル                   |

---

## 成果物

| 成果物         | パス                                     | 内容                              |
| -------------- | ---------------------------------------- | --------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 17ケースの実行結果・PASS/FAIL集計 |

---

## 統合テスト連携

### テスト実行コマンド

```bash
# ユニットテスト（手動テスト前に全PASS確認）
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillChainExecutor.test.ts
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillChainStore.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillChainHandlers.test.ts

# 統合テスト
cd apps/desktop && pnpm vitest run --grep "SkillChain"
```

### 自動テストとの差分

手動テストで検証する項目は、自動テストでカバーできない以下の領域:

- 実際の Electron プロセス間通信（contextBridge 経由のシリアライゼーション）
- 実際の sender 検証（BrowserWindow インスタンスの検証）
- 実際のファイルシステムを使った永続化
- リグレッション（既存機能との共存）

---

## 多角的チェック観点

### セキュリティ観点

- [ ] 全 5 チャネルで P42 準拠の 3 段バリデーション（型チェック → 空文字列 → トリム空文字列）が機能する
- [ ] sender 検証で不正ウィンドウからの呼び出しが拒否される
- [ ] エラーレスポンスに内部情報（パス、スタックトレース）が含まれない

### パフォーマンス観点

- [ ] 10ステップのチェーン実行が妥当な時間内（30秒以内）に完了する
- [ ] チェーン一覧取得が 100 件のチェーン定義でも 1 秒以内に返却される

### データ整合性観点

- [ ] チェーン保存後のデータが欠損なく取得できる
- [ ] ISO 8601 文字列の日時フィールド（createdAt/updatedAt）が正しくシリアライズ/デシリアライズされる
- [ ] チェーン削除後に関連データが残留しない

---

## 完了条件

- [ ] 全 17 テストケース（MT-01 〜 MT-17）の実行結果が記録されている
- [ ] PASS 率が 100%（全テストケース PASS）、またはFAILケースに対する修正計画が記載されている
- [ ] P42 準拠のバリデーションテスト（MT-13）が PASS
- [ ] リグレッションテスト（MT-15, MT-16, MT-17）が PASS
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] テスト後のクリーンアップ（テスト用チェーン定義の削除）が完了している

---

## サブタスク管理

| #   | サブタスク                   | ステータス | 依存関係 |
| --- | ---------------------------- | ---------- | -------- |
| 1   | テスト環境準備               | 未着手     | -        |
| 2   | チェーン CRUD 手動テスト     | 未着手     | #1       |
| 3   | チェーン実行手動テスト       | 未着手     | #1       |
| 4   | エラーハンドリング手動テスト | 未着手     | #1       |
| 5   | IPC バリデーション手動テスト | 未着手     | #1       |
| 6   | リグレッションテスト         | 未着手     | #1       |
| 7   | テスト結果集約               | 未着手     | #2-#6    |

---

## タスク100%実行確認

- [ ] タスク 1（テスト環境準備）を 100% 完了
- [ ] タスク 2（チェーン CRUD 手動テスト）を 100% 完了
- [ ] タスク 3（チェーン実行手動テスト）を 100% 完了
- [ ] タスク 4（エラーハンドリング手動テスト）を 100% 完了
- [ ] タスク 5（IPC バリデーション手動テスト）を 100% 完了
- [ ] タスク 6（リグレッションテスト）を 100% 完了
- [ ] タスク 7（テスト結果集約）を 100% 完了

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] FAIL テストケースがある場合は修正計画を記載

---

## 依存関係

- **前提**: Phase 10（最終レビュー）が PASS で完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### 実行タスク

- テスト環境準備: [結果]
- チェーン CRUD 手動テスト: [結果]
- チェーン実行手動テスト: [結果]
- エラーハンドリング手動テスト: [結果]
- IPC バリデーション手動テスト: [結果]
- リグレッションテスト: [結果]
- テスト結果集約: [結果]

### テスト結果サマリー

| カテゴリ           | 件数 | PASS | FAIL | SKIP |
| ------------------ | ---- | ---- | ---- | ---- |
| 機能テスト         | 8    |      |      |      |
| エラーハンドリング | 4    |      |      |      |
| IPC通信            | 2    |      |      |      |
| リグレッション     | 3    |      |      |      |
| **合計**           | 17   |      |      |      |

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

`docs/30-workflows/TASK-9D-skill-chain/phase-12-documentation.md`
