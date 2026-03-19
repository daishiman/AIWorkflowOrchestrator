# UI・IPC・モジュール管理パターン集

> 親ファイル: [patterns.md](patterns.md)
> 分割元: [patterns-testing-and-implementation.md](patterns-testing-and-implementation.md)

## 目的

UI設計、IPC・Electron実装、パッケージ管理で検証された実践パターン。

---

## UI設計パターン

### コンポーネント同階層ユーティリティファイル配置

- **パターン**: コンポーネントと同じディレクトリに`*Utils.ts`として配置
- **判断基準**: 2ファイル以上で使われるが同機能グループ内→同階層、プロジェクト横断→共通utils/
- **発見日**: 2026-02-02
- **関連タスク**: task-imp-permission-date-filter

### 順次フィルタパイプライン（useMemo チェーン）

- **パターン**: `useMemo`内で条件ごとに順次フィルタを適用するパイプライン
- **効果**: 各フィルタが独立しており追加・削除が容易（Open-Closed原則）
- **発見日**: 2026-02-02
- **関連タスク**: task-imp-permission-date-filter

### IIFE（即時実行関数式）によるインラインJSXレンダリング

- **パターン**: `{(() => { const val = compute(); return <span>{val}</span>; })()}` でインライン実行
- **効果**: 別関数に分離するほどでもない小規模なロジックをインラインで表現
- **発見日**: 2026-01-31
- **関連タスク**: task-imp-permission-tool-metadata-001

### デフォルトメタデータによる安全側フォールバック

- **パターン**: 未定義キーに対してDEFAULT値を返し、安全側にフォールバック
- **例**（task-imp-permission-tool-metadata-001）:
  - `DEFAULT_METADATA = { riskLevel: "Medium", securityImpact: "ツールを実行します" }`
  - `TOOL_METADATA[toolName] ?? DEFAULT_METADATA` でnullish coalescing
- **発見日**: 2026-01-31
- **関連タスク**: task-imp-permission-tool-metadata-001

### React Portalによるz-index問題解決パターン

- **パターン**: React Portalで要素をbody直下にテレポートし、高いz-index値（z-[9999]）を適用
- **z-index階層設計**:
  | z-index値 | 用途 | 例 |
  | --------- | ---- | -- |
  | z-0 | 通常コンテンツ | メインコンテンツ |
  | z-10 | 浮遊要素 | カード、パネル |
  | z-50 | サイドバー・ドロップダウン | 通常のドロップダウン |
  | z-[100] | モーダル | 確認ダイアログ |
  | z-[9999] | ポップアップメニュー | アバター編集メニュー |
  | z-[10000] | 緊急通知 | エラートースト |
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-001

---

## IPC・Electron実装パターン

### IPCチャンネル統合パターン（TASK-FIX-4-1-IPC-CONSOLIDATION）

- **苦戦箇所と解決策**:
  | 苦戦箇所 | 問題 | 解決策 |
  | -------- | ----- | ------ |
  | ハードコード発見 | `"skill:complete" as string`で型チェックバイパス | Grepで`as string`パターンを検索し、IPC_CHANNELS定数に置換 |
  | 重複定義整理 | preload/channels.ts vs shared/ipc/channels.tsの重複 | Single Source of Truth に集約 |
  | ホワイトリスト更新漏れ | ALLOWED_INVOKE_CHANNELSに旧チャンネルが残存 | テストで旧チャンネルが含まれていないことを検証 |
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-4-1-IPC-CONSOLIDATION

### IPC経由のエラー情報伝達設計

- **パターン**: ペイロードにerror/errorCodeフィールドを追加
- **実装**:
  ```typescript
  // Main Process
  mainWindow.webContents.send("auth:state-changed", {
    user: session?.user ?? null,
    isAuthenticated: !!session?.user,
    error: errorMessage ?? null,
    errorCode: mappedError?.code,
  });
  ```
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-GOOGLE-LOGIN-001

### webContents.executeJavaScript逆方向クエリパターン

- **状況**: Main ProcessからRenderer ProcessのUI状態（Monaco Editorの選択範囲等）を取得する必要がある場合
- **実装**:
  | 要素 | 実装 |
  | ---- | ---- |
  | グローバルブリッジ | `window.__editorSelection = { getSelection: () => {...} }` |
  | Main側クエリ | `webContents.executeJavaScript('window.__editorSelection?.getSelection()')` |
- **課題と解決策**:
  | 課題ID | 課題 | 解決策 |
  | ------ | ---- | ------ |
  | MR-01 | webContentsがnull | focusedWebContents ?? firstWebContentsのフォールバック |
  | MR-02 | 未登録エラー | Optional chaining（`?.`）使用 |
  | MR-04 | TypeScript型エラー | `declare global { interface Window { __xxx?: {...} } }` |
- **発見日**: 2026-02-03
- **関連タスク**: TASK-WCE-MONACO-001

### IPC戻り値型2ステップ変換パターン

- **状況**: `skill:import` IPC ハンドラが `ImportResult` を返すが、Renderer は `ImportedSkill` を期待
- **パターン**: 2ステップ呼び出し: (1)操作実行（importSkills）→ (2)データ取得（getSkillByName）
- **教訓**:
  | # | 苦戦ポイント | 教訓 |
  | --- | --- | --- |
  | 1 | IPC インターフェース不整合がランタイムまで検出不可 | ランタイム型チェックを必ず入れる |
  | 2 | ImportResult と ImportedSkill の型形状が完全に異なる | POST系は「操作＋取得」の2ステップを標準化 |
  | 3 | 引数名の契約ドリフト（skillId vs skillName） | 引数名は実際の値のセマンティクスに合致させる |
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-IMPORT-RETURN-TYPE-001

### P44 IPCインターフェース不整合の体系的修正パターン

- **パターン**: 「呼び出し元が多い側を変更しない」鉄則に基づき、ハンドラ側をPreloadに合わせて修正する
- **修正手順**:
  1. Preload側（正しい方）の引数形式を確認し、ハンドラをその形式に合わせて修正
  2. P42準拠の3段バリデーション追加（`typeof` → `=== ""` → `.trim() === ""`）
  3. 配列ラップ `[skillName]` でサービス層API互換性を維持
- **発見日**: 2026-02-21
- **関連タスク**: UT-FIX-SKILL-IMPORT-INTERFACE-001

---

## パッケージ・モジュール管理

### パッケージエクスポート更新チェックパターン

- **チェックリスト**:
  | # | ファイル | 確認内容 |
  | - | -------- | -------- |
  | 1 | package.json exports | 新エクスポートパスの追加、旧パスの削除 |
  | 2 | tsup.config.ts entry | ビルドエントリポイントの追加・削除 |
  | 3 | src/index.ts | re-exportの追加・削除 |
- **発見日**: 2026-02-04
- **関連タスク**: TASK-FIX-1-1-TYPE-ALIGNMENT

### OAuth Implicit FlowのURLフラグメントパース

- **パターン**: URLフラグメント（#）からパラメータを抽出
- **実装**:
  ```typescript
  const url = new URL(callbackUrl);
  const params = new URLSearchParams(url.hash.slice(1)); // #を除去
  const error = params.get("error");
  const accessToken = params.get("access_token");
  ```
- **注意点**: OAuth Implicit Flow: `#`（hash）、OAuth Authorization Code Flow: `?`（search）
- **発見日**: 2026-02-05
- **関連タスク**: TASK-FIX-GOOGLE-LOGIN-001

### プロバイダー別フォールバック優先度パターン

- **パターン**: Nullish coalescing（`??`）チェーンでプロバイダー別のキー名を優先度順にフォールバック
- **実装**:
  ```
  const avatarUrl = identity_data?.avatar_url ?? identity_data?.picture ?? null;
  ```
- **発見日**: 2026-02-04
- **関連タスク**: AUTH-UI-004
