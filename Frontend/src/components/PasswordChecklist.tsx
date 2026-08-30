import { Check, X } from "lucide-react";
import { passwordRules } from "@/lib/passwordPolicy";

export function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="space-y-1 pt-1">
      {passwordRules.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-2 text-xs ${passed ? "text-green-500" : "text-destructive"}`}
          >
            {passed ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
