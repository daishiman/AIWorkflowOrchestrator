# E2Eテスト環境構築（Slide機能） - タスク指示書

## メタ情報

```yaml
issue_number: 307
```

## メタ情報

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| タスクID     | task-e2e-test-setup-slide        |
| タスク名     | E2Eテスト環境構築（Slide機能）   |
| 分類         | 改善                             |
| 対象機能     | Slide同期機能（順同期・逆同期）  |
| 優先度       | 中                               |
| 見積もり規模 | 中規模（2-3 Phase、3-5日）       |
| ステータス   | 未実施                           |
| 発見元       | Phase 12 - 手動テストPENDING項目 |
| 発見日       | 2026-01-10                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

slide-reverse-sync機能（index.html → structure.md 逆同期）の実装において、以下のテストがPENDING状態となっています:

- Main/Renderer間のIPC通信テスト
- E2E統合テスト（ファイル変更検知 → 同期完了までのフロー）
- UIコンポーネント（SyncStatusIndicator）の実動作テスト

これらはAgent SDK統合完了後に実施予定ですが、その前にE2Eテスト環境自体を構築する必要があります。

### 1.2 問題点・課題

| 問題点                           | 影響                                    |
| -------------------------------- | --------------------------------------- |
| E2Eテスト環境が未構築            | 実環境での動作確認ができない            |
| Main/Renderer IPC テストが未実施 | プロセス間通信の不具合を検出できない    |
| UI自動テストがない               | SyncStatusIndicator等のUI検証が手動のみ |
| 30秒タイムアウトの動作未検証     | 実環境でのタイムアウト動作が不明        |

### 1.3 放置した場合の影響

- Agent SDK統合後の動作確認に時間がかかる
- Main/Renderer間の通信問題が本番で発見される可能性
- UIの表示不具合が検出されない
- 回帰テストの自動化ができない

---

## 2. 何を達成するか（What）

### 2.1 目的

Slide機能（順同期・逆同期）のE2Eテスト環境を構築し、Main/Renderer IPC通信、UIコンポーネント動作、ファイル同期フローを自動テストできるようにする。

### 2.2 最終ゴール

1. PlaywrightでElectronアプリのE2Eテストが実行できる
2. Main/Renderer間IPC通信のテストが自動化されている
3. SyncStatusIndicatorの状態遷移が検証できる
4. ファイル変更 → 同期完了のフルフローがテストできる
5. タイムアウト動作が検証できる

### 2.3 スコープ

#### 含むもの

- Playwright Electron設定
- IPC通信テストユーティリティ
- UIコンポーネントテスト（SyncStatusIndicator）
- ファイル監視→同期フローテスト
- タイムアウトテスト
- CI/CD統合（GitHub Actions）

#### 含まないもの

- Agent SDK統合（別タスク）
- 新規UI機能の開発
- 他機能（認証、チャット等）のE2Eテスト

### 2.4 成果物

| 成果物                     | 配置先                                     |
| -------------------------- | ------------------------------------------ |
| Playwright設定             | `playwright.config.ts`（Electron設定追加） |
| E2Eテストファイル          | `apps/desktop/e2e/slide/*.spec.ts`         |
| IPCテストユーティリティ    | `apps/desktop/e2e/utils/ipc-helper.ts`     |
| ファイル操作ユーティリティ | `apps/desktop/e2e/utils/file-helper.ts`    |
| CI/CD設定                  | `.github/workflows/e2e-test.yml`           |
| 実装ガイド                 | `docs/testing/e2e-slide-guide.md`          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Electronアプリがビルドできる状態
- Playwrightがインストールされている
- Vitestによるユニットテストが動作している

### 3.2 依存タスク

| 依存タスク             | 関係                                 |
| ---------------------- | ------------------------------------ |
| slide-reverse-sync実装 | 完了済み（テスト対象）               |
| Agent SDK統合          | 並行可能（シミュレーションでテスト） |

### 3.3 必要な知識・スキル

- Playwright（Electron対応）
- Electron Main/Renderer アーキテクチャ
- IPC通信パターン
- ファイルシステム操作

### 3.4 推奨アプローチ

1. Playwright Electronの設定から開始
2. シンプルなIPCテストで動作確認
3. ファイル監視テストの実装
4. UIテストの実装
5. CI/CD統合

---

## 4. 実行手順

### Phase構成

| Phase | 名称           | 成果物                         |
| ----- | -------------- | ------------------------------ |
| 1     | 要件定義       | E2Eテスト要件書                |
| 2     | 設計           | テストアーキテクチャ設計書     |
| 3     | 設計レビュー   | レビュー結果                   |
| 4     | テスト環境構築 | Playwright設定、ユーティリティ |
| 5     | テスト実装     | E2Eテストスイート              |
| 6     | CI/CD統合      | GitHub Actions設定             |
| 7     | ドキュメント   | 実装ガイド                     |

### Phase 4: テスト環境構築

#### 使用スキル

| スキル名            | パス                                          | 選定理由                                   |
| ------------------- | --------------------------------------------- | ------------------------------------------ |
| integration-testing | `.claude/skills/integration-testing/SKILL.md` | Trigger: 統合テスト設計、E2Eテスト環境構築 |
| electron-ipc        | `.claude/skills/electron-ipc/SKILL.md`        | Trigger: Main/Renderer間通信、IPCテスト    |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

#### 目的

Playwright + Electronの設定とテストユーティリティを構築する

#### 成果物

```
apps/desktop/
├── e2e/
│   ├── slide/
│   │   ├── sync-flow.spec.ts      # 同期フローE2E
│   │   ├── ipc-communication.spec.ts # IPC通信テスト
│   │   └── ui-indicator.spec.ts   # UI状態テスト
│   └── utils/
│       ├── ipc-helper.ts          # IPCテストユーティリティ
│       └── file-helper.ts         # ファイル操作ユーティリティ
├── playwright.config.ts           # Electron対応設定
```

#### 完了条件

- [ ] Playwright Electron設定が完了
- [ ] E2Eテストが実行できる
- [ ] IPCテストユーティリティが動作する

### Phase 5: テスト実装

#### 使用スキル

| スキル名            | パス                                          | 選定理由                                |
| ------------------- | --------------------------------------------- | --------------------------------------- |
| integration-testing | `.claude/skills/integration-testing/SKILL.md` | Trigger: E2Eテストシナリオ設計          |
| exploratory-testing | `.claude/skills/exploratory-testing/SKILL.md` | Trigger: 探索的テストでエッジケース発見 |

#### 目的

Slide機能のE2Eテストを実装する

#### テストケース

| テストケース                    | 検証内容                          |
| ------------------------------- | --------------------------------- |
| E2E-01: 順同期フロー            | structure.md変更 → index.html更新 |
| E2E-02: 逆同期フロー            | index.html変更 → structure.md更新 |
| E2E-03: 無限ループ防止          | changeContextMapによる循環防止    |
| E2E-04: IPC sync-status         | Main → Renderer 状態通知          |
| E2E-05: IPC sync-progress       | 進捗通知（0-100%）                |
| E2E-06: IPC sync-error          | エラー通知                        |
| E2E-07: SyncStatusIndicator表示 | 状態に応じたUI表示                |
| E2E-08: 30秒タイムアウト        | タイムアウト時のエラー表示        |
| E2E-09: キャンセル動作          | 同期中断時の状態復帰              |

#### 完了条件

- [ ] 全テストケースが実装されている
- [ ] シミュレーションモードでテストが通過する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Playwright Electron設定が完了
- [ ] E2Eテストスイートが作成されている
- [ ] IPCテストユーティリティが動作する
- [ ] ファイル操作ユーティリティが動作する
- [ ] 全テストケース（E2E-01〜E2E-09）が実装されている

### 品質要件

- [ ] テストが安定して実行できる（flaky testなし）
- [ ] テスト実行時間が妥当（30秒以内/テスト）
- [ ] TypeScriptエラー0件
- [ ] ESLintエラー0件

### ドキュメント要件

- [ ] E2Eテスト実装ガイドが作成されている
- [ ] テストケース一覧が文書化されている
- [ ] CI/CD設定手順が文書化されている

---

## 6. 検証方法

### テスト実行コマンド

```bash
# E2Eテスト実行
pnpm --filter @repo/desktop test:e2e

# 特定テストのみ実行
pnpm --filter @repo/desktop test:e2e -- --grep "sync-flow"

# UIテスト（ヘッドレスモード）
pnpm --filter @repo/desktop test:e2e -- --headless
```

### 検証手順

1. ローカルでE2Eテストが全て通過することを確認
2. CI環境（GitHub Actions）でテストが通過することを確認
3. テストレポートが生成されることを確認

---

## 7. リスクと対策

| リスク                        | 影響度 | 発生確率 | 対策                                 |
| ----------------------------- | ------ | -------- | ------------------------------------ |
| Playwright Electron互換性問題 | 高     | 中       | 公式ドキュメント参照、バージョン固定 |
| テストのflaky化               | 中     | 高       | 適切なwait、リトライ設定             |
| CI環境での実行エラー          | 高     | 中       | ローカルとCI環境の差異を事前確認     |
| ファイル監視のタイミング問題  | 中     | 高       | debounce考慮、十分なwait時間         |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント | パス                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| IPC設計書    | `docs/30-workflows/slide-reverse-sync/outputs/phase-2/ipc-design.md`            |
| 実装ガイド   | `docs/30-workflows/slide-reverse-sync/outputs/phase-12/implementation-guide.md` |
| API仕様      | `docs/30-workflows/slide-reverse-sync/outputs/phase-2/api-specification.md`     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容              |
| ------------------------- | --------------------------------------------------------------------------- | ----------------- |
| APIエンドポイント         | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`        | Slide IPC API仕様 |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | ModifierSkill仕様 |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "IPC"`

### 参考資料

- [Playwright Electron Testing](https://playwright.dev/docs/api/class-electron)
- [Electron Testing Best Practices](https://www.electronjs.org/docs/latest/tutorial/automated-testing)

---

## 9. 備考

### 発見元のPENDING項目（Phase 11 手動テスト）

```
| No  | テスト項目              | PENDING理由 | 重要度 |
| --- | ----------------------- | ----------- | ------ |
| 6   | SyncStatusIndicator表示 | SDK統合待ち | 高     |
| 7   | 同期成功フィードバック  | SDK統合待ち | 高     |
| 8   | エラーフィードバック    | SDK統合待ち | 高     |
| 9   | Agent SDK連携           | SDK統合待ち | 中     |
| 10  | Main/Renderer IPC       | E2Eテスト実施待ち | 中     |
```

### 補足事項

- Agent SDK統合前でもシミュレーションモードでE2Eテストは実施可能
- Agent SDK統合後は実API呼び出しモードでの再テストが必要
- `task-imp-slide-agent-sdk-integration-001.md`と連携して実施

---

**最終更新**: 2026-01-10（slide-reverse-sync Phase 12より生成）
