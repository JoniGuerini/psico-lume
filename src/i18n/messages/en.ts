import type { Messages } from "@/i18n/types"

export const en = {
  nav: {
    brand: "Lume",
    groups: {
      geral: "General",
      atendimento: "Sessions",
      financeiro: "Finance",
      gestao: "Management",
    },
    pages: {
      inicio: "Home",
      caixaEntrada: "Inbox",
      agenda: "Calendar",
      pacientes: "Patients",
      financeiro: "Finance",
      aReceber: "Receivables",
      relatorios: "Reports",
      notificacoes: "Notifications",
      dados: "Data",
      roteiro: "Roadmap",
    },
    subtitles: {
      inicio: "Daily dashboard",
      caixaEntrada: "Emails",
      agenda: "Session calendar",
      pacientes: "List and profiles",
      financeiro: "Revenue and overdue accounts",
      aReceber: "Completed sessions awaiting payment",
      notificacoes: "Clinic alerts",
      relatorios: "Attendance and revenue by modality",
      dados: "Spreadsheet view of clinic data",
      roteiro: "Product progress",
    },
    keywords: {
      inicio: "home dashboard start overview",
      caixaEntrada: "inbox email messages mail",
      agenda: "calendar schedule sessions appointments",
      pacientes: "patients list profiles registration",
      financeiro: "finance revenue payments overdue",
      aReceber: "receivables unpaid pending billing open",
      notificacoes: "notifications alerts warnings",
      relatorios: "reports attendance presence modality rate",
      dados: "data spreadsheet table export xlsx",
      roteiro: "roadmap progress version plan",
    },
  },
  common: {
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    delete: "Delete",
    edit: "Edit",
    confirm: "Confirm",
    back: "Back",
    or: "or",
    all: "All",
    none: "None",
    loading: "Loading…",
    clearSearch: "Clear search",
    toggleSidebar: "Toggle sidebar",
    sidebarTitle: "Sidebar",
    sidebarDescription: "Main app navigation.",
    globalSearch: "Global search",
    noResults: "No results found.",
    newPatient: "New patient",
    account: "Account",
    signOut: "Sign out",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This week",
    older: "Older",
    now: "now",
    minutesAgo: "{{count}} min ago",
    hoursAgo: "{{count}} h ago",
    daysAgo: "{{count}} d ago",
    yes: "Yes",
    no: "No",
  },
  ui: {
    datePicker: {
      selectDate: "Select date",
      clearDate: "Clear date",
      prevMonth: "Previous month",
      nextMonth: "Next month",
      selectMonth: "Month",
      selectYear: "Year",
    },
    timePicker: {
      selectTime: "Select time",
      title: "Time",
      hour: "Hour",
      minute: "Minute",
      done: "Done",
    },
  },
  login: {
    heroTagline: "Your practice in focus—from scheduling to follow-up.",
    welcomeBack: "Welcome back",
    subtitle: "Sign in to access your dashboard.",
    email: "Email",
    password: "Password",
    emailPlaceholder: "you@example.com",
    forgotPassword: "Forgot password",
    rememberMe: "Keep me signed in",
    signIn: "Sign in",
    signingIn: "Signing in...",
    signInWithGoogle: "Sign in with Google",
    continueAsGuest: "Continue as guest",
    enterAs: "Enter as {{name}}",
    showPassword: "Show password",
    hidePassword: "Hide password",
    exploreHint: "Want to explore with sample data?",
    exploreDetail: "Use the login above or Google.",
    guest: {
      title: "Guest mode",
      description:
        "Use Lume locally in this browser. Your patients, calendar, and records stay here—no cloud account.",
      nameLabel: "What should we call you?",
      namePlaceholder: "Your name",
      start: "Get started",
      starting: "Signing in...",
    },
  },
  account: {
    title: "Account",
    subtitle: "Manage your information and preferences.",
    sections: {
      perfil: {
        label: "Profile",
        description: "Name, email, and photo.",
      },
      seguranca: {
        label: "Security",
        description: "Password, sign-in, and connected devices.",
      },
      notificacoes: {
        label: "Notifications",
        description: "Choose what and how you get notified.",
      },
      preferencias: {
        label: "Preferences",
        description: "Language and other general app options.",
      },
      aparencia: {
        label: "Appearance",
        description: "Customize the app look and feel.",
      },
      backup: {
        label: "Backup",
        description: "Download or restore local data.",
      },
      excluirConta: {
        label: "Delete account",
        description: "End guest account in this browser.",
      },
    },
    profile: {
      heading: "Profile",
      description: "Your account details — visible only to you in Lume.",
      changePhoto: "Change photo",
      fullName: "Full name",
      namePlaceholder: "Your name",
      guestNameHint:
        "At least 2 characters. Updates your name in the app and on the sign-in screen.",
      loginEmail: "Login email",
      emailPlaceholder: "you@example.com",
      saveChanges: "Save changes",
      saved: "Changes saved",
      savedDescription:
        "Your name was updated in this browser and on the sign-in screen.",
    },
    deleteGuest: {
      heading: "Delete account",
      description:
        "End your guest account in this browser. This removes your profile and everything you added.",
      whatWillBeRemoved: "What will be removed",
      whatWillBeRemovedDescription:
        "The account for {{name}} and all its data: patients, calendar, records, notifications, and locally saved preferences.",
      dangerZone: "Danger zone",
      dangerZoneDescription:
        "This action is permanent and cannot be undone. You will be signed out and need to create a new guest account to use Lume again in this browser.",
      deleteAccount: "Delete account",
      confirmTitle: "Delete guest account?",
      confirmDescription:
        "The account for {{name}} and all associated data will be removed from this browser. You will need to create a new guest account to use Lume here again.",
    },
    backup: {
      heading: "Local backup",
      description:
        "Save a JSON file with your clinical data and preferences, or restore a previous backup.",
      warning:
        "The file contains sensitive clinical data. Store it safely and do not share it.",
      downloadTitle: "Download backup",
      downloadDescription:
        "Creates a .json file with patients, calendar, records, and preferences.",
      downloadButton: "Download backup",
      restoreTitle: "Restore backup",
      restoreDescription:
        "Select a .json file generated by Lume to recover your data.",
      restoreButton: "Choose file",
      modeTitle: "How should we restore?",
      modeDescription:
        "Choose whether the backup should replace everything or be combined with current data.",
      modeReplaceTitle: "Replace everything",
      modeReplaceDescription:
        "Removes current data in this browser and loads only the backup contents.",
      modeMergeTitle: "Combine",
      modeMergeDescription:
        "Keeps current data and adds new items from the backup. If there are conflicts, you decide.",
      continue: "Continue",
      replaceConfirmTitle: "Replace current data?",
      replaceConfirmDescription:
        "All current patients, sessions, records, and notifications will be replaced by the backup. This cannot be undone.",
      replaceConfirm: "Replace and restore",
      conflictTitle: "Conflicts found",
      conflictDescription:
        "The backup has {{total}} item(s) with the same ID as current data ({{patients}} patients, {{events}} sessions, {{sessionNotes}} records). Continuing overwrites those items with the backup version.",
      conflictConfirm: "Continue and overwrite",
      downloaded: "Backup downloaded",
      downloadedDescription: "File saved on this device.",
      restored: "Backup restored",
      restoredReplaceDescription: "Local data was replaced by the backup.",
      restoredMergeDescription: "Backup data was combined with current data.",
      errors: {
        invalidJson: "The file is not valid JSON.",
        invalidStructure: "Invalid backup structure.",
        invalidKind: "This file is not a Psico Lume backup.",
        invalidSchemaVersion: "Invalid backup format version.",
        unsupportedSchemaVersion:
          "This backup is from a newer Lume version. Update the app and try again.",
        invalidAppVersion: "Invalid app version in the backup.",
        invalidExportedAt: "Invalid export date.",
        invalidProfile: "Invalid profile in the backup.",
        invalidClinic: "Invalid clinical data in the backup.",
        invalidPatients: "Invalid patient list in the backup.",
        invalidEvents: "Invalid session list in the backup.",
        invalidSessionNotes: "Invalid records list in the backup.",
        invalidNotifications: "Invalid notifications list in the backup.",
        invalidPreferences: "Invalid preferences in the backup.",
        duplicatePatientIds: "The backup has duplicate patient IDs.",
        duplicateEventIds: "The backup has duplicate session IDs.",
        duplicateSessionNoteIds: "The backup has duplicate record IDs.",
        duplicateNotificationIds: "The backup has duplicate notification IDs.",
        invalidFileType: "Please select a .json file.",
        fileTooLarge: "The file is too large (max 8 MB).",
        readFailed: "Could not read the file.",
        generic: "Could not restore the backup.",
      },
    },
    security: {
      heading: "Security",
      description: "Keep your account protected.",
      changePassword: "Change password",
      changePasswordDescription:
        "Use a strong, unique password you do not use on other sites.",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmNewPassword: "Confirm new password",
      updatePassword: "Update password",
      twoFactor: "Two-factor authentication",
      twoFactorDescription: "Add an extra layer of protection when signing in.",
      connectedDevices: "Connected devices",
      connectedDevicesDescription: "Sessions currently connected to your account.",
      currentDevice: "This device",
      endSession: "Sign out",
    },
    notifications: {
      heading: "Notifications",
      description: "Choose what you want to be notified about.",
      clinical: "Clinical & calendar",
      patients: "Patients",
      messages: "Messages",
      financial: "Finance & summaries",
      system: "System",
      pendingSession: {
        title: "Pending session status",
        description:
          "When a session passed and is still scheduled, or several sessions this week remain unclosed.",
      },
      sessionReminder: {
        title: "Today's sessions",
        description: "Sessions scheduled for today that still need follow-up.",
      },
      pendingEvolution: {
        title: "Pending clinical note",
        description: "Completed session without a chart entry.",
      },
      waitingList: {
        title: "Waitlist",
        description: "Patients waiting for a slot or return to sessions.",
      },
      pausedPatient: {
        title: "Patient on pause",
        description: "Paused profiles that may need a review.",
      },
      inboxUnread: {
        title: "Unread emails",
        description: "New messages in the integrated inbox.",
      },
      overduePayment: {
        title: "Overdue payment",
        description: "Completed sessions with open payments.",
      },
      unpaidWeek: {
        title: "Weekly reconciliation",
        description:
          "Several completed sessions this week not yet reflected in finance.",
      },
      weeklySummary: {
        title: "Weekly summary",
        description: "Week overview with calendar and finance pending items.",
      },
      guestWelcome: {
        title: "Welcome to Lume",
        description: "Initial notice about guest mode and local data.",
      },
    },
    preferences: {
      heading: "Preferences",
      description: "Adjust language and other general Lume options.",
      language: {
        title: "Language",
        description: "Choose the interface language.",
        ptBR: "Português (Brasil)",
        en: "English",
      },
      restartTour: {
        title: "Welcome tour",
        description: "Review the main features of the interface.",
        button: "Replay tour",
      },
    },
    appearance: {
      heading: "Appearance",
      description: "Customize the app look and feel.",
      theme: {
        title: "App theme",
        description: "Shell, background, and accent colors across the app.",
      },
      density: {
        title: "Density",
        description: "Adjust spacing in lists and tables.",
      },
      toastPosition: {
        title: "Toast position",
        description:
          'Choose which corner shows quick confirmations like "Changes saved".',
      },
    },
    themes: {
      refugio: {
        label: "Refúgio",
        description: "Cool slate with terracotta accent — default.",
      },
      lume: {
        label: "Lume",
        description: "Warm sand, navy, and mint — classic identity.",
      },
      horizonte: {
        label: "Horizonte",
        description: "Warm linen, deep ocean, and sunset glow.",
      },
      grafite: {
        label: "Grafite",
        description: "Warm blacks and grays with a discreet copper accent.",
      },
    },
    density: {
      comfortable: {
        label: "Comfortable",
        description: "More space between items.",
      },
      compact: {
        label: "Compact",
        description: "Show more content on screen.",
      },
    },
    toastUpdated: "Toast position updated",
    toastUpdatedDescription:
      "Quick confirmations will appear in the chosen corner.",
    toastPositions: {
      topLeft: {
        label: "Top left",
        description: "Toasts in the top-left corner.",
      },
      topRight: {
        label: "Top right",
        description: "Toasts in the top-right corner.",
      },
      bottomLeft: {
        label: "Bottom left",
        description: "Toasts in the bottom-left corner.",
      },
      bottomRight: {
        label: "Bottom right",
        description: "Default — bottom-right corner.",
      },
    },
  },
  search: {
    title: "Global search",
    description: "Find patients, sessions, emails, and notifications in one place.",
    placeholder: "Search patients, sessions, emails...",
    empty: "No results found.",
    navigate: "navigate",
    open: "open",
    close: "close",
    groups: {
      navigation: "Navigation",
      patients: "Patients",
      sessions: "Sessions",
      emails: "Emails",
      notifications: "Notifications",
    },
    quickActions: {
      newPatient: {
        title: "New patient",
        subtitle: "Register in the clinic",
      },
      newSession: {
        title: "New session",
        subtitle: "Schedule on the calendar",
      },
    },
  },
  exportSheets: {
    sheets: {
      summary: "Summary",
      patients: "Patients",
      schedules: "Schedules",
      agenda: "Calendar",
      records: "Records",
      financePatients: "Fin. Patients",
      financeSessions: "Fin. Sessions",
      reportHistory: "Rep. history",
      reportCurrentMonth: "Rep. current month",
    },
    common: {
      automatic: "Automatic",
      overdueManualOverdue: "Yes (overdue)",
      overdueManualCurrent: "Yes (current)",
    },
    columns: {
      id: "ID",
      name: "Name",
      cpf: "CPF",
      email: "Email",
      phone: "Phone",
      status: "Status",
      modality: "Modality",
      complaint: "Chief complaint",
      sessionPrice: "Session fee (R$)",
      sessionDay: "Session day",
      sessionTime: "Session time",
      durationMin: "Duration (min)",
      nextSession: "Next session",
      sessionsCompleted: "Sessions completed",
      patientSince: "Patient since",
      frequency: "Frequency",
      overdue: "Overdue",
      overdueOverride: "Overdue override",
      birthDate: "Date of birth",
      gender: "Gender",
      cep: "ZIP code",
      street: "Street",
      number: "Number",
      complement: "Apt / suite",
      neighborhood: "Neighborhood",
      city: "City",
      state: "State",
      emergencyContact: "Emergency contact",
      emergencyPhone: "Emergency phone",
      contactRelation: "Relationship",
      patientType: "Patient type",
      therapyStart: "Therapy start",
      referral: "Referral",
      notes: "Notes",
      patientId: "Patient ID",
      patient: "Patient",
      index: "#",
      weekday: "Day",
      time: "Time",
      sessionId: "Session ID",
      date: "Date",
      start: "Start",
      end: "End",
      billable: "Billable",
      amount: "Amount (R$)",
      paid: "Paid",
      notice: "Advance notice",
      originalDate: "Original date",
      originalStart: "Original start",
      originalEnd: "Original end",
      sessionNumber: "Session #",
      summary: "Summary",
      evolution: "Progress",
      plan: "Plan",
      tags: "Tags",
      mood: "Mood",
      paidBillableSessions: "Paid billable sessions",
      pendingBillableSessions: "Pending billable sessions",
      receivedRevenue: "Revenue received (R$)",
      pendingRevenue: "Outstanding (R$)",
      overdueRevenue: "Overdue (R$)",
      monthlyForecastRevenue: "Forecast revenue/month (R$)",
      timeRange: "Time",
      overduePayment: "Overdue",
      metric: "Metric",
      value: "Value",
      month: "Month",
      attendanceRate: "Attendance rate (%)",
      completed: "Completed",
      absences: "Absences",
      group: "Group",
      item: "Item",
      value1: "Value 1",
      value2: "Value 2",
      value3: "Value 3",
      value4: "Value 4",
    },
    summary: {
      exportedAt: "Exported at",
      totalPatients: "Total patients",
      activePatients: "Active patients",
      calendarSessions: "Calendar sessions",
      completedCalendarSessions: "Completed sessions (calendar)",
      recordNotes: "Record notes",
      attendanceRate: "Attendance rate ({{month}})",
      billableRevenue: "Billable revenue ({{month}})",
      receivedRevenue: "Revenue received ({{month}})",
      pendingRevenue: "Outstanding ({{month}})",
      monthlyForecast: "Forecast revenue/month (active)",
      unpaidSessionsTotal: "Sessions to receive (total)",
      overduePatients: "Overdue patients",
      overdueAmount: "Overdue amount",
    },
    reportGroups: {
      attendance: "Attendance",
      modality: "Modality",
      outcome: "Outcome",
      billableRevenue: "Billable revenue",
    },
  },
  export: {
    clinicData: "Clinic data",
    viewSheet: "View spreadsheet",
    downloadXlsx: "Download XLSX",
    sheetsView: {
      title: "Spreadsheet view",
      empty: "No records",
      rows_one: "{{count}} row",
      rows_other: "{{count}} rows",
      subtitle: "same tabs and colors as the XLSX export",
      fullscreen: "Full screen",
      exitFullscreen: "Exit full screen",
    },
  },
  enums: {
    sessionStatus: {
      agendada: "Scheduled",
      realizada: "Completed",
      faltou: "No-show",
      remarcada: "Rescheduled",
      cancelada: "Cancelled",
    },
    patientStatus: {
      ativo: "Active",
      "em-pausa": "On pause",
      "lista-espera": "Waitlist",
      alta: "Discharged",
    },
    modality: {
      presencial: "In-person",
      online: "Remote",
      hibrido: "Hybrid",
    },
    sessionFrequency: {
      "1x-mes": "Once a month",
      "2x-mes": "Twice a month",
      "3x-mes": "3 times a month",
      "4x-mes": "4 times a month",
    },
    mood: {
      anxious: "Anxious",
      stable: "Stable",
      better: "Better",
      sad: "Sad",
      hopeful: "Hopeful",
      exhausted: "Exhausted",
      emotional: "Emotional",
      reflective: "Reflective",
      hypervigilant: "Hypervigilant",
    },
  },
  empty: {
    noPatients: {
      title: "No patients yet",
      description: "Register your first patient to start clinical follow-up.",
    },
  },
  tour: {
    stepCounter: "Step {{current}} of {{total}}",
    skip: "Skip tour",
    next: "Next",
    finish: "Got it",
    steps: {
      homeNewPatient: {
        title: "Start with registration",
        description:
          "Register your first patient to schedule sessions on the calendar and track finances.",
      },
      homeStats: {
        title: "Daily overview",
        description:
          "Track patients, weekly sessions, revenue, and overdue payments at a glance.",
      },
      navPacientes: {
        title: "Patients",
        description:
          "Register, search, and manage profiles, records, and session history.",
      },
      navAgenda: {
        title: "Calendar",
        description:
          "Schedule sessions, browse the calendar, and track each session status.",
      },
      navAReceber: {
        title: "Receivables",
        description:
          "View billable sessions, mark payments, and track pending and overdue items.",
      },
      navFinanceiro: {
        title: "Finance",
        description:
          "Revenue charts and a consolidated view of financial performance.",
      },
      headerSearch: {
        title: "Global search",
        description:
          "Find patients, sessions, emails, and quick actions across the app.",
      },
      headerExport: {
        title: "Export data",
        description:
          "Download the Excel spreadsheet directly from the Data page.",
      },
      headerNotifications: {
        title: "Notifications",
        description:
          "Alerts for sessions, payments, and important messages.",
      },
      navAccount: {
        title: "Your account",
        description:
          "Manage profile and preferences. In guest mode, data is saved only in this browser.",
      },
    },
  },
  home: {
    greeting: {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    },
    stats: {
      totalPatients: "Total patients",
      weekSessions: "Sessions this week",
      weekRevenue: "Revenue this week",
      overduePayments: "Overdue payments",
      activeHint: "{{count}} active",
      scheduledHint: "{{count}} scheduled",
      perSession: "/session",
      sessionsToday: "{{count}} session today",
      sessionsToday_plural: "{{count}} sessions today",
      inTreatmentHint: "{{count}} in treatment",
      recurringSessions: "Recurring sessions",
      forecast: "Forecast",
      overdueSession: "{{count}} session",
      overdueSessions: "{{count}} sessions",
    },
    sessionsTodayLabel_one: "session today",
    sessionsTodayLabel_other: "sessions today",
    agendaSubtitle: "Your sessions on {{day}}",
    noPatientsDescription:
      "Register your first patient to start scheduling sessions.",
    walkInSession: "Walk-in session",
    todayAgenda: "Today's schedule",
    viewAgenda: "View calendar",
    viewWeek: "View week",
    viewReceivables: "View receivables",
    noPatientsTitle: "No patients yet",
    freeDayTitle: "Free day",
    freeDayDescription: "No sessions scheduled for today.",
    clickToEdit: "Click to edit",
  },
  inbox: {
    unread: "{{count}} unread",
    tabs: {
      all: "All",
      unread: "Unread",
    },
    searchPlaceholder: "Search emails...",
    noEmails: "No emails available.",
    noResults: "No emails found.",
    archive: "Archive",
    delete: "Delete",
    favorite: "Favorite",
    forward: "Forward",
    reply: "Reply",
  },
  notifications: {
    title: "Notifications",
    subtitle: "Track mentions, messages, and account updates.",
    new: "{{count}} new",
    unreadBadge: "{{count}} unread",
    markAllRead: "Mark all as read",
    viewAll: "View all",
    filters: {
      all: "All",
      unread: "Unread",
      sessions: "Sessions",
      patients: "Patients",
      messages: "Messages",
      payments: "Payments",
    },
    empty: "Nothing here",
    emptyFilter: "You have no notifications in this filter.",
    markRead: "Mark as read",
    remove: "Remove notification",
    markAllShort: "Mark all",
    emptyAll: "No notifications.",
    emptyUnread: "You're all caught up! No unread notifications.",
    viewAllNotifications: "View all notifications",
  },
  alerts: {
    pendingStatus: {
      title: "Pending status — {{name}}",
      description:
        "The session on {{sessionDay}} at {{time}} has passed and is still marked Scheduled.",
    },
    unclosedWeek: {
      title: "{{count}} sessions this week without closure",
      description:
        "Update attendance status on the calendar to keep history up to date.",
    },
    todaySession: {
      title: "Session today — {{name}}",
      description: "Session at {{time}}. Mark the status after the session.",
    },
    overduePayment: {
      title: "Overdue payment — {{name}}",
      description:
        "{{count}} open session(s) · {{total}}. Check Receivables.",
    },
    pendingEvolution: {
      title: "Pending evolution — {{name}}",
      description:
        "Session on {{sessionDay}} completed but not yet recorded in the chart.",
    },
    unpaidWeek: {
      title: "Weekly reconciliation",
      description:
        "{{count}} completed sessions this week are not yet reflected in finance · {{total}}.",
    },
    waitlist: {
      title: "Waitlist — {{name}}",
      description:
        "Patient waiting for a slot. Consider scheduling the initial interview.",
    },
    pausedPatient: {
      title: "Patient on pause — {{name}}",
      description:
        "Marked on pause. Review return, discharge, or keeping this status.",
    },
    inboxUnread: {
      title: "Inbox — {{count}} unread email(s)",
      description: "Messages waiting to be read in the inbox.",
    },
    weeklySummary: {
      title: "Weekly summary available",
      description:
        "Overview of sessions, pending statuses, and financial alerts for the week.",
    },
  },
  receivables: {
    title: "Receivables",
    subtitle:
      "Completed sessions not yet paid — mark as received when payment is confirmed.",
    markVisiblePaid: "Mark visible as paid",
    stats: {
      openSessions: "Open sessions",
      openSessionsHint: "Completed without payment",
      totalDue: "Total due",
      totalDueHint: "Consolidated amount",
      overdue: "Overdue",
      overdueHint: "After session month",
      overdueAmount: "Overdue amount",
      prioritize: "Prioritize collection",
      noOldPending: "No old pending items",
    },
    tabs: {
      all: "All",
      overdue: "Overdue",
    },
    listed_one: "{{count}} session listed",
    listed_other: "{{count}} sessions listed",
    empty: {
      overdueTitle: "No overdue sessions",
      overdueDescription: "Nothing pending for more than a week.",
      allTitle: "All caught up",
      allDescription:
        "When a session is completed and unpaid, it appears in this list.",
    },
    badges: {
      overdue: "Overdue",
      pending: "Pending",
    },
    doneToday: "Completed today",
    daysAgo_one: "1 day ago",
    daysAgo_other: "{{count}} days ago",
    profile: "Profile",
    markPaid: "Mark paid",
    emptyPatientsDescription:
      "Register patients and log completed sessions to track payments here.",
  },
  finance: {
    title: "Finance",
    subtitle: "Track earnings, payments, and clinic indicators.",
    emptyDescription:
      "Register your first patient to start tracking revenue and financial indicators.",
    range: {
      months3: "Last 3 months",
      months6: "Last 6 months",
      months12: "Last 12 months",
    },
    kpis: {
      monthRevenue: "Monthly revenue",
      billableSessions: "{{count}} billable sessions",
      received: "Received",
      receivedPct: "{{pct}}% of billed",
      pending: "Receivable",
      overdueAmount: "{{amount}} overdue",
      onTrack: "On track",
      avgTicket: "Average ticket",
      forecastSessions: "{{count}} forecast sessions",
    },
    charts: {
      revenueHistory: "Revenue history",
      revenueHistoryHint: "Monthly earnings trend",
      thisMonth: "{{amount}} this month",
      revenueByModality: "Revenue by modality",
      revenueByModalityHint: "Monthly split by session type",
      topPatients: "Revenue by patient",
      topPatientsHint: "Patients with highest accumulated billing",
      sessionsPerSession: "{{count}} sessions · {{price}}/session",
    },
    chartLabels: {
      revenue: "Revenue",
    },
  },
  reports: {
    title: "Reports",
    subtitle: "Attendance, absences, and revenue by modality for the period.",
    subtitleDetail:
      "Attendance and revenue by modality based on past sessions.",
    monthPlaceholder: "Month",
    deltaPoints: "pp",
    trendRange: {
      months3: "3-month trend",
      months6: "6-month trend",
      months12: "12-month trend",
    },
    emptyDescription:
      "Register patients and log sessions to view attendance and revenue reports.",
    range: {
      months3: "Last 3 months",
      months6: "Last 6 months",
      months12: "Last 12 months",
    },
    kpis: {
      attendanceRate: "Attendance rate",
      sessionsOf: "{{done}} of {{total}} sessions",
      noEvaluated: "No evaluated sessions this month",
      completed: "Completed sessions",
      completedHint: "Confirmed attendances",
      absences: "Absences",
      absencesHint: "Recorded no-shows",
      billableRevenue: "Billable revenue",
      billableRevenueHint: "By modality this month",
    },
    charts: {
      attendanceTrend: "Attendance trend",
      attendanceTrendHint:
        "Monthly rate of completed sessions vs completed + absences",
      selectedMonth: "{{rate}} in selected month",
      attendanceByModality: "Attendance by modality",
      attendanceByModalityHint: "Presence rate by session type this month",
      revenueByModality: "Revenue by modality",
      revenueByModalityHint: "Billable sessions by session type this month",
      sessionOutcomes: "Session outcomes",
      sessionOutcomesHint:
        "Status distribution for sessions that already occurred this month",
      outcomeRow: "{{count}} sessions · {{pct}}%",
      tooltipAttendance:
        "{{rate}}% ({{done}} completed · {{missed}} absences)",
      tooltipRate: "{{rate}}% · {{done}} completed · {{missed}} absences",
    },
    chartLabels: {
      attendance: "Attendance",
      rate: "Rate",
      revenue: "Revenue",
    },
    empty: {
      noPastSessions:
        "No past sessions with completed or absence status this month.",
      noBillableRevenue: "No billable revenue recorded this month.",
      noPastSessionsMonth: "No past sessions recorded this month.",
    },
  },
  calendar: {
    previous: "Previous",
    next: "Next",
    today: "Today",
    views: {
      month: "Month",
      week: "Week",
      day: "Day",
    },
    newSession: "New session",
    legend: "Legend",
    weekdays: {
      sun: "Sun",
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
    },
    sessions_one: "{{count}} session",
    sessions_other: "{{count}} sessions",
    sessionSingular: "session",
    sessionPlural: "sessions",
    events_one: "{{count}} session",
    events_other: "{{count}} sessions",
    noEventsDay: "No sessions on this day.",
    clickToEdit: "Click to edit",
    duplicateSessionTitle: "Duplicate session",
    duplicateSessionDescription:
      "You just created a session with the same information (patient, date, and time).",
  },
  patients: {
    title: "Patients",
    subtitle: "Manage patients, care plans, and upcoming sessions.",
    activeBadge: "{{count}} active",
    searchPlaceholder: "Search by name, email, ID, or chief complaint...",
    statusPlaceholder: "Status",
    allStatuses: "All statuses",
    count: "{{count}} patients",
    notFound: "No patients found",
    notFoundHint:
      "Adjust search or status filter, or clear filters to see everyone.",
    clearFilters: "Clear filters",
    columns: {
      patient: "Patient",
      complaint: "Chief complaint",
      modality: "Modality",
      status: "Status",
      nextSession: "Next session",
      price: "Rate",
      sessions: "Sessions",
    },
    actions: {
      viewProfile: "View profile",
      schedule: "Schedule session",
      newNote: "New progress note",
      menu: "Actions",
      menuAria: "Actions for {{name}}",
      viewRecord: "View records",
    },
    profile: {
      back: "Back",
      edit: "Edit",
      scheduleSession: "Schedule session",
      stats: {
        completedSessions: "Completed sessions",
        patientSince: "Patient since",
        sessionPrice: "Session rate",
        nextSession: "Next session",
      },
      tabs: {
        overview: "Overview",
        sessions: "Session history",
        records: "Records",
      },
      sections: {
        personal: "Personal details",
        contact: "Contact",
        address: "Address",
        care: "Care plan",
        schedule: "Schedule",
        financial: "Financial summary",
        danger: "Danger zone",
      },
      fields: {
        fullName: "Full name",
        cpf: "ID / CPF",
        birthDate: "Date of birth",
        gender: "Gender",
        patientType: "Patient type",
        email: "Email",
        phone: "Phone",
        emergencyContact: "Emergency contact",
        emergencyPhone: "Emergency phone",
        relation: "Relationship",
        cep: "Postal code",
        street: "Street",
        number: "Number",
        complement: "Apt / suite",
        neighborhood: "Neighborhood",
        city: "City",
        state: "State",
        complaint: "Chief complaint",
        modality: "Modality",
        therapyStart: "Therapy start",
        referral: "Referral source",
        sessionPrice: "Session rate",
        notes: "Notes",
        frequency: "Frequency",
        sessionDay: "Session day",
        sessionTime: "Time",
        pricePerSession: "Rate per session",
        received: "Received",
        receivable: "Receivable",
        overdueStatus: "Overdue status",
        pendingSessions: "Pending sessions",
      },
      payment: {
        overdue: "Overdue",
        onTrack: "On track",
        auto: "Automatic (by sessions)",
        markOverdue: "Mark overdue",
        markClear: "Mark on track",
        overdueHint: " · overdue",
        markPaid: "Mark paid",
      },
      delete: {
        title: "Delete patient?",
        description:
          "{{name}} and all associated records, calendar, and financial history will be permanently removed.",
        confirm: "Delete patient",
        dangerDescription:
          "Deleting {{name}} permanently removes registration, records, scheduled sessions, and financial data for this patient.",
      },
    },
    sessions: {
      title: "Session history",
      subtitle: "Past sessions and those scheduled through the end of the current month for {{name}}.",
      stats: {
        total: "Total this month",
        completed: "Completed",
        upcoming: "Upcoming",
        absences: "Absences / cancelled",
      },
      listTitle: "Recent and upcoming sessions",
      record_one: "{{count}} record",
      record_other: "{{count}} records",
      emptyTitle: "No sessions on the calendar",
      emptyDescription: "Schedule a session using the button at the top of the profile.",
      newSession: "New session",
      rescheduledFrom: "Rescheduled from original time slot",
      originalSlot: "Original time",
      replaced: "Replaced",
    },
    records: {
      title: "Clinical records",
      subtitle: "Progress notes and session documentation for {{name}}.",
      newNote: "New progress note",
      stats: {
        notes: "Notes recorded",
        lastSession: "Last session",
        tags: "Distinct tags",
      },
      latestNote: "Latest progress note",
      sessionBadge: "Session {{number}} · {{date}}",
      planPrefix: "Plan:",
      historyTitle: "Session history",
      sessionNumber: "Session {{number}}",
      summary: "Summary",
      evolution: "Clinical progress",
      plan: "Plan / homework",
      editNote: "Edit progress note",
      deleteNote: "Delete progress note",
      emptyTitle: "No progress notes yet",
      emptyDescription: "Start by recording the first session or intake interview.",
      delete: {
        title: "Delete progress note?",
        description:
          "The note for session {{number}} ({{date}}) will be permanently removed from {{name}}'s records.",
        confirm: "Delete progress note",
      },
    },
  },
  sessionForm: {
    newSession: "New session",
    newSessionHint: "Fill in date, time, and patient.",
    dragToMove: "Drag to move",
    patient: "Patient",
    date: "Date",
    start: "Start",
    duration: "Duration",
    modality: "Modality",
    amount: "Session amount",
    amountHint: "Used in finance when the session is completed.",
    selectPatient: "Select patient",
    searchPatient: "Search patient...",
    selectDate: "Select date",
    selectTime: "Select time",
    durationPlaceholder: "Duration",
    schedule: "Schedule session",
    scheduleFor: "New session for {{name}}. Recurring time suggested automatically.",
    editTitle: "Edit session",
    editRescheduled: " Rescheduled from {{from}}.",
    editDefault: " Adjust time, date, or attendance.",
    deleteTitle: "Delete session?",
    deleteDescription:
      "The session for {{title}} on {{date}} at {{time}} will be permanently removed from the calendar.",
    deleteConfirm: "Delete session",
    sessionStatus: "Session status",
    absenceNotice: "Absence with notice",
    absenceNoticeHint: "Patient gave advance notice.",
    payment: "Payment",
    paid: "This session is marked as paid.",
    unpaid: "Session pending payment.",
    undoPayment: "Undo payment",
    markPaid: "Mark as paid",
    originalSession: "Original session",
    save: "Save",
    saveChanges: "Save changes",
    patientDefault: "Patient default: {{price}}",
    absenceNoticeQuestion: "Was there advance notice?",
    absenceNoticeNoCharge: "With notice, the session is not billed.",
    durationMinutes: "{{count}} min",
  },
  patientForm: {
    titleNew: "New patient",
    titleEdit: "Edit patient",
    descNew: "Register a new patient. Only the name is required.",
    descEdit: "Update registration and clinical details.",
    saveChanges: "Save changes",
    addPatient: "Add patient",
    sections: {
      personal: "Personal details",
      address: "Address",
      contact: "Contact",
      therapy: "Therapy information",
      schedules: "Recurring schedule",
      notes: "Notes",
    },
    other: "Other",
    selectPlaceholder: "Select…",
    genderOtherPlaceholder: "Enter gender",
    referralPlaceholder: "How did they find you?",
    referralOtherPlaceholder: "Where did the referral come from?",
    frequencyPlaceholder: "Select frequency",
    weekdayPlaceholder: "Select day",
    addSchedule: "Add time slot",
    removeSchedule: "Remove time slot",
    otherSpecify: "Other (specify)",
    cepNotFound: "Postal code not found",
    noSchedules:
      "No time slots registered. Add the day and time for the recurring session.",
    durationMinutes: "{{count}} min",
    fields: {
      fullName: "Full name",
      birthDate: "Date of birth",
      cpf: "ID / CPF",
      gender: "Gender",
      genderOther: "Specify gender",
      cep: "Postal code",
      street: "Street / address",
      number: "Number",
      complement: "Apt / suite",
      neighborhood: "Neighborhood",
      city: "City",
      state: "State",
      mobile: "Mobile",
      email: "Email",
      contactName: "Emergency contact · Name",
      contactPhone: "Emergency contact · Phone",
      contactRelation: "Relationship",
      complaint: "Chief complaint",
      patientType: "Patient type",
      status: "Status",
      therapyStart: "Therapy start",
      sessionPrice: "Session rate",
      modality: "Modality",
      referral: "Referral source",
      referralOther: "Specify referral",
      sessionFrequency: "Session frequency",
      weekday: "Day of week",
      time: "Time",
      duration: "Duration",
    },
    placeholders: {
      fullName: "e.g. Jane Smith",
      birthDate: "Select date",
      cpf: "e.g. 123.456.789-00",
      cep: "Enter postal code",
      street: "e.g. 100 Main Street",
      number: "Number",
      complement: "Apt, block…",
      neighborhood: "Neighborhood",
      city: "City",
      state: "SP",
      mobile: "e.g. (11) 98765-4321",
      email: "name@email.com",
      optional: "Optional",
      contactRelation: "Mother, sibling…",
      complaint: "Anxiety, grief, relationships…",
      therapyStart: "Select date",
      sessionPrice: "e.g. 200.00",
      time: "Select time",
      duration: "Duration",
      notes: "Additional notes (optional)",
    },
    frequencyDescriptions: {
      "1x-mes": "1 session per month",
      "2x-mes": "Biweekly — every 2 weeks",
      "3x-mes": "3 sessions per month",
      "4x-mes": "Weekly — every week",
    },
    options: {
      gender: {
        Feminino: "Female",
        Masculino: "Male",
        "Não-binário": "Non-binary",
        "Mulher trans": "Trans woman",
        "Homem trans": "Trans man",
        "Prefiro não informar": "Prefer not to say",
      },
      referral: {
        Amigo: "Friend",
        Familiar: "Family",
        "Rede social": "Social media",
        Médico: "Doctor",
        "Outro profissional de saúde": "Other healthcare professional",
        Convênio: "Insurance",
        "Busca na internet": "Internet search",
      },
      patientType: {
        "Primeira entrevista": "Initial intake",
        Recorrente: "Returning",
      },
      weekdays: {
        Seg: "Monday",
        Ter: "Tuesday",
        Qua: "Wednesday",
        Qui: "Thursday",
        Sex: "Friday",
        Sáb: "Saturday",
        Dom: "Sunday",
      },
    },
  },
  sessionNote: {
    titleNew: "New progress note",
    titleEdit: "Edit progress note",
    descCreate:
      "Record the session note for {{name}}. Summary and clinical progress are required.",
    descEdit:
      "Update the session note for {{name}}. Summary and clinical progress are required.",
    sessionDate: "Session date",
    sessionNumber: "Session #",
    sessionNumberLabel: "Session {{number}}",
    mood: "Mood / state",
    modality: "Modality",
    summary: "Session summary",
    evolution: "Clinical progress",
    plan: "Plan / homework",
    tags: "Tags",
    save: "Save progress note",
    create: "Save progress note",
    saveChanges: "Save changes",
    selectOptional: "Select (optional)",
    sections: {
      identification: {
        title: "Session identification",
        description: "Encounter metadata — filled in before the clinical record.",
      },
      clinical: {
        title: "Clinical record",
        description: "Main chart content for this session.",
      },
    },
    placeholders: {
      sessionDate: "Select session date",
      summary: "What was worked on, concerns raised, and context...",
      evolution: "Clinical observations, progress, and insights...",
      plan: "Next steps agreed with the patient...",
      tags: "CBT, Anxiety, Progress",
    },
    hints: {
      summary: "Topics covered, concerns raised, and session context.",
      evolution: "Observed progress, interventions, and clinical impressions.",
      plan: "Optional — next steps agreed with the patient.",
      tags: "Separate with commas — e.g. CBT, Anxiety, Progress.",
    },
  },
  demo: {
    notifications: {
      "1": {
        title: "Pending status — {{name}}",
        description:
          "The session on {{sessionDay}} at {{time}} has passed and is still marked Scheduled.",
      },
      "2": {
        title: "Pending status — {{name}}",
        description:
          "The session on {{sessionDay}} at {{time}} passed with no attendance recorded.",
      },
      "3": {
        title: "Session today — {{name}}",
        description: "Session at {{time}}. Update the status after the session.",
      },
      "4": {
        title: "Overdue payment — {{name}}",
        description:
          "Open balance on file. Update finances after contacting the patient.",
      },
      "5": {
        title: "Progress note pending — {{name}}",
        description:
          "Session marked completed yesterday but still missing a chart entry.",
      },
      "6": {
        title: "3 sessions this week without closure",
        description:
          "Update attendance status in the calendar to keep history up to date.",
      },
      "7": {
        title: "Waitlist — {{name}}",
        description:
          "Patient waiting for a slot for 2 weeks. Consider scheduling the intake interview.",
      },
      "8": {
        title: "Patient on hold — {{name}}",
        description:
          "On hold in records. Review return, discharge, or status maintenance.",
      },
      "9": {
        title: "Weekly reconciliation",
        description:
          "Completed sessions this week not yet reflected in the financial summary.",
      },
      "10": {
        title: "Inbox — 2 unread emails",
        description: "Two emails waiting to be read in the inbox.",
      },
      "11": {
        title: "Weekly summary available",
        description:
          "Overview of sessions, status pending items, and financial alerts for the week.",
      },
    },
    inbox: {
      dates: {
        today: "Today",
        yesterday: "Yesterday",
        days2: "2 days ago",
        days3: "3 days ago",
      },
      labels: {
        patient: "Patient",
        session: "Session",
        calendar: "Calendar",
        financial: "Finance",
        followUp: "Follow-up",
        waitlist: "Waitlist",
        documents: "Documents",
      },
      emails: {
        "1": {
          subject: "Wednesday session confirmation",
          preview:
            "Hi! Just confirming our Wednesday session at 9 AM. I'll be online via the usual link.",
          body: {
            "0": "Hi! Just confirming our Wednesday session at 9 AM. I'll be online via the usual link.",
            "1": "Let me know if you need anything beforehand.",
            "2": "Best,\nMariana",
          },
        },
        "2": {
          subject: "Thursday session reschedule",
          preview:
            "Can I move Thursday's session to 3 PM? A work commitment came up.",
          body: {
            "0": "Hi! Can I move Thursday's session to 3 PM? A work commitment came up.",
            "1": "If not, I'll keep the 2:30 PM slot.",
            "2": "Thanks,\nCamila",
          },
        },
        "3": {
          subject: "Payment receipt",
          preview:
            "Attached is this week's session receipt. Let me know if anything looks off.",
          body: {
            "0": "Good morning! Attached is this week's session receipt.",
            "1": "Let me know if anything looks off.",
            "2": "Rafael",
          },
        },
        "4": {
          subject: "Update after breathing exercise",
          preview:
            "I tried the exercise we agreed on and felt less tension before sleep.",
          body: {
            "0": "Hi! I tried the exercise we agreed on and felt less tension before sleep.",
            "1": "Can I share more details in Friday's session?",
            "2": "Juliana",
          },
        },
        "5": {
          subject: "Question about exposure homework",
          preview:
            "I'm unsure about the anxiety scale in this week's assignment.",
          body: {
            "0": "Hi! I'm unsure about the anxiety scale in this week's assignment.",
            "1": "Should I log before and after each exposure?",
            "2": "Gustavo",
          },
        },
        "6": {
          subject: "Availability for intake assessment",
          preview:
            "I'd like to know if there's an opening for an intake on Thursday afternoons.",
          body: {
            "0": "Hi! I'd like to know if there's an opening for an intake on Thursday afternoons.",
            "1": "I can start this month if there's a slot.",
            "2": "Fernanda",
          },
        },
        "7": {
          subject: "Sleep report from last week",
          preview:
            "I slept better on 4 of 7 nights after adjusting my bedtime routine.",
          body: {
            "0": "Hi! I slept better on 4 of 7 nights after adjusting my bedtime routine.",
            "1": "I logged the times in the diary you suggested.",
            "2": "Carolina",
          },
        },
        "8": {
          subject: "Intake assessment documents",
          preview:
            "Attached are the completed form and signed authorization.",
          body: {
            "0": "Good afternoon! Attached are the completed form and signed authorization.",
            "1": "Awaiting confirmation for Monday's intake.",
            "2": "Pedro",
          },
        },
        "9": {
          subject: "Follow-up on yesterday's session",
          preview:
            "Talking about self-criticism at work helped me see patterns.",
          body: {
            "0": "Hi! Talking about self-criticism at work helped me see patterns.",
            "1": "Wanted to note this before our next session.",
            "2": "Leonardo",
          },
        },
        "10": {
          subject: "First session — logistics questions",
          preview:
            "Confirming whether Friday's session will be online and which platform we use.",
          body: {
            "0": "Hi! Confirming whether Friday's session will be online and which platform we use.",
            "1": "It's my first session and I want to be prepared.",
            "2": "Nora",
          },
        },
      },
    },
  },
  guestNotifications: {
    common: {
      nextSession: "Next: {{date}}",
    },
    newPatient: {
      title: "Patient registered — {{name}}",
      complaint: "Chief complaint: {{complaint}}",
      recurringSlot: "Recurring slot: {{day}} at {{time}}",
      price: "Fee: {{price}}",
      nextStep: "Next step: schedule the first session or record the intake.",
    },
    updatedPatient: {
      title: "Patient updated — {{name}}",
      description: "{{details}}. Profile and recurring schedule synced.",
    },
    deletedPatient: {
      title: "Patient removed — {{name}}",
      description:
        "This patient's profile, records, scheduled sessions, and financial entries were permanently deleted.",
    },
    scheduledSession: {
      title: "Session scheduled — {{name}}",
      description:
        "{{details}}. Status: {{status}}. See it on the weekly calendar or profile.",
    },
    updatedSession: {
      title: "Session updated — {{name}}",
      description: "{{slot}}. {{changes}}",
      changeDate: "Date: {{from}} → {{to}}",
      changeTime: "Time: {{from}} → {{to}}",
      changeStatus: "Status: {{from}} → {{to}}",
      noChanges: "Session details were updated.",
    },
    movedSession: {
      title: "Session rescheduled — {{name}}",
      description: "From {{from}} to {{to}}. Status: {{status}}.",
    },
    sessionStatusChange: {
      title: "Session status — {{name}}",
      description:
        "{{slot}}. {{from}} → {{to}}. Finance and history updated.",
    },
    sessionNote: {
      titleRegistered: "Progress note saved — {{name}}",
      titleUpdated: "Progress note updated — {{name}}",
      sessionOrdinal: "Session {{count}}",
      plan: " Plan: {{plan}}.",
      tags: " Tags: {{tags}}.",
    },
    deletedSession: {
      title: "Session deleted — {{name}}",
      description: "{{slot}} · {{status}} removed from calendar.{{paidNote}}",
      paidNoteRemoved: " Payment recorded for this session was also removed.",
    },
    deletedSessionNote: {
      title: "Progress note removed — {{name}}",
      description: "{{date}} · {{session}}. Removed: {{summary}}.",
    },
    eventPayment: {
      titlePaid: "Payment recorded — {{name}}",
      titleReverted: "Payment reversed — {{name}}",
      descriptionPaid:
        "{{slot}} · {{amount}}. Revenue updated in Finance and Receivables.",
      descriptionReverted:
        "{{slot}} · {{amount}}. Session returned to payment pending.",
    },
    bulkEventPayment: {
      title: "{{count}} sessions marked as paid",
      description: "Total of {{total}} recorded in Finance.",
    },
    paymentOverdueOverride: {
      title: "Overdue status — {{name}}",
      description:
        "Status set to {{label}}. Finance and alerts now follow this rule.",
      labelOverdue: "Overdue (manual)",
      labelCurrent: "Current (manual)",
      labelAuto: "Automatic (by sessions)",
    },
  },
  roadmap: {
    progress: "v1.0 progress",
    sections: {
      done: {
        title: "Already shipped",
        description: "What makes up Lume's visual and functional foundation today.",
      },
      next: {
        title: "Next steps",
        description: "Immediate priority to close v1.0 with demo data.",
      },
      planned: {
        title: "Planned for v1.0",
        description: "Add-ons that complete the clinical cycle before backend.",
      },
      later: {
        title: "After v1.0",
        description: "Infrastructure and scale — Supabase comes last.",
      },
    },
    status: {
      done: "Shipped",
      next: "In progress",
      planned: "Planned",
      later: "Future",
    },
    heroTitle: "Roadmap and next steps",
    stats: {
      delivered: "Shipped",
      next: "Next up",
      planned: "Planned",
      total: "Total",
    },
    items_one: "{{count}} item",
    items_other: "{{count}} items",
    currentFocus: "Current focus",
    infrastructure: "Infrastructure",
    infrastructureLater: "Later",
    goal: "Goal",
    releaseStrategy: "Release strategy",
    releaseStrategyHint:
      "Three clear waves before going to production with Supabase.",
    ruleTitle: "v1.0 rule",
    ruleDescription:
      "No Supabase until the demo clinical flow is solid. Product first, infrastructure second.",
    infrastructureLast: "Infrastructure last",
    meta: {
      versionLabel: "v1.1 — Guest mode and refinements",
      subtitle:
        "Milestone v1.1: local persistence, guest clinical CRUD, empty states, refined forms, and polished Data spreadsheet.",
    },
    waves: {
      "1": {
        title: "Clinical experience",
        body: "Chart notes, edit patient, and schedule from profile.",
      },
      "2": {
        title: "Full operations",
        body: "Session status, integrated finance, and global search.",
      },
      "3": {
        title: "Persistence",
        body: "Supabase, real auth, and deploy — only after closing the mock v1.0.",
      },
    },
    tags: {
      ui: "UI",
      theme: "Theme",
      data: "Data",
      dashboard: "Dashboard",
      patients: "Patients",
      calendar: "Calendar",
      finance: "Finance",
      communication: "Communication",
      notifications: "Notifications",
      account: "Account",
      loginDemo: "Demo login",
      clinical: "Clinical",
      shipped: "Shipped",
      management: "Management",
      ux: "UX",
      infrastructure: "Infrastructure",
      authentication: "Authentication",
      demo: "Demo",
      forms: "Forms",
    },
    items: {
      setup: {
        title: "Lume app foundation",
        description:
          "React + Vite + TypeScript, Tailwind v4, shadcn/ui, and navy/cream/mint visual theme.",
        phase: "Foundation",
      },
      "mock-data": {
        title: "Mock data layer",
        description:
          "30 patients with rich profiles, derived calendar, notifications, and inbox centralized in the provider.",
        phase: "Foundation",
      },
      home: {
        title: "Home / daily dashboard",
        description:
          "Visit summary, weekly stats, projected revenue, and overdue payment alerts.",
        phase: "Core screens",
      },
      patients: {
        title: "Patients + full profile",
        description:
          "Filtered list, detailed profile, registration with auto postal code (ViaCEP), stable modal with Select, and 30 filled profiles.",
        phase: "Core screens",
      },
      calendar: {
        title: "Weekly calendar",
        description:
          "Grid with drag-and-drop, status legend, session creation, and modal aligned with new patient identity.",
        phase: "Core screens",
      },
      finance: {
        title: "Finance",
        description:
          "Dashboard with charts, monthly revenue, overdue accounts, and view by modality.",
        phase: "Core screens",
      },
      inbox: {
        title: "Inbox",
        description:
          "Mock email list, side reading pane, search, and tabs aligned with the design system.",
        phase: "Core screens",
      },
      notifications: {
        title: "Notifications",
        description:
          "Header bell, refined dropdown, and full page with filters and date grouping.",
        phase: "Core screens",
      },
      account: {
        title: "Account modal",
        description:
          "Navy shell with white inset, profile, security, notifications, and appearance.",
        phase: "Core screens",
      },
      login: {
        title: "Login screen",
        description:
          "Split navy/cream layout, fields and buttons aligned with the rest of the app.",
        phase: "Core screens",
      },
      records: {
        title: "Chart / clinical progress",
        description:
          "Session notes, progress history, dedicated profile tab, and new progress entry.",
        phase: "v1.0 — Priority",
      },
      "edit-patient": {
        title: "Edit patient",
        description:
          "Registration form reused to update existing data from the profile.",
        phase: "v1.0 — Priority",
      },
      "schedule-from-profile": {
        title: "Schedule session from profile",
        description:
          "Profile button opens scheduling flow pre-filled with patient and recurring time.",
        phase: "v1.0 — Priority",
      },
      "session-status": {
        title: "Session status",
        description:
          "Mark as completed, no-show, or rescheduled — basis for attendance and billing.",
        phase: "v1.0",
      },
      "session-history": {
        title: "Session history on profile",
        description:
          "Dedicated profile tab with visit timeline, linked reschedules, and status side stripe.",
        phase: "v1.0",
      },
      export: {
        title: "Data export",
        description:
          "Styled XLSX with 9 sheets (patients, calendar, chart, per-session finance, and reports). Global header button.",
        phase: "v1.0",
      },
      "unpaid-sessions": {
        title: "Receivables",
        description:
          "Consolidated page of unpaid completed sessions, filters, mark as paid, Home navigation, and per-event payment.",
        phase: "v1.0",
      },
      "login-transition": {
        title: "Login → app transition",
        description:
          "Crossfade with AnimatePresence — smooth opacity in/out, no layout morph.",
        phase: "v1.0",
      },
      "finance-agenda": {
        title: "Calendar ↔ Finance",
        description:
          "Billing by status (completed / no-show without notice), per-session amount, month-end delay, automatic overdue with profile override, Finance and Home with real data.",
        phase: "v1.0",
      },
      "global-search": {
        title: "Global search",
        description:
          "Header pill, Cmd+K, cream modal with optimized index, selected item highlight, clear X button, and quick actions.",
        phase: "v1.0",
      },
      "recurring-calendar": {
        title: "Recurring calendar",
        description:
          "Sessions generated from patient schedule — no dates before registration (recurrenceFrom).",
        phase: "v1.1 — Guest mode",
      },
      "search-input-clear": {
        title: "Clear search in fields",
        description:
          "Reusable search field with trailing X and Luma blue hover — Patients, inbox, and global search.",
        phase: "v1.0",
      },
      "calendar-card-consistency": {
        title: "Calendar visual consistency",
        description:
          "Cards with equal intensity per status — time deduplication (in-person+online), equivalent opaque backgrounds, and status sync on past sessions.",
        phase: "v1.0",
      },
      "custom-scrollbar": {
        title: "Custom scrollbar",
        description:
          "Own ScrollArea (Radix), native OS bar hidden, Luma thumb without arrows — inbox, modals, and lists.",
        phase: "v1.0",
      },
      reports: {
        title: "Reports in UI",
        description:
          "Attendance rate, monthly trend, session outcomes, and revenue by modality — dedicated page with month filters.",
        phase: "v1.0",
      },
      supabase: {
        title: "Supabase + real auth",
        description:
          "Persistence, real login, and sync — only after closing the mock v1.0.",
        phase: "Post v1.0",
      },
      "guest-mode": {
        title: "Guest mode (localStorage)",
        description:
          "Entry without login, data persisted in browser, name on first visit, and account deletion in Account tab.",
        phase: "v1.1 — Guest mode",
      },
      themes: {
        title: "Refúgio, Lume, and Coral themes",
        description:
          "Three palettes with adjusted sidebar contrast and readable active menu in each theme.",
        phase: "v1.1 — Guest mode",
      },
      "edit-delete-note": {
        title: "Edit and delete progress note",
        description:
          "Chart actions with delete confirmation; modal reused for editing with session recount.",
        phase: "v1.1 — Guest mode",
      },
      "delete-patient": {
        title: "Delete patient",
        description:
          "Danger zone on profile removes patient, chart, calendar, and associated events.",
        phase: "v1.1 — Guest mode",
      },
      "guest-profile-name": {
        title: "Save guest name in profile",
        description:
          "Name field in Account Profile tab persists in localStorage and updates the header.",
        phase: "v1.1 — Guest mode",
      },
      "patient-notes-field": {
        title: "Patient notes field",
        description:
          "Persist the notes field from registration/edit form on the Patient type.",
        phase: "v1.1 — Guest mode",
      },
      "patient-list-actions": {
        title: "Schedule and notes on list",
        description:
          "Quick action menus on patient list open scheduling or new progress note directly.",
        phase: "v1.1 — Guest mode",
      },
      "inbox-retained": {
        title: "Inbox (demo UI retained)",
        description:
          "Page kept as visual prototype; real email integration comes later.",
        phase: "v1.1 — Guest mode",
      },
      "toast-system": {
        title: "Toast system",
        description:
          "Quick confirmations in the corner, default bottom-right, position configurable in Account → Appearance.",
        phase: "v1.1 — Guest mode",
      },
      "guest-notifications": {
        title: "Automatic notifications in guest mode",
        description:
          "Generate local alerts when registering patient, scheduling session, or recording progress.",
        phase: "v1.1 — Guest mode",
      },
      "delete-session": {
        title: "Delete session on calendar",
        description:
          "Remove mistakenly created session with confirmation and counter adjustment in guest mode.",
        phase: "v1.1 — Guest mode",
      },
      "guest-empty-states": {
        title: "Empty states in guest mode",
        description:
          "Patients, Home, Finance, Receivables, and Reports recognize empty clinic and invite adding the first patient.",
        phase: "v1.1 — Guest mode",
      },
      "home-agenda-navigation": {
        title: "Home → day calendar",
        description:
          "Clicking a session on Home or global search opens calendar in Day view without opening edit modal.",
        phase: "v1.1 — Guest mode",
      },
      "form-pickers": {
        title: "Date and time pickers in forms",
        description:
          "Clickable calendar for dates, hour/minute selector for recurring times, and subtler placeholders.",
        phase: "v1.1 — Guest mode",
      },
      "input-masks": {
        title: "CPF and mobile masks",
        description:
          "Auto-format on typing in patient registration — separate area code and dotted CPF.",
        phase: "v1.1 — Guest mode",
      },
      "sheet-scroll-ux": {
        title: "More readable Data spreadsheet",
        description:
          "More visible draggable horizontal bar in spreadsheet view; right padding so last column isn't clipped.",
        phase: "v1.1 — Guest mode",
      },
    },
  },
} satisfies Messages
