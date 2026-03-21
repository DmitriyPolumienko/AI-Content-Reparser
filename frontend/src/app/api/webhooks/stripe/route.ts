import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}

// Use the service-role key for webhook operations (bypass RLS)
function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Plan → initial chars balance provisioning
const PLAN_CHARS: Record<string, number> = {
  price_pro_placeholder: 500_000,
  price_enterprise_placeholder: 99_999_999,
};

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = getAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = (session.client_reference_id ?? session.metadata?.supabase_user_id) as string | null;
      if (!userId) break;

      const subscriptionId = session.subscription as string | null;
      const customerId = session.customer as string | null;

      // Determine chars grant from the first line item's price
      let charsGrant = 100_000; // sensible default
      if (session.line_items?.data?.[0]?.price?.id) {
        charsGrant = PLAN_CHARS[session.line_items.data[0].price.id] ?? charsGrant;
      }

      await supabase.from("users").update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_status: "active",
        chars_balance: charsGrant,
      }).eq("id", userId);

      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: users } = await supabase
        .from("users")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .limit(1);

      if (!users?.length) break;
      const userId = users[0].id as string;

      const status = subscription.status as string;
      const normalizedStatus = ["active", "canceled", "past_due"].includes(status)
        ? status
        : "canceled";

      await supabase.from("users").update({
        stripe_subscription_id: subscription.id,
        subscription_status: normalizedStatus,
      }).eq("id", userId);

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: users } = await supabase
        .from("users")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .limit(1);

      if (!users?.length) break;
      const userId = users[0].id as string;

      // Downgrade to free: reset plan, clear balance
      await supabase.from("users").update({
        stripe_subscription_id: null,
        subscription_status: "canceled",
        plan: "free",
        chars_balance: 0,
      }).eq("id", userId);

      break;
    }

    default:
      // Unhandled event type — acknowledged without action
      break;
  }

  return NextResponse.json({ received: true });
}
