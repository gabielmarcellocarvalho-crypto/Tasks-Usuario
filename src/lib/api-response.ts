import { NextResponse } from "next/server";

export function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound() {
  return NextResponse.json({ error: "not_found" }, { status: 404 });
}
