# テスト・実装設計パターン集

> 親ファイル: [patterns.md](patterns.md)

## 目的

単体テスト・E2Eテスト・サービス設計・React/Zustand実装で検証された実践パターン。

> UI設計・IPC・モジュール管理パターンは [patterns-ui-ipc-modules.md](patterns-ui-ipc-modules.md) を参照。

---

## 単体テスト設計パターン

### カバレッジ閾値免除判定パターン

- **パターン**: Phase 7仕様の「統合テスト（TASK-8B, TASK-8C）でカバーされる予定のパスは差し戻さない」規定を適用し、条件付PASSとする
- **効果**: 単体テストでの過度なモッキングを回避し、テストの脆弱性を防止
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8A

### ギャップ分析ベース TDD パターン

- **パターン**: Phase 1でギャップ分析（既存テスト監査→仕様要件との差分検出）を実施し、不足テストケースのみをTDD Red-Green-Refactorで追加
- **効果**: 既存テストを壊すリスクなしに新規テストを安全に追加
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8A

### 未タスク検出 P3全件記録パターン

- **パターン**: 優先度に関わらず検出した候補は全件を未タスク検出レポートの最終テーブルに記録し、`docs/30-workflows/unassigned-task/` にタスク指示書を正式配置する。「検出したが記録しない」は禁止
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8A

### vi.doMock 動的モジュール再読み込みパターン

- **状況**: テスト対象モジュールがコンストラクタ内で外部依存（electron-store等）を初期化し、各テストで異なるモック設定が必要な場合
- **パターン**: `vi.doMock()`でモジュールモックを設定後、`await import()`でモジュールを動的再読み込み
- **効果**: テスト間のモック状態漏洩を完全に排除
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8A

### 境界値フィクスチャ設計パターン（ギャップ分析駆動）

- **パターン**: ギャップ分析マトリクスでA（エラーパターン）/B（境界値）/C（組み合わせ）/D（データ）の4カテゴリに分類し、各ギャップに対応するフィクスチャを設計
- **例**（TASK-8C-G）:
  | カテゴリ | ギャップ数 | フィクスチャ例 |
  | -------- | ---------- | -------------- |
  | A: エラー | 10件 | missing-fields-skill, forbidden-files-skill |
  | B: 境界値 | 9件 | boundary-skill（64文字名、最大エージェント数） |
  | C: 組み合わせ | 1件 | boundary-skill（全5スクリプト同時検証） |
  | D: データ | 3件 | マルチラインYAML、特殊文字含むパス |
- **発見日**: 2026-02-01
- **関連タスク**: TASK-8C-G

### parseFrontmatter構造化検証パターン

- **パターン**: フィールドの存在確認（`toHaveProperty`）+ バリデーションスクリプトの出力結果で検証する2段階アプローチ
- **例**（TASK-8C-G）:
  - 直接比較が失敗: `expect(fm.description).toBe("...")` → マルチラインYAMLで型が異なる
  - 解決: `expect(fm).toHaveProperty("description")` でフィールド存在を確認
- **発見日**: 2026-02-01
- **関連タスク**: TASK-8C-G

### execSync外部スクリプト実行による決定論的テスト

- **パターン**: `execSync` で実際にスクリプトを子プロセスとして実行し、終了コードと標準出力を検証
- **効果**: Script First原則に準拠（スクリプト自体が正しく動作することを保証）
- **発見日**: 2026-02-01
- **関連タスク**: TASK-8C-G

### ESModuleモッキング回避パターン

- **パターン**: モックを使わず、実際にエラーが発生する条件（存在しないファイル、権限不足等）を作ってテストする
- **例**（TASK-9A-A）:
  - 問題: `vi.spyOn(fs, "readFile")` → `TypeError: Cannot redefine property: readFile`
  - 解決: 存在しないスキル名を渡してENOENTエラーを発生させる
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9A-A

### 汎用エラーアサーションパターン

- **パターン**: 特定のエラークラスではなく`.rejects.toThrow()`で汎用的にエラー発生を検証
- **例**（TASK-9A-A）:
  - 問題: `readSkillFile("")`は`SkillNotFoundError`を期待したが`FileNotFoundError`が発生
  - 解決: `.rejects.toThrow(SkillNotFoundError)` → `.rejects.toThrow()` に変更
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9A-A

### 大規模テスト実行時のVitest Worker対策

- **解決策**:
  | 対策 | コマンド/設定 | 効果 |
  | ---- | ------------ | ---- |
  | テスト分割実行 | `pnpm vitest run apps/desktop/src/main/services/skill/` | 対象を絞って安定実行 |
  | ワーカー数制限 | `--poolOptions.workers.max=4` | メモリ消費を抑制 |
  | 並列実行無効化 | `--no-file-parallelism` | 安定性優先 |
- **発見日**: 2026-02-08
- **関連タスク**: TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE

---

## E2Eテスト設計パターン

### ARIA属性ベースセレクタ優先パターン

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
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8C-B

### E2Eヘルパー関数分離パターン

- **パターン**: 操作シーケンスをヘルパー関数として分離し、各テストから呼び出す
- **例**（TASK-8C-B）:
  | ヘルパー関数 | 操作内容 |
  | ------------ | -------- |
  | `openDropdown(page)` | セレクタクリック + ドロップダウン表示待機 |
  | `selectSkill(page, name)` | openDropdown + オプションクリック |
  | `deselectSkill(page)` | openDropdown + 「なし」オプションクリック |
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8C-B

### E2E安定性対策3層パターン

- **実装**:
  | 層 | 対策 | 実装例 |
  | -- | ---- | ------ |
  | 1. 明示的セレクタ待機 | 要素表示完了を待つ | `waitForSelector({ state: "visible" })` |
  | 2. UI安定化待機 | レンダリング完了を待つ | `waitForTimeout(100)` in beforeEach |
  | 3. DOMロード待機 | ページ初期化を待つ | `waitForLoadState("domcontentloaded")` |
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8C-B

### E2Eテスト Page Object パターン（Playwright）

- **例**（task-imp-search-ui-001）:
  | ファイル | 責務 |
  | -------- | ---- |
  | `SearchPanelPage.ts` | 検索パネルUI操作（toggle, type, count） |
  | `WorkspaceSearchPage.ts` | ワークスペース検索モーダル操作 |
- **構成**:
  ```typescript
  class SearchPanelPage {
    readonly searchInput: Locator;
    readonly resultsCount: Locator;

    async typeSearchQuery(query: string) { ... }
    async getResultsCount(): Promise<number> { ... }
  }
  ```
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

---

## React/Zustand 設計パターン

### Zustand Store Hooks無限ループ対策パターン

- **根本原因**: 合成Store Hookは毎回新しいオブジェクト参照を返すため、`useEffect`の依存配列に関数を含めると毎レンダリングで再実行される
- **解決パターン**:
  | 対策 | 実装方法 | 効果 |
  | ---- | -------- | ---- |
  | **短期: useRefガード** | `useRef`で初期化済みフラグを管理し、依存配列は空にする | 即時修正可能 |
  | **長期: 個別セレクタ** | `useAuthMode()`, `useSetAuthMode()`等の個別セレクタに再設計 | 根本解決 |
- **コード例**:
  ```typescript
  // ❌ 無限ループ
  const { initializeAuthMode } = useAuthModeStore();
  useEffect(() => { initializeAuthMode(); }, [initializeAuthMode]);

  // ✅ 修正後（useRefガード）
  const { initializeAuthMode } = useAuthModeStore();
  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current) { initRef.current = true; initializeAuthMode(); }
  }, []);
  ```
- **発見日**: 2026-02-10
- **関連タスク**: UT-FIX-STORE-HOOKS-INFINITE-LOOP-001

### Store個別セレクタによる再レンダー最適化

- **パターン**: `useAppStore((s) => s.specificField)` を各フィールドごとに呼び出し
- **例**（TASK-7D）:
  ```
  const selectedSkillName = useAppStore((s) => s.selectedSkillName);
  const streamingMessages = useAppStore((s) => s.streamingMessages);
  const isExecuting = useAppStore((s) => s.isExecuting);
  ```
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

### React Contextによる一括更新パターン

- **パターン**: Providerで一元管理し、Context経由で配信
- **例**（TASK-3-2-C）: `TimestampProvider`: 現在時刻を管理、単一の`setInterval`で全MessageTimestampを一括更新
- **効果**: タイマーは1つのみ（パフォーマンス最適化）
- **発見日**: 2026-01-28
- **関連タスク**: TASK-3-2-C

### 動的更新間隔の適応的最適化

- **パターン**: 経過時間に応じて更新間隔を動的に調整
- **例**（TASK-3-2-C）:
  | 経過時間 | 更新間隔 | 理由 |
  | ---------- | --------- | -------------------------------- |
  | 1分未満 | 1秒ごと | 「X秒前」表示に必要 |
  | 1分〜1時間 | 1分ごと | 「X分前」表示で十分 |
  | 1時間以上 | 1時間ごと | 「X時間前」表示で十分 |
- **発見日**: 2026-01-28
- **関連タスク**: TASK-3-2-C

### Zustandリスナー二重登録防止パターン

- **パターン**: モジュールスコープのフラグでガード
- **実装**:
  ```typescript
  let authListenerRegistered = false;
  export const setupAuthStateListener = () => {
    if (authListenerRegistered) return;
    authListenerRegistered = true;
    window.api?.onAuthStateChange((payload) => { ... });
  };
  // テスト用リセット
  export const resetAuthListenerFlag = () => { authListenerRegistered = false; };
  ```
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-GOOGLE-LOGIN-001

### forwardRef + useImperativeHandle によるテスト可能性向上

- **パターン**: `forwardRef` + `useImperativeHandle` で内部関数をref経由で外部公開
- **例**（TASK-7D）:
  - ChatPanelの `handleImportRequest` がUI要素に未接続
  - `useImperativeHandle(ref, () => ({ handleImportRequest }))` で公開
- **効果**: Function Coverage 50% → 100%
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

---

## TypeScript型設計パターン

### Exclude型によるType-safe設定マップ

- **パターン**: `Exclude<UnionType, "value">` で対象外の値を除外した型を定義
- **例**（TASK-7D）:
  - `DisplayableStatus = Exclude<SkillExecutionStatus, "idle">`
  - `STATUS_CONFIG: Record<DisplayableStatus, { color: string; label: string }>`
- **効果**: コンパイル時にすべてのアクティブステータスの設定漏れを検出
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

### Record型による定数スタイルマッピング

- **パターン**: `Record<EnumType, StyleObject>` でTailwind CSSクラスを型安全にマッピング
- **例**（task-imp-permission-tool-metadata-001）:
  ```
  const RISK_LEVEL_STYLES: Record<RiskLevel, { bg: string; text: string; border: string }> = {
    Low: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
    ...
  };
  ```
- **発見日**: 2026-01-31
- **関連タスク**: task-imp-permission-tool-metadata-001

### Discriminated UnionのDRY原則適用パターン

- **パターン**: 共通フィールドをBase型として抽出し、各バリアントでIntersection型として合成
- **例**（TASK-FIX-1-1-TYPE-ALIGNMENT）:
  ```typescript
  // After: Base型抽出でDRY
  interface BaseStreamMessage { executionId: string; timestamp: number; }
  type SkillStreamMessage =
    | (BaseStreamMessage & { type: "assistant"; content: ... })
    | (BaseStreamMessage & { type: "tool_use"; content: ... })
  ```
- **発見日**: 2026-02-04
- **関連タスク**: TASK-FIX-1-1-TYPE-ALIGNMENT

### 型定義ファイルのカバレッジ寄与パターン

- **判断基準**:
  | ファイル内容 | カバレッジ寄与 | 対応 |
  | ------------ | -------------- | ---- |
  | type/interface定義のみ | 0%（正常） | 無視してOK |
  | export const定数あり | ≥0% | テスト追加検討 |
  | ランタイム関数あり | 要カバレッジ | テスト必須 |
- **発見日**: 2026-02-04
- **関連タスク**: TASK-FIX-1-1-TYPE-ALIGNMENT

---

## サービス設計パターン

### DI追加時のテスト修正パターン

- **パターン**:
  1. コンストラクタにオプショナル引数として新サービスを追加（後方互換性維持）
  2. テストファイルごとにモックオブジェクトを定義
  3. beforeEachでモックをリセット
- **苦戦箇所と解決策**:
  | 苦戦箇所 | 問題 | 解決策 |
  | -------- | ----- | ------ |
  | テストファイル洗い出し | 影響範囲が不明確 | `grep -rn "new SkillExecutor" apps/desktop/src/` |
  | モック定義の重複 | 5ファイルに同じモックを追加 | 共通テストユーティリティへの抽出を検討 |
  | beforeEachリセット忘れ | テスト間で状態がリーク | 各beforeEachでリセット |
- **発見日**: 2026-02-08
- **関連タスク**: TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE

### Setter Injectionによる遅延初期化パターン

- **DIパターン使い分け基準**:
  | パターン | 使用条件 | 例 |
  | -------- | -------- | --- |
  | Constructor Injection | 依存オブジェクトが生成時点で利用可能 | AuthKeyService → SkillExecutor |
  | Setter Injection | 依存オブジェクトの生成に外部リソース必要 | SkillExecutor → SkillService |
  | Factory Pattern | 依存オブジェクトを動的に生成する必要 | リクエストごとのインスタンス生成 |
- **実装例**:
  ```typescript
  class SkillService {
    private skillExecutor: SkillExecutor | null = null;
    setSkillExecutor(executor: SkillExecutor): void {
      this.skillExecutor = executor;
    }
    async executeSkill(skillId: string, params: unknown): Promise<Result> {
      if (this.skillExecutor) {
        return this.skillExecutor.execute(skillId, params);
      }
      return this.executeSkillInternal(skillId, params); // フォールバック
    }
  }
  ```
- **発見日**: 2026-02-11
- **関連タスク**: TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION

### Graceful SDK Fallback パターン

- **パターン**: `tryAgentSdkWithFallback<T>(fn, fallback)` ユーティリティでSDKエラー時にフォールバック値を返す
- **例**（TASK-9C）:
  | 項目 | 実装 |
  | ---- | ---- |
  | ユーティリティ | `sdkUtils.ts: tryAgentSdkWithFallback<T>(fn, fallback)` |
  | 使用例 | `tryAgentSdkWithFallback(() => queryFn(prompt), { suggestions: [] })` |
  | エラーログ | `console.warn()` で警告出力、アプリは継続動作 |
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9C

### queryFn DI パターン（SDK テスト用）

- **パターン**: `queryFn` パラメータでSDK呼び出しを依存注入（DI）可能にし、テストではモック関数を渡す
- **例**（TASK-9C）:
  | 項目 | 実装 |
  | ---- | ---- |
  | インターフェース | `queryFn?: (prompt: string) => Promise<Result>` |
  | デフォルト値 | 本番: Claude Agent SDK の `query()` を呼び出す関数 |
  | テスト時 | `vi.fn().mockResolvedValue({ suggestions: [...] })` を注入 |
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9C

### Facadeパターンによるサービス統合

- **例**（TASK-9B-G）:
  ```
  SkillCreatorService (Facade)
    ├── createSkill() ← 統合API
    ├── executeTasks() ← 統合API
    ├─ ScriptExecutor (内部)
    └─ ResourceLoader (内部)
  ```
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9B-G

### Script First / Progressive Disclosure統合パターン

- **パターン**: Script First（決定論的処理）とProgressive Disclosure（遅延読み込み）を組み合わせる
- **例**（TASK-9B-G）:
  | コンポーネント | Script First適用 | Progressive Disclosure適用 |
  | -------------- | ---------------- | -------------------------- |
  | ScriptExecutor | スクリプト実行は100%決定論的 | 実行時のみスクリプト読み込み |
  | ResourceLoader | ファイル読み込みはfs.readFile | キャッシュミス時のみI/O実行 |
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9B-G

