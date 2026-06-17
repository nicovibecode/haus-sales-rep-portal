// BSD Haus LTL freight zones — sourced from Shopify shipping rules (Incremental Rate Template)
export interface ShippingZone {
  zone: number;
  label: string;
  baseRate: number;
  perLbRate: number;
}

export const LTL_ZONES: ShippingZone[] = [
  { zone: 1, label: "Zone 1 — California",                  baseRate: 243.62, perLbRate: 0.04    },
  { zone: 2, label: "Zone 2 — Arizona / Nevada",            baseRate: 289.91, perLbRate: 0.0193  },
  { zone: 3, label: "Zone 3 — Texas / Oklahoma",            baseRate: 435.56, perLbRate: 0.0145  },
  { zone: 4, label: "Zone 4 — ID / LA / NM / ND / WI / DC",baseRate: 416.14, perLbRate: 0.1529  },
  { zone: 5, label: "Zone 5 — AL / CO / OR / WA / OH / KY+",baseRate: 499.83, perLbRate: 0.0541  },
  { zone: 6, label: "Zone 6 — FL / GA / IL / NC / PA / MA+",baseRate: 517.92, perLbRate: 0.06222 },
  { zone: 7, label: "Zone 7 — Maine / New York",            baseRate: 556.22, perLbRate: 0.169   },
];

// 3-digit zip prefix overrides — these override the state-level zone assignment
const PREFIX_ZONE_OVERRIDES: Record<string, number> = {
  "146": 6, // NY (upstate) → Zone 6
  "303": 5, // GA (Atlanta)  → Zone 5
  "374": 5, // TN            → Zone 5
  "606": 5, // IL (Chicago)  → Zone 5
  "701": 5, // LA            → Zone 5
  "733": 5, // OK/TX border  → Zone 5
  "786": 5, // TX            → Zone 5
  "787": 5, // TX            → Zone 5
  "802": 4, // CO (Denver)   → Zone 4
  "820": 6, // WY            → Zone 6
  "875": 5, // NM            → Zone 5
};

// State abbreviation → zone number
const STATE_ZONE: Record<string, number> = {
  CA: 1,
  AZ: 2, NV: 2,
  TX: 3, OK: 3,
  ID: 4, LA: 4, NM: 4, ND: 4, WI: 4, DC: 4,
  AL: 5, AR: 5, CO: 5, DE: 5, IN: 5, IA: 5, KS: 5, KY: 5,
  MN: 5, MS: 5, MO: 5, MT: 5, NE: 5, OH: 5, OR: 5, RI: 5,
  SD: 5, UT: 5, WA: 5, WV: 5, WY: 5,
  CT: 6, FL: 6, GA: 6, IL: 6, MD: 6, MA: 6, MI: 6, NH: 6,
  NJ: 6, NC: 6, PA: 6, SC: 6, TN: 6, VT: 6, VA: 6,
  ME: 7, NY: 7,
};

// 3-digit zip prefix → US state abbreviation
function prefixToState(p: number): string | null {
  if (p <= 9)   return null;         // 000-009: PR/VI/military
  if (p <= 27)  return "MA";
  if (p <= 29)  return "RI";
  if (p <= 38)  return "NH";
  if (p <= 49)  return "ME";
  if (p <= 59)  return "VT";
  if (p <= 69)  return "CT";
  if (p <= 89)  return "NJ";
  if (p <= 99)  return null;         // APO/FPO
  if (p <= 149) return "NY";
  if (p <= 196) return "PA";
  if (p <= 199) return "DE";
  if (p <= 205) return "DC";
  if (p <= 219) return "MD";
  if (p <= 246) return "VA";
  if (p <= 268) return "WV";
  if (p <= 289) return "NC";
  if (p <= 299) return "SC";
  if (p <= 319) return "GA";
  if (p <= 349) return "FL";
  if (p <= 369) return "AL";
  if (p <= 385) return "TN";
  if (p <= 399) return "MS";
  if (p <= 427) return "KY";
  if (p <= 429) return null;
  if (p <= 458) return "OH";
  if (p <= 479) return "IN";
  if (p <= 499) return "MI";
  if (p <= 528) return "IA";
  if (p <= 549) return "WI";
  if (p <= 567) return "MN";
  if (p <= 577) return "SD";
  if (p <= 588) return "ND";
  if (p <= 599) return "MT";
  if (p <= 629) return "IL";
  if (p <= 658) return "MO";
  if (p <= 679) return "KS";
  if (p <= 693) return "NE";
  if (p <= 714) return "LA";
  if (p === 715) return null;
  if (p <= 729) return "AR";
  if (p <= 749) return "OK";
  if (p <= 799) return "TX";
  if (p <= 816) return "CO";
  if (p <= 819) return null;
  if (p <= 831) return "WY";
  if (p <= 838) return "ID";
  if (p <= 847) return "UT";
  if (p <= 865) return "AZ";
  if (p <= 869) return null;
  if (p <= 884) return "NM";
  if (p <= 888) return null;
  if (p <= 898) return "NV";
  if (p <= 961) return "CA";
  if (p <= 966) return "HI"; // not served
  if (p <= 968) return "HI";
  if (p <= 979) return "OR";
  if (p <= 994) return "WA";
  return "AK"; // 995-999 — not served
}

export function getZoneFromZip(zip: string): ShippingZone | null {
  const clean = zip.replace(/\D/g, "");
  if (clean.length < 3) return null;
  const prefix = clean.substring(0, 3);

  // Prefix overrides take priority
  if (PREFIX_ZONE_OVERRIDES[prefix] !== undefined) {
    return LTL_ZONES.find((z) => z.zone === PREFIX_ZONE_OVERRIDES[prefix]) ?? null;
  }

  const state = prefixToState(parseInt(prefix, 10));
  if (!state) return null;

  const zoneNum = STATE_ZONE[state];
  if (!zoneNum) return null;

  return LTL_ZONES.find((z) => z.zone === zoneNum) ?? null;
}

export function calcLTLShipping(zone: ShippingZone, totalWeightLbs: number): number {
  return zone.baseRate + totalWeightLbs * zone.perLbRate;
}
