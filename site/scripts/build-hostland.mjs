import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const staging = await mkdtemp(path.join(tmpdir(), "uvelo-export-"));
const output = path.join(project, ".hostland");
try {
  for (const name of ["src", "public", "package.json", "package-lock.json", "tsconfig.json", "postcss.config.mjs", "next-env.d.ts"]) {
    await cp(path.join(project, name), path.join(staging, name), { recursive: true });
  }
  await symlink(path.join(project, "node_modules"), path.join(staging, "node_modules"), "dir");
  await writeFile(path.join(staging, "next.config.ts"), `import type { NextConfig } from "next";
const config: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};
export default config;
`);
  // Forms are currently disabled. Static hosting publishes only the public pages.
  await rm(path.join(staging, "src/app/api"), { recursive: true, force: true });
  for (const name of ["robots.ts", "sitemap.ts"]) {
    const filename = path.join(staging, "src/app", name);
    await writeFile(filename, 'export const dynamic = "force-static";\n' + await readFile(filename, "utf8"));
  }
  execFileSync(process.execPath, [path.join(project, "node_modules/next/dist/bin/next"), "build", "--webpack"], {
    cwd: staging,
    stdio: "inherit",
  });
  await rm(output, { recursive: true, force: true });
  await mkdir(path.join(output, "tmp"), { recursive: true });
  await cp(path.join(staging, "out"), path.join(output, "public"), { recursive: true });
  await cp(path.join(project, "hostland/server.cjs"), path.join(output, "server.js"));
  await writeFile(path.join(output, "tmp/restart.txt"), new Date().toISOString());
  execFileSync("zip", ["-qr", "uvelo-hostland-site.zip", "public", "server.js", "tmp"], { cwd: output });
  console.log(`Hostland package: ${path.join(output, "uvelo-hostland-site.zip")}`);
} finally {
  await rm(staging, { recursive: true, force: true });
}
