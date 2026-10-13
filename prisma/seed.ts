import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Outerwear", slug: "outerwear", description: "Coats and jackets built to last for seasons." },
  { name: "Sweatshirts", slug: "sweatshirts", description: "Brushed fleece hoodies and crewnecks." },
  { name: "T-Shirts", slug: "t-shirts", description: "Heavyweight cotton tees with a relaxed cut." },
  { name: "Shirts", slug: "shirts", description: "Crisp oxford and poplin shirts." },
  { name: "Knitwear", slug: "knitwear", description: "Soft knits for layering." },
  { name: "Trousers", slug: "trousers", description: "Tailored and wide-leg trousers." },
  { name: "Dresses", slug: "dresses", description: "Easy, elegant dresses." },
  { name: "Shoes", slug: "shoes", description: "Clean, minimal footwear." },
  { name: "Accessories", slug: "accessories", description: "Caps, bags and finishing touches." },
];

const ADULT = ["XS", "S", "M", "L", "XL", "XXL"];
const SHOES = ["40", "41", "42", "43", "44", "45"];

type Seed = {
  slug: string;
  name: string;
  category: string;
  gender: "MEN" | "WOMEN" | "UNISEX";
  price: number; // naira
  compareAt?: number;
  featured?: boolean;
  description: string;
  details: string[];
  sizes: string[];
  colors: [key: string, label: string, hex: string][];
};

const products: Seed[] = [
  {
    slug: "classic-fleece-pullover-hoodie",
    name: "Classic Fleece Pullover Hoodie",
    category: "sweatshirts",
    gender: "MEN",
    price: 48500,
    featured: true,
    description:
      "Celebrate the power of simplicity. This warm, brushed fleece hoodie is made with extra room through the shoulders, chest and body for easy comfort and a laid-back, nostalgic style.",
    details: ["80% cotton, 20% recycled polyester fleece", "Kangaroo pocket", "Ribbed cuffs and hem", "Relaxed fit — take your usual size"],
    sizes: ADULT,
    colors: [["sage", "Sage", "#B7BDAA"], ["black", "Black", "#1E1E1E"]],
  },
  {
    slug: "heavyweight-boxy-tee",
    name: "Heavyweight Boxy Tee",
    category: "t-shirts",
    gender: "UNISEX",
    price: 18000,
    featured: true,
    description: "A 240gsm cotton jersey tee with a boxy, slightly cropped silhouette and a tight ribbed collar that holds its shape wash after wash.",
    details: ["100% combed cotton, 240gsm", "Boxy fit with dropped shoulders", "Pre-shrunk"],
    sizes: ADULT,
    colors: [["black", "Black", "#1C1C1C"], ["white", "White", "#F2F0EA"]],
  },
  {
    slug: "essential-crewneck-sweatshirt",
    name: "Essential Crewneck Sweatshirt",
    category: "sweatshirts",
    gender: "MEN",
    price: 38000,
    description: "Our everyday crewneck in a soft loopback cotton. A clean, timeless layer that pairs with everything in your wardrobe.",
    details: ["100% cotton loopback", "V-insert at neck", "Regular fit"],
    sizes: ADULT,
    colors: [["oat", "Oat", "#E3DACA"], ["charcoal", "Charcoal", "#3A3A3A"]],
  },
  {
    slug: "oxford-button-down-shirt",
    name: "Oxford Button-Down Shirt",
    category: "shirts",
    gender: "MEN",
    price: 32000,
    description: "A wardrobe cornerstone. Woven from a breathable oxford cotton with a soft-roll button-down collar and a single chest pocket.",
    details: ["100% cotton oxford", "Button-down collar", "Curved hem — wear tucked or untucked"],
    sizes: ADULT,
    colors: [["sky", "Sky Blue", "#C6D3E0"], ["white", "White", "#F4F2EC"]],
  },
  {
    slug: "suede-trucker-jacket",
    name: "Suede Trucker Jacket",
    category: "outerwear",
    gender: "MEN",
    price: 95000,
    compareAt: 115000,
    featured: true,
    description: "The classic trucker reimagined in a buttery cognac suede. Pointed collar, flap chest pockets and a button-adjustable waistband.",
    details: ["Genuine goat suede", "Cotton twill lining", "Two flap chest pockets, two hand pockets", "Specialist leather clean only"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [["tan", "Cognac", "#9C5D31"]],
  },
  {
    slug: "pleated-wide-leg-trousers",
    name: "Pleated Wide-Leg Trousers",
    category: "trousers",
    gender: "MEN",
    price: 42000,
    description: "Fluid, wide-leg trousers with a single front pleat and pressed crease. Smart enough for the office, relaxed enough for the weekend.",
    details: ["Wool-blend suiting", "Single pleat, pressed crease", "Side and back pockets"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: [["charcoal", "Charcoal", "#3B3A38"], ["stone", "Stone", "#B9B0A2"]],
  },
  {
    slug: "knit-fairway-cardigan",
    name: "Knit Fairway Cardigan",
    category: "knitwear",
    gender: "MEN",
    price: 56000,
    featured: true,
    description: "A chunky ribbed cardigan in a soft ecru cotton-wool blend, finished with horn-effect buttons and patch pockets.",
    details: ["70% cotton, 30% wool", "Patch pockets", "Relaxed fit"],
    sizes: ADULT,
    colors: [["ecru", "Ecru", "#EEEAE0"]],
  },
  {
    slug: "signature-trench-coat",
    name: "Signature Trench Coat",
    category: "outerwear",
    gender: "UNISEX",
    price: 135000,
    featured: true,
    description: "Our signature double-breasted trench in a water-repellent cotton gabardine. Storm flap, belted waist and a longline cut that moves with you.",
    details: ["Water-repellent cotton gabardine", "Double-breasted, horn buttons", "Removable belt", "Fully lined"],
    sizes: ADULT,
    colors: [["slate", "Slate", "#6C6862"], ["camel", "Camel", "#B08657"]],
  },
  {
    slug: "satin-slip-midi-dress",
    name: "Satin Slip Midi Dress",
    category: "dresses",
    gender: "WOMEN",
    price: 58000,
    featured: true,
    description: "A bias-cut slip dress in a fluid satin that skims the body. Adjustable straps and a softly flared midi hem.",
    details: ["Satin-finish viscose", "Adjustable straps", "Bias cut, midi length"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [["champagne", "Champagne", "#D6C1A2"], ["black", "Black", "#202020"]],
  },
  {
    slug: "relaxed-poplin-shirt",
    name: "Relaxed Poplin Shirt",
    category: "shirts",
    gender: "WOMEN",
    price: 30000,
    description: "An oversized poplin shirt with a crisp hand-feel. Wear it buttoned, open over a slip, or knotted at the waist.",
    details: ["100% cotton poplin", "Oversized fit", "Mother-of-pearl effect buttons"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [["white", "White", "#F5F3EE"]],
  },
  {
    slug: "cropped-crewneck",
    name: "Cropped Crewneck",
    category: "sweatshirts",
    gender: "WOMEN",
    price: 34000,
    description: "Our essential crewneck with a cropped, boxy body and wide ribbed hem in a warm clay tone.",
    details: ["100% cotton loopback", "Cropped boxy fit", "Wide ribbed hem"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [["clay", "Clay", "#D49F82"]],
  },
  {
    slug: "wrap-trench-coat",
    name: "Wrap Trench Coat",
    category: "outerwear",
    gender: "WOMEN",
    price: 128000,
    description: "A softly tailored wrap trench in camel with a tie belt and deep notch lapels.",
    details: ["Cotton-blend gabardine", "Tie belt", "Fully lined"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [["camel", "Camel", "#B48A5A"]],
  },
  {
    slug: "tailored-wide-leg-trousers",
    name: "Tailored Wide-Leg Trousers",
    category: "trousers",
    gender: "WOMEN",
    price: 39000,
    description: "High-rise, wide-leg trousers in a soft cream crepe with a pressed front crease that elongates the leg.",
    details: ["Crepe weave with stretch", "High rise", "Concealed hook-and-bar closure"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [["cream", "Cream", "#E8E0CF"]],
  },
  {
    slug: "six-panel-cap",
    name: "Six-Panel Cap",
    category: "accessories",
    gender: "UNISEX",
    price: 12500,
    description: "A structured six-panel cap in brushed cotton twill with an embroidered CLASSICCC label and adjustable strap.",
    details: ["Cotton twill", "Adjustable back strap", "Embroidered eyelets"],
    sizes: ["ONE SIZE"],
    colors: [["black", "Black", "#1E1E1E"], ["sand", "Sand", "#CDBFA6"]],
  },
  {
    slug: "canvas-tote-bag",
    name: "Canvas Tote Bag",
    category: "accessories",
    gender: "UNISEX",
    price: 15000,
    description: "A heavyweight canvas tote with reinforced handles — big enough for a laptop and the day's essentials.",
    details: ["16oz cotton canvas", "Internal slip pocket", "40 × 42 cm"],
    sizes: ["ONE SIZE"],
    colors: [["natural", "Natural", "#E6DCC6"]],
  },
  {
    slug: "leather-court-sneaker",
    name: "Leather Court Sneaker",
    category: "shoes",
    gender: "UNISEX",
    price: 68000,
    featured: true,
    description: "A clean, low-profile court sneaker in smooth leather on a cushioned rubber cupsole.",
    details: ["Full-grain leather upper", "Cushioned insole", "Stitched rubber cupsole"],
    sizes: SHOES,
    colors: [["white", "White", "#ECE9E2"], ["black", "Black", "#232323"]],
  },
];

const zones = [
  { name: "Lagos — Mainland", fee: 3000, eta: "1–2 business days" },
  { name: "Lagos — Island & Lekki", fee: 3500, eta: "1–2 business days" },
  { name: "Abuja (FCT)", fee: 5000, eta: "2–3 business days" },
  { name: "Port Harcourt", fee: 5500, eta: "2–4 business days" },
  { name: "Other states (Nigeria)", fee: 6500, eta: "3–5 business days" },
  { name: "Store pickup — Lekki", fee: 0, eta: "Ready in 24 hours" },
];

// deterministic pseudo-random stock levels
function stockFor(i: number) {
  const n = (i * 7919) % 13;
  return n < 2 ? 0 : n < 4 ? 2 : n + 3;
}

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@classicc.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  // This script runs on every deploy, so it only fills an empty database and
  // never overwrites changes made from the admin dashboard.
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "CLASSICCC Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPassword, 12),
    },
  });

  if ((await prisma.deliveryZone.count()) === 0) {
    await prisma.deliveryZone.createMany({
      data: zones.map((z, i) => ({ ...z, fee: z.fee * 100, sortOrder: i })),
    });
  }

  if ((await prisma.product.count()) > 0 || (await prisma.category.count()) > 0) {
    console.log("Catalog already exists — skipping product seed.");
    return;
  }

  const catIds: Record<string, string> = {};
  for (const [i, c] of categories.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, sortOrder: i },
    });
    catIds[c.slug] = row.id;
  }

  let v = 0;
  for (const p of products) {
    const images = p.colors.flatMap(([key, label], ci) =>
      [1, 2, 3].map((n, k) => ({
        url: `/products/${p.slug}-${key}-${n}.svg`,
        alt: `${p.name} in ${label}`,
        color: label,
        sortOrder: ci * 3 + k,
      })),
    );
    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        details: p.details.join("\n"),
        price: p.price * 100,
        compareAtPrice: p.compareAt ? p.compareAt * 100 : null,
        gender: p.gender,
        featured: Boolean(p.featured),
        categoryId: catIds[p.category],
        images: { create: images },
        variants: {
          create: p.colors.flatMap(([key, label, hex]) =>
            p.sizes.map((size) => ({
              size,
              color: label,
              colorHex: hex,
              stock: stockFor(++v),
              sku: `${p.slug.split("-").map((w) => w[0]).join("").toUpperCase()}-${key.slice(0, 3).toUpperCase()}-${size.replace(/\s+/g, "")}`,
            })),
          ),
        },
      },
    });
  }

  console.log(`Seeded ${products.length} products, ${categories.length} categories, ${zones.length} delivery zones.`);
  console.log(`Admin login: ${adminEmail} / ${process.env.ADMIN_PASSWORD ? "(from ADMIN_PASSWORD)" : adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
