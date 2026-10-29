import { PreviewSceneId } from '../utils/proceduralMedia';

/**
 * ============================================================================
 * CENTRALIZED MEDIA & PORTFOLIO CONFIGURATION (`src/data/projects.ts`)
 * ============================================================================
 * Replace any empty string `""` below with your own local asset path
 * (e.g., `"/assets/my-portrait.jpg"` placed inside `public/assets/`)
 * or a hosted HTTPS URL (e.g., Cloudinary, Vimeo/MP4 CDN, S3).
 * When a URL field is left as `""`, the application automatically renders a
 * high-resolution procedural studio visual or playable canvas video stream so
 * there are never broken images or failed network requests.
 */

export const SITE_ASSETS = {
  // REPLACE: Add your Yashwanth Edits logo image URL here.
  logoUrl: '/images/logo.png',
  
  // REPLACE: Add your real portrait photograph URL here.
  portraitUrl: '/images/portrait.JPG',
  
  // REPLACE: Add your custom NLE laptop screen preview image URL here if you want to override
  // the built-in multi-track video editing workspace preview.
  laptopScreenPreviewUrl: '',
  
  // REPLACE: Add your hosted 16:9 Showreel MP4/WebM video URL here (e.g. "https://.../showreel.mp4").
  // When empty "", the Showreel video player runs a real playable 60fps procedural showreel stream.
  showreelVideoUrl: 'https://www.youtube.com/embed/1dvIWhhsJJU',
  
  // REPLACE: Add your custom Showreel poster/thumbnail image URL here (e.g. "/assets/showreel-poster.jpg").
  showreelPosterUrl: '/images/Thumbnail.png',
};

export interface SkillTag {
  id: string;
  title: string;
  shortCode: string;
  summary: string;
  highlights: string[];
}

export const ROLE_SKILLS: SkillTag[] = [
  {
    id: 'ai-prompt',
    title: 'AI Prompt Engineer',
    shortCode: '01 // AI WORKFLOWS',
    summary:
  'Crafting cinematic AI visuals through advanced prompt engineering, consistent storytelling, and precision-controlled image & video generation.',
highlights: [
  'Cinematic camera movements & visual storytelling',
  'Consistent characters, styles & storyboard creation',
  'AI-powered video generation & professional editing workflows',
],
  },
  {
    id: 'video-editor',
    title: 'Video Editor',
    shortCode: '02 // POST-PRODUCTION',
    summary:
  'Crafting high-impact edits through cinematic storytelling, seamless transitions, precision sound design, and professional color grading.',
highlights: [
  'Cinematic storytelling & seamless multi-track editing',
  'Professional color grading & cinematic look development',
  'Dynamic speed ramps, sound effects & audio mastering',
],
  },
  {
    id: 'photo-editor',
    title: 'Photo Editor',
    shortCode: '03 // RETOUCH & GRADE',
    summary:
  'Enhancing visuals through precision retouching, seamless compositing, and cinematic lighting for premium, commercial-grade imagery.',
highlights: [
  'Advanced skin retouching & precision dodge/burn',
  'Professional product cleanup & lighting refinement',
  'Cinematic color grading & realistic film texture',
],
  },
  {
    id: 'graphic-designer',
    title: 'Graphic Designer',
    shortCode: '04 // VISUAL IDENTITY',
    summary:
  'Creating visually striking designs through bold typography, compelling compositions, and high-impact branding for digital campaigns.',
highlights: [
  'Typography, layout design & visual hierarchy',
  'Creative posters, key visuals & brand campaigns',
  'High-converting thumbnails & social media creatives',
],
  },
];

// Changed to an array to support multiple education timeline entries
export const EDUCATION_DATA = [
  {
    id: 'btech',
    type: 'UNDERGRADUATE DEGREE',
    degree: 'B.Tech in Artificial Intelligence & Data Science',
    period: '2022 — 2026',
    institution: 'Vishnu Institute of Technology, Bhimavaram',
    focusAreas: [
      'Artificial Intelligence',
      'Machine Learning & Generative AI',
      'Data Science & Computer Vision',
      'Prompt Engineering & Multimodal AI',
      'AI Video Generation & Visual Storytelling',
    ],
  },
  {
    id: 'inter',
    type: 'INTERMEDIATE (11TH & 12TH)',
    degree: 'MPC (Mathematics, Physics, Chemistry)',
    period: '2020 — 2022',
    institution: 'Aditya Junior College, Palakollu',
    focusAreas: [
      'Mathematics',
      'Physics',
      'Chemistry'
    ],
  },
  {
    id: 'ssc',
    type: 'SECONDARY EDUCATION',
    degree: '10th Standard',
    period: '2019 — 2020',
    institution: 'Aditya Public School, Palakollu',
    focusAreas: [
      'General Studies',
      'Foundational Sciences'
    ],
  }
];

export type ProjectCategory =
  | 'Video Editing'
  | 'Photo Editing'
  | 'Graphic Designing';

export interface PortfolioProject {
  id: string;
  slotNumber: string;
  title: string;
  category: ProjectCategory;
  shortDescription: string;
  detailedDescription: string;
  tools: string[];
  aspectRatio: string;
  durationOrDimensions: string;
  /**
   * Procedural fallback identifier used when custom URLs are not yet supplied.
   */
  fallbackSceneId: PreviewSceneId;
  thumbnailUrl: string;
  videoUrl?: string;
  fullImageUrl?: string;
  beforeImageUrl?: string;
  projectUrl?: string;
}

/**
 * NINE REPLACEABLE CREATIVE PORTFOLIO PROJECTS
 * (3 Video Editing + 3 Photo Editing + 3 Graphic Designing)
 */
export const PROJECTS: PortfolioProject[] = [
  
  // ==========================================================================
  // CATEGORY 1: VIDEO EDITING (3 PROJECTS)
  // ==========================================================================
  {
    id: 'video-01',
    slotNumber: '01',
    title: 'AI Cinematic Advertisment',
    category: 'Video Editing',
    shortDescription:
      'AI cinematic Brand advertisement showcasing advanced prompt engineering, seamless multi-track editing, and professional color grading for a high-impact visual experience.',
    detailedDescription:
      'This project demonstrates the integration of AI-generated visuals with traditional video editing techniques, resulting in a polished and engaging advertisement that highlights the brand\'s message through cinematic storytelling and dynamic visual effects.',
    tools: ['Higgsfield AI', 'Premiere Pro', 'After Effects', 'Sound Design'],
    aspectRatio: '9:16 Anamorphic',
    durationOrDimensions: '00:9 // 4K 60fps',
    fallbackSceneId: 'landscape',
    // REPLACE: Add your video thumbnail image URL here.
    thumbnailUrl: '/images/Shoe.jpg',
    // REPLACE: Add your actual project video URL here (e.g. "/assets/videos/project-01.mp4").
    videoUrl: 'https://www.youtube.com/embed/GeIqle91New',
  },
  {
    id: 'video-02',
    slotNumber: '02',
    title: 'Cinematic AI Short Film || Formula 1 Racing',
    category: 'Video Editing',
    shortDescription:
      'A cinematic short film exploring the intersection of AI technology and Formula 1 racing, showcasing cutting-edge visual effects and storytelling.',
    detailedDescription:
      'This project combines AI-generated visuals with traditional filmmaking techniques to create an immersive experience that captures the excitement and intensity of Formula 1 racing.',
    tools: ['Higgsfield AI', 'Premiere Pro','After Effects', 'Color Grading'],
    aspectRatio: '21:9 Widescreen',
    durationOrDimensions: '00:27 // 4K 60fps',
    fallbackSceneId: 'product',
    // REPLACE: Add your video thumbnail image URL here.
    thumbnailUrl: '/images/F1.png',
    // REPLACE: Add your actual project video URL here (e.g. "/assets/videos/project-02.mp4").
    videoUrl: 'https://www.youtube.com/embed/34hVco2rqC4',
  },
  {
    id: 'video-03',
    slotNumber: '03',
    title: 'Movie Intro || AI Cinematic Title Sequence',
    category: 'Video Editing',
    shortDescription:
      'A cinematic title sequence for a movie intro, leveraging AI-generated visuals and advanced editing techniques to create a visually stunning opening.',
    detailedDescription:
      'This project showcases the use of After Effects and Premiere Pro to craft a dynamic and engaging title sequence and enhance the cinematic experience.',
    tools: ['After Effects', 'Premiere Pro', 'Motion Graphics'],
    aspectRatio: '16:9 Cinema',
    durationOrDimensions: '01:48 // 4K Master',
    fallbackSceneId: 'city',
    // REPLACE: Add your video thumbnail image URL here.
    thumbnailUrl: '/images/Intro thumbnail.png',
    // REPLACE: Add your actual project video URL here (e.g. "/assets/videos/project-03.mp4").
    videoUrl: 'https://www.youtube.com/embed/zWfLKm5w7m8',
  },

  // ==========================================================================
  // CATEGORY 2: PHOTO EDITING (3 PROJECTS)
  // ==========================================================================
  // Add this line to the interface:


// Add the URL to project photo-01 (slot 04):

  {
    id: 'photo-01',
    slotNumber: '04',
    title: 'Landscape Colorgrade || Editorial Portrait Retouch',
    category: 'Photo Editing',
    shortDescription:
      'Editorial portrait retouch emphasizing directional window light, non-destructive skin texture preservation, and warm amber rim highlights.',
    detailedDescription:
      'Executed with non-destructive frequency separation and localized dodge-and-burn passes to sculpt facial geometry while maintaining authentic organic grain and deep shadow roll-off.',
    tools: ['Adobe Photoshop', 'Lightroom Classic', 'Frequency Separation', 'Color Calibration'],
    aspectRatio: '16:9 Editorial',
    durationOrDimensions: '4500 × 5625 px // 16-bit',
    fallbackSceneId: 'colorgrade',
    thumbnailUrl: '/images/After.jpg', // Set your thumbnail if desired
    fullImageUrl: '/images/After.jpg', // Your graded outcome image
    beforeImageUrl: '/images/Before.jpg', // <-- ADDED THIS LINE (Replace with your actual RAW/Before image path)
  },
  {
    id: 'photo-02',
    slotNumber: '05',
    title: 'Baby Birthday Photo Frame || Multi-Exposure Focus Stack & Retouch',
    category: 'Photo Editing',
    shortDescription:
      'Photos Stack Frame for Baby Birthday, combining multiple exposures for perfect focus, seamless retouching, and soft natural lighting.',
    detailedDescription:
      'Utilizes multi-exposure focus stacking to achieve sharpness across the subject, with careful retouching to maintain skin texture and natural lighting for a warm, inviting birthday portrait.',
    tools: ['Adobe Photoshop', 'Capture One', 'Focus Stacking', 'Specular Masking'],
    aspectRatio: '12 x 18 cm Studio',
    durationOrDimensions: '3000 x 4500 px // RAW Grade',
    fallbackSceneId: 'photo-chiaroscuro',
    // REPLACE: Add your photo thumbnail image URL here.
    thumbnailUrl: '/images/Birthday.png',
    // REPLACE: Add your full-resolution photo URL here (e.g. "/assets/photos/photo-02-full.jpg").
    fullImageUrl: '/images/12x18 BB.jpg',
  },
  {
    id: 'photo-03',
    slotNumber: '06',
    title: 'Cinematic Photo Editing || Cyberpunk Cityscape Retouch & Colorgrade',
    category: 'Photo Editing',
    shortDescription:
      'Cinematic cyberpunk cityscape retouch and color grading, emphasizing neon highlights, atmospheric depth, and futuristic urban aesthetics.',
    detailedDescription:
      'Transforms flat architectural raw captures into a cohesive cinematic night frame using luminosity masks, depth-based atmospheric fog layers, and calibrated halation around point light sources.',
    tools: ['Lightroom Classic', 'Photoshop', 'Luminosity Masks', 'Split Toning'],
    aspectRatio: '16:9 Cinema Frame',
    durationOrDimensions: '6000 × 3375 px // 16-bit',
    fallbackSceneId: 'photo-cyberpunk',
    // REPLACE: Add your photo thumbnail image URL here.
    thumbnailUrl: '/images/Image.png',
    // REPLACE: Add your full-resolution photo URL here (e.g. "/assets/photos/photo-03-full.jpg").
    fullImageUrl: '',
  },

  // ==========================================================================
  // CATEGORY 3: GRAPHIC DESIGNING (3 PROJECTS)
  // ==========================================================================
  {
    id: 'design-01',
    slotNumber: '07',
    title: 'Faculty Invitation for Freshers Party || Modular Poster & Stage Identity System',
    category: 'Graphic Designing',
    shortDescription:
      'Modular visual identity system for a university event, combining bold geometric typography with precise tabular metadata and print-ready poster layouts.',
    detailedDescription:
      'A multi-format design system for event promotion, including scalable vector posters, stage backdrop graphics, and digital social media assets, all adhering to a cohesive typographic and color scheme.',
    tools: ['Adobe Illustrator', 'Photoshop', 'Canva', 'Layout Design'],
    aspectRatio: '15cm x 22cm Key Art',
    durationOrDimensions: 'Print-Ready Vector',
    fallbackSceneId: 'design-solstice',
    // REPLACE: Add your graphic design thumbnail URL here.
    thumbnailUrl: '/images/FACULTY INVITATION( 15cmX22cm) thumbnail.jpg',
    // REPLACE: Add your graphic design preview URL here (e.g. "/assets/designs/design-01.jpg").
    fullImageUrl: '/images/FACULTY INVITATION( 15cmX22cm).jpg',
    // REPLACE: Optional external Behance / Dribbble / case-study URL.
    projectUrl: '',
  },
  {
    id: 'design-02',
    slotNumber: '08',
    title: 'Wedding Reception Invitation Card || Experimental Typographic Poster Series',
    category: 'Graphic Designing',
    shortDescription:
      'A series of experimental typographic posters for a wedding reception invitation, exploring variable fonts and dynamic layouts.',
    detailedDescription:
      'This project experiments with variable typography, layout design, and visual hierarchy to create a unique and memorable invitation experience, while maintaining readability and aesthetic appeal.',
    tools: ['Adobe Illustrator', 'Photoshop', 'Canva', 'Layout Design'],
    aspectRatio: '1240x1748 Poster Spread',
    durationOrDimensions: '1240x1748 px || Series of 3',
    fallbackSceneId: 'design-kinetic',
    // REPLACE: Add your graphic design thumbnail URL here.
    thumbnailUrl: '/images/Kouru Invitation Thumbnail.png',
    // REPLACE: Add your graphic design preview URL here (e.g. "/assets/designs/design-02.jpg").
    fullImageUrl: '/images/Kouru Invitation.png',
    projectUrl: '',
  },
  {
    id: 'design-03',
    slotNumber: '09',
    title: 'TedX Event Poster & Visual Identity || Monolithic Design System',
    category: 'Graphic Designing',
    shortDescription:
      'A monolithic design system for a TedX event, featuring bold poster layouts, cohesive branding elements, and a unified visual identity across all media.',
    detailedDescription:
      'This project establishes a strong visual identity for the TedX event, utilizing a consistent color palette, typography, and graphic elements to create a memorable and impactful brand presence across print and digital platforms.',
    tools: ['Adobe InDesign', 'Illustrator', 'Photoshop', 'Canva'],
    aspectRatio: '11520 x 4608 Packaging',
    durationOrDimensions: '11520 x 4608 px + Gatefold',
    fallbackSceneId: 'design-monolith',
    // REPLACE: Add your graphic design thumbnail URL here.
    thumbnailUrl: '/images/SPEAKERS.png',
    // REPLACE: Add your graphic design preview URL here (e.g. "/assets/designs/design-03.jpg").
    fullImageUrl: '/images/SPEAKERS.png',
    projectUrl: '',
  },
];

export const CONTACT_INFO = {
  email: 'chyashwanth.2522@gmail.com',
  phoneDisplay: '+91 95734 36960',
  phoneHref: 'tel:+919573436960',
  instagramUrl: 'https://www.instagram.com/yashwanth_chelluboina/',
  instagramHandle: '@yashwanth_chelluboina',
  githubUrl: 'https://github.com/yashwanth-chelluboina',
  githubHandle: 'github.com/yashwanth-chelluboina',
};