# Phase 4: M-2 対処 - resolve() シグネチャ確定

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 対象 MINOR | M-2                                        |
| 作成日     | 2026-03-21                                 |

---

## 1. 比較対象

### 案A: 呼び出し元が引数を明示的に渡す形式（現行 RuntimePolicyResolver）

```typescript
interface IRuntimePolicyResolver {
  resolve(authMode: AuthMode, apiKey: string | null): Promise<RuntimeDecision>;
}
```

- 呼び出し元が `authMode` と `apiKey` を IPC ハンドラー内で取得して渡す
- テスト時に引数を自由に差し替え可能（モック不要）
- 呼び出し元に「どこから authMode / apiKey を取得するか」の責務が発生する

### 案B: Resolver 内部で DI 注入済みストアから取得する形式（現行 RuntimeResolver）

```typescript
interface IRuntimeResolver {
  resolve(): Promise<RuntimeResolution>;
}
```

- `IAuthModeService` / `IAuthKeyService` を Constructor Injection で注入
- 呼び出し元は引数なしで `resolve()` を呼ぶだけ
- テスト時はサービスモックの差し替えが必要

### 案H（ハイブリッド）: 現行 RuntimePolicyResolver の `resolveWithService()` パターン

```typescript
interface IRuntimePolicyResolver {
  resolve(authMode: AuthMode, apiKey: string | null): Promise<RuntimeDecision>;
  resolveWithService(authMode: AuthMode): Promise<RuntimeDecision>;
}
```

- `resolve()` は引数明示型（Unit テスト向き）
- `resolveWithService()` は authKeyService から apiKey を内部取得（IPC ハンドラー向き）
- 現行コードに既に存在するパターン

---

## 2. 判定: 案A（引数明示型）を正規シグネチャとして確定

### 確定シグネチャ

```typescript
export interface IRuntimePolicyResolver {
  resolve(authMode: AuthMode, apiKey: string | null): Promise<RuntimeDecision>;
}
```

### 判定根拠

| 評価軸                           | 案A（引数明示）                               | 案B（DI 内部取得）                         | 案H（ハイブリッド）                 |
| -------------------------------- | --------------------------------------------- | ------------------------------------------ | ----------------------------------- |
| テスタビリティ                   | 高（引数を直接制御）                          | 中（サービスモックが必要）                 | 高（resolve で直接制御可能）        |
| 呼び出し元の責務                 | 中（authMode + apiKey の取得が必要）          | 低（引数なし）                             | 低〜中（resolveWithService なら低） |
| DI 複雑性                        | 低（Resolver 自体のモックのみ）               | 高（2 サービスのモックが必要）             | 中（authKeyService のモックが必要） |
| インターフェース明確性           | 高（入出力が明示的）                          | 低（内部依存が隠蔽される）                 | 中（2 メソッドで混乱の可能性）      |
| 現行コードとの整合               | 高（`IRuntimePolicyResolver` が既に案A 形式） | 低（`RuntimeResolver` は deprecated 予定） | 高（現行コードそのまま）            |
| Policy Consumption Contract 適合 | 高（原則1 の型スニペットと一致）              | 低（contract-matrix.md の型と不一致）      | 中（正規メソッドが不明確）          |

### 案B を不採用とする理由

1. `RuntimeResolver` は DD-1 により deprecated 予定であり、そのパターン（引数なし DI 型）を正規シグネチャに採用するのは設計判断と矛盾する
2. Policy Consumption Contract 原則 1 の型スニペット（`resolve(authMode, apiKey)`）と整合しない
3. P35（DI 追加時のテストモック大規模修正）のリスクが高い

### 案H を不採用とする理由

1. `resolveWithService()` はインターフェース（`IRuntimePolicyResolver`）に含まれていない内部メソッドであり、正規 API として公開すると DI 境界が曖昧になる
2. 2 メソッドの使い分けルールが Policy Consumption Contract に記載されておらず、実装者が誤って `resolveWithService()` を直接呼ぶリスクがある
3. 案A の `resolve(authMode, apiKey)` 1 本に統一する方が simpler alternative の原則に適合する

### IPC ハンドラーでの呼び出しパターン（案A 採用時）

```typescript
// IPC ハンドラー内での標準的な呼び出し
const authMode = authModeService.getMode();
const apiKey = await authKeyService.getKey();
const decision = await runtimePolicyResolver.resolve(authMode, apiKey);
```

`authMode` と `apiKey` の取得は IPC ハンドラーの責務とする。これにより:

- Resolver は純粋な判定ロジックに集中できる
- IPC ハンドラーが「どのサービスから取得するか」を制御する（DD-2 の apiKey 除外もハンドラー層で実施）

---

## 3. contract-matrix.md への追記内容

原則 1 に以下を確定シグネチャとして追記する:

```
[確定] IRuntimePolicyResolver.resolve(authMode: AuthMode, apiKey: string | null): Promise<RuntimeDecision>
[確定] authMode は IPC ハンドラー内で IAuthModeService.getMode() から取得する
[確定] apiKey は IPC ハンドラー内で IAuthKeyService.getKey() から取得する
[禁止] resolveWithService() を IPC ハンドラーから直接呼び出すこと（内部ユーティリティ扱い）
```
