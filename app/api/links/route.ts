import { NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const SHEET_ID = "1Q9vg9mPI_9kpTV-avTHan4kLJMr39xhe5BG7nDpSj0U";
const SHEET_NAME = "Sheet1";

function getAuth() {
  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function GET() {
  try {
    const serviceAccountAuth = getAuth();
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);

    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[SHEET_NAME] || doc.sheetsByIndex[0];

    if (!sheet) {
      return NextResponse.json(
        { error: "Sheet not found" },
        { status: 404 }
      );
    }

    const rows = await sheet.getRows();

    // Parse rows into categories and links
    // Expected format: Column A = Category, Column B = Link Title, Column C = URL
    const categories: Record<
      string,
      { name: string; description: string; links: Array<{ title: string; url: string; rowIndex: number }> }
    > = {};

    rows.forEach((row, index) => {
      const category = row.get("Category") || row.get("col1");
      const title = row.get("Title") || row.get("col2");
      const url = row.get("URL") || row.get("col3");
      const description = row.get("Description") || row.get("col4") || "";

      if (category && title && url) {
        if (!categories[category]) {
          categories[category] = {
            name: category,
            description: description,
            links: [],
          };
        }

        categories[category].links.push({ title, url, rowIndex: index });
      }
    });

    const linkCategories = Object.values(categories);

    return NextResponse.json({ linkCategories });
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error);
    return NextResponse.json(
      { error: "Failed to fetch links", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, title, url, description = "" } = body;

    if (!category || !title || !url) {
      return NextResponse.json(
        { error: "Missing required fields: category, title, url" },
        { status: 400 }
      );
    }

    const serviceAccountAuth = getAuth();
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);

    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[SHEET_NAME] || doc.sheetsByIndex[0];

    if (!sheet) {
      return NextResponse.json(
        { error: "Sheet not found" },
        { status: 404 }
      );
    }

    // Add new row
    await sheet.addRow({
      Category: category,
      Title: title,
      URL: url,
      Description: description,
    });

    return NextResponse.json(
      { success: true, message: "Link added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to Google Sheets:", error);
    return NextResponse.json(
      { error: "Failed to add link", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { rowIndex, category, title, url, description = "" } = body;

    if (rowIndex === undefined || !category || !title || !url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const serviceAccountAuth = getAuth();
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);

    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[SHEET_NAME] || doc.sheetsByIndex[0];

    if (!sheet) {
      return NextResponse.json(
        { error: "Sheet not found" },
        { status: 404 }
      );
    }

    const rows = await sheet.getRows();
    if (rowIndex < 0 || rowIndex >= rows.length) {
      return NextResponse.json(
        { error: "Invalid row index" },
        { status: 400 }
      );
    }

    const row = rows[rowIndex];
    row.set("Category", category);
    row.set("Title", title);
    row.set("URL", url);
    row.set("Description", description);
    await row.save();

    return NextResponse.json(
      { success: true, message: "Link updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating Google Sheets:", error);
    return NextResponse.json(
      { error: "Failed to update link", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { rowIndex } = body;

    if (rowIndex === undefined) {
      return NextResponse.json(
        { error: "Missing rowIndex" },
        { status: 400 }
      );
    }

    const serviceAccountAuth = getAuth();
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);

    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[SHEET_NAME] || doc.sheetsByIndex[0];

    if (!sheet) {
      return NextResponse.json(
        { error: "Sheet not found" },
        { status: 404 }
      );
    }

    const rows = await sheet.getRows();
    if (rowIndex < 0 || rowIndex >= rows.length) {
      return NextResponse.json(
        { error: "Invalid row index" },
        { status: 400 }
      );
    }

    const row = rows[rowIndex];
    await row.delete();

    return NextResponse.json(
      { success: true, message: "Link deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting from Google Sheets:", error);
    return NextResponse.json(
      { error: "Failed to delete link", details: (error as Error).message },
      { status: 500 }
    );
  }
}
