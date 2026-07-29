const ASAAS_API_URL =
  process.env.ASAAS_ENV === "production"
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/api/v3";

type AsaasCustomer = {
  id: string;
};

type AsaasSubscription = {
  id: string;
  invoiceUrl?: string;
  status?: string;
};

async function asaasFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    throw new Error("ASAAS_API_KEY não configurada.");
  }

  const response = await fetch(`${ASAAS_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Asaas API error: ${response.status} ${body}`);
  }

  return response.json() as Promise<T>;
}

export async function createAsaasCustomer(params: {
  name: string;
  email: string;
  phone?: string;
  externalReference: string;
}) {
  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: params.name,
      email: params.email,
      phone: params.phone,
      externalReference: params.externalReference,
      notificationDisabled: false,
    }),
  });
}

export async function createAsaasSubscription(params: {
  customerId: string;
  value: number;
  nextDueDate: string;
  externalReference: string;
}) {
  return asaasFetch<AsaasSubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      customer: params.customerId,
      billingType: "UNDEFINED",
      value: params.value,
      nextDueDate: params.nextDueDate,
      cycle: "MONTHLY",
      description: "Assinatura Agendei",
      externalReference: params.externalReference,
    }),
  });
}

export async function cancelAsaasSubscription(subscriptionId: string) {
  return asaasFetch<AsaasSubscription>(
    `/subscriptions/${subscriptionId}`,
    { method: "DELETE" },
  );
}

export function getSubscriptionPrice(): number {
  return Number(process.env.SUBSCRIPTION_PRICE ?? "79");
}

export function getTrialDays(): number {
  return Number(process.env.TRIAL_DAYS ?? "14");
}
