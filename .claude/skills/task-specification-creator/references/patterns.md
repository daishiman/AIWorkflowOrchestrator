# Task Specification Creator パターン集

> フィードバックから発見された成功/失敗パターンを記録

---

## 📌 クイックナビゲーション

| カテゴリ | パターン数 | 説明 |
| -------- | ---------- | ---- |
| [失敗パターン](#失敗パターン) | 4件 | 回避すべきアンチパターン |
| [成功パターン](#成功パターン) | 41+件 | 再利用可能なベストプラクティス |
| [ガイドライン](#ガイドライン) | 6件 | 判断基準・検出パターン・Pitfall登録 |
| [フェーズ境界遷移](#フェーズ境界遷移パターンphase-boundary-transition) | 4件 | Phase間の成果物引き継ぎ |
| [失敗回避](#失敗回避パターン) | 3件 | よくある失敗の未然防止 |
| [単体テスト設計](#単体テスト設計パターンtask-8a) | 4件 | モック・カバレッジ戦略 |
| [E2Eテスト設計](#e2eテスト設計パターンtask-8c-b) | 3件 | Playwright安定化 |
| [CI/DevOps最適化](#cidevops最適化パターン) | 2件 | GitHub Actions並列化 |
| [Main→Renderer IPC](#mainrenderer-ipc実装パターンtask-wce-monaco-001) | 1件 | 逆方向通信パターン |
| [サービス設計](#サービス設計パターンtask-9b-g) | 4件 | Facade・Script First |
| [Zustand Store](#zustand-store-hooks無限ループ対策パターンut-fix-store-hooks-infinite-loop-001) | 1件 | 無限ループ対策・useRefガード |

---

## 🚨 Phase 12 Task 2 クイックリファレンス

> **最重要**: Phase 12 Task 2は漏れが発生しやすい。以下を必ず確認。

| Step | 必須 | チェック項目 | 更新対象 |
| ---- | ---- | ------------ | -------- |
| 1-A  | ✅   | タスク完了記録 | 該当仕様書（ui-ux-*.md等） |
| 1-A  | ✅   | LOGS.md更新 | **aiworkflow-requirements/LOGS.md** |
| 1-A  | ✅   | LOGS.md更新 | **task-specification-creator/LOGS.md** |
| 1-A  | ✅   | SKILL.md変更履歴 | **aiworkflow-requirements/SKILL.md** |
| 1-A  | ✅   | SKILL.md変更履歴 | **task-specification-creator/SKILL.md** |
| 1-B  | △    | 実装状況テーブル | api-endpoints.md等（該当する場合） |
| 1-C  | △    | 関連タスクテーブル | `grep -rn "TASK_ID" references/` で検索 |
| 1-D  | ✅   | topic-map.md再生成 | `node generate-index.js` 実行 |
| 2    | △    | システム仕様更新 | 新規インターフェース追加時のみ |

📖 詳細: [spec-update-workflow.md](./spec-update-workflow.md)

---

## 失敗パターン

### Markdown見出しレベルの誤検出

- **状況**: 検証スクリプトでMarkdownのH2セクション（`##`）を検出して処理範囲を区切る際
- **問題**: `/^##/` パターンがH3（`###`）やH4（`####`）にもマッチし、予期せずループが早期終了した
- **原因**: 正規表現 `/^##/` は「##で始まる」だけを検査し、その後の文字を考慮していないため
- **教訓**: H2のみを検出したい場合は `/^## [^#]/` または `/^## (?!#)/` を使用する
- **発見日**: 2026-01-24
- **修正ファイル**: `scripts/verify-all-specs.js` (Markdown解析部分) ※元のvalidate-phase12-step1.jsは統合済み

### 未タスク検出後のtask-workflow.md登録漏れ（TASK-9B-G）

- **状況**: Phase 12で5件の未タスクを検出し、指示書を作成した
- **問題**: 指示書作成のみで完了と誤認し、task-workflow.mdの残課題テーブルへの登録を忘れた
- **原因**:
  1. 「指示書を作成した = 未タスク管理が完了」という誤った認識
  2. unassigned-task-guidelines.mdの「3ステップ必須」規定の見落とし
  3. documentation-changelog.mdに「完了」と記載したため、再検証をスキップ
- **発見経緯**: Phase 12完了後の検証で、task-workflow.mdに5件のエントリが存在しないことを発見
- **教訓**:
  1. 未タスク検出は**3ステップ全て**を完了して初めて完了: ①指示書作成 → ②task-workflow.md登録 → ③関連仕様書登録
  2. Phase 12完了前に必ずtask-workflow.mdの残課題テーブルを確認
  3. documentation-changelog.mdへの「完了」記載は3ステップ確認後に行う
- **修正**: task-workflow.md v1.13.0で5件追加、patterns.mdに成功パターンとして「未タスク検出→残課題テーブル登録3ステップパターン」を追加
- **発見日**: 2026-02-03
- **関連タスク**: TASK-9B-G

### ネイティブモジュールNODE_MODULE_VERSION不一致（ENV-INFRA-001）

- **状況**: better-sqlite3がNODE_MODULE_VERSION不一致エラー（127 vs 131）で動作しない
- **問題**: pnpm storeに古いNode.jsバージョン用にコンパイルされたバイナリがキャッシュされ続ける
- **原因**:
  1. pnpm storeがネイティブモジュールのバイナリをNode.jsバージョンごとに区別しない
  2. `pnpm install`だけでは既存キャッシュを使い回してしまう
  3. 通常の再ビルドコマンド（`pnpm rebuild`）では解決しない場合がある
- **発見経緯**: Node.js 22.11.0 → 22.13.1更新後にElectronアプリ起動時に即座にクラッシュ
- **教訓**:
  1. NODE_MODULE_VERSION不一致は**pnpm store prune**でキャッシュクリアが必要
  2. その後**pnpm install --force**で再ビルドを強制
  3. .nvmrc/package.json engines/voltaの三重構造でバージョン管理する
  4. CONTRIBUTING.mdにトラブルシューティング手順を記載しておく
- **修正コマンド**:
  ```bash
  pnpm store prune
  pnpm install --force
  ```
- **発見日**: 2026-02-04
- **関連タスク**: ENV-INFRA-001

### Phase 12 Task 2 Step 1-A更新漏れ（task-imp-search-ui-001）

- **状況**: Phase 12 Task 2実行時、タスク完了記録をシステム仕様書に追加した
- **問題**: 以下の3つの必須更新を漏らした
  1. **LOGS.md×2ファイル更新漏れ**: aiworkflow-requirements/LOGS.mdのみ更新し、task-specification-creator/LOGS.mdを忘れた
  2. **SKILL.md変更履歴更新漏れ**: 両スキルの変更履歴にバージョン番号を追記しなかった
  3. **topic-map.md再生成漏れ**: 仕様書更新後にgenerate-index.jsを実行しなかった
- **原因**:
  1. spec-update-workflow.mdの「2ファイル両方更新」要件を見落とし
  2. Step 1-Dの「topic-map.md再生成」を確認せず完了と誤認
  3. documentation-changelog.mdのStep詳細記録が不完全だったため、漏れに気付けなかった
- **教訓**:
  1. Phase 12 Task 2は必ず**Step 1-A〜1-D + Step 2**の全ステップを個別に確認
  2. LOGS.mdは**aiworkflow-requirements + task-specification-creator**の**2ファイル**を更新
  3. SKILL.mdの変更履歴も更新対象（見落としやすい）
  4. 仕様書変更後はgenerate-index.jsで**topic-map.md再生成**が必須
  5. documentation-changelog.mdに各Stepの完了結果を詳細に記録することで漏れを可視化
- **修正**: 全7ファイル（LOGS.md×2、SKILL.md×2、ui-ux-search-panel.md、documentation-changelog.md、topic-map.md）を追加更新
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

### Phase 12出力要件の漏れ

- **状況**: タスク仕様書（phase-12-documentation.md）作成時
- **問題**: スキル仕様（phase-11-12-guide.md）で要求される出力ファイルがタスク仕様書に記載漏れ
- **漏れた要件**:
  1. `implementation-guide.md` Part 1（中学生レベル概念説明）
  2. `documentation-changelog.md`（システム仕様書更新履歴）
  3. `unassigned-task-report.md`（0件でも必須）
- **原因**: タスク仕様書がスキル仕様の全要件を網羅していなかった
- **教訓**: Phase 12タスク仕様書作成時は必ずphase-11-12-guide.mdのTask 1-4を確認
- **発見日**: 2026-01-26
- **関連タスク**: TASK-3-1-D

---

## 成功パターン

### Phase 12出力成果物チェックリスト

- **状況**: Phase 12タスク仕様書・成果物作成時
- **確認項目**:
  1. ✅ `implementation-guide.md` - Part 1（中学生レベル）+ Part 2（開発者向け）
  2. ✅ `api-documentation.md` / `ipc-documentation.md` / `component-documentation.md`
  3. ✅ `documentation-changelog.md` - システム仕様書更新判断と履歴
  4. ✅ `unassigned-task-report.md` - 未タスク検出報告（0件でも必須）
- **根拠**: phase-11-12-guide.md Task 1-4の完全準拠
- **発見日**: 2026-01-26

### Zustand Store Hooks無限ループ対策パターン（UT-FIX-STORE-HOOKS-INFINITE-LOOP-001）

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

### DIサービス追加時のテスト修正パターン（TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE）

- **状況**: 新しいサービスをDependency Injectionで既存クラスに追加する場合
- **問題**: 既存のテストファイルすべてにモックを追加する必要があり、大規模修正が発生
- **苦戦箇所と解決策**:

  | 苦戦箇所 | 問題 | 解決策 |
  | -------- | ---- | ------ |
  | テストファイル洗い出し | 影響範囲が不明確 | `grep -rn "new SkillExecutor" apps/desktop/src/` で関連テストを特定 |
  | モック定義の重複 | 5ファイルに同じモックを追加 | 共通テストユーティリティへの抽出を検討 |
  | beforeEachリセット忘れ | テスト間で状態がリーク | `mockAuthKeyService.getKey.mockResolvedValue()` を各beforeEachで明示的にリセット |

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

### 大規模テスト実行時のVitest Worker対策（TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE）

- **状況**: 9000+テストを含む大規模テストスイート実行時
- **問題**: Vitest Workerが予期せず終了し、テスト結果が不完全になる
- **原因**: メモリ消費やタイムアウトが原因と推定
- **解決策**:
  | 対策 | コマンド/設定 | 効果 |
  | ---- | ------------ | ---- |
  | テスト分割実行 | `pnpm vitest run apps/desktop/src/main/services/skill/` | 対象を絞って安定実行 |
  | ワーカー数制限 | `--poolOptions.workers.max=4` | メモリ消費を抑制 |
  | 並列実行無効化 | `--no-file-parallelism` | 安定性優先 |
- **効果**: 大規模テストスイートでも安定した実行結果を得られる
- **発見日**: 2026-02-08
- **関連タスク**: TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE
- **関連Pitfall**: P22（06-known-pitfalls.md）

### 未タスク仕様書への実装課題継承パターン（TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE）

- **状況**: Phase 12で未タスク指示書を作成する際
- **パターン**: 親タスクで苦戦した箇所を「実装課題と解決策」セクションとして未タスク仕様書に追記
- **構成**:
  ```markdown
  ## 実装課題と解決策（{{PARENT_TASK_ID}}からの学び）

  ### {{PITFALL_ID}}: {{タイトル}}

  **問題**: {{問題の説明}}
  **教訓**: {{得られた教訓}}
  **解決策**: {{解決策}}
  **本タスクへの適用**: {{このタスクでどう活かすか}}
  ```
- **効果**:
  - 将来の実装者が同じ問題に遭遇した際の対処法を事前に把握
  - 06-known-pitfalls.mdとの連携による知見の再利用
  - タスク間での学びの継承
- **発見日**: 2026-02-08
- **関連タスク**: TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE

### IPCチャンネル統合パターン（TASK-FIX-4-1-IPC-CONSOLIDATION）

- **状況**: 重複したIPCチャンネル定義を統合・整理する場合
- **苦戦箇所と解決策**:

  | 苦戦箇所 | 問題 | 解決策 |
  | -------- | ---- | ------ |
  | ハードコード発見 | `"skill:complete" as string`で型チェック・ホワイトリストバイパス | Grepで`as string`パターンを検索し、IPC_CHANNELS定数に置換 |
  | 重複定義整理 | preload/channels.ts vs shared/ipc/channels.tsの重複 | Single Source of Truth（preload/channels.ts）に集約 |
  | ホワイトリスト更新漏れ | ALLOWED_INVOKE_CHANNELSに旧チャンネルが残存 | テストで旧チャンネルが含まれていないことを検証 |

- **検出コマンド**:
  ```bash
  # ハードコード文字列の検出
  grep -rn '"skill:' apps/desktop/src/preload/
  grep -rn 'as string' apps/desktop/src/preload/skill-api.ts
  ```
- **効果**:
  - 型安全性向上（コンパイル時にチャンネル名検証）
  - セキュリティ強化（ホワイトリストバイパス防止）
  - 保守性向上（定義箇所が単一）
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-4-1-IPC-CONSOLIDATION

### TASK-FIX-5-1: SkillAPI二重定義統一

**カテゴリ**: IPC Bridge / Preload API

**成功パターン**:

| パターンID | パターン名 | 説明 | 参照 |
|-----------|-----------|------|------|
| FIX-5-1-S1 | 正本参照パターン | 重複記述を削除し、単一ファイルへの参照リンクで統一 | [architecture-implementation-patterns.md](../../aiworkflow-requirements/references/architecture-implementation-patterns.md) |
| FIX-5-1-S2 | IPCチャンネル数矛盾解消 | 歴史的経緯を注記で説明し、最新参照先を明示 | [interfaces-agent-sdk-skill.md](../../aiworkflow-requirements/references/interfaces-agent-sdk-skill.md) |
| FIX-5-1-S3 | クロスリファレンス表 | P23-P28と実装パターンS1-S5の対応表を追加 | [06-known-pitfalls.md](../../../.claude/rules/06-known-pitfalls.md) |

**失敗パターン**:

| パターンID | パターン名 | 問題 | 回避策 |
|-----------|-----------|------|--------|
| FIX-5-1-F1 | safeInvoke/safeOn 3箇所分散 | 同一内容が3ファイルに分散し、更新時に矛盾発生 | 正本を1箇所に決め、他は参照リンクに |
| FIX-5-1-F2 | IPCチャンネル数不一致（8 vs 13） | 歴史的経緯で数値が異なり混乱 | 注記で経緯を説明、最新値を明示 |
| FIX-5-1-F3 | completed-tasksパス未更新 | タスク完了後もパスが旧形式のまま | 完了時にリンクパスを一括更新 |

### Phase 12 Task 2完全チェックリスト（task-imp-search-ui-001）

- **状況**: Phase 12 Task 2（システム仕様書更新）実行時
- **パターン**: Step 1-A〜1-D + Step 2の全ステップを個別にチェック
- **チェックリスト**:
  | Step | チェック項目 | 更新対象 |
  | ---- | ------------ | -------- |
  | 1-A  | タスク完了記録 | 該当仕様書（ui-ux-*.md等） |
  | 1-A  | LOGS.md更新 | **aiworkflow-requirements/LOGS.md** |
  | 1-A  | LOGS.md更新 | **task-specification-creator/LOGS.md** |
  | 1-A  | SKILL.md変更履歴 | **aiworkflow-requirements/SKILL.md** |
  | 1-A  | SKILL.md変更履歴 | **task-specification-creator/SKILL.md** |
  | 1-B  | 実装状況テーブル | api-endpoints.md等（該当する場合） |
  | 1-C  | 関連タスクテーブル | Grepで検索して確認 |
  | 1-D  | topic-map.md再生成 | `node generate-index.js` 実行 |
  | 2    | システム仕様更新 | 新規インターフェース追加時のみ |
- **効果**: documentation-changelog.mdに各Stepの結果を記録することで漏れを防止
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

### UX改善タスクの構造化（R-ID方式）

- **状況**: 複数のUX改善機能を1タスクで実装する場合
- **パターン**: 各改善点にR1/R2/R3...のようなRequirement IDを付与
- **例**（TASK-3-2-A）:
  - R1: ローディングアニメーション（スピナー表示）
  - R2: タイムスタンプ表示（相対時刻）
  - R3: クリップボードコピー（ワンクリック）
- **効果**:
  - 要件の追跡が容易
  - テストケースとの対応が明確
  - ドキュメントでの参照が統一
- **発見日**: 2026-01-27
- **関連タスク**: TASK-3-2-A

### Part 1概念説明の日常例えパターン

- **状況**: Phase 12 Part 1（中学生レベル）ドキュメント作成時
- **パターン**: 各技術概念に日常生活の身近な例えを対応付ける
- **例**（TASK-3-2-A）:
  | 技術概念 | 日常の例え |
  | -------------------- | ---------------------- |
  | ローディングスピナー | 電子レンジの回る皿 |
  | 相対時刻表示 | LINEのメッセージ時刻 |
  | クリップボードコピー | コピー機のコピーボタン |
- **効果**: 専門用語なしで概念が伝わる
- **発見日**: 2026-01-27
- **関連タスク**: TASK-3-2-A

### ユーティリティ関数の独立分離

- **状況**: コンポーネント内の汎用ロジックを実装する場合
- **パターン**: ロジックをutils/配下の独立ファイルに分離
- **例**（TASK-3-2-A）:
  - `formatRelativeTime()` → `utils/formatTime.ts`
  - コンポーネントから import して使用
- **効果**:
  - 単体テストが容易（100%カバレッジ達成）
  - 再利用性向上
  - コンポーネントのシンプル化
- **発見日**: 2026-01-27
- **関連タスク**: TASK-3-2-A

### コンポーネント同階層ユーティリティファイル配置

- **状況**: 特定コンポーネント専用のフィルタロジックを分離する場合
- **パターン**: コンポーネントと同じディレクトリに`*Utils.ts`として配置（共通utils/ではなく）
- **例**（task-imp-permission-date-filter）:
  - `dateFilterUtils.ts` → `PermissionSettings/dateFilterUtils.ts`（PermissionHistoryFilter.tsx・PermissionHistoryPanel.tsxと同階層）
  - `getDateRangeStartDate()`, `filterByDateRange()` をエクスポート
  - 定数 `DAYS_IN_WEEK=7`, `DAYS_IN_MONTH=30` も同ファイルで管理
- **効果**:
  - コンポーネント固有ロジックの局所性が高い（Feature Cohesion）
  - テストファイルも`__tests__/dateFilterUtils.test.ts`として同階層に配置
  - 22テストケース（境界値・1000件パフォーマンス含む）で98.5%カバレッジ
- **判断基準**: 2ファイル以上で使われるが同機能グループ内→同階層、プロジェクト横断→共通utils/
- **発見日**: 2026-02-02
- **関連タスク**: task-imp-permission-date-filter

### 順次フィルタパイプライン（useMemo チェーン）

- **状況**: 複数の独立したフィルタ条件を組み合わせてリストをフィルタリングする場合
- **パターン**: `useMemo`内で条件ごとに順次フィルタを適用するパイプライン
- **例**（task-imp-permission-date-filter）:
  1. toolNameフィルタ（定義時のみ適用）
  2. decisionフィルタ（定義時のみ適用）
  3. dateRangeフィルタ（`filterByDateRange()`で適用）
- **効果**:
  - 各フィルタが独立しており追加・削除が容易
  - 新フィルタ追加時は既存コードに影響なし（Open-Closed原則）
  - `useMemo`の依存配列で最小限の再計算
- **発見日**: 2026-02-02
- **関連タスク**: task-imp-permission-date-filter

### 将来改善候補の未タスク仕様書変換

- **状況**: Phase 12未タスク検出で「将来改善候補」を発見した場合
- **パターン**: 0件判定後も「将来改善候補」を正式な未タスク仕様書に変換
- **手順**:
  1. Phase 12で「将来改善候補（任意）」として記録
  2. 正式な未タスク仕様書を`unassigned-task/`に作成
  3. unassigned-task-detection.mdに参照リンクを追加
- **例**（TASK-3-2-A）:
  - TASK-3-2-A-EXT-001: タイムスタンプ自動更新
  - TASK-3-2-A-EXT-002: コピーアニメーション強化
  - TASK-3-2-A-EXT-003: UXテキスト多言語対応
- **効果**: 改善アイデアが正式に追跡され、優先度付けされる
- **発見日**: 2026-01-27
- **関連タスク**: TASK-3-2-A

### React Contextによる一括更新パターン

- **状況**: 多数のコンポーネントで共有する値を定期的に更新する場合
- **パターン**: Providerで一元管理し、Context経由で配信
- **例**（TASK-3-2-C）:
  - `TimestampProvider`: 現在時刻を管理
  - `useTimestampContext`: 子コンポーネントで時刻取得
  - 単一の`setInterval`で全MessageTimestampを一括更新
- **効果**:
  - タイマーは1つのみ（パフォーマンス最適化）
  - 全コンポーネントが同期した時刻を参照
  - テストが容易（Provider差し替えでモック可能）
- **発見日**: 2026-01-28
- **関連タスク**: TASK-3-2-C

### 動的更新間隔の適応的最適化

- **状況**: 相対時刻表示の更新間隔を最適化する場合
- **パターン**: 経過時間に応じて更新間隔を動的に調整
- **例**（TASK-3-2-C）:
  | 経過時間 | 更新間隔 | 理由 |
  | ---------- | --------- | -------------------------------- |
  | 1分未満 | 1秒ごと | 「X秒前」表示に必要 |
  | 1分〜1時間 | 1分ごと | 「X分前」表示で十分 |
  | 1時間以上 | 1時間ごと | 「X時間前」表示で十分 |
- **実装**:
  - `calculateUpdateInterval(timestamp, now)`: 単一タイムスタンプ用
  - `calculateMinUpdateInterval(timestamps, now)`: 複数タイムスタンプ用
- **効果**: 必要十分な更新頻度でCPU使用率を最小化
- **発見日**: 2026-01-28
- **関連タスク**: TASK-3-2-C

### Page Visibility APIによるリソース最適化

- **状況**: タブ非表示時に不要な処理を停止する場合
- **パターン**: `usePageVisibility`フックで可視状態を監視し、非表示時は処理停止
- **例**（TASK-3-2-C）:
  - `usePageVisibility()` → `boolean`（true=表示中）
  - `document.visibilitychange`イベントを監視
  - 非表示時は`useInterval`のdelayを`null`に設定
- **効果**:
  - バックグラウンドタブでのCPU使用ゼロ
  - バッテリー消費削減（モバイル/ラップトップ）
  - ブラウザのパフォーマンス最適化に貢献
- **発見日**: 2026-01-28
- **関連タスク**: TASK-3-2-C

### OAuth Implicit FlowのURLフラグメントパース（TASK-FIX-GOOGLE-LOGIN-001）

- **状況**: OAuth Implicit Flowでのコールバック処理時
- **パターン**: URLフラグメント（#）からパラメータを抽出
- **問題**: `url.search`（?以降）ではなく`url.hash`（#以降）にトークン/エラーが返される
- **実装**:
  ```typescript
  const url = new URL(callbackUrl);
  const params = new URLSearchParams(url.hash.slice(1)); // #を除去
  const error = params.get('error');
  const accessToken = params.get('access_token');
  ```
- **注意点**:
  - OAuth Implicit Flow: `#`（hash）にパラメータ
  - OAuth Authorization Code Flow: `?`（search）にパラメータ
  - PKCE実装時はAuthorization Code Flowに変更されるため`url.search`を使用
- **効果**: OAuthコールバックのエラーパラメータを正しく検出・ハンドリング
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-GOOGLE-LOGIN-001

### Zustandリスナー二重登録防止パターン（TASK-FIX-GOOGLE-LOGIN-001）

- **状況**: Zustand storeの`subscribe()`でIPCリスナーを設定する場合
- **問題**: React StrictModeでuseEffectが2回実行され、リスナーが二重登録される
- **パターン**: モジュールスコープのフラグでガード
- **実装**:
  ```typescript
  // authSlice.ts
  let authListenerRegistered = false;

  export const setupAuthStateListener = () => {
    if (authListenerRegistered) return;
    authListenerRegistered = true;

    window.api?.onAuthStateChange((payload) => {
      // リスナー処理
    });
  };

  // テスト用リセット関数
  export const resetAuthListenerFlag = () => {
    authListenerRegistered = false;
  };
  ```
- **テスト時の注意**:
  - モジュールスコープ変数はテスト間で共有される
  - `beforeEach`で`resetAuthListenerFlag()`を呼び出す
- **効果**: React StrictModeでもリスナーが1回だけ登録される
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-GOOGLE-LOGIN-001

### IPC経由のエラー情報伝達設計（TASK-FIX-GOOGLE-LOGIN-001）

- **状況**: Main→Renderer間でOAuthエラー情報を伝達する場合
- **問題**: AUTH_STATE_CHANGEDペイロードにerror情報が含まれておらず、Rendererでエラー表示不可
- **パターン**: ペイロードにerror/errorCodeフィールドを追加
- **実装**:
  ```typescript
  // Main Process (index.ts)
  mainWindow.webContents.send('auth:state-changed', {
    user: session?.user ?? null,
    isAuthenticated: !!session?.user,
    error: errorMessage ?? null,      // 追加
    errorCode: mappedError?.code,     // 追加
  });

  // Renderer (authSlice.ts)
  window.api?.onAuthStateChange((payload) => {
    if (payload.error) {
      set({ error: payload.error, errorCode: payload.errorCode });
    }
  });
  ```
- **効果**: OAuthエラー時にRendererで適切なエラーメッセージを表示可能
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-GOOGLE-LOGIN-001

---

## ガイドライン

### Markdown見出し検出パターン

- **状況**: スクリプトでMarkdownの特定レベルの見出しを検出する場合
- **指針**:
  - H1のみ: `/^# [^#]/`
  - H2のみ: `/^## [^#]/`
  - H3のみ: `/^### [^#]/`
  - H2以上（H1, H2）: `/^#{1,2} [^#]/`
- **根拠**: 見出しの後にはスペースが続き、より深い見出し（例：###）との誤検出を防ぐ
- **発見日**: 2026-01-24

### forwardRef + useImperativeHandle によるテスト可能性向上

- **状況**: コンポーネント内部のハンドラ関数がUIから直接呼び出されず、Function Coverageが不足する場合
- **パターン**: `forwardRef` + `useImperativeHandle` で内部関数をref経由で外部公開
- **例**（TASK-7D）:
  - ChatPanelの `handleImportRequest` がUI要素に未接続
  - `useImperativeHandle(ref, () => ({ handleImportRequest }))` で公開
  - テストでは `React.createRef<ChatPanelHandle>()` + `act()` で呼び出し
- **効果**:
  - Function Coverage 50% → 100%
  - 親コンポーネントからの制御が可能に
  - テストでの内部関数アクセスが型安全に
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

### Exclude型によるType-safe設定マップ

- **状況**: ユニオン型の一部のみを対象とした設定マップを作成する場合
- **パターン**: `Exclude<UnionType, "value">` で対象外の値を除外した型を定義
- **例**（TASK-7D）:
  - `DisplayableStatus = Exclude<SkillExecutionStatus, "idle">`
  - `STATUS_CONFIG: Record<DisplayableStatus, { color: string; label: string }>`
  - 「idle」は表示しないため、設定マップから除外
- **効果**:
  - コンパイル時にすべてのアクティブステータスの設定漏れを検出
  - ランタイムエラーの防止
  - コードの意図が型レベルで明確
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

### Store個別セレクタによる再レンダー最適化

- **状況**: Zustand Storeから複数の状態を取得するコンポーネント
- **パターン**: `useAppStore((s) => s.specificField)` を各フィールドごとに呼び出し
- **例**（TASK-7D）:
  ```
  const selectedSkillName = useAppStore((s) => s.selectedSkillName);
  const streamingMessages = useAppStore((s) => s.streamingMessages);
  const isExecuting = useAppStore((s) => s.isExecuting);
  ```
- **効果**:
  - 無関係な状態変更時の不要な再レンダーを防止
  - パフォーマンス最適化（特にストリーミング中の高頻度更新時）
  - 全状態を一括取得するアンチパターンの回避
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

### 並列バックグラウンドエージェントによるドキュメント生成

- **状況**: Phase 1-12の大量の出力ドキュメントを効率的に生成する場合
- **パターン**: 独立したPhase群ごとにTask agentを並列起動し、バックグラウンド実行
- **例**（TASK-7D）:
  - Agent 1: Phase 1-3（要件分析・設計・レビュー）
  - Agent 2: Phase 4-7（テスト・実装・カバレッジ）
  - Agent 3: Phase 8-10（リファクタリング・品質・最終レビュー）
  - Agent 4: Phase 11（手動テスト）
  - Agent 5: Phase 12（ドキュメント・実装ガイド）
- **効果**:
  - 33個の出力ドキュメントを効率的に生成
  - コード変更とドキュメント生成を並行して実行可能
  - コンテキスト使用量の分散
- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

### Record型による定数スタイルマッピング

- **状況**: TypeScriptのユニオン型に対応するUIスタイルを定義する場合
- **パターン**: `Record<EnumType, StyleObject>` でTailwind CSSクラスを型安全にマッピング
- **例**（task-imp-permission-tool-metadata-001）:
  ```
  const RISK_LEVEL_STYLES: Record<RiskLevel, { bg: string; text: string; border: string }> = {
    Low: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
    ...
  };
  ```
- **効果**:
  - 全リスクレベルのスタイル定義が必須（コンパイル時検証）
  - 新しいリスクレベル追加時に未定義スタイルがコンパイルエラー
  - UIの一貫性保証
- **発見日**: 2026-01-31
- **関連タスク**: task-imp-permission-tool-metadata-001

### IIFE（即時実行関数式）によるインラインJSXレンダリング

- **状況**: JSX内で変数束縛を伴う条件付きレンダリングが必要な場合
- **パターン**: `{(() => { const val = compute(); return <span>{val}</span>; })()}` でインライン実行
- **例**（task-imp-permission-tool-metadata-001）:
  - `getRiskLevel(toolName)` の結果を変数に束縛してバッジスタイルを適用
  - 複数のstyleプロパティ（bg, text, border）を組み合わせるためIIFEで中間変数が必要
- **効果**:
  - 別関数に分離するほどでもない小規模なロジックをインラインで表現
  - className構築に中間変数が使える
  - render関数の肥大化を防止
- **発見日**: 2026-01-31
- **関連タスク**: task-imp-permission-tool-metadata-001

### デフォルトメタデータによる安全側フォールバック

- **状況**: 外部入力（ツール名など）に対してメタデータを提供する場合
- **パターン**: 未定義キーに対してDEFAULT値を返し、安全側にフォールバック
- **例**（task-imp-permission-tool-metadata-001）:
  - `DEFAULT_METADATA = { riskLevel: "Medium", securityImpact: "ツールを実行します" }`
  - `TOOL_METADATA[toolName] ?? DEFAULT_METADATA` でnullish coalescing
  - 未知のツールは「Medium」リスク（安全側の中間値）
- **効果**:
  - 新ツール追加時にUIがクラッシュしない
  - 未定義ツールを「安全」ではなく「中程度リスク」として扱う安全設計
  - Null safety保証
- **発見日**: 2026-01-31
- **関連タスク**: task-imp-permission-tool-metadata-001

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

### Phase 10 MINOR指摘の確実な未タスク変換

- **状況**: Phase 10レビューでMINOR判定の指摘が出た場合
- **パターン**: MINOR指摘はガイドラインに従い**必ず**未タスク仕様書に変換する
- **手順**:
  1. Phase 10レビュー結果からMINOR判定を抽出
  2. unassigned-task-guidelines.md のルール確認（「MINOR判定→未完了タスクとして記録して進行」）
  3. 各MINOR指摘を正式な未タスク仕様書に変換（9セクション形式）
  4. `docs/30-workflows/unassigned-task/` に配置
  5. unassigned-task-detection.md の件数とステータスを更新
- **例**（TASK-8B）:
  - M-01: テスト名命名規則不一致 → `task-component-tests-naming-consistency.md`（優先度: 低）
  - M-02: 未使用import残存 → `task-component-tests-import-cleanup.md`（優先度: 低）
- **判定基準**: 「機能に影響なし」「tree-shakingで除去される」等はタスク化**不要**の理由にならない。ガイドラインではMINOR=即タスク化
- **効果**:
  - MINOR指摘が体系的に管理される
  - 将来のリファクタリング候補が正式に追跡される
  - ガイドライン準拠が保証される
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8B

### Phase 12 Step 1完了チェックリストの厳格遵守

- **状況**: Phase 12 Task 2（システムドキュメント更新）実行後に漏れが発生する場合
- **パターン**: spec-update-workflow.mdの「Step 1完了チェックリスト」を完全に実行してから次に進む
- **誤りやすいポイント**:
  1. **SKILL.md変更履歴の更新漏れ**: 「テストコードのみだから不要」は誤り。タスク完了記録として必ず両方のSKILL.md（aiworkflow-requirements + task-specification-creator）の変更履歴を更新
  2. **未タスク指示書のunassigned-task/配置漏れ**: 検出レポート（unassigned-task-detection.md）作成だけでなく、正式な9セクション形式の指示書を`docs/30-workflows/unassigned-task/`に配置
  3. **task-workflow.md残課題テーブル登録漏れ**: 未タスク検出時は`task-workflow.md`の残課題テーブルに必ず登録
  4. **topic-map.md再生成忘れ**: 新規ファイル追加時は必ず`generate-index.js`を実行して行番号を再同期
- **例**（TASK-8C-C）:
  - 当初「テストコードのみなのでSKILL.md更新不要」と誤判断
  - 再検証で4項目の漏れを発見・修正
  - aiworkflow-requirements/SKILL.md v8.29.0、task-specification-creator/SKILL.md v9.27.0を追記
- **効果**:
  - Phase 12完了前に全ての必須アクションが確実に実行される
  - 再検証・手戻りの削減
  - ドキュメント品質の一貫性確保
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8C-C

### 06-known-pitfalls.mdへの新規Pitfall登録フロー

- **状況**: 実装中に新しい落とし穴（Pitfall）を発見した場合
- **登録フロー**:

  | Step | アクション | 成果物 |
  | ---- | ---------- | ------ |
  | 1 | Pitfall IDの採番 | P31, P32, ... （既存の最大ID + 1） |
  | 2 | 06-known-pitfalls.mdに追記 | 教訓・チェックリスト参照・関連タスクを含む |
  | 3 | patterns.mdに成功パターンを追加 | 解決策・コード例・発見日を含む |
  | 4 | phase-templates.mdにチェック項目を追加（該当Phaseがある場合） | Phase 5等のテンプレートに追記 |

- **Pitfall ID採番ルール**:
  ```
  # 既存の最大IDを確認
  grep -n "^### P[0-9]" .claude/rules/06-known-pitfalls.md | tail -1

  # 例: P30が最大なら、新規はP31
  ```
- **必須セクション**（06-known-pitfalls.md）:
  ```markdown
  ### P{{N}}: {{タイトル}}

  - **教訓**: {{得られた教訓}}
  - **症状**: {{どのような問題が発生するか}}
  - **解決策**: {{解決方法}}
  - **関連タスク**: {{タスクID}}
  ```
- **patterns.mdとの連携**:
  - Pitfallには失敗パターンを記録
  - patterns.mdには成功パターン（解決策）を記録
  - 相互参照リンクで結合
- **効果**:
  - 知見の体系的な蓄積
  - 同じ失敗の再発防止
  - 新規タスクへの学びの継承
- **発見日**: 2026-02-10
- **関連タスク**: UT-FIX-STORE-HOOKS-INFINITE-LOOP-001

---

## フェーズ境界遷移パターン（Phase Boundary Transition）

> タスクの12フェーズ実行において、フェーズ間の成果物・知見の引き継ぎが品質を左右する。以下はTASK-7Dで検証された遷移パターン。

| パターン                                | 説明                                                   | 適用場面                                         |
| --------------------------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| Phase 3 → Phase 4 ゲート                | レビュー結果に基づくテスト設計方針の引き継ぎ           | 設計レビューで発見した懸念事項をテスト仕様に反映 |
| Phase 7 → Phase 8 カバレッジ→リファクタ | カバレッジ不足の原因分析を元にリファクタリング方針決定 | Function Coverage不足 → forwardRef導入           |
| Phase 10 → Phase 11 品質→手動テスト     | 品質チェック結果を手動テストシナリオに反映             | 自動テスト検証済み項目は手動テストからスキップ   |
| Phase 11 → Phase 12 テスト→ドキュメント | 手動テスト結果と品質メトリクスをドキュメントに統合     | テスト結果サマリーを実装ガイドに含める           |

- **発見日**: 2026-01-30
- **関連タスク**: TASK-7D

---

## 失敗回避パターン

> Phase実行中に繰り返し発生した失敗を未然に防ぐための回避策。

| パターン                 | 失敗例                                                                 | 回避策                                             |
| ------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------- |
| artifacts.json同期漏れ   | Phase完了後にartifacts.jsonが未更新                                    | 各Phase完了時に必ずartifacts.jsonを更新            |
| 未タスクファイル配置漏れ | Phase 12で検出した未タスクがdocs/30-workflows/unassigned-task/に未配置 | 検出と同時にファイル生成を実行                     |
| topic-map.md再生成忘れ   | システム仕様書更新後にインデックスが古いまま                           | spec更新後は必ずnode scripts/generate-index.js実行 |

- **発見日**: 2026-01-31
- **関連タスク**: TASK-7D

---

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

## Main→Renderer IPC実装パターン（TASK-WCE-MONACO-001）

> TASK-WCE-MONACO-001のMonaco Editor選択範囲取得実装で検証されたパターン。通常のRenderer→Main方向とは逆の、Main ProcessからRenderer Processの状態を取得するパターン。

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
  3. **関連仕様書登録**: interfaces-*.md等の残課題テーブルにも追加（該当する場合）
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

## 検索/置換UI実装パターン（task-imp-search-ui-001）

> task-imp-search-ui-001のPhase 1-12全工程完了で検証されたパターン。既存実装の高品質活用・E2Eテスト設計・Phase 12漏れ防止の知見。

### 既存実装品質評価パターン

- **状況**: タスク仕様書で計画された実装が、既に高品質で完成している場合
- **パターン**: Phase 5（実装）でギャップ分析を行い、追加実装が不要と判断する
- **判断基準**:
  | 観点 | チェック項目 |
  | ---- | ------------ |
  | 機能網羅性 | 仕様書の要件がすべて実装されているか |
  | テストカバレッジ | 既存テストで80%+カバレッジが達成されているか |
  | エラーハンドリング | エッジケースが適切に処理されているか |
  | アーキテクチャ整合性 | システム仕様に準拠した設計になっているか |
- **例**（task-imp-search-ui-001）:
  - Phase 1要件: SearchPanel/WorkspaceSearch/GlobalShortcut連携
  - 調査結果: SearchService, SearchPanel.tsx, WorkspaceSearchModal.tsx が完全実装済み
  - 判断: 追加実装0件、E2Eテストのみ追加
- **効果**:
  - 不要な重複実装を回避
  - 品質を維持しながらテストカバレッジを向上
  - タスク完了条件は「検証完了」で満たされる
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

### E2Eテスト Page Object パターン（Playwright）

- **状況**: Playwright E2Eテストで複数のテストケースが同じUI操作を共有する場合
- **パターン**: Page Objectクラスを作成し、セレクタとアクションを集約
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
- **効果**:
  - テストの可読性向上（what, not how）
  - セレクタ変更時の修正箇所が1箇所
  - テストケース間のコード共有
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

### generate-index.jsファイル名誤認パターン（回避）

- **状況**: topic-map.md再生成時にスクリプトファイル名を間違える
- **問題**: `generate-index.mjs`と`generate-index.js`の混同
- **誤りパターン**:
  - ❌ `node scripts/generate-index.mjs` → 存在しない
  - ✅ `node scripts/generate-index.js` → 正しい
- **確認方法**:
  ```bash
  ls .claude/skills/aiworkflow-requirements/scripts/
  ```
- **教訓**: spec-update-workflow.mdのコマンド例を直接コピーせず、実ファイル名を確認
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

---

## 外部APIデータ正規化パターン（AUTH-UI-004）

> AUTH-UI-004のGoogleアバター取得修正で検証されたパターン。プロバイダー別のレスポンス形式差異を吸収するパターン。

### プロバイダー別フォールバック優先度パターン

- **状況**: 複数の外部OAuthプロバイダー（Google, GitHub, Discord等）からのデータを統一的に扱う必要がある場合
- **パターン**: Nullish coalescing（`??`）チェーンでプロバイダー別のキー名を優先度順にフォールバック
- **例**（AUTH-UI-004）:
  | プロバイダー | キー名       | 優先度 |
  | ------------ | ------------ | ------ |
  | GitHub       | `avatar_url` | 1      |
  | Discord      | `avatar_url` | 1      |
  | Google       | `picture`    | 2      |
  | その他       | -            | null   |
- **実装**:
  ```
  const avatarUrl = identity_data?.avatar_url ?? identity_data?.picture ?? null;
  ```
- **効果**:
  - 既存プロバイダー（GitHub/Discord）の動作を壊さない
  - 新規プロバイダー（Google）に対応
  - 未知のプロバイダーはnullで安全にフォールバック
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-004

### Phase 12ドキュメント更新5点セット確認パターン

- **状況**: Phase 12のドキュメント更新作業で更新漏れを防止する場合
- **パターン**: 以下の5点セットを必ず確認・実行
- **チェックリスト**:
  | 項目 | 対象ファイル | 確認内容 |
  | ---- | ------------ | -------- |
  | 1    | LOGS.md×2 | aiworkflow-requirements + task-specification-creator の両方 |
  | 2    | SKILL.md×2 | 両スキルの変更履歴にバージョン追加 |
  | 3    | topic-map.md | `node scripts/generate-index.js` 実行 |
  | 4    | documentation-changelog.md | Step 1-A〜Step 2の全結果を記録 |
  | 5    | interfaces-*.md | 完了タスクセクション追加（該当する場合） |
- **効果**:
  - ドキュメント更新漏れの防止
  - 将来の開発者が変更履歴を追跡可能
  - システム仕様書の整合性維持
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-004

### 環境依存テスト分離パターン

- **状況**: ネイティブモジュール（better-sqlite3等）に依存するテストがCI/ローカル環境で異なる結果になる場合
- **パターン**: 環境依存テストを分離し、対象テストのみを明示的に実行
- **例**（AUTH-UI-004）:
  | 問題 | 原因 | 解決策 |
  | ---- | ---- | ------ |
  | better-sqlite3バインディングエラー | グローバルpnpm環境のネイティブモジュール不一致 | 対象テストファイルを明示的に指定（`vitest run path/to/test.ts`） |
- **効果**:
  - 本来テストしたい機能（toLinkedProvider）のテストは正常実行
  - 環境依存問題を本タスクのスコープ外として分離
  - CIとローカルで一貫した結果
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-004

---

## 型定義統合/移行パターン（TASK-FIX-1-1-TYPE-ALIGNMENT）

> TASK-FIX-1-1-TYPE-ALIGNMENTのスキル型定義統合で検証されたパターン。skill-execution.ts → skill.tsへの6型+1定数の移行から得た知見。

### パッケージエクスポート更新チェックパターン

- **状況**: 共有パッケージ（@repo/shared等）で型定義ファイルの追加・統合・削除を行う場合
- **パターン**: 3点セットで必ず更新確認する
- **チェックリスト**:
  | # | ファイル | 確認内容 |
  | - | -------- | -------- |
  | 1 | package.json exports | 新エクスポートパスの追加、旧パスの削除 |
  | 2 | tsup.config.ts entry | ビルドエントリポイントの追加・削除 |
  | 3 | src/index.ts | re-exportの追加・削除 |
- **誤りやすいポイント**:
  - 型定義ファイル自体の変更のみで「完了」と誤認
  - package.json exportsを更新したがtsup.config.tsを忘れる
  - 旧ファイル削除時に旧エクスポートパスを残す
- **効果**:
  - `Module not found`エラーの防止
  - ビルド成功を保証
  - import文が正しく解決される
- **発見日**: 2026-02-04
- **関連タスク**: TASK-FIX-1-1-TYPE-ALIGNMENT

### 型定義ファイルのカバレッジ寄与パターン

- **状況**: 型定義ファイル（.d.ts相当の.ts）のカバレッジが0%で気になる場合
- **パターン**: 型定義ファイルはランタイムコードを含まないため、カバレッジ対象外として扱う
- **判断基準**:
  | ファイル内容 | カバレッジ寄与 | 対応 |
  | ------------ | -------------- | ---- |
  | type/interface定義のみ | 0%（正常） | 無視してOK |
  | export const定数あり | ≥0% | テスト追加検討 |
  | ランタイム関数あり | 要カバレッジ | テスト必須 |
- **効果**:
  - 不要なテスト追加を回避
  - カバレッジ目標の正しい解釈
  - Phase 6/7での混乱防止
- **発見日**: 2026-02-04
- **関連タスク**: TASK-FIX-1-1-TYPE-ALIGNMENT

### Discriminated UnionのDRY原則適用パターン（TASK-FIX-1-1-TYPE-ALIGNMENT）

- **状況**: Discriminated Union型で各バリアントに共通フィールドがある場合
- **パターン**: 共通フィールドをBase型として抽出し、各バリアントでIntersection型として合成
- **例**（TASK-FIX-1-1-TYPE-ALIGNMENT）:
  ```typescript
  // Before: 各バリアントで重複定義
  type SkillStreamMessage =
    | { type: "assistant"; executionId: string; timestamp: number; content: ... }
    | { type: "tool_use"; executionId: string; timestamp: number; content: ... }
    | ...

  // After: Base型抽出でDRY
  interface BaseStreamMessage {
    executionId: string;
    timestamp: number;
  }
  type SkillStreamMessage =
    | (BaseStreamMessage & { type: "assistant"; content: ... })
    | (BaseStreamMessage & { type: "tool_use"; content: ... })
    | ...
  ```
- **効果**:
  - 共通フィールド追加時の修正箇所が1箇所
  - コードの意図が明確（共通 vs バリアント固有）
  - TypeScriptの型推論が正しく機能
- **発見日**: 2026-02-04
- **関連タスク**: TASK-FIX-1-1-TYPE-ALIGNMENT

### import文一括置換の安全性パターン

- **状況**: 型定義の移行でimport文を一括置換する必要がある場合
- **パターン**: sed/awkではなくIDE機能またはEditツールで1ファイルずつ確認しながら置換
- **危険なアプローチ**:
  | 方法 | リスク |
  | ---- | ------ |
  | `sed -i 's/old/new/g'` | 予期しない箇所も置換される可能性 |
  | `find . -exec sed` | ファイル全体への影響が見えない |
  | 正規表現一括置換 | エスケープ漏れで破壊的変更 |
- **安全なアプローチ**:
  | 方法 | メリット |
  | ---- | -------- |
  | IDE Find/Replace（プレビュー付き） | 変更箇所を事前確認可能 |
  | Claude Code Editツール | 1ファイルずつ差分確認 |
  | 手動置換（少数ファイル時） | 確実性が高い |
- **効果**:
  - 意図しない変更の防止
  - 変更の追跡可能性
  - ロールバックが容易
- **発見日**: 2026-02-04
- **関連タスク**: TASK-FIX-1-1-TYPE-ALIGNMENT

---

## 認証UIバグ修正パターン（AUTH-UI-001）

> AUTH-UI-001（認証UIの3つのバグ修正）タスクで検証されたパターン。既実装済みコードの発見と検証、テスト環境問題の切り分けに関する知見。

### 既実装済み修正の発見パターン

- **状況**: バグ修正タスクを開始したが、調査の結果、3つの修正がすべて既に実装済みだった
- **パターン**: Phase 2（設計）の段階で実装コードを詳細に確認し、修正が既に適用されているかを早期に判定
- **例**（AUTH-UI-001）:
  | 修正対象 | 期待する修正 | 実装状況 | 発見箇所 |
  | -------- | ------------ | -------- | -------- |
  | z-index問題 | z-index値を高くする | ✅ 実装済み | AccountSection/index.tsx:501 (`z-[9999]`) |
  | フォールバック | user_metadataへの代替処理 | ✅ 実装済み | profileHandlers.ts:66-85 (`isUserProfilesTableError`) |
  | 状態更新 | fetchLinkedProviders呼び出し | ✅ 実装済み | authSlice.ts:342-345 |
- **効果**:
  - Phase 5（実装）で「変更なし」という結論に至っても、テストと検証で品質を保証
  - 既存実装の正当性をドキュメント化
  - 重複実装のリスク回避
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-001

### テスト環境問題と実装コードの切り分けパターン

- **状況**: テストが失敗しているが、実装コード自体は正常に動作している場合
- **パターン**: テスト失敗の原因が「テスト環境設定」か「実装コードのバグ」かを明確に切り分け、テスト環境問題は未タスク化して本タスクはブロックしない
- **例**（AUTH-UI-001）:
  | テストファイル | 結果 | 原因 | 対応 |
  | -------------- | ---- | ---- | ---- |
  | AccountSection.portal.test.tsx | ✅ 27 PASS | - | - |
  | authSlice.test.ts | ✅ 105 PASS | - | - |
  | profileHandlers.test.ts | ❌ 33 FAIL | IPCモック環境問題 | UT-AUTH-001として未タスク化 |
- **判断基準**:
  1. 手動テスト（Phase 11）で機能が正常動作するか確認
  2. 実装コードのカバレッジが他のテストで補完されているか確認
  3. 失敗原因がモック設定・環境依存であることを特定
- **効果**:
  - 本タスクの完了をテスト環境問題でブロックしない
  - 実装品質と環境品質を分離して管理
  - 適切な優先度で未タスクを管理
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-001, UT-AUTH-001

### React Portalによるz-index問題解決パターン

- **状況**: ドロップダウンメニューやモーダルが他のUI要素に隠れる場合
- **パターン**: React Portalで要素をbody直下にテレポートし、高いz-index値（z-[9999]）を適用
- **例**（AUTH-UI-001）:
  - アバター編集メニューがサイドバー（z-50）に隠れる問題
  - 解決: `createPortal()` + `z-[9999]`クラス適用
- **z-index階層設計**:
  | z-index値 | 用途 | 例 |
  | --------- | ---- | -- |
  | z-0 | 通常コンテンツ | メインコンテンツ |
  | z-10 | 浮遊要素 | カード、パネル |
  | z-50 | サイドバー・ドロップダウン | 通常のドロップダウン |
  | z-[100] | モーダル | 確認ダイアログ |
  | z-[9999] | ポップアップメニュー | アバター編集メニュー |
  | z-[10000] | 緊急通知 | エラートースト |
- **効果**:
  - 親要素のstacking contextに依存しない
  - 確実に最前面に表示される
  - z-index戦争（無秩序なz-index値の競争）を回避
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-001

### Supabase認証状態変更イベント後の即時UI更新パターン

- **状況**: OAuthプロバイダーの連携解除後にUIがすぐに更新されない場合
- **パターン**: `AUTH_STATE_CHANGED`イベントハンドラ内で関連データを再取得
- **例**（AUTH-UI-001）:
  - 連携解除後、`fetchLinkedProviders()`を呼び出してプロバイダー一覧を更新
  - `fetchProfile()`でプロフィール情報も同時に更新
- **実装**:
  | イベント | 処理 | 目的 |
  | -------- | ---- | ---- |
  | AUTH_STATE_CHANGED | fetchProfile() | ユーザー名・アバター更新 |
  | AUTH_STATE_CHANGED | fetchLinkedProviders() | 連携プロバイダー一覧更新 |
- **効果**:
  - リロードなしでUIが即座に更新される
  - ユーザー体験の向上（3秒以内の更新を保証）
  - 状態の一貫性を維持
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-001

### Phase 12 ドキュメント更新の完全性保証パターン

- **状況**: Phase 12の初回パスで更新漏れが多数発生する（DEBT-SEC-001では9件の漏れ）
- **問題**: Phase 12の更新対象が多岐にわたり（SKILL.md x2, LOGS.md x2, topic-map.md, completed-tasks移動, task-workflow.md, 関連仕様書, artifacts.json等）、記憶に頼ると必ず漏れが発生する
- **パターン**: 以下の3段階で機械的に完全性を保証する
  1. **開始前**: `06-known-pitfalls.md` を読み直し、P1〜P4パターンを意識に上げる
  2. **対象列挙**: `grep -rn "TASK_ID" references/` で更新対象を事前に全列挙する
  3. **消化**: `05-task-execution.md` のPhase 12チェックリストを1ステップずつ機械的に消化する（全Step確認前に「完了」と記載しない）
- **例**（DEBT-SEC-001）:
  | 漏れた項目 | 該当する既知パターン | 原因 |
  | ---------- | -------------------- | ---- |
  | SKILL.md x2 未更新 | P1（LOGS.md 2ファイル更新漏れの変種） | 2ファイル更新が必要なことを忘れた |
  | topic-map.md 未再生成 | P2 | `node generate-index.js` 実行を忘れた |
  | task-workflow.md 未登録 | P3（未タスク3ステップ不完全） | 指示書作成のみで完了と誤認 |
  | documentation-changelog.md 早期完了記載 | P4 | 全Step確認前に「完了」と記載 |
- **効果**:
  - 既知パターンの再現を事前に防止できる
  - 更新対象の見落としを grep による機械的列挙で防止
  - チェックリストの段階的消化で進捗を可視化
- **発見日**: 2026-02-06
- **関連タスク**: DEBT-SEC-001

### 未タスク「既存タスクに包含」判断の追跡性確保パターン

- **状況**: Phase 12 Task 4（未タスク検出）で、検出した未タスクを「既存タスクのスコープに包含される」と判断して独立タスク化しない場合
- **問題**: 包含と判断しただけでは、包含先の仕様書にそのスコープが明記されず、後で実装漏れが発生するリスクがある
- **パターン**: 包含判断時に以下の2ステップを必ず実行する
  1. **包含先の仕様書更新**: 包含先タスクの仕様書の「含むもの」セクション（またはスコープ定義）に、包含される内容を明示的に追記する
  2. **task-workflow.md登録**: 残課題テーブルに「包含先: TASK-XXX」の形式で記録し、追跡可能にする
- **例**（DEBT-SEC-001）:
  - 未タスク UT-SEC-001（state parameterのユニットテスト不足）をDEBT-SEC-002（PKCE実装）のスコープに包含
  - DEBT-SEC-002の仕様書に「state parameterテスト拡充もスコープに含む」を追記
  - task-workflow.md残課題テーブルに登録
- **判断基準**:
  | 条件 | 対応 |
  | ---- | ---- |
  | 包含先タスクが明確に存在する | 包含先仕様書にスコープ追記 + task-workflow.md登録 |
  | 包含先タスクが不明確 | 独立した未タスク仕様書を作成（3ステップ完全実施） |
  | 複数タスクにまたがる可能性 | 独立した未タスク仕様書を作成 |
- **効果**:
  - 包含判断の追跡性を確保
  - 包含先タスク実装時にスコープ漏れを防止
  - P3パターン（未タスク3ステップ不完全）の変種を防止
- **発見日**: 2026-02-06
- **関連タスク**: DEBT-SEC-001, UT-SEC-001, DEBT-SEC-002

---
## 変更履歴

| Date           | Changes                                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2026-02-10** | **UT-FIX-STORE-HOOKS-INFINITE-LOOP-001知見追加**: Zustand Store Hooks無限ループ対策パターン追加（useRefガード）。06-known-pitfalls.md連携強化（新規Pitfall登録フロー）。クイックナビゲーション更新 |
| **2026-02-06** | **DEBT-SEC-001知見追加**: 成功パターン2件（Phase 12ドキュメント更新の完全性保証、未タスク「既存タスクに包含」判断の追跡性確保）                      |
| **2026-02-04** | **AUTH-UI-001知見追加**: 認証UIバグ修正パターン4件（既実装発見、テスト環境切り分け、React Portal z-index、認証状態変更後UI更新）                    |
| **2026-02-04** | **patterns.md構造最適化**: クイックナビゲーション・Phase 12 Task 2クイックリファレンス追加、search-replace-ui実装パターン3件追加（既存実装品質評価、Page Object、generate-index.jsファイル名誤認回避） |
| **2026-02-04** | **AUTH-UI-004知見追加**: 外部APIデータ正規化パターン3件（プロバイダー別フォールバック、Phase 12ドキュメント5点セット、環境依存テスト分離）           |
| **2026-02-04** | **TASK-FIX-1-1-TYPE-ALIGNMENT知見追加**: 型定義統合/移行パターン4件（パッケージエクスポート更新チェック、型定義ファイルカバレッジ、Discriminated Union DRY、import文一括置換安全性） |
| **2026-02-03** | **マージ統合**: TASK-9B-G（サービス設計パターン4件）+ TASK-9C/9A-A（SDK統合パターン5件）を統合                                                       |
| **2026-02-03** | **TASK-9B-G失敗パターン追加: 未タスク検出後のtask-workflow.md登録漏れ（3ステップ必須の誤認パターン）**                                               |
| **2026-02-03** | **TASK-9B-G知見追加: サービス設計パターン4件（Script First/Progressive Disclosure統合、Facadeパターン、定数外部化、未タスク検出3ステップ）**         |
| **2026-02-03** | **TASK-9C知見追加: 成功パターン3件（Graceful SDK Fallbackパターン、queryFn DIパターン、スキル名バリデーション禁止文字サニタイズ）**                  |
| **2026-02-03** | **TASK-WCE-MONACO-001知見追加: Main→Renderer IPC実装パターン（webContents.executeJavaScript逆方向クエリ、課題ID MR-01〜MR-04）**                     |
| **2026-02-03** | **TASK-9A-A知見追加: 成功パターン2件（ESModuleモッキング回避パターン、汎用エラーアサーションパターン）**                                             |
| **2026-02-02** | **TASK-8C-C知見追加: 成功パターン1件（Phase 12 Step 1完了チェックリストの厳格遵守 - SKILL.md更新漏れ/未タスク配置漏れ/topic-map.md再生成忘れ防止）** |
| **2026-02-02** | **TASK-8C-B知見追加: E2Eテスト設計パターン3件（ARIA属性ベースセレクタ優先、E2Eヘルパー関数分離、安定性対策3層）**                                    |
| **2026-02-02** | **TASK-OPT-CI-TEST-PARALLEL-001知見追加: CI/DevOps最適化パターン2件（GitHub Actionsテスト並列実行、DevOps仕様書更新）**                              |
| **2026-02-02** | **TASK-8B知見追加: 成功パターン1件（Phase 10 MINOR指摘の確実な未タスク変換）**                                                                       |
| **2026-02-02** | **TASK-8A知見追加: 成功パターン4件（カバレッジ閾値免除判定、ギャップ分析ベースTDD、未タスク検出P3全件記録、vi.doMock動的再読み込み）**               |
| 2026-02-01     | TASK-8C-G知見追加: 成功パターン3件（境界値フィクスチャ設計、parseFrontmatter構造化検証、execSync決定論的テスト）                                     |
| 2026-02-01     | task-imp-permission-tool-metadata-001知見追加: 成功パターン3件（Record型スタイルマッピング、IIFEレンダリング、デフォルトメタデータフォールバック）   |
| 2026-01-31     | TASK-7D知見体系化: フェーズ境界遷移パターン（4件）・失敗回避パターン（3件）追加                                                                      |
| 2026-01-30     | TASK-7Dフィードバック反映: 成功パターン4件追加（forwardRef テスト、Exclude型設定マップ、個別セレクタ、並列エージェント）                             |
| 2026-01-28     | TASK-3-2-Cフィードバック反映: 成功パターン3件追加（React Context一括更新、動的更新間隔、Page Visibility API）                                        |
| 2026-01-27     | TASK-3-2-Aフィードバック反映: 成功パターン5件追加（R-ID方式、日常例え、ユーティリティ分離、未タスク変換）                                            |
| 2026-01-26     | Phase 12出力要件漏れパターン追加、成功パターンにチェックリスト追加                                                                                   |
| 2026-01-24     | 初版作成、Markdown見出しパターン追加                                                                                                                 |
