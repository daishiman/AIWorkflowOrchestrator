# UT-9B-H-005: Preload API二重公開パターンの統一

## フロントマター

```yaml
issue_number: 793
```

## メタ情報

| 項目        | 値                                        |
| ----------- | ----------------------------------------- |
| タスクID    | UT-9B-H-005                               |
| カテゴリ    | ref（リファクタリング）                   |
| 優先度      | 低                                        |
| 規模        | 中規模                                    |
| 関連タスク  | TASK-9B-H, UT-FIX-5-1-001, TASK-FIX-5-1   |
| 発見元      | Phase 10 最終レビュー M-02 / Phase 11 D-3 |
| 関連Pitfall | P23 (API二重定義の型管理複雑性)           |

---

## 1. Why（背景・問題点・影響）

### 背景

現在のElectronアプリでは、Preload APIが2つの経路で公開されている:

- `window.electronAPI.xxx` — `contextBridge.exposeInMainWorld("electronAPI", {...})` 経由
- `window.xxxAPI` — `contextBridge.exposeInMainWorld("xxxAPI", xxxAPI)` 経由

この二重公開パターンは、`skillAPI`、`authAPI`、`skillCreatorAPI`等の全APIで踏襲されている。

### 問題点

1. **型定義の複雑化**: `preload/types.ts` で `ElectronAPI.xxx` と `window.xxxAPI` の両方に型定義が必要
2. **保守コストの増大**: API変更時に2箇所の更新が必要（P23パターン）
3. **Renderer側の混乱**: どちらの経路でアクセスすべきか不明確

### 影響

- 新しいIPC APIを追加するたびに二重定義のボイラープレートが増加
- P32（型定義の二箇所同時更新必須）のリスクが蓄積

---

## 2. What（目的・ゴール・スコープ）

### 目的

Preload API公開パスを単一パターンに統一し、型定義・保守の複雑性を削減する

### ゴール

- 全APIが `window.electronAPI.xxx` または `window.xxxAPI` のいずれか1つの経路で公開される
- `preload/types.ts` の二重型定義が解消される
- Renderer側のアクセスパスが統一される

### スコープ

- `preload/index.ts` の `contextBridge.exposeInMainWorld` 呼び出しの統一
- `preload/types.ts` の型定義整理
- Renderer側のimport/アクセスパスの更新
- 影響を受けるテストの更新

### スコープ外

- IPC通信ロジックの変更
- ハンドラー実装の変更
- 新規機能追加

---

## 3. How（方針・アプローチ）

### 推奨アプローチ: `window.electronAPI.xxx` に統一

**理由**:

- 既存の`electronAPI`オブジェクトが最も多くのメソッドを含む
- 名前空間としてのまとまりが良い
- 1つのcontextBridge呼び出しで全APIを公開できる

### 実装方針

1. `window.xxxAPI` 個別公開を段階的に削除
2. `electronAPI` オブジェクト内に全APIを統合
3. `preload/types.ts` の `Window` インターフェースから個別API宣言を削除
4. Renderer側のアクセスパスを `window.electronAPI.xxx` に統一

### 段階的移行計画

1. Phase 1: 新規APIは `electronAPI.xxx` のみで公開
2. Phase 2: 既存APIの `window.xxxAPI` を `@deprecated` マーク
3. Phase 3: Renderer側のアクセスパスを更新
4. Phase 4: 旧公開パスを削除

---

### 3.5 実装課題と解決策（TASK-9B-Hからの学び）

#### 課題1: Preload統合の4点チェックリスト

- **問題**: `skill-creator-api.ts`でAPIオブジェクトを定義したが、`preload/index.ts`でのcontextBridge公開が漏れた（TASK-9B-H Phase 8-9で修正）
- **根本原因**: Preload API追加時の手順が明文化されていなかった
- **解決策**: Preload API追加/変更時の必須チェックリスト:
  1. `import { xxxAPI } from "./xxx-api"` の追加/更新
  2. `electronAPI`オブジェクト内に `xxx: xxxAPI` を追加/更新
  3. `contextBridge.exposeInMainWorld` の追加/更新
  4. non-isolatedフォールバックの追加/更新
- **参照**: lessons-learned.md Lesson 1

#### 課題2: 型定義の二箇所同時更新

- **問題**: `packages/shared/src/types` と `apps/desktop/src/preload/types.ts` の2ファイルで型定義を同期する必要があるが、片方の更新を忘れやすい
- **解決策**: P32パターンとして記録済み。型変更時は必ず両ファイルを同時に編集し、`pnpm typecheck`で検証
- **参照**: 06-known-pitfalls.md P32

#### 課題3: L3セキュリティ検証の横展開必要性

- **問題**: UT-9B-H-003でskillCreatorHandlersに追加したL3セキュリティ検証（validatePath, sanitizeErrorMessage, ALLOWED_SCHEMA_NAMES）は、API統一後に他のハンドラーにも横展開が必要になる可能性がある。API統一時にセキュリティ検証パターンの一貫性も確保する必要がある
- **解決策**: API統一作業と同時にL3セキュリティ検証の横展開要否を評価する。UT-9B-H-003のYAGNI判断結果（3軸評価: 使用箇所数1、変更頻度低、ドメイン固有）を参考に、統一後の使用箇所数に基づいて共通化を再判断する
- **参照**: architecture-implementation-patterns.md v1.21.0, lessons-learned.md v1.6.0 苦戦箇所3（YAGNI判断）

---

## 4. 実行手順

| Step | アクション                      | 成果物                          |
| ---- | ------------------------------- | ------------------------------- |
| 1    | 現状の全API公開パスを調査       | API公開パス一覧表               |
| 2    | 統一先パターンの決定            | 設計書                          |
| 3    | `preload/index.ts` の修正       | 統一されたcontextBridge呼び出し |
| 4    | `preload/types.ts` の型定義整理 | 二重定義解消                    |
| 5    | Renderer側アクセスパスの更新    | 統一されたimportパス            |
| 6    | テストの更新                    | 全テストPASS                    |
| 7    | TypeScript型チェック            | エラー0件                       |

---

## 5. 完了条件

- [ ] 全APIが単一経路で公開されている
- [ ] `preload/types.ts` に二重型定義がない
- [ ] Renderer側で統一されたアクセスパスが使用されている
- [ ] 全テストがPASSしている
- [ ] TypeScript型チェックがエラー0件

---

## 6. 検証方法

- DevToolsで `window.electronAPI.skillCreator` がアクセス可能であることを確認
- DevToolsで `window.skillCreatorAPI === undefined` であることを確認（旧パス削除後）
- `pnpm --filter @repo/desktop vitest run` で全テストPASS
- `pnpm typecheck` でエラー0件

---

## 7. リスクと対策

| リスク                               | 影響               | 対策                                                                                                                                     |
| ------------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer側の既存コードが旧パスを使用 | ランタイムエラー   | grep で全使用箇所を事前に特定し一括更新                                                                                                  |
| contextIsolation false環境での互換性 | フォールバック破壊 | non-isolated環境でのテストを追加                                                                                                         |
| 段階的移行中の二重公開状態           | 混乱               | deprecationログで警告、移行期間を明示                                                                                                    |
| L3セキュリティ検証の非一貫性         | 中（影響度: 高）   | API統一時に各ハンドラーのL3検証レベルを調査し、統一方針を決定する。architecture-implementation-patterns.md v1.21.0のチェックリストを使用 |

---

## 8. 参照情報

### 関連仕様書

| 仕様書                                            | 関連セクション                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `architecture-implementation-patterns.md`         | IPC Preload統合パターン                                                              |
| `security-electron-ipc.md`                        | Electron IPCセキュリティ仕様                                                         |
| `api-ipc-agent.md`                                | IPC API公開パス                                                                      |
| `lessons-learned.md`                              | Lesson 1: Preload統合見落とし                                                        |
| `lessons-learned.md` v1.6.0                       | UT-9B-H-003苦戦箇所5件                                                               |
| `architecture-implementation-patterns.md` v1.21.0 | IPC L3ドメイン検証パターン（validatePath/sanitizeErrorMessage/ALLOWED_SCHEMA_NAMES） |
| `06-known-pitfalls.md`                            | P23, P32                                                                             |

### 関連タスク

| タスクID       | 関連内容                                        |
| -------------- | ----------------------------------------------- |
| TASK-FIX-5-1   | SkillAPI二重定義統一（先行事例）                |
| UT-FIX-5-1-001 | AgentView型アサーション解消                     |
| TASK-9B-H      | SkillCreatorService IPC統合（本タスクの発見元） |

---

## 9. 備考

- TASK-FIX-5-1（SkillAPI統一）の知見を活用可能
- 段階的移行により、既存機能への影響を最小化
- 全APIの統一は大規模変更のため、優先度は「低」とする
