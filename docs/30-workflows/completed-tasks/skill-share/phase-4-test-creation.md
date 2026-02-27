# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase 番号 | 4                                                           |
| Phase 名   | テスト作成（TDD: Red）                                      |
| 目的       | SkillShareManager と IPC ハンドラの全テストを失敗状態で作成 |
| 前提 Phase | Phase 3（設計レビュー）                                     |
| 後続 Phase | Phase 5（実装）                                             |
| ステータス | 未実施                                                      |
| 作成日     | 2026-02-27                                                  |
| 機能名     | skill-share                                                 |

## 目的

TASK-9F「スキル共有・インポート機能」の TDD Red フェーズとして、SkillShareManager の 4 種ソースインポート・2 種エクスポート・バリデーション、および 3 つの IPC ハンドラに対するユニットテストを **全件失敗状態（Red）** で作成する。実装コードは Phase 5 で行うため、本 Phase ではテストコードのみを成果物とする。

## 実行タスク

- テスト戦略設計: モック戦略・テスト分類・カバレッジ目標の設計
- SkillShareManager ユニットテスト作成: import/export/validateImport の全テストケース作成
- IPC ハンドラテスト作成: 3 チャネルのバリデーション・Sender 検証テスト作成
- 境界値・異常系テスト作成: 空文字列・超長文字列・不正型のエッジケーステスト作成
- テスト仕様書・テストケース一覧の文書化: outputs/phase-4/ 配下にテスト仕様書を作成

## 参照資料

| 参照資料             | パス                                                                                        | 内容                       |
| -------------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 要件定義     | `docs/30-workflows/skill-share/phase-1-requirements.md`                                     | FR/NFRと受け入れ基準       |
| Phase 2 設計         | `docs/30-workflows/skill-share/phase-2-design.md`                                           | アーキテクチャ・型定義設計 |
| Phase 3 設計レビュー | `docs/30-workflows/skill-share/phase-3-design-review.md`                                    | レビュー指摘と修正観点     |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Handler Map 方式テスト     |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ・コード範囲 |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | バリデーション仕様         |
| 既存 skillHandlers   | `apps/desktop/src/main/ipc/skillHandlers.share.ts`                                          | 既存 IPC ハンドラの実装例  |
| 既存テスト例         | `apps/desktop/src/main/services/skill/__tests__/`                                           | 既存 Skill テストの構造    |
| 06-known-pitfalls.md | `.claude/rules/06-known-pitfalls.md`                                                        | P9, P39, P40, P42 対策     |

## システム仕様（aiworkflow-requirements）

| 仕様書                                    | 参照目的                                                     |
| ----------------------------------------- | ------------------------------------------------------------ |
| `error-handling.md`                       | エラーカテゴリ（Validation: 1000-1999, External: 3000-3999） |
| `security-skill-ipc.md`                   | P42 準拠 3 段バリデーション仕様                              |
| `architecture-implementation-patterns.md` | Handler Map 方式のテストパターン                             |
| `ipc-contract-checklist.md`               | IPC 契約検証の Phase 1-6 手順                                |
| `interfaces-agent-sdk-skill.md`           | ShareTarget/ImportResult/ExportResult の型境界検証           |

## 実行手順

### T4-1: テスト戦略設計

1. テストファイル配置先を決定する
   - `apps/desktop/src/main/services/skill/__tests__/SkillShareManager.test.ts`
   - `apps/desktop/src/main/ipc/__tests__/skillHandlers.share.test.ts`
2. 外部 API モック戦略を定義する
   - **Octokit**: `vi.mock("@octokit/rest")` でモジュールモック化し、`repos.getContent` / `gists.create` / `gists.get` をスタブ化する
   - **fetch**: `vi.stubGlobal("fetch")` でグローバルモック化し、`Response` オブジェクトを返す
   - **fs**: `vi.mock("node:fs/promises")` で `cp`, `readdir`, `readFile`, `stat`, `mkdir` をスタブ化する
3. テスト間状態リセット方針を決定する
   - 各 `describe` ブロックの `beforeEach` で全モックを `vi.resetAllMocks()` する（P9 対策）
   - モジュールスコープ変数を使用しない

### T4-2: SkillShareManager ユニットテスト作成

テストファイル: `apps/desktop/src/main/services/skill/__tests__/SkillShareManager.test.ts`

#### import テスト（4 種ソース別）

```typescript
describe("SkillShareManager", () => {
  describe("import", () => {
    describe("GitHub リポジトリからのインポート", () => {
      it("有効なリポジトリ・パスからスキルをインポートし ImportResult を返す", async () => {});
      it("リポジトリが存在しない場合 External Service Error（ERR_3001）を返す", async () => {});
      it("リポジトリに SKILL.md が存在しない場合 Business Error（ERR_2003）を返す", async () => {});
      it("ブランチ指定がある場合そのブランチからファイルを取得する", async () => {});
      it("path 指定がある場合そのディレクトリ配下を取得する", async () => {});
    });

    describe("Gist からのインポート", () => {
      it("有効な gistId からスキルをインポートし ImportResult を返す", async () => {});
      it("Gist が存在しない場合 External Service Error（ERR_3001）を返す", async () => {});
      it("Gist に SKILL.md が含まれない場合 Business Error（ERR_2003）を返す", async () => {});
    });

    describe("ローカルディレクトリからのインポート", () => {
      it("有効なローカルパスからスキルをインポートし ImportResult を返す", async () => {});
      it("ディレクトリが存在しない場合 Infrastructure Error（ERR_4002）を返す", async () => {});
      it("パストラバーサルを含むパスを拒否し Validation Error（ERR_1003）を返す", async () => {});
      it("SKILL.md が存在しないディレクトリを拒否し Business Error（ERR_2003）を返す", async () => {});
    });

    describe("URL からのインポート", () => {
      it("有効な URL から SKILL.md を取得しインポートする", async () => {});
      it("URL が 404 を返す場合 External Service Error（ERR_3001）を返す", async () => {});
      it("レスポンスが SKILL.md 形式でない場合 Validation Error（ERR_1002）を返す", async () => {});
      it("ネットワークタイムアウト時 External Service Error（ERR_3002）を返す", async () => {});
    });
  });
});
```

#### export テスト（2 種宛先別）

```typescript
describe("export", () => {
  describe("Gist へのエクスポート", () => {
    it("スキルを Gist にエクスポートし shareUrl を含む ExportResult を返す", async () => {});
    it("GitHub トークンが未設定の場合 Business Error（ERR_2005）を返す", async () => {});
    it("Gist API がエラーを返す場合 External Service Error（ERR_3001）を返す", async () => {});
  });

  describe("ローカルへのエクスポート", () => {
    it("スキルをローカルディレクトリにエクスポートし ExportResult を返す", async () => {});
    it("宛先ディレクトリが書き込み不可の場合 Infrastructure Error（ERR_4003）を返す", async () => {});
    it("存在しないスキル名を指定した場合 Business Error（ERR_2003）を返す", async () => {});
  });
});
```

#### validateImport テスト

```typescript
describe("validateImport", () => {
  it("SKILL.md を含む有効なディレクトリ構造を承認する", async () => {});
  it("SKILL.md が存在しないディレクトリを拒否する", async () => {});
  it("SKILL.md の必須セクション（# で始まるタイトル）がない場合拒否する", async () => {});
  it("空の SKILL.md を拒否する", async () => {});
});
```

### T4-3: IPC ハンドラテスト作成

テストファイル: `apps/desktop/src/main/ipc/__tests__/skillHandlers.share.test.ts`

#### skill:importFromSource ハンドラテスト

```typescript
describe("skill:importFromSource ハンドラ", () => {
  describe("バリデーション（P42 準拠 3 段）", () => {
    it("source が undefined の場合 VALIDATION_ERROR を返す", async () => {});
    it("source.type が string でない場合 VALIDATION_ERROR を返す", async () => {});
    it("source.type が空文字列の場合 VALIDATION_ERROR を返す", async () => {});
    it("source.type がスペースのみの場合 VALIDATION_ERROR を返す", async () => {});
    it("source.type が許可値（github/gist/local/url）以外の場合 VALIDATION_ERROR を返す", async () => {});
  });

  describe("Sender 検証", () => {
    it("不正な送信元ウィンドウからのリクエストを拒否する", async () => {});
  });

  describe("正常系", () => {
    it("有効な ShareTarget を渡すと SkillShareManager.import() を呼び出す", async () => {});
  });
});
```

#### skill:export ハンドラテスト

```typescript
describe("skill:export ハンドラ", () => {
  describe("バリデーション（P42 準拠 3 段）", () => {
    it("skillName が undefined の場合 VALIDATION_ERROR を返す", async () => {});
    it("skillName が空文字列の場合 VALIDATION_ERROR を返す", async () => {});
    it("skillName がスペースのみの場合 VALIDATION_ERROR を返す", async () => {});
    it("destination が undefined の場合 VALIDATION_ERROR を返す", async () => {});
    it("destination.type が許可値（gist/local）以外の場合 VALIDATION_ERROR を返す", async () => {});
  });

  describe("Sender 検証", () => {
    it("不正な送信元ウィンドウからのリクエストを拒否する", async () => {});
  });

  describe("正常系", () => {
    it("有効な引数を渡すと SkillShareManager.export() を呼び出す", async () => {});
  });
});
```

#### skill:validateSource ハンドラテスト

```typescript
describe("skill:validateSource ハンドラ", () => {
  describe("バリデーション（P42 準拠 3 段）", () => {
    it("source が undefined の場合 VALIDATION_ERROR を返す", async () => {});
    it("source.type が string でない場合 VALIDATION_ERROR を返す", async () => {});
    it("source.type がスペースのみの場合 VALIDATION_ERROR を返す", async () => {});
  });

  describe("正常系", () => {
    it("有効な ShareTarget を渡すと検証結果を返す", async () => {});
  });
});
```

### T4-4: 境界値・異常系テスト作成

以下を T4-2 および T4-3 のテストファイル内に追加する:

| カテゴリ         | テストケース                               | 期待結果                     |
| ---------------- | ------------------------------------------ | ---------------------------- |
| 空文字列         | `source.type = ""`                         | VALIDATION_ERROR             |
| スペースのみ     | `source.type = "   "`（P42 対策）          | VALIDATION_ERROR             |
| 超長文字列       | `source.repo` に 10,000 文字の文字列を渡す | VALIDATION_ERROR             |
| 不正な型         | `source` に `number` 型（42）を渡す        | VALIDATION_ERROR             |
| null 値          | `source` に `null` を渡す                  | VALIDATION_ERROR             |
| 不正 ShareTarget | `source.type = "ftp"`（許可値以外）        | VALIDATION_ERROR             |
| パストラバーサル | `source.localPath = "../../etc/passwd"`    | VALIDATION_ERROR（ERR_1003） |
| 空オブジェクト   | `source = {}`                              | VALIDATION_ERROR             |

### T4-5: テスト仕様書・テストケース一覧の文書化

1. `outputs/phase-4/test-specification.md` にテスト戦略・モック方針・テスト分類を記述する
2. `outputs/phase-4/test-cases.md` に全テストケースの一覧表を作成する

## 成果物

| 成果物                   | パス                                                                       | 種別   |
| ------------------------ | -------------------------------------------------------------------------- | ------ |
| テスト仕様書             | `outputs/phase-4/test-specification.md`                                    | 文書   |
| テストケース一覧         | `outputs/phase-4/test-cases.md`                                            | 文書   |
| SkillShareManager テスト | `apps/desktop/src/main/services/skill/__tests__/SkillShareManager.test.ts` | コード |
| IPC ハンドラテスト       | `apps/desktop/src/main/ipc/__tests__/skillHandlers.share.test.ts`          | コード |

## 統合テスト連携

- 本 Phase で作成するテストは Phase 5（実装）完了後に全件パス（Green）となることを検証する
- Phase 6（テスト拡充）で統合テスト・エッジケーステストを追加する
- IPC ハンドラテストは既存 `skillHandlers.test.ts` と分離した専用ファイルに配置し、既存テストへの影響を排除する

## 完了条件

- [ ] `SkillShareManager.test.ts` が作成され、26 件以上のテストケースが定義されている
- [ ] `skillHandlers.share.test.ts` が作成され、18 件以上のテストケースが定義されている
- [ ] 全テストが `describe` / `it` ブロックで構造化されている
- [ ] 全テストが失敗状態（Red）であることを `cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillShareManager.test.ts` で確認済み（P40 対策）
- [ ] 全テストが失敗状態（Red）であることを `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.share.test.ts` で確認済み
- [ ] モック戦略が `vi.mock` / `vi.stubGlobal` で統一されている
- [ ] 各 `describe` ブロックの `beforeEach` で `vi.resetAllMocks()` が呼ばれている（P9 対策）
- [ ] P42 準拠 3 段バリデーションテスト（型チェック → 空文字列 → トリム空文字列）が全 IPC ハンドラに対して作成されている
- [ ] パストラバーサル攻撃のテストケースが含まれている
- [ ] `outputs/phase-4/test-specification.md` が作成されている
- [ ] `outputs/phase-4/test-cases.md` が作成されている
- [ ] `userEvent` を使用していない（P39 対策: happy-dom 環境では `fireEvent` を使用）

## スキル 100%実行確認【必須】

- [ ] テストファイルの構文エラーがないことを確認（`pnpm --filter @repo/desktop exec tsc --noEmit` で型チェック）
- [ ] テスト実行コマンドが正しく動作する（テストが「失敗」することを確認 — 「エラー」ではない）
- [ ] 既存テスト（`skillHandlers.test.ts`, `SkillService.test.ts` 等）に影響がないことを確認

## 次の Phase

Phase 5: 実装（TDD: Green） — `phase-5-implementation.md`

## 備考

- テストケース数は目安であり、実装時にエッジケースの追加が発生する場合は Phase 6 で対応する
- 外部 API（GitHub API, Gist API）のモックは実際の API レスポンス構造に準拠させる（Octokit 型定義を参照）
- テスト内で `console.log` / `console.warn` を使用しない（P20 対策）
- SkillShareManager のコンストラクタ DI 設計は Phase 5 で確定するため、テスト側ではモック注入のプレースホルダを用意する
