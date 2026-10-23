import { writeFileSync } from "fs";
import { join } from "path";
import { generateFixture } from "../src/lib/data/generate";

const fixture = generateFixture();
const outPath = join(__dirname, "../src/lib/data/fixture.json");
writeFileSync(outPath, JSON.stringify(fixture, null, 2));
console.log(`Wrote ${fixture.length} process logs to ${outPath}`);
fixture.forEach((p) => console.log(`  ${p.id}: ${p.events.length} events`));
