import repsData from "@/seeds/reps.json";

interface Rep {
  id: string;
  name: string;
  email: string;
  plain_password: string;
  tier: string;
  region: string;
  phone: string;
  status: string;
}

const reps = repsData as Rep[];

export function authenticateRep(
  email: string,
  password: string
): Rep | null {
  const rep = reps.find(
    (r) =>
      r.email.toLowerCase() === email.toLowerCase() &&
      r.plain_password === password &&
      r.status === "Active"
  );
  return rep ?? null;
}
