export interface Sitter {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  bio: string;
  services: string[];
  avatar: string;
  verified: boolean;
}

export interface ForumCategory {
  id: string;
  name: string;
  emoji: string;
  topicCount: number;
  description: string;
}

export interface ForumTopic {
  id: string;
  categoryId: string;
  title: string;
  author: string;
  replyCount: number;
  lastActivity: string;
  preview: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'vlasnik' | 'sitter' | 'oboje';
  city: string;
}

export const sitters: Sitter[] = [
  { id: '1', name: 'Ana Horvat', city: 'Zagreb', rating: 4.9, reviewCount: 127, pricePerHour: 10, bio: 'Veterinarka s 5 godina iskustva u čuvanju kućnih ljubimaca. Volim pse i mačke!', services: ['Čuvanje', 'Šetanje', 'Hranjenje'], avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop', verified: true },
  { id: '2', name: 'Marko Babić', city: 'Split', rating: 4.8, reviewCount: 89, pricePerHour: 8, bio: 'Passionate o životinjama, imam 2 psa i 1 mačku. Vaš ljubimac je u sigurnim rukama!', services: ['Čuvanje', 'Šetanje', 'Noćenje'], avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', verified: true },
  { id: '3', name: 'Ivana Knežević', city: 'Rijeka', rating: 4.7, reviewCount: 64, pricePerHour: 9, bio: 'Profesionalna dreserica pasa s certifikatom. Specijalizirana za velike pasmine.', services: ['Dresura', 'Šetanje', 'Čuvanje'], avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', verified: true },
  { id: '4', name: 'Petar Jurić', city: 'Osijek', rating: 4.6, reviewCount: 45, pricePerHour: 7, bio: 'Student veterine, čuvam ljubimce u slobodno vrijeme. Imam iskustva s egzotičnim životinjama.', services: ['Čuvanje', 'Hranjenje', 'Šetanje'], avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop', verified: false },
  { id: '5', name: 'Maja Tomić', city: 'Zagreb', rating: 4.9, reviewCount: 156, pricePerHour: 12, bio: 'Groomerica s vlastitim salonom. Nudim i usluge čuvanja dok ste na putu.', services: ['Grooming', 'Čuvanje', 'Noćenje'], avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', verified: true },
  { id: '6', name: 'Luka Perić', city: 'Split', rating: 4.5, reviewCount: 32, pricePerHour: 8, bio: 'Aktivni sportaš koji obožava šetnje s psima. Idealan za energične pasmine!', services: ['Šetanje', 'Trčanje', 'Čuvanje'], avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop', verified: false },
  { id: '7', name: 'Sara Kovačević', city: 'Rijeka', rating: 4.8, reviewCount: 98, pricePerHour: 11, bio: 'Bihevioristica za mačke i pse. Pomažem s problemima u ponašanju.', services: ['Dresura', 'Čuvanje', 'Savjetovanje'], avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop', verified: true },
  { id: '8', name: 'Filip Novak', city: 'Zagreb', rating: 4.7, reviewCount: 73, pricePerHour: 9, bio: 'Iskusan čuvar pasa s velikim dvorištem. Vaš pas će uživati!', services: ['Čuvanje', 'Noćenje', 'Šetanje'], avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop', verified: true },
  { id: '9', name: 'Nina Radić', city: 'Osijek', rating: 4.4, reviewCount: 28, pricePerHour: 7, bio: 'Ljubiteljica životinja, posebno mačaka. Dolazim k vama doma.', services: ['Čuvanje', 'Hranjenje', 'Igra'], avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop', verified: false },
  { id: '10', name: 'Dario Šimunović', city: 'Split', rating: 4.6, reviewCount: 51, pricePerHour: 10, bio: 'Profesionalni šetač pasa s grupnim šetnjama. Socijalizacija garantirana!', services: ['Šetanje', 'Grupne šetnje', 'Čuvanje'], avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop', verified: true },
  { id: '11', name: 'Lea Matić', city: 'Zagreb', rating: 4.8, reviewCount: 112, pricePerHour: 11, bio: 'Specijalizirana za male pasmine i štence. Nježna i strpljiva.', services: ['Čuvanje', 'Šetanje', 'Socijalizacija'], avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop', verified: true },
  { id: '12', name: 'Ivan Vuković', city: 'Rijeka', rating: 4.5, reviewCount: 39, pricePerHour: 8, bio: 'Čuvam sve vrste ljubimaca - od pasa do gmazova. Fleksibilan raspored.', services: ['Čuvanje', 'Hranjenje', 'Noćenje'], avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop', verified: false },
];

export const forumCategories: ForumCategory[] = [
  { id: '1', name: 'Zdravlje', emoji: '🏥', topicCount: 145, description: 'Pitanja o zdravlju ljubimaca' },
  { id: '2', name: 'Prehrana', emoji: '🍖', topicCount: 98, description: 'Savjeti o prehrani' },
  { id: '3', name: 'Dresura', emoji: '🎓', topicCount: 76, description: 'Savjeti za trening i dresuru' },
  { id: '4', name: 'Oprema', emoji: '🎒', topicCount: 54, description: 'Preporuke za opremu' },
  { id: '5', name: 'Izgubljeni', emoji: '🔍', topicCount: 23, description: 'Izgubljeni i pronađeni ljubimci' },
  { id: '6', name: 'Udomljavanje', emoji: '🏠', topicCount: 67, description: 'Udomljavanje životinja' },
  { id: '7', name: 'Grooming', emoji: '✂️', topicCount: 41, description: 'Njega i grooming savjeti' },
  { id: '8', name: 'Priče', emoji: '💬', topicCount: 189, description: 'Priče o ljubimcima' },
];

export const forumTopics: ForumTopic[] = [
  { id: '1', categoryId: '1', title: 'Moj pas ne jede već 2 dana - što da radim?', author: 'Ana K.', replyCount: 23, lastActivity: 'Prije 2 sata', preview: 'Moj labrador od 5 godina je odjednom prestao jesti. Ima li netko sličan problem?' },
  { id: '2', categoryId: '2', title: 'Najbolja hrana za štence zlatnog retrivera?', author: 'Marko P.', replyCount: 45, lastActivity: 'Prije 1 sat', preview: 'Upravo sam dobio štenad zlatnog retrivera i trebam preporuke za hranu.' },
  { id: '3', categoryId: '3', title: 'Kako naučiti psa da ne vuče na povodcu?', author: 'Ivana M.', replyCount: 67, lastActivity: 'Prije 30 min', preview: 'Moj njemački ovčar stalno vuče na povodcu i šetnje su postale noćna mora.' },
  { id: '4', categoryId: '5', title: 'IZGUBLJEN - crni mačak, područje Maksimira', author: 'Petar J.', replyCount: 12, lastActivity: 'Prije 15 min', preview: 'Izgubio sam crnog mačka u području Maksimira. Ima bijelu mrlju na prsima.' },
  { id: '5', categoryId: '6', title: 'Prekrasna štenad za udomljavanje - Zagreb', author: 'Sklonište Zagreb', replyCount: 34, lastActivity: 'Prije 3 sata', preview: '5 prekrasnih mješanaca traži dom! Cijepljeni i čipirani.' },
  { id: '6', categoryId: '8', title: 'Moj pas me dočekao nakon 2 tjedna 😭', author: 'Lea S.', replyCount: 89, lastActivity: 'Prije 45 min', preview: 'Bila sam na putu 2 tjedna i reakcija mog psa me rasplakala...' },
  { id: '7', categoryId: '7', title: 'Preporuka za groomera u Splitu?', author: 'Dario Š.', replyCount: 18, lastActivity: 'Prije 4 sata', preview: 'Tražim dobrog groomera za maltezera u Splitu. Ima li netko preporuku?' },
  { id: '8', categoryId: '4', title: 'GPS ogrlica - isplati li se?', author: 'Nina R.', replyCount: 31, lastActivity: 'Prije 2 sata', preview: 'Razmišljam o kupnji GPS ogrlice za psa. Vaša iskustva?' },
  { id: '9', categoryId: '1', title: 'Krpelji - kako zaštititi ljubimca?', author: 'Filip N.', replyCount: 56, lastActivity: 'Prije 1 sat', preview: 'Sezona krpelja je počela. Koji proizvodi su vam se pokazali najboljima?' },
  { id: '10', categoryId: '3', title: 'Mačka grebe namještaj - pomoć!', author: 'Sara T.', replyCount: 42, lastActivity: 'Prije 5 sati', preview: 'Moja mačka uništava namještaj grebanjem. Probala sam sve...' },
];

export const users: User[] = [
  { id: '1', name: 'Ana Kovačević', email: 'ana@example.com', avatar: '👩', role: 'vlasnik', city: 'Zagreb' },
  { id: '2', name: 'Marko Perić', email: 'marko@example.com', avatar: '👨', role: 'sitter', city: 'Split' },
  { id: '3', name: 'Ivana Novak', email: 'ivana@example.com', avatar: '👩‍🦰', role: 'oboje', city: 'Rijeka' },
  { id: '4', name: 'Petar Jurić', email: 'petar@example.com', avatar: '👨‍🦱', role: 'vlasnik', city: 'Osijek' },
  { id: '5', name: 'Maja Tomić', email: 'maja@example.com', avatar: '👩‍🦳', role: 'sitter', city: 'Zagreb' },
];

export const quickActions = [
  { id: '1', name: 'Sitteri', emoji: '🐾', route: '/(tabs)/search' },
  { id: '2', name: 'Grooming', emoji: '✂️', route: '/grooming' },
  { id: '3', name: 'Dresura', emoji: '🎓', route: '/training' },
  { id: '4', name: 'Forum', emoji: '💬', route: '/(tabs)/forum' },
  { id: '5', name: 'Izgubljeni', emoji: '🔍', route: '/lost-pets' },
];
