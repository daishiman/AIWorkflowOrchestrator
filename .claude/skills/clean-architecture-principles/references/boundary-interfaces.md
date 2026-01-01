# 境界インターフェース

## 概要

境界インターフェースは内側の層が外側の実装に依存しないための契約を定義する。
Use Cases から外部I/Oへ依存する場合、入出力ポートを通じて依存方向を制御する。

## 設計原則

- 内側がインターフェースを定義し、外側が実装する。
- 入力ポートと出力ポートを分離して責務を明確にする。
- DTOはユースケース層に寄せ、外側の形式変換はアダプターに委譲する。

## 例: 入出力ポート

```
// Use Cases 層
export interface UserInputPort {
  register(input: RegisterUserRequest): Promise<RegisterUserResponse>;
}

export interface UserOutputPort {
  save(user: User): Promise<void>;
}
```

## レビュー観点

- 外側の詳細（DB/HTTP/UI）が内側に漏れていないか。
- インターフェースが過剰に肥大化していないか。
- 入出力の責務が分離されているか。
