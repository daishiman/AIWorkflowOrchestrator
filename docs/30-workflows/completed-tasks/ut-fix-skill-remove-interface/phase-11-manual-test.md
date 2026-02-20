# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 11                                |
| Phase名    | 手動テスト検証                    |
| タスクID   | UT-FIX-SKILL-REMOVE-INTERFACE-001 |
| 前提Phase  | Phase 10（最終レビュー）          |
| 後続Phase  | Phase 12（ドキュメント更新）      |
| ステータス | 未実施                            |
| 作成日     | 2026-02-20                        |
| 機能名     | ut-fix-skill-remove-interface     |

---

## 目的

Electron実環境でskill:remove IPCハンドラーの動作を検証する。
ハンドラの引数形式を `{ skillId: string }` から `skillName: string` に変更した修正が正常に動作し、スキル削除機能に問題がないことを確認する。

## 背景

skill:remove IPCハンドラはMain ProcessとRenderer Processの境界に位置する。
Preload側は変更なし（元から `skillName: string` を送信）で、ハンドラ側の引数受け取り方を修正した。
ユニットテストに加えて、実環境でのプロセス間通信の動作確認が必要である。

---

## テスト実施方針

### 制限事項

- skill:remove のPreload APIが `window.electronAPI.skill.removeSkill(skillName)` として接続済みであること
- スキルが1つ以上インポート済みであること（テスト用スキルが必要）

### 検証方法

| 方法                           | 対象                         | 優先度 |
| ------------------------------ | ---------------------------- | ------ |
| Electronアプリ上でのUI操作     | スキル削除ボタンの動作       | 高     |
| DevToolsコンソール直接呼び出し | IPC通信の正常動作            | 高     |
| ユニットテスト結果の確認       | バリデーションと削除ロジック | 高     |
| コンソールログ確認             | エラー出力がないこと         | 中     |

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

### タスク2: スキル削除の正常系テスト（UI操作）

**目的**: アプリUI上でスキル削除が正常動作することを確認する

**テストケーステーブル**:

| TC-ID  | 操作内容                                                   | 前提条件                | 期待結果                                                 |
| ------ | ---------------------------------------------------------- | ----------------------- | -------------------------------------------------------- |
| TC-001 | スキル一覧画面で削除ボタンをクリックしてスキルを削除する   | スキルが1つ以上存在する | スキルがUIから消え、削除完了のフィードバックが表示される |
| TC-002 | 削除後にアプリを再起動し、削除が永続化されていることを確認 | TC-001完了後            | 削除したスキルが再起動後も一覧に表示されない             |

**実行手順（TC-001）**:

1. `pnpm --filter @repo/desktop dev` でElectronアプリを起動する
2. スキル管理画面に遷移する
3. テスト用スキルが表示されていることを確認する
4. 削除ボタンをクリックする
5. 確認ダイアログがあれば確認する
6. スキルがUIから消えたことを確認する

**実行手順（TC-002）**:

1. TC-001完了後、アプリを終了する
2. 再度 `pnpm --filter @repo/desktop dev` でアプリを起動する
3. スキル管理画面でTC-001で削除したスキルが表示されないことを確認する

**期待される成果物**:

- `outputs/phase-11/ui-delete-test-result.md`

---

### タスク3: DevToolsコンソールからの直接呼び出しテスト

**目的**: IPC通信が修正後のインターフェース（`skillName: string`）で正常動作することを確認する

**テストケーステーブル**:

| TC-ID  | 操作内容                                                                      | 前提条件               | 期待結果                                                |
| ------ | ----------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------- |
| TC-003 | DevToolsで `window.electronAPI.skill.removeSkill("existing-skill")` を実行    | 対象スキルが存在する   | 成功レスポンスが返り、スキルが削除される                |
| TC-004 | DevToolsで `window.electronAPI.skill.removeSkill("nonexistent-skill")` を実行 | 対象スキルが存在しない | エラーレスポンスが返る                                  |
| TC-005 | DevToolsで `window.electronAPI.skill.removeSkill("")` を実行                  | -                      | バリデーションエラーが返る（空文字列拒否）              |
| TC-006 | DevToolsで `window.electronAPI.skill.removeSkill("   ")` を実行               | -                      | バリデーションエラーが返る（スペースのみ拒否、P42準拠） |

**実行手順（TC-003）**:

1. Electronアプリを起動する
2. DevTools（Cmd+Option+I）を開く
3. Consoleタブで以下を実行する:
   ```javascript
   await window.electronAPI.skill.removeSkill("existing-skill");
   ```
4. 成功レスポンスが返ることを確認する
5. スキル一覧から削除されたことを確認する

**期待される成果物**:

- `outputs/phase-11/devtools-test-result.md`

---

### タスク4: コンソールエラーログ確認

**目的**: アプリ起動時および操作時にskill:remove関連のエラーが出力されていないことを確認する

**テストケーステーブル**:

| TC-ID  | 確認内容                                                           | 期待結果                                               |
| ------ | ------------------------------------------------------------------ | ------------------------------------------------------ |
| TC-007 | アプリ起動時にDevToolsコンソールにskill:remove関連エラーがないこと | `VALIDATION_ERROR` や `skillIds must be an array` なし |
| TC-008 | スキル削除操作後にコンソールにエラーログが出力されていないこと     | エラーログなし                                         |

**実行手順**:

1. DevToolsを開いた状態でアプリを起動する
2. コンソール出力を確認する
3. `VALIDATION_ERROR` で検索してヒットしないことを確認する
4. `skillIds must be an array` で検索してヒットしないことを確認する
5. スキル削除操作を実行する
6. 操作後のコンソール出力にエラーがないことを確認する

**期待される成果物**:

- `outputs/phase-11/console-log-check-result.md`

---

### タスク5: 発見課題の記録

**目的**: テスト中に発見した課題を記録する

**実行手順**:

1. タスク1〜4で発見した問題を記録する
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

| 参照資料           | パス                                                                     | 内容                   |
| ------------------ | ------------------------------------------------------------------------ | ---------------------- |
| IPCハンドラー実装  | `apps/desktop/src/main/ipc/skillHandlers.ts`（行140-155）                | Main Processハンドラー |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`                                  | Preload API実装        |
| テストファイル     | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`（行746-819） | テストコード           |
| P44仕様書          | `docs/30-workflows/ut-fix-skill-remove-interface/`                       | 本タスク仕様書群       |
| セキュリティルール | `.claude/rules/04-electron-security.md`                                  | セキュリティ基準       |
| P42バリデーション  | `.claude/rules/06-known-pitfalls.md`                                     | trim()バリデーション   |

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
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P42に基づく実装整合                    |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | `VALIDATION_ERROR` 等の扱い統一            |

## 成果物

| 成果物             | パス                                           | 内容                         |
| ------------------ | ---------------------------------------------- | ---------------------------- |
| 自動テスト結果     | `outputs/phase-11/auto-test-result.md`         | テスト実行結果               |
| UI削除テスト結果   | `outputs/phase-11/ui-delete-test-result.md`    | UIでのスキル削除テスト       |
| DevToolsテスト結果 | `outputs/phase-11/devtools-test-result.md`     | コンソール直接呼び出しテスト |
| コンソールログ確認 | `outputs/phase-11/console-log-check-result.md` | エラーログ不在の確認         |
| 発見課題           | `outputs/phase-11/discovered-issues.md`        | 課題一覧                     |

---

## 完了条件

- [ ] 自動テスト（skillHandlers + skill-api）が全てパスしている
- [ ] UI操作でのスキル削除テスト（TC-001〜TC-002）が全てパスしている
- [ ] DevToolsコンソールからの直接呼び出しテスト（TC-003〜TC-006）が全てパスしている
- [ ] コンソールエラーログ確認（TC-007〜TC-008）が全てパスしている
- [ ] 発見課題が記録されている（0件でも記録必須）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10 が完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-fix-skill-remove-interface/phase-12-documentation.md`
