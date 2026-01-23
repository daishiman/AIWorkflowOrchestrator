# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase番号  | 7                         |
| Phase名    | カバレッジ確認            |
| 目的       | 型チェック網羅性確認      |
| 前提Phase  | Phase 6（追加検証テスト） |
| 推定作業量 | 小                        |

---

## 1. 目的

型エクスポートの検証が網羅的に行われていることを確認し、漏れがないことを保証する。

---

## 2. 実行タスク

### Task 7-1: エクスポート網羅性確認

#### 目的

Part 2で定義された全てのエクスポートが正しく機能することを確認する。

#### 確認対象

| カテゴリ         | 項目                            | 確認状態 |
| ---------------- | ------------------------------- | -------- |
| インターフェース | Community                       | 要確認   |
| インターフェース | CommunitySummary                | 要確認   |
| インターフェース | CommunityStructure              | 要確認   |
| インターフェース | CommunityDetectionOptions       | 要確認   |
| インターフェース | CommunityDetectionResult        | 要確認   |
| インターフェース | CommunityDetectionStats         | 要確認   |
| インターフェース | CommunitySummarizationOptions   | 要確認   |
| インターフェース | CommunitySummarizationResult    | 要確認   |
| 列挙型           | CommunityErrorCode              | 要確認   |
| 列挙型           | CommunitySummarizationErrorCode | 要確認   |
| クラス           | CommunityDetectionError         | 要確認   |
| クラス           | CommunitySummarizationError     | 要確認   |
| 関数             | normalizeEntityName             | 要確認   |

#### 確認コマンド

```bash
# エクスポート一覧を取得
grep -E "^export" packages/shared/src/services/graph/index.ts

# 型エクスポートをカウント
grep -c "export type" packages/shared/src/services/graph/index.ts

# 値エクスポートをカウント
grep -E "^export \{" packages/shared/src/services/graph/index.ts | grep -v "type"
```

#### 成果物

| 成果物             | 配置先                               |
| ------------------ | ------------------------------------ |
| エクスポート網羅性 | `outputs/phase-7/export-coverage.md` |

#### 完了条件

- [ ] 全てのCommunity関連型がエクスポートされている
- [ ] 型（export type）と値（export）が正しく区別されている
- [ ] 漏れがないことが確認されている

---

### Task 7-2: 消費側網羅性確認

#### 目的

エクスポートが実際に消費側で使用可能であることを確認する。

#### 確認対象

| 消費側パッケージ | 確認内容                        | 状態   |
| ---------------- | ------------------------------- | ------ |
| @repo/desktop    | Community型インポート可能       | 要確認 |
| @repo/desktop    | CommunityErrorCode使用可能      | 要確認 |
| @repo/desktop    | CommunityDetectionError使用可能 | 要確認 |

#### 確認方法

1. 実際のインポート文がエラーなく解決される
2. 型チェックがPASSする
3. ビルドが成功する

#### 成果物

| 成果物           | 配置先                                 |
| ---------------- | -------------------------------------- |
| 消費側網羅性確認 | `outputs/phase-7/consumer-coverage.md` |

#### 完了条件

- [ ] 消費側パッケージで全てのエクスポートが使用可能
- [ ] 型チェック・ビルドがPASS

---

### Task 7-3: 統合検証

#### 目的

全体として型エクスポートが正しく機能することを最終確認する。

#### 検証コマンド

```bash
# 全体型チェック
pnpm typecheck

# 全体ビルド
pnpm build

# Lintチェック
pnpm lint
```

#### 成果物

| 成果物       | 配置先                                        |
| ------------ | --------------------------------------------- |
| 統合検証結果 | `outputs/phase-7/integration-verification.md` |

#### 完了条件

- [ ] 全体型チェックがPASS
- [ ] 全体ビルドが成功
- [ ] Lintエラーがない

---

## 3. 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                      | パス                                                                                      | 内容                   |
| ----------------------------- | ----------------------------------------------------------------------------------------- | ---------------------- |
| モノレポアーキテクチャ        | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`              | 型エクスポートパターン |
| Community検出インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md` | Community型一覧        |

### Phase 5/6成果物

| 成果物                          | 参照目的       |
| ------------------------------- | -------------- |
| post-fix-verification.md        | 修正後検証結果 |
| backward-compatibility-check.md | 下位互換性確認 |

---

## 4. 成果物一覧

| 成果物             | ファイル名                    | 必須 |
| ------------------ | ----------------------------- | ---- |
| エクスポート網羅性 | `export-coverage.md`          | ✅   |
| 消費側網羅性確認   | `consumer-coverage.md`        | ✅   |
| 統合検証結果       | `integration-verification.md` | ✅   |

---

## 5. 完了条件

### 機能要件

- [ ] 全てのエクスポートが網羅的に確認されている
- [ ] 消費側での使用が確認されている
- [ ] 統合検証がPASS

### 品質要件

- [ ] 漏れがないことが証明されている
- [ ] 検証結果が正確に記録されている

### Phase完了時の必須アクション

1. 上記成果物を `outputs/phase-7/` に出力
2. artifacts.json の phase-7 ステータスを更新
3. 各タスクを100%実行し、完遂した旨を明記
