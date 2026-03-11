# [#1024] "[UT-IMP-AUTHKEY-EXISTS-SOURCE-FIELD-001] auth-key:exists レスポンスに source フィールドを追加"

## メタ情報

```yaml
task_id: UT-IMP-AUTHKEY-EXISTS-SOURCE-FIELD-001
task_name: auth-key:exists レスポンスに source フィールドを追加
category: 改善
target_feature: IPC auth-key チャネル / AuthKeySection UI
priority: 中
scale: 小規模（2-4時間）
status: 未実施
source_phase: TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 Phase 5
created_date: 2026-03-06
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-authkey-exists-source-field-001.md
```

| 項目       | 内容              |
| ---------- | ----------------- |
| 優先度     | 中                |
| 規模       | 小規模（2-4時間） |
| ステータス | 未実施            |

---

task_id: UT-IMP-AUTHKEY-EXISTS-SOURCE-FIELD-001
task_name: auth-key:exists レスポンスに source フィールドを追加
category: 改善
target_feature: IPC auth-key チャネル / AuthKeySection UI
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 5
created_date: 2026-03-06
dependencies: [TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001]

---

# auth-key:exists レスポンスに source フィールドを追加 - タスク指示書

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在、AuthKeySection の4状態（saved/env-fallback/not-set/check-failed）を判定するために、2つのIPCチャネル（`auth-key:exists` と `auth-key:validate`）を呼び出す必要がある。`auth-key:exists` が `{ exists: true }` のみを返すため、キーが「保存済み」か「環境変数フォールバック」かを区別できない。

### 1.2 問題点・課題

1. 4状態判定に2回のIPC呼び出しが必要（`auth-key:exists` + `auth-mode:status`）
2. `AuthKeyService.exists()` は stored key のみをチェックするが、`AuthKeyService.getKey()` は env var にもフォールバックする非対称性がある
3. 3層認証状態（AuthModeService#getStatus / auth-key:exists / SettingsView）の不整合が状態判定ロジックを複雑にしている

### 1.3 放置した場合の影響

- 4状態判定のたびに2回のIPC呼び出しが発生し、レイテンシが増加
- 判定ロジックがRenderer側に分散し、保守性が低下
- 将来の認証ソース追加（クラウド同期等）時にRenderer側の判定ロジックが複雑化

---

## 2. 何を達成するか（What）

### 2.1 目的

`auth-key:exists` のレスポンスに `source: "stored" | "env" | null` フィールドを追加し、1回のIPC呼び出しで4状態を判定可能にする。

### 2.2 最終ゴール

```typescript
// 現状: 2回のIPC呼び出しが必要
const existsResult = await window.electronAPI.authKey.exists();
const statusResult = useAuthModeStatus(); // hasCredentials（保存基準）
// existsResult + statusResult から4状態を判定

// 改善後: 1回のIPC呼び出しで4状態を判定
const result = await window.electronAPI.authKey.exists();
// result = { exists: true, source: "stored" }  -> saved状態
// result = { exists: true, source: "env" }     -> env-fallback状態
// result = { exists: false, source: null }     -> not-set状態
// エラー時                                      -> check-failed状態
```

### 2.3 スコープ

#### 含むもの

- Main Process: `AuthKeyService.exists()` の戻り値を `{ exists: boolean, source: "stored" | "env" | null }` に拡張
- IPC ハンドラ: `auth-key:exists` の応答スキーマ更新
- Preload: 型定義を更新（`packages/shared` と `apps/desktop/src/preload/types.ts` の2箇所 -- P32準拠）
- Renderer: AuthKeySection で source フィールドを利用して4状態判定を簡素化
- テスト: source フィールドに対する新規テスト追加

#### 含まないもの

- `AuthModeService#getStatus()` のロジック変更
- `auth-mode:status` の応答フォーマット変更
- `auth-key:validate` チャネルの廃止（後方互換性のため残す）
- 環境変数設定UI

### 2.4 成果物

- 修正済み `AuthKeyService.exists()` メソッド
- 修正済み `authKeyHandlers.ts`
- 更新済み型定義（`packages/shared` + `apps/desktop/src/preload/types.ts`）
- 更新済み AuthKeySection コンポーネント
- 新規テスト（source フィールド検証）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 が完了していること

### 3.2 依存タスク

- TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001（完了済み）

### 3.3 必要な知識

- Electron IPC ハンドラの実装パターン
- P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）
- P32（型定義の二箇所同時更新必須）
- P23（API二重定義の型管理複雑性）
- AuthKeyService の stored key / env var フォールバック構造

### 3.4 推奨アプローチ

1. **Main Process**: `AuthKeyService.exists()` の戻り値を拡張

```typescript
// AuthKeyService.exists() の拡張イメージ
async exists(): Promise<{ exists: boolean; source: "stored" | "env" | null }> {
  const storedKey = await this.getStoredKey();
  if (storedKey) {
    return { exists: true, source: "stored" };
  }
  const envKey = process.env.ANTHROPIC_API_KEY;
  if (envKey && envKey.trim() !== "") {
    return { exists: true, source: "env" };
  }
  return { exists: false, source: null };
}
```

2. **IPC ハンドラ**: `auth-key:exists` の応答スキーマを更新
3. **Preload**: 型定義を `packages/shared` と `apps/desktop/src/preload/types.ts` の2箇所で同時更新（P32準拠）
4. **Renderer**: AuthKeySection で source フィールドを利用して4状態判定を1回のIPC呼び出しに簡素化
5. **後方互換性**: `exists` フィールドの意味は従来どおり維持

---

## 4. 苦戦箇所と解決のヒント

### 4.1 TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 での苦戦

| 課題                             | 原因                                                                            | 解決のヒント                                            |
| -------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 3層認証状態の不整合              | AuthModeService#getStatus / auth-key:exists / SettingsView で状態判定が分散     | source フィールドで auth-key:exists に状態情報を集約    |
| exists() と getKey() の非対称性  | exists() は stored key のみ、getKey() は env var にもフォールバック             | exists() を拡張して env var の存在も検出                |
| UI側で2回のIPC呼び出しが必要     | auth-key:exists が source 情報を返さない                                        | source フィールド追加で1回に削減                        |
| 型定義の2箇所同時更新忘れ（P32） | packages/shared と apps/desktop/src/preload/types.ts の両方を更新する必要がある | 変更前に両ファイルの該当型を確認し、1コミットで同時編集 |

### 4.2 参照すべき仕様書

| 仕様書                     | 内容                                                       |
| -------------------------- | ---------------------------------------------------------- |
| `api-ipc-auth.md`          | AuthKey IPCチャネル契約                                    |
| `arch-ui-components.md`    | AuthKeySection 4状態判定ロジック                           |
| `arch-state-management.md` | AuthKeySection ローカル状態パターン                        |
| `06-known-pitfalls.md`     | P23（API二重定義）、P32（型定義2箇所更新）、P42（.trim()） |
| `lessons-learned.md`       | TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 苦戦箇所        |

---

## 5. 受入基準

- [ ] `auth-key:exists` が `{ exists: boolean, source: "stored" | "env" | null }` を返す
- [ ] AuthKeySection が source フィールドで4状態を1回のIPC呼び出しで判定
- [ ] P42準拠3段バリデーション適用
- [ ] 既存テスト（41件）が全PASS
- [ ] 新規テスト追加（source フィールドのテスト）
- [ ] P32準拠: `packages/shared` と `apps/desktop/src/preload/types.ts` の型定義が同時更新されている
- [ ] 後方互換性: `exists` フィールドの意味が変わらない

---

## 6. 関連タスク・参照

- 親タスク: TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001
- 関連Pitfall: P23（API二重定義の型管理）、P32（型定義の二箇所同時更新必須）、P42（.trim()バリデーション漏れ）
- 仕様書: `api-ipc-auth.md`, `arch-ui-components.md`, `arch-state-management.md`
