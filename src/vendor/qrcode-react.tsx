import React, { useMemo } from 'react';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QRCodeSVGProps {
  value: string;
  size?: number;
  level?: ErrorCorrectionLevel;
  includeMargin?: boolean;
  marginSize?: number;
  bgColor?: string;
  fgColor?: string;
  className?: string;
  title?: string;
}

interface VersionBlockSpec {
  ecPerBlock: number;
  g1Blocks: number;
  g1Data: number;
  g2Blocks: number;
  g2Data: number;
}

const TOTAL_CODEWORDS: Record<number, number> = {
  1: 26,
  2: 44,
  3: 70,
  4: 100,
  5: 134,
  6: 172,
  7: 196,
  8: 242,
  9: 292,
  10: 346,
};

const REMAINDER_BITS: Record<number, number> = {
  1: 0,
  2: 7,
  3: 7,
  4: 7,
  5: 7,
  6: 7,
  7: 0,
  8: 0,
  9: 0,
  10: 0,
};

const ALIGNMENT_CENTERS: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
};

const EC_TABLE: Record<ErrorCorrectionLevel, Record<number, VersionBlockSpec>> = {
  L: {
    1: { ecPerBlock: 7, g1Blocks: 1, g1Data: 19, g2Blocks: 0, g2Data: 0 },
    2: { ecPerBlock: 10, g1Blocks: 1, g1Data: 34, g2Blocks: 0, g2Data: 0 },
    3: { ecPerBlock: 15, g1Blocks: 1, g1Data: 55, g2Blocks: 0, g2Data: 0 },
    4: { ecPerBlock: 20, g1Blocks: 1, g1Data: 80, g2Blocks: 0, g2Data: 0 },
    5: { ecPerBlock: 26, g1Blocks: 1, g1Data: 108, g2Blocks: 0, g2Data: 0 },
    6: { ecPerBlock: 18, g1Blocks: 2, g1Data: 68, g2Blocks: 0, g2Data: 0 },
    7: { ecPerBlock: 20, g1Blocks: 2, g1Data: 78, g2Blocks: 0, g2Data: 0 },
    8: { ecPerBlock: 24, g1Blocks: 2, g1Data: 97, g2Blocks: 0, g2Data: 0 },
    9: { ecPerBlock: 30, g1Blocks: 2, g1Data: 116, g2Blocks: 0, g2Data: 0 },
    10: { ecPerBlock: 18, g1Blocks: 2, g1Data: 68, g2Blocks: 2, g2Data: 69 },
  },
  M: {
    1: { ecPerBlock: 10, g1Blocks: 1, g1Data: 16, g2Blocks: 0, g2Data: 0 },
    2: { ecPerBlock: 16, g1Blocks: 1, g1Data: 28, g2Blocks: 0, g2Data: 0 },
    3: { ecPerBlock: 26, g1Blocks: 1, g1Data: 44, g2Blocks: 0, g2Data: 0 },
    4: { ecPerBlock: 18, g1Blocks: 2, g1Data: 32, g2Blocks: 0, g2Data: 0 },
    5: { ecPerBlock: 24, g1Blocks: 2, g1Data: 43, g2Blocks: 0, g2Data: 0 },
    6: { ecPerBlock: 16, g1Blocks: 4, g1Data: 27, g2Blocks: 0, g2Data: 0 },
    7: { ecPerBlock: 18, g1Blocks: 4, g1Data: 31, g2Blocks: 0, g2Data: 0 },
    8: { ecPerBlock: 22, g1Blocks: 2, g1Data: 38, g2Blocks: 2, g2Data: 39 },
    9: { ecPerBlock: 22, g1Blocks: 3, g1Data: 36, g2Blocks: 2, g2Data: 37 },
    10: { ecPerBlock: 26, g1Blocks: 4, g1Data: 43, g2Blocks: 1, g2Data: 44 },
  },
  Q: {
    1: { ecPerBlock: 13, g1Blocks: 1, g1Data: 13, g2Blocks: 0, g2Data: 0 },
    2: { ecPerBlock: 22, g1Blocks: 1, g1Data: 22, g2Blocks: 0, g2Data: 0 },
    3: { ecPerBlock: 18, g1Blocks: 2, g1Data: 17, g2Blocks: 0, g2Data: 0 },
    4: { ecPerBlock: 26, g1Blocks: 2, g1Data: 24, g2Blocks: 0, g2Data: 0 },
    5: { ecPerBlock: 18, g1Blocks: 2, g1Data: 15, g2Blocks: 2, g2Data: 16 },
    6: { ecPerBlock: 24, g1Blocks: 4, g1Data: 19, g2Blocks: 0, g2Data: 0 },
    7: { ecPerBlock: 18, g1Blocks: 2, g1Data: 14, g2Blocks: 4, g2Data: 15 },
    8: { ecPerBlock: 22, g1Blocks: 4, g1Data: 18, g2Blocks: 2, g2Data: 19 },
    9: { ecPerBlock: 20, g1Blocks: 4, g1Data: 16, g2Blocks: 4, g2Data: 17 },
    10: { ecPerBlock: 24, g1Blocks: 6, g1Data: 19, g2Blocks: 2, g2Data: 20 },
  },
  H: {
    1: { ecPerBlock: 17, g1Blocks: 1, g1Data: 9, g2Blocks: 0, g2Data: 0 },
    2: { ecPerBlock: 28, g1Blocks: 1, g1Data: 16, g2Blocks: 0, g2Data: 0 },
    3: { ecPerBlock: 22, g1Blocks: 2, g1Data: 13, g2Blocks: 0, g2Data: 0 },
    4: { ecPerBlock: 16, g1Blocks: 4, g1Data: 9, g2Blocks: 0, g2Data: 0 },
    5: { ecPerBlock: 22, g1Blocks: 2, g1Data: 11, g2Blocks: 2, g2Data: 12 },
    6: { ecPerBlock: 28, g1Blocks: 4, g1Data: 15, g2Blocks: 0, g2Data: 0 },
    7: { ecPerBlock: 26, g1Blocks: 4, g1Data: 13, g2Blocks: 1, g2Data: 14 },
    8: { ecPerBlock: 26, g1Blocks: 4, g1Data: 14, g2Blocks: 2, g2Data: 15 },
    9: { ecPerBlock: 24, g1Blocks: 4, g1Data: 12, g2Blocks: 4, g2Data: 13 },
    10: { ecPerBlock: 28, g1Blocks: 6, g1Data: 15, g2Blocks: 2, g2Data: 16 },
  },
};

const EC_LEVEL_BITS: Record<ErrorCorrectionLevel, number> = {
  M: 0,
  L: 1,
  H: 2,
  Q: 3,
};

// GF(256) log/exp tables with primitive polynomial 0x11d
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d;
    }
  }
  for (let i = 255; i < 512; i += 1) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function getRsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i += 1) {
    const next = new Uint8Array(poly.length + 1);
    const factor = GF_EXP[i];
    for (let j = 0; j < poly.length; j += 1) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], factor);
    }
    poly = next;
  }
  return poly;
}

function computeRsRemainder(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = getRsGeneratorPoly(ecCount);
  const work = new Uint8Array(data.length + ecCount);
  work.set(data, 0);
  for (let i = 0; i < data.length; i += 1) {
    const coef = work[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j += 1) {
        work[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return work.slice(data.length);
}

function encodeUtf8Bytes(text: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text);
  }
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    bytes.push(text.charCodeAt(i) & 0xff);
  }
  return new Uint8Array(bytes);
}

function chooseVersion(byteLen: number, level: ErrorCorrectionLevel): number {
  for (let v = 1; v <= 10; v += 1) {
    const spec = EC_TABLE[level][v];
    const dataBytes = spec.g1Blocks * spec.g1Data + spec.g2Blocks * spec.g2Data;
    const countBits = v <= 9 ? 8 : 16;
    const totalBitsNeeded = 4 + countBits + byteLen * 8;
    if (totalBitsNeeded <= dataBytes * 8) {
      return v;
    }
  }
  return 10;
}

function buildFinalBitStream(
  rawBytes: Uint8Array,
  version: number,
  level: ErrorCorrectionLevel
): number[] {
  const spec = EC_TABLE[level][version];
  const totalDataBytes = spec.g1Blocks * spec.g1Data + spec.g2Blocks * spec.g2Data;
  const countBits = version <= 9 ? 8 : 16;
  const maxPayloadBytes = Math.floor((totalDataBytes * 8 - 4 - countBits) / 8);
  const payload = rawBytes.slice(0, Math.max(0, maxPayloadBytes));

  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i -= 1) {
      bits.push((val >>> i) & 1);
    }
  };

  // Byte mode indicator (0100) + character count + bytes
  pushBits(0b0100, 4);
  pushBits(payload.length, countBits);
  for (let i = 0; i < payload.length; i += 1) {
    pushBits(payload[i], 8);
  }

  // Terminator up to 4 zero bits
  const maxBits = totalDataBytes * 8;
  const termLen = Math.min(4, maxBits - bits.length);
  for (let i = 0; i < termLen; i += 1) bits.push(0);

  // Byte alignment padding
  while (bits.length % 8 !== 0) bits.push(0);

  // Pad codewords 0xEC, 0x11
  const dataCodewords = new Uint8Array(totalDataBytes);
  for (let i = 0; i < bits.length / 8; i += 1) {
    let byteVal = 0;
    for (let b = 0; b < 8; b += 1) {
      byteVal = (byteVal << 1) | bits[i * 8 + b];
    }
    dataCodewords[i] = byteVal;
  }
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  for (let i = bits.length / 8; i < totalDataBytes; i += 1) {
    dataCodewords[i] = padBytes[padIdx % 2];
    padIdx += 1;
  }

  // Split into blocks and compute RS error correction
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  let offset = 0;
  for (let i = 0; i < spec.g1Blocks; i += 1) {
    const blk = dataCodewords.slice(offset, offset + spec.g1Data);
    dataBlocks.push(blk);
    ecBlocks.push(computeRsRemainder(blk, spec.ecPerBlock));
    offset += spec.g1Data;
  }
  for (let i = 0; i < spec.g2Blocks; i += 1) {
    const blk = dataCodewords.slice(offset, offset + spec.g2Data);
    dataBlocks.push(blk);
    ecBlocks.push(computeRsRemainder(blk, spec.ecPerBlock));
    offset += spec.g2Data;
  }

  // Interleave data codewords, then EC codewords
  const finalCodewords: number[] = [];
  const maxDataLen = Math.max(spec.g1Data, spec.g2Data);
  for (let col = 0; col < maxDataLen; col += 1) {
    for (let b = 0; b < dataBlocks.length; b += 1) {
      if (col < dataBlocks[b].length) {
        finalCodewords.push(dataBlocks[b][col]);
      }
    }
  }
  for (let col = 0; col < spec.ecPerBlock; col += 1) {
    for (let b = 0; b < ecBlocks.length; b += 1) {
      finalCodewords.push(ecBlocks[b][col]);
    }
  }

  const outBits: number[] = [];
  for (const cw of finalCodewords) {
    for (let b = 7; b >= 0; b -= 1) {
      outBits.push((cw >>> b) & 1);
    }
  }
  const rem = REMAINDER_BITS[version] ?? 0;
  for (let i = 0; i < rem; i += 1) {
    outBits.push(0);
  }
  return outBits;
}

function computeFormatBits(level: ErrorCorrectionLevel, mask: number): number {
  const data = (EC_LEVEL_BITS[level] << 3) | mask;
  let rem = data << 10;
  const poly = 0x537;
  for (let i = 14; i >= 10; i -= 1) {
    if ((rem >>> i) & 1) {
      rem ^= poly << (i - 10);
    }
  }
  return ((data << 10) | rem) ^ 0x5412;
}

function computeVersionBits(version: number): number {
  let rem = version << 12;
  const poly = 0x1f25;
  for (let i = 17; i >= 12; i -= 1) {
    if ((rem >>> i) & 1) {
      rem ^= poly << (i - 12);
    }
  }
  return (version << 12) | rem;
}

function evaluateMaskPenalty(grid: boolean[][]): number {
  const n = grid.length;
  let penalty = 0;

  // Rule 1: 5+ consecutive same-color modules in row or col
  for (let r = 0; r < n; r += 1) {
    let runRow = 1;
    let runCol = 1;
    for (let c = 1; c < n; c += 1) {
      if (grid[r][c] === grid[r][c - 1]) {
        runRow += 1;
      } else {
        if (runRow >= 5) penalty += 3 + (runRow - 5);
        runRow = 1;
      }
      if (grid[c][r] === grid[c - 1][r]) {
        runCol += 1;
      } else {
        if (runCol >= 5) penalty += 3 + (runCol - 5);
        runCol = 1;
      }
    }
    if (runRow >= 5) penalty += 3 + (runRow - 5);
    if (runCol >= 5) penalty += 3 + (runCol - 5);
  }

  // Rule 2: 2x2 blocks of same color
  for (let r = 0; r < n - 1; r += 1) {
    for (let c = 0; c < n - 1; c += 1) {
      const v = grid[r][c];
      if (grid[r][c + 1] === v && grid[r + 1][c] === v && grid[r + 1][c + 1] === v) {
        penalty += 3;
      }
    }
  }

  // Rule 3: Finder-like 1:1:3:1:1 patterns
  const matchPattern = (arr: boolean[], start: number): boolean => {
    const p1 = [true, false, true, true, true, false, true, false, false, false, false];
    const p2 = [false, false, false, false, true, false, true, true, true, false, true];
    let m1 = true;
    let m2 = true;
    for (let k = 0; k < 11; k += 1) {
      if (arr[start + k] !== p1[k]) m1 = false;
      if (arr[start + k] !== p2[k]) m2 = false;
    }
    return m1 || m2;
  };
  for (let r = 0; r < n; r += 1) {
    const colArr = Array.from({ length: n }, (_, idx) => grid[idx][r]);
    for (let c = 0; c <= n - 11; c += 1) {
      if (matchPattern(grid[r], c)) penalty += 40;
      if (matchPattern(colArr, c)) penalty += 40;
    }
  }

  // Rule 4: Balance of dark vs light modules
  let dark = 0;
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (grid[r][c]) dark += 1;
    }
  }
  const pct = (dark * 100) / (n * n);
  const prev5 = Math.floor(pct / 5) * 5;
  const next5 = prev5 + 5;
  penalty += Math.min(Math.abs(prev5 - 50) / 5, Math.abs(next5 - 50) / 5) * 10;

  return penalty;
}

function generateQrMatrix(value: string, level: ErrorCorrectionLevel): boolean[][] {
  const bytes = encodeUtf8Bytes(value || ' ');
  const version = chooseVersion(bytes.length, level);
  const size = 17 + 4 * version;
  const bitStream = buildFinalBitStream(bytes, version, level);

  const isFunc = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const base = Array.from({ length: size }, () => Array<boolean>(size).fill(false));

  const setFunc = (r: number, c: number, dark: boolean) => {
    if (r < 0 || c < 0 || r >= size || c >= size) return;
    isFunc[r][c] = true;
    base[r][c] = dark;
  };

  // Finder patterns + separators
  const drawFinder = (top: number, left: number) => {
    for (let dr = -1; dr <= 7; dr += 1) {
      for (let dc = -1; dc <= 7; dc += 1) {
        const rr = top + dr;
        const cc = left + dc;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        const inBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        const inSeparator = dr === -1 || dr === 7 || dc === -1 || dc === 7;
        setFunc(rr, cc, !inSeparator && (inBorder || inCenter));
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Alignment patterns (placed before timing patterns so timing row/col 6 doesn't hide v7+ edge centers)
  const centers = ALIGNMENT_CENTERS[version] ?? [];
  for (const cr of centers) {
    for (const cc of centers) {
      if (isFunc[cr][cc]) continue;
      for (let dr = -2; dr <= 2; dr += 1) {
        for (let dc = -2; dc <= 2; dc += 1) {
          const dist = Math.max(Math.abs(dr), Math.abs(dc));
          setFunc(cr + dr, cc + dc, dist === 0 || dist === 2);
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i += 1) {
    const dark = i % 2 === 0;
    if (!isFunc[6][i]) setFunc(6, i, dark);
    if (!isFunc[i][6]) setFunc(i, 6, dark);
  }

  // Dark module
  setFunc(4 * version + 9, 8, true);

  // Reserve format info cells
  for (let i = 0; i <= 8; i += 1) {
    if (i !== 6) {
      isFunc[8][i] = true;
      isFunc[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i += 1) {
    isFunc[8][size - 1 - i] = true;
    if (i < 7) {
      isFunc[size - 1 - i][8] = true;
    }
  }

  // Version info for v >= 7
  if (version >= 7) {
    const vBits = computeVersionBits(version);
    for (let i = 0; i < 18; i += 1) {
      const bit = ((vBits >>> i) & 1) === 1;
      const a = Math.floor(i / 3);
      const b = (i % 3) + size - 11;
      setFunc(a, b, bit);
      setFunc(b, a, bit);
    }
  }

  const maskFn = (mask: number, r: number, c: number): boolean => {
    switch (mask) {
      case 0:
        return (r + c) % 2 === 0;
      case 1:
        return r % 2 === 0;
      case 2:
        return c % 3 === 0;
      case 3:
        return (r + c) % 3 === 0;
      case 4:
        return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5:
        return ((r * c) % 2) + ((r * c) % 3) === 0;
      case 6:
        return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
      default:
        return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
    }
  };

  let bestGrid = base;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let mask = 0; mask < 8; mask += 1) {
    const grid = base.map((row) => [...row]);

    // Place data bits in zigzag column pairs
    let bitIdx = 0;
    let upward = true;
    for (let rightCol = size - 1; rightCol >= 1; rightCol -= 2) {
      if (rightCol === 6) rightCol -= 1;
      for (let step = 0; step < size; step += 1) {
        const r = upward ? size - 1 - step : step;
        for (let offset = 0; offset < 2; offset += 1) {
          const c = rightCol - offset;
          if (!isFunc[r][c]) {
            const bit = bitIdx < bitStream.length ? bitStream[bitIdx] === 1 : false;
            bitIdx += 1;
            grid[r][c] = bit !== maskFn(mask, r, c);
          }
        }
      }
      upward = !upward;
    }

    // Write format info (ISO/IEC 18004: i=0 is LSB, i=14 is MSB)
    const fmt = computeFormatBits(level, mask);
    for (let i = 0; i < 15; i += 1) {
      const bit = ((fmt >>> i) & 1) === 1;
      if (i < 6) grid[i][8] = bit;
      else if (i < 8) grid[i + 1][8] = bit;
      else if (i === 8) grid[8][7] = bit;
      else grid[8][14 - i] = bit;

      if (i < 8) grid[8][size - 1 - i] = bit;
      else grid[size - 15 + i][8] = bit;
    }

    const score = evaluateMaskPenalty(grid);
    if (score < bestScore) {
      bestScore = score;
      bestGrid = grid;
    }
  }

  return bestGrid;
}

export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({
  value,
  size = 128,
  level = 'M',
  includeMargin = false,
  marginSize,
  bgColor = '#ffffff',
  fgColor = '#000000',
  className,
  title,
}) => {
  const { viewBoxSize, pathData } = useMemo(() => {
    const matrix = generateQrMatrix(value, level);
    const margin = marginSize ?? (includeMargin ? 4 : 0);
    const total = matrix.length + margin * 2;
    const parts: string[] = [];
    for (let r = 0; r < matrix.length; r += 1) {
      for (let c = 0; c < matrix.length; c += 1) {
        if (matrix[r][c]) {
          parts.push(`M${c + margin},${r + margin}h1v1h-1z`);
        }
      }
    }
    return { viewBoxSize: total, pathData: parts.join('') };
  }, [value, level, includeMargin, marginSize]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      className={className}
      role="img"
      aria-label={title ?? 'QR Code'}
      shapeRendering="crispEdges"
    >
      {title ? <title>{title}</title> : null}
      <rect width={viewBoxSize} height={viewBoxSize} fill={bgColor} />
      <path d={pathData} fill={fgColor} />
    </svg>
  );
};

export default QRCodeSVG;
