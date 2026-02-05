# チャンネル棚卸しリスト

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 1               |
| 作成日 | 2026-02-04      |
| 作成者 | Claude Opus 4.5 |

---

## 1. 現状のIPCチャンネル定義

### 1.1 preload/channels.ts（正の定義ファイル）

#### スキル管理チャンネル（旧）

| 定数名               | チャンネル文字列       | 用途               | 状態   |
| -------------------- | ---------------------- | ------------------ | ------ |
| SKILL_LIST_AVAILABLE | `skill:list-available` | 利用可能スキル取得 | 要統一 |
| SKILL_LIST_IMPORTED  | `skill:list-imported`  | インポート済み取得 | 要統一 |
| SKILL_IMPORT         | `skill:import`         | スキルインポート   | 維持   |
| SKILL_REMOVE         | `skill:remove`         | スキル削除         | 維持   |
| SKILL_GET_DETAIL     | `skill:get-detail`     | スキル詳細取得     | 維持   |
| SKILL_EXECUTE        | `skill:execute`        | スキル実行         | 維持   |
| SKILL_STREAM         | `skill:stream`         | ストリーム         | 維持   |
| SKILL_ABORT          | `skill:abort`          | 実行中断           | 維持   |
| SKILL_GET_STATUS     | `skill:get-status`     | 状態取得           | 維持   |

#### スキルインポートチャンネル（新・TASK-4-1）

| 定数名                    | チャンネル文字列            | 用途                 | 状態 |
| ------------------------- | --------------------------- | -------------------- | ---- |
| SKILL_LIST                | `skill:list`                | スキル一覧取得       | 維持 |
| SKILL_SCAN                | `skill:scan`                | ディレクトリスキャン | 維持 |
| SKILL_GET_IMPORTED        | `skill:getImported`         | インポート済み取得   | 維持 |
| SKILL_UPDATE              | `skill:update`              | 設定更新             | 維持 |
| SKILL_COMPLETE            | `skill:complete`            | 完了イベント         | 維持 |
| SKILL_ERROR               | `skill:error`               | エラーイベント       | 維持 |
| SKILL_PERMISSION_REQUEST  | `skill:permission:request`  | 権限リクエスト       | 維持 |
| SKILL_PERMISSION_RESPONSE | `skill:permission:response` | 権限レスポンス       | 維持 |

#### スキル改善チャンネル（TASK-9C）

| 定数名                  | チャンネル文字列          | 用途             | 状態 |
| ----------------------- | ------------------------- | ---------------- | ---- |
| SKILL_ANALYZE           | `skill:analyze`           | スキル分析       | 維持 |
| SKILL_IMPROVE           | `skill:improve`           | スキル改善       | 維持 |
| SKILL_OPTIMIZE          | `skill:optimize`          | プロンプト最適化 | 維持 |
| SKILL_OPTIMIZE_VARIANTS | `skill:optimize:variants` | バリアント生成   | 維持 |
| SKILL_OPTIMIZE_EVALUATE | `skill:optimize:evaluate` | プロンプト評価   | 維持 |

---

### 1.2 packages/shared/src/ipc/channels.ts（重複定義）

| 定数名                    | チャンネル文字列            | 状態 |
| ------------------------- | --------------------------- | ---- |
| SKILL_LIST                | `skill:list`                | 重複 |
| SKILL_IMPORT              | `skill:import`              | 重複 |
| SKILL_REMOVE              | `skill:remove`              | 重複 |
| SKILL_EXECUTE             | `skill:execute`             | 重複 |
| SKILL_ABORT               | `skill:abort`               | 重複 |
| SKILL_STREAM              | `skill:stream`              | 重複 |
| SKILL_PERMISSION_REQUEST  | `skill:permission:request`  | 重複 |
| SKILL_PERMISSION_RESPONSE | `skill:permission:response` | 重複 |

---

## 2. ハードコード文字列の使用箇所

| ファイル               | 行番号 | コード                       | 対応       |
| ---------------------- | ------ | ---------------------------- | ---------- |
| `preload/skill-api.ts` | 233    | `"skill:complete" as string` | 定数に置換 |
| `preload/skill-api.ts` | 243    | `"skill:error" as string`    | 定数に置換 |

---

## 3. ホワイトリスト登録状況

### ALLOWED_INVOKE_CHANNELS（Renderer→Main）

| チャンネル                | 登録状態 |
| ------------------------- | -------- |
| SKILL_LIST_AVAILABLE      | ✓        |
| SKILL_LIST_IMPORTED       | ✓        |
| SKILL_IMPORT              | ✓        |
| SKILL_REMOVE              | ✓        |
| SKILL_GET_DETAIL          | ✓        |
| SKILL_EXECUTE             | ✓        |
| SKILL_ABORT               | ✓        |
| SKILL_GET_STATUS          | ✓        |
| SKILL_LIST                | ✓        |
| SKILL_SCAN                | ✓        |
| SKILL_GET_IMPORTED        | ✓        |
| SKILL_UPDATE              | ✓        |
| SKILL_PERMISSION_RESPONSE | ✓        |
| SKILL_ANALYZE             | ✓        |
| SKILL_IMPROVE             | ✓        |
| SKILL_OPTIMIZE            | ✓        |
| SKILL_OPTIMIZE_VARIANTS   | ✓        |
| SKILL_OPTIMIZE_EVALUATE   | ✓        |

### ALLOWED_ON_CHANNELS（Main→Renderer）

| チャンネル               | 登録状態 |
| ------------------------ | -------- |
| SKILL_STREAM             | ✓        |
| SKILL_COMPLETE           | ✓        |
| SKILL_ERROR              | ✓        |
| SKILL_PERMISSION_REQUEST | ✓        |

---

## 4. Main Processハンドラー実装状況

| チャンネル定数          | ハンドラー実装 | ファイル             |
| ----------------------- | -------------- | -------------------- |
| SKILL_LIST_AVAILABLE    | ✓              | skillHandlers.ts:42  |
| SKILL_LIST_IMPORTED     | ✓              | skillHandlers.ts:72  |
| SKILL_IMPORT            | ✓              | skillHandlers.ts:116 |
| SKILL_REMOVE            | ✓              | skillHandlers.ts:136 |
| SKILL_GET_DETAIL        | ✓              | skillHandlers.ts:153 |
| SKILL_EXECUTE           | ✓              | skillHandlers.ts:184 |
| SKILL_ABORT             | ✓              | skillHandlers.ts:216 |
| SKILL_GET_STATUS        | ✓              | skillHandlers.ts:236 |
| SKILL_ANALYZE           | ✓              | skillHandlers.ts:270 |
| SKILL_IMPROVE           | ✓              | skillHandlers.ts:300 |
| SKILL_OPTIMIZE          | ✓              | skillHandlers.ts:333 |
| SKILL_OPTIMIZE_VARIANTS | ✓              | skillHandlers.ts:361 |
| SKILL_OPTIMIZE_EVALUATE | ✓              | skillHandlers.ts:396 |
| SKILL_LIST              | 未実装         | -                    |
| SKILL_SCAN              | 未実装         | -                    |
| SKILL_GET_IMPORTED      | 未実装         | -                    |
| SKILL_UPDATE            | 未実装         | -                    |

---

## 5. 統合結果サマリー

| カテゴリ             | 数量 |
| -------------------- | ---- |
| 現行スキルチャンネル | 22   |
| 重複定義             | 8    |
| ハードコード文字列   | 2    |
| 要統一チャンネル     | 2    |
| 未実装ハンドラー     | 4    |
