import { useStytch } from "@stytch/react";
import { FiCpu } from "react-icons/fi";

export default function Header() {
  const stytch = useStytch();

  const handleLogout = async () => {
    await stytch.session.revoke();
  };

  return (
    <header className="bg-white border-b border-zinc-200">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
            <FiCpu size={20} />
          </div>
          <span className="font-semibold text-zinc-900">AI Memory Hub</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
