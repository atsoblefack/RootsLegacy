import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout-updated";
import { Splash } from "./components/splash";
import { AdminOnboarding } from "./components/admin-onboarding";
import { MemberOnboarding } from "./components/member-onboarding";
import { InputMethods } from "./components/input-methods";
import { PhotoScan } from "./components/photo-scan";
import { WhatsAppImport } from "./components/whatsapp-import";
import { Home } from "./components/home-updated";
import { FamilyTreeEgoCentric } from "./components/family-tree-ego";
import { Profile } from "./components/profile";
import { Quiz } from "./components/quiz";
import { Leaderboard } from "./components/leaderboard";
import { QuizProfile } from "./components/quiz-profile";
import { Settings } from "./components/settings";
import { BirthdayNotifications } from "./components/birthday-notifications";
import { WhatsAppBirthdaySetup } from "./components/whatsapp-birthday-setup";
import { Pricing } from "./components/pricing";
import { HeritageBook } from "./components/heritage-book";
import { FamilyAmbassador } from "./components/family-ambassador";
import { FamilyEvents } from "./components/family-events";
import { InviteMembers } from "./components/invite-members";
import { AddPersonCultural } from "./components/add-person-cultural";
import { JoinFamily } from "./components/join-family";
import { AdminCreateProfile } from "./components/admin-create-profile";
import { InvitationPage } from "./components/invitation-page";
import { ManageUsers } from "./components/manage-users";
import { LinkFamilies } from "./components/link-families";
import { ReferralDashboard } from "./components/referral-dashboard";
import { ReferralInvite } from "./components/referral-invite";
import { PaymentTest } from "./components/payment-test";
import { Login } from "./components/login";
import { Signup } from "./components/signup";
import { FamilyBookExport } from "./components/family-book-export";
import { ReferralTest } from "./components/referral-test";
import { ErrorBoundary } from "./components/error-boundary";
import { SubscriptionUpgrade } from "./components/subscription-upgrade-updated";
import { AdminDashboard } from "./components/admin-dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: ErrorBoundary,
    children: [
      {
        index: true,
        Component: Splash,
      },
      {
        path: "onboarding",
        Component: AdminOnboarding,
      },
      {
        path: "signup",
        Component: Signup,
      },
      {
        path: "member-onboarding",
        Component: MemberOnboarding,
      },
      {
        path: "join/:code",
        Component: ReferralInvite,
      },
      {
        path: "invite-members",
        Component: InviteMembers,
      },
      {
        path: "input-methods",
        Component: InputMethods,
      },
      {
        path: "add-person",
        Component: AddPersonCultural,
      },
      {
        path: "photo-scan",
        Component: PhotoScan,
      },
      {
        path: "whatsapp-import",
        Component: WhatsAppImport,
      },
      {
        path: "home",
        Component: Home,
      },
      {
        path: "tree",
        Component: FamilyTreeEgoCentric,
      },
      {
        path: "profile/:id",
        Component: Profile,
      },
      {
        path: "quiz",
        Component: Quiz,
      },
      {
        path: "leaderboard",
        Component: Leaderboard,
      },
      {
        path: "quiz-profile",
        Component: QuizProfile,
      },
      {
        path: "settings",
        Component: Settings,
      },
      {
        path: "birthdays",
        Component: BirthdayNotifications,
      },
      {
        path: "whatsapp-birthday-setup",
        Component: WhatsAppBirthdaySetup,
      },
      {
        path: "pricing",
        Component: Pricing,
      },
      {
        path: "heritage-book",
        Component: HeritageBook,
      },
      {
        path: "family-book-export",
        Component: FamilyBookExport,
      },
      {
        path: "family-ambassador",
        Component: FamilyAmbassador,
      },
      {
        path: "family-events",
        Component: FamilyEvents,
      },
      {
        path: "admin/create-profile",
        Component: AdminCreateProfile,
      },
      {
        path: "manage-users",
        Component: ManageUsers,
      },
      {
        path: "invitation/:token",
        Component: InvitationPage,
      },
      {
        path: "link-families",
        Component: LinkFamilies,
      },
      {
        path: "referral",
        Component: ReferralDashboard,
      },
      {
        path: "payment-test",
        Component: PaymentTest,
      },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "referral-test",
        Component: ReferralTest,
      },
      {
        path: "subscription-upgrade",
        Component: SubscriptionUpgrade,
      },
      {
        path: "admin",
        Component: AdminDashboard,
      },
    ],
  },
]);