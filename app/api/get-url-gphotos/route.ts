import { NextRequest, NextResponse } from "next/server";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

async function getImagesFromPage(url: string) {
  try {
    const response = await fetch(url, {});
    const html = await response.text();

    const { window } = new JSDOM(html);
    const document = window.document;

    const images = document.querySelectorAll("img");

    return Array.from(images)
      .map((img) => img.src)
      .slice(1);
  } catch (error) {
    console.error("Lỗi khi lấy hình ảnh:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const encodedUrl = searchParams.get("url")!;
  const decodedUrl = decodeURIComponent(encodedUrl);
  const images = await getImagesFromPage(decodedUrl);
  return NextResponse.json(
    images.map((img) => img.split("=")[0] + "=w0-h0-no"),
  );
}
