import { NextResponse } from "next/server";
import { access } from "node:fs/promises";
import path from "node:path";
import puppeteer, { type Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PAYLOAD_BYTES = 3_000_000;

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getBrowserConfiguration(): Promise<{
  executablePath: string;
  args: string[];
}> {
  const configuredPath = process.env.CHROME_EXECUTABLE_PATH
    ?.trim()
    .replace(/^["']|["']$/g, "");

  // Use the configured browser only when its executable exists.
  if (configuredPath && (await fileExists(configuredPath))) {
    return {
      executablePath: configuredPath,
      args: [],
    };
  }

  // An outdated environment variable must not prevent Windows detection.
  if (process.platform === "win32") {
    const candidates: string[] = [];

    const programFolders = [
      process.env.ProgramW6432,
      process.env.PROGRAMFILES,
      process.env["PROGRAMFILES(X86)"],
      process.env.LOCALAPPDATA,
      "C:\\Program Files",
      "C:\\Program Files (x86)",
    ].filter((folder): folder is string => Boolean(folder));

    for (const folder of programFolders) {
      candidates.push(
        path.join(
          folder,
          "Google",
          "Chrome",
          "Application",
          "chrome.exe"
        ),
        path.join(
          folder,
          "Microsoft",
          "Edge",
          "Application",
          "msedge.exe"
        ),
        path.join(
          folder,
          "Google",
          "Chrome Beta",
          "Application",
          "chrome.exe"
        )
      );
    }

    for (const candidate of [...new Set(candidates)]) {
      if (await fileExists(candidate)) {
        return {
          executablePath: candidate,
          args: [],
        };
      }
    }

    throw new Error(
      "No Chrome or Microsoft Edge installation was found on the Windows computer running this app. Install Chrome or Edge, or set CHROME_EXECUTABLE_PATH to the correct browser executable."
    );
  }

  // Local macOS browser locations.
  if (process.platform === "darwin") {
    const candidates = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ];

    for (const candidate of candidates) {
      if (await fileExists(candidate)) {
        return {
          executablePath: candidate,
          args: [],
        };
      }
    }
  }

  // Vercel or another server environment.
  const chromiumPackUrl = process.env.CHROMIUM_PACK_URL?.trim();

  if (!chromiumPackUrl) {
    throw new Error(
      "No usable browser was found. For a local server, set CHROME_EXECUTABLE_PATH to an installed browser. For Vercel, configure CHROMIUM_PACK_URL and redeploy."
    );
  }

  let packUrl: URL;

  try {
    packUrl = new URL(chromiumPackUrl);
  } catch {
    throw new Error("CHROMIUM_PACK_URL is not a valid URL.");
  }

  if (packUrl.protocol !== "https:") {
    throw new Error("CHROMIUM_PACK_URL must use HTTPS.");
  }

  return {
    executablePath: await chromium.executablePath(chromiumPackUrl),
    args: chromium.args,
  };
}

export async function POST(request: Request) {
  let browser: Browser | undefined;
  let stage = "reading the export request";

  try {
    const rawBody = await request.text();

    if (Buffer.byteLength(rawBody, "utf8") > MAX_PAYLOAD_BYTES) {
      return errorResponse(
        "The resume is too large to export.",
        413
      );
    }

    let payload: unknown;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return errorResponse("Invalid export request.", 400);
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      !("html" in payload) ||
      !("css" in payload) ||
      typeof payload.html !== "string" ||
      typeof payload.css !== "string" ||
      !payload.html.trim() ||
      !payload.css.trim()
    ) {
      return errorResponse(
        "Resume content or styles are missing.",
        400
      );
    }

    const { html, css } = payload;

    stage = "locating Chrome or Edge";

    const configuration = await getBrowserConfiguration();

    stage = "starting the PDF browser";

    browser = await puppeteer.launch({
      executablePath: configuration.executablePath,
      args: configuration.args,
      headless: true,
      timeout: 30_000,
    });

    stage = "preparing the resume";

    const page = await browser.newPage();

    page.setDefaultTimeout(20_000);
    page.setDefaultNavigationTimeout(20_000);

    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1,
    });

    // ResumePreview has already rendered the resume HTML.
    await page.setJavaScriptEnabled(false);

    // Keep the exported document self-contained.
    await page.setRequestInterception(true);

    page.on("request", (resourceRequest) => {
      const url = resourceRequest.url();

      const action =
        url.startsWith("data:") || url === "about:blank"
          ? resourceRequest.continue()
          : resourceRequest.abort();

      void action.catch(() => undefined);
    });

    await page.emulateMediaType("print");

    const safeCss = css.replace(/<\/style/gi, "<\\/style");

    await page.setContent(
      `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />

          <meta
            http-equiv="Content-Security-Policy"
            content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; base-uri 'none'; form-action 'none';"
          />

          <style>
            ${safeCss}
          </style>

          <style>
            @page {
              size: A4;
              margin: 12mm;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              font-family: Arial, Helvetica, sans-serif;
              color: #25252b;
            }

            main {
              display: block !important;
              position: static !important;
              width: 100% !important;
              max-width: none !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }

            main > :not(.print-only-resume) {
              display: none !important;
            }

            .print-only-resume {
              display: block !important;
              position: static !important;
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }

            .print-only-resume .resume-document {
              width: 100% !important;
              max-width: none !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              overflow: visible !important;
            }

            .print-only-resume .resume-section {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .print-only-resume,
            .print-only-resume * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
        </head>

        <body>
          <main>
            ${html}
          </main>
        </body>
      </html>`,
      {
        waitUntil: "load",
        timeout: 20_000,
      }
    );

    const printableResume = await page.$(
      "main > .print-only-resume"
    );

    if (!printableResume) {
      throw new Error(
        "The export request is missing the print-only resume wrapper."
      );
    }

    stage = "generating the PDF";

    const pdf = await page.pdf({
      format: "A4",
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: "12mm",
        bottom: "12mm",
        left: "12mm",
        right: "12mm",
      },
      timeout: 20_000,
    });

    if (!pdf.byteLength) {
      throw new Error("The browser returned an empty PDF.");
    }

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Resume.pdf"',
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const details =
      error instanceof Error ? error.message : "Unknown error";

    console.error(
      `PDF export failed while ${stage}:`,
      error
    );

    return errorResponse(
      process.env.NODE_ENV === "development"
        ? `PDF export failed while ${stage}: ${details}`
        : "Unable to generate your PDF. Please try again.",
      500
    );
  } finally {
    if (browser) {
      await browser.close().catch(() => undefined);
    }
  }
}