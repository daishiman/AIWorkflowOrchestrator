# Phase 4: テスト仕様書 — SkillShareManager ユニットテスト

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| タスクID   | TASK-9F                           |
| Phase      | 4A                                |
| 成果物     | テスト仕様書（SkillShareManager） |
| 作成日     | 2026-02-27                        |
| 機能名     | skill-share                       |
| ステータス | 完了（Red 状態）                  |

---

## 1. テスト戦略概要

### 目的

SkillShareManager の 3 つの公開メソッド（`importFromSource`, `exportSkill`, `validateSource`）に対して、正常系・異常系・境界値を網羅する 26 件のユニットテストを TDD Red フェーズとして作成する。

### アプローチ

- **TDD Red**: SkillShareManager.ts はまだ存在しない。テストファイルからの import が失敗するため、全テストが Red（失敗）状態となる
- **Given-When-Then**: テスト本体は具体的なモックセットアップ、メソッド呼び出し、expect アサーションを全て記述する
- **Result パターン**: 全メソッドが `Result<T, SkillShareError>` を返す設計に準拠し、`result.success` / `result.data` / `result.error` でアサーション

### テストファイル配置

| テストファイル                                                             | テスト件数 | 対象                     |
| -------------------------------------------------------------------------- | ---------- | ------------------------ |
| `apps/desktop/src/main/services/skill/__tests__/SkillShareManager.test.ts` | 26 件      | SkillShareManager クラス |

---

## 2. モック方針

### 2.1 DI モック（Constructor Injection）

SkillShareManager は 4 つの依存を Constructor Injection で受け取る設計（Phase 2 architecture-design.md 準拠）。テストでは各依存をモックオブジェクトとして注入する。

| 依存              | モック方式         | スタブ対象メソッド                                                                     |
| ----------------- | ------------------ | -------------------------------------------------------------------------------------- |
| GitHubClient      | オブジェクトモック | `getRepoContents`, `getGist`, `createGist`                                             |
| FileSystemAdapter | オブジェクトモック | `readFile`, `writeFile`, `readdir`, `stat`, `mkdir`, `cp`, `exists`, `resolveRealPath` |
| SkillValidator    | オブジェクトモック | `validateStructure`, `validateSkillMd`                                                 |
| SkillService      | オブジェクトモック | `scanAvailableSkills`, `getSkillByName`, `importManager`                               |

### 2.2 グローバルモック

| 対象         | モック方式                | 用途                             |
| ------------ | ------------------------- | -------------------------------- |
| electron-log | `vi.mock("electron-log")` | ログ出力抑制（P20 対策）         |
| fetch        | `vi.stubGlobal("fetch")`  | URL インポートのネットワーク制御 |

### 2.3 モック方針の根拠

- **Octokit を直接モックしない**: SkillShareManager は GitHubClient（Adapter）経由で Octokit を使用する。GitHubClient のインターフェースをモックすることで、Octokit の内部実装に依存しないテストを実現する
- **fs を直接モックしない**: FileSystemAdapter 経由で操作するため、Adapter のインターフェースをモックする
- **fetch のみグローバルモック**: URL インポートは UrlImportStrategy が直接 fetch を使用する設計のため、`vi.stubGlobal` で制御する

---

## 3. テスト分類

### 3.1 import テスト（16 件）

| カテゴリ             | テスト ID | テスト名                                                           | 期待結果                                 |
| -------------------- | --------- | ------------------------------------------------------------------ | ---------------------------------------- |
| GitHub リポジトリ    | SSM-IG-01 | 有効なリポジトリ・パスからスキルをインポートし ImportResult を返す | success: true                            |
| GitHub リポジトリ    | SSM-IG-02 | リポジトリが存在しない場合 External Service Error（ERR_3001）      | code: 3001                               |
| GitHub リポジトリ    | SSM-IG-03 | SKILL.md が存在しない場合 Business Error（ERR_2003）               | code: 2003                               |
| GitHub リポジトリ    | SSM-IG-04 | ブランチ指定がある場合そのブランチからファイルを取得する           | getRepoContents(_, _, "develop")         |
| GitHub リポジトリ    | SSM-IG-05 | path 指定がある場合そのディレクトリ配下を取得する                  | getRepoContents(_, "skills/my-skill", _) |
| Gist                 | SSM-IG-06 | 有効な gistId からスキルをインポートし ImportResult を返す         | success: true                            |
| Gist                 | SSM-IG-07 | Gist が存在しない場合 External Service Error（ERR_3001）           | code: 3001                               |
| Gist                 | SSM-IG-08 | SKILL.md が含まれない場合 Business Error（ERR_2003）               | code: 2003                               |
| ローカルディレクトリ | SSM-IL-01 | 有効なローカルパスからスキルをインポートし ImportResult を返す     | success: true                            |
| ローカルディレクトリ | SSM-IL-02 | ディレクトリが存在しない場合 Infrastructure Error（ERR_4002）      | code: 4002                               |
| ローカルディレクトリ | SSM-IL-03 | パストラバーサルを含むパスを拒否し Validation Error（ERR_1003）    | code: 1003                               |
| ローカルディレクトリ | SSM-IL-04 | SKILL.md が存在しない場合 Business Error（ERR_2003）               | code: 2003                               |
| URL                  | SSM-IU-01 | 有効な URL から SKILL.md を取得しインポートする                    | success: true                            |
| URL                  | SSM-IU-02 | URL が 404 を返す場合 External Service Error（ERR_3001）           | code: 3001                               |
| URL                  | SSM-IU-03 | SKILL.md 形式でない場合 Validation Error（ERR_1002）               | code: 1002                               |
| URL                  | SSM-IU-04 | ネットワークタイムアウト時 External Service Error（ERR_3002）      | code: 3002                               |

### 3.2 export テスト（6 件）

| カテゴリ          | テスト ID | テスト名                                                       | 期待結果        |
| ----------------- | --------- | -------------------------------------------------------------- | --------------- |
| Gist エクスポート | SSM-EG-01 | Gist にエクスポートし shareUrl を含む ExportResult を返す      | shareUrl が存在 |
| Gist エクスポート | SSM-EG-02 | GitHub トークンが未設定の場合 Business Error（ERR_2005）       | code: 2005      |
| Gist エクスポート | SSM-EG-03 | Gist API がエラーを返す場合 External Service Error（ERR_3001） | code: 3001      |
| ローカル          | SSM-EL-01 | ローカルディレクトリにエクスポートし ExportResult を返す       | success: true   |
| ローカル          | SSM-EL-02 | 書き込み不可の場合 Infrastructure Error（ERR_4003）            | code: 4003      |
| ローカル          | SSM-EL-03 | 存在しないスキル名を指定した場合 Business Error（ERR_2003）    | code: 2003      |

### 3.3 validateSource テスト（4 件）

| テスト ID | テスト名                                           | 期待結果                            |
| --------- | -------------------------------------------------- | ----------------------------------- |
| SSM-VS-01 | SKILL.md を含む有効なディレクトリ構造を承認する    | isReachable: true, hasSkillMd: true |
| SSM-VS-02 | SKILL.md が存在しないディレクトリを拒否する        | hasSkillMd: false                   |
| SSM-VS-03 | 必須セクション（# で始まるタイトル）がない場合拒否 | errors.length > 0                   |
| SSM-VS-04 | 空の SKILL.md を拒否する                           | errors.length > 0                   |

---

## 4. カバレッジ目標

| 指標              | 最低基準 | 推奨基準 | 備考                                    |
| ----------------- | -------- | -------- | --------------------------------------- |
| Line Coverage     | 80%      | 90%      | Phase 5 実装後に Phase 7 で確認         |
| Branch Coverage   | 60%      | 70%      | ShareTarget の全 type 分岐をカバー      |
| Function Coverage | 80%      | 90%      | 3 公開メソッド + 内部 Strategy 呼び出し |

---

## 5. テスト間状態リセット方針（P9 対策）

### ルール

- 各 `describe` ブロックの `beforeEach` で `vi.resetAllMocks()` を呼ぶ
- モジュールスコープ変数を使用しない
- `afterEach` で `vi.resetModules()` を呼び、モジュールキャッシュをクリアする
- `vi.stubGlobal("fetch", ...)` を使用した場合は `vi.unstubAllGlobals()` でクリーンアップする

### 実装パターン

```typescript
beforeEach(async () => {
  vi.resetAllMocks();
  // モック依存を再生成
  mockGitHubClient = { ... };
  mockFileSystem = { ... };
  mockSkillValidator = { ... };
  mockSkillService = { ... };
});

afterEach(() => {
  vi.resetModules();
});
```

---

## 6. エラーコードマッピング

| エラーコード | 名称                     | カテゴリ       | テスト対象メソッド                                |
| ------------ | ------------------------ | -------------- | ------------------------------------------------- |
| ERR_1001     | 無効なソースタイプ       | validation     | (IPC ハンドラ — 別テストファイル)                 |
| ERR_1002     | 無効なソースフォーマット | validation     | importFromSource (URL)                            |
| ERR_1003     | パストラバーサル検出     | validation     | importFromSource (local)                          |
| ERR_2003     | SKILL.md 未検出          | business       | importFromSource (全タイプ), exportSkill          |
| ERR_2005     | GitHub トークン未設定    | business       | exportSkill (Gist)                                |
| ERR_3001     | 外部サービスエラー       | external       | importFromSource (GitHub, Gist, URL), exportSkill |
| ERR_3002     | ネットワークタイムアウト | external       | importFromSource (URL)                            |
| ERR_4002     | ファイル未検出           | infrastructure | importFromSource (local)                          |
| ERR_4003     | ファイル書き込み失敗     | infrastructure | exportSkill (local)                               |

---

## 7. テスト実行方法

```bash
# P40 対策: apps/desktop ディレクトリから実行
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillShareManager.test.ts
```

Red フェーズでは SkillShareManager.ts が存在しないため、モジュール解決エラーで全テストが失敗する（これが正しい Red 状態）。

---

## 8. 既知の落とし穴対策

| Pitfall | 対策                                                       | テストでの適用箇所           |
| ------- | ---------------------------------------------------------- | ---------------------------- |
| P9      | `vi.resetAllMocks()` でテスト間状態リーク防止              | beforeEach                   |
| P20     | `vi.mock("electron-log")` でログ出力抑制                   | ファイルヘッダー             |
| P39     | `userEvent` を使用しない（本テストは Main Process テスト） | 該当なし                     |
| P40     | `cd apps/desktop` からテスト実行                           | テスト実行方法セクション参照 |
| P42     | 3 段バリデーション（typeof → === "" → .trim() === ""）     | パストラバーサルテスト       |
