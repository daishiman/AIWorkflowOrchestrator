---
task_id: UT-IMP-AUTHKEY-VALIDATE-REALTIME-001
task_name: AuthKeySection に保存前リアルタイムAPIキー検証を統合
category: 改善
target_feature: Settings AuthKeySection UI / auth-key:validate IPC
priority: 中
scale: 中規模
status: 未実施
source_phase: Phase 10
created_date: 2026-03-06
dependencies:
  - UT-IMP-AUTHKEY-EXISTS-SOURCE-FIELD-001
issue_number: 1065
---

# AuthKeySection に保存前リアルタイムAPIキー検証を統合 - タスク指示書

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | UT-IMP-AUTHKEY-VALIDATE-REALTIME-001                 |
| タスク名     | AuthKeySection に保存前リアルタイムAPIキー検証を統合 |
| 分類         | 改善                                                 |
| 対象機能     | Settings AuthKeySection UI / auth-key:validate IPC   |
| 優先度       | 中                                                   |
| 見積もり規模 | 中規模（4-8時間）                                    |
| ステータス   | 未実施                                               |
| 発見元       | TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 Phase 10  |
| 発見日       | 2026-03-06                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在の AuthKeySection は APIキーを保存する際に、キーの有効性を事前に検証しない。`auth-key:validate` IPCチャネルは既に定義済みだが、UI側からの呼び出し導線が未実装。無効なAPIキーが保存されると、スキル実行時に初めて認証エラーが発生する。

### 1.2 問題点・課題

1. APIキーの有効性検証が保存時に行われないため、無効なキーがそのまま永続化される
2. `auth-key:validate` IPCチャネルは定義済みだが、AuthKeySection UIからの呼び出し導線が存在しない
3. ユーザーは無効なキーを保存した後、スキル実行時に初めてエラーに気づく（フィードバックの遅延）

### 1.3 放置した場合の影響

- ユーザーが無効なAPIキーを保存し、スキル実行失敗時まで問題に気づけない
- 認証エラーの原因特定に時間がかかる（「キーが無効」なのか「他の問題」なのか判別困難）
- UX品質の低下（即座のフィードバックがない設定画面）

---

## 2. 何を達成するか（What）

### 2.1 目的

AuthKeySection の「保存」ボタン押下時に `auth-key:validate` を呼び出し、APIキーの有効性をAnthropicAPI経由で事前検証する。検証結果をUI上でフィードバックし、無効なキーの保存を防止する。

### 2.2 最終ゴール

- 保存ボタン押下 -> 検証中（ローディング表示） -> 検証成功: 保存実行 / 検証失敗: エラー表示で保存中断
- ネットワークエラー時: 警告表示しつつユーザー判断で保存可能（フェイルオープン）

### 2.3 スコープ

#### 含むもの

- AuthKeySection に「検証中」状態（ローディングスピナー）の追加
- 保存前の `window.electronAPI.authKey.validate(key)` 呼び出し
- 検証結果に応じたUIフィードバック（成功/失敗/警告）
- ネットワークエラー時のフェイルオープン判断UI
- 新規テストの追加

#### 含まないもの

- `auth-key:validate` IPCハンドラ自体の実装変更
- Anthropic API の認証エンドポイント変更
- subscription モードでの検証ロジック

### 2.4 成果物

- 更新済み AuthKeySection コンポーネント
- 検証フロー用のカスタムフック（必要に応じて）
- 新規テストファイル

### 2.5 期待効果

- ユーザーが無効なAPIキーを保存するのを事前に防止
- 認証エラーの早期発見（スキル実行時ではなく設定時に）
- UX品質の向上（即座のフィードバック）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `auth-key:validate` IPCチャネルが定義・実装済みであること

### 3.2 依存タスク

- UT-IMP-AUTHKEY-EXISTS-SOURCE-FIELD-001（source フィールドとの連携）

### 3.3 必要な知識

- AuthKeySection コンポーネントの現行構造
- `auth-key:validate` / `auth-key:set` IPCハンドラの引数・戻り値
- `AuthModeService#validateAuthMode()` の動作仕様（authMode が "api-key" の場合のみ検証実行）
- Zustand 個別セレクタパターン（P31対策）

### 3.4 推奨アプローチ

1. AuthKeySection に「検証中」状態を追加（ローディングスピナー表示）
2. 保存前に `window.electronAPI.authKey.validate(key)` を呼び出し
3. 検証成功: そのまま `auth-key:set` で保存
4. 検証失敗: エラーメッセージ表示、保存を中断
5. ネットワークエラー: 警告を表示しつつ、ユーザー判断で保存可能にする（フェイルオープン）

```typescript
// 検証フローの骨格
const handleSave = async (apiKey: string) => {
  setValidating(true);
  try {
    const result = await window.electronAPI.authKey.validate(apiKey);
    if (result.valid) {
      await window.electronAPI.authKey.set(apiKey);
      // 成功フィードバック表示
    } else {
      // エラーフィードバック表示（保存中断）
    }
  } catch (error) {
    // ネットワークエラー: 警告付きで保存可能にする
    setShowNetworkWarning(true);
  } finally {
    setValidating(false);
  }
};
```

---

## 4. 苦戦箇所と解決のヒント

### 4.1 TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 での苦戦

| 課題                                 | 原因                                                       | 解決のヒント                                                          |
| ------------------------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------- |
| validateAuthMode の空振り            | authMode が "api-key" の場合のみ検証実行                   | 呼び出し前に authMode を確認し、subscription モードでは検証をスキップ |
| ネットワーク遅延によるUI不整合       | Anthropic API への実リクエストに遅延がある                 | 楽観的UIと検証完了UIの2段階表示が必要                                 |
| happy-dom テスト環境での制約         | fetch モックが必要、userEvent が使用不可（P39）            | fireEvent + act で非同期ハンドラをテスト                              |
| フェイルセキュア vs フェイルオープン | ネットワーク障害時にキー保存を許可するかどうかのUX設計判断 | 警告表示 + ユーザー確認ダイアログでフェイルオープンを採用             |

### 4.2 参照すべき仕様書

| 仕様書                     | 内容                                                       |
| -------------------------- | ---------------------------------------------------------- |
| `api-ipc-auth.md`          | auth-key:validate / auth-key:set IPCチャネル仕様           |
| `arch-ui-components.md`    | AuthKeySection コンポーネント仕様                          |
| `arch-state-management.md` | Zustand Store 設計（個別セレクタパターン）                 |
| `06-known-pitfalls.md`     | P39（happy-dom userEvent非互換）、P42（3段バリデーション） |

---

## 5. 受入基準

- [ ] 保存前に `auth-key:validate` が呼び出される
- [ ] 検証成功時のみ `auth-key:set` が呼び出される
- [ ] 検証中はローディング状態が表示される
- [ ] 検証失敗時にエラーメッセージが表示される
- [ ] ネットワークエラー時に警告付きで保存可能
- [ ] Apple HIG準拠のフィードバックUI（#34C759成功, #FF3B30失敗, #FF9500警告）
- [ ] 既存テスト全PASS + 新規テスト追加
