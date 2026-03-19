# パターン集: 成功パターン - 実装・IPC・OAuth・UI

> 元ファイル: `patterns.md` から分割
> 読み込み条件: IPC統合、OAuth、UIコンポーネント、テスト実行の実装パターンを参照したい時。

## 大規模テスト実行時のVitest Worker対策（TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE）

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

## 未タスク仕様書への実装課題継承パターン（TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE）

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

## IPCチャンネル統合パターン（TASK-FIX-4-1-IPC-CONSOLIDATION）

- **状況**: 重複したIPCチャンネル定義を統合・整理する場合
- **苦戦箇所と解決策**:

  | 苦戦箇所               | 問題                                                             | 解決策                                                    |
  | ---------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
  | ハードコード発見       | `"skill:complete" as string`で型チェック・ホワイトリストバイパス | Grepで`as string`パターンを検索し、IPC_CHANNELS定数に置換 |
  | 重複定義整理           | preload/channels.ts vs shared/ipc/channels.tsの重複              | Single Source of Truth（preload/channels.ts）に集約       |
  | ホワイトリスト更新漏れ | ALLOWED_INVOKE_CHANNELSに旧チャンネルが残存                      | テストで旧チャンネルが含まれていないことを検証            |

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

## TASK-FIX-5-1: SkillAPI二重定義統一

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

## Phase 12 Task 2完全チェックリスト（task-imp-search-ui-001）

- **状況**: Phase 12 Task 2（システム仕様書更新）実行時
- **パターン**: Step 1-A〜1-D + Step 2の全ステップを個別にチェック
- **チェックリスト**:
  | Step | チェック項目 | 更新対象 |
  | ---- | ------------ | -------- |
  | 1-A | タスク完了記録 | 該当仕様書（ui-ux-\*.md等） |
  | 1-A | LOGS.md更新 | **aiworkflow-requirements/LOGS.md** |
  | 1-A | LOGS.md更新 | **task-specification-creator/LOGS.md** |
  | 1-A | SKILL.md変更履歴 | **aiworkflow-requirements/SKILL.md** |
  | 1-A | SKILL.md変更履歴 | **task-specification-creator/SKILL.md** |
  | 1-B | 実装状況テーブル | api-endpoints.md等（該当する場合） |
  | 1-C | 関連タスクテーブル | Grepで検索して確認 |
  | 1-D | topic-map.md再生成 | `node generate-index.js` 実行 |
  | 2 | システム仕様更新 | 新規インターフェース追加時のみ |
- **効果**: documentation-changelog.mdに各Stepの結果を記録することで漏れを防止
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

## UX改善タスクの構造化（R-ID方式）

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

## Part 1概念説明の日常例えパターン

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

## ユーティリティ関数の独立分離

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

## コンポーネント同階層ユーティリティファイル配置

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

## 順次フィルタパイプライン（useMemo チェーン）

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

## 将来改善候補の未タスク仕様書変換

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

## 親タスク苦戦箇所の事後未タスク化（TASK-UI-04C follow-up）

- **状況**: Phase 12 完了時点では task 内修正で閉じたため `新規未タスク 0件` と判定したが、後から親タスクの苦戦箇所が cross-cutting guard として再利用価値を持つと判断した場合
- **パターン**: 親タスクの苦戦箇所を新規未タスクへ formalize し、`unassigned-task-detection.md` / `spec-update-summary.md` / `documentation-changelog.md` を 0→1 へ再同期する
- **手順**:
  1. 親タスクの `苦戦箇所` と `5分解決カード` から、feature 内修正で閉じたものと共通ガードへ昇格すべきものを分離する
  2. `docs/30-workflows/unassigned-task/` に 9セクション形式の未タスク指示書を作成し、`3.5 実装課題と解決策` に親タスク教訓を転記する
  3. `task-workflow.md` と関連仕様書へ同一 ID を登録し、`verify-unassigned-links` を実行する
  4. 親 workflow の `unassigned-task-detection.md` / `spec-update-summary.md` / `documentation-changelog.md` / 必要に応じて `phase12-task-spec-compliance-check.md` を同じ件数へ更新する
- **例**（TASK-UI-04C）:
  - `UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001`
  - fuzzy no-match、renderer timeout+retry、parse/transport 分離を preview/search 共通ガードへ昇格
- **効果**:
  - 「task 内で直した」ことと「次回の初動短縮に必要な共通ガード」を分けて追跡できる
  - Phase 12 成果物の 0件判定が後日 stale になるのを防げる
  - 親タスクの苦戦箇所を未タスクへ転記する判断基準が明確になる
- **発見日**: 2026-03-11
- **関連タスク**: TASK-UI-04C-WORKSPACE-PREVIEW

## React Contextによる一括更新パターン

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

## 動的更新間隔の適応的最適化

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

## Page Visibility APIによるリソース最適化

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

## OAuth Implicit FlowのURLフラグメントパース（TASK-FIX-GOOGLE-LOGIN-001）

- **状況**: OAuth Implicit Flowでのコールバック処理時
- **パターン**: URLフラグメント（#）からパラメータを抽出
- **問題**: `url.search`（?以降）ではなく`url.hash`（#以降）にトークン/エラーが返される
- **実装**:
  ```typescript
  const url = new URL(callbackUrl);
  const params = new URLSearchParams(url.hash.slice(1)); // #を除去
  const error = params.get("error");
  const accessToken = params.get("access_token");
  ```
- **注意点**:
  - OAuth Implicit Flow: `#`（hash）にパラメータ
  - OAuth Authorization Code Flow: `?`（search）にパラメータ
  - PKCE実装時はAuthorization Code Flowに変更されるため`url.search`を使用
- **効果**: OAuthコールバックのエラーパラメータを正しく検出・ハンドリング
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-GOOGLE-LOGIN-001

## Zustandリスナー二重登録防止パターン（TASK-FIX-GOOGLE-LOGIN-001）

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

## IPC経由のエラー情報伝達設計（TASK-FIX-GOOGLE-LOGIN-001）

- **状況**: Main→Renderer間でOAuthエラー情報を伝達する場合
- **問題**: AUTH_STATE_CHANGEDペイロードにerror情報が含まれておらず、Rendererでエラー表示不可
- **パターン**: ペイロードにerror/errorCodeフィールドを追加
- **実装**:

  ```typescript
  // Main Process (index.ts)
  mainWindow.webContents.send("auth:state-changed", {
    user: session?.user ?? null,
    isAuthenticated: !!session?.user,
    error: errorMessage ?? null, // 追加
    errorCode: mappedError?.code, // 追加
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
