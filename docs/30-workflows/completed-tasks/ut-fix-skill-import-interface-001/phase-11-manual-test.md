# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 11                                |
| Phase名    | 手動テスト検証                    |
| タスクID   | UT-FIX-SKILL-IMPORT-INTERFACE-001 |
| 前提Phase  | Phase 10（最終レビュー）          |
| 後続Phase  | Phase 12（ドキュメント更新）      |
| ステータス | 未実施                            |
| 作成日     | 2026-02-21                        |
| 機能名     | skill-import-agent-system         |

---

## 目的

Electron実環境でskill:import IPCハンドラーの動作を検証する。
ハンドラの引数形式を `{ skillIds: string[] }` から `skillName: string` に変更した修正が正常に動作し、スキルインポート機能に問題がないことを確認する。

## 背景

skill:import IPCハンドラはMain ProcessとRenderer Processの境界に位置する。
Preload側は変更なし（元から `skillName: string` を送信）で、ハンドラ側の引数受け取り方を修正した。
ユニットテストに加えて、実環境でのプロセス間通信の動作確認が必要である。

---

## テスト実施方針

### 制限事項

- skill:importのPreload APIが window.electronAPI.skill.import(skillName) として接続済みであること
- インポート可能なスキルが1つ以上存在すること（テスト用スキルが必要）

### 検証方法

| 方法                           | 対象                               | 優先度 |
| ------------------------------ | ---------------------------------- | ------ |
| Electronアプリ上でのUI操作     | スキルインポートボタンの動作       | 高     |
| DevToolsコンソール直接呼び出し | IPC通信の正常動作                  | 高     |
| ユニットテスト結果の確認       | バリデーションとインポートロジック | 高     |
| コンソールログ確認             | エラー出力がないこと               | 中     |

---

## 実行タスク

- 参照仕様確認: aiworkflow-requirements と既存実装差分を確認する
- 実装/検証手順定義: 本Phaseで実施する作業を具体化する
- 成果物反映: outputs 配下に結果を記録する

> 以下のタスクを順番に実行してください。

### タスク1: 自動テストの実行確認

**目的**: 手動テスト前に関連する自動テストが全てパスすることを確認する

**実行手順**:

1. skillHandlers のユニットテストを実行する
2. skill-api の Preload テストを実行する
3. 全テストがパスすることを確認する
4. テスト結果サマリーを記録する

**コマンド**:

```bash
# skillHandlers テスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose

# skill-api Preloadテスト実行
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-11/auto-test-result.md`

---

### タスク2: スキルインポートの正常系テスト（UI操作）

**目的**: アプリUI上でスキルインポートが正常動作することを確認する

**テストケーステーブル**:

| TC-ID  | 操作内容                                                               | 前提条件                            | 期待結果                                                   |
| ------ | ---------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| TC-001 | スキル一覧画面でインポートボタンをクリックしてスキルをインポート       | インポート可能なスキルが1つ以上存在 | スキルがUIに追加され、インポート完了のフィードバックが表示 |
| TC-002 | インポート後にアプリを再起動し、インポートが永続化されていることを確認 | TC-001完了後                        | インポートしたスキルが再起動後も一覧に表示される           |
| TC-003 | 5回連続でスキルインポート操作を実行し、全回成功することを確認          | インポート可能なスキルが5つ以上存在 | 5回全て成功し、エラーメッセージが出力されない              |

**実行手順（TC-001）**:

1. `pnpm --filter @repo/desktop dev` でElectronアプリを起動する
2. スキル管理画面に遷移する
3. インポート可能なスキルが表示されていることを確認する
4. インポートボタンをクリックする
5. スキルがUIに追加されたことを確認する
6. エラーメッセージが表示されないことを確認する

**実行手順（TC-002）**:

1. TC-001完了後、アプリを終了する
2. 再度 `pnpm --filter @repo/desktop dev` でアプリを起動する
3. スキル管理画面でTC-001でインポートしたスキルが表示されることを確認する

**実行手順（TC-003）**:

1. インポート可能なスキルを5つ用意する
2. 各スキルを順にインポートする
3. 全回成功し、コンソールにエラーが出力されないことを確認する

**期待される成果物**:

- `outputs/phase-11/ui-import-test-result.md`

---

### タスク3: DevToolsコンソールからの直接呼び出しテスト

**目的**: IPC通信が修正後のインターフェース（`skillName: string`）で正常動作することを確認する

**テストケーステーブル**:

| TC-ID  | 操作内容                                                                 | 前提条件                         | 期待結果                                                |
| ------ | ------------------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------- |
| TC-004 | DevToolsで `window.electronAPI.skill.import("existing-skill")` を実行    | 対象スキルがインポート可能である | 成功レスポンスが返り、スキルがインポートされる          |
| TC-005 | DevToolsで `window.electronAPI.skill.import("nonexistent-skill")` を実行 | 対象スキルが存在しない           | エラーレスポンスが返る                                  |
| TC-006 | DevToolsで `window.electronAPI.skill.import("")` を実行                  | -                                | バリデーションエラーが返る（空文字列拒否）              |
| TC-007 | DevToolsで `window.electronAPI.skill.import("   ")` を実行               | -                                | バリデーションエラーが返る（スペースのみ拒否、P42準拠） |

**実行手順（TC-004）**:

1. Electronアプリを起動する
2. DevTools（Cmd+Option+I）を開く
3. Consoleタブで以下を実行する:
   ```javascript
   await window.electronAPI.skill.import("existing-skill");
   ```
4. 成功レスポンスが返ることを確認する
5. スキル一覧にインポートされたことを確認する

**期待される成果物**:

- `outputs/phase-11/devtools-test-result.md`

---

### タスク4: コンソールエラーログ確認

**目的**: アプリ起動時および操作時にskill:import関連のエラーが出力されていないことを確認する

**テストケーステーブル**:

| TC-ID  | 確認内容                                                             | 期待結果                                               |
| ------ | -------------------------------------------------------------------- | ------------------------------------------------------ |
| TC-008 | アプリ起動時にDevToolsコンソールにskill:import関連エラーがないこと   | `VALIDATION_ERROR` や `skillIds must be an array` なし |
| TC-009 | スキルインポート操作後にコンソールにエラーログが出力されていないこと | エラーログなし                                         |

**実行手順**:

1. DevToolsを開いた状態でアプリを起動する
2. コンソール出力を確認する
3. `VALIDATION_ERROR` で検索してヒットしないことを確認する
4. `skillIds must be an array` で検索してヒットしないことを確認する
5. `Error occurred in handler for 'skill:import'` で検索してヒットしないことを確認する
6. スキルインポート操作を実行する
7. 操作後のコンソール出力にエラーがないことを確認する

**期待される成果物**:

- `outputs/phase-11/console-log-check-result.md`

---

### タスク5: 他のスキル操作への影響確認

**目的**: skill:import修正が他のスキル操作に影響を与えていないことを確認する

**テストケーステーブル**:

| TC-ID  | 操作内容                             | 期待結果                           |
| ------ | ------------------------------------ | ---------------------------------- |
| TC-010 | skill:remove操作が正常に動作する     | スキル削除が成功する               |
| TC-011 | skill:get-status操作が正常に動作する | スキルステータスが正常に取得される |
| TC-012 | skill:abort操作が正常に動作する      | スキル実行の中止が正常に機能する   |

**実行手順**:

1. TC-010: インポート済みスキルを削除し、削除が成功することを確認する
2. TC-011: スキルのステータス取得が正常に動作することを確認する
3. TC-012: スキル実行中に中止操作が正常に機能することを確認する

**期待される成果物**:

- `outputs/phase-11/side-effect-check-result.md`

---

### タスク6: 発見課題の記録

**目的**: テスト中に発見した課題を記録する

**実行手順**:

1. タスク1〜5で発見した問題を記録する
2. 問題の重要度を分類する
3. 対応方針を決定する

**課題分類**:

| 重要度   | 基準                       | 対応             |
| -------- | -------------------------- | ---------------- |
| 致命的   | 機能が使用できない         | 即時修正         |
| 重大     | 一部機能に影響             | 本フェーズで修正 |
| 軽微     | 使用に支障なし             | Phase 12 で記録  |
| 改善提案 | より良くするためのアイデア | Phase 12 で記録  |

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

---

## 参照資料

> 依存Phase成果物参照: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10

| 参照資料           | パス                                                                          | 内容                   |
| ------------------ | ----------------------------------------------------------------------------- | ---------------------- |
| IPCハンドラー実装  | `apps/desktop/src/main/ipc/skillHandlers.ts`（行120-138）                     | Main Processハンドラー |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`（行261-262）                          | Preload API実装        |
| テストファイル     | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`（行630-740）      | テストコード           |
| P44仕様書          | `docs/30-workflows/ut-fix-skill-import-interface-001/`                        | 本タスク仕様書群       |
| セキュリティルール | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | セキュリティ基準       |
| IPC契約チェック    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | P42/P44 検証基準       |

---

## 統合テスト連携

| 連携観点             | 本Phaseでの確認内容                                                          |
| -------------------- | ---------------------------------------------------------------------------- |
| Preload→Main IPC契約 | `skill-api.ts` の引数形式と `skillHandlers.ts` の受け口を照合する            |
| バリデーション連携   | sender検証・入力バリデーション・エラーコードの整合を確認する                 |
| テスト連携           | `skillHandlers.test.ts` / `skill-api.test.ts` の期待値と実装契約を一致させる |

## 多角的チェック観点（aiworkflow-requirements）

| 観点               | 参照仕様                                                                                    | 本タスクでの確認ポイント                   |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| API設計            | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | `skill:import/remove` チャンネル定義の整合 |
| インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill管理API契約（引数・戻り値）整合       |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main/Preload間の責務境界と引数契約         |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `validateIpcSender` と入力検証の必須要件   |
| Electron IPC       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | `safeInvoke` とホワイトリスト制約          |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P42/P44に基づく実装整合                |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | `VALIDATION_ERROR` の扱い統一              |

## 成果物

| 成果物                 | パス                                           | 内容                         |
| ---------------------- | ---------------------------------------------- | ---------------------------- |
| 自動テスト結果         | `outputs/phase-11/auto-test-result.md`         | テスト実行結果               |
| UIインポートテスト結果 | `outputs/phase-11/ui-import-test-result.md`    | UIでのスキルインポートテスト |
| DevToolsテスト結果     | `outputs/phase-11/devtools-test-result.md`     | コンソール直接呼び出しテスト |
| コンソールログ確認     | `outputs/phase-11/console-log-check-result.md` | エラーログ不在の確認         |
| 副作用チェック結果     | `outputs/phase-11/side-effect-check-result.md` | 他スキル操作への影響確認     |
| 発見課題               | `outputs/phase-11/discovered-issues.md`        | 課題一覧                     |

---

## 完了条件

- [ ] 自動テスト（skillHandlers + skill-api）が全てパスしている
- [ ] UI操作でのスキルインポートテスト（TC-001〜TC-003）が全てパスしている
- [ ] DevToolsコンソールからの直接呼び出しテスト（TC-004〜TC-007）が全てパスしている
- [ ] コンソールエラーログ確認（TC-008〜TC-009）が全てパスしている
- [ ] skill:importエラーが0件であること
- [ ] skill:remove操作も引き続き正常に動作すること（TC-010）
- [ ] 他のスキル操作（abort, get-status）に影響がないこと（TC-011〜TC-012）
- [ ] 5回連続インポート操作が全て成功していること（TC-003）
- [ ] 発見課題が記録されている（0件でも記録必須）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（6ファイル）が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10 が完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-fix-skill-import-interface-001/phase-12-documentation.md`
