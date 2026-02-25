import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Splash
    'splash.title': 'RootsLegacy',
    'splash.tagline': 'Your roots, your story',
    'splash.getStarted': 'Get Started',
    'splash.connecting': 'Uniting African and Afro-descendant families, one story at a time',
    'splash.selectLanguage': 'Select Language',
    
    // Common
    'common.back': 'Back',
    'common.next': 'Next',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.continue': 'Continue',
    'common.skip': 'Skip',
    'common.admin': 'Admin',
    'common.member': 'Member',
    'common.retry': 'Retry',
    
    // Roles
    'roles.superAdmin': 'Super Admin',
    'roles.member': 'Member',
    
    // Users Management
    'users.manageTitle': 'Manage Users',
    'users.manageDescription': 'Promote and revoke admin privileges',
    'users.promoteAndRevoke': 'Promote & revoke admin privileges',
    'users.noUsers': 'No users found',
    'users.totalUsers': 'Total Users',
    'users.promoteToAdmin': 'Promote to Admin',
    'users.revokeAdmin': 'Revoke Admin',
    'users.superAdminCannotModify': 'Super Admin privileges cannot be modified',
    'users.superAdminInfo': 'About Super Admin',
    'users.superAdminInfoDetail': 'Only Super Admins can promote members to Admin or revoke Admin privileges. Super Admin status cannot be changed.',
    'users.becomeSuperAdmin': 'Become Super Admin',
    
    // Home
    'home.hello': 'Hello',
    'home.welcome': 'Welcome back to your family story',
    'home.birthdayTomorrow': 'Birthday Tomorrow!',
    'home.quickActions': 'Quick Actions',
    'home.addPerson': 'Add Person',
    'home.viewTree': 'View Tree',
    'home.takeQuiz': 'Take Quiz',
    'home.familyEvents': 'Family Events',
    'home.familyStats': 'Family Stats',
    'home.totalMembers': 'Total Members',
    'home.generations': 'Generations',
    'home.recentlyAdded': 'Recently Added',
    
    // Quiz
    'quiz.title': 'Family Quiz',
    'quiz.question': 'Question',
    'quiz.of': 'of',
    'quiz.points': 'pts',
    'quiz.accurate': 'accurate',
    'quiz.correct': 'Correct',
    'quiz.goodAnswer': 'Good answer! 🎉',
    'quiz.keepLearning': 'Keep learning! 💪',
    'quiz.perfect': 'Perfect! 💯',
    'quiz.excellent': 'Excellent! 🎉',
    'quiz.wellDone': 'Well done! 👏',
    'quiz.keepGoing': 'Keep going! 💪',
    'quiz.pointsEarned': 'Points Earned',
    'quiz.correct_answers': 'Correct',
    'quiz.accuracy': 'Accuracy',
    'quiz.careerTotal': 'Career Total',
    'quiz.newBadge': 'New Badge!',
    'quiz.unlocked': 'unlocked',
    'quiz.viewLeaderboard': 'View Leaderboard',
    'quiz.myProgress': 'My Progress',
    'quiz.playAgain': 'Play Again',
    'quiz.relations': 'Relations',
    'quiz.dates': 'Dates',
    'quiz.places': 'Places',
    'quiz.stories': 'Stories',
    
    // Onboarding
    'onboarding.adminSetup': 'Admin Setup',
    'onboarding.buildTree': 'Build Your Family Tree',
    'onboarding.step': 'Step',
    'onboarding.tapToSpeak': 'Tap to Speak',
    'onboarding.listening': 'Listening...',
    'onboarding.typeHere': 'Or type here...',
    'onboarding.inviteFamily': 'Invite Family',
    'onboarding.continueAdding': 'Continue Adding',
    'onboarding.finish': 'Finish',
    'onboarding.chooseLanguage': 'Choose Language',
    'onboarding.youreAdmin': "You're the Admin!",
    'onboarding.adminPower': 'Admin Power: Bulk Add',
    'onboarding.bulkAddDesc': 'Name multiple people at once: "My father Kwasi, mother Yaa, and siblings Kofi and Nia"',
    'onboarding.continueAddingFamily': 'Continue Adding Family',
    'onboarding.switchInput': 'Switch to Other Input Methods',
    'onboarding.inviteFamilySelfFill': 'Invite Family to Self-Fill',
    'onboarding.holdToSpeak': 'Hold to Speak (Name Multiple People)',
    'onboarding.skipType': 'Skip • Type instead',
    'onboarding.adminPrivilege': 'You can add multiple family members at once by voice. Just name everyone you remember, and I\'ll organize it for you.',
    
    // AI Conversation Messages
    'ai.welcomeMessage': 'Hello! I\'m excited to help you create your family tree. 👋 You\'ll be the Admin, which means you can add and manage everyone. What\'s your name?',
    'ai.exampleName': 'My name is Amara Johnson',
    'ai.niceMeet': 'Nice to meet you, {name}! 😊 Now, let\'s add your family members together. You can tell me multiple people at once. Let\'s start with your parents. What are their names?',
    'ai.exampleParents': 'My father is Kwasi Johnson and my mother is Yaa Mensah',
    'ai.askSiblings': 'Perfect! Now, do you have any siblings? You can name them all at once.',
    'ai.exampleSiblings': 'Yes, I have a brother Kofi and a sister Nia',
    'ai.askGrandparents': 'Great family! 🌳 Let\'s go back a generation. Do you know your grandparents\' names? Tell me as many as you remember.',
    'ai.exampleGrandparents': 'My grandfather on my dad\'s side is Nkrumah Johnson, and my grandmother is Akosua. On my mom\'s side, it\'s Kwame and Abena Mensah',
    'ai.continueOrInvite': 'Wonderful! You\'re building a beautiful tree. 🎉 Would you like to continue adding more family members now, or would you prefer to invite relatives to fill in their own information?',
    
    // Cultural
    'cultural.villageOrigin': 'Village of Origin',
    'cultural.mainVillage': 'Main Village',
    'cultural.country': 'Country',
    'cultural.city': 'City / Region',
    'cultural.village': 'Village',
    'cultural.localName': 'Initiation / Local Name',
    'cultural.familyStructure': 'Family Structure',
    'cultural.biologicalParent': 'Biological Parent',
    'cultural.raisedByAunt': 'Raised by Maternal Aunt',
    'cultural.raisedByUncle': 'Raised by Uncle',
    'cultural.raisedByGrandparent': 'Raised by Grandparent',
    'cultural.guardian': 'Guardian',
    
    // Family Events
    'events.title': 'Family Events',
    'events.recordMoments': 'Record important moments',
    'events.marriage': 'Record Marriage',
    'events.birth': 'Record Birth',
    'events.passing': 'Record Passing',
    'events.allStructures': 'All family structures welcome',
    'events.voiceOrType': 'Voice or type',
    
    // Birthdays
    'birthdays.title': 'Birthdays',
    'birthdays.upcoming': 'Upcoming Birthdays',
    'birthdays.today': 'Today',
    'birthdays.thisWeek': 'This Week',
    'birthdays.thisMonth': 'This Month',
    'birthdays.sendWishes': 'Send Wishes',
    'birthdays.call': 'Call',
    'birthdays.daysUntil': 'days until birthday',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy',
    'settings.pricing': 'Pricing Plan',
    'settings.logout': 'Logout',
    
    // Pricing
    'pricing.title': 'Choose Your Plan',
    'pricing.buyOnce': 'Buy Once, Store Forever',
    'pricing.starter': 'Starter',
    'pricing.family': 'Family',
    'pricing.legacy': 'Legacy',
    'pricing.dynasty': 'Dynasty',
    'pricing.selectPlan': 'Select Plan',
    'pricing.members': 'members',
    'pricing.storage': 'storage',
    'pricing.yearlyFee': 'year storage after',
    'pricing.roots': 'Roots',
    'pricing.clan': 'Clan',
    'pricing.heritage': 'Heritage',
    'pricing.upTo': 'Up to',
    'pricing.unlimited': 'Unlimited members',
    'pricing.noSubscription': 'Buy once. Store forever. No subscription traps.',
    'pricing.fullAccess': 'Full app access forever',
    'pricing.whatsapp': 'WhatsApp import & birthday reminders',
    'pricing.familyTree': 'Interactive family tree with all view modes',
    'pricing.quiz': 'Family quiz & games',
    'pricing.cloudStorage': 'years free cloud storage included',
    'pricing.heritageBook': 'FREE Family Heritage Book export',
    'pricing.perYear': '/year after',
    'pricing.popular': 'POPULAR',
    
    // Leaderboard
    'leaderboard.title': 'Leaderboard',
    'leaderboard.week': 'This Week',
    'leaderboard.month': 'This Month',
    'leaderboard.allTime': 'All Time',
    'leaderboard.rank': 'Rank',
    'leaderboard.you': 'You',
    
    // Family Tree
    'tree.title': 'Family Tree',
    'tree.myView': 'My View',
    'tree.ancestorMode': 'Ancestor Mode',
    'tree.birdsEye': "Bird's Eye View",
    'tree.search': 'Search family...',
    'tree.tapToRecenter': 'Tap to recenter',
    
    // Admin Onboarding
    'admin.welcome': 'Welcome, Family Ambassador',
    'admin.setupFamily': "Let's set up your family tree",
    'admin.tellUsAbout': 'Tell us about',
    'admin.startWithYou': "Let's start with you",
    'admin.addParents': 'Add Parents',
    'admin.addGrandparents': 'Add Grandparents',
    'admin.inviteFamily': 'Invite Family Members',
    
    // Member Onboarding  
    'member.welcome': 'Welcome to the Family',
    'member.joinedBy': 'Invited by',
    'member.viewTree': 'View Family Tree',
    'member.completeProfile': 'Complete Your Profile',
    
    // WhatsApp
    'whatsapp.import': 'Import from WhatsApp',
    'whatsapp.selectContacts': 'Select contacts to import',
    'whatsapp.birthdayReminders': 'Birthday Reminders',
    'whatsapp.setupReminders': 'Set up WhatsApp birthday reminders',
    
    
    // Profile
    'profile.title': 'Profile',
    'profile.editProfile': 'Edit Profile',
    'profile.fullName': 'Full Name',
    'profile.birthDate': 'Birth Date',
    'profile.birthPlace': 'Birth Place',
    'profile.currentCity': 'Current City',
    'profile.phone': 'Phone',
    'profile.email': 'Email',
    'profile.bio': 'Bio',
    'profile.photos': 'Photos',
    'profile.stories': 'Stories',
    'profile.relations': 'Relations',
    
    // Navigation
    'nav.home': 'Home',
    'nav.tree': 'Tree',
    'nav.quiz': 'Quiz',
    'nav.birthdays': 'Birthdays',
    'nav.settings': 'Settings',
    
    // Conversational Onboarding
    'conv.welcome': 'Welcome to RootsLegacy!',
    'conv.letsBuild': "Let's build your family tree together",
    'conv.whatsYourName': "What's your name?",
    'conv.greatToMeet': 'Great to meet you',
    'conv.whereWereBorn': 'Where were you born?',
    'conv.tellMoreAbout': 'Tell me more about',
    'conv.amazingStory': 'Amazing story!',
    'conv.letsAddFamily': "Let's add your family members",
    'conv.whoElseAdd': 'Who else would you like to add?',
    'conv.parents': 'Parents',
    'conv.siblings': 'Siblings',
    'conv.children': 'Children',
    'conv.grandparents': 'Grandparents',
    'conv.orSay': 'Or say anything...',
    'conv.tapMic': 'Tap mic to speak',
    
    // Input Methods
    'input.howToAdd': 'How would you like to add family?',
    'input.chooseMethod': 'Choose your preferred method',
    'input.voiceInput': 'Voice Input',
    'input.voiceDesc': 'Tell us about your family',
    'input.whatsappImport': 'WhatsApp Import',
    'input.whatsappDesc': 'Import from contacts',
    'input.manualEntry': 'Manual Entry',
    'input.manualDesc': 'Fill in details yourself',
    'input.collaborativeAdd': 'Collaborative Add',
    'input.collaborativeDesc': 'Invite family to help',
    
    
    // WhatsApp Import Details
    'whatsapp.importContacts': 'Import Contacts',
    'whatsapp.selectFamily': 'Select family members from your contacts',
    'whatsapp.weWillNever': 'We will never message them without permission',
    'whatsapp.searchContacts': 'Search contacts...',
    'whatsapp.selected': 'selected',
    'whatsapp.importSelected': 'Import Selected',
    'whatsapp.setupBirthday': 'Set Up Birthday Reminders',
    'whatsapp.getReminded': 'Get reminded of birthdays on WhatsApp',
    'whatsapp.daysBefore': 'Remind me',
    'whatsapp.daysBefore_value': 'days before',
    'whatsapp.includeMessage': 'Include message suggestion',
    'whatsapp.enableReminders': 'Enable Reminders',
    
    // Invite Members
    'invite.inviteFamily': 'Invite Family Members',
    'invite.helpBuild': 'Help build your family tree together',
    'invite.shareLink': 'Share Invitation Link',
    'invite.copyLink': 'Copy Link',
    'invite.linkCopied': 'Link copied!',
    'invite.inviteViaWhatsApp': 'Invite via WhatsApp',
    'invite.inviteViaSMS': 'Invite via SMS',
    'invite.inviteViaEmail': 'Invite via Email',
    'invite.invitationMessage': 'Hi! Join our family tree on RootsLegacy:',
    'invite.whoCanJoin': 'Who can join?',
    'invite.anyoneWithLink': 'Anyone with the link can view',
    'invite.onlyInvited': 'Only invited members can edit',
    
    // Join Family
    'join.welcomeToFamily': 'Welcome to the Family!',
    'join.invitedBy': 'You were invited by',
    'join.toJoin': 'to join the',
    'join.familyTree': 'family tree',
    'join.accept': 'Accept Invitation',
    'join.decline': 'Decline',
    'join.whatYouCanDo': 'What you can do:',
    'join.viewEntireTree': 'View entire family tree',
    'join.addYourInfo': 'Add your information',
    'join.takeQuizzes': 'Take family quizzes',
    'join.getBirthdayReminders': 'Get birthday reminders',
    
    // Add Person Cultural
    'add.addFamilyMember': 'Add Family Member',
    'add.basicInfo': 'Basic Information',
    'add.fullNameLabel': 'Full Name',
    'add.fullNamePlaceholder': 'Enter full name',
    'add.birthDateLabel': 'Birth Date',
    'add.birthDatePlaceholder': 'Select date',
    'add.relationship': 'Relationship',
    'add.selectRelationship': 'Select relationship',
    'add.parent': 'Parent',
    'add.child': 'Child',
    'add.sibling': 'Sibling',
    'add.spouse': 'Spouse',
    'add.grandparent': 'Grandparent',
    'add.culturalInfo': 'Cultural Information',
    'add.optional': '(Optional)',
    'add.addPhoto': 'Add Photo',
    'add.addToTree': 'Add to Tree',
    
    // Photo Upload
    'addPhoto': 'Add Photo',
    'uploadPhoto': 'Upload Photo',
    'changePhoto': 'Change Photo',
    'photoWillBeCompressed': 'Photos are automatically compressed to save storage',
    
    // Profession
    'profession': 'Profession',
    'professionPlaceholder': 'e.g. Teacher, Farmer, Engineer',
    'professionOptional': 'Profession (optional)',
    
    // Invitation
    'invitation.createAccount': 'Create Your Account',
    'invitation.claimProfile': 'Claim Your Profile',
    'invitation.createdBy': 'Profile created by',
    'invitation.enterDetails': 'Enter your account details',
    'invitation.password': 'Password',
    'invitation.confirmPassword': 'Confirm Password',
    'invitation.createAccountBtn': 'Create Account & Claim Profile',
    'invitation.invalidToken': 'Invalid or expired invitation',
    'invitation.alreadyClaimed': 'This profile has already been claimed',
    
    // Admin Features
    'admin.createProfile': 'Create New Profile',
    'admin.sendInvitation': 'Send Invitation',
    'admin.invitationLink': 'Invitation Link',
    'admin.shareViaWhatsApp': 'Share via WhatsApp',
    'admin.copyInvitationLink': 'Copy Invitation Link',
    'admin.profileCreated': 'Profile created successfully!',
    'admin.invitationSent': 'Invitation sent!',
    
    // Profile Management
    'editProfile': 'Edit Profile',
    'myProfile': 'My Profile',
    'updateProfile': 'Update Profile',
    'profileUpdated': 'Profile updated successfully',
    
    // Family Ambassador
    'ambassador.youAreAmbassador': 'You are the Family Ambassador',
    'ambassador.mainContact': 'As the main contact, you can:',
    'ambassador.inviteMembers': 'Invite family members',
    'ambassador.manageTree': 'Manage the family tree',
    'ambassador.setupEvents': 'Set up family events',
    'ambassador.viewAnalytics': 'View family analytics',
    'ambassador.exportData': 'Export family data',
    'ambassador.transferRole': 'Transfer Ambassador Role',
    'ambassador.transferDesc': 'You can transfer this role to another family member',
    'ambassador.selectNewAmbassador': 'Select New Ambassador',
    
    // Heritage Book
    'heritage.familyHeritageBook': 'Family Heritage Book',
    'heritage.createBeautiful': 'Create a beautiful printed book',
    'heritage.whatsIncluded': "What's Included:",
    'heritage.fullFamilyTree': 'Full family tree (up to 5 generations)',
    'heritage.allPhotos': 'All photos and stories',
    'heritage.culturalInfo': 'Cultural information (villages, names)',
    'heritage.timeline': 'Family timeline',
    'heritage.professionalLayout': 'Professional layout and design',
    'heritage.hardcover': 'Premium hardcover binding',
    'heritage.previewBook': 'Preview Book',
    'heritage.orderNow': 'Order Now',
    'heritage.freeWithPlan': 'FREE with your plan!',
    'heritage.additionalCopies': 'Additional copies: $29 each',
    
    // Gamification
    'game.yourGrade': 'Your Grade',
    'game.pointsToNext': 'points to next grade',
    'game.badges': 'Badges',
    'game.earnBadges': 'Earn badges by completing challenges',
    'game.speedDemon': 'Speed Demon',
    'game.speedDemonDesc': 'Answer 10 questions in under 2 seconds',
    'game.perfectScore': 'Perfect Score',
    'game.perfectScoreDesc': 'Get 100% on a quiz',
    'game.weekStreak': 'Week Warrior',
    'game.weekStreakDesc': 'Play 7 days in a row',
    'game.historian': 'Family Historian',
    'game.historianDesc': 'Complete 50 quizzes',
    'game.culturalExpert': 'Cultural Expert',
    'game.culturalExpertDesc': 'Master all cultural questions',
    'game.badgeUnlocked': 'Badge Unlocked!',
    'game.congratulations': 'Congratulations!',
    'game.youEarned': "You've earned the",
    'game.badge': 'badge',
    'game.keepGoing': 'Keep going to unlock more!',
    'game.close': 'Close',
    
    // Quiz Profile
    'quizProfile.statistics': 'Your Statistics',
    'quizProfile.totalPoints': 'Total Points',
    'quizProfile.quizzesCompleted': 'Quizzes Completed',
    'quizProfile.averageScore': 'Average Score',
    'quizProfile.currentStreak': 'Current Streak',
    'quizProfile.bestStreak': 'Best Streak',
    'quizProfile.days': 'days',
    'quizProfile.categoryBreakdown': 'Category Breakdown',
    'quizProfile.recentActivity': 'Recent Activity',
    'quizProfile.achievements': 'Achievements',
  },
  fr: {
    // Splash
    'splash.title': 'RootsLegacy',
    'splash.tagline': 'Vos racines, votre histoire',
    'splash.getStarted': 'Commencer',
    'splash.connecting': 'Unir les familles africaines et afro-descendantes, une histoire à la fois',
    'splash.selectLanguage': 'Choisir la Langue',
    
    // Common
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.continue': 'Continuer',
    'common.skip': 'Passer',
    'common.admin': 'Admin',
    'common.member': 'Membre',
    'common.retry': 'Réessayer',
    
    // Roles
    'roles.superAdmin': 'Super Admin',
    'roles.member': 'Membre',
    
    // Users Management
    'users.manageTitle': 'Gérer les Utilisateurs',
    'users.manageDescription': 'Promouvoir et révoquer les privilèges d\'admin',
    'users.promoteAndRevoke': 'Promouvoir & révoquer les privilèges d\'admin',
    'users.noUsers': 'Aucun utilisateur trouvé',
    'users.totalUsers': 'Utilisateurs Totaux',
    'users.promoteToAdmin': 'Promouvoir en Admin',
    'users.revokeAdmin': 'Révoquer Admin',
    'users.superAdminCannotModify': 'Les privilèges de Super Admin ne peuvent pas être modifiés',
    'users.superAdminInfo': 'À propos de Super Admin',
    'users.superAdminInfoDetail': 'Seuls les Super Admins peuvent promouvoir des membres en Admin ou révoquer les privilèges d\'admin. Le statut de Super Admin ne peut pas être modifié.',
    'users.becomeSuperAdmin': 'Devenir Super Admin',
    
    // Home
    'home.hello': 'Bonjour',
    'home.welcome': 'Bienvenue dans votre histoire familiale',
    'home.birthdayTomorrow': 'Anniversaire Demain!',
    'home.quickActions': 'Actions Rapides',
    'home.addPerson': 'Ajouter une Personne',
    'home.viewTree': "Voir l'Arbre",
    'home.takeQuiz': 'Faire le Quiz',
    'home.familyEvents': 'Événements Familiaux',
    'home.familyStats': 'Statistiques Familiales',
    'home.totalMembers': 'Membres Totaux',
    'home.generations': 'Générations',
    'home.recentlyAdded': 'Ajoutés Récemment',
    
    // Quiz
    'quiz.title': 'Quiz Familial',
    'quiz.question': 'Question',
    'quiz.of': 'sur',
    'quiz.points': 'pts',
    'quiz.accurate': 'précis',
    'quiz.correct': 'Correct',
    'quiz.goodAnswer': 'Bonne réponse! 🎉',
    'quiz.keepLearning': "Continue d'apprendre! 💪",
    'quiz.perfect': 'Parfait! 💯',
    'quiz.excellent': 'Excellent! 🎉',
    'quiz.wellDone': 'Bien joué! 👏',
    'quiz.keepGoing': 'Continue! 💪',
    'quiz.pointsEarned': 'Points Gagnés',
    'quiz.correct_answers': 'Bonnes',
    'quiz.accuracy': 'Précision',
    'quiz.careerTotal': 'Total Carrière',
    'quiz.newBadge': 'Nouveau Badge!',
    'quiz.unlocked': 'débloqué',
    'quiz.viewLeaderboard': 'Voir le Classement',
    'quiz.myProgress': 'Ma Progression',
    'quiz.playAgain': 'Rejouer',
    'quiz.relations': 'Relations',
    'quiz.dates': 'Dates',
    'quiz.places': 'Lieux',
    'quiz.stories': 'Histoires',
    
    // Onboarding
    'onboarding.adminSetup': 'Configuration Admin',
    'onboarding.buildTree': 'Créer Votre Arbre Généalogique',
    'onboarding.step': 'Étape',
    'onboarding.tapToSpeak': 'Appuyez pour Parler',
    'onboarding.listening': 'Écoute...',
    'onboarding.typeHere': 'Ou tapez ici...',
    'onboarding.inviteFamily': 'Inviter la Famille',
    'onboarding.continueAdding': 'Continuer à Ajouter',
    'onboarding.finish': 'Terminer',
    'onboarding.chooseLanguage': 'Choisir la Langue',
    'onboarding.youreAdmin': "Vous êtes l'Admin!",
    'onboarding.adminPower': 'Pouvoirs Admin: Ajout en Masse',
    'onboarding.bulkAddDesc': 'Nommez plusieurs personnes à la fois: "Mon père Kwasi, ma mère Yaa, et mes frères et sœurs Kofi et Nia"',
    'onboarding.continueAddingFamily': 'Continuer à Ajouter la Famille',
    'onboarding.switchInput': 'Basculer vers d\'Autres Méthodes d\'Entrée',
    'onboarding.inviteFamilySelfFill': 'Inviter la Famille à Se Remplir',
    'onboarding.holdToSpeak': 'Appuyez et Maintenez pour Parler (Nommez Plusieurs Personnes)',
    'onboarding.skipType': 'Passer • Tapez à la Place',
    'onboarding.adminPrivilege': 'Vous pouvez ajouter plusieurs membres de la famille à la fois par voix. Nommez simplement tout le monde que vous vous souvenez, et je vais tout organiser pour vous.',
    
    // AI Conversation Messages
    'ai.welcomeMessage': 'Bonjour! Je suis ravi de vous aider à créer votre arbre généalogique. 👋 Vous serez l\'Admin, ce qui signifie que vous pouvez ajouter et gérer tout le monde. Quel est votre nom?',
    'ai.exampleName': 'Mon nom est Amara Johnson',
    'ai.niceMeet': 'Ravi de vous rencontrer, {name}! 😊 Maintenant, ajoutons ensemble les membres de votre famille. Vous pouvez me dire plusieurs personnes à la fois. Commençons par vos parents. Quels sont leurs noms?',
    'ai.exampleParents': 'Mon père est Kwasi Johnson et ma mère est Yaa Mensah',
    'ai.askSiblings': 'Parfait! Avez-vous des frères et sœurs? Vous pouvez les nommer tous à la fois.',
    'ai.exampleSiblings': 'Oui, j\'ai un frère Kofi et une sœur Nia',
    'ai.askGrandparents': 'Famille géniale! 🌳 Revenons à la génération précédente. Connaissez-vous les noms de vos grands-parents? Dites-moi autant que vous vous souvenez.',
    'ai.exampleGrandparents': 'Mon grand-père du côté de mon père est Nkrumah Johnson, et ma grand-mère est Akosua. Du côté de ma mère, c\'est Kwame et Abena Mensah',
    'ai.continueOrInvite': 'Magnifique! Vous construisez un arbre magnifique. 🎉 Voulez-vous continuer à ajouter plus de membres de la famille maintenant, ou préférez-vous inviter des parents à remplir leurs propres informations?',
    
    // Cultural
    'cultural.villageOrigin': "Village d'Origine",
    'cultural.mainVillage': 'Village Principal',
    'cultural.country': 'Pays',
    'cultural.city': 'Ville / Région',
    'cultural.village': 'Village',
    'cultural.localName': "Nom d'Initiation / Nom Local",
    'cultural.familyStructure': 'Structure Familiale',
    'cultural.biologicalParent': 'Parent Biologique',
    'cultural.raisedByAunt': 'Élevé(e) par Tante Maternelle',
    'cultural.raisedByUncle': 'Élevé(e) par Oncle',
    'cultural.raisedByGrandparent': 'Élevé(e) par Grand-Parent',
    'cultural.guardian': 'Tuteur/Tutrice',
    
    // Family Events
    'events.title': 'Événements Familiaux',
    'events.recordMoments': 'Enregistrer les moments importants',
    'events.marriage': 'Enregistrer un Mariage',
    'events.birth': 'Enregistrer une Naissance',
    'events.passing': 'Enregistrer un Décès',
    'events.allStructures': 'Toutes les structures familiales bienvenues',
    'events.voiceOrType': 'Voix ou texte',
    
    // Birthdays
    'birthdays.title': 'Anniversaires',
    'birthdays.upcoming': 'Anniversaires à Venir',
    'birthdays.today': "Aujourd'hui",
    'birthdays.thisWeek': 'Cette Semaine',
    'birthdays.thisMonth': 'Ce Mois',
    'birthdays.sendWishes': 'Envoyer des Vœux',
    'birthdays.call': 'Appeler',
    'birthdays.daysUntil': "jours jusqu'à l'anniversaire",
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.language': 'Langue',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Confidentialité',
    'settings.pricing': "Plan d'Abonnement",
    'settings.logout': 'Déconnexion',
    
    // Pricing
    'pricing.title': 'Choisissez Votre Plan',
    'pricing.buyOnce': 'Achetez Une Fois, Stockez Pour Toujours',
    'pricing.starter': 'Démarrage',
    'pricing.family': 'Famille',
    'pricing.legacy': 'Héritage',
    'pricing.dynasty': 'Dynastie',
    'pricing.selectPlan': 'Sélectionner le Plan',
    'pricing.members': 'membres',
    'pricing.storage': 'de stockage',
    'pricing.yearlyFee': 'an de stockage après',
    'pricing.roots': 'Racines',
    'pricing.clan': 'Clan',
    'pricing.heritage': 'Héritage',
    'pricing.upTo': "Jusqu'à",
    'pricing.unlimited': 'Membres illimités',
    'pricing.noSubscription': "Achetez une fois. Stockez pour toujours. Pas de pièges d'abonnement.",
    'pricing.fullAccess': "Accès complet à l'application pour toujours",
    'pricing.aiFeatures': "Toutes les fonctionnalités d'entrée IA (voix, balayage photo)",
    'pricing.whatsapp': "Importation WhatsApp et rappels d'anniversaires",
    'pricing.familyTree': 'Arbre familial interactif avec tous les modes de vue',
    'pricing.quiz': 'Quiz et jeux familiaux',
    'pricing.cloudStorage': 'années de stockage cloud gratuit inclus',
    'pricing.heritageBook': "EXPORTATION GRATUITE du Livre d'Héritage Familial",
    'pricing.perYear': '/année après',
    'pricing.popular': 'POPULAIRE',
    
    // Leaderboard
    'leaderboard.title': 'Classement',
    'leaderboard.week': 'Cette Semaine',
    'leaderboard.month': 'Ce Mois',
    'leaderboard.allTime': 'Tout le Temps',
    'leaderboard.rank': 'Rang',
    'leaderboard.you': 'Vous',
    
    // Family Tree
    'tree.title': 'Arbre Familial',
    'tree.myView': 'Ma Vue',
    'tree.ancestorMode': 'Mode Ancêtre',
    'tree.birdsEye': "Vue d'En Haut",
    'tree.search': 'Rechercher dans la famille...',
    'tree.tapToRecenter': 'Appuyez pour recentrer',
    
    // Admin Onboarding
    'admin.welcome': 'Bienvenue, Ambassadeur de Famille',
    'admin.setupFamily': "Créons votre arbre familial",
    'admin.tellUsAbout': 'Dites-nous à propos de',
    'admin.startWithYou': "Commençons par vous",
    'admin.addParents': 'Ajouter les Parents',
    'admin.addGrandparents': 'Ajouter les Grand-Parents',
    'admin.inviteFamily': 'Inviter des Membres de la Famille',
    
    // Member Onboarding  
    'member.welcome': 'Bienvenue dans la Famille',
    'member.joinedBy': 'Invité par',
    'member.viewTree': "Voir l'Arbre Familial",
    'member.completeProfile': 'Compléter Votre Profil',
    
    // WhatsApp
    'whatsapp.import': 'Importer depuis WhatsApp',
    'whatsapp.selectContacts': 'Sélectionner les contacts à importer',
    'whatsapp.birthdayReminders': "Rappels d'anniversaires",
    'whatsapp.setupReminders': "Configurer les rappels d'anniversaires WhatsApp",
    
    
    // Profile
    'profile.title': 'Profil',
    'profile.editProfile': 'Modifier le Profil',
    'profile.fullName': 'Nom Complet',
    'profile.birthDate': 'Date de Naissance',
    'profile.birthPlace': 'Lieu de Naissance',
    'profile.currentCity': 'Ville Actuelle',
    'profile.phone': 'Téléphone',
    'profile.email': 'Email',
    'profile.bio': 'Biographie',
    'profile.photos': 'Photos',
    'profile.stories': 'Histoires',
    'profile.relations': 'Relations',
    
    // Navigation
    'nav.home': 'Accueil',
    'nav.tree': 'Arbre',
    'nav.quiz': 'Quiz',
    'nav.birthdays': 'Anniversaires',
    'nav.settings': 'Paramètres',
    
    // Conversational Onboarding
    'conv.welcome': 'Bienvenue sur RootsLegacy!',
    'conv.letsBuild': "Construisons votre arbre familial ensemble",
    'conv.whatsYourName': "Quel est votre nom?",
    'conv.greatToMeet': 'Ravi de vous rencontrer',
    'conv.whereWereBorn': 'Où êtes-vous né(e)?',
    'conv.tellMoreAbout': 'Dites-moi plus sur',
    'conv.amazingStory': 'Histoire incroyable!',
    'conv.letsAddFamily': "Ajoutons les membres de votre famille",
    'conv.whoElseAdd': "Qui d'autre aimeriez-vous ajouter?",
    'conv.parents': 'Parents',
    'conv.siblings': 'Frères et sœurs',
    'conv.children': 'Enfants',
    'conv.grandparents': 'Grand-parents',
    'conv.orSay': 'Ou dites quelque chose...',
    'conv.tapMic': 'Appuyez sur le micro pour parler',
    
    // Input Methods
    'input.howToAdd': 'Comment aimeriez-vous ajouter votre famille?',
    'input.chooseMethod': 'Choisissez votre méthode préférée',
    'input.voiceInput': 'Entrée par voix',
    'input.voiceDesc': 'Dites-nous à propos de votre famille',
    'input.whatsappImport': 'Importation WhatsApp',
    'input.whatsappDesc': 'Importez à partir de vos contacts',
    'input.manualEntry': 'Saisie manuelle',
    'input.manualDesc': 'Remplissez les détails vous-même',
    'input.collaborativeAdd': 'Ajout collaboratif',
    'input.collaborativeDesc': 'Invitez votre famille à vous aider',
    
    
    // WhatsApp Import Details
    'whatsapp.importContacts': 'Importer des contacts',
    'whatsapp.selectFamily': 'Sélectionnez des membres de famille parmi vos contacts',
    'whatsapp.weWillNever': 'Nous ne leur enverrons jamais de message sans leur permission',
    'whatsapp.searchContacts': 'Recherchez des contacts...',
    'whatsapp.selected': 'sélectionné(s)',
    'whatsapp.importSelected': 'Importer la sélection',
    'whatsapp.setupBirthday': "Configurer les rappels d'anniversaires",
    'whatsapp.getReminded': "Recevoir des rappels d'anniversaires sur WhatsApp",
    'whatsapp.daysBefore': 'Rappelez-moi',
    'whatsapp.daysBefore_value': 'jours avant',
    'whatsapp.includeMessage': 'Inclure une suggestion de message',
    'whatsapp.enableReminders': 'Activer les rappels',
    
    // Invite Members
    'invite.inviteFamily': 'Inviter des membres de la famille',
    'invite.helpBuild': 'Aidez à construire votre arbre familial ensemble',
    'invite.shareLink': "Partager le lien d'invitation",
    'invite.copyLink': 'Copier le lien',
    'invite.linkCopied': 'Lien copié!',
    'invite.inviteViaWhatsApp': 'Inviter par WhatsApp',
    'invite.inviteViaSMS': 'Inviter par SMS',
    'invite.inviteViaEmail': 'Inviter par Email',
    'invite.invitationMessage': 'Salut! Rejoignez notre arbre familial sur RootsLegacy :',
    'invite.whoCanJoin': 'Qui peut rejoindre?',
    'invite.anyoneWithLink': 'Tout le monde avec le lien peut voir',
    'invite.onlyInvited': 'Seuls les membres invités peuvent modifier',
    
    // Join Family
    'join.welcomeToFamily': 'Bienvenue dans la famille!',
    'join.invitedBy': 'Vous avez été invité(e) par',
    'join.toJoin': 'pour rejoindre le',
    'join.familyTree': 'arbre familial',
    'join.accept': "Accepter l'invitation",
    'join.decline': 'Refuser',
    'join.whatYouCanDo': 'Ce que vous pouvez faire :',
    'join.viewEntireTree': "Voir l'arbre familial complet",
    'join.addYourInfo': 'Ajouter vos informations',
    'join.takeQuizzes': 'Faire des quiz familiaux',
    'join.getBirthdayReminders': "Recevoir des rappels d'anniversaires",
    
    // Add Person Cultural
    'add.addFamilyMember': 'Ajouter un membre de la famille',
    'add.basicInfo': 'Informations de base',
    'add.fullNameLabel': 'Nom complet',
    'add.fullNamePlaceholder': 'Entrez le nom complet',
    'add.birthDateLabel': 'Date de naissance',
    'add.birthDatePlaceholder': 'Sélectionnez une date',
    'add.relationship': 'Relation',
    'add.selectRelationship': 'Sélectionnez une relation',
    'add.parent': 'Parent',
    'add.child': 'Enfant',
    'add.sibling': 'Frère ou sœur',
    'add.spouse': 'Conjoint(e)',
    'add.grandparent': 'Grand-parent',
    'add.culturalInfo': 'Informations culturelles',
    'add.optional': '(Facultatif)',
    'add.addPhoto': 'Ajouter une photo',
    'add.addToTree': "Ajouter à l'arbre",
    
    // Photo Upload
    'addPhoto': 'Add Photo',
    'uploadPhoto': 'Upload Photo',
    'changePhoto': 'Change Photo',
    'photoWillBeCompressed': 'Photos are automatically compressed to save storage',
    
    // Profession
    'profession': 'Profession',
    'professionPlaceholder': 'e.g. Teacher, Farmer, Engineer',
    'professionOptional': 'Profession (optional)',
    
    // Invitation
    'invitation.createAccount': 'Create Your Account',
    'invitation.claimProfile': 'Claim Your Profile',
    'invitation.createdBy': 'Profile created by',
    'invitation.enterDetails': 'Enter your account details',
    'invitation.password': 'Password',
    'invitation.confirmPassword': 'Confirm Password',
    'invitation.createAccountBtn': 'Create Account & Claim Profile',
    'invitation.invalidToken': 'Invalid or expired invitation',
    'invitation.alreadyClaimed': 'This profile has already been claimed',
    
    // Admin Features
    'admin.createProfile': 'Create New Profile',
    'admin.sendInvitation': 'Send Invitation',
    'admin.invitationLink': 'Invitation Link',
    'admin.shareViaWhatsApp': 'Share via WhatsApp',
    'admin.copyInvitationLink': 'Copy Invitation Link',
    'admin.profileCreated': 'Profile created successfully!',
    'admin.invitationSent': 'Invitation sent!',
    
    // Profile Management
    'editProfile': 'Edit Profile',
    'myProfile': 'My Profile',
    'updateProfile': 'Update Profile',
    'profileUpdated': 'Profile updated successfully',
    
    // Family Ambassador
    'ambassador.youAreAmbassador': "Vous êtes l'Ambassadeur de la famille",
    'ambassador.mainContact': 'En tant que contact principal, vous pouvez :',
    'ambassador.inviteMembers': 'Inviter des membres de la famille',
    'ambassador.manageTree': "Gérer l'arbre familial",
    'ambassador.setupEvents': 'Organiser des événements familiaux',
    'ambassador.viewAnalytics': 'Voir les analyses familiales',
    'ambassador.exportData': 'Exporter les données familiales',
    'ambassador.transferRole': "Transférer le rôle d'Ambassadeur",
    'ambassador.transferDesc': 'Vous pouvez transférer ce rôle à un autre membre de la famille',
    'ambassador.selectNewAmbassador': 'Sélectionner un nouvel Ambassadeur',
    
    // Heritage Book
    'heritage.familyHeritageBook': "Livre d'Héritage Familial",
    'heritage.createBeautiful': 'Créez un livre imprimé magnifique',
    'heritage.whatsIncluded': "Ce qui est inclus :",
    'heritage.fullFamilyTree': "Arbre familial complet (jusqu'à 5 générations)",
    'heritage.allPhotos': 'Toutes les photos et histoires',
    'heritage.culturalInfo': 'Informations culturelles (villages, noms)',
    'heritage.timeline': 'Chronologie familiale',
    'heritage.professionalLayout': 'Mise en page et design professionnels',
    'heritage.hardcover': 'Reliure en couverture rigide de qualité supérieure',
    'heritage.previewBook': 'Prévisualiser le livre',
    'heritage.orderNow': 'Commander maintenant',
    'heritage.freeWithPlan': 'GRATUIT avec votre plan!',
    'heritage.additionalCopies': 'Copies supplémentaires : 29 $ chacune',
    
    // Gamification
    'game.yourGrade': 'Votre classement',
    'game.pointsToNext': 'points pour le niveau suivant',
    'game.badges': 'Badges',
    'game.earnBadges': 'Gagnez des badges en terminant des défis',
    'game.speedDemon': 'Démon de vitesse',
    'game.speedDemonDesc': 'Répondez à 10 questions en moins de 2 secondes',
    'game.perfectScore': 'Score parfait',
    'game.perfectScoreDesc': 'Obtenez 100% sur un quiz',
    'game.weekStreak': 'Guerrier de la semaine',
    'game.weekStreakDesc': "Jouez 7 jours d'affilée",
    'game.historian': 'Historien familial',
    'game.historianDesc': 'Terminez 50 quiz',
    'game.culturalExpert': 'Expert culturel',
    'game.culturalExpertDesc': 'Maîtrisez toutes les questions culturelles',
    'game.badgeUnlocked': 'Badge débloqué!',
    'game.congratulations': 'Félicitations!',
    'game.youEarned': "Vous avez gagné le",
    'game.badge': 'badge',
    'game.keepGoing': 'Continuez pour débloquer davantage!',
    'game.close': 'Fermer',
    
    // Quiz Profile
    'quizProfile.statistics': 'Vos Statistiques',
    'quizProfile.totalPoints': 'Points Totaux',
    'quizProfile.quizzesCompleted': 'Quiz Complétés',
    'quizProfile.averageScore': 'Score Moyen',
    'quizProfile.currentStreak': 'Série Actuelle',
    'quizProfile.bestStreak': 'Meilleure Série',
    'quizProfile.days': 'jours',
    'quizProfile.categoryBreakdown': 'Répartition par Catégorie',
    'quizProfile.recentActivity': 'Activité Récente',
    'quizProfile.achievements': 'Réalisations',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rootslegacy-language');
      if (saved && (saved === 'en' || saved === 'fr')) {
        setLanguageState(saved as Language);
      }
    } catch {
      // Fail silently if localStorage is not available
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('rootslegacy-language', lang);
    } catch {
      // Fail silently if localStorage is not available
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}