import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { db, causesTable, donationsTable } from "@workspace/db";

function slugify(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function monthName(month: number) {
    return [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ][month - 1];
}

function parseAmount(raw: string): number {
    const match = raw.match(/[\d,]+(?:\.\d+)?/);

    if (!match) {
        throw new Error(`Invalid amount: "${raw}"`);
    }

    return Number(
        match[0].replace(/,/g, "")
    );
}

type DonationRow = Record<
    "Title" | "Donated for:" | "Donation Date" | "Donation Amt",
    string | undefined
>;

function getField(row: DonationRow, key: keyof DonationRow) {
    return String(row[key] ?? "").trim();
}

const csvPath = path.resolve(
    process.cwd(),
    "../Donors list.csv"
);

const csv = fs.readFileSync(csvPath, "utf8");

const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
}) as DonationRow[];

async function main() {
    console.log(`Rows found: ${rows.length}`);

    const causeMap = new Map<string, number>();

    const grouped = new Map<
        string,
        {
            cause: string;
            month: number;
            year: number;
            total: number;
        }
    >();

    for (const row of rows) {
        const cause = getField(row, "Donated for:");

        const [day, month, year] = getField(row, "Donation Date")
            .split("/")
            .map(Number);

        const amount = parseAmount(
            String(row["Donation Amt"] ?? "")
        );

        const key = `${cause}-${month}-${year}`;

        const existing = grouped.get(key);

        if (existing) {
            existing.total += amount;
        } else {
            grouped.set(key, {
                cause,
                month,
                year,
                total: amount,
            });
        }
    }

    const campaigns = Array.from(grouped.values()).sort(
        (a, b) =>
            a.year - b.year ||
            a.month - b.month
    );

    for (let i = 0; i < campaigns.length; i++) {
        const campaign = campaigns[i];

        const title =
            `${campaign.cause} - ${monthName(campaign.month)} ${campaign.year}`;

        const [created] = await db
            .insert(causesTable)
            .values({
                title,
                ngoName: campaign.cause,
                slug: slugify(title),
                description:
                    `Monthly support campaign for ${campaign.cause}`,
                month: campaign.month,
                year: campaign.year,
                goalAmount: String(campaign.total),
                raisedAmount: String(campaign.total),
                category: "charity",
                isCurrent: i === campaigns.length - 1,
            })
            .returning();

        causeMap.set(
            `${campaign.cause}-${campaign.month}-${campaign.year}`,
            created.id
        );
    }

    let imported = 0;

    for (const row of rows) {
        const donorName = getField(row, "Title");

        const cause = getField(row, "Donated for:");

        const [day, month, year] = getField(row, "Donation Date")
            .split("/")
            .map(Number);

        const amount = parseAmount(
            String(row["Donation Amt"] ?? "")
        );

        const donatedAt = new Date(
            Date.UTC(year, month - 1, day)
        );

        const causeId = causeMap.get(
            `${cause}-${month}-${year}`
        );

        if (!causeId) {
            console.log("Missing cause:", cause);
            continue;
        }

        await db.insert(donationsTable).values({
            donorName,
            amount: String(amount),
            causeId,
            donatedAt,
            status: "historical",
            source: "plaky-import",
            isAnonymous: false,
        });

        imported++;
    }

    console.log("=================================");
    console.log(`Campaigns: ${campaigns.length}`);
    console.log(`Donations: ${imported}`);
    console.log("Import completed");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
