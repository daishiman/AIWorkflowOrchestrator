# パターン集: 単体テスト設計・サービス設計・E2E・CI

> 元ファイル: `patterns.md` から分割
> 読み込み条件: テスト設計、サービス設計、E2Eテスト、CI最適化のパターンを参照したい時。

## 単体テスト設計パターン（TASK-8A）

> TASK-8Aのスキル管理モジュール単体テスト実装で検証されたパターン。5モジュール・231テストの実装から得た知見。

### カバレッジ閾値免除判定パターン

- **状況**: モジュールのLine Coverage/Function Coverageが閾値（80%）未満だが、未カバー部分がIPC通信・外部システム依存のユーティリティメソッドである場合
- **パターン**: Phase 7仕様の「統合テスト（TASK-8B, TASK-8C）でカバーされる予定のパスは差し戻さない」規定を適用し、条件付PASSとする
- **効果**: 単体テストでの過度なモッキングを回避し、テストの脆弱性を防止。Branch Coverageは達成している場合、条件分岐の検証は十分と判断可能
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8A（SkillExecutor.ts: Line 52.73%, Function 64.86% → 条件付PASS）

### ギャップ分析ベース TDD パターン

- **状況**: 既存テストが大量（226件）に存在し、追加テストが少数（5件）で済む場合
- **パターン**: Phase 1でギャップ分析（既存テスト監査→仕様要件との差分検出）を実施し、不足テストケースのみをTDD Red-Green-Refactorで追加。既存テストへの変更は最小限に抑える
- **効果**: 226件の既存テストを壊すリスクなしに5件の新規テストを安全に追加。全231テストがPASS
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8A（SE-02, SE-07, SE-08, PR-03の4ギャップ検出→5テスト追加）

### 未タスク検出 P3全件記録パターン

- **状況**: Phase 11で検出されたエッジケースが低優先度(P3)で、最終テーブルから除外されてしまう
- **パターン**: 優先度に関わらず検出した候補は全件を未タスク検出レポートの最終テーブルに記録し、`docs/30-workflows/unassigned-task/` にタスク指示書を正式配置する。「検出したが記録しない」は禁止
- **効果**: 将来の参照可能性を確保し、未タスク検出の完全性を維持。TASK-8AではP3アイテム(SKILL.md途中削除レースコンディション)が当初0件として報告されたが、修正後1件として正式記録
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8A（task-skillscanner-file-deletion-race: P3未タスクの正式配置）

### vi.doMock 動的モジュール再読み込みパターン

- **状況**: テスト対象モジュールがコンストラクタ内で外部依存（electron-store等）を初期化し、各テストで異なるモック設定が必要な場合
- **パターン**: `vi.doMock()`でモジュールモックを設定後、`await import()`でモジュールを動的再読み込み。各テストで独立したモック環境を構築
- **効果**: テスト間のモック状態漏洩を完全に排除。SkillImportManager.test.tsの28テスト全件で独立性を確保
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8A

### Electron静的APIモックパターン（Notification 等）

- **状況**: `Notification.isSupported()` のような Electron の静的 API を持つモジュールを Vitest で安全に差し替えたい場合
- **パターン**:
  - `beforeEach(() => vi.resetModules())` でモジュールキャッシュを毎テスト初期化する
  - `vi.doMock("electron", () => ({ Notification: MockNotification }))` のように、必要な export だけをモックする
  - `vi.doMock()` の後に `await import("../ElectronNotificationService")` のように対象モジュールを動的 import する
- **検証の分離**:
  - `Notification` コンストラクタへの引数は `expect(MockNotification).toHaveBeenCalledWith({ title, body })` で確認する
  - `show()` は `expect(show).toHaveBeenCalledTimes(1)` のようにインスタンス側で別確認する
  - `Notification.isSupported()` が `false` の分岐では、`show()` だけでなくコンストラクタ呼び出しが発生しないことも確認対象に含める
- **効果**:
  - Electron の静的 API を含むモジュールでも、テスト間の状態漏洩や初期化順序の揺れを避けられる
  - 「生成されたか」と「表示されたか」を分けて検証でき、モック実装の退化を見逃しにくい
- **発見日**: 2026-04-02
- **関連タスク**: TASK-NOTIFICATION-SERVICE-001

### Graceful SDK Fallback パターン

- **状況**: 外部SDK（Claude Agent SDK等）への接続が失敗した場合でもアプリケーションがクラッシュしない必要がある場合
- **パターン**: `tryAgentSdkWithFallback<T>(fn, fallback)` ユーティリティでSDKエラー時にフォールバック値を返す
- **例**（TASK-9C）:
  | 項目 | 実装 |
  | ---- | ---- |
  | ユーティリティ | `sdkUtils.ts: tryAgentSdkWithFallback<T>(fn, fallback)` |
  | 使用例 | `tryAgentSdkWithFallback(() => queryFn(prompt), { suggestions: [] })` |
  | エラーログ | `console.warn()` で警告出力、アプリは継続動作 |
- **効果**:
  - SDKが未インストール/設定不備でもアプリが起動・動作する
  - ユーザーには「分析結果なし」等の空状態を表示
  - エラー詳細は開発者コンソールで確認可能
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9C

### queryFn DI パターン（SDK テスト用）

- **状況**: Claude Agent SDK の `query()` 呼び出しを含むサービスの単体テストを書く場合
- **パターン**: `queryFn` パラメータでSDK呼び出しを依存注入（DI）可能にし、テストではモック関数を渡す
- **例**（TASK-9C）:
  | 項目 | 実装 |
  | ---- | ---- |
  | インターフェース | `queryFn?: (prompt: string) => Promise<Result>` |
  | デフォルト値 | 本番: Claude Agent SDK の `query()` を呼び出す関数 |
  | テスト時 | `vi.fn().mockResolvedValue({ suggestions: [...] })` を注入 |
- **効果**:
  - SDK本体をモック不要（ESModule問題を回避）
  - テストが高速・決定論的
  - 本番コードは変更なしで動作
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9C

### スキル名バリデーション（禁止文字サニタイズ）

- **状況**: ユーザー入力のスキル名をファイルパスとして使用する場合
- **パターン**: 禁止文字リスト `<>:"\|?*` を定義し、該当文字を含む名前を拒否またはサニタイズ
- **例**（TASK-9C）:
  | 項目 | 実装 |
  | ---- | ---- |
  | 禁止文字定数 | `FORBIDDEN_CHARS = ['<', '>', ':', '"', '\|', '?', '*']` |
  | 検証関数 | `validateSkillName(name): { valid: boolean; error?: string }` |
  | エラーメッセージ | 「スキル名に使用できない文字が含まれています: <具体的な文字>」 |
- **効果**:
  - パストラバーサル攻撃の防止
  - Windows/macOS/Linux全環境で安全なファイル名
  - ユーザーフレンドリーなエラーメッセージ
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9C

### ESModuleモッキング回避パターン

- **状況**: `node:fs/promises`等のESModuleエクスポートに対して`vi.spyOn()`を使用すると`Cannot redefine property`エラーが発生する場合
- **パターン**: モックを使わず、実際にエラーが発生する条件（存在しないファイル、権限不足等）を作ってテストする
- **例**（TASK-9A-A）:
  - 問題: `vi.spyOn(fs, "readFile")` → `TypeError: Cannot redefine property: readFile`
  - 解決: 存在しないスキル名を渡してENOENTエラーを発生させる
  - 解決: 権限のないディレクトリを使ってEACCESエラーを発生させる
- **効果**:
  - Vitestの制約を回避
  - 実際のエラーパスをテスト（モックより信頼性高い）
  - 137テスト全PASS、カバレッジ98%達成
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9A-A

### 汎用エラーアサーションパターン

- **状況**: 空入力に対するエラーが複数のエラークラスのいずれかを返す可能性がある場合
- **パターン**: 特定のエラークラスではなく`.rejects.toThrow()`で汎用的にエラー発生を検証
- **例**（TASK-9A-A）:
  - 問題: `readSkillFile("")`は`SkillNotFoundError`を期待したが`FileNotFoundError`が発生
  - 解決: `.rejects.toThrow(SkillNotFoundError)` → `.rejects.toThrow()` に変更
  - 理由: 空スキル名は「スキルが見つからない」とも「ファイルが見つからない」とも解釈できる
- **効果**:
  - 実装の詳細に依存しない堅牢なテスト
  - エラーハンドリングのリファクタリング耐性
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9A-A

### 境界値フィクスチャ設計パターン（ギャップ分析駆動）

- **状況**: 既存テストで未カバーの境界値・エラーパターンを体系的に拡充する場合
- **パターン**: ギャップ分析マトリクスでA（エラーパターン）/B（境界値）/C（組み合わせ）/D（データ）の4カテゴリに分類し、各ギャップに対応するフィクスチャを設計
- **例**（TASK-8C-G）:
  | カテゴリ | ギャップ数 | フィクスチャ例 |
  | -------- | ---------- | -------------- |
  | A: エラー | 10件 | missing-fields-skill, forbidden-files-skill, invalid-name-skill, empty-agents-skill, invalid-schema-skill |
  | B: 境界値 | 9件 | boundary-skill（64文字名、10文字説明、最大エージェント数） |
  | C: 組み合わせ | 1件 | boundary-skill（全5スクリプト同時検証） |
  | D: データ | 3件 | マルチラインYAML、特殊文字含むパス |
- **効果**:
  - 23ギャップ → 100%カバレッジ達成
  - 既存62テスト + 新規34テスト = 96テスト全PASS
  - 体系的で漏れのないテスト拡充
- **発見日**: 2026-02-01
- **関連タスク**: TASK-8C-G

### parseFrontmatter構造化検証パターン

- **状況**: YAML Frontmatterのパース結果を検証する際、直接値比較だと型の不一致やマルチラインYAML（`|`記法）で失敗する場合
- **パターン**: フィールドの存在確認（`toHaveProperty`）+ バリデーションスクリプトの出力結果で検証する2段階アプローチ
- **例**（TASK-8C-G）:
  - 直接比較が失敗: `expect(fm.description).toBe("...")` → マルチラインYAMLで型が異なる
  - 解決: `expect(fm).toHaveProperty("description")` でフィールド存在を確認
  - スクリプト出力で詳細検証: `parseValidationOutput(result)` → `{ valid: true }` で合否判定
- **効果**:
  - YAMLパーサー実装の詳細に依存しない堅牢なテスト
  - マルチラインYAML（`|`）、フロースタイル（`[a, b]`）等の各記法に対応
  - テストの保守性向上（パーサー変更時にテスト修正不要）
- **発見日**: 2026-02-01
- **関連タスク**: TASK-8C-G

### execSync外部スクリプト実行による決定論的テスト

- **状況**: JavaScriptバリデーションスクリプトの動作をテストする場合
- **パターン**: `execSync` で実際にスクリプトを子プロセスとして実行し、終了コードと標準出力を検証
- **例**（TASK-8C-G）:
  - `getExitCode(scriptPath, fixturePath)`: 終了コードで成功/失敗を判定
  - `parseValidationOutput(stdout)`: JSON出力をパースして`valid`/`errors`を検証
  - 実際のスクリプトを実行するため、ロジックのモック不要
- **効果**:
  - Script First原則に準拠（スクリプト自体が正しく動作することを保証）
  - CIとローカルで同じ結果（環境依存なし）
  - スクリプトのインターフェース（入出力仕様）をテストとして文書化
- **発見日**: 2026-02-01
- **関連タスク**: TASK-8C-G

---

## E2Eテスト設計パターン（TASK-8C-B）

> TASK-8C-BのスキルE2Eテスト実装で検証されたパターン。8テストケース・ARIA属性ベースセレクタ・安定性対策の知見。

### ARIA属性ベースセレクタ優先パターン

- **状況**: Playwrightでドロップダウン等のUI要素を選択する場合
- **パターン**: `data-testid`やCSSクラスより`role`属性等のARIA属性を優先してセレクタを構築
- **例**（TASK-8C-B）:
  ```typescript
  const selectors = {
    skillSelector: '[role="combobox"][aria-haspopup="listbox"]',
    dropdown: '[role="listbox"]',
    option: (text: string) => `[role="option"]:has-text("${text}")`,
  };
  ```
- **セレクタ優先順位**:
  | 優先度 | セレクタタイプ | 理由 |
  | ------ | -------------- | ---- |
  | 1 | ARIA属性 | セマンティック、安定、アクセシビリティ検証も兼ねる |
  | 2 | data-testid | テスト専用、明示的 |
  | 3 | テキストベース | 可読性高い |
  | 4 | ID/クラス | 実装詳細に依存するため最後の手段 |
- **効果**:
  - CSSリファクタリング時もテストが壊れにくい
  - アクセシビリティとE2Eテストが同時に検証される
  - コンポーネント内部実装に依存しない堅牢なテスト
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8C-B

### E2Eヘルパー関数分離パターン

- **状況**: 複数のテストケースで同じUI操作シーケンスを繰り返す場合
- **パターン**: 操作シーケンスをヘルパー関数として分離し、各テストから呼び出す
- **例**（TASK-8C-B）:
  | ヘルパー関数 | 操作内容 |
  | ------------ | -------- |
  | `openDropdown(page)` | セレクタクリック + ドロップダウン表示待機 |
  | `selectSkill(page, name)` | openDropdown + オプションクリック |
  | `deselectSkill(page)` | openDropdown + 「なし」オプションクリック |
- **効果**:
  - テストコードのDRY原則遵守
  - 操作シーケンス変更時の修正箇所が1箇所
  - テストケースの可読性向上（what, not how）
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8C-B

### E2E安定性対策3層パターン

- **状況**: E2Eテストがフレーキー（不安定）になる場合
- **パターン**: 3層の待機処理で安定性を確保
- **実装**:
  | 層 | 対策 | 実装例 |
  | -- | ---- | ------ |
  | 1. 明示的セレクタ待機 | 要素表示完了を待つ | `waitForSelector({ state: "visible" })` |
  | 2. UI安定化待機 | レンダリング完了を待つ | `waitForTimeout(100)` in beforeEach |
  | 3. DOMロード待機 | ページ初期化を待つ | `waitForLoadState("domcontentloaded")` |
- **効果**:
  - 5回連続実行でも100% PASS
  - CI環境とローカル環境で同一結果
  - タイミング依存の失敗を排除
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8C-B

---

## CI/DevOps最適化パターン

> TASK-OPT-CI-TEST-PARALLEL-001で検証されたGitHub Actions CI最適化パターン。

### GitHub Actions テスト並列実行最適化パターン

- **状況**: CIテスト実行時間が長く（18分以上）、開発フィードバックループが遅い場合
- **パターン**: シャード数増加 + maxForks最適化 + キャッシュ導入 + カバレッジ条件分岐の4軸で最適化
- **例**（TASK-OPT-CI-TEST-PARALLEL-001）:
  | 項目 | 変更前 | 変更後 | 効果 |
  | -------- | ------ | ------ | ---- |
  | シャード数 | 8 | 16 | 各シャード約25ファイル |
  | maxForks | 2 | 4 (CI) / CPUベース (LOCAL) | I/O待ち活用 |
  | fileParallelism | false | true | 並列ファイル実行 |
  | キャッシュ | なし | shared packageビルドキャッシュ | ビルド時間短縮 |
  | カバレッジ | 常時計測 | PR時スキップ、main push時計測 | 約30%時間短縮 |
- **実装詳細**:
  - `vitest.config.ts`: `pool: "forks"` + 動的`maxForks`計算（`Math.min(Math.max(cpus().length / 2, 2), 8)`）
  - `ci.yml`: `matrix.shard: [1,2,...,16]` + `actions/cache@v4`
  - `package.json`: `npm-run-all2`の`run-p`でlint/typecheck/test並列実行
- **環境変数制御**:
  - `VITEST_MAX_FORKS`: maxForks上書き
  - `VITEST_FILE_PARALLELISM`: "false"で無効化（メモリ不足時）
- **効果**:
  - CI全体: 18分 → 9-10分（目標12分以下達成）
  - 各シャード: 13分 → 6-8分（目標10分以下達成）
  - ローカル: lint/typecheck/testが並列実行でフィードバック高速化
- **発見日**: 2026-02-02
- **関連タスク**: TASK-OPT-CI-TEST-PARALLEL-001

### DevOps関連システム仕様書更新パターン

- **状況**: CI/CD最適化タスク完了後、システム仕様書への反映が漏れる場合
- **パターン**: Phase 12で以下3ファイルを必ず確認・更新
- **更新対象ファイル**:
  | ファイル | 更新内容 |
  | -------- | -------- |
  | `deployment-gha.md` | シャード戦略、キャッシュ戦略、並列化設定 |
  | `technology-devops.md` | CI最適化パターン、完了タスクセクション |
  | `quality-requirements.md` | 並列化設定、環境変数制御 |
- **チェックリスト**:
  1. シャード数・分散方式が`deployment-gha.md`に記載されているか
  2. Vitest並列化設定（maxForks, fileParallelism, pool）が記載されているか
  3. 環境変数制御方法が`quality-requirements.md`に記載されているか
  4. CI最適化パターンが`technology-devops.md`に追加されているか
  5. 完了タスクセクションに本タスクが記録されているか
- **効果**: DevOps知見がシステム仕様書に確実に蓄積され、将来のCI最適化に活用可能
- **発見日**: 2026-02-02
- **関連タスク**: TASK-OPT-CI-TEST-PARALLEL-001

---

## サービス設計パターン（TASK-9B-G）

> TASK-9B-GのSkillCreatorService実装で検証されたパターン。50テスト・94.59%カバレッジ達成の知見。

### Script First / Progressive Disclosure統合パターン

- **状況**: 複数のスクリプト・リソース（エージェント定義、スキーマ等）を読み込んでサービスを構成する場合
- **パターン**: Script First（決定論的処理）とProgressive Disclosure（遅延読み込み）を組み合わせて効率的なサービス設計を実現
- **例**（TASK-9B-G）:
  | コンポーネント | Script First適用 | Progressive Disclosure適用 |
  | -------------- | ---------------- | -------------------------- |
  | ScriptExecutor | スクリプト実行は100%決定論的 | 実行時のみスクリプト読み込み |
  | ResourceLoader | ファイル読み込みはfs.readFile | キャッシュミス時のみI/O実行 |
  | SkillCreatorService | モード判定ロジックは決定論的 | 必要なエージェントのみ遅延読み込み |
- **効果**:
  - 初期化時の不要なI/Oを排除
  - テスト時のモック範囲を最小化（決定論的部分はモック不要）
  - メモリ効率の向上（使用時のみリソース読み込み）
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9B-G

### Facadeパターンによるサービス統合

- **状況**: 複数の低レベルコンポーネント（Executor, Loader等）を統合してAPIを提供する場合
- **パターン**: Facade設計パターンで内部実装を隠蔽し、シンプルな公開APIを提供
- **例**（TASK-9B-G）:
  ```
  SkillCreatorService (Facade)
    ├── createSkill() ← 統合API
    ├── executeTasks() ← 統合API
    │
    ├─ ScriptExecutor (内部)
    │   └── execute(), executeJson()
    └─ ResourceLoader (内部)
        └── load(), loadAgent(), loadSchema()
  ```
- **効果**:
  - 利用者は3つのメソッドのみ意識すればよい
  - 内部コンポーネントの変更が外部APIに影響しない
  - 単体テストと統合テストを分離しやすい
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9B-G

### 定数外部化（constants.ts）によるリファクタリング

- **状況**: Phase 8（リファクタリング）でマジックナンバーや文字列リテラルの外部化が必要な場合
- **パターン**: 同一ディレクトリに`constants.ts`を作成し、デフォルト値・タイムアウト・パス等を集約
- **例**（TASK-9B-G）:
  | 定数 | 値 | 用途 |
  | ---- | -- | ---- |
  | DEFAULT_TIMEOUT_MS | 300000 | スクリプト実行タイムアウト |
  | SUPPORTED_ENGINES | ["claude-code", "anthropic-sdk"] | サポートエンジン一覧 |
  | CACHE_MAX_ENTRIES | 50 | ResourceLoaderキャッシュ上限 |
- **効果**:
  - 設定値の一元管理
  - テスト時の定数モック/オーバーライドが容易
  - 将来の環境変数外部化（12-Factor App準拠）への準備
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9B-G

### 未タスク検出→残課題テーブル登録3ステップパターン

- **状況**: Phase 12で未タスクを検出し、適切に管理する場合
- **パターン**: unassigned-task-guidelines.mdの「3ステップ全て完了」を厳守
- **手順**:
  1. **指示書作成**: `docs/30-workflows/unassigned-task/`に9セクション形式で配置
  2. **task-workflow.md登録**: 残課題テーブルに追加（タスクID、名称、優先度、発見元、仕様書パス）
  3. **関連仕様書登録**: interfaces-\*.md等の残課題テーブルにも追加（該当する場合）
- **例**（TASK-9B-G）:
  - 検出: 5件（IPC通信、UI統合、SDK統合、キャッシュ無効化、タイムアウト外部化）
  - 指示書: 5ファイル作成（task-9b-h〜k, task-9b-ui-integration）
  - task-workflow.md: 5件追加（v1.13.0）
- **誤りやすいポイント**:
  - 指示書作成のみで「完了」と誤認（テーブル登録が漏れる）
  - unassigned-task-detection.mdの作成だけで終わる（正式指示書が未作成）
- **効果**:
  - 未タスクの体系的な管理
  - 将来のタスク選定時に一覧から参照可能
  - 検出漏れの防止
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9B-G

---

## Main→Renderer IPC実装パターン（TASK-WCE-MONACO-001）

> TASK-WCE-MONACO-001のMonaco Editor選択範囲取得実装で検証されたパターン。

### webContents.executeJavaScript逆方向クエリパターン

- **状況**: Main ProcessからRenderer ProcessのUI状態（Monaco Editorの選択範囲等）を取得する必要がある場合
- **パターン**: `webContents.executeJavaScript()`でRendererのグローバルブリッジオブジェクトを呼び出す
- **実装**:
  | 要素 | 実装 |
  | ---- | ---- |
  | グローバルブリッジ | `window.__editorSelection = { getSelection: () => {...} }` |
  | Main側クエリ | `webContents.executeJavaScript('window.__editorSelection?.getSelection()')` |
  | webContents取得 | `BrowserWindow.getFocusedWindow()?.webContents ?? BrowserWindow.getAllWindows()[0]?.webContents` |
- **課題と解決策（再利用可能ナレッジ）**:
  | 課題ID | 課題 | 解決策 |
  | ------ | ---- | ------ |
  | MR-01 | webContentsがnull | focusedWebContents ?? firstWebContentsのフォールバック |
  | MR-02 | 未登録エラー | Optional chaining（`?.`）使用 |
  | MR-03 | 非同期結果処理 | async/await適切使用 |
  | MR-04 | TypeScript型エラー | `declare global { interface Window { __xxx?: {...} } }` |
- **効果**:
  - 26テスト全PASS、100%カバレッジ達成
  - Main→Renderer通信の標準パターンとして確立
  - 将来の同様タスク（書き戻し機能等）で再利用可能
- **発見日**: 2026-02-03
- **関連タスク**: TASK-WCE-MONACO-001
- **システム仕様書参照**: [architecture-implementation-patterns.md](/.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md)
