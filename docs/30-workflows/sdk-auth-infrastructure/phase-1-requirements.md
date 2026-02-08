# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 1                                        |
| Phase名    | 要件定義                                 |
| 前提Phase  | -                                        |
| 後続Phase  | Phase 2 (設計)                           |
| ステータス | 未実施                                   |
| 作成日     | 2026-02-07                               |
| タスクID   | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| タスク名   | Claude Agent SDK用認証キー管理基盤の構築 |

---

## 目的

Anthropic 認証キーのセキュア管理基盤の機能要件・非機能要件を明確化し、テスト可能な受け入れ基準を定義する。

## 背景

`SkillExecutor.callSDKQuery()` (L746-755) において Claude Agent SDK の `query()` API 呼び出し時に認証キーが渡されていない。SDK は認証なしでは動作しないため、認証キー管理基盤の構築が必須である。

### 現状の問題

```typescript
// SkillExecutor.ts L746-755
const { query } = (await import("@anthropic-ai/claude-agent-sdk")) as any;
const conversation = query({
  prompt,
  options: {
    tools: options.tools,
    permissionMode: options.permissionMode,
    signal: options.signal,
    // 認証キーが渡されていない
  },
});
```

### 放置した場合の影響

- SDK ベースのスキル実行が認証段階で 100% 失敗
- ハンドラールーティング修正（#15）を完了しても機能しない
- E2E テストが不可能

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: requirements-engineering

**パス**: `.claude/skills/requirements-engineering/SKILL.md`

**Trigger条件**:

- 要件抽出・仕様化・品質検証が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`

---

### スキル2: acceptance-criteria-writing

**パス**: `.claude/skills/acceptance-criteria-writing/SKILL.md`

**Trigger条件**:

- Given-When-Then形式の受け入れ基準作成が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

## 参照資料

| 参照資料          | パス                                                                                             | 内容                    |
| ----------------- | ------------------------------------------------------------------------------------------------ | ----------------------- |
| タスク指示書      | `docs/30-workflows/skill-import-agent-system/tasks/01c-task-fix-16-1-sdk-auth-infrastructure.md` | 元タスクの詳細仕様      |
| 既存SecureStorage | `apps/desktop/src/main/infrastructure/secureStorage.ts`                                          | safeStorage実装パターン |
| SkillExecutor     | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                          | 修正対象の実装          |

### システム仕様（プロジェクトルール）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                    | 内容                 |
| -------------------- | --------------------------------------- | -------------------- |
| セキュリティルール   | `.claude/rules/04-electron-security.md` | 認証セキュリティ原則 |
| アーキテクチャルール | `.claude/rules/01-architecture.md`      | レイヤー依存方向     |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`    | Electron/認証の教訓  |

### システム仕様（aiworkflow-requirements）

> 以下の仕様書から既存パターンを抽出し、設計に反映してください。

| 参照資料             | パス                                                                          | 内容                                                         |
| -------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| セキュリティ原則     | `.claude/skills/aiworkflow-requirements/references/security-principles.md`    | safeStorage実装パターン（L266-299）、APIキー管理（L308-346） |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | safeInvokeラッパー、withValidation（L97-122）                |
| 認証インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`        | 既存認証型定義パターン、AuthErrorCode                        |
| 認証IPC設計          | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`           | 認証IPCチャンネル設計パターン                                |
| Electronサービス構造 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` | Facadeパターン、サービス構成（L84-121）                      |
| IPC永続化パターン    | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`   | IPC Handler Registration Pattern（L17-91）                   |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | エラーカテゴリ（L8-18）、Result型パターン                    |

### 既存パターンとの整合性確認

> 以下の既存実装パターンを確認し、命名規則・設計パターンを統一してください。

| 既存実装       | パス                                                    | 確認項目                       |
| -------------- | ------------------------------------------------------- | ------------------------------ |
| apiKeyStorage  | `apps/desktop/src/main/infrastructure/apiKeyStorage.ts` | Store名、暗号化パターン        |
| apiKeyHandlers | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`           | チャンネル命名、ハンドラー構造 |
| secureStorage  | `apps/desktop/src/main/infrastructure/secureStorage.ts` | safeStorage使用パターン        |

---

## 機能要件（定義対象）

### FR-1: 認証キーの暗号化保存

- Electron `safeStorage` API を使用して認証キーを暗号化
- `electron-store` を使用して暗号化済みキーを永続化
- 暗号化が利用不可な環境でのフォールバック対応

### FR-2: query()への認証キー渡し

- `SkillExecutor.callSDKQuery()` で認証キーを取得
- `query()` のオプションに認証キーを含める
- キー取得の遅延初期化パターン

### FR-3: キー未設定時のエラーハンドリング

- キー未設定時に明確なエラーメッセージを返す
- エラーコードは External Service Error 範囲（3000-3999）
- ユーザーにキー設定を促すガイダンス

### FR-4: IPC API提供

- `AUTH_KEY_SET`: 認証キー設定
- `AUTH_KEY_VALIDATE`: 認証キー検証
- `AUTH_KEY_DELETE`: 認証キー削除
- `AUTH_KEY_EXISTS`: 認証キー存在確認

---

## 非機能要件（定義対象）

### NFR-1: セキュリティ

| 項目               | 要件                                   |
| ------------------ | -------------------------------------- |
| キー保存           | `safeStorage` による暗号化必須         |
| プロセス制限       | 認証キーは Main Process のみでアクセス |
| Renderer 非送信    | 認証キーを Renderer に送信しない       |
| ログ除外           | 認証キーをログに含めない               |
| フォールバック警告 | 暗号化不可時はユーザーに警告表示       |

### NFR-2: 可用性

| 項目                   | 要件                                       |
| ---------------------- | ------------------------------------------ |
| 環境変数フォールバック | `ANTHROPIC_API_KEY` 環境変数からの読み取り |
| 遅延初期化             | Store は必要時に初期化（テスト対応）       |

### NFR-3: パフォーマンス

| 項目               | 要件                         |
| ------------------ | ---------------------------- |
| キー取得レイテンシ | 10ms 以内（キャッシュ活用）  |
| 暗号化/復号コスト  | safeStorage の標準性能に依存 |

---

## 成果物

| 成果物       | パス                                         | 内容                       |
| ------------ | -------------------------------------------- | -------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件の定義 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Given-When-Then形式の基準  |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 1での必須アクション

- [ ] 接続要件（IPC/認証/データフロー）を要件に明記
- [ ] 統合対象のモジュール・インターフェースを特定
- [ ] 外部依存（electron.safeStorage, electron-store）を明確化

---

## 完了条件

- [ ] 機能要件（FR-1〜FR-4）が明文化されている
- [ ] 非機能要件（NFR-1〜NFR-3）が定義されている
- [ ] 受け入れ基準がGiven-When-Then形式で記述されている
- [ ] スコープ（実装範囲・除外範囲）が明確である
- [ ] 既存 `secureStorage.ts` パターンとの整合性が確認されている
- [ ] セキュリティ要件が `04-electron-security.md` に準拠している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 使用スキル

- requirements-engineering: {{result}}
- acceptance-criteria-writing: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/sdk-auth-infrastructure/phase-2-design.md`
