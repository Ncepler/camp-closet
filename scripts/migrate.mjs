// Camp Closet — Supabase Migration Script
// Runs all DDL statements directly against PostgreSQL

import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Connection ──────────────────────────────────────────────
// Supabase project: rnwjcxmodfyjjvmglwch
// Get DB password: Supabase Dashboard → Project Settings → Database → Database password
const DB_PASSWORD = process.env.DB_PASSWORD ?? process.argv[2];

if (!DB_PASSWORD) {
  console.error(`
❌  DB_PASSWORD required.
    Run with: node scripts/migrate.mjs YOUR_DB_PASSWORD
    Find it: Supabase Dashboard → Project Settings → Database → Database password
  `);
  process.exit(1);
}

const client = new Client({
  host:     "db.rnwjcxmodfyjjvmglwch.supabase.co",
  port:     5432,
  database: "postgres",
  user:     "postgres",
  password: DB_PASSWORD,
  ssl:      { rejectUnauthorized: false },
});

// ── SQL Statements ──────────────────────────────────────────
// Split the schema file into executable chunks
function parseSQL(sql) {
  // Remove single-line comments
  let cleaned = sql.replace(/--[^\n]*/g, "");
  // Split on statement-ending semicolons (roughly)
  const statements = [];
  let current = "";
  let dollarDepth = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const twoChar = cleaned.slice(i, i + 2);

    if (twoChar === "$$") {
      dollarDepth = dollarDepth === 0 ? 1 : 0;
      current += twoChar;
      i++;
      continue;
    }

    if (char === ";" && dollarDepth === 0) {
      const stmt = current.trim();
      if (stmt.length > 0) statements.push(stmt);
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) statements.push(current.trim());
  return statements.filter((s) => s.length > 5);
}

async function run() {
  console.log("🔌  Connecting to Supabase PostgreSQL…");
  try {
    await client.connect();
    console.log("✅  Connected!\n");
  } catch (err) {
    console.error("❌  Connection failed:", err.message);
    process.exit(1);
  }

  const schemaPath = join(__dirname, "..", "supabase-schema.sql");
  const sql = readFileSync(schemaPath, "utf8");
  const statements = parseSQL(sql);

  console.log(`📋  Running ${statements.length} SQL statements…\n`);

  let success = 0;
  let skipped = 0;
  let failed  = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.slice(0, 60).replace(/\s+/g, " ");
    try {
      await client.query(stmt);
      success++;
      console.log(`  ✓  [${i + 1}/${statements.length}] ${preview}…`);
    } catch (err) {
      // Ignore "already exists" errors — idempotent migrations
      if (
        err.message.includes("already exists") ||
        err.message.includes("duplicate key") ||
        err.message.includes("relation") && err.message.includes("already exists")
      ) {
        skipped++;
        console.log(`  ⟳  [${i + 1}/${statements.length}] Already exists: ${preview}…`);
      } else {
        failed++;
        console.warn(`  ✗  [${i + 1}/${statements.length}] FAILED: ${err.message.slice(0, 80)}`);
        console.warn(`     Statement: ${preview}`);
      }
    }
  }

  await client.end();

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅  Success:  ${success}
  ⟳   Skipped:  ${skipped}  (already existed)
  ✗   Failed:   ${failed}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  if (failed === 0) {
    console.log("🎉  Database is ready! Run: npm run dev\n");
  } else {
    console.log("⚠️   Some statements failed — check output above.\n");
  }
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
