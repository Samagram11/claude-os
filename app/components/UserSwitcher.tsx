"use client";

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export const USERS: UserProfile[] = [
  { id: "priya", name: "Priya Sharma", role: "CEO", initials: "PS" },
  { id: "dan", name: "Sarah Chen", role: "Head of Sales", initials: "SC" },
];

interface UserSwitcherProps {
  activeUser: string;
  onSwitch: (userId: string) => void;
}

export default function UserSwitcher({ activeUser, onSwitch }: UserSwitcherProps) {
  return (
    <div className="flex items-center gap-1">
      {USERS.map((user) => {
        const isActive = activeUser === user.id;
        return (
          <button
            key={user.id}
            onClick={() => onSwitch(user.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-body-sm transition-colors ${
              isActive
                ? "bg-elevated text-ink"
                : "text-ink-muted hover:bg-hover"
            }`}
            style={{ transition: "all 120ms cubic-bezier(0.2, 0, 0, 1)" }}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${
                isActive ? "bg-accent text-white" : "bg-elevated text-ink-muted"
              }`}
            >
              {user.initials}
            </div>
            <div className="text-left">
              <span className="block leading-none">{user.name}</span>
              <span className="text-[10px] text-ink-dim leading-none">{user.role}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
