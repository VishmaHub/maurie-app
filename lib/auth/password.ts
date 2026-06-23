import { randomBytes, scrypt, scryptSync, timingSafeEqual } from "node:crypto";

interface ParsedScryptHash {
  readonly cost: number;
  readonly blockSize: number;
  readonly parallelization: number;
  readonly salt: Buffer;
  readonly hash: Buffer;
}

interface ScryptHashOptions {
  readonly cost: number;
  readonly blockSize: number;
  readonly parallelization: number;
  readonly keyLength: number;
  readonly saltLength: number;
  readonly maxMemoryBytes: number;
}

const SCRYPT_HASH_OPTIONS: ScryptHashOptions = {
  cost: 131072,
  blockSize: 8,
  parallelization: 1,
  keyLength: 64,
  saltLength: 32,
  maxMemoryBytes: 256 * 1024 * 1024
};

function derivePasswordKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject): void => {
    scrypt(
      password,
      salt,
      SCRYPT_HASH_OPTIONS.keyLength,
      {
        N: SCRYPT_HASH_OPTIONS.cost,
        r: SCRYPT_HASH_OPTIONS.blockSize,
        p: SCRYPT_HASH_OPTIONS.parallelization,
        maxmem: SCRYPT_HASH_OPTIONS.maxMemoryBytes
      },
      (error: Error | null, derivedKey: Buffer): void => {
        if (error !== null) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      }
    );
  });
}

/** Creates a hash compatible with verifyPassword. Passwords are never normalised or trimmed. */
export async function hashPassword(password: string): Promise<string> {
  const salt: Buffer = randomBytes(SCRYPT_HASH_OPTIONS.saltLength);
  const derivedKey: Buffer = await derivePasswordKey(password, salt);
  const encodedSalt: string = salt.toString("base64url");
  const encodedHash: string = derivedKey.toString("base64url");

  return `scrypt$N=${SCRYPT_HASH_OPTIONS.cost},r=${SCRYPT_HASH_OPTIONS.blockSize},p=${SCRYPT_HASH_OPTIONS.parallelization}$${encodedSalt}$${encodedHash}`;
}

function parseScryptPasswordHash(passwordHash: string): ParsedScryptHash {
  const parts: string[] = passwordHash.split("$");

  if (parts.length !== 4) {
    throw new Error("Invalid password hash format.");
  }

  const algorithm: string | undefined = parts[0];
  const parameters: string | undefined = parts[1];
  const encodedSalt: string | undefined = parts[2];
  const encodedHash: string | undefined = parts[3];

  if (
    algorithm !== "scrypt" ||
    typeof parameters !== "string" ||
    typeof encodedSalt !== "string" ||
    typeof encodedHash !== "string"
  ) {
    throw new Error("Invalid password hash format.");
  }

  const parameterMap: Map<string, number> = new Map(
    parameters.split(",").map((parameter: string): [string, number] => {
      const [key, rawValue] = parameter.split("=");

      if (typeof key !== "string" || typeof rawValue !== "string") {
        throw new Error("Invalid password hash parameters.");
      }

      const value: number = Number.parseInt(rawValue, 10);

      if (Number.isInteger(value) === false || value <= 0) {
        throw new Error("Invalid password hash parameter value.");
      }

      return [key, value];
    })
  );

  const cost: number | undefined = parameterMap.get("N");
  const blockSize: number | undefined = parameterMap.get("r");
  const parallelization: number | undefined = parameterMap.get("p");

  if (
    typeof cost !== "number" ||
    typeof blockSize !== "number" ||
    typeof parallelization !== "number"
  ) {
    throw new Error("Missing password hash parameters.");
  }

  return {
    cost,
    blockSize,
    parallelization,
    salt: Buffer.from(encodedSalt, "base64url"),
    hash: Buffer.from(encodedHash, "base64url")
  };
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  try {
    const parsedHash: ParsedScryptHash = parseScryptPasswordHash(passwordHash);

    const derivedKey: Buffer = scryptSync(password, parsedHash.salt, parsedHash.hash.length, {
      N: parsedHash.cost,
      r: parsedHash.blockSize,
      p: parsedHash.parallelization,
      maxmem: 256 * 1024 * 1024
    });

    if (derivedKey.length !== parsedHash.hash.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, parsedHash.hash);
  } catch {
    return false;
  }
}
