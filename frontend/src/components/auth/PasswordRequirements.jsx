export default function PasswordRequirements() {
  return (
    <div className="mt-4 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
      <p className="text-xs font-medium text-zinc-600 mb-2">
        Password must contain:
      </p>
      <ul className="text-xs text-zinc-500 space-y-1">
        <li>At least 8 characters</li>
        <li>One uppercase letter (A-Z)</li>
        <li>One lowercase letter (a-z)</li>
        <li>One number (0-9)</li>
      </ul>
    </div>
  );
}
