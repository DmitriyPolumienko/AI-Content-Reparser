import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const customerId = (profile as { stripe_customer_id?: string } | null)?.stripe_customer_id;
  if (!customerId) return NextResponse.json({ invoices: [] });

  const stripe = getStripe();
  const invoiceList = await stripe.invoices.list({ customer: customerId, limit: 10 });

  const mapped = invoiceList.data.map((inv) => ({
    id: inv.id,
    amount: inv.amount_paid,
    currency: inv.currency,
    status: inv.status,
    date: inv.created,
    pdf: inv.invoice_pdf,
    description: inv.lines?.data?.[0]?.description ?? "Subscription",
  }));

  return NextResponse.json({ invoices: mapped });
}
