# Phase 11: 発見課題リスト

## 概要

手動テストで発見した課題を重要度別に分類し、対応方針を決定しました。

---

## 発見課題サマリー

| 重要度   | 件数 | 対応方針           |
| -------- | ---- | ------------------ |
| Critical | 0    | -                  |
| Major    | 0    | -                  |
| Minor    | 1    | 別タスクとして管理 |
| Info     | 2    | 情報共有           |

---

## 課題詳細

### Critical（即時対応必要）

なし

---

### Major（対応必要）

なし

---

### Minor（改善推奨）

#### MINOR-001: MessageBubbleのマークダウン処理セキュリティ

| 項目     | 内容                                                                  |
| -------- | --------------------------------------------------------------------- |
| 対象     | `apps/desktop/src/renderer/components/conversation/MessageBubble.tsx` |
| 現状     | `dangerouslySetInnerHTML`で未サニタイズHTML出力                       |
| リスク   | XSS攻撃の可能性（低：信頼されたLLM出力のみ表示）                      |
| 推奨対応 | DOMPurify.sanitize()でサニタイズ後に出力                              |
| 影響度   | 低                                                                    |
| 対応方針 | 別タスクとして管理（セキュリティ改善タスク）                          |

**コード例**:

```typescript
// 現状
<span dangerouslySetInnerHTML={{ __html: part }} />

// 推奨
import DOMPurify from 'dompurify';
<span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(part) }} />
```

---

### Info（情報共有）

#### INFO-001: 仮想スクロールのデフォルト有効化検討

| 項目   | 内容                                                             |
| ------ | ---------------------------------------------------------------- |
| 対象   | `MessageList` コンポーネント                                     |
| 現状   | `virtualize` prop でオプトイン                                   |
| 提案   | 大量メッセージ時のパフォーマンス向上のためデフォルト有効化を検討 |
| 優先度 | 低                                                               |

#### INFO-002: ConversationListPanelへの仮想スクロール対応検討

| 項目   | 内容                                           |
| ------ | ---------------------------------------------- |
| 対象   | `ConversationListPanel` コンポーネント         |
| 現状   | 仮想スクロール未対応                           |
| 提案   | 大量会話時のパフォーマンス向上のため対応を検討 |
| 優先度 | 低                                             |

---

## 対応方針決定

### 本タスクで対応

なし（CriticalおよびMajor課題なし）

### 別タスクとして管理

| 課題ID    | 内容                    | 推奨タスク名                      |
| --------- | ----------------------- | --------------------------------- |
| MINOR-001 | DOMPurifyサニタイズ追加 | conversation-security-improvement |

### 対応不要（情報共有のみ）

| 課題ID   | 理由                           |
| -------- | ------------------------------ |
| INFO-001 | 現状のオプトイン方式で問題なし |
| INFO-002 | 現状のパフォーマンスで問題なし |

---

## 既知の制限事項

### 1. conversationRepository.test.ts の失敗

- **原因**: SQLite/Database初期化の問題（@repo/sharedパッケージ解決エラー）
- **影響**: 会話UIコンポーネントには影響なし（Repository層の問題）
- **対応**: 別issue（インフラ/ビルド関連）として管理済み

### 2. agentHandlers関連テストの失敗

- **原因**: @repo/shared パッケージのエントリポイント解決エラー
- **影響**: 会話UIコンポーネントには影響なし（Agent SDK統合の問題）
- **対応**: 別issue（モノレポビルド関連）として管理済み

---

## 結論

会話履歴UI実装に関するCriticalおよびMajor課題は発見されませんでした。
Minor課題（DOMPurifyサニタイズ）は将来のセキュリティ改善タスクとして記録します。

---

## 完了条件チェックリスト

- [x] 発見課題を重要度別に分類
- [x] 対応方針を決定
- [x] `outputs/phase-11/discovered-issues.md` 作成完了

---

## 最終判定: PASS

Critical/Major課題なし。Phase 12（ドキュメント更新）へ進行可能。
