import { scryptSync, timingSafeEqual } from "node:crypto";

interface ParsedScryptHash {
  readonly cost: number;
  readonly blockSize: number;
  readonly parallelization: number;
  readonly salt: Buffer;
  readonly hash: Buffer;
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
