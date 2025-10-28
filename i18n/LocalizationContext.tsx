import React, {
  createContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { Language } from '../types';

// FIX: This file was missing its content. Replaced placeholder text with a complete React component for localization.
// Embedded translations
const translations: Record<Language, Record<string, string>> = {
  [Language.EN]: {
    // General
    welcome_user: 'Welcome, {name}',
    logout: 'Logout',
    cancel: 'Cancel',
    submit: 'Submit',
    send: 'Send',
    yes: 'Yes',
    no: 'No',
    user: 'User',
    status: 'Status',
    date: 'Date',
    action: 'Action',
    reason: 'Reason',

    // Language
    select_language: 'Select Language',

    // Login & Account
    login_to_your_account: 'Login to Your Account',
    email_address: 'Email Address',
    email_placeholder: 'you@example.com',
    password: 'Password',
    login: 'Login',
    login_error_invalid_credentials:
      'Invalid email or password. Please try again.',
    dont_have_account: "Don't have an account?",
    create_account: 'Create an account',
    back_to_login: 'Back to Login',
    create_account_title: 'Open a New USALLI BANK Account',

    // Create Account Form Sections
    section_personal_info: 'Personal Information',
    full_name: 'Full Name',
    date_of_birth: 'Date of Birth',
    ssn_itin: 'SSN / ITIN',
    phone: 'Phone Number',
    current_address: 'Current Address',
    id_document: "ID Document (Passport, Driver's License)",

    section_professional_info: 'Professional Situation',
    employment_status: 'Employment Status',
    status_employed: 'Employed',
    status_self_employed: 'Self-employed',
    status_unemployed_other: 'Unemployed / Other',
    employer_name: 'Employer Name',
    job_title: 'Job Title',
    start_date: 'Start Date',
    monthly_income: 'Gross Monthly Income',

    section_financial_details: 'Financial Details & Loan Request',
    loan_amount_requested: 'Loan Amount Requested ($)',
    loan_purpose: 'Purpose of the Loan',
    purpose_debt_consolidation: 'Debt Consolidation',
    purpose_vehicle_purchase: 'Vehicle Purchase',
    purpose_home_improvement: 'Home Improvement',
    purpose_other: 'Other',
    estimated_monthly_expenses: 'Estimated Monthly Expenses ($)',
    has_us_bank_account: 'Do you currently have a US bank account?',
    submit_application: 'Submit Application',

    // Client Dashboard
    your_dashboard_summary: 'Here is a summary of your account activity.',
    available_balance: 'Available Balance',
    new_transfer: 'New Transfer',
    request_credit: 'Request Credit',
    recent_activity: 'Recent Activity',
    transfers: 'Transfers',
    credit_requests: 'Credit Requests',
    no_transfers_found: 'No transfers found.',
    no_credit_requests_found: 'No credit requests found.',

    // Transfer
    transfer_to: 'Transfer to {name}',
    completed: 'Completed',
    processing: 'Processing',
    blocked: 'Blocked',
    action_required: 'Action Required: This transfer is blocked',
    is_blocked: 'is blocked',

    // Credit Request
    credit_request: 'Credit Request',
    approved: 'Approved',
    rejected: 'Rejected',
    pending: 'Pending',

    // Chat
    chat_with_support: 'Chat with Support',
    welcome_to_support_chat: 'Welcome! How can I assist you today?',
    type_message: 'Type your message...',
    initial_chat_message_for_code:
      'Hello, I need help with my blocked transfer of {amount} to {recipient}. Can you provide me with an unlock code?',

    // Transfer Form
    transfer_amount: 'Amount',
    recipient_name: "Recipient's Full Name",
    account_holder_name: 'Account Holder Name',
    account_number: 'Account Number',
    routing_number: 'Routing Number',
    transfer_reason_placeholder: 'e.g., invoice payment, rent',

    // Credit Form
    credit_amount: 'Amount',
    credit_reason_placeholder: 'e.g., Home renovation, car purchase',

    // Transfer Status (Blocked)
    invalid_unlock_code:
      'The code entered is invalid or has expired. Please try again.',
    admin_custom_reason: 'Note from our team',
    unlock_code_prompt:
      'To proceed, you need an unlock code from our support team.',
    get_unlock_code: 'Get Unlock Code via Chat',
    enter_unlock_code: 'Enter Unlock Code',
    unlock_transfer: 'Unlock Transfer',

    // Admin Dashboard
    admin_dashboard: 'Admin Dashboard',
    all_transfers: 'All Transfers',
    all_credit_requests: 'All Credit Requests',
    support: 'Support',
    settings: 'Settings',
    manage_transfer: 'Manage',
    approve: 'Approve',
    reject: 'Reject',
    customize_block_messages: 'Customize Transfer Block Messages',
    step_1_message: 'Step 1 Message',
    step_2_message: 'Step 2 Message',
    step_3_message: 'Step 3 Message',
    step_4_message: 'Step 4 Message',
    save_settings: 'Save Settings',
    open_chat: 'Open Chat',
    initiate_chat_with: 'Chat with {name}',
    custom_block_reason: 'Add a custom reason for this block (optional)',
    save_reason: 'Save Reason',
    generate_code: 'Generate Code',
    unlock_code_generated: 'Generated Code',
  },
  [Language.FR]: {
    welcome_user: 'Bienvenue, {name}',
    logout: 'Déconnexion',
    login_to_your_account: 'Connectez-vous à votre compte',
    email_address: 'Adresse e-mail',
    password: 'Mot de passe',
    login: 'Connexion',
    cancel: 'Annuler',
    submit: 'Soumettre',
    send: 'Envoyer',
    yes: 'Oui',
    no: 'Non',
    user: 'Utilisateur',
    status: 'Statut',
    date: 'Date',
    action: 'Action',
    reason: 'Raison',
    select_language: 'Sélectionner la langue',
    email_placeholder: 'vous@exemple.com',
    login_error_invalid_credentials:
      'Email ou mot de passe invalide. Veuillez réessayer.',
    dont_have_account: 'Pas de compte ?',
    create_account: 'Créer un compte',
    back_to_login: 'Retour à la connexion',
    create_account_title: 'Ouvrir un nouveau compte USALLI BANK',
    your_dashboard_summary: "Voici un résumé de l'activité de votre compte.",
    available_balance: 'Solde disponible',
    new_transfer: 'Nouveau virement',
    request_credit: 'Demande de crédit',
    recent_activity: 'Activité récente',
    transfers: 'Virements',
    credit_requests: 'Demandes de crédit',
    welcome_to_support_chat: "Bienvenue ! Comment puis-je vous aider aujourd'hui ?",
  },
  [Language.ES]: {
    welcome_user: 'Bienvenido, {name}',
    logout: 'Cerrar sesión',
    login_to_your_account: 'Inicia sesión en tu cuenta',
    email_address: 'Correo electrónico',
    password: 'Contraseña',
    login: 'Iniciar sesión',
    cancel: 'Cancelar',
    submit: 'Enviar',
    send: 'Enviar',
    yes: 'Sí',
    no: 'No',
    user: 'Usuario',
    status: 'Estado',
    date: 'Fecha',
    action: 'Acción',
    reason: 'Motivo',
    select_language: 'Seleccionar idioma',
    email_placeholder: 'usted@ejemplo.com',
    login_error_invalid_credentials:
      'Correo electrónico o contraseña no válidos. Inténtalo de nuevo.',
    dont_have_account: '¿No tienes una cuenta?',
    create_account: 'Crear una cuenta',
    back_to_login: 'Volver al inicio de sesión',
    create_account_title: 'Abrir una nueva cuenta en USALLI BANK',
    your_dashboard_summary: 'Aquí hay un resumen de la actividad de su cuenta.',
    available_balance: 'Saldo disponible',
    new_transfer: 'Nueva transferencia',
    request_credit: 'Solicitar crédito',
    recent_activity: 'Actividad reciente',
    transfers: 'Transferencias',
    credit_requests: 'Solicitudes de crédito',
    welcome_to_support_chat: '¡Bienvenido! ¿Cómo puedo ayudarle hoy?',
  },
};

// To avoid having to translate everything, we'll merge the other languages with English as a fallback.
const frTranslations = { ...translations[Language.EN], ...translations[Language.FR] };
const esTranslations = { ...translations[Language.EN], ...translations[Language.ES] };
const fullTranslations = {
  ...translations,
  [Language.FR]: frTranslations,
  [Language.ES]: esTranslations,
};

interface LocalizationContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

export const LocalizationContext = createContext<
  LocalizationContextValue | undefined
>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(Language.EN);

  const t = useCallback(
    (key: string, options?: Record<string, string | number>): string => {
      let translation = fullTranslations[language][key] || key;
      if (options) {
        Object.keys(options).forEach((optionKey) => {
          translation = translation.replace(
            `{${optionKey}}`,
            String(options[optionKey])
          );
        });
      }
      return translation;
    },
    [language]
  );

  const value = { language, setLanguage, t };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};
