# セッション永続化・前回画面復元 - タスク指示書

## メタ情報

| 項目             | 内容                               |
| ---------------- | ---------------------------------- |
| タスクID         | SESSION-001                        |
| タスク名         | ログイン状態維持と前回画面復元機能 |
| 分類             | 改善                               |
| 対象機能         | 認証・セッション管理               |
| 優先度           | 中                                 |
| 見積もり規模     | 中規模                             |
| ステータス       | 未実施                             |
| 発見元           | ユーザー要望                       |
| 発見日           | 2025-12-10                         |
| 発見エージェント | ユーザー                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在のアプリケーションでは、Electronアプリを起動するたびにログイン画面が表示される。ユーザーが以前ログインしていた場合でも、認証状態がセッションをまたいで保持されず、毎回ログイン操作が必要となっている。

### 1.2 問題点・課題

1. **UX の低下**: 起動のたびにログインが必要で、ユーザー体験が悪い
2. **作業効率の低下**: 前回の作業画面に戻るまでに複数ステップが必要
3. **競合製品との比較**: 一般的なデスクトップアプリは認証状態を永続化している

### 1.3 放置した場合の影響

- ユーザーの離脱率増加
- 「使いにくい」というネガティブな印象
- 日常的に使用するツールとしての採用が困難

---

## 2. 何を達成するか（What）

### 2.1 目的

Electronアプリを起動した際に、前回のログイン状態を維持し、認証済みの場合は前回開いていた画面を自動的に復元する。

### 2.2 最終ゴール

1. 認証済みユーザーがアプリを再起動した場合、ログイン画面をスキップして直接アプリケーションにアクセスできる
2. 前回閉じた時の画面（ルート）が復元される
3. セキュリティを維持しつつ、適切なトークン管理を行う

### 2.3 スコープ

#### 含むもの

- 認証トークンのセキュアな永続化
- セッションの自動復元
- 前回の画面（ルート）の保存と復元
- トークンの有効性検証
- セキュアなトークンストレージの実装

#### 含まないもの

- ウィンドウサイズ・位置の復元（別タスク）
- アプリケーション状態（フォーム入力値など）の復元
- 複数デバイス間の同期

### 2.4 成果物

| 種別         | 成果物               | 配置先                                                        |
| ------------ | -------------------- | ------------------------------------------------------------- |
| 機能         | セッション永続化機能 | `apps/desktop/src/main/services/session-persistence.ts`       |
| 機能         | 前回画面復元機能     | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`   |
| ドキュメント | 設計ドキュメント     | `docs/30-workflows/session-persistence/`                      |
| 品質         | テストファイル       | `apps/desktop/src/main/__tests__/session-persistence.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 認証機能（AuthGuard、AuthView）が実装済みであること
- Electron Main/Renderer プロセス間のIPC通信が確立していること
- authSlice が Zustand で実装されていること

### 3.2 依存タスク

- `login-only-auth` タスクの完了（PR #131 でマージ済み）

### 3.3 必要な知識・スキル

- Electron セキュリティ（keytar、safeStorage）
- Electron IPC 通信
- React/Zustand 状態管理
- OAuth/JWT トークン管理

### 3.4 推奨アプローチ

1. **セキュアストレージ**: `electron-store` + `safeStorage` または `keytar` を使用してトークンを安全に保存
2. **Main プロセス管理**: セッション情報はMainプロセスで管理し、Rendererからは IPC 経由でアクセス
3. **トークン検証**: 起動時にトークンの有効性を検証し、無効な場合はログイン画面を表示

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義
Phase 1: 設計（セキュアストレージ設計、IPC設計）
Phase 1.5: 設計レビューゲート
Phase 2: テスト作成 (TDD: Red)
Phase 3: 実装 (TDD: Green)
Phase 4: リファクタリング (TDD: Refactor)
Phase 5: 品質保証
Phase 5.5: 最終レビューゲート
Phase 6: ドキュメント更新
```

### Phase 0: 要件定義

#### 目的

セッション永続化と前回画面復元の要件を明確化する。

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:gather-requirements session-persistence
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/req-analyst.md`
- **選定理由**: 要件定義の専門家として、機能要件・非機能要件を網羅的に定義
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                               | 活用方法                                   |
| -------------------------------------- | ------------------------------------------ |
| .claude/skills/requirements-engineering/SKILL.md               | 機能要件・非機能要件の体系的な定義         |
| .claude/skills/functional-non-functional-requirements/SKILL.md | セキュリティ要件、パフォーマンス要件の定義 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物     | パス                                                    | 内容                 |
| ---------- | ------------------------------------------------------- | -------------------- |
| 要件定義書 | `docs/30-workflows/session-persistence/requirements.md` | 機能要件・非機能要件 |

#### 完了条件

- [ ] 機能要件が明確に定義されている
- [ ] セキュリティ要件が定義されている
- [ ] 非機能要件（パフォーマンス、信頼性）が定義されている

---

### Phase 1: 設計

#### 目的

セキュアなセッション永続化のアーキテクチャを設計する。

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:design-architecture session-persistence
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/electron-architect.md`, `.claude/agents/electron-security.md`
- **選定理由**: Electronのセキュアなストレージ設計とIPC設計の専門知識
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                    | 活用方法                            |
| --------------------------- | ----------------------------------- |
| .claude/skills/electron-architecture/SKILL.md       | Main/Renderer間のセキュアな通信設計 |
| .claude/skills/electron-security-hardening/SKILL.md | トークンの安全な保存方法の設計      |
| .claude/skills/oauth2-flows/SKILL.md                | トークンライフサイクル管理          |

- **参照**: `.claude/skills/skill_list.md`

#### 設計方針

##### 1. セキュアストレージ

```typescript
// apps/desktop/src/main/services/secure-storage.ts
import { safeStorage } from "electron";
import Store from "electron-store";

interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  lastRoute: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

const store = new Store<{
  encryptedSession: string;
}>();

export const secureStorage = {
  saveSession(data: SessionData): void {
    const encrypted = safeStorage.encryptString(JSON.stringify(data));
    store.set("encryptedSession", encrypted.toString("base64"));
  },

  loadSession(): SessionData | null {
    const encrypted = store.get("encryptedSession");
    if (!encrypted) return null;

    try {
      const decrypted = safeStorage.decryptString(
        Buffer.from(encrypted, "base64"),
      );
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  },

  clearSession(): void {
    store.delete("encryptedSession");
  },
};
```

##### 2. IPC チャネル定義

```typescript
// apps/desktop/src/preload/types.ts
export interface ElectronAPI {
  session: {
    load: () => Promise<SessionData | null>;
    save: (data: SessionData) => Promise<void>;
    clear: () => Promise<void>;
    validateToken: () => Promise<boolean>;
  };
}
```

##### 3. 起動フロー

```
[App Start]
    ↓
[Load Encrypted Session]
    ↓
[Session Exists?] ─No─→ [Show Login Screen]
    │Yes
    ↓
[Validate Token]
    ↓
[Token Valid?] ─No─→ [Try Refresh Token]
    │Yes                    │
    ↓                       ↓
[Restore Last Route]   [Refresh Success?]
    │                       │No → [Show Login]
    ↓                       │Yes
[Show App]              [Restore Last Route]
```

#### 成果物

| 成果物 | パス                                                             | 内容                   |
| ------ | ---------------------------------------------------------------- | ---------------------- |
| 設計書 | `docs/30-workflows/session-persistence/design-secure-storage.md` | セキュアストレージ設計 |
| 設計書 | `docs/30-workflows/session-persistence/design-ipc-channels.md`   | IPC設計                |

#### 完了条件

- [ ] セキュアストレージの設計が完了
- [ ] IPC チャネルの設計が完了
- [ ] 起動フローの設計が完了
- [ ] セキュリティレビューを考慮した設計

---

### Phase 1.5: 設計レビューゲート

#### 目的

実装前にセキュリティと設計の妥当性を検証する。

#### レビュー参加エージェント

| エージェント         | レビュー観点         | 選定理由                       |
| -------------------- | -------------------- | ------------------------------ |
| `.claude/agents/electron-security.md` | セキュリティ設計     | トークン保存のセキュリティ評価 |
| `.claude/agents/arch-police.md`       | アーキテクチャ整合性 | Main/Renderer分離の適切性      |
| `.claude/agents/sec-auditor.md`       | セキュリティ監査     | OWASP観点からのレビュー        |

- **参照**: `.claude/agents/agent_list.md`

#### レビューチェックリスト

**セキュリティ設計** (`.claude/agents/electron-security.md`)

- [ ] トークンが適切に暗号化されているか
- [ ] safeStorage/keytarの使用が適切か
- [ ] トークンの有効期限管理が適切か

**アーキテクチャ整合性** (`.claude/agents/arch-police.md`)

- [ ] Main/Renderer の責務分離が適切か
- [ ] IPC 通信が安全に設計されているか

**セキュリティ監査** (`.claude/agents/sec-auditor.md`)

- [ ] トークン漏洩のリスクが最小化されているか
- [ ] セッションハイジャック対策が考慮されているか

#### 完了条件

- [ ] 全レビュー観点で問題なし、または軽微な指摘のみ
- [ ] セキュリティ上の重大な問題がないこと

---

### Phase 2: テスト作成 (TDD: Red)

#### 目的

セッション永続化機能のテストを先に作成する。

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests apps/desktop/src/main/services/session-persistence.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: TDD原則に基づいたテスト設計の専門家
- **参照**: `.claude/agents/agent_list.md`

#### テストケース

| テストID | シナリオ                   | 期待結果               |
| -------- | -------------------------- | ---------------------- |
| SP-01    | セッションが存在しない場合 | null を返す            |
| SP-02    | 有効なセッションがある場合 | セッションデータを復元 |
| SP-03    | トークンが期限切れの場合   | リフレッシュを試行     |
| SP-04    | リフレッシュ失敗の場合     | ログイン画面を表示     |
| SP-05    | 前回ルートの保存と復元     | 正しいルートに遷移     |

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test:run
```

- [ ] テストが失敗することを確認（Red状態）

#### 完了条件

- [ ] 全テストケースが作成されている
- [ ] テストが失敗状態（Red）であること

---

### Phase 3: 実装 (TDD: Green)

#### 目的

テストを通すための最小限の実装を行う。

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:implement-business-logic session-persistence
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/electron-architect.md`, `.claude/agents/logic-dev.md`
- **選定理由**: Electron アーキテクチャとビジネスロジック実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 実装ファイル

1. `apps/desktop/src/main/services/secure-storage.ts` - セキュアストレージ
2. `apps/desktop/src/main/services/session-manager.ts` - セッション管理
3. `apps/desktop/src/main/ipc/session.ts` - IPC ハンドラー
4. `apps/desktop/src/preload/session.ts` - Preload API
5. `apps/desktop/src/renderer/store/slices/navigationSlice.ts` - ルート管理

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/desktop test:run
```

- [ ] テストが成功することを確認（Green状態）

#### 完了条件

- [ ] 全テストが通過
- [ ] セッション永続化が機能する
- [ ] 前回画面が復元される

---

### Phase 4: リファクタリング (TDD: Refactor)

#### 目的

コード品質を改善する。

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:refactor apps/desktop/src/main/services/session-manager.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/code-quality.md`
- **選定理由**: コード品質改善の専門家
- **参照**: `.claude/agents/agent_list.md`

#### リファクタリング観点

- [ ] 重複コードの排除
- [ ] 適切なエラーハンドリング
- [ ] JSDoc コメントの追加
- [ ] 型定義の厳密化

#### TDD検証: 継続Green確認

```bash
pnpm --filter @repo/desktop test:run
```

- [ ] リファクタリング後もテストが成功すること

---

### Phase 5: 品質保証

#### 目的

品質ゲートをすべて通過することを確認する。

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:run-all-tests --coverage
/ai:lint --fix
/ai:security-audit scope:auth
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 品質ゲートチェックリスト

- [ ] 全テスト成功
- [ ] Lint エラーなし
- [ ] 型エラーなし
- [ ] セキュリティスキャン合格

---

### Phase 5.5: 最終レビューゲート

#### 目的

実装完了後の最終品質確認。

#### レビュー参加エージェント

| エージェント         | レビュー観点          |
| -------------------- | --------------------- |
| `.claude/agents/code-quality.md`      | コード品質            |
| `.claude/agents/electron-security.md` | Electron セキュリティ |
| `.claude/agents/unit-tester.md`       | テスト品質            |

#### 完了条件

- [ ] 全レビュー観点で PASS 評価

---

### Phase 6: ドキュメント更新

#### 目的

システムドキュメントを更新する。

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:update-all-docs
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 更新対象ドキュメント

- `docs/00-requirements/08-api-design.md` - IPC API の追加
- `docs/00-requirements/17-security-guidelines.md` - セッション管理セキュリティ

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] アプリ起動時に前回の認証状態が復元される
- [ ] 認証済みの場合、ログイン画面をスキップする
- [ ] 前回閉じた時の画面が復元される
- [ ] トークン期限切れ時は適切にログイン画面を表示する

### 品質要件

- [ ] セキュアストレージでトークンが暗号化されている
- [ ] テストカバレッジ 80% 以上
- [ ] Lint/型エラーなし

### ドキュメント要件

- [ ] 設計ドキュメントが完成している
- [ ] システムドキュメントが更新されている

---

## 6. 検証方法

### テストケース

1. 新規ユーザーでログイン → 次回起動時にログイン状態が維持される
2. 特定の画面で閉じる → 次回起動時にその画面が表示される
3. トークン期限切れ → リフレッシュまたはログイン画面表示

### 検証手順

1. アプリをビルドして起動
2. ログインして任意の画面に移動
3. アプリを終了
4. アプリを再起動
5. ログイン画面をスキップして前回の画面が表示されることを確認

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                         |
| -------------------- | ------ | -------- | ---------------------------- |
| トークン漏洩         | 高     | 低       | safeStorage による暗号化     |
| セッション固定攻撃   | 中     | 低       | トークンの定期ローテーション |
| 古いセッションの残存 | 低     | 中       | ログアウト時の完全クリア     |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/login-only-auth/` - 認証機能設計
- `docs/00-requirements/17-security-guidelines.md` - セキュリティガイドライン

### 参考資料

- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [electron-store Documentation](https://github.com/sindresorhus/electron-store)
- [Electron safeStorage API](https://www.electronjs.org/docs/latest/api/safe-storage)

---

## 9. 備考

### 補足事項

- `keytar` vs `safeStorage`: Electron 15+ では `safeStorage` が推奨される
- macOS では Keychain、Windows では DPAPI、Linux では libsecret を内部で使用
- `electron-store` との組み合わせで暗号化された永続ストレージを実現
