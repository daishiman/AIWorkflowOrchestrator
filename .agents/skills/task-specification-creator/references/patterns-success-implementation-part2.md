# パターン集: 成功パターン - Phase 12チェック・DI・サービス設計

> 元ファイル: `patterns.md` から分割
> 読み込み条件: Phase 12出力チェック、Zustand/DI実装パターン、サービス設計パターンを参照したい時。
> 前半は [patterns-success-implementation.md](patterns-success-implementation.md) を参照。

---

## Phase 12出力成果物チェックリスト

- **状況**: Phase 12タスク仕様書・成果物作成時
- **確認項目**:
  1. ✅ `implementation-guide.md` - Part 1（中学生レベル）+ Part 2（開発者向け）
  2. ✅ `api-documentation.md` / `ipc-documentation.md` / `component-documentation.md`
  3. ✅ `documentation-changelog.md` - システム仕様書更新判断と履歴
  4. ✅ `unassigned-task-detection.md` - 未タスク検出報告（0件でも必須）
- **根拠**: phase-11-12-guide.md Task 1-4の完全準拠
- **発見日**: 2026-01-26

## Zustand Store Hooks無限ループ対策パターン（UT-FIX-STORE-HOOKS-INFINITE-LOOP-001）

- **状況**: Zustand Store Hooksを使用するReactコンポーネントで初期化処理を行う場合
- **問題**: 合成Store Hook（`useAuthModeStore()`等）が毎回新しいオブジェクトを返すため、その中の関数を`useEffect`の依存配列に含めると無限ループが発生
- **症状**:
  - 設定画面がぐるぐる回り続ける
  - LLM/スキル選択が無限実行
  - コンソールに大量のレンダリングログ
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
  useEffect(() => {
    initializeAuthMode();
  }, [initializeAuthMode]);

  // ✅ 修正後（useRefガード）
  const { initializeAuthMode } = useAuthModeStore();
  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      initializeAuthMode();
    }
  }, []);
  ```
- **関連Pitfall**: P31（06-known-pitfalls.md）
- **Phase 5チェック項目**: Store Hookを使用する場合はuseRefガードを検討
- **発見日**: 2026-02-10
- **関連タスク**: UT-FIX-STORE-HOOKS-INFINITE-LOOP-001

## DIサービス追加時のテスト修正パターン（TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE）

- **状況**: 新しいサービスをDependency Injectionで既存クラスに追加する場合
- **問題**: 既存のテストファイルすべてにモックを追加する必要があり、大規模修正が発生
- **苦戦箇所と解決策**:

  | 苦戦箇所               | 問題                        | 解決策                                                                           |
  | ---------------------- | --------------------------- | -------------------------------------------------------------------------------- |
  | テストファイル洗い出し | 影響範囲が不明確            | `grep -rn "new SkillExecutor" apps/desktop/src/` で関連テストを特定              |
  | モック定義の重複       | 5ファイルに同じモックを追加 | 共通テストユーティリティへの抽出を検討                                           |
  | beforeEachリセット忘れ | テスト間で状態がリーク      | `mockAuthKeyService.getKey.mockResolvedValue()` を各beforeEachで明示的にリセット |

- **パターン**:
  1. コンストラクタにオプショナル引数として新サービスを追加（後方互換性維持）
  2. テストファイルごとにモックオブジェクトを定義
  3. beforeEachでモックをリセット
  4. SkillExecutorコンストラクタの第3引数として渡す
- **効果**:
  - 既存テストへの影響を最小化（オプショナル引数）
  - 各テストファイルで独立したモック管理
- **発見日**: 2026-02-08
- **関連タスク**: TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE
- **関連Pitfall**: P21（06-known-pitfalls.md）

## Setter Injectionによる遅延初期化パターン（TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION）

- **状況**: BrowserWindow等の外部リソースを必要とする依存オブジェクトを既存サービスに注入する場合
- **問題**: Constructor Injectionでは、依存オブジェクト（SkillExecutor）がサービス（SkillService）のコンストラクタ時点で未生成のため注入不可能
- **苦戦箇所と解決策**:

  | 苦戦箇所                   | 問題                                        | 解決策                                                             |
  | -------------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
  | 依存オブジェクト未生成     | SkillExecutorはmainWindow生成後に初期化必要 | Setter Injection（`setSkillExecutor()`）で遅延注入                 |
  | null安全性                 | setter呼び出し前のアクセスでnullエラー      | Optional Chainingと未設定時フォールバック（従来ロジック実行）       |
  | テストモック追加の波及     | 既存5テストファイルすべてにモック追加が必要  | 各テストのbeforeEachでモックを設定し、状態をリセット               |

- **パターン（DIパターン使い分け基準）**:

  | パターン               | 使用条件                               | 例                                |
  | ---------------------- | -------------------------------------- | --------------------------------- |
  | Constructor Injection  | 依存オブジェクトが生成時点で利用可能   | AuthKeyService → SkillExecutor    |
  | Setter Injection       | 依存オブジェクトの生成に外部リソース必要 | SkillExecutor → SkillService      |
  | Factory Pattern        | 依存オブジェクトを動的に生成する必要   | リクエストごとのインスタンス生成  |

- **実装例**:
  ```typescript
  // SkillService: Setter Injection
  class SkillService {
    private skillExecutor: SkillExecutor | null = null;

    setSkillExecutor(executor: SkillExecutor): void {
      this.skillExecutor = executor;
    }

    async executeSkill(skillId: string, params: unknown): Promise<Result> {
      if (this.skillExecutor) {
        return this.skillExecutor.execute(skillId, params);
      }
      // フォールバック: 従来の内部ロジック
      return this.executeSkillInternal(skillId, params);
    }
  }

  // 注入タイミング: mainWindow生成後
  const skillExecutor = new SkillExecutor(mainWindow, authKeyService);
  skillService.setSkillExecutor(skillExecutor);
  ```
- **効果**:
  - 外部リソース依存のDI問題を解決
  - 既存コードの後方互換性維持（フォールバック）
  - テスト時にモック注入が容易
- **発見日**: 2026-02-11
- **関連タスク**: TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION
- **関連Pitfall**: P34, P35（06-known-pitfalls.md）

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
