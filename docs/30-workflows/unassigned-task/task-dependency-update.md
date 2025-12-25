# 依存関係脆弱性解消 - タスク指示書

## メタ情報

| 項目             | 内容                                           |
| ---------------- | ---------------------------------------------- |
| タスクID         | SECURITY-003                                   |
| タスク名         | esbuild脆弱性の解消（依存関係更新）            |
| 分類             | セキュリティ                                   |
| 対象機能         | 開発環境（vite, drizzle-kit）                  |
| 優先度           | 中                                             |
| 見積もり規模     | 小規模                                         |
| ステータス       | 未実施                                         |
| 発見元           | Phase 6 - セキュリティ監査（依存関係スキャン） |
| 発見日           | 2024-12-23                                     |
| 発見エージェント | .claude/agents/sec-auditor.md                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

セキュリティ監査（T-06-2）のpnpm audit実行で、esbuildの脆弱性が検出されました：

```
┌─────────────────────┬────────────────────────────────────────┐
│ moderate            │ esbuild CORS vulnerability             │
├─────────────────────┼────────────────────────────────────────┤
│ Package             │ esbuild                                │
├─────────────────────┼────────────────────────────────────────┤
│ Vulnerable versions │ <=0.24.2                               │
├─────────────────────┼────────────────────────────────────────┤
│ Patched versions    │ >=0.25.0                               │
├─────────────────────┼────────────────────────────────────────┤
│ CVE                 │ GHSA-67mh-4wv8-2f99                    │
├─────────────────────┼────────────────────────────────────────┤
│ Paths               │ vitest>vite>esbuild (0.21.5)           │
│                     │ drizzle-kit>@esbuild-kit>esbuild (0.18.20) │
└─────────────────────┴────────────────────────────────────────┘
```

### 1.2 問題点・課題

**OWASP A06: Vulnerable Components** に該当：

1. **脆弱性概要**: 開発サーバーのCORSヘッダー設定（`Access-Control-Allow-Origin: *`）により、悪意のあるWebサイトからソースコードが窃取可能
2. **影響パス**: 2箇所（vite経由、drizzle-kit経由）
3. **CVSS**: 5.3 (AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N)

### 1.3 放置した場合の影響

**セキュリティ影響度**: Low（開発環境のみ）

- **機密性侵害**: 開発中のソースコードが外部サイトから読み取り可能
- **攻撃シナリオ**: 開発者が悪意のあるWebサイトを閲覧中に開発サーバーが起動している場合

**緩和要因**（現時点）:

- 開発環境のみの影響（本番ビルドには含まれない）
- デスクトップアプリで開発サーバーを外部公開するケースは稀
- ローカルネットワーク内での開発が前提

**対応の必要性**:

- セキュリティ衛生上、既知の脆弱性は速やかに解消すべき
- pnpm audit結果をクリーンに保つため

---

## 2. 何を達成するか（What）

### 2.1 目的

viteとdrizzle-kitを最新版にアップグレードし、esbuild 0.25.0以上を含むバージョンに更新して、GHSA-67mh-4wv8-2f99脆弱性を解消する。

### 2.2 最終ゴール

- ✅ pnpm audit結果が0件（脆弱性なし）
- ✅ viteがesbuild 0.25.0+を含むバージョンに更新されている
- ✅ drizzle-kitがesbuild 0.25.0+を含むバージョンに更新されている
- ✅ 既存のビルド・テストが全て成功している
- ✅ 開発サーバーが正常起動する

### 2.3 スコープ

#### 含むもの

- viteのアップグレード
- drizzle-kitのアップグレード
- 更新後のビルド・テスト検証
- package.jsonの更新

#### 含まないもの

- 他のパッケージの一括アップグレード
- メジャーバージョンアップに伴う破壊的変更対応

### 2.4 成果物

| 種別         | 成果物                   | 配置先                                                            |
| ------------ | ------------------------ | ----------------------------------------------------------------- |
| 設定         | 更新されたpackage.json   | `package.json`, `packages/*/package.json`                         |
| 設定         | 更新されたpnpm-lock.yaml | `pnpm-lock.yaml`                                                  |
| ドキュメント | 依存関係更新記録         | `docs/30-workflows/chat-history-persistence/dependency-update.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- セキュリティ監査（T-06-2）が完了していること
- 既存のビルド・テストが全て成功していること

### 3.2 依存タスク

- T-06-2: セキュリティ監査（完了）

### 3.3 必要な知識・スキル

- pnpm パッケージマネージャー
- vite ビルドツール
- drizzle-kit マイグレーションツール
- セマンティックバージョニング

### 3.4 推奨アプローチ

**段階的な更新**:

1. viteを最新安定版に更新
2. drizzle-kitを最新安定版に更新
3. 各更新後にビルド・テスト実行
4. 問題発生時はロールバック

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義（更新対象・更新方針）
Phase 1: 設計（更新計画）
Phase 2: 設計レビューゲート
Phase 3: テスト作成（更新後の検証計画）
Phase 4: 実装（依存関係更新）
Phase 5: リファクタリング（不要）
Phase 6: 品質保証
Phase 7: 最終レビューゲート
Phase 8: 手動テスト検証
Phase 9: ドキュメント更新
```

---

### Phase 0: 要件定義

#### T-00-1: 依存関係更新要件定義

##### 目的

更新対象パッケージと更新方針を明確化する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:gather-requirements dependency-update
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/dep-mgr.md`
- **選定理由**: 依存関係管理とセマンティックバージョニングの専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                                             | 活用方法           |
| ---------------------------------------------------- | ------------------ |
| .claude/skills/semantic-versioning/SKILL.md          | バージョン選定基準 |
| .claude/skills/dependency-security-scanning/SKILL.md | 脆弱性評価         |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物     | パス                                                                   | 内容                       |
| ---------- | ---------------------------------------------------------------------- | -------------------------- |
| 更新計画書 | `docs/30-workflows/chat-history-persistence/dependency-update-plan.md` | 更新対象・バージョン・手順 |

##### 完了条件

- [ ] 更新対象パッケージが特定されている（vite, drizzle-kit）
- [ ] 更新後のバージョンが決定されている
- [ ] 破壊的変更の有無が確認されている
- [ ] ロールバック手順が明確である

##### 依存関係

- **前提**: T-06-2
- **後続**: T-01-1

---

### Phase 1: 設計

#### T-01-1: 更新手順設計

##### 目的

安全に依存関係を更新する手順を設計する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:design-architecture dependency-update
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/dep-mgr.md`
- **選定理由**: 依存関係更新戦略の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] 更新手順が明確である
- [ ] テスト検証計画が定義されている

##### 依存関係

- **前提**: T-00-1
- **後続**: T-03-1

---

### Phase 3: テスト作成（更新後の検証計画）

#### T-03-1: 更新検証テスト作成

##### 目的

依存関係更新後の動作確認テストを作成する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests dependency-update-verification
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: テスト設計の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] ビルド成功テストが作成されている
- [ ] 開発サーバー起動テストが作成されている

##### 依存関係

- **前提**: T-01-1
- **後続**: T-04-1

---

### Phase 4: 実装（依存関係更新）

#### T-04-1: vite更新

##### 目的

viteを最新版に更新する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:update-dependencies vite
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/dep-mgr.md`
- **選定理由**: パッケージ更新の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 実行コマンド

```bash
pnpm update vite
pnpm --filter @repo/desktop test:run
pnpm --filter @repo/desktop build
```

##### 完了条件

- [ ] viteが更新されている
- [ ] esbuild 0.25.0+が含まれている
- [ ] すべてのテストが成功している
- [ ] ビルドが成功している

##### 依存関係

- **前提**: T-03-1
- **後続**: T-04-2

---

#### T-04-2: drizzle-kit更新

##### 目的

drizzle-kitを最新版に更新する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:update-dependencies drizzle-kit
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/dep-mgr.md`
- **選定理由**: パッケージ更新の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 実行コマンド

```bash
pnpm --filter @repo/shared update drizzle-kit
pnpm --filter @repo/shared test:run
```

##### 完了条件

- [ ] drizzle-kitが更新されている
- [ ] esbuild 0.25.0+が含まれている
- [ ] すべてのテストが成功している

##### 依存関係

- **前提**: T-04-1
- **後続**: T-06-1

---

### Phase 6: 品質保証

#### T-06-1: 更新後の品質検証

##### 目的

依存関係更新後、全機能が正常動作することを検証する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:run-all-tests --coverage
pnpm audit
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: 統合テスト実行の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物       | パス                                                              | 内容                     |
| ------------ | ----------------------------------------------------------------- | ------------------------ |
| 更新レポート | `docs/30-workflows/chat-history-persistence/dependency-update.md` | 更新結果・脆弱性解消確認 |

##### 完了条件

- [ ] pnpm audit結果が0件（脆弱性なし）
- [ ] 全ユニットテストが成功している
- [ ] 全E2Eテストが成功している
- [ ] ビルドが成功している
- [ ] 開発サーバーが正常起動する

##### 依存関係

- **前提**: T-04-2
- **後続**: T-07-1

---

### Phase 7: 最終レビューゲート

#### T-07-1: 更新内容の最終レビュー

##### 目的

依存関係更新による影響がないことを最終確認する。

##### レビュー参加エージェント

| エージェント                  | レビュー観点       | 選定理由               |
| ----------------------------- | ------------------ | ---------------------- |
| .claude/agents/sec-auditor.md | 脆弱性解消確認     | pnpm audit結果の検証   |
| .claude/agents/dep-mgr.md     | 依存関係整合性     | バージョン互換性の確認 |
| .claude/agents/devops-eng.md  | ビルドパイプライン | CI/CDへの影響確認      |

- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] 全レビュー観点で問題なし
- [ ] Phase 8（手動テスト）へ進行可能

##### 依存関係

- **前提**: T-06-1
- **後続**: T-08-1

---

### Phase 8: 手動テスト検証

#### T-08-1: 開発環境動作確認

##### 目的

更新後の開発環境が正常動作することを手動確認する。

##### 手動テストケース

| No  | カテゴリ         | テスト項目      | 操作手順                            | 期待結果                 | 実行結果 | 備考 |
| --- | ---------------- | --------------- | ----------------------------------- | ------------------------ | -------- | ---- |
| 1   | ビルド           | sharedビルド    | `pnpm --filter @repo/shared build`  | ビルド成功               |          |      |
| 2   | ビルド           | desktopビルド   | `pnpm --filter @repo/desktop build` | ビルド成功               |          |      |
| 3   | 開発サーバー     | vite起動        | `pnpm --filter @repo/desktop dev`   | 正常起動、HMR動作        |          |      |
| 4   | マイグレーション | drizzle-kit動作 | `pnpm drizzle-kit generate`         | マイグレーション生成成功 |          |      |

##### 完了条件

- [ ] すべての手動テストケースがPASS
- [ ] 開発体験が悪化していない

##### 依存関係

- **前提**: T-07-1
- **後続**: T-09-1

---

### Phase 9: ドキュメント更新

#### T-09-1: 技術スタック更新

##### 更新対象ドキュメント

| ドキュメント                                  | 更新内容                        |
| --------------------------------------------- | ------------------------------- |
| `docs/00-requirements/03-technology-stack.md` | vite, drizzle-kitバージョン更新 |

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:update-all-docs
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/spec-writer.md`
- **選定理由**: システムドキュメント更新の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] 技術スタックドキュメントが更新されている

##### 依存関係

- **前提**: T-08-1
- **後続**: なし（完了）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] viteが更新されている（esbuild 0.25.0+含む）
- [ ] drizzle-kitが更新されている（esbuild 0.25.0+含む）

### 品質要件

- [ ] 全テスト成功
- [ ] ビルド成功
- [ ] 開発サーバー正常起動

### セキュリティ要件

- [ ] pnpm audit結果が0件
- [ ] GHSA-67mh-4wv8-2f99が解消されている

### ドキュメント要件

- [ ] 技術スタックドキュメントが更新されている

---

## 6. 検証方法

### 脆弱性確認

```bash
pnpm audit
```

期待結果: `found 0 vulnerabilities`

### ビルド確認

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop build
```

### テスト確認

```bash
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run
```

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                             |
| ------------------------ | ------ | -------- | -------------------------------- |
| 破壊的変更による動作不良 | 中     | 低       | 段階的更新、各更新後テスト実行   |
| ビルド失敗               | 中     | 低       | バージョン固定、ロールバック準備 |
| 開発サーバー起動失敗     | 低     | 低       | 設定ファイル確認、ロールバック   |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/chat-history-persistence/security-audit-report.md` - セキュリティ監査レポート
- `.claude/agents/dep-mgr.md` - 依存関係管理エージェント
- `.claude/skills/dependency-security-scanning/SKILL.md` - 依存関係スキャンスキル

### 参考資料

- [GHSA-67mh-4wv8-2f99 - esbuild CORS vulnerability](https://github.com/advisories/GHSA-67mh-4wv8-2f99)
- [vite Changelog](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md)
- [drizzle-kit Releases](https://github.com/drizzle-team/drizzle-orm/releases)

---

## 9. 備考

### レビュー指摘の原文

```
### 3. A06: 脆弱なコンポーネント（Low）

**重大度**: Low
**CVSS**: 5.3 (AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N)

**推奨対策**:
pnpm update vite
pnpm update drizzle-kit
```

### 補足事項

**更新の優先順位**:

1. vite（影響範囲: apps/desktop）
2. drizzle-kit（影響範囲: packages/shared）

**更新後の確認項目**:

- HMR（Hot Module Replacement）が正常動作すること
- マイグレーション生成が正常動作すること
