import postgres from "postgres";
import { randomBytes } from "crypto";

export type Ingredient = { name: string; amount: string; unit: string; note: string };

export type Recipe = {
  id: number;
  name: string;
  tagline: string;
  color: string;
  servings: string;
  ingredients: Ingredient[];
  steps: string[];
  notes: string;
  tags: string[];
  has_photo: boolean;
  share_token: string;
  is_shared: boolean;
  created_at: string;
};

export type RecipeInput = Omit<Recipe, "id" | "has_photo" | "share_token" | "is_shared" | "created_at">;

const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres>; schemaReady?: Promise<void> };

function client() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add a Postgres database (see README).");
  }
  if (!globalForDb.sql) {
    const local = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);
    globalForDb.sql = postgres(process.env.DATABASE_URL, {
      ssl: local ? false : "require",
      max: 3,
      idle_timeout: 20,
      prepare: false,
    });
  }
  return globalForDb.sql;
}

// Creates the tables the first time the app runs, so there is no separate
// database setup step.
async function ready() {
  const sql = client();
  if (!globalForDb.schemaReady) {
    globalForDb.schemaReady = (async () => {
      await sql`
        create table if not exists recipes (
          id serial primary key,
          name text not null,
          tagline text not null default '',
          color text not null default '#ff3b6b',
          servings text not null default '',
          ingredients jsonb not null default '[]',
          steps jsonb not null default '[]',
          notes text not null default '',
          tags jsonb not null default '[]',
          share_token text not null unique,
          is_shared boolean not null default false,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )`;
      await sql`
        create table if not exists photos (
          recipe_id integer primary key references recipes(id) on delete cascade,
          mime text not null,
          data bytea not null
        )`;
    })().catch((e) => {
      globalForDb.schemaReady = undefined;
      throw e;
    });
  }
  await globalForDb.schemaReady;
  return sql;
}

const columns = `r.id, r.name, r.tagline, r.color, r.servings, r.ingredients, r.steps, r.notes, r.tags,
  r.share_token, r.is_shared, r.created_at, (p.recipe_id is not null) as has_photo`;

export async function listRecipes(): Promise<Recipe[]> {
  const sql = await ready();
  return (await sql.unsafe(
    `select ${columns} from recipes r left join photos p on p.recipe_id = r.id order by r.created_at desc`
  )) as unknown as Recipe[];
}

export async function getRecipe(id: number): Promise<Recipe | null> {
  if (!Number.isInteger(id)) return null;
  const sql = await ready();
  const rows = await sql.unsafe(
    `select ${columns} from recipes r left join photos p on p.recipe_id = r.id where r.id = $1`,
    [id]
  );
  return (rows[0] as unknown as Recipe) ?? null;
}

export async function getSharedRecipe(token: string): Promise<Recipe | null> {
  const sql = await ready();
  const rows = await sql.unsafe(
    `select ${columns} from recipes r left join photos p on p.recipe_id = r.id
     where r.share_token = $1 and r.is_shared = true`,
    [token]
  );
  return (rows[0] as unknown as Recipe) ?? null;
}

export async function createRecipe(input: RecipeInput, photo?: { mime: string; data: Buffer }) {
  const sql = await ready();
  const token = randomBytes(12).toString("base64url");
  const [row] = await sql`
    insert into recipes (name, tagline, color, servings, ingredients, steps, notes, tags, share_token)
    values (${input.name}, ${input.tagline}, ${input.color}, ${input.servings},
            ${sql.json(input.ingredients)}, ${sql.json(input.steps)}, ${input.notes},
            ${sql.json(input.tags)}, ${token})
    returning id`;
  if (photo) await savePhoto(row.id, photo);
  return row.id as number;
}

export async function updateRecipe(id: number, input: RecipeInput, photo?: { mime: string; data: Buffer } | null) {
  const sql = await ready();
  await sql`
    update recipes set name = ${input.name}, tagline = ${input.tagline}, color = ${input.color},
      servings = ${input.servings}, ingredients = ${sql.json(input.ingredients)},
      steps = ${sql.json(input.steps)}, notes = ${input.notes}, tags = ${sql.json(input.tags)},
      updated_at = now()
    where id = ${id}`;
  if (photo === null) await sql`delete from photos where recipe_id = ${id}`;
  else if (photo) await savePhoto(id, photo);
}

async function savePhoto(id: number, photo: { mime: string; data: Buffer }) {
  const sql = await ready();
  await sql`
    insert into photos (recipe_id, mime, data) values (${id}, ${photo.mime}, ${photo.data})
    on conflict (recipe_id) do update set mime = excluded.mime, data = excluded.data`;
}

export async function deleteRecipe(id: number) {
  const sql = await ready();
  await sql`delete from recipes where id = ${id}`;
}

export async function setShared(id: number, shared: boolean, newLink = false) {
  const sql = await ready();
  if (newLink) {
    await sql`update recipes set share_token = ${randomBytes(12).toString("base64url")} where id = ${id}`;
  }
  const [row] = await sql`update recipes set is_shared = ${shared} where id = ${id} returning share_token, is_shared`;
  return row as { share_token: string; is_shared: boolean } | undefined;
}

export async function getPhoto(id: number) {
  const sql = await ready();
  const [row] = await sql`
    select p.mime, p.data, r.is_shared, r.share_token from photos p
    join recipes r on r.id = p.recipe_id where p.recipe_id = ${id}`;
  return row as { mime: string; data: Buffer; is_shared: boolean; share_token: string } | undefined;
}
