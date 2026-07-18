export const ptBR = {
  nav: {
    brand: "Lume",
    groups: {
      geral: "Geral",
      atendimento: "Sessões",
      financeiro: "Financeiro",
      gestao: "Gestão",
    },
    pages: {
      inicio: "Início",
      caixaEntrada: "Caixa de entrada",
      agenda: "Agenda",
      pacientes: "Pacientes",
      financeiro: "Financeiro",
      aReceber: "A receber",
      relatorios: "Relatórios",
      notificacoes: "Notificações",
      dados: "Dados",
      atividade: "Atividade",
      roteiro: "Roteiro",
    },
    subtitles: {
      inicio: "Painel do dia",
      caixaEntrada: "E-mails",
      agenda: "Calendário de sessões",
      pacientes: "Lista e perfis",
      financeiro: "Receita e inadimplência",
      aReceber: "Sessões realizadas sem pagamento",
      notificacoes: "Alertas da clínica",
      relatorios: "Comparecimento e receita por modalidade",
      dados: "Visão em planilha dos dados da clínica",
      atividade: "Histórico de ações na clínica",
      roteiro: "Progresso do produto",
    },
    keywords: {
      inicio: "início home painel dashboard",
      caixaEntrada: "caixa de entrada inbox e-mails mensagens",
      agenda: "agenda calendário sessões atendimentos",
      pacientes: "pacientes lista perfis cadastro",
      financeiro: "financeiro receita pagamentos inadimplência",
      aReceber: "a receber sessões pendentes cobrança pagamento em aberto",
      notificacoes: "notificações alertas avisos",
      relatorios: "relatórios comparecimento presença modalidade taxa",
      dados: "dados planilha tabela export xlsx",
      atividade: "atividade log histórico ações auditoria",
      roteiro: "roteiro roadmap progresso versão",
    },
  },
  common: {
    cancel: "Cancelar",
    save: "Salvar",
    close: "Fechar",
    delete: "Excluir",
    edit: "Editar",
    confirm: "Confirmar",
    back: "Voltar",
    or: "ou",
    all: "Todos",
    none: "Nenhum",
    loading: "Carregando…",
    clearSearch: "Limpar busca",
    toggleSidebar: "Alternar menu lateral",
    sidebarTitle: "Menu lateral",
    sidebarDescription: "Navegação principal do aplicativo.",
    globalSearch: "Busca global",
    noResults: "Nenhum resultado encontrado.",
    newPatient: "Novo paciente",
    account: "Conta",
    signOut: "Sair",
    today: "Hoje",
    yesterday: "Ontem",
    thisWeek: "Esta semana",
    older: "Mais antigas",
    now: "agora",
    minutesAgo: "há {{count}} min",
    hoursAgo: "há {{count}} h",
    daysAgo: "há {{count}} d",
    yes: "Sim",
    no: "Não",
  },
  ui: {
    datePicker: {
      selectDate: "Selecionar data",
      clearDate: "Limpar data",
      prevMonth: "Mês anterior",
      nextMonth: "Próximo mês",
      selectMonth: "Mês",
      selectYear: "Ano",
    },
    timePicker: {
      selectTime: "Selecionar horário",
      title: "Horário",
      hour: "Hora",
      minute: "Minuto",
      done: "Concluir",
    },
  },
  login: {
    heroTagline: "Sua clínica em foco, do agendamento ao acompanhamento.",
    welcomeBack: "Bem-vindo de volta",
    subtitle: "Entre na sua conta para acessar o painel.",
    email: "E-mail",
    password: "Senha",
    emailPlaceholder: "voce@example.com",
    forgotPassword: "Esqueci a senha",
    rememberMe: "Manter conectado",
    signIn: "Entrar",
    signingIn: "Entrando...",
    signInWithGoogle: "Entrar com Google",
    continueAsGuest: "Continuar como convidado",
    enterAs: "Entrar como {{name}}",
    showPassword: "Mostrar senha",
    hidePassword: "Ocultar senha",
    exploreHint: "Quer explorar com dados de exemplo?",
    exploreDetail: "Use o login acima ou o Google.",
    guest: {
      title: "Modo convidado",
      description:
        "Use o Lume localmente neste navegador. Seus pacientes, agenda e prontuários ficam salvos aqui — sem conta na nuvem.",
      nameLabel: "Como podemos te chamar?",
      namePlaceholder: "Seu nome",
      start: "Começar",
      starting: "Entrando...",
    },
  },
  account: {
    title: "Conta",
    subtitle: "Gerencie suas informações e preferências.",
    sections: {
      perfil: {
        label: "Perfil",
        description: "Nome, e-mail e foto no perfil.",
      },
      seguranca: {
        label: "Segurança",
        description: "Senha, login e dispositivos conectados.",
      },
      notificacoes: {
        label: "Notificações",
        description: "Escolha o que e como ser avisado.",
      },
      preferencias: {
        label: "Preferências",
        description: "Idioma e outras opções gerais do app.",
      },
      aparencia: {
        label: "Aparência",
        description: "Personalize o visual do aplicativo.",
      },
      backup: {
        label: "Backup",
        description: "Baixar ou restaurar dados locais.",
      },
      excluirConta: {
        label: "Excluir conta",
        description: "Encerrar conta convidada neste navegador.",
      },
    },
    profile: {
      heading: "Perfil",
      description: "Dados da sua conta — visíveis só para você no Lume.",
      changePhoto: "Alterar foto",
      fullName: "Nome completo",
      namePlaceholder: "Seu nome",
      guestNameHint:
        "Mínimo de 2 caracteres. Atualiza seu nome no app e na tela de entrada.",
      loginEmail: "E-mail de login",
      emailPlaceholder: "voce@example.com",
      saveChanges: "Salvar alterações",
      saved: "Dados salvos",
      savedDescription:
        "Seu nome foi atualizado neste navegador e na tela de entrada.",
    },
    deleteGuest: {
      heading: "Excluir conta",
      description:
        "Encerre sua conta convidada neste navegador. Esta ação apaga o perfil e tudo o que foi cadastrado.",
      whatWillBeRemoved: "O que será removido",
      whatWillBeRemovedDescription:
        "A conta de {{name}} e todos os dados dela: pacientes, agenda, prontuários, notificações e preferências salvas localmente.",
      dangerZone: "Zona de perigo",
      dangerZoneDescription:
        "Esta ação é permanente e não pode ser desfeita. Você será desconectado e precisará criar uma nova conta convidada para usar o Lume de novo neste navegador.",
      deleteAccount: "Excluir conta",
      confirmTitle: "Excluir conta convidada?",
      confirmDescription:
        "A conta de {{name}} e todos os dados associados serão apagados deste navegador. Você precisará criar uma nova conta convidada para voltar a usar o Lume aqui.",
    },
    backup: {
      heading: "Backup local",
      description:
        "Salve um arquivo JSON com seus dados clínicos e preferências, ou restaure um backup anterior.",
      warning:
        "O arquivo contém dados clínicos sensíveis. Guarde-o em local seguro e não compartilhe.",
      downloadTitle: "Baixar backup",
      downloadDescription:
        "Gera um arquivo .json com pacientes, agenda, prontuários e preferências.",
      downloadButton: "Baixar backup",
      restoreTitle: "Restaurar backup",
      restoreDescription:
        "Selecione um arquivo .json gerado pelo Lume para recuperar seus dados.",
      restoreButton: "Escolher arquivo",
      modeTitle: "Como restaurar?",
      modeDescription:
        "Escolha se o backup deve substituir tudo ou ser combinado com os dados atuais.",
      modeReplaceTitle: "Substituir tudo",
      modeReplaceDescription:
        "Apaga os dados atuais deste navegador e carrega apenas o conteúdo do backup.",
      modeMergeTitle: "Combinar",
      modeMergeDescription:
        "Mantém os dados atuais e adiciona itens novos do backup. Em caso de conflito, você decide.",
      continue: "Continuar",
      replaceConfirmTitle: "Substituir dados atuais?",
      replaceConfirmDescription:
        "Todos os pacientes, sessões, prontuários e notificações atuais serão substituídos pelo backup. Esta ação não pode ser desfeita.",
      replaceConfirm: "Substituir e restaurar",
      conflictTitle: "Conflitos encontrados",
      conflictDescription:
        "O backup tem {{total}} item(ns) com o mesmo ID dos dados atuais ({{patients}} pacientes, {{events}} sessões, {{sessionNotes}} prontuários). Continuar sobrescreve esses itens com a versão do backup.",
      conflictConfirm: "Continuar e sobrescrever",
      downloaded: "Backup baixado",
      downloadedDescription: "Arquivo salvo neste dispositivo.",
      restored: "Backup restaurado",
      restoredReplaceDescription: "Os dados locais foram substituídos pelo backup.",
      restoredMergeDescription: "Os dados do backup foram combinados com os atuais.",
      errors: {
        invalidJson: "O arquivo não é um JSON válido.",
        invalidStructure: "Estrutura do backup inválida.",
        invalidKind: "Este arquivo não é um backup do Psico Lume.",
        invalidSchemaVersion: "Versão do formato de backup inválida.",
        unsupportedSchemaVersion:
          "Este backup é de uma versão mais nova do Lume. Atualize o app e tente de novo.",
        invalidAppVersion: "Versão do app no backup inválida.",
        invalidExportedAt: "Data de exportação inválida.",
        invalidProfile: "Perfil do backup inválido.",
        invalidClinic: "Dados clínicos do backup inválidos.",
        invalidPatients: "Lista de pacientes inválida no backup.",
        invalidEvents: "Lista de sessões inválida no backup.",
        invalidSessionNotes: "Lista de prontuários inválida no backup.",
        invalidNotifications: "Lista de notificações inválida no backup.",
        invalidActivity: "Lista de atividades inválida no backup.",
        invalidPreferences: "Preferências do backup inválidas.",
        duplicatePatientIds: "Há IDs de pacientes duplicados no backup.",
        duplicateEventIds: "Há IDs de sessões duplicados no backup.",
        duplicateSessionNoteIds: "Há IDs de prontuários duplicados no backup.",
        duplicateNotificationIds: "Há IDs de notificações duplicados no backup.",
        duplicateActivityIds: "Há IDs de atividades duplicados no backup.",
        invalidFileType: "Selecione um arquivo .json.",
        fileTooLarge: "O arquivo é grande demais (máx. 8 MB).",
        readFailed: "Não foi possível ler o arquivo.",
        generic: "Não foi possível restaurar o backup.",
      },
    },
    security: {
      heading: "Segurança",
      description: "Mantenha sua conta protegida.",
      changePassword: "Alterar senha",
      changePasswordDescription:
        "Use uma senha forte e única que você não usa em outros sites.",
      currentPassword: "Senha atual",
      newPassword: "Nova senha",
      confirmNewPassword: "Confirmar nova senha",
      updatePassword: "Atualizar senha",
      twoFactor: "Autenticação em duas etapas",
      twoFactorDescription: "Adicione uma camada extra de proteção ao entrar.",
      connectedDevices: "Dispositivos conectados",
      connectedDevicesDescription:
        "Sessões atualmente conectadas à sua conta.",
      currentDevice: "Este dispositivo",
      endSession: "Encerrar",
    },
    notifications: {
      heading: "Notificações",
      description: "Escolha sobre o que você quer ser avisado.",
      clinical: "Clínico e agenda",
      patients: "Pacientes",
      messages: "Mensagens",
      financial: "Financeiro e resumos",
      system: "Sistema",
      pendingSession: {
        title: "Status de sessão pendente",
        description:
          "Quando uma sessão passou e ainda não foi marcada na agenda, ou várias sessões da semana sem fechamento.",
      },
      sessionReminder: {
        title: "Sessões de hoje",
        description: "Sessões agendadas para hoje que ainda precisam de registro.",
      },
      pendingEvolution: {
        title: "Evolução clínica pendente",
        description: "Sessão realizada sem registro no prontuário.",
      },
      waitingList: {
        title: "Lista de espera",
        description: "Pacientes aguardando vaga ou retorno às sessões.",
      },
      pausedPatient: {
        title: "Paciente em pausa",
        description: "Cadastros em pausa que podem precisar de revisão.",
      },
      inboxUnread: {
        title: "E-mails não lidos",
        description: "Novas mensagens na caixa de entrada integrada.",
      },
      overduePayment: {
        title: "Pagamento em atraso",
        description: "Sessões realizadas com pagamento em aberto.",
      },
      unpaidWeek: {
        title: "Conciliação da semana",
        description:
          "Várias sessões realizadas na semana ainda não refletidas no financeiro.",
      },
      weeklySummary: {
        title: "Resumo semanal",
        description: "Panorama da semana com pendências de agenda e financeiro.",
      },
      guestWelcome: {
        title: "Bem-vindo ao Lume",
        description: "Aviso inicial sobre o modo convidado e dados locais.",
      },
    },
    preferences: {
      heading: "Preferências",
      description: "Ajuste idioma e outras opções gerais do Lume.",
      language: {
        title: "Idioma",
        description: "Escolha o idioma da interface.",
        ptBR: "Português (Brasil)",
        en: "English",
      },
      restartTour: {
        title: "Tour de boas-vindas",
        description: "Revise os principais recursos da interface.",
        button: "Ver tour de novo",
      },
    },
    appearance: {
      heading: "Aparência",
      description: "Personalize o visual do aplicativo.",
      theme: {
        title: "Tema do aplicativo",
        description: "Cores do shell, fundo e destaques em todo o app.",
      },
      toastPosition: {
        title: "Posição dos toasts",
        description:
          'Escolha em qual canto da tela aparecem as confirmações rápidas, como "Dados salvos".',
      },
    },
    themes: {
      refugio: {
        label: "Refúgio",
        description: "Ardósia fria com destaque terracota — padrão.",
      },
      lume: {
        label: "Lume",
        description: "Areia quente, navy e menta — identidade clássica.",
      },
      horizonte: {
        label: "Horizonte",
        description: "Linho quente, oceano profundo e pôr do sol.",
      },
      grafite: {
        label: "Grafite",
        description: "Pretos e cinzas quentes com destaque cobre discreto.",
      },
    },
    toastUpdated: "Posição dos toasts atualizada",
    toastUpdatedDescription:
      "As próximas confirmações aparecerão no canto escolhido.",
    toastPositions: {
      topLeft: {
        label: "Superior esquerdo",
        description: "Toasts no canto superior esquerdo.",
      },
      topRight: {
        label: "Superior direito",
        description: "Toasts no canto superior direito.",
      },
      bottomLeft: {
        label: "Inferior esquerdo",
        description: "Toasts no canto inferior esquerdo.",
      },
      bottomRight: {
        label: "Inferior direito",
        description: "Padrão — canto inferior direito.",
      },
    },
  },
  search: {
    title: "Busca global",
    description: "Encontre pacientes, sessões, e-mails e notificações em um só lugar.",
    placeholder: "Buscar pacientes, sessões, e-mails...",
    empty: "Nenhum resultado encontrado.",
    navigate: "navegar",
    open: "abrir",
    close: "fechar",
    groups: {
      navigation: "Navegação",
      patients: "Pacientes",
      sessions: "Sessões",
      emails: "E-mails",
      notifications: "Notificações",
    },
    quickActions: {
      newPatient: {
        title: "Novo paciente",
        subtitle: "Cadastrar na clínica",
      },
      newSession: {
        title: "Nova sessão",
        subtitle: "Agendar na agenda",
      },
    },
  },
  exportSheets: {
    sheets: {
      summary: "Resumo",
      patients: "Pacientes",
      schedules: "Horários",
      agenda: "Agenda",
      records: "Prontuário",
      financePatients: "Fin. Pacientes",
      financeSessions: "Fin. Sessões",
      reportHistory: "Rel. histórico",
      reportCurrentMonth: "Rel. mês atual",
    },
    common: {
      automatic: "Automático",
      overdueManualOverdue: "Sim (inadimplente)",
      overdueManualCurrent: "Sim (adimplente)",
    },
    columns: {
      id: "ID",
      name: "Nome",
      cpf: "CPF",
      email: "Email",
      phone: "Telefone",
      status: "Status",
      modality: "Modalidade",
      complaint: "Queixa",
      sessionPrice: "Valor sessão (R$)",
      sessionDay: "Dia sessão",
      sessionTime: "Horário sessão",
      durationMin: "Duração (min)",
      nextSession: "Próxima sessão",
      sessionsCompleted: "Sessões realizadas",
      patientSince: "Paciente desde",
      frequency: "Frequência",
      overdue: "Inadimplente",
      overdueOverride: "Override inadimplência",
      birthDate: "Data nascimento",
      gender: "Gênero",
      cep: "CEP",
      street: "Logradouro",
      number: "Número",
      complement: "Complemento",
      neighborhood: "Bairro",
      city: "Cidade",
      state: "Estado",
      emergencyContact: "Contato emergência",
      emergencyPhone: "Tel. emergência",
      contactRelation: "Parentesco",
      patientType: "Tipo paciente",
      therapyStart: "Início terapia",
      referral: "Encaminhamento",
      notes: "Observações",
      patientId: "ID Paciente",
      patient: "Paciente",
      index: "#",
      weekday: "Dia",
      time: "Horário",
      sessionId: "ID Sessão",
      date: "Data",
      start: "Início",
      end: "Fim",
      billable: "Cobrável",
      amount: "Valor (R$)",
      paid: "Pago",
      notice: "Aviso prévio",
      originalDate: "Data original",
      originalStart: "Início original",
      originalEnd: "Fim original",
      sessionNumber: "Nº sessão",
      linkedSession: "Vinculado à sessão",
      eventId: "ID Sessão (agenda)",
      summary: "Resumo",
      evolution: "Evolução",
      plan: "Plano",
      tags: "Tags",
      mood: "Humor",
      paidBillableSessions: "Sessões cobráveis pagas",
      pendingBillableSessions: "Sessões cobráveis pendentes",
      receivedRevenue: "Receita recebida (R$)",
      pendingRevenue: "A receber (R$)",
      overdueRevenue: "Em atraso (R$)",
      monthlyForecastRevenue: "Receita prevista/mês (R$)",
      timeRange: "Horário",
      overduePayment: "Em atraso",
      metric: "Métrica",
      value: "Valor",
      month: "Mês",
      attendanceRate: "Taxa comparecimento (%)",
      completed: "Realizadas",
      absences: "Faltas",
      group: "Grupo",
      item: "Item",
      value1: "Valor 1",
      value2: "Valor 2",
      value3: "Valor 3",
      value4: "Valor 4",
    },
    summary: {
      exportedAt: "Exportado em",
      totalPatients: "Total de pacientes",
      activePatients: "Pacientes ativos",
      calendarSessions: "Sessões na agenda",
      completedCalendarSessions: "Sessões realizadas (agenda)",
      recordNotes: "Notas de prontuário",
      attendanceRate: "Taxa comparecimento ({{month}})",
      billableRevenue: "Receita cobrável ({{month}})",
      receivedRevenue: "Receita recebida ({{month}})",
      pendingRevenue: "A receber ({{month}})",
      monthlyForecast: "Receita prevista/mês (ativos)",
      unpaidSessionsTotal: "Sessões a receber (total)",
      overduePatients: "Pacientes inadimplentes",
      overdueAmount: "Valor em atraso",
    },
    reportGroups: {
      attendance: "Comparecimento",
      modality: "Modalidade",
      outcome: "Desfecho",
      billableRevenue: "Receita cobrável",
    },
  },
  export: {
    clinicData: "Dados da clínica",
    viewSheet: "Ver planilha",
    downloadXlsx: "Baixar XLSX",
    sheetsView: {
      title: "Visão em planilha",
      empty: "Nenhum registro",
      rows_one: "{{count}} linha",
      rows_other: "{{count}} linhas",
      subtitle: "mesmas abas e cores do export XLSX",
      fullscreen: "Tela cheia",
      exitFullscreen: "Sair da tela cheia",
    },
  },
  enums: {
    sessionStatus: {
      agendada: "Agendada",
      realizada: "Realizada",
      faltou: "Faltou",
      remarcada: "Remarcada",
      cancelada: "Cancelada",
    },
    patientStatus: {
      ativo: "Ativo",
      "em-pausa": "Em pausa",
      "lista-espera": "Lista de espera",
      alta: "Alta",
    },
    modality: {
      presencial: "Presencial",
      online: "Remoto",
      hibrido: "Híbrido",
    },
    sessionFrequency: {
      "1x-mes": "1x ao mês",
      "2x-mes": "2x ao mês",
      "3x-mes": "3x ao mês",
      "4x-mes": "4x ao mês",
    },
    mood: {
      anxious: "Ansioso(a)",
      stable: "Estável",
      better: "Melhor",
      sad: "Triste",
      hopeful: "Esperançoso(a)",
      exhausted: "Exausto(a)",
      emotional: "Emocional",
      reflective: "Reflexivo(a)",
      hypervigilant: "Hipervigilante",
    },
  },
  empty: {
    noPatients: {
      title: "Nenhum paciente cadastrado",
      description:
        "Cadastre seu primeiro paciente para começar o acompanhamento clínico.",
    },
  },
  tour: {
    stepCounter: "Passo {{current}} de {{total}}",
    skip: "Pular tour",
    next: "Próximo",
    finish: "Entendi",
    steps: {
      homeNewPatient: {
        title: "Comece pelo cadastro",
        description:
          "Cadastre seu primeiro paciente para agendar sessões na agenda e acompanhar o financeiro.",
      },
      homeStats: {
        title: "Visão geral do dia",
        description:
          "Acompanhe pacientes, sessões da semana, receita e pagamentos em atraso num relance.",
      },
      navPacientes: {
        title: "Pacientes",
        description:
          "Cadastre, busque e gerencie fichas, prontuários e histórico de cada paciente.",
      },
      navAgenda: {
        title: "Agenda",
        description:
          "Agende sessões, veja o calendário e acompanhe o status de cada sessão.",
      },
      navAReceber: {
        title: "A receber",
        description:
          "Veja sessões cobráveis, marque pagamentos e acompanhe pendências e atrasos.",
      },
      navFinanceiro: {
        title: "Financeiro",
        description:
          "Gráficos de receita e visão consolidada do desempenho financeiro.",
      },
      headerSearch: {
        title: "Busca global",
        description:
          "Encontre pacientes, sessões, e-mails e atalhos rápidos em todo o app.",
      },
      headerExport: {
        title: "Exportar dados",
        description:
          "Baixe a planilha Excel diretamente pela página Dados.",
      },
      headerNotifications: {
        title: "Notificações",
        description:
          "Alertas de sessões, pagamentos e mensagens importantes.",
      },
      navAccount: {
        title: "Sua conta",
        description:
          "Gerencie perfil e preferências. No modo convidado, os dados ficam salvos apenas neste navegador.",
      },
    },
  },
  home: {
    greeting: {
      morning: "Bom dia",
      afternoon: "Boa tarde",
      evening: "Boa noite",
    },
    stats: {
      totalPatients: "Total de pacientes",
      weekSessions: "Sessões da semana",
      weekRevenue: "Receita da semana",
      overduePayments: "Pagamentos em atraso",
      activeHint: "{{count}} ativos",
      scheduledHint: "{{count}} agendados",
      perSession: "/sessão",
      sessionsToday: "{{count}} sessão hoje",
      sessionsToday_plural: "{{count}} sessões hoje",
      inTreatmentHint: "{{count}} em acompanhamento",
      recurringSessions: "Sessões recorrentes",
      forecast: "Prevista",
      overdueSession: "{{count}} sessão",
      overdueSessions: "{{count}} sessões",
    },
    sessionsTodayLabel_one: "sessão hoje",
    sessionsTodayLabel_other: "sessões hoje",
    agendaSubtitle: "Suas sessões de {{day}}",
    noPatientsDescription:
      "Cadastre seu primeiro paciente para começar a agendar sessões.",
    walkInSession: "Sessão avulsa",
    todayAgenda: "Agenda de hoje",
    viewAgenda: "Ver agenda",
    viewWeek: "Ver semana",
    viewReceivables: "Ver a receber",
    noPatientsTitle: "Nenhum paciente cadastrado",
    freeDayTitle: "Dia livre",
    freeDayDescription: "Nenhuma sessão agendada para hoje.",
    clickToEdit: "Clique para editar",
  },
  inbox: {
    unread: "{{count}} não lidos",
    tabs: {
      all: "Todos",
      unread: "Não lidos",
    },
    searchPlaceholder: "Buscar e-mails...",
    noEmails: "Nenhum e-mail disponível.",
    noResults: "Nenhum e-mail encontrado.",
    archive: "Arquivar",
    delete: "Excluir",
    favorite: "Favoritar",
    reply: "Responder",
    forward: "Encaminhar",
  },
  activity: {
    title: "Atividade",
    subtitle: "Histórico das ações feitas na clínica neste dispositivo.",
    filters: {
      all: "Todas",
      patients: "Pacientes",
      sessions: "Sessões",
      records: "Prontuário",
      payments: "Pagamentos",
    },
    categories: {
      patient: "Paciente",
      session: "Sessão",
      record: "Prontuário",
      payment: "Pagamento",
    },
    empty: {
      title: "Nenhuma atividade ainda",
      description:
        "Cadastros, sessões, prontuário e pagamentos aparecerão aqui.",
      filter: "Nenhuma atividade neste filtro.",
      searchTitle: "Nenhum resultado",
      search: "Nenhuma atividade corresponde à busca.",
    },
    searchPlaceholder: "Buscar por paciente, ação ou data…",
    summaries: {
      patientCreated: "Cadastrou o paciente {{patientName}}",
      patientUpdated: "Atualizou o paciente {{patientName}}",
      patientDeleted: "Removeu o paciente {{patientName}}",
      sessionCreated: "Agendou sessão de {{patientName}} para {{when}}",
      sessionUpdated: "Atualizou a sessão de {{patientName}} ({{when}})",
      sessionRescheduled: "Remarcou a sessão de {{patientName}} para {{when}}",
      sessionStatusChanged:
        "Alterou o status da sessão de {{patientName}} de {{fromStatus}} para {{toStatus}}",
      sessionDeleted: "Removeu a sessão de {{patientName}} ({{when}})",
      recordCreated: "Registrou evolução no prontuário de {{patientName}}",
      recordUpdated: "Atualizou evolução no prontuário de {{patientName}}",
      recordDeleted: "Removeu evolução do prontuário de {{patientName}}",
      paymentMarkedPaid: "Marcou como pago a sessão de {{patientName}} ({{when}})",
      paymentMarkedUnpaid:
        "Marcou como não pago a sessão de {{patientName}} ({{when}})",
      paymentMarkedPaidBatch: "Marcou {{count}} sessões como pagas",
      paymentOverdueManualOn:
        "Marcou inadimplência manual para {{patientName}}",
      paymentOverdueManualOff:
        "Removeu inadimplência manual de {{patientName}}",
      paymentOverdueManualAuto:
        "Voltou o controle de inadimplência de {{patientName}} para automático",
    },
  },
  notifications: {
    title: "Notificações",
    subtitle: "Acompanhe menções, mensagens e atualizações da sua conta.",
    new: "{{count}} novas",
    unreadBadge: "{{count}} não lidas",
    markAllRead: "Marcar todas como lidas",
    viewAll: "Ver todas",
    filters: {
      all: "Todas",
      unread: "Não lidas",
      sessions: "Sessões",
      patients: "Pacientes",
      messages: "Mensagens",
      payments: "Pagamentos",
    },
    empty: "Nada por aqui",
    emptyFilter: "Você não tem notificações neste filtro.",
    emptySearchTitle: "Nenhum resultado",
    emptySearch: "Nenhuma notificação corresponde à busca.",
    searchPlaceholder: "Buscar por título ou descrição…",
    markRead: "Marcar como lida",
    remove: "Remover notificação",
    markAllShort: "Marcar todas",
    emptyAll: "Nenhuma notificação.",
    emptyUnread: "Você está em dia! Nenhuma notificação não lida.",
    viewAllNotifications: "Ver todas as notificações",
  },
  alerts: {
    pendingStatus: {
      title: "Status pendente — {{name}}",
      description:
        "A sessão de {{sessionDay}} às {{time}} passou e ainda está como Agendada.",
    },
    unclosedWeek: {
      title: "{{count}} sessões da semana sem fechamento",
      description:
        "Atualize o status de comparecimento na agenda para manter o histórico em dia.",
    },
    todaySession: {
      title: "Sessão hoje — {{name}}",
      description: "Sessão às {{time}}. Marque o status após a sessão.",
    },
    overduePayment: {
      title: "Pagamento em atraso — {{name}}",
      description:
        "{{count}} sessão(ões) em aberto · {{total}}. Confira em A receber.",
    },
    pendingEvolution: {
      title: "Evolução pendente — {{name}}",
      description:
        "Sessão de {{sessionDay}} realizada, mas ainda sem registro no prontuário.",
    },
    unpaidWeek: {
      title: "Conciliação da semana",
      description:
        "{{count}} sessões realizadas esta semana ainda não refletem no financeiro · {{total}}.",
    },
    waitlist: {
      title: "Lista de espera — {{name}}",
      description:
        "Paciente aguardando vaga. Considere agendar a entrevista inicial.",
    },
    pausedPatient: {
      title: "Paciente em pausa — {{name}}",
      description:
        "Em pausa no cadastro. Avalie retorno, encerramento ou manutenção do status.",
    },
    inboxUnread: {
      title: "Caixa de entrada — {{count}} e-mail(s) não lido(s)",
      description: "Mensagens aguardando leitura na caixa de entrada.",
    },
    weeklySummary: {
      title: "Resumo semanal disponível",
      description:
        "Panorama de sessões, pendências de status e alertas financeiros da semana.",
    },
  },
  receivables: {
    title: "Sessões a receber",
    subtitle:
      "Sessões realizadas ainda não pagas — marque como recebidas quando o pagamento for confirmado.",
    markVisiblePaid: "Marcar visíveis como pagas",
    stats: {
      openSessions: "Sessões em aberto",
      openSessionsHint: "Realizadas sem pagamento",
      totalDue: "Total a receber",
      totalDueHint: "Valor consolidado",
      overdue: "Em atraso",
      overdueHint: "Após o mês da sessão",
      overdueAmount: "Valor em atraso",
      prioritize: "Priorize a cobrança",
      noOldPending: "Nenhuma pendência antiga",
    },
    tabs: {
      all: "Todas",
      overdue: "Em atraso",
    },
    listed_one: "{{count}} sessão listada",
    listed_other: "{{count}} sessões listadas",
    empty: {
      overdueTitle: "Nenhuma sessão em atraso",
      overdueDescription: "Não há pendências com mais de uma semana.",
      allTitle: "Tudo recebido por aqui",
      allDescription:
        "Quando uma sessão for realizada e ainda não paga, ela aparece nesta lista.",
    },
    badges: {
      overdue: "Em atraso",
      pending: "Pendente",
    },
    doneToday: "Realizada hoje",
    daysAgo_one: "Há 1 dia",
    daysAgo_other: "Há {{count}} dias",
    profile: "Perfil",
    markPaid: "Marcar paga",
    emptyPatientsDescription:
      "Cadastre pacientes e registre sessões realizadas para acompanhar os pagamentos aqui.",
  },
  finance: {
    title: "Financeiro",
    subtitle: "Acompanhe seus ganhos, recebimentos e indicadores da clínica.",
    emptyDescription:
      "Cadastre seu primeiro paciente para começar a acompanhar receitas e indicadores financeiros.",
    range: {
      months3: "Últimos 3 meses",
      months6: "Últimos 6 meses",
      months12: "Últimos 12 meses",
    },
    kpis: {
      monthRevenue: "Receita do mês",
      billableSessions: "{{count}} sessões cobráveis",
      received: "Recebido",
      receivedPct: "{{pct}}% do faturado",
      pending: "A receber",
      overdueAmount: "{{amount}} em atraso",
      onTrack: "Em dia",
      avgTicket: "Ticket médio",
      forecastSessions: "{{count}} sessões previstas",
    },
    charts: {
      revenueHistory: "Histórico de receita",
      revenueHistoryHint: "Evolução mensal dos ganhos",
      thisMonth: "{{amount}} este mês",
      revenueByModality: "Receita por modalidade",
      revenueByModalityHint: "Distribuição mensal por tipo de sessão",
      topPatients: "Faturamento por paciente",
      topPatientsHint: "Acompanhamentos com maior faturamento acumulado",
      sessionsPerSession: "{{count}} sessões · {{price}}/sessão",
    },
    chartLabels: {
      revenue: "Receita",
    },
  },
  reports: {
    title: "Relatórios",
    subtitle: "Comparecimento, faltas e receita por modalidade no período.",
    subtitleDetail:
      "Comparecimento e receita por modalidade com base nas sessões passadas.",
    monthPlaceholder: "Mês",
    deltaPoints: "p.p.",
    trendRange: {
      months3: "Tendência 3 meses",
      months6: "Tendência 6 meses",
      months12: "Tendência 12 meses",
    },
    emptyDescription:
      "Cadastre pacientes e registre sessões para visualizar comparecimento e receita nos relatórios.",
    range: {
      months3: "Últimos 3 meses",
      months6: "Últimos 6 meses",
      months12: "Últimos 12 meses",
    },
    kpis: {
      attendanceRate: "Taxa de comparecimento",
      sessionsOf: "{{done}} de {{total}} sessões",
      noEvaluated: "Sem sessões avaliadas no mês",
      completed: "Sessões realizadas",
      completedHint: "Comparecimentos confirmados",
      absences: "Faltas",
      absencesHint: "Ausências registradas",
      billableRevenue: "Receita cobrável",
      billableRevenueHint: "Por modalidade no mês",
    },
    charts: {
      attendanceTrend: "Evolução do comparecimento",
      attendanceTrendHint:
        "Taxa mensal de sessões realizadas sobre realizadas + faltas",
      selectedMonth: "{{rate}} no mês selecionado",
      attendanceByModality: "Comparecimento por modalidade",
      attendanceByModalityHint: "Taxa de presença no mês por tipo de sessão",
      revenueByModality: "Receita por modalidade",
      revenueByModalityHint: "Sessões cobráveis do mês por tipo de sessão",
      sessionOutcomes: "Desfecho das sessões",
      sessionOutcomesHint:
        "Distribuição de status nas sessões já ocorridas no mês",
      outcomeRow: "{{count}} sessões · {{pct}}%",
      tooltipAttendance:
        "{{rate}}% ({{done}} realizadas · {{missed}} faltas)",
      tooltipRate: "{{rate}}% · {{done}} realizadas · {{missed}} faltas",
    },
    chartLabels: {
      attendance: "Comparecimento",
      rate: "Taxa",
      revenue: "Receita",
    },
    empty: {
      noPastSessions:
        "Nenhuma sessão passada com status realizado ou falta neste mês.",
      noBillableRevenue: "Nenhuma receita cobrável registrada neste mês.",
      noPastSessionsMonth: "Nenhuma sessão passada registrada neste mês.",
    },
  },
  calendar: {
    previous: "Anterior",
    next: "Próximo",
    today: "Hoje",
    views: {
      month: "Mês",
      week: "Semana",
      day: "Dia",
    },
    newSession: "Nova sessão",
    legend: "Legenda",
    weekdays: {
      sun: "Dom",
      mon: "Seg",
      tue: "Ter",
      wed: "Qua",
      thu: "Qui",
      fri: "Sex",
      sat: "Sáb",
    },
    sessions_one: "{{count}} sessão",
    sessions_other: "{{count}} sessões",
    sessionSingular: "sessão",
    sessionPlural: "sessões",
    events_one: "{{count}} sessão",
    events_other: "{{count}} sessões",
    noEventsDay: "Nenhuma sessão neste dia.",
    clickToEdit: "Clique para editar",
    duplicateSessionTitle: "Sessão duplicada",
    duplicateSessionDescription:
      "Você acabou de criar uma sessão com as mesmas informações (paciente, data e horário).",
  },
  patients: {
    title: "Pacientes",
    subtitle: "Gerencie seus pacientes, acompanhamentos e próximas sessões.",
    activeBadge: "{{count}} ativos",
    searchPlaceholder: "Buscar por nome, e-mail, CPF ou queixa...",
    statusPlaceholder: "Status",
    allStatuses: "Todos os status",
    count: "{{count}} pacientes",
    notFound: "Nenhum paciente encontrado",
    notFoundHint:
      "Ajuste a busca ou o filtro de status, ou limpe os filtros para ver todos.",
    clearFilters: "Limpar filtros",
    columns: {
      patient: "Paciente",
      complaint: "Queixa",
      modality: "Modalidade",
      status: "Status",
      nextSession: "Próxima sessão",
      price: "Valor",
      sessions: "Sessões",
    },
    actions: {
      viewProfile: "Ver perfil",
      schedule: "Agendar sessão",
      newNote: "Nova evolução",
      menu: "Ações",
      menuAria: "Ações de {{name}}",
      viewRecord: "Ver prontuário",
    },
    profile: {
      back: "Voltar",
      edit: "Editar",
      scheduleSession: "Agendar sessão",
      stats: {
        completedSessions: "Sessões realizadas",
        patientSince: "Paciente desde",
        sessionPrice: "Valor da sessão",
        nextSession: "Próxima sessão",
      },
      tabs: {
        overview: "Visão geral",
        sessions: "Histórico de sessões",
        records: "Prontuário",
      },
      sections: {
        personal: "Dados pessoais",
        contact: "Contato",
        address: "Endereço",
        care: "Acompanhamento",
        schedule: "Horários",
        financial: "Resumo financeiro",
        danger: "Zona de perigo",
      },
      fields: {
        fullName: "Nome completo",
        cpf: "CPF",
        birthDate: "Data de nascimento",
        gender: "Gênero",
        patientType: "Tipo de paciente",
        email: "E-mail",
        phone: "Telefone",
        emergencyContact: "Contato de emergência",
        emergencyPhone: "Telefone de emergência",
        relation: "Parentesco",
        cep: "CEP",
        street: "Logradouro",
        number: "Número",
        complement: "Complemento",
        neighborhood: "Bairro",
        city: "Cidade",
        state: "Estado",
        complaint: "Queixa principal",
        modality: "Modalidade",
        therapyStart: "Início da terapia",
        referral: "Encaminhamento",
        sessionPrice: "Valor da sessão",
        notes: "Observações",
        frequency: "Frequência",
        sessionDay: "Dia da sessão",
        sessionTime: "Horário",
        pricePerSession: "Valor por sessão",
        received: "Recebido",
        receivable: "A receber",
        overdueStatus: "Status de inadimplência",
        pendingSessions: "Sessões pendentes",
      },
      payment: {
        overdue: "Inadimplente",
        onTrack: "Em dia",
        auto: "Automático (por sessões)",
        markOverdue: "Marcar inadimplente",
        markClear: "Marcar em dia",
        overdueHint: " · em atraso",
        markPaid: "Marcar paga",
      },
      delete: {
        title: "Excluir paciente?",
        description:
          "{{name}} e todo o prontuário, agenda e histórico financeiro associados serão removidos permanentemente.",
        confirm: "Excluir paciente",
        dangerDescription:
          "Excluir {{name}} remove permanentemente o cadastro, prontuário, sessões agendadas e registros financeiros deste paciente.",
      },
    },
    sessions: {
      title: "Histórico de sessões",
      subtitle: "Sessões passadas e as agendadas até o fim do mês atual de {{name}}.",
      stats: {
        total: "Total no mês",
        completed: "Realizadas",
        upcoming: "Próximas",
        absences: "Faltas / canceladas",
      },
      listTitle: "Sessões recentes e próximas",
      record_one: "{{count}} registro",
      record_other: "{{count}} registros",
      emptyTitle: "Nenhuma sessão na agenda",
      emptyDescription: "Agende uma sessão pelo botão no topo do perfil.",
      newSession: "Nova sessão",
      rescheduledFrom: "Reagendada a partir do horário original",
      originalSlot: "Horário original",
      replaced: "Substituído",
    },
    records: {
      title: "Prontuário clínico",
      subtitle: "Histórico de evolução e notas clínicas de {{name}}.",
      newNote: "Novo registro",
      stats: {
        notes: "Registros",
        lastSession: "Última sessão vinculada",
        tags: "Tags distintas",
      },
      latestNote: "Último registro",
      sessionBadge: "Sessão {{number}} · {{date}}",
      standaloneBadge: "Destacado · {{date}}",
      planPrefix: "Plano:",
      historyTitle: "Histórico do prontuário",
      sessionNumber: "Sessão {{number}}",
      standaloneTitle: "Registro destacado",
      badgeLinked: "Sessão",
      badgeStandalone: "Destacado",
      summary: "Resumo",
      evolution: "Evolução clínica",
      plan: "Plano / tarefa",
      editNote: "Editar registro",
      deleteNote: "Excluir registro",
      emptyTitle: "Nenhum registro no prontuário",
      emptyDescription:
        "Registre uma evolução vinculada a uma sessão ou um registro destacado.",
      delete: {
        title: "Excluir registro?",
        description:
          "A nota da sessão {{number}} ({{date}}) será removida permanentemente do prontuário de {{name}}.",
        descriptionLinked:
          "A evolução da sessão {{number}} ({{date}}) será removida permanentemente do prontuário de {{name}}.",
        descriptionStandalone:
          "O registro destacado de {{date}} será removido permanentemente do prontuário de {{name}}.",
        confirm: "Excluir registro",
      },
    },
  },
  sessionForm: {
    newSession: "Nova sessão",
    newSessionHint: "Preencha data, horário e paciente.",
    dragToMove: "Arraste para mover",
    patient: "Paciente",
    date: "Data",
    start: "Início",
    duration: "Duração",
    modality: "Modalidade",
    amount: "Valor da sessão",
    amountHint: "Usado no financeiro quando a sessão for realizada.",
    selectPatient: "Selecione o paciente",
    searchPatient: "Buscar paciente...",
    selectDate: "Selecionar data",
    selectTime: "Selecionar horário",
    durationPlaceholder: "Duração",
    schedule: "Agendar sessão",
    scheduleFor: "Nova sessão para {{name}}. Horário recorrente sugerido automaticamente.",
    editTitle: "Editar sessão",
    editRescheduled: " Reagendada de {{from}}.",
    editDefault: " Ajuste horário, data ou comparecimento.",
    deleteTitle: "Excluir sessão?",
    deleteDescription:
      "A sessão de {{title}} em {{date}} às {{time}} será removida da agenda permanentemente.",
    deleteConfirm: "Excluir sessão",
    sessionStatus: "Status da sessão",
    absenceNotice: "Falta com aviso prévio",
    absenceNoticeHint: "Paciente avisou com antecedência.",
    payment: "Pagamento",
    paid: "Esta sessão está marcada como paga.",
    unpaid: "Sessão pendente de recebimento.",
    undoPayment: "Desfazer pagamento",
    markPaid: "Marcar como paga",
    originalSession: "Sessão original",
    save: "Salvar",
    saveChanges: "Salvar alterações",
    patientDefault: "Padrão do paciente: {{price}}",
    absenceNoticeQuestion: "Houve aviso prévio?",
    absenceNoticeNoCharge: "Com aviso, a sessão não é cobrada.",
    durationMinutes: "{{count}} min",
  },
  patientForm: {
    titleNew: "Novo paciente",
    titleEdit: "Editar paciente",
    descNew: "Cadastre um novo paciente. Apenas o nome é obrigatório.",
    descEdit: "Atualize os dados cadastrais e clínicos do paciente.",
    saveChanges: "Salvar alterações",
    addPatient: "Adicionar paciente",
    sections: {
      personal: "Dados pessoais",
      address: "Endereço",
      contact: "Contato",
      therapy: "Informações da terapia",
      schedules: "Horários recorrentes",
      notes: "Observações",
    },
    other: "Outro",
    selectPlaceholder: "Selecione…",
    genderOtherPlaceholder: "Digite o gênero",
    referralPlaceholder: "Como chegou ao tratamento?",
    referralOtherPlaceholder: "De onde veio a indicação?",
    frequencyPlaceholder: "Selecione a frequência",
    weekdayPlaceholder: "Selecione o dia",
    addSchedule: "Adicionar horário",
    removeSchedule: "Remover horário",
    otherSpecify: "Outro (especificar)",
    cepNotFound: "CEP não encontrado",
    noSchedules:
      "Nenhum horário cadastrado. Adicione o dia e horário da sessão recorrente.",
    durationMinutes: "{{count}} min",
    fields: {
      fullName: "Nome completo",
      birthDate: "Data de nascimento",
      cpf: "CPF",
      gender: "Gênero",
      genderOther: "Especifique o gênero",
      cep: "CEP",
      street: "Rua / Logradouro",
      number: "Número",
      complement: "Complemento",
      neighborhood: "Bairro",
      city: "Cidade",
      state: "UF",
      mobile: "Celular",
      email: "E-mail",
      contactName: "Contato próximo · Nome",
      contactPhone: "Contato próximo · Telefone",
      contactRelation: "Relação",
      complaint: "Queixa principal",
      patientType: "Tipo de paciente",
      status: "Status",
      therapyStart: "Início da terapia",
      sessionPrice: "Valor da sessão",
      modality: "Modalidade",
      referral: "Indicação",
      referralOther: "Especifique a indicação",
      sessionFrequency: "Frequência das sessões",
      weekday: "Dia da semana",
      time: "Horário",
      duration: "Duração",
    },
    placeholders: {
      fullName: "Ex.: Maria Silva",
      birthDate: "Selecionar data",
      cpf: "Ex.: 123.456.789-00",
      cep: "Digite o CEP",
      street: "Ex.: Rua das Flores, 100",
      number: "Número",
      complement: "Apto, bloco…",
      neighborhood: "Bairro",
      city: "Cidade",
      state: "SP",
      mobile: "Ex.: (11) 98765-4321",
      email: "nome@email.com",
      optional: "Opcional",
      contactRelation: "Mãe, irmão…",
      complaint: "Ansiedade, luto, relacionamento…",
      therapyStart: "Selecionar data",
      sessionPrice: "Ex.: 200,00",
      time: "Selecionar horário",
      duration: "Duração",
      notes: "Anotações adicionais (opcional)",
    },
    frequencyDescriptions: {
      "1x-mes": "1 sessão por mês",
      "2x-mes": "Quinzenal — a cada 2 semanas",
      "3x-mes": "3 sessões por mês",
      "4x-mes": "Semanal — toda semana",
    },
    options: {
      gender: {
        Feminino: "Feminino",
        Masculino: "Masculino",
        "Não-binário": "Não-binário",
        "Mulher trans": "Mulher trans",
        "Homem trans": "Homem trans",
        "Prefiro não informar": "Prefiro não informar",
      },
      referral: {
        Amigo: "Amigo",
        Familiar: "Familiar",
        "Rede social": "Rede social",
        Médico: "Médico",
        "Outro profissional de saúde": "Outro profissional de saúde",
        Convênio: "Convênio",
        "Busca na internet": "Busca na internet",
      },
      patientType: {
        "Primeira entrevista": "Primeira entrevista",
        Recorrente: "Recorrente",
      },
      weekdays: {
        Seg: "Segunda-feira",
        Ter: "Terça-feira",
        Qua: "Quarta-feira",
        Qui: "Quinta-feira",
        Sex: "Sexta-feira",
        Sáb: "Sábado",
        Dom: "Domingo",
      },
    },
  },
  sessionNote: {
    titleNew: "Novo registro",
    titleEdit: "Editar registro",
    descCreate:
      "Registre a evolução de {{name}}. Resumo e evolução clínica são obrigatórios.",
    descEdit:
      "Atualize o registro de {{name}}. Resumo e evolução clínica são obrigatórios.",
    linkMode: {
      label: "Tipo de registro",
      linked: "Vincular à sessão",
      linkedHint: "Usa data e horário da agenda",
      standalone: "Registro destacado",
      standaloneHint: "Sem vínculo com a agenda",
    },
    selectSession: "Sessão da agenda",
    searchSession: "Buscar sessão...",
    noLinkableSessions:
      "Não há sessões disponíveis para vincular. Agende uma sessão ou use um registro destacado.",
    sessionDate: "Data da sessão",
    recordDate: "Data do registro",
    sessionNumber: "Nº da sessão",
    sessionNumberLabel: "{{number}}ª sessão",
    mood: "Humor / estado",
    modality: "Modalidade",
    summary: "Resumo",
    evolution: "Evolução clínica",
    plan: "Plano / tarefa de casa",
    tags: "Tags",
    save: "Salvar registro",
    create: "Registrar",
    saveChanges: "Salvar alterações",
    selectOptional: "Selecione (opcional)",
    errors: {
      selectSession: "Selecione uma sessão da agenda para vincular.",
      sessionAlreadyLinked:
        "Esta sessão já possui uma evolução no prontuário.",
    },
    sections: {
      identification: {
        title: "Identificação",
        description:
          "Escolha se o registro se liga a uma sessão ou fica destacado.",
      },
      clinical: {
        title: "Registro clínico",
        description: "Conteúdo principal deste registro no prontuário.",
      },
    },
    placeholders: {
      selectSession: "Selecionar sessão",
      sessionDate: "Selecionar data da sessão",
      recordDate: "Selecionar data do registro",
      summary: "O que foi trabalhado, queixas e contexto...",
      evolution: "Observações clínicas, progressos e insights...",
      plan: "Próximos passos acordados com o paciente...",
      tags: "TCC, Ansiedade, Progresso",
    },
    hints: {
      summary: "Temas abordados, queixas trazidas e contexto.",
      evolution:
        "Progressos observados, intervenções realizadas e impressões clínicas.",
      plan: "Opcional — próximos passos acordados com o paciente.",
      tags: "Separe por vírgula — ex.: TCC, Ansiedade, Progresso.",
    },
  },
  demo: {
    notifications: {
      "1": {
        title: "Status pendente — {{name}}",
        description:
          "A sessão de {{sessionDay}} às {{time}} passou e ainda está como Agendada.",
      },
      "2": {
        title: "Status pendente — {{name}}",
        description:
          "A sessão de {{sessionDay}} às {{time}} passou sem comparecimento registrado.",
      },
      "3": {
        title: "Sessão hoje — {{name}}",
        description:
          "Sessão às {{time}}. Marque o status após a sessão.",
      },
      "4": {
        title: "Inadimplência — {{name}}",
        description:
          "Pagamento em aberto no cadastro. Atualize o financeiro após o contato com o paciente.",
      },
      "5": {
        title: "Evolução pendente — {{name}}",
        description:
          "Sessão marcada como realizada ontem, mas ainda sem registro no prontuário.",
      },
      "6": {
        title: "3 sessões da semana sem fechamento",
        description:
          "Atualize o status de comparecimento na agenda para manter o histórico em dia.",
      },
      "7": {
        title: "Lista de espera — {{name}}",
        description:
          "Paciente aguardando vaga há 2 semanas. Considere agendar a entrevista inicial.",
      },
      "8": {
        title: "Paciente em pausa — {{name}}",
        description:
          "Em pausa no cadastro. Avalie retorno, encerramento ou manutenção do status.",
      },
      "9": {
        title: "Conciliação da semana",
        description:
          "Há sessões realizadas esta semana que ainda não refletem no resumo financeiro.",
      },
      "10": {
        title: "Caixa de entrada — 2 e-mails não lidos",
        description: "Dois e-mails aguardando leitura na caixa de entrada.",
      },
      "11": {
        title: "Resumo semanal disponível",
        description:
          "Panorama de sessões, pendências de status e alertas financeiros da semana.",
      },
    },
    inbox: {
      dates: {
        today: "Hoje",
        yesterday: "Ontem",
        days2: "2 dias",
        days3: "3 dias",
      },
      labels: {
        patient: "Paciente",
        session: "Sessão",
        calendar: "Agenda",
        financial: "Financeiro",
        followUp: "Acompanhamento",
        waitlist: "Lista de espera",
        documents: "Documentos",
      },
      emails: {
        "1": {
          subject: "Confirmação da sessão de quarta",
          preview:
            "Oi! Só confirmando nossa sessão de quarta às 09h. Estarei online pelo link de sempre.",
          body: {
            "0": "Oi! Só confirmando nossa sessão de quarta às 09h. Estarei online pelo link de sempre.",
            "1": "Se precisar de algo antes, me avise por aqui.",
            "2": "Abraços,\nMariana",
          },
        },
        "2": {
          subject: "Remarcação da sessão de quinta",
          preview:
            "Consigo remarcar a sessão de quinta para 15h? Surgiu um compromisso no trabalho.",
          body: {
            "0": "Olá! Consigo remarcar a sessão de quinta para 15h? Surgiu um compromisso no trabalho.",
            "1": "Se não der, mantenho o horário das 14h30 mesmo.",
            "2": "Obrigada,\nCamila",
          },
        },
        "3": {
          subject: "Comprovante de pagamento",
          preview:
            "Segue o comprovante da sessão desta semana. Qualquer divergência, me avise.",
          body: {
            "0": "Bom dia! Segue o comprovante da sessão desta semana.",
            "1": "Qualquer divergência, me avise.",
            "2": "Rafael",
          },
        },
        "4": {
          subject: "Relato após exercício de respiração",
          preview:
            "Tentei o exercício que combinamos e senti menos tensão antes de dormir.",
          body: {
            "0": "Oi! Tentei o exercício que combinamos e senti menos tensão antes de dormir.",
            "1": "Posso te contar com mais detalhes na sessão de sexta?",
            "2": "Juliana",
          },
        },
        "5": {
          subject: "Dúvida sobre tarefa de exposição",
          preview:
            "Fiquei em dúvida sobre a escala de ansiedade na tarefa da semana.",
          body: {
            "0": "Olá! Fiquei em dúvida sobre a escala de ansiedade na tarefa da semana.",
            "1": "Devo registrar antes e depois de cada exposição?",
            "2": "Gustavo",
          },
        },
        "6": {
          subject: "Disponibilidade para avaliação inicial",
          preview:
            "Gostaria de saber se há vaga para avaliação inicial nas quintas à tarde.",
          body: {
            "0": "Olá! Gostaria de saber se há vaga para avaliação inicial nas quintas à tarde.",
            "1": "Posso começar ainda neste mês, se houver horário.",
            "2": "Fernanda",
          },
        },
        "7": {
          subject: "Relato de sono na última semana",
          preview:
            "Dormi melhor em 4 das 7 noites depois de ajustar a rotina noturna.",
          body: {
            "0": "Oi! Dormi melhor em 4 das 7 noites depois de ajustar a rotina noturna.",
            "1": "Anotei os horários no diário que você sugeriu.",
            "2": "Carolina",
          },
        },
        "8": {
          subject: "Documentos para avaliação inicial",
          preview:
            "Envio em anexo o formulário preenchido e a autorização assinada.",
          body: {
            "0": "Boa tarde! Envio em anexo o formulário preenchido e a autorização assinada.",
            "1": "Aguardo confirmação da avaliação inicial de segunda.",
            "2": "Pedro",
          },
        },
        "9": {
          subject: "Retorno sobre sessão de ontem",
          preview:
            "A conversa sobre autocrítica no trabalho me ajudou a enxergar padrões.",
          body: {
            "0": "Olá! A conversa sobre autocrítica no trabalho me ajudou a enxergar padrões.",
            "1": "Queria registrar isso antes da próxima sessão.",
            "2": "Leonardo",
          },
        },
        "10": {
          subject: "Primeira sessão — dúvidas logísticas",
          preview:
            "Confirmando se a sessão de sexta será online e qual plataforma usamos.",
          body: {
            "0": "Oi! Confirmando se a sessão de sexta será online e qual plataforma usamos.",
            "1": "É minha primeira sessão e quero chegar preparada.",
            "2": "Nora",
          },
        },
      },
    },
  },
  guestNotifications: {
    common: {
      nextSession: "Próxima: {{date}}",
    },
    newPatient: {
      title: "Paciente cadastrado — {{name}}",
      complaint: "Queixa: {{complaint}}",
      recurringSlot: "Horário recorrente: {{day}} às {{time}}",
      price: "Valor: {{price}}",
      nextStep:
        "Próximo passo: agendar a primeira sessão ou registrar a entrevista.",
    },
    updatedPatient: {
      title: "Paciente atualizado — {{name}}",
      description:
        "{{details}}. Cadastro e agenda recorrente sincronizados.",
    },
    deletedPatient: {
      title: "Paciente removido — {{name}}",
      description:
        "Cadastro, prontuário, sessões agendadas e registros financeiros deste paciente foram excluídos permanentemente.",
    },
    scheduledSession: {
      title: "Sessão agendada — {{name}}",
      description:
        "{{details}}. Status: {{status}}. Veja na agenda semanal ou no perfil.",
    },
    updatedSession: {
      title: "Sessão atualizada — {{name}}",
      description: "{{slot}}. {{changes}}",
      changeDate: "Data: {{from}} → {{to}}",
      changeTime: "Horário: {{from}} → {{to}}",
      changeStatus: "Status: {{from}} → {{to}}",
      noChanges: "Detalhes da sessão foram atualizados.",
    },
    movedSession: {
      title: "Sessão remarcada — {{name}}",
      description: "De {{from}} para {{to}}. Status: {{status}}.",
    },
    sessionStatusChange: {
      title: "Status da sessão — {{name}}",
      description:
        "{{slot}}. {{from}} → {{to}}. Financeiro e histórico atualizados.",
    },
    sessionNote: {
      titleRegistered: "Evolução registrada — {{name}}",
      titleUpdated: "Evolução atualizada — {{name}}",
      sessionOrdinal: "{{count}}ª sessão",
      plan: " Plano: {{plan}}.",
      tags: " Tags: {{tags}}.",
    },
    deletedSession: {
      title: "Sessão excluída — {{name}}",
      description: "{{slot}} · {{status}} removida da agenda.{{paidNote}}",
      paidNoteRemoved:
        " Pagamento registrado nesta sessão também foi removido.",
    },
    deletedSessionNote: {
      title: "Evolução removida — {{name}}",
      description: "{{date}} · {{session}}. Removido: {{summary}}.",
    },
    eventPayment: {
      titlePaid: "Pagamento registrado — {{name}}",
      titleReverted: "Pagamento revertido — {{name}}",
      descriptionPaid:
        "{{slot}} · {{amount}}. Receita atualizada no financeiro e na aba A receber.",
      descriptionReverted:
        "{{slot}} · {{amount}}. Sessão voltou para pendente de pagamento.",
    },
    bulkEventPayment: {
      title: "{{count}} sessões marcadas como pagas",
      description: "Total de {{total}} registrado no financeiro.",
    },
    paymentOverdueOverride: {
      title: "Inadimplência — {{name}}",
      description:
        "Status definido como {{label}}. O financeiro e os alertas passam a usar essa regra.",
      labelOverdue: "Inadimplente (manual)",
      labelCurrent: "Em dia (manual)",
      labelAuto: "Automático (por sessões)",
    },
  },
  roadmap: {
    progress: "Progresso da v1.0",
    sections: {
      done: {
        title: "Já entregue",
        description: "O que compõe a base visual e funcional do Lume hoje.",
      },
      next: {
        title: "Próximos passos",
        description: "Prioridade imediata para fechar a v1.0 com dados de demo.",
      },
      planned: {
        title: "Planejado na v1.0",
        description: "Complementos que fecham o ciclo clínico antes do backend.",
      },
      later: {
        title: "Depois da v1.0",
        description: "Infraestrutura e escala — Supabase entra por último.",
      },
    },
    status: {
      done: "Entregue",
      next: "Em andamento",
      planned: "Planejado",
      later: "Futuro",
    },
    heroTitle: "Roteiro e próximos passos",
    stats: {
      delivered: "Entregues",
      next: "Próximos",
      planned: "Planejados",
      total: "Total",
    },
    items_one: "{{count}} item",
    items_other: "{{count}} itens",
    currentFocus: "Foco atual",
    infrastructure: "Infraestrutura",
    infrastructureLater: "Depois",
    goal: "Meta",
    releaseStrategy: "Estratégia de release",
    releaseStrategyHint:
      "Três ondas claras antes de ir para produção com Supabase.",
    ruleTitle: "Regra da v1.0",
    ruleDescription:
      "Nada de Supabase até o fluxo clínico de demo estar redondo. Primeiro produto, depois infraestrutura.",
    infrastructureLast: "Infraestrutura por último",
    meta: {
      versionLabel: "v1.1 — Modo convidado e refinamentos",
      subtitle:
        "Milestone v1.1: persistência local, CRUD clínico convidado, estados vazios, formulários refinados e planilha Dados polida.",
    },
    waves: {
      "1": {
        title: "Experiência clínica",
        body: "Prontuário, editar paciente e agendar pelo perfil.",
      },
      "2": {
        title: "Operação completa",
        body: "Status de sessão, financeiro integrado e busca global.",
      },
      "3": {
        title: "Persistência",
        body: "Supabase, auth real e deploy — só após fechar a v1.0 mock.",
      },
    },
    tags: {
      ui: "UI",
      theme: "Tema",
      data: "Dados",
      dashboard: "Painel",
      patients: "Pacientes",
      calendar: "Agenda",
      finance: "Financeiro",
      communication: "Comunicação",
      notifications: "Notificações",
      account: "Conta",
      loginDemo: "Login demo",
      clinical: "Clínico",
      shipped: "Entregue",
      management: "Gestão",
      ux: "UX",
      infrastructure: "Infraestrutura",
      authentication: "Autenticação",
      demo: "Demo",
      forms: "Formulários",
    },
    items: {
      setup: {
        title: "Base do app Lume",
        description:
          "React + Vite + TypeScript, Tailwind v4, shadcn/ui e tema visual navy/creme/menta.",
        phase: "Fundação",
      },
      "mock-data": {
        title: "Camada de dados mock",
        description:
          "30 pacientes com perfil rico, agenda derivada, notificações e inbox centralizados no provider.",
        phase: "Fundação",
      },
      home: {
        title: "Início / painel do dia",
        description:
          "Resumo de sessões, estatísticas da semana, receita prevista e alertas de inadimplência.",
        phase: "Telas core",
      },
      patients: {
        title: "Pacientes + perfil completo",
        description:
          "Lista com filtros, perfil detalhado, cadastro com CEP automático (ViaCEP), modal estável com Select e 30 perfis preenchidos.",
        phase: "Telas core",
      },
      calendar: {
        title: "Agenda semanal",
        description:
          "Grid com drag-and-drop, legenda de status, criação de sessão e modal alinhado à identidade do novo paciente.",
        phase: "Telas core",
      },
      finance: {
        title: "Financeiro",
        description:
          "Painel com gráficos, receita mensal, inadimplência e visão por modalidade.",
        phase: "Telas core",
      },
      inbox: {
        title: "Caixa de entrada",
        description:
          "Lista de e-mails mock, leitura lateral, busca e tabs alinhadas ao design system.",
        phase: "Telas core",
      },
      notifications: {
        title: "Notificações",
        description:
          "Sino no header, dropdown refinado e página completa com filtros e agrupamento por data.",
        phase: "Telas core",
      },
      account: {
        title: "Modal de conta",
        description:
          "Shell navy com inset branco, perfil, segurança, notificações e aparência.",
        phase: "Telas core",
      },
      login: {
        title: "Tela de login",
        description:
          "Layout split navy/creme, campos e botões alinhados ao restante do app.",
        phase: "Telas core",
      },
      records: {
        title: "Prontuário / evolução clínica",
        description:
          "Notas de sessão, histórico de evolução, aba dedicada no perfil e cadastro de novas evoluções.",
        phase: "v1.0 — Prioridade",
      },
      "edit-patient": {
        title: "Editar paciente",
        description:
          "Formulário de cadastro reutilizado para atualizar dados existentes a partir do perfil.",
        phase: "v1.0 — Prioridade",
      },
      "schedule-from-profile": {
        title: "Agendar sessão pelo perfil",
        description:
          "Botão no perfil abre fluxo de agendamento já preenchendo paciente e horário recorrente.",
        phase: "v1.0 — Prioridade",
      },
      "session-status": {
        title: "Status da sessão",
        description:
          "Marcar como realizada, faltou ou remarcada — base para comparecimento e cobrança.",
        phase: "v1.0",
      },
      "session-history": {
        title: "Histórico de sessões no perfil",
        description:
          "Aba dedicada no perfil com timeline de sessões, remarcações conectadas e faixa lateral por status.",
        phase: "v1.0",
      },
      export: {
        title: "Exportação de dados",
        description:
          "XLSX estilizado com 9 abas (pacientes, agenda, prontuário, financeiro por sessão e relatórios). Botão no header global.",
        phase: "v1.0",
      },
      "unpaid-sessions": {
        title: "Sessões a receber",
        description:
          "Página consolidada de sessões realizadas não pagas, filtros, marcar como paga, navegação no Início e pagamento por sessão.",
        phase: "v1.0",
      },
      "login-transition": {
        title: "Transição login → app",
        description:
          "Crossfade com AnimatePresence — entrada e saída suaves por opacidade, sem morph de layout.",
        phase: "v1.0",
      },
      "finance-agenda": {
        title: "Agenda ↔ Financeiro",
        description:
          "Cobrança por status (realizada / faltou sem aviso), valor por sessão, atraso após o mês, inadimplência automática com override no perfil, Financeiro e Início com dados reais.",
        phase: "v1.0",
      },
      "global-search": {
        title: "Busca global",
        description:
          "Pill no header, Cmd+K, modal creme com índice otimizado, destaque do item selecionado, botão X para limpar e ações rápidas.",
        phase: "v1.0",
      },
      "recurring-calendar": {
        title: "Agenda recorrente",
        description:
          "Sessões geradas a partir do horário do paciente — sem preencher datas anteriores ao cadastro (recurrenceFrom).",
        phase: "v1.1 — Modo convidado",
      },
      "search-input-clear": {
        title: "Limpar busca nos campos",
        description:
          "Campo de busca reutilizável com X no fim e hover azul Luma — Pacientes, caixa de entrada e busca global.",
        phase: "v1.0",
      },
      "calendar-card-consistency": {
        title: "Consistência visual da agenda",
        description:
          "Cards com mesma intensidade por status — deduplicação de horários (presencial+online), fundos opacos equivalentes e sync de status em sessões passadas.",
        phase: "v1.0",
      },
      "custom-scrollbar": {
        title: "Barra de rolagem customizada",
        description:
          "ScrollArea próprio (Radix), barra nativa do SO oculta e thumb Luma sem setas — caixa de entrada, modais e listas.",
        phase: "v1.0",
      },
      reports: {
        title: "Relatórios na UI",
        description:
          "Taxa de comparecimento, evolução mensal, desfecho das sessões e receita por modalidade — página dedicada com filtros por mês.",
        phase: "v1.0",
      },
      supabase: {
        title: "Supabase + auth real",
        description:
          "Persistência, login de verdade e sincronização — só depois de fechar a v1.0 mock.",
        phase: "Pós v1.0",
      },
      "guest-mode": {
        title: "Modo convidado (localStorage)",
        description:
          "Entrada sem login, dados persistidos no navegador, nome na 1ª visita e exclusão de conta na aba Conta.",
        phase: "v1.1 — Modo convidado",
      },
      themes: {
        title: "Temas Refúgio, Lume e Coral",
        description:
          "Três paletas com contraste ajustado na sidebar e menu ativo legível em cada tema.",
        phase: "v1.1 — Modo convidado",
      },
      "edit-delete-note": {
        title: "Editar e excluir evolução",
        description:
          "Ações no prontuário com confirmação ao excluir; modal reutilizado para edição com recálculo de sessões.",
        phase: "v1.1 — Modo convidado",
      },
      "delete-patient": {
        title: "Excluir paciente",
        description:
          "Zona de perigo no perfil remove paciente, prontuário, agenda e sessões associadas.",
        phase: "v1.1 — Modo convidado",
      },
      "guest-profile-name": {
        title: "Salvar nome do convidado no perfil",
        description:
          "Campo de nome na aba Perfil da Conta persiste no localStorage e atualiza o header.",
        phase: "v1.1 — Modo convidado",
      },
      "patient-notes-field": {
        title: "Observações do paciente",
        description:
          "Persistir o campo de observações do formulário de cadastro/edição no tipo Patient.",
        phase: "v1.1 — Modo convidado",
      },
      "patient-list-actions": {
        title: "Agendar e anotações na lista",
        description:
          "Menus de ação rápida na lista de pacientes abrem agendamento ou nova evolução direto.",
        phase: "v1.1 — Modo convidado",
      },
      "inbox-retained": {
        title: "Caixa de entrada (UI demo mantida)",
        description:
          "Página preservada como protótipo visual; integração real com e-mail fica para depois.",
        phase: "v1.1 — Modo convidado",
      },
      "toast-system": {
        title: "Sistema de toasts",
        description:
          "Confirmações rápidas no canto da tela, padrão inferior direito, com posição configurável em Conta → Aparência.",
        phase: "v1.1 — Modo convidado",
      },
      "guest-notifications": {
        title: "Notificações automáticas no modo convidado",
        description:
          "Gerar alertas locais ao cadastrar paciente, agendar sessão ou registrar evolução.",
        phase: "v1.1 — Modo convidado",
      },
      "delete-session": {
        title: "Excluir sessão na agenda",
        description:
          "Remover sessão criada por engano, com confirmação e ajuste de contadores no modo convidado.",
        phase: "v1.1 — Modo convidado",
      },
      "guest-empty-states": {
        title: "Estados vazios no modo convidado",
        description:
          "Pacientes, Início, Financeiro, A receber e Relatórios reconhecem clínica vazia e convidam a cadastrar o primeiro paciente.",
        phase: "v1.1 — Modo convidado",
      },
      "home-agenda-navigation": {
        title: "Início → agenda do dia",
        description:
          "Clicar sessão no Início ou na busca global abre a agenda na visão Dia, sem abrir o modal de edição.",
        phase: "v1.1 — Modo convidado",
      },
      "form-pickers": {
        title: "Date e time pickers nos formulários",
        description:
          "Calendário clicável para datas, seletor de hora/minuto nos horários recorrentes e placeholders mais sutis.",
        phase: "v1.1 — Modo convidado",
      },
      "input-masks": {
        title: "Máscaras de CPF e celular",
        description:
          "Formatação automática ao digitar no cadastro de paciente — DDD separado e CPF pontuado.",
        phase: "v1.1 — Modo convidado",
      },
      "sheet-scroll-ux": {
        title: "Planilha Dados mais legível",
        description:
          "Barra horizontal mais visível e arrastável na visão em planilha; respiro à direita para a última coluna não ficar cortada.",
        phase: "v1.1 — Modo convidado",
      },
    },
  },
} as const