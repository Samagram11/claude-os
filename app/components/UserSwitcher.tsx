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
  { id: "lin", name: "Lin Zhang", role: "Head of Product", initials: "LZ" },
];

// Maps person names to initials for dynamic override
function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase();
}

interface UserSwitcherProps {
  activeUser: string;
  onSwitch: (userId: string) => void;
  actionOwner?: string | null;
}

// The "dan" slot doubles as the action owner view
function isDanSlotActive(activeUser: string): boolean {
  return activeUser === "dan" || activeUser === "action-owner";
}

export default function UserSwitcher({ activeUser, onSwitch, actionOwner }: UserSwitcherProps) {
  return (
    <div className="flex items-center gap-1">
      {USERS.map((user) => {
        const isActive = user.id === "dan" ? isDanSlotActive(activeUser) : activeUser === user.id;

        // Dynamic name override for the action owner slot
        const displayName = (user.id === "dan" && actionOwner) ? actionOwner : user.name;
        const displayInitials = (user.id === "dan" && actionOwner) ? getInitials(actionOwner) : user.initials;
        const displayRole = (user.id === "dan" && actionOwner && actionOwner !== "Sarah Chen") ? "Action Owner" : user.role;

        return (
          <button
            key={user.id}
            onClick={() => onSwitch(user.id === "dan" && actionOwner ? "action-owner" : user.id)}
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
              {displayInitials}
            </div>
            <div className="text-left">
              <span className="block leading-none">{displayName}</span>
              <span className="text-[10px] text-ink-dim leading-none">{displayRole}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
