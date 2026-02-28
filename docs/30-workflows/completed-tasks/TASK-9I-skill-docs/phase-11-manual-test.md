# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 11                           |
| Phase名    | 手動テスト検証               |
| タスクID   | TASK-9I                      |
| 前提Phase  | Phase 10（最終レビュー）     |
| 後続Phase  | Phase 12（ドキュメント更新） |
| ステータス | pending                      |
| 作成日     | 2026-02-28                   |
| 機能名     | TASK-9I-skill-docs           |

---

## 目的

DevTools経由のIPC手動テストで、自動テストが検出できない実行時の不具合を検証する。
SkillDocGenerator / IPCハンドラーの動作を、DevToolsコンソールからの直接呼び出しにより検証する。
UIはスコープ外のため、Renderer UIテストは不要。

## 背景

スキルドキュメント生成機能はMain Processで動作するサービスであり、LLM連携・IPC通信・ファイルエクスポートの3つの境界が存在する。
自動テストではモック化されているこれらの境界を、実環境で検証する。
Electron アプリを起動し、DevTools Console 経由で IPC 呼び出しを実行して動作を検証する。

---

## テスト実施方針

### 制限事項

- ドキュメント生成UIは別タスクのスコープであるため、DevToolsコンソール経由のIPC呼び出しが主な検証手段となる
- Preload API のスタブ未解消チャンネルが存在する場合、DevToolsからの直接呼び出しが不可能な場合がある
- その場合はユニットテスト結果をもって手動テストの代替とし、理由を `outputs/phase-11/manual-test-result.md` に記録する

### 検証方法

| 方法                           | 対象                              | 優先度 |
| ------------------------------ | --------------------------------- | ------ |
| DevToolsコンソール直接呼び出し | Preload APIが接続済みのチャンネル | 高     |
| ユニットテスト結果の確認       | 全4チャンネル                     | 高     |
| コードリーディング             | セキュリティ実装の確認            | 中     |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 自動テストの実行確認

**目的**: 手動テスト前に自動テストが全てパスすることを確認する

**実行手順**:

1. SkillDocGenerator のユニットテストを実行する
2. skillHandlers のdocs関連テストを実行する
3. 全テストがパスすることを確認する
4. テスト結果サマリーを記録する

**コマンド**:

```bash
# SkillDocGenerator テスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillDocGenerator.test.ts --reporter=verbose

# skillHandlers docs関連テスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/skillHandlers.docs.test.ts --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-11/auto-test-result.md`

---

### タスク2: 機能テスト（正常系）

**目的**: 4つのIPCチャネルの正常動作を確認する

**実行手順**:

1. Electronアプリをビルドし起動する: `cd apps/desktop && pnpm dev`
2. DevTools Console を開く（Cmd+Option+I）
3. テストケースF-1〜F-5を順番に実行する

**テストケーステーブル**:

| TC-ID | チャネル             | 操作手順                                                                                                                      | 期待結果                                                                                                                                     |
| ----- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| F-1   | skill:docs:generate  | `await window.electronAPI.skill.generateDocs({ skillName: "test-skill", language: "ja" })` を実行                             | GeneratedDoc オブジェクトが返る（title, sections, metadata フィールドを含む）                                                                |
| F-2   | skill:docs:templates | `await window.electronAPI.skill.getDocTemplates()` を実行                                                                     | DocTemplate 配列が返る（デフォルトテンプレートが7セクション: overview, installation, usage, api, configuration, examples, changelog を含む） |
| F-3   | skill:docs:preview   | `await window.electronAPI.skill.previewDocs({ skillName: "test-skill" })` を実行                                              | GeneratedDoc オブジェクトが返る（generateDocsと同じ構造）                                                                                    |
| F-4   | skill:docs:preview   | `await window.electronAPI.skill.previewDocs({ skillName: "test-skill", template: { sections: ["overview", "api"] } })` を実行 | sections が overview と api の2セクションのみ含む GeneratedDoc が返る                                                                        |
| F-5   | skill:docs:export    | `await window.electronAPI.skill.exportDocs({ doc: generatedDoc, outputPath: "/tmp/test-doc.md" })` を実行                     | `/tmp/test-doc.md` にMarkdownファイルが生成される                                                                                            |

**F-1 詳細手順**:

1. DevTools（Cmd+Option+I）を開く
2. Consoleタブで以下を実行する:
   ```javascript
   const result = await window.electronAPI.skill.generateDocs({
     skillName: "test-skill",
     language: "ja",
   });
   console.log(JSON.stringify(result, null, 2));
   ```
3. レスポンスに `skillName`, `content`, `sections`, `generatedAt`, `wordCount` フィールドが含まれていることを確認する
4. `sections` が配列であり、各要素に `title` と `content` が含まれていることを確認する

**期待される成果物**:

- `outputs/phase-11/functional-normal-test-result.md`

---

### タスク3: 機能テスト（異常系）

**目的**: 不正入力時のバリデーションとエラーレスポンスを確認する

**テストケーステーブル**:

| TC-ID | チャネル            | 操作手順                                                                                                  | 期待結果                                                                           |
| ----- | ------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| E-1   | skill:docs:generate | `await window.electronAPI.skill.generateDocs({ skillName: "nonexistent-skill" })` を実行                  | エラーオブジェクトが返る（内部パスやスタック情報を含まない）                       |
| E-2   | skill:docs:generate | `await window.electronAPI.skill.generateDocs({ skillName: "" })` を実行                                   | P42バリデーションエラー（"skillName must be a non-empty string" 相当のメッセージ） |
| E-3   | skill:docs:generate | `await window.electronAPI.skill.generateDocs({ skillName: "   " })` を実行                                | P42バリデーションエラー（空文字列と同じエラーメッセージ）                          |
| E-4   | skill:docs:preview  | `await window.electronAPI.skill.previewDocs({ skillName: "" })` を実行                                    | P42バリデーションエラー                                                            |
| E-5   | skill:docs:export   | `await window.electronAPI.skill.exportDocs({ doc: generatedDoc, outputPath: "../../etc/passwd" })` を実行 | パストラバーサル検証エラー（書き込みが拒否される）                                 |
| E-6   | skill:docs:generate | `await window.electronAPI.skill.generateDocs()` を実行                                                    | バリデーションエラー（引数が必要であることを示すメッセージ）                       |

**エラーレスポンス確認ポイント**:

- [ ] エラーメッセージにファイルの絶対パス（例: `/Users/...`）が含まれていない
- [ ] エラーメッセージにスタックトレースが含まれていない
- [ ] エラーオブジェクトに `code` フィールドがある（例: `VALIDATION_ERROR`）
- [ ] sanitizeErrorMessage による内部情報マスクが機能している

**期待される成果物**:

- `outputs/phase-11/functional-error-test-result.md`

---

### タスク4: 統合テスト

**目的**: 複数のIPC呼び出しを組み合わせたフローの正常動作を確認する

**テストケーステーブル**:

| TC-ID | テスト項目                 | 操作手順                                           | 期待結果                                                            |
| ----- | -------------------------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| I-1   | generate → export フロー   | F-1のgenerateで取得したdocをF-5のexportに渡す      | エクスポートが成功し、ファイル内容がgenerateの結果と一致する        |
| I-2   | templates → preview フロー | F-2で取得したテンプレートの1つをF-4のpreviewに渡す | 指定テンプレートのセクション構成でプレビューが返る                  |
| I-3   | 連続呼び出し安定性         | F-1のgenerateを5回連続で実行する                   | 5回全てで正常なレスポンスが返る（エラーやメモリリークの兆候がない） |

**I-1 詳細手順**:

1. まずドキュメントを生成する:
   ```javascript
   const doc = await window.electronAPI.skill.generateDocs({
     skillName: "test-skill",
     language: "ja",
   });
   ```
2. 生成したドキュメントをエクスポートする:
   ```javascript
   await window.electronAPI.skill.exportDocs({
     doc: doc,
     outputPath: "/tmp/test-integration-doc.md",
   });
   ```
3. エクスポートが正常に完了する（エラーが返らない）ことを確認する

**期待される成果物**:

- `outputs/phase-11/integration-test-result.md`

---

### タスク5: リグレッションテスト

**目的**: docs機能の追加が既存のskill API機能に影響を与えていないことを確認する

**テストケーステーブル**:

| TC-ID | テスト項目                                 | 操作手順                                                         | 期待結果                                                     |
| ----- | ------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| R-1   | 既存skill:list機能への影響なし             | `await window.electronAPI.skill.getSkills()` を実行              | 既存のスキル一覧が正常に返る                                 |
| R-2   | 既存skill:import機能への影響なし           | 既存のスキルインポート操作を実行                                 | インポートが正常に動作する                                   |
| R-3   | SkillDocsハンドラーの関数存在確認          | DevToolsで `typeof window.electronAPI.skill.generateDocs` を確認 | typeof が "function" である                                  |
| R-4   | エラーレスポンスにパス情報が含まれないこと | E-1〜E-6の全エラーレスポンスを確認                               | エラーメッセージに絶対パスやスタックトレースが含まれていない |

**期待される成果物**:

- `outputs/phase-11/regression-test-result.md`

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

| 参照資料                    | パス                                                             | 内容                     |
| --------------------------- | ---------------------------------------------------------------- | ------------------------ |
| SkillDocGenerator実装       | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`      | ドキュメント生成サービス |
| IPCハンドラー実装           | `apps/desktop/src/main/ipc/skillHandlers.ts`                     | Main Processハンドラー   |
| Preload API                 | `apps/desktop/src/preload/skill-api.ts`                          | Preload API実装          |
| 型定義                      | `packages/shared/src/types/skill-docs.ts`                        | ドキュメント型定義       |
| テストファイル              | `apps/desktop/src/main/services/skill/SkillDocGenerator.test.ts` | テストコード             |
| IPCテストファイル           | `apps/desktop/src/main/ipc/skillHandlers.docs.test.ts`           | IPCテスト                |
| Phase 1要件仕様             | `outputs/phase-1/`                                               | 要件                     |
| Phase 2設計仕様             | `outputs/phase-2/`                                               | 設計成果物               |
| Phase 5実装（サービス）     | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`      | 実装成果物               |
| Phase 5実装（IPC）          | `apps/desktop/src/main/ipc/skillHandlers.ts`                     | 実装成果物               |
| Phase 6カバレッジ分析       | `outputs/phase-6/coverage-report.md`                             | 追加テストの根拠         |
| Phase 6統合テスト結果       | `outputs/phase-6/integration-test.md`                            | 追加テスト結果           |
| Phase 7カバレッジ結果       | `outputs/phase-7/coverage-report.md`                             | カバレッジ最終判定       |
| Phase 7統合テスト結果       | `outputs/phase-7/integration-test.md`                            | 再実行結果               |
| Phase 8リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                             | 構造変更履歴             |
| Phase 9品質結果             | `outputs/phase-9/quality-gate-result.md`                         | 品質保証結果             |
| Phase 10成果物              | `outputs/phase-10/final-review-result.md`                        | 最終レビュー結果         |
| セキュリティルール          | `.claude/rules/04-electron-security.md`                          | セキュリティ基準         |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                        | 内容                                       |
| ------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| API IPC仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPCチャネル命名、引数契約、戻り値契約      |
| Skillインターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Renderer-Preload-Main間のSkill API契約     |
| Electron APIセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridge、ホワイトリスト、公開API制約 |
| Electron IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | ipcMain.handle/on運用差分、Sender検証      |
| Skill IPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | safeInvoke/safeOn運用、Skill API防御       |
| 入力バリデーション仕様   | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`            | P42 準拠の入力検証                         |
| IPC契約チェックリスト    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P23/P32/P42/P44/P45検証                    |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC拡張とPreload API設計                   |
| Electronサービス設計     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main Process責務分離                       |
| エラーハンドリング       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | IPC失敗時のエラー契約                      |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                        | P5/P32/P44/P45再発防止                     |
| 教訓集                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 同種タスク失敗例と予防策                   |

---

## 成果物

| 成果物                   | パス                                                | 内容                               |
| ------------------------ | --------------------------------------------------- | ---------------------------------- |
| 自動テスト結果           | `outputs/phase-11/auto-test-result.md`              | テスト実行結果                     |
| 機能テスト結果（正常系） | `outputs/phase-11/functional-normal-test-result.md` | F-1〜F-5の正常系テスト結果         |
| 機能テスト結果（異常系） | `outputs/phase-11/functional-error-test-result.md`  | E-1〜E-6の異常系テスト結果         |
| 統合テスト結果           | `outputs/phase-11/integration-test-result.md`       | I-1〜I-3の統合テスト結果           |
| リグレッションテスト結果 | `outputs/phase-11/regression-test-result.md`        | R-1〜R-4のリグレッションテスト結果 |
| 発見課題                 | `outputs/phase-11/discovered-issues.md`             | 課題一覧                           |

---

## 統合テスト連携

> Electron環境での手動動作確認

| 確認項目                     | 基準                                                   |
| ---------------------------- | ------------------------------------------------------ |
| 全4チャネル正常動作          | skill:docs:generate, preview, export, templates        |
| 正常系テスト全件PASS         | F-1〜F-5の5件全てが期待結果と一致                      |
| 異常系テスト全件PASS         | E-1〜E-6の6件全てが期待結果と一致                      |
| 統合テスト全件PASS           | I-1〜I-3の3件全てが期待結果と一致                      |
| リグレッションテスト全件PASS | R-1〜R-4の4件全てが期待結果と一致                      |
| バリデーション（P42準拠）    | 空文字・スペースのみが全て拒否される                   |
| エラーサニタイズ             | 全エラーレスポンスで内部情報が漏洩しない               |
| パストラバーサル防止         | exportハンドラーでディレクトリトラバーサルが拒否される |

---

## 多角的チェック観点

| 観点               | 適用判断                   | 仕様参照先                                                               |
| ------------------ | -------------------------- | ------------------------------------------------------------------------ |
| セキュリティ       | 必須（手動で境界動作確認） | `aiworkflow-requirements: security-electron-ipc.md`                      |
| 入力バリデーション | 必須（空文字/空白検証）    | `aiworkflow-requirements: security-input-validation.md`                  |
| IPC契約整合        | 必須（引数/戻り値確認）    | `aiworkflow-requirements: api-ipc-agent.md`, `ipc-contract-checklist.md` |
| エラーハンドリング | 必須（ユーザー面の挙動）   | `aiworkflow-requirements: error-handling.md`                             |
| 回帰安全性         | 必須（既存機能非破壊）     | `aiworkflow-requirements: architecture-implementation-patterns.md`       |

### Electronデスクトップアプリ観点

| 層                         | 適用判断                     | 仕様参照先                                           |
| -------------------------- | ---------------------------- | ---------------------------------------------------- |
| フロントエンド（Renderer） | 非該当（UI実装は別タスク）   | -                                                    |
| バックエンド（Main）       | 必須（ハンドラー実動作確認） | `aiworkflow-requirements: arch-electron-services.md` |
| IPC通信                    | 必須（4チャネルの疎通確認）  | `aiworkflow-requirements: api-ipc-agent.md`          |
| Preload/セキュリティ       | 必須（公開APIの境界確認）    | `aiworkflow-requirements: security-api-electron.md`  |
| ローカルストレージ         | 非該当（DB変更なし）         | -                                                    |

---

## テスト結果サマリーテンプレート

### 正常系テスト

| TC-ID | テスト項目                       | 結果 | 備考 |
| ----- | -------------------------------- | ---- | ---- |
| F-1   | ドキュメント生成                 | -    | -    |
| F-2   | テンプレート一覧取得             | -    | -    |
| F-3   | プレビュー生成                   | -    | -    |
| F-4   | カスタムテンプレートでプレビュー | -    | -    |
| F-5   | ドキュメントエクスポート         | -    | -    |

### 異常系テスト

| TC-ID | テスト項目                        | 結果 | 備考 |
| ----- | --------------------------------- | ---- | ---- |
| E-1   | 存在しないスキル名でgenerate      | -    | -    |
| E-2   | 空文字列のskillNameでgenerate     | -    | -    |
| E-3   | スペースのみのskillNameでgenerate | -    | -    |
| E-4   | 空文字列のskillNameでpreview      | -    | -    |
| E-5   | 不正なoutputPathでexport          | -    | -    |
| E-6   | 引数なしでgenerate                | -    | -    |

### 統合テスト

| TC-ID | テスト項目                 | 結果 | 備考 |
| ----- | -------------------------- | ---- | ---- |
| I-1   | generate → export フロー   | -    | -    |
| I-2   | templates → preview フロー | -    | -    |
| I-3   | 連続呼び出し安定性         | -    | -    |

### リグレッションテスト

| TC-ID | テスト項目                                 | 結果 | 備考 |
| ----- | ------------------------------------------ | ---- | ---- |
| R-1   | 既存skill:list機能への影響なし             | -    | -    |
| R-2   | 既存skill:import機能への影響なし           | -    | -    |
| R-3   | SkillDocsハンドラーの関数存在確認          | -    | -    |
| R-4   | エラーレスポンスにパス情報が含まれないこと | -    | -    |

### 総合結果

| 区分                | 件数   | PASS | FAIL |
| ------------------- | ------ | ---- | ---- |
| 正常系テスト（F）   | 5      | -    | -    |
| 異常系テスト（E）   | 6      | -    | -    |
| 統合テスト（I）     | 3      | -    | -    |
| リグレッション（R） | 4      | -    | -    |
| **合計**            | **18** | -    | -    |

---

## 完了条件

- [ ] 自動テストが全てパスしている
- [ ] 正常系テスト5件（F-1〜F-5）の実行結果が全て記録されている
- [ ] 異常系テスト6件（E-1〜E-6）の実行結果が全て記録されている
- [ ] 統合テスト3件（I-1〜I-3）の実行結果が全て記録されている
- [ ] リグレッションテスト4件（R-1〜R-4）の実行結果が全て記録されている
- [ ] 全テストケース（18件）でPASS/FAIL判定が記録されている
- [ ] FAIL判定のテストケースがゼロである（FAILがある場合は修正後に再テスト）
- [ ] エラーレスポンスに内部パス・スタックトレースが含まれていないことが確認されている
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

`docs/30-workflows/TASK-9I-skill-docs/phase-12-documentation.md`
