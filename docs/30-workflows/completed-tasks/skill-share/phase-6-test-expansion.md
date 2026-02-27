# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase 番号 | 6                                                              |
| Phase 名   | テスト拡充                                                     |
| 目的       | カバレッジ不足箇所の特定と統合テスト・エッジケーステストの追加 |
| 前提 Phase | Phase 5（実装）                                                |
| 後続 Phase | Phase 7（カバレッジ確認）                                      |
| ステータス | 未実施                                                         |
| 作成日     | 2026-02-27                                                     |
| 機能名     | skill-share                                                    |

## 目的

Phase 5 の実装完了後、カバレッジ計測で不足している箇所（分岐網羅・関数網羅）を特定し、統合テストとエッジケーステストを追加する。Phase 7 のカバレッジ基準（Line ≥ 80%, Branch ≥ 60%, Function ≥ 80%）を達成するための基盤テストを作成する。

## 実行タスク

- カバレッジ計測と不足箇所の特定: v8 カバレッジプロバイダで計測し、不足箇所を一覧化する
- エッジケーステストの追加: ネットワークエラー・タイムアウト・権限不足のテスト追加
- 統合テストの作成: IPC → SkillShareManager → fs/API の結合テスト作成
- 並行処理テストの追加: 同時インポート・エクスポートの競合テスト作成
- カバレッジレポート・統合テスト結果の文書化: outputs/phase-6/ 配下にレポートを作成

## 参照資料

| 参照資料             | パス                                                                                        | 内容                         |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ・リトライ可否 |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 統合テストパターン           |
| 06-known-pitfalls.md | `.claude/rules/06-known-pitfalls.md`                                                        | P41（v8 カバレッジ注意点）   |
| Phase 4 テスト仕様   | `outputs/phase-4/test-specification.md`                                                     | モック戦略・テスト分類       |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md`                                                 | 実装コードの構造             |

## システム仕様（aiworkflow-requirements）

| 仕様書                                    | 参照目的                                          |
| ----------------------------------------- | ------------------------------------------------- |
| `error-handling.md`                       | External Service Error（3000-3999）のリトライ戦略 |
| `architecture-implementation-patterns.md` | 統合テストでの DI モック構成パターン              |
| `quality-requirements.md`                 | カバレッジ・統合テスト品質基準                    |

## 実行手順

### T6-1: カバレッジ計測と不足箇所の特定

1. v8 カバレッジプロバイダで SkillShareManager のカバレッジを計測する:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillShareManager.test.ts --coverage
```

2. IPC ハンドラテストのカバレッジを計測する:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.share.test.ts --coverage
```

3. 以下の指標で不足箇所を特定する:

| 指標              | 最低基準 | 推奨基準 | 不足時の対応               |
| ----------------- | -------- | -------- | -------------------------- |
| Line Coverage     | 80%      | 90%      | 未実行行のテストケース追加 |
| Branch Coverage   | 60%      | 70%      | 条件分岐の網羅テスト追加   |
| Function Coverage | 80%      | 90%      | 未呼び出し関数のテスト追加 |

4. P41 対策: インライン arrow function（例: `getAllowedWindows: () => [mainWindow]`）がカバレッジに含まれることを考慮し、セキュリティテストでコールバックの戻り値を明示的に検証する

5. 不足箇所を一覧表として `outputs/phase-6/coverage-report.md` に記録する

### T6-2: エッジケーステストの追加

テストファイル: `apps/desktop/src/main/services/skill/__tests__/SkillShareManager.test.ts` に追記

#### ネットワークエラー系

```typescript
describe("ネットワークエラーハンドリング", () => {
  it("GitHub API が 403 (rate limit) を返す場合 External Service Error を返す", async () => {});
  it("GitHub API が 500 を返す場合 External Service Error を返す", async () => {});
  it("Gist API が 404 を返す場合 External Service Error を返す", async () => {});
  it("fetch が AbortError をスローする場合タイムアウトエラーを返す", async () => {});
  it("fetch が TypeError をスローする場合ネットワークエラーを返す", async () => {});
  it("Octokit コンストラクタに無効なトークンを渡した場合 401 エラーを返す", async () => {});
});
```

#### ファイルシステムエラー系

```typescript
describe("ファイルシステムエラーハンドリング", () => {
  it("ローカルインポート元のディレクトリが読み取り不可の場合エラーを返す", async () => {});
  it("エクスポート先ディレクトリの親が存在しない場合ディレクトリを作成する", async () => {});
  it("エクスポート先ディレクトリに同名スキルが存在する場合上書きする", async () => {});
  it("ディスク容量不足（ENOSPC）の場合 Infrastructure Error を返す", async () => {});
});
```

#### データ不正系

```typescript
describe("データ不正ハンドリング", () => {
  it("GitHub API レスポンスが想定外の形式の場合エラーを返す", async () => {});
  it("Gist の内容がバイナリファイルのみの場合エラーを返す", async () => {});
  it("URL レスポンスが Content-Type: text/html の場合エラーを返す", async () => {});
  it("SKILL.md が 1MB を超える場合エラーを返す", async () => {});
});
```

### T6-3: 統合テストの作成

テストファイル: `apps/desktop/src/main/services/skill/__tests__/SkillShareManager.integration.test.ts`（新規作成）

```typescript
describe("SkillShareManager 統合テスト", () => {
  describe("IPC → SkillShareManager → fs 結合", () => {
    it("skill:importFromSource ハンドラ経由で GitHub インポートが完了する", async () => {});
    it("skill:export ハンドラ経由で Gist エクスポートが完了する", async () => {});
    it("skill:validateSource ハンドラ経由でローカルソース検証が完了する", async () => {});
  });

  describe("インポート → 検証 → エクスポートのフロー", () => {
    it("GitHub からインポートしたスキルをローカルにエクスポートできる", async () => {});
    it("URL からインポートしたスキルを Gist にエクスポートできる", async () => {});
  });

  describe("既存 skill:import との共存", () => {
    it("skill:importFromSource と skill:import が同時に登録されていても競合しない", async () => {});
    it("skill:importFromSource でインポートしたスキルが skill:getImported で取得できる", async () => {});
  });
});
```

統合テストでのモック構成:

- Octokit: モジュールモック（レスポンスは実 API 構造に準拠）
- fetch: グローバルモック
- fs: **実ファイルシステムを使用**（`os.tmpdir()` 配下に一時ディレクトリを作成し、`afterEach` で削除）
- SkillService: 実インスタンス（SkillShareManager を Setter Injection で注入）

### T6-4: 並行処理テストの追加

テストファイル: `apps/desktop/src/main/services/skill/__tests__/SkillShareManager.test.ts` に追記

```typescript
describe("並行処理", () => {
  it("同時に 2 件のインポートを実行しても両方成功する", async () => {
    // Promise.all で 2 件のインポートを同時実行
  });

  it("同時にインポートとエクスポートを実行しても競合しない", async () => {
    // Promise.all でインポートとエクスポートを同時実行
  });

  it("同一スキルの同時インポートは最初の 1 件のみ成功する", async () => {
    // 排他制御のテスト（ファイルロック等）
  });
});
```

### T6-5: カバレッジレポート・統合テスト結果の文書化

1. `outputs/phase-6/coverage-report.md` に以下を記録する:
   - 計測日時
   - Phase 5 時点のカバレッジ値（Line / Branch / Function）
   - 不足箇所の一覧（ファイル名・行番号・未カバー理由）
   - 追加したテストケースの一覧と追加後のカバレッジ値

2. `outputs/phase-6/integration-test.md` に以下を記録する:
   - 統合テストの実行結果（パス / 失敗）
   - テスト環境の構成（モック / 実ファイルシステムの区分）
   - 発見した問題点と対応

## 成果物

| 成果物                     | パス                                                                                   | 種別   |
| -------------------------- | -------------------------------------------------------------------------------------- | ------ |
| カバレッジレポート         | `outputs/phase-6/coverage-report.md`                                                   | 文書   |
| 統合テスト結果             | `outputs/phase-6/integration-test.md`                                                  | 文書   |
| エッジケーステスト（追記） | `apps/desktop/src/main/services/skill/__tests__/SkillShareManager.test.ts`             | コード |
| 統合テスト                 | `apps/desktop/src/main/services/skill/__tests__/SkillShareManager.integration.test.ts` | コード |

## 統合テスト連携

- 統合テストファイル（`SkillShareManager.integration.test.ts`）はユニットテストファイルとは別に配置し、実行時間が長いテストを分離する
- 統合テストでは `os.tmpdir()` 配下に一時ディレクトリを作成し、テスト後に確実に削除する（`afterEach` / `afterAll`）
- 既存テスト（`SkillService.test.ts`, `SkillImportManager.test.ts`）のモック構成に影響を与えないことを確認する

## 完了条件

- [ ] カバレッジ計測が完了し、不足箇所が一覧化されている
- [ ] ネットワークエラー系テスト（6 件以上）が追加されている
- [ ] ファイルシステムエラー系テスト（4 件以上）が追加されている
- [ ] データ不正系テスト（4 件以上）が追加されている
- [ ] 統合テストファイル（`SkillShareManager.integration.test.ts`）が作成されている
- [ ] 統合テスト（7 件以上）が全件パスしている
- [ ] 並行処理テスト（3 件以上）が追加されている
- [ ] 追加した全テストがパスしている: `cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillShareManager`（P40 対策）
- [ ] 既存テストに影響がないことを確認済み
- [ ] P41 対策: インライン arrow function のカバレッジを考慮したテストが含まれている
- [ ] `outputs/phase-6/coverage-report.md` が作成されている
- [ ] `outputs/phase-6/integration-test.md` が作成されている
- [ ] テスト間で状態を共有していない（P9 対策: `beforeEach` でリセット）

## スキル 100%実行確認【必須】

- [ ] 全テストがパスすることを確認: `cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/`
- [ ] IPC ハンドラテストがパスすることを確認: `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.share.test.ts`
- [ ] 型チェックが成功することを確認: `pnpm --filter @repo/desktop exec tsc --noEmit`
- [ ] 統合テストの一時ディレクトリが確実に削除されていることを確認

## 次の Phase

Phase 7: カバレッジ確認 — `phase-7-coverage-check.md`

## 備考

- カバレッジ計測は v8 プロバイダを使用する（Vitest デフォルト設定に従う）
- P41 に記載のとおり、インライン arrow function は独立した関数としてカウントされるため、Function Coverage が低く出る場合がある。validateIpcSender のオプション内コールバックを明示的にテストで呼び出すことで対応する
- 統合テストで実ファイルシステムを使用する理由: SkillShareManager の fs 操作（cp, mkdir, readdir）が正しくファイルを配置するかを検証するため。モックでは検出できないパス解決の問題を捕捉する
- 統合テストの実行時間が長い場合（10 秒以上）、`describe.concurrent` での並列実行を検討する
