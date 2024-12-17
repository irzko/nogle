import { NextRequest, NextResponse } from "next/server";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

async function getImagesFromPage(url: string) {
  try {
    const response = await fetch(url, {});
    const html = await response.text();

    const { window } = new JSDOM(html);
    const document = window.document;

    const images: NodeListOf<HTMLImageElement> =
      document.querySelectorAll("img.hKgQud");

    return Array.from(images).map((img) => img.src);
  } catch (error) {
    console.error("Lỗi khi lấy hình ảnh:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const encodedUrl = searchParams.get("url");
  if (!encodedUrl) {
    return NextResponse.json({ error: "Không có URL được cung cấp" });
  }
  const decodedUrl = decodeURIComponent(encodedUrl);
  const images = await getImagesFromPage(decodedUrl);
  return NextResponse.json(images.map((img) => img.split("=")[0] + "=s0"));
}
