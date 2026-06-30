#!/usr/bin/env bun

import { $ } from "bun"
import path from "path"
import { parseArgs } from "util"

const root = path.resolve(import.meta.dir, "..")
const file = path.join(root, "UPCOMING_CHANGELOG.md")
const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    to: { type: "string", short: "t" },
    quiet: { type: "boolean", default: false },
    print: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
})

if (values.help) {
  console.log(`
Usage: bun script/changelog.ts [options]

Generates UPCOMING_CHANGELOG.md by analyzing commits.

Options:
  -t, --to <ref>         Ending ref (default: HEAD)
      --quiet            Suppress output unless it fails
      --print            Print the generated UPCOMING_CHANGELOG.md after success
  -h, --help             Show this help message

Examples:
  bun script/changelog.ts
`)
  process.exit(0)
}

const cmd = ["bun", "script/raw-changelog.ts", "--to", values.to ?? "HEAD"]
const proc = Bun.spawn(cmd, {
  cwd: root,
  stdout: "pipe",
  stderr: "pipe",
})

const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()])
const code = await proc.exited

if (code === 0) {
  let body = out.trim()
  body = body.replace(/^Last release: .+\n/, "").replace(/^Target ref: .+$/m, "").trim()
  if (!body) body = "No notable changes"
  await Bun.write(file, body + "\n")
  if (values.print) process.stdout.write(body)
  process.exit(0)
}

if (!values.quiet) {
  if (out) process.stdout.write(out)
  if (err) process.stderr.write(err)
}

process.exit(code)
