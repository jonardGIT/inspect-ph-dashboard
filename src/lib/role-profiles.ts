import type { User } from "@shared/types/api";

type RoleProfile = User["roleProfile"];

const ROLE_FALLBACK_PROFILES: Record<User["role"], RoleProfile> = {
  admin: {
    accessScope: "global",
    label: "Platform Admin",
    permissions: [
      "business:create",
      "business:read",
      "business:update",
      "permit:create",
      "permit:read",
      "permit:update",
      "inspection:assign",
      "inspection:create",
      "inspection:read",
      "inspection:update",
      "certificate:create",
      "certificate:read",
      "lgu:manage",
      "office:manage",
      "user:manage",
      "module:manage",
      "report:read",
      "payment:read",
    ],
  },
  business_owner: {
    accessScope: "own",
    label: "Business Owner",
    permissions: [
      "permit:read:own",
      "finding:read:own",
      "certificate:read:own",
      "payment:read:own",
      "reinspection:request",
    ],
  },
  citizen: {
    accessScope: "own",
    label: "Citizen",
    permissions: ["issue_report:create", "issue_report:read:own"],
  },
  inspector: {
    accessScope: "assigned",
    label: "Field Inspector",
    permissions: [
      "business:read",
      "permit:read",
      "inspection:read",
      "inspection:update:assigned",
    ],
  },
  lgu_admin: {
    accessScope: "lgu",
    label: "LGU Administrator",
    permissions: [
      "business:create",
      "business:read",
      "business:update",
      "permit:create",
      "permit:read",
      "permit:update",
      "inspection:assign",
      "inspection:create",
      "inspection:read",
      "inspection:update",
      "certificate:create",
      "certificate:read",
      "office:manage",
      "user:manage",
      "report:read",
      "payment:read",
    ],
  },
  office_clerk: {
    accessScope: "office",
    label: "Office Clerk",
    permissions: [
      "business:create",
      "business:read",
      "permit:create",
      "permit:read",
      "inspection:create",
      "inspection:read",
      "payment:read",
    ],
  },
  office_supervisor: {
    accessScope: "office",
    label: "Office Supervisor",
    permissions: [
      "business:read",
      "permit:read",
      "permit:update",
      "inspection:assign",
      "inspection:create",
      "inspection:read",
      "inspection:update",
      "certificate:create",
      "certificate:read",
      "report:read",
      "payment:read",
    ],
  },
};

export function getRoleProfile(
  user:
    | Pick<User, "role" | "roleProfile">
    | { role?: User["role"]; roleProfile?: User["roleProfile"] }
    | null
    | undefined,
): RoleProfile {
  if (user?.role) {
    const fallback = ROLE_FALLBACK_PROFILES[user.role];

    if (!user.roleProfile) {
      return fallback;
    }

    return {
      accessScope: user.roleProfile.accessScope ?? fallback.accessScope,
      label: user.roleProfile.label ?? fallback.label,
      permissions:
        Array.isArray(user.roleProfile.permissions) &&
        user.roleProfile.permissions.length > 0
          ? user.roleProfile.permissions
          : fallback.permissions,
    };
  }

  return {
    accessScope: "assigned",
    label: "Unknown role",
    permissions: [],
  };
}

export function normalizeUser<T extends { user: User }>(session: T): T {
  return {
    ...session,
    user: {
      ...session.user,
      officeIds: Array.isArray(session.user.officeIds)
        ? session.user.officeIds
        : [],
      roleProfile: getRoleProfile(session.user),
    },
  };
}
