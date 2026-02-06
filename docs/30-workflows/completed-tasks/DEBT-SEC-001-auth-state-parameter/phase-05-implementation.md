# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 5                                 |
| 機能名 | DEBT-SEC-001-auth-state-parameter |
| 作成日 | 2026-02-05                        |
| 状態   | 未着手                            |

## 目的

テストを通すための最小限の実装を行う。

## 実行タスク

- StateManagerモジュール新規作成: generate/validate/cleanup メソッド実装
- authHandlers.ts修正: state生成とqueryParams追加
- index.ts修正: handleAuthCallback内でstate検証追加

---

## 実装内容

### 新規作成1: StateManagerモジュール

**ファイルパス**: `apps/desktop/src/main/infrastructure/stateManager.ts`

```typescript
// apps/desktop/src/main/infrastructure/stateManager.ts
import crypto from "node:crypto";

/** OAuthプロバイダー種別 */
type OAuthProvider = "google" | "github" | "discord";

/** State保存エントリ */
interface StateEntry {
  state: string;
  provider: OAuthProvider;
  createdAt: number;
  expiresAt: number;
}

/** State有効期限: 10分 */
const STATE_EXPIRY_MS = 10 * 60 * 1000;

class StateManager {
  /** state保存用Map（メモリのみ、ディスク永続化なし） */
  private states: Map<string, StateEntry> = new Map();

  /**
   * stateパラメータを生成し、プロバイダーと紐付けて保存する
   * @param provider - OAuthプロバイダー
   * @returns 生成されたstate文字列（64文字hex）
   */
  generate(provider: OAuthProvider): string {
    const state = crypto.randomBytes(32).toString("hex");
    const now = Date.now();
    this.states.set(state, {
      state,
      provider,
      createdAt: now,
      expiresAt: now + STATE_EXPIRY_MS,
    });
    return state;
  }

  /**
   * stateパラメータを検証する（ワンタイムユース: 検証成功時に削除）
   * @param state - 検証対象のstate文字列
   * @param provider - 期待するOAuthプロバイダー
   * @returns 検証成功ならtrue、失敗ならfalse
   */
  validate(state: string, provider: OAuthProvider): boolean {
    const entry = this.states.get(state);

    // エントリが存在しない
    if (!entry) {
      return false;
    }

    // プロバイダー不一致
    if (entry.provider !== provider) {
      this.states.delete(state);
      return false;
    }

    // 有効期限切れ
    if (Date.now() > entry.expiresAt) {
      this.states.delete(state);
      return false;
    }

    // 検証成功: ワンタイムユースのため即座に削除
    this.states.delete(state);
    return true;
  }

  /**
   * 期限切れのstateエントリを削除する
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.states) {
      if (now > entry.expiresAt) {
        this.states.delete(key);
      }
    }
  }
}

/** シングルトンインスタンス */
export const stateManager = new StateManager();
```

### 修正2: authHandlers.ts（state生成・queryParams追加）

**ファイルパス**: `apps/desktop/src/main/ipc/authHandlers.ts`

**修正箇所**: line 96-101付近（signInWithOAuth呼び出し部分）

```typescript
// Before（既存コード）:
const { data, error } = await supabase.auth.signInWithOAuth({
  provider,
  options: {
    redirectTo: `aiworkflow://auth/callback`,
  },
});

// After（state追加）:
import { stateManager } from "../infrastructure/stateManager";

const state = stateManager.generate(provider);
const { data, error } = await supabase.auth.signInWithOAuth({
  provider,
  options: {
    queryParams: { state },
    redirectTo: `aiworkflow://auth/callback`,
  },
});
```

**変更ポイント**:

- `stateManager`のインポート追加
- `stateManager.generate(provider)`でstate生成
- `options.queryParams`に`{ state }`を追加

### 修正3: index.ts（handleAuthCallback内でstate検証）

**ファイルパス**: `apps/desktop/src/main/index.ts`

**修正箇所**: handleAuthCallback関数内

```typescript
// handleAuthCallback関数内にstate検証を追加
import { stateManager } from "./infrastructure/stateManager";

function handleAuthCallback(url: URL): void {
  // ハッシュフラグメントからパラメータ抽出
  // 重要: OAuth Implicit Flowでは#（hash fragment）でパラメータが返される
  const hashParams = new URLSearchParams(url.hash.slice(1));
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  const state = hashParams.get("state");
  const providerToken = hashParams.get("provider_token");

  // プロバイダー検出（URL情報またはproviderToken等から推定）
  const provider = detectProvider(url, providerToken);

  // ===== state入力バリデーション（新規追加）=====
  // stateパラメータの形式検証: 64文字hex文字列であること
  if (state && (typeof state !== "string" || !/^[a-f0-9]{64}$/.test(state))) {
    logger.warn("CSRF validation failed: malformed state parameter");
    mainWindow?.webContents.send("AUTH_STATE_CHANGED", {
      authenticated: false,
      error: "認証状態が無効または期限切れです。再度ログインしてください。",
      errorCode: "CSRF_VALIDATION_FAILED",
    });
    return;
  }

  // ===== state検証（新規追加）=====
  if (!state || !stateManager.validate(state, provider)) {
    logger.warn("CSRF validation failed: invalid or expired state parameter");
    mainWindow?.webContents.send("AUTH_STATE_CHANGED", {
      authenticated: false,
      error: "認証状態が無効または期限切れです。再度ログインしてください。",
      errorCode: "CSRF_VALIDATION_FAILED",
    });
    return;
  }
  // ===== state検証ここまで =====

  // 以降: トークン処理を続行（既存コード）
  // ...
}
```

**変更ポイント**:

- `stateManager`のインポート追加
- `hashParams.get('state')`でstateパラメータ抽出
- `stateManager.validate(state, provider)`で検証
- 検証失敗時はAUTH_STATE_CHANGEDでエラー通知し、早期リターン

---

## TDD検証: Green状態確認

```bash
# StateManagerユニットテスト実行
pnpm --filter @repo/desktop test:run stateManager.test.ts

# 全テスト実行（既存テストの回帰確認）
pnpm --filter @repo/desktop test:run
```

- [ ] Phase 4のテストが全て成功することを確認（Green状態）
- [ ] 既存テストが全て通過することを確認（回帰なし）

---

## アーキテクチャ層別実装

| 層           | 実装内容                                          | ファイル                                               |
| ------------ | ------------------------------------------------- | ------------------------------------------------------ |
| Main Process | StateManagerモジュール新規作成                    | `apps/desktop/src/main/infrastructure/stateManager.ts` |
| IPC通信      | authHandlers.ts修正（state生成、queryParams追加） | `apps/desktop/src/main/ipc/authHandlers.ts`            |
| Main Process | index.ts修正（handleAuthCallback内でstate検証）   | `apps/desktop/src/main/index.ts`                       |
| Preload      | 変更不要                                          | -                                                      |
| Renderer     | 変更不要                                          | -                                                      |

---

## 実装チェックリスト

| チェック項目                                     | 対応するFR/NFR |
| ------------------------------------------------ | -------------- |
| crypto.randomBytes(32)で256bit乱数生成           | NFR-01         |
| Mapでメモリのみ保存（ディスク永続化なし）        | FR-02          |
| validate成功時にMap.delete()（ワンタイムユース） | FR-06          |
| 10分後にexpiresAtチェックで期限切れ拒否          | FR-05          |
| provider一致チェック                             | FR-07          |
| エラー時AUTH_STATE_CHANGEDでerror/errorCode通知  | FR-04          |
| hashParams（#fragment）からstateパース           | TASK-FIX学び   |

---

## 参照資料

| 資料名             | パス                                                                             | 説明                             |
| ------------------ | -------------------------------------------------------------------------------- | -------------------------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                          | Phase 4成果物                    |
| IPC認証チャネル    | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`              | AUTH_STATE_CHANGEDペイロード仕様 |
| 入力バリデーション | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | バリデーション原則               |

---

## 実行手順

1. 参照資料を確認する
2. 実行タスクを順番に実施する
3. 各タスクの成果物を作成する
4. 完了条件を全て満たすことを確認する
5. 成果物を所定のパスに配置する

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                                            |
| ------------------ | --------------------------------------------------------------- |
| Supabase API       | signInWithOAuth options.queryParams に state 追加               |
| カスタムプロトコル | handleAuthCallback内でhashParams.get('state')パース             |
| IPC通信            | AUTH_STATE_CHANGED ペイロードにCSRF_VALIDATION_FAILEDエラー追加 |
| StateManager       | generate() → validate() の一連のフロー                          |

---

## 多角的チェック観点（AIが判断）

本Phaseの成果物に対して、以下の観点から品質を検証する:

| 観点       | 確認内容                                 |
| ---------- | ---------------------------------------- |
| 完全性     | 全ての要求事項が漏れなく反映されているか |
| 一貫性     | 他のPhase成果物との矛盾がないか          |
| 正確性     | 技術的な記述が正確であるか               |
| 追跡可能性 | 要件→設計→実装→テストの追跡が可能か      |

---

## 成果物

| 成果物           | パス                                                   | 説明           |
| ---------------- | ------------------------------------------------------ | -------------- |
| StateManager     | `apps/desktop/src/main/infrastructure/stateManager.ts` | 新規作成       |
| authHandlers修正 | `apps/desktop/src/main/ipc/authHandlers.ts`            | state生成追加  |
| index.ts修正     | `apps/desktop/src/main/index.ts`                       | state検証追加  |
| 実装サマリ       | `outputs/phase-5/implementation-summary.md`            | 本ドキュメント |

---

## 完了条件

- [ ] すべてのテストが成功状態（Green）
- [ ] 実装が設計書の範囲内に収まっている（設計書に記載のないモジュール追加がない）
- [ ] StateManagerモジュールが新規作成されている
- [ ] authHandlers.tsにstate生成が追加されている
- [ ] index.tsにstate検証が追加されている
- [ ] 既存テストが全て通過する（回帰なし）
- [ ] アーキテクチャ層（Main Process > infrastructure層）に正しく配置されている
- [ ] フロント/バック接続: 既存のIPC通信（AUTH_STATE_CHANGED）を利用している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク     | 状態 | 備考 |
| -------------- | ---- | ---- |
| (実行時に記録) | -    | -    |

## タスク100%実行確認【必須】

- [ ] 全ての実行タスクを完了した
- [ ] 全ての成果物を作成した
- [ ] 全ての完了条件を満たした
- [ ] 成果物の品質を多角的チェック観点で検証した

> **注意**: このチェックリストが全てチェックされるまで、次のPhaseに進んではならない。

## 次のPhase

Phase 6: テスト拡充
