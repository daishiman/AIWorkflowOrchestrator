# Mutual TLS (mTLS)

## 概要

相互TLS（Mutual TLS、mTLS）は、クライアントとサーバーの両方が
証明書を提示して相互に認証する方式です。
高セキュリティが求められる金融、医療、政府システムで使用されます。

## TLS vs mTLS

```
Standard TLS:
┌────────┐                              ┌────────┐
│ Client │──(1) ClientHello───────────▶│ Server │
│        │◀──(2) ServerHello + Cert────│        │
│        │──(3) Verify Server Cert────▶│        │
│        │◀──(4) Encrypted Session─────│        │
└────────┘                              └────────┘
(サーバーのみが証明書を提示)

Mutual TLS:
┌────────┐                              ┌────────┐
│ Client │──(1) ClientHello───────────▶│ Server │
│        │◀──(2) ServerHello + Cert +  │        │
│        │       CertificateRequest────│        │
│        │──(3) Client Cert + Verify──▶│        │
│        │◀──(4) Verify Client Cert────│        │
│        │◀──(5) Encrypted Session─────│        │
└────────┘                              └────────┘
(双方が証明書を提示・検証)
```

## 証明書階層

```
Root CA (信頼のルート)
├── Intermediate CA (中間CA)
│   ├── Server Certificate (サーバー証明書)
│   └── Client Certificate (クライアント証明書)
└── Intermediate CA 2
    └── ...
```

## 証明書生成

### 自己署名CA（開発用）

```bash
#!/bin/bash

# Root CA
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt \
  -subj "/CN=My Root CA/O=My Organization"

# Server Certificate
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr \
  -subj "/CN=api.example.com/O=My Organization"
openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out server.crt

# Client Certificate
openssl genrsa -out client.key 2048
openssl req -new -key client.key -out client.csr \
  -subj "/CN=client-app/O=My Organization"
openssl x509 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out client.crt
```

### Node.js証明書生成

```typescript
import forge from "node-forge";

interface CertificateInfo {
  certificate: string;
  privateKey: string;
}

class CertificateGenerator {
  generateCA(commonName: string, validityDays: number): CertificateInfo {
    const keys = forge.pki.rsa.generateKeyPair(4096);
    const cert = forge.pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = this.generateSerial();
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setDate(
      cert.validity.notBefore.getDate() + validityDays,
    );

    const attrs = [
      { name: "commonName", value: commonName },
      { name: "organizationName", value: "My Organization" },
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    cert.setExtensions([
      { name: "basicConstraints", cA: true },
      { name: "keyUsage", keyCertSign: true, cRLSign: true },
    ]);

    cert.sign(keys.privateKey, forge.md.sha256.create());

    return {
      certificate: forge.pki.certificateToPem(cert),
      privateKey: forge.pki.privateKeyToPem(keys.privateKey),
    };
  }

  generateClientCert(
    caCert: string,
    caKey: string,
    commonName: string,
    validityDays: number,
  ): CertificateInfo {
    const ca = forge.pki.certificateFromPem(caCert);
    const caPrivateKey = forge.pki.privateKeyFromPem(caKey);
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const cert = forge.pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = this.generateSerial();
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setDate(
      cert.validity.notBefore.getDate() + validityDays,
    );

    cert.setSubject([{ name: "commonName", value: commonName }]);
    cert.setIssuer(ca.subject.attributes);

    cert.setExtensions([
      { name: "basicConstraints", cA: false },
      { name: "keyUsage", digitalSignature: true },
      { name: "extKeyUsage", clientAuth: true },
    ]);

    cert.sign(caPrivateKey, forge.md.sha256.create());

    return {
      certificate: forge.pki.certificateToPem(cert),
      privateKey: forge.pki.privateKeyToPem(keys.privateKey),
    };
  }

  private generateSerial(): string {
    return Date.now().toString(16) + Math.random().toString(16).substring(2);
  }
}
```

## サーバー実装

### Node.js HTTPSサーバー

```typescript
import https from "https";
import fs from "fs";
import { Request, Response } from "express";
import express from "express";

const app = express();

// mTLS設定
const options: https.ServerOptions = {
  // サーバー証明書
  cert: fs.readFileSync("server.crt"),
  key: fs.readFileSync("server.key"),

  // CA証明書（クライアント証明書の検証用）
  ca: fs.readFileSync("ca.crt"),

  // クライアント証明書を要求
  requestCert: true,

  // 証明書がない場合は拒否
  rejectUnauthorized: true,
};

// クライアント証明書情報の取得
app.use((req: Request, res: Response, next) => {
  const cert = (req.socket as any).getPeerCertificate();

  if (!cert || Object.keys(cert).length === 0) {
    return res.status(401).json({
      error: { code: "NO_CLIENT_CERT", message: "Client certificate required" },
    });
  }

  // 証明書情報をリクエストに付与
  (req as any).clientCert = {
    subject: cert.subject,
    issuer: cert.issuer,
    validFrom: cert.valid_from,
    validTo: cert.valid_to,
    fingerprint: cert.fingerprint,
  };

  next();
});

app.get("/api/secure", (req, res) => {
  const cert = (req as any).clientCert;
  res.json({
    message: "Authenticated via mTLS",
    client: cert.subject.CN,
  });
});

https.createServer(options, app).listen(443);
```

### 証明書検証ミドルウェア

```typescript
interface ClientCertInfo {
  subject: { CN: string; O?: string };
  issuer: { CN: string; O?: string };
  fingerprint: string;
  validFrom: string;
  validTo: string;
}

class CertificateValidator {
  private readonly allowedFingerprints: Set<string>;
  private readonly allowedCNs: Set<string>;

  constructor(config: { fingerprints?: string[]; cns?: string[] }) {
    this.allowedFingerprints = new Set(config.fingerprints || []);
    this.allowedCNs = new Set(config.cns || []);
  }

  validate(cert: ClientCertInfo): { valid: boolean; reason?: string } {
    // 有効期限チェック
    const now = new Date();
    const validFrom = new Date(cert.validFrom);
    const validTo = new Date(cert.validTo);

    if (now < validFrom) {
      return { valid: false, reason: "Certificate not yet valid" };
    }

    if (now > validTo) {
      return { valid: false, reason: "Certificate expired" };
    }

    // フィンガープリント検証（オプション）
    if (this.allowedFingerprints.size > 0) {
      if (!this.allowedFingerprints.has(cert.fingerprint)) {
        return { valid: false, reason: "Certificate fingerprint not allowed" };
      }
    }

    // CN検証（オプション）
    if (this.allowedCNs.size > 0) {
      if (!this.allowedCNs.has(cert.subject.CN)) {
        return { valid: false, reason: "Certificate CN not allowed" };
      }
    }

    return { valid: true };
  }
}

function mtlsMiddleware(validator: CertificateValidator) {
  return (req: Request, res: Response, next: NextFunction) => {
    const cert = (req as any).clientCert;

    if (!cert) {
      return res.status(401).json({
        error: {
          code: "NO_CLIENT_CERT",
          message: "Client certificate required",
        },
      });
    }

    const result = validator.validate(cert);

    if (!result.valid) {
      return res.status(403).json({
        error: { code: "INVALID_CERT", message: result.reason },
      });
    }

    next();
  };
}
```

## クライアント実装

### Node.js HTTPSクライアント

```typescript
import https from "https";
import fs from "fs";

class MTLSClient {
  private readonly agent: https.Agent;

  constructor(config: {
    cert: string;
    key: string;
    ca: string;
    passphrase?: string;
  }) {
    this.agent = new https.Agent({
      cert: fs.readFileSync(config.cert),
      key: fs.readFileSync(config.key),
      ca: fs.readFileSync(config.ca),
      passphrase: config.passphrase,
      rejectUnauthorized: true,
    });
  }

  async request(url: string, options: RequestInit = {}): Promise<Response> {
    return fetch(url, {
      ...options,
      // @ts-ignore - Node.js specific
      agent: this.agent,
    });
  }
}

// 使用例
const client = new MTLSClient({
  cert: "./client.crt",
  key: "./client.key",
  ca: "./ca.crt",
});

const response = await client.request("https://api.example.com/secure");
```

### axiosでの使用

```typescript
import axios from "axios";
import https from "https";
import fs from "fs";

const httpsAgent = new https.Agent({
  cert: fs.readFileSync("client.crt"),
  key: fs.readFileSync("client.key"),
  ca: fs.readFileSync("ca.crt"),
  rejectUnauthorized: true,
});

const client = axios.create({
  httpsAgent,
  baseURL: "https://api.example.com",
});

const response = await client.get("/secure");
```

## 証明書ローテーション

### 自動ローテーション

```typescript
class CertificateRotator {
  private readonly renewalThresholdDays = 30;

  async checkAndRotate(certPath: string): Promise<void> {
    const cert = this.loadCertificate(certPath);
    const daysUntilExpiry = this.getDaysUntilExpiry(cert);

    if (daysUntilExpiry <= this.renewalThresholdDays) {
      console.log(
        `Certificate expires in ${daysUntilExpiry} days, rotating...`,
      );
      await this.rotateCertificate(certPath);
    }
  }

  private getDaysUntilExpiry(cert: forge.pki.Certificate): number {
    const expiryDate = cert.validity.notAfter;
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private async rotateCertificate(certPath: string): Promise<void> {
    // 1. 新しいCSRを生成
    // 2. CAに送信して署名を取得
    // 3. 新しい証明書を保存
    // 4. サービスをリロード（graceful）
  }
}

// 定期実行
setInterval(
  () => {
    rotator.checkAndRotate("./client.crt").catch(console.error);
  },
  24 * 60 * 60 * 1000,
); // 毎日チェック
```

## 証明書失効

### CRL（Certificate Revocation List）

```typescript
import forge from "node-forge";

class CRLChecker {
  private crl: forge.pki.CertificateRevocationList | null = null;

  async loadCRL(crlUrl: string): Promise<void> {
    const response = await fetch(crlUrl);
    const crlData = await response.arrayBuffer();
    this.crl = forge.pki.certificationRequestFromPem(
      Buffer.from(crlData).toString(),
    );
  }

  isRevoked(cert: forge.pki.Certificate): boolean {
    if (!this.crl) return false;

    // CRLでシリアル番号をチェック
    // 実装はCRLの形式に依存
    return false;
  }
}
```

### OCSP（Online Certificate Status Protocol）

```typescript
class OCSPChecker {
  async checkStatus(
    cert: forge.pki.Certificate,
  ): Promise<"good" | "revoked" | "unknown"> {
    // OCSP応答者にリクエスト
    // 実装はOCSPプロトコルに従う
    return "good";
  }
}
```

## チェックリスト

### 設計時

- [ ] 証明書階層を設計したか？
- [ ] 有効期限ポリシーを決定したか？
- [ ] 失効戦略を選択したか（CRL/OCSP）？

### 実装時

- [ ] 秘密鍵を安全に保存しているか？
- [ ] 証明書チェーンを正しく設定したか？
- [ ] エラーハンドリングが適切か？

### 運用時

- [ ] 証明書有効期限のモニタリングがあるか？
- [ ] ローテーション手順が確立されているか？
- [ ] 失効時の対応手順があるか？

## アンチパターン

### ❌ 自己署名証明書を本番で使用

```typescript
// NG: 自己署名を信頼
rejectUnauthorized: false;

// OK: 適切なCA証明書を使用
ca: fs.readFileSync("production-ca.crt");
```

### ❌ 秘密鍵の不適切な保護

```bash
# NG: 誰でも読める
chmod 644 server.key

# OK: 所有者のみ読める
chmod 400 server.key
```

## 参考

- **RFC 8446**: TLS 1.3
- **RFC 5280**: X.509 PKI Certificate and CRL Profile
- **NIST SP 800-52**: Guidelines for TLS Implementations
