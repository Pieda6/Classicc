import { prisma } from "./db";

export const DEFAULT_SETTINGS = {
  freeDeliveryThreshold: "15000000", // minor units; 0 disables free delivery
};

export type SettingKey = keyof typeof DEFAULT_SETTINGS;

export async function getSetting(key: SettingKey) {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? DEFAULT_SETTINGS[key];
}

export async function getFreeDeliveryThreshold() {
  const n = Number(await getSetting("freeDeliveryThreshold"));
  return Number.isFinite(n) ? n : 0;
}

export async function setSetting(key: SettingKey, value: string) {
  await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
}
