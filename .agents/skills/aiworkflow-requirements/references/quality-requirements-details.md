# 非機能要件 / detail specification

> 親仕様書: [quality-requirements.md](quality-requirements.md)
> 役割: detail specification

## テスト戦略（TDD実践ガイド）

### Red-Green-Refactor サイクル

TDD（テスト駆動開発）は「Red-Green-Refactor」の3フェーズで進める。

**Phase 1: Red（失敗するテストを書く）**

まず実装が存在しない状態でテストを書く。テストは必ず失敗する（Red）。この段階で期待する振る舞いを明確に定義する。テストの構造はArrange-Act-Assertパターンに従い、テストデータの準備、実行、検証を明確に分離する。

**Phase 2: Green（最小限の実装で成功させる）**

テストを通過させるための最小限の実装を行う。この段階では「動くこと」を最優先し、コードの美しさは後回しにする。テストが成功（Green）したら次のフェーズへ進む。

**Phase 3: Refactor（品質向上）**

テストがグリーンの状態を維持しながら、コードの品質を向上させる。重複の除去、命名の改善、設計パターンの適用などを行う。リファクタリング後もテストが成功することを確認する。

**サイクル管理の指針**:

| 項目            | 指針                               |
| --------------- | ---------------------------------- |
| 1サイクルの目安 | 5-15分                             |
| 状態維持        | 常にグリーン状態を維持             |
| 振る舞い追加    | 1サイクルで1つの振る舞いだけを追加 |

### テストピラミッド（個人開発最適化版）

テストは「ピラミッド」構造で構築する。下層（Unit）が最も多く、上層（E2E）は最小限に抑える。

| レベル      | 割合 | 目標カバレッジ | 実行頻度     | 投資時間 |
| ----------- | ---- | -------------- | ------------ | -------- |
| Unit        | 80%  | 70-80%         | 毎回コミット | 60%      |
| Integration | 15%  | 50-60%         | 毎回push     | 25%      |
| E2E         | 5%   | 主要フロー     | CI/CD        | 15%      |

**優先すべきテスト対象**:

1. **必須（Unit 100%）**: ビジネスロジック、データ変換・計算処理、エラーハンドリング
2. **重要（Unit 80%）**: API Gateway層、リポジトリ実装、カスタムHooks
3. **推奨（Integration 60%）**: Reactコンポーネント（RTL）、IPC通信、外部API連携
4. **最小限（E2Eクリティカルパス）**: タスク作成・編集・削除、AI対話の基本フロー

### Vitest ユニットテスト構成

ユニットテストはVitestを使用する。テストファイルはソースコードと同じディレクトリ構造で`__tests__`配下に配置する。

**ファイル配置規則**:

| 配置先                   | 内容                   |
| ------------------------ | ---------------------- |
| `__tests__/unit/`        | ドメインモデルのテスト |
| `__tests__/integration/` | リポジトリ統合テスト   |

**テスト環境設定（TASK-3-2-F 2026-01-30実装、TASK-OPT-CI-TEST-PARALLEL-001 2026-02-02更新）**:

| 設定項目        | 推奨値                            | 理由                                               |
| --------------- | --------------------------------- | -------------------------------------------------- |
| environment     | jsdom                             | Clipboard API等の完全なDOM機能サポートが必要な場合 |
| environment     | happy-dom                         | 軽量で高速、基本的なDOM操作のみの場合              |
| pool            | forks                             | プロセス分離でテスト安定性向上                     |
| fileParallelism | CI: true / ローカル: 環境変数制御 | CI高速化、ローカルは安定性重視                     |

**並列化設定（TASK-OPT-CI-TEST-PARALLEL-001 2026-02-02実装）**:

| 設定項目        | CI値 | ローカル値                            | 理由                                  |
| --------------- | ---- | ------------------------------------- | ------------------------------------- |
| maxForks        | 4    | CPUコア数/2（最低2、最大8）           | CIはI/O活用、ローカルはマシン負荷軽減 |
| fileParallelism | true | VITEST_FILE_PARALLELISM環境変数で制御 | メモリ不足時に無効化可能              |
| testTimeout     | 10秒 | 10秒                                  | 両環境共通                            |
| isolate         | true | true                                  | プロセス間干渉防止                    |

**環境変数によるローカル制御**:

| 環境変数                | 用途                   | 例                                      |
| ----------------------- | ---------------------- | --------------------------------------- |
| VITEST_MAX_FORKS        | fork数の上書き         | VITEST_MAX_FORKS=6 pnpm test            |
| VITEST_FILE_PARALLELISM | ファイル並列化の無効化 | VITEST_FILE_PARALLELISM=false pnpm test |

**jsdomバージョン管理**:

jsdom@27.x系でESMエラーが発生する場合、root package.jsonにpnpm.overridesを設定してバージョンを統一する。

| 設定                 | 値     | 効果                                        |
| -------------------- | ------ | ------------------------------------------- |
| pnpm.overrides.jsdom | 25.0.1 | 全パッケージでバージョン統一、ESM互換性確保 |

**ベストプラクティス**:

- 各テストは独立して実行可能であること
- テストデータはbeforeEachで初期化
- モックはテストごとに明確に設定
- 1テストにつき1つのアサーションを目安にする

**並列実行の設定**:

Vitestの並列実行はデフォルトで有効。スレッド数は5、テストタイムアウトは10秒に設定。各テストは分離されて実行される。

### 未処理Promise拒否検知ルール（TASK-FIX-10-1 2026-02-19実装）

テスト結果の信頼性を維持するため、未処理 Promise 拒否を無視する設定は禁止する。

| 設定項目 | 許容値 | 理由 |
| -------- | ------ | ---- |
| `dangerouslyIgnoreUnhandledErrors` | 未設定（デフォルト `false`） | 未処理 Promise 拒否をテスト失敗として検知するため |

**運用ルール**:

- `vitest.config.ts` に `dangerouslyIgnoreUnhandledErrors` を追加しない
- 設定の退行防止として、設定検証テストを1件以上維持する
- 未処理 Promise 拒否が発生した場合は設定で隠蔽せず、テスト/実装側で根本修正する

### `coveragePathIgnorePatterns` 設定注意事項

`apps/desktop/vitest.config.ts` の `coveragePathIgnorePatterns` に `**/index.ts` を含む場合、バレルエクスポート専用ファイルだけでなく実装ロジックを含む `index.ts` もカバレッジ計測対象外になる。

| 問題 | 対象ファイル | 状況 |
| ---- | ------------ | ---- |
| `**/index.ts` 一括除外 | `apps/desktop/src/main/ipc/index.ts` | `registerAllIpcHandlers()` 等の実装ロジックが除外される |

- 未タスク: `UT-COVERAGE-INDEX-TS-EXCLUSION-001`（`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-coverage-index-ts-exclusion-001.md`）

### `@repo/shared` alias 管理ルール（TASK-FIX-10-1 2026-02-19更新）

モノレポ環境でのVitest解決エラーを防ぐため、`@repo/shared` のサブパス alias を明示管理する。

| ルール | 内容 |
| ------ | ---- |
| 定義順序 | より具体的なサブパスを先、`@repo/shared` 本体を最後に定義する |
| 追加条件 | `packages/shared` の export 追加時は、Vitest alias への反映要否を必ず確認する |
| 継続課題 | alias追従の機械検証は未タスク `task-imp-vitest-alias-sync-automation-001` で対応する |

### `@repo/shared` サブパス三層整合ルール（TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 2026-02-20更新）

TypeScript と Vitest の解決結果を一致させるため、`@repo/shared` サブパスは3層を同時に更新する。

| 層 | ファイル | 役割 |
| --- | --- | --- |
| 公開契約 | `packages/shared/package.json` (`exports` / `typesVersions`) | サブパスの正本 |
| 型解決 | `apps/desktop/tsconfig.json` (`compilerOptions.paths`) | `tsc --noEmit` の解決 |
| テスト解決 | `apps/desktop/vitest.config.ts` (`resolve.alias`) | Vitest 実行時の解決 |

**品質ゲート**:

- `exports` 追加時は同一変更で `paths` と `alias` を更新する
- 定義順序は「具体サブパス -> ルート (`@repo/shared`)」を維持する
- `apps/desktop` が shared ソースを直接参照する場合、補助型宣言（`packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts`）が取り込まれることを確認する
- 整合テスト（`shared-module-resolution.test.ts` / `vitest-alias-consistency.test.ts` / `module-resolution.test.ts`）を維持する

### モジュール解決整合性テスト（TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 2026-02-20実装）

`@repo/shared` サブパスの三層整合を自動検証するため、3つのテストスイートを維持する。

**テストスイート分類**:

| テストスイート | ファイル | テスト数 | 検証対象 | カバレッジ分類 |
| --- | --- | --- | --- | --- |
| module-resolution | `apps/desktop/src/__tests__/module-resolution.test.ts` | 57 | `exports` ↔ `tsup` entry | ビルド整合性（公開契約とビルド出力の一致） |
| shared-module-resolution | `apps/desktop/src/__tests__/shared-module-resolution.test.ts` | 59 | `paths` ↔ `exports` | TypeScript解決整合性（型解決と公開契約の一致） |
| vitest-alias-consistency | `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts` | 108 | `alias` ↔ `paths` | テスト実行整合性（テスト解決と型解決の一致） |

**品質ゲート項目**:

| ゲート項目 | 合格基準 | 実行タイミング |
| --- | --- | --- |
| 3テストスイート全 PASS | 224/224 テスト成功 | サブパス追加時（必須）、CI（常時） |
| typecheck 0エラー | `pnpm --filter @repo/desktop exec tsc --noEmit` エラー0件 | サブパス追加時（必須）、CI（常時） |
| shared build 成功 | `pnpm --filter @repo/shared build` 正常完了 | サブパス追加時（必須）、CI（常時） |

**`@repo/shared` サブパス追加時の必須テスト要件**:

新しいサブパスを `packages/shared` に追加する場合、以下の全条件を満たすこと:

1. `packages/shared/package.json` の `exports` にサブパスを追加
2. `packages/shared/package.json` の `typesVersions` にサブパスを追加
3. `apps/desktop/tsconfig.json` の `compilerOptions.paths` にサブパスを追加
4. `apps/desktop/vitest.config.ts` の `resolve.alias` に必要な alias を追加（テスト解決に影響する場合）
5. 上記3テストスイート全 PASS を確認
6. `pnpm --filter @repo/desktop exec tsc --noEmit` でエラー0件を確認
7. `pnpm --filter @repo/shared build` で成功を確認

### モック戦略

外部依存をテストから分離するため、適切なモック手法を使用する。

**グローバルAPIモック（TASK-3-2-F 2026-01-30実装）**:

| API             | モック方法                  | 配置先             |
| --------------- | --------------------------- | ------------------ |
| Clipboard API   | vi.fn().mockResolvedValue() | setup.ts           |
| window.electronAPI.skill | vi.stubGlobal()             | setup.ts beforeAll（TASK-FIX-5-1で統一） |

**Clipboard APIモック設計**:

| メソッド                      | モック戻り値              | 用途               |
| ----------------------------- | ------------------------- | ------------------ |
| navigator.clipboard.writeText | Promise<void>             | コピー操作テスト   |
| navigator.clipboard.readText  | Promise<string>（空文字） | ペースト操作テスト |

**window.electronAPI.skill モック設計（TASK-FIX-5-1で統一）**:

useSkillExecution/useSkillPermissionフックがwindow.electronAPI.skillを参照するため、テスト環境でモックが必要。

| メソッド               | 戻り値                    | 用途                   |
| ---------------------- | ------------------------- | ---------------------- |
| onStream               | () => void                | ストリームリスナー登録 |
| onPermissionRequest    | () => void                | 権限リクエストリスナー |
| sendPermissionResponse | Promise<{success}>        | 権限応答送信           |
| execute                | Promise<{executionId}>    | スキル実行開始         |
| abort                  | Promise<void>             | 実行中断               |
| list                   | Promise<SkillMetadata[]>  | スキル一覧取得         |
| getImported            | Promise<ImportedSkill[]>  | インポート済み取得     |

**vi.stubGlobal再設定パターン**:

setup.tsのbeforeAllでグローバルモックを設定後、テストファイル固有のモックを使用したい場合の対処法。

| 手順 | 内容                                                                              |
| ---- | --------------------------------------------------------------------------------- |
| 1    | テストファイルでmockSkillAPIを定義                                                |
| 2    | vi.stubGlobal("electronAPI", { skill: mockSkillAPI })をモジュールレベルで実行     |
| 3    | beforeEach内で再度vi.stubGlobalを呼び出し（setup.tsの上書き対策）                 |

**MSW（Mock Service Worker）によるAPIモック**:

MSWはネットワークレベルでHTTPリクエストをインターセプトし、モックレスポンスを返す。実装ファイルは`apps/desktop/src/test/mocks/`に配置済み（2026-01-05実装完了）。

| ハンドラー種別 | 対象               | 機能                                       |
| -------------- | ------------------ | ------------------------------------------ |
| Supabase Auth  | 認証エンドポイント | ログイン、サインアップ、ログアウトのモック |
| Anthropic API  | AIエンドポイント   | ストリーミングレスポンス対応               |

**テストダブルの使い分け**:

| ダブル種別 | 用途                 | 使用場面                     |
| ---------- | -------------------- | ---------------------------- |
| Stub       | 決まった値を返す     | 外部サービスの固定レスポンス |
| Mock       | 呼び出しを検証       | 関数が正しく呼ばれたか確認   |
| Spy        | 実装を保持しつつ監視 | 既存実装の振る舞いを観察     |
| Fake       | 軽量な代替実装       | InMemoryRepositoryなど       |

### テストユーティリティ（実装済み 2026-01-05）

テストの効率化のため、共通ユーティリティを提供。配置先は`apps/desktop/src/test/`。

| ファイル          | 用途                                   |
| ----------------- | -------------------------------------- |
| `utils.tsx`       | カスタムレンダー関数                   |
| `test-helpers.ts` | ストアモック、waitForなど              |
| `factories.ts`    | テストデータファクトリー               |
| `mocks/`          | MSWハンドラー・サーバー設定            |
| `setup.ts`        | テストセットアップ（MSW統合、DOM拡張） |

**カスタムレンダー関数の種類**:

| 関数名              | 用途                       |
| ------------------- | -------------------------- |
| renderWithRouter    | Router込みレンダリング     |
| renderWithProviders | 全Provider込み統合テスト用 |

**テストデータファクトリー**:

ファクトリー関数はユニークIDを自動生成し、テスト間の干渉を防止する。createMockChatSession、createMockChatMessageなどを提供。beforeEachでresetFactoriesを呼び出してカウンターをリセットする。

### React Testing Library ベストプラクティス

RTL（React Testing Library）はユーザー視点でのテストを推奨する。実装の詳細ではなく、ユーザーが見る要素（ラベル、ロール、テキスト）でクエリを行う。

**act()警告対処パターン（TASK-3-2-F 2026-01-30実装）**:

React状態更新がテスト外で発生した場合にact()警告が出る。以下のパターンで対処する。

| パターン   | 対処法                                          | 用途                       |
| ---------- | ----------------------------------------------- | -------------------------- |
| fakeTimers | vi.useFakeTimers() + vi.advanceTimersByTime(ms) | setInterval/setTimeout依存 |
| waitFor    | await waitFor(() => expect(...))                | 非同期状態更新             |
| act wrap   | await act(async () => { ... })                  | 明示的な状態更新待機       |

**残存警告の許容判断基準**:

| 条件                   | 許容可否 | 理由             |
| ---------------------- | -------- | ---------------- |
| テスト結果が正しい     | 許容     | 機能に影響なし   |
| 警告が少数（10件未満） | 許容     | 費用対効果の観点 |
| 外部ライブラリ起因     | 許容     | 修正困難         |
| 本番コードに影響       | 不可     | 品質問題         |

**推奨クエリの優先順位**:

1. getByRole - アクセシビリティロールで要素を取得
2. getByLabelText - フォーム要素をラベルで取得
3. getByText - 表示テキストで要素を取得
4. getByTestId - 最終手段としてdata-testid属性を使用

**アクセシビリティテストの統合**:

jest-axeを使用して自動アクセシビリティチェックを実施。各コンポーネントがWCAG基準を満たしていることを検証する。

### E2Eテスト（Playwright）効率化

E2EテストはPlaywrightを使用し、クリティカルパス（最重要ユーザーフロー）のみをカバーする。

> **詳細仕様**: E2Eテストフィクスチャ仕様・テストケース一覧・SkillScanner統合パターンの詳細は [quality-e2e-testing.md](./quality-e2e-testing.md) を参照。

**クリティカルパスの特定**:

| パス             | 内容                     |
| ---------------- | ------------------------ |
| タスク作成・完了 | 基本的なCRUD操作         |
| AI対話フロー     | プロンプト送信と応答受信 |

**フレーキーテストの防止策**:

| 対策               | 説明                                    |
| ------------------ | --------------------------------------- |
| 明示的な待機       | waitForLoadState、waitForSelectorを使用 |
| ネットワーク待機   | networkidleを活用                       |
| 固定時間待機の禁止 | waitForTimeoutは使用しない              |

**CI/CD統合**:

GitHub Actionsでテストを実行し、失敗時はplaywright-reportをアーティファクトとして保存する。

### Electron アプリテスト

Electronアプリ固有のテスト戦略を定める。

**Main/Rendererプロセステスト**:

IPC通信のモックを作成し、プロセス間通信をテスト可能にする。ハンドラーの登録と呼び出しをシミュレートする。

**ファイルシステム操作のテスト**:

memfsを使用して仮想ファイルシステムを構築し、実際のファイルI/Oなしでテストを実行する。

---

## セキュリティ

### 認証・認可

| 項目           | 実装                         | 理由                                 |
| -------------- | ---------------------------- | ------------------------------------ |
| 認証方式       | NextAuth.js + Discord OAuth  | ソーシャルログインで導入障壁を下げる |
| セッション管理 | セッションCookie（30日有効） | 長期ログイン維持でUX向上             |
| API認証        | JWT または API Key           | ステートレス認証で拡張性確保         |

### データ保護

| 項目           | 実装                 | 理由                         |
| -------------- | -------------------- | ---------------------------- |
| API キー       | 環境変数管理         | コードベースへの露出を防止   |
| ローカルデータ | Electron safeStorage | OSのセキュアストレージを活用 |
| 通信           | HTTPS必須            | 中間者攻撃を防止             |

### 脆弱性対策

| 対策         | ツール                 | 実施タイミング |
| ------------ | ---------------------- | -------------- |
| 依存関係監査 | pnpm audit、Dependabot | PR作成時、週次 |
| CSP設定      | next.config.ts         | 初期設定時     |
| XSS/CSRF     | React デフォルト保護   | フレームワーク |

---

## 可用性

### エラーハンドリング

- グローバルエラーバウンダリを設置し、予期しないエラーでもアプリがクラッシュしないようにする
- ユーザーフレンドリーなエラーメッセージを表示し、技術的な詳細は隠蔽する
- 構造化ログを出力し、問題の診断を容易にする

### オフライン対応

| 機能           | 説明                                     |
| -------------- | ---------------------------------------- |
| ローカルSQLite | オンライン不可時のフォールバック         |
| 同期キュー     | オフライン中の操作を記録し、復帰時に同期 |
| 状態表示       | オフライン状態をUIで明示的に表示         |

---

