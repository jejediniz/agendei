import { Suspense } from "react";
import { CustomerRegisterForm } from "@/components/auth/customer-register-form";

export default function CadastroClientePage() {
  return (
    <Suspense>
      <CustomerRegisterForm />
    </Suspense>
  );
}
