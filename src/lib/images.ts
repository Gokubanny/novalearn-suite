// Educational and institutional images from Unsplash
// All images are free for commercial use

export const images = {
  // Hero & Campus
  hero: {
    campus: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80"",
    students: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80",
    library: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80",
    graduation: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80",
  },

  // Classroom & Learning
  classroom: {
    modern: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    lecture: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    students: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
    studying: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
  },

  // Technology & EdTech
  technology: {
    laptop: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    online: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
    coding: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    dashboard: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },

  // Features
  features: {
    ai: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
    biometric: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&q=80",
    video: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&q=80",
    exam: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80",
    analytics: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    team: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
    books: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
    graduation: "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?w=600&q=80",
    security: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80",
    mobile: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
    calendar: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=80",
    notification: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80",
  },

  // Professionals / Testimonials
  testimonials: {
    person1: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80",
    person2: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
    person3: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    person4: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
  },

  // Contact & Support
  contact: {
    office: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    support: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
    team: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
  },

  // Pricing
  pricing: {
    small: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
    medium: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
    enterprise: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80",
  },

  // Blog
  blog: {
    edtech: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
    teaching: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80",
    learning: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80",
  },

  // CTA & Background
  cta: {
    celebration: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80",
    campus: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80",
  },
};

// Feature card images mapped by title
export const featureImages: Record<string, string> = {
  "AI Learning Assistant": images.features.ai,
  "Biometric Attendance": images.features.biometric,
  "Online Classes": images.features.video,
  // "Exam Proctoring": images.features.exam,
  "Real-time Analytics": images.features.analytics,
  "Multi-Role Access": images.features.team,
  "Course Management": images.features.books,
  "Result Management": images.features.graduation,
  "Enterprise Security": images.features.security,
  "Smart Notifications": images.features.notification,
  "Academic Calendar": images.features.calendar,
  "Mobile Responsive": images.features.mobile,
};
