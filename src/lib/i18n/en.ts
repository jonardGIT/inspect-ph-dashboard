export interface Locale {
  nav: {
    inspections: string;
    businesses: string;
    reports: string;
    auditLog: string;
    privacyRequests: string;
    payments: string;
    users: string;
    notifications: string;
  };
  auth: {
    signIn: string;
    signOut: string;
    email: string;
    password: string;
    forgotPassword: string;
    loginButton: string;
  };
  common: {
    save: string;
    cancel: string;
    submit: string;
    loading: string;
    error: string;
    noData: string;
    search: string;
    filter: string;
    actions: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  inspections: {
    title: string;
    schedule: string;
    newInspection: string;
    assignInspector: string;
    status: {
      PENDING: string;
      SCHEDULED: string;
      IN_PROGRESS: string;
      COMPLETED: string;
      CANCELED: string;
    };
  };
  privacy: {
    title: string;
    requestTitle: string;
    types: {
      ACCESS: string;
      CORRECTION: string;
      ERASURE: string;
    };
    statuses: {
      PENDING: string;
      IN_REVIEW: string;
      COMPLETED: string;
      REJECTED: string;
      WITHDRAWN: string;
    };
    submitSuccess: string;
    emailLabel: string;
    descriptionLabel: string;
  };
}

export const en: Locale = {
  nav: {
    inspections: "Inspections",
    businesses: "Businesses",
    reports: "Reports",
    auditLog: "Audit Log",
    privacyRequests: "Privacy Requests",
    payments: "Payments",
    users: "Users",
    notifications: "Notifications",
  },
  auth: {
    signIn: "Sign In",
    signOut: "Sign Out",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot password?",
    loginButton: "Log in",
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    submit: "Submit",
    loading: "Loading…",
    error: "An error occurred",
    noData: "No data",
    search: "Search",
    filter: "Filter",
    actions: "Actions",
    status: "Status",
    createdAt: "Created",
    updatedAt: "Updated",
  },
  inspections: {
    title: "Inspections",
    schedule: "Schedule",
    newInspection: "New Inspection",
    assignInspector: "Assign Inspector",
    status: {
      PENDING: "Pending",
      SCHEDULED: "Scheduled",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
      CANCELED: "Canceled",
    },
  },
  privacy: {
    title: "Data Privacy",
    requestTitle: "Data Subject Request",
    types: {
      ACCESS: "Access my data",
      CORRECTION: "Correct my data",
      ERASURE: "Erase my data",
    },
    statuses: {
      PENDING: "Pending",
      IN_REVIEW: "In Review",
      COMPLETED: "Completed",
      REJECTED: "Rejected",
      WITHDRAWN: "Withdrawn",
    },
    submitSuccess: "Your request has been submitted.",
    emailLabel: "Email address",
    descriptionLabel: "Description",
  },
};
