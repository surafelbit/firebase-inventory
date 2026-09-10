/**
 * seed.js — Emulator Seed Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Wipes and recreates a known baseline in the local Firebase emulators:
 *
 *   Auth users       → 3 accounts  (admin / staff / viewer)
 *   Firestore users  → matching user documents with roles
 *   Firestore products → 10 sample products
 *   Firestore stockMovements → initial "received" movement per product
 *
 * Usage (while emulators are running):
 *   node seed.js
 *
 * The script is idempotent — running it multiple times always produces the
 * same clean baseline (it deletes everything in those collections first).
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use strict";

const admin = require("firebase-admin");

// ─── Emulator connection ───────────────────────────────────────────────────
const PROJECT_ID     = "inventory-app-19292";
const AUTH_HOST      = "127.0.0.1:9099";
const FIRESTORE_HOST = "127.0.0.1:8080";

process.env.FIRESTORE_EMULATOR_HOST     = FIRESTORE_HOST;
process.env.FIREBASE_AUTH_EMULATOR_HOST = AUTH_HOST;

admin.initializeApp({ projectId: PROJECT_ID });
admin.firestore().settings({ host: FIRESTORE_HOST, ssl: false });

const db   = admin.firestore();
const auth = admin.auth();

// ─── Seed data ─────────────────────────────────────────────────────────────

const USERS = [
  {
    uid:      "seed-admin-001",
    email:    "admin@inventory.test",
    password: "Admin123!",
    fullName: "Admin User",
    role:     "admin",
  },
  {
    uid:      "seed-staff-001",
    email:    "staff@inventory.test",
    password: "Staff123!",
    fullName: "Staff User",
    role:     "staff",
  },
  {
    uid:      "seed-viewer-001",
    email:    "viewer@inventory.test",
    password: "Viewer123!",
    fullName: "Viewer User",
    role:     "viewer",
  },
];

const PRODUCTS = [
  {
    id:       "prod-001",
    name:     "MacBook Pro 14",
    sku:      "MBP-14-2024",
    category: "Electronics",
    quantity: 12,
    price:    185000,
    minStock: 3,
  },
  {
    id:       "prod-002",
    name:     "iPhone 15",
    sku:      "IPH-15-128",
    category: "Electronics",
    quantity: 5,
    price:    95000,
    minStock: 5,
  },
  {
    id:       "prod-003",
    name:     "Samsung 4K Monitor",
    sku:      "SAM-MON-4K",
    category: "Electronics",
    quantity: 8,
    price:    42000,
    minStock: 2,
  },
  {
    id:       "prod-004",
    name:     "Mechanical Keyboard",
    sku:      "KB-MECH-BLK",
    category: "Electronics",
    quantity: 0,
    price:    6500,
    minStock: 5,
  },
  {
    id:       "prod-005",
    name:     "Nike Air Max 270",
    sku:      "NK-AM270-44",
    category: "Clothing",
    quantity: 20,
    price:    8500,
    minStock: 4,
  },
  {
    id:       "prod-006",
    name:     "Levi's 501 Jeans",
    sku:      "LV-501-32",
    category: "Clothing",
    quantity: 3,
    price:    3200,
    minStock: 5,
  },
  {
    id:       "prod-007",
    name:     "Ergonomic Office Chair",
    sku:      "OFC-CHR-ERG",
    category: "Other",
    quantity: 2,
    price:    18000,
    minStock: 2,
  },
  {
    id:       "prod-008",
    name:     "Standing Desk",
    sku:      "DSK-STAND-01",
    category: "Other",
    quantity: 6,
    price:    24000,
    minStock: 2,
  },
  {
    id:       "prod-009",
    name:     "Ethiopian Coffee Beans 1kg",
    sku:      "FOOD-COFFEE-1K",
    category: "Food",
    quantity: 35,
    price:    850,
    minStock: 10,
  },
  {
    id:       "prod-010",
    name:     "Organic Green Tea 500g",
    sku:      "FOOD-TEA-500",
    category: "Food",
    quantity: 18,
    price:    420,
    minStock: 8,
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const log  = (msg) => console.log(`  ✓  ${msg}`);
const warn = (msg) => console.log(`  ⚠  ${msg}`);
const step = (msg) => console.log(`\n▸ ${msg}`);
const done = (msg) => console.log(`  └─ ${msg}`);

/** Delete every document in a Firestore collection (in batches). */
async function clearCollection(name) {
  const snapshot = await db.collection(name).get();
  if (snapshot.empty) return 0;

  const BATCH_SIZE = 400;
  let count = 0;

  for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    snapshot.docs
      .slice(i, i + BATCH_SIZE)
      .forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    count += Math.min(BATCH_SIZE, snapshot.docs.length - i);
  }

  return count;
}

/** Create or overwrite a user in the Auth emulator. */
async function upsertAuthUser({ uid, email, password, fullName }) {
  try {
    await auth.getUser(uid);
    await auth.updateUser(uid, {
      email,
      password,
      displayName: fullName,
      emailVerified: true,
    });
    warn(`Auth user already existed — updated: ${email}`);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      await auth.createUser({
        uid,
        email,
        password,
        displayName: fullName,
        emailVerified: true,
      });
      log(`Created Auth user: ${email}`);
    } else {
      throw err;
    }
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function seed() {
  console.log("\n══════════════════════════════════════════════");
  console.log("  InventoryPro — Emulator Seed Script");
  console.log("══════════════════════════════════════════════");
  console.log(`  Project  : ${PROJECT_ID}`);
  console.log(`  Firestore: ${FIRESTORE_HOST}`);
  console.log(`  Auth     : ${AUTH_HOST}`);
  console.log("──────────────────────────────────────────────");

  // ── 1. Wipe Firestore ─────────────────────────────────────────────────────
  step("Clearing Firestore collections …");

  const usersDeleted     = await clearCollection("users");
  const productsDeleted  = await clearCollection("products");
  const movementsDeleted = await clearCollection("stockMovements");

  log(`Deleted ${usersDeleted} user document(s)`);
  log(`Deleted ${productsDeleted} product document(s)`);
  log(`Deleted ${movementsDeleted} stock movement document(s)`);

  // ── 2. Wipe Auth ──────────────────────────────────────────────────────────
  step("Clearing Auth users …");

  try {
    const listResult = await auth.listUsers(1000);
    const uids = listResult.users.map((u) => u.uid);

    if (uids.length > 0) {
      await auth.deleteUsers(uids);
      log(`Deleted ${uids.length} Auth user(s)`);
    } else {
      log("No Auth users to delete");
    }
  } catch (err) {
    warn(`Could not list/delete Auth users: ${err.message}`);
  }

  // ── 3. Create Auth users + Firestore user documents ───────────────────────
  step("Creating users …");

  for (const user of USERS) {
    await upsertAuthUser(user);

    await db.collection("users").doc(user.uid).set({
      uid:       user.uid,
      fullName:  user.fullName,
      email:     user.email,
      role:      user.role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    log(`Firestore user doc: ${user.role.padEnd(8)} → ${user.email}`);
  }

  done(`${USERS.length} users created`);

  // ── 4. Create products ────────────────────────────────────────────────────
  step("Creating products …");

  const now = admin.firestore.FieldValue.serverTimestamp();

  for (const product of PRODUCTS) {
    const { id, ...fields } = product;

    await db.collection("products").doc(id).set({
      ...fields,
      id,
      createdAt: now,
      updatedAt: now,
    });

    const stockLabel =
      fields.quantity === 0
        ? "OUT"
        : fields.quantity <= fields.minStock
          ? "LOW"
          : "OK ";

    log(
      `[${stockLabel}] ${fields.name.padEnd(28)}  qty: ${String(fields.quantity).padStart(3)}  ETB ${fields.price.toLocaleString()}`
    );
  }

  done(`${PRODUCTS.length} products created`);

  // ── 5. Record initial stock movements ─────────────────────────────────────
  step("Recording initial stock movements …");

  let movCount = 0;

  for (const product of PRODUCTS) {
    if (product.quantity === 0) continue;

    await db
      .collection("stockMovements")
      .doc(`init-${product.id}`)
      .set({
        id:            `init-${product.id}`,
        productId:     product.id,
        type:          "received",
        quantity:      product.quantity,
        previousStock: 0,
        newStock:      product.quantity,
        note:          "Initial stock — seeded",
        createdAt:     now,
      });

    movCount++;
  }

  log(`${movCount} stock movement(s) recorded`);
  done("stockMovements collection seeded");

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════");
  console.log("  Seed complete! 🌱");
  console.log("──────────────────────────────────────────────");
  console.log("  ACCOUNTS");
  console.log("  ┌─────────┬──────────────────────────┬───────────┐");
  console.log("  │ Role    │ Email                    │ Password  │");
  console.log("  ├─────────┼──────────────────────────┼───────────┤");
  USERS.forEach(({ role, email, password }) => {
    console.log(
      `  │ ${role.padEnd(7)} │ ${email.padEnd(24)} │ ${password.padEnd(9)} │`
    );
  });
  console.log("  └─────────┴──────────────────────────┴───────────┘");
  console.log("══════════════════════════════════════════════\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("\n✖  Seed failed:", err.message);
  console.error(err);
  process.exit(1);
});
