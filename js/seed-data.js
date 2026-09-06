/**
 * PM SHRI Kendriya Vidyalaya Suranussi - Seed / Default Data
 * AppState class removed — data management handled by db.js
 */

const DEFAULT_SEED_DATA = {

  heroSection: {
    badge: "PM SHRI SCHEME OF GOVERNMENT OF INDIA",
    title: "Welcome to PM SHRI KV Suranussi",
    description: "Nurturing young minds through holistic education, toy-based pedagogy, STEM innovation, and foundational literacy under NEP 2020.",
    backgroundImage: "assets/images/kv_campus.jpg"
  },

  statsBar: [
    { value: "1979",  label: "Year Established" },
    { value: "2023",  label: "PM SHRI Designated" },
    { value: "1500+", label: "Active Students" },
    { value: "50+",   label: "Dedicated Faculty" },
    { value: "100%",  label: "CBSE Pass Record" }
  ],

  schoolInfo: {
    name:              "PM SHRI Kendriya Vidyalaya Suranussi",
    shortName:         "KV Suranussi",
    code:              "KV Suranussi (Jalandhar)",
    isPmShri:          true,
    schoolType:        "PM SHRI Kendriya Vidyalaya",
    sector:            "Defense Sector",
    region:            "Jalandhar Region",
    station:           "Suranussi, Jalandhar, Punjab",
    badgeText:         "PM SHRI CENTER OF EDUCATIONAL EXCELLENCE",
    showBadge:         true,
    subtitle:          "A premier Defense Sector Kendriya Vidyalaya in Jalandhar Region",
    campusImage:       "assets/images/kv_campus.jpg",
    established:       1979,
    pmShriYear:        2023,
    tagline:           "Empowering Minds, Inspiring Excellence, Building Responsible Citizens",
    affiliation:       "CBSE Affiliation No: 1600012",
    address:           "Suranussi, GT Road, Jalandhar, Punjab - 144027",
    phone:             "+91 181 267 1234 / 267 5678",
    email:             "kvsuranussi@gmail.com",
    workingHours:      "Monday - Saturday: 7:30 AM - 1:40 PM",
    footerDescription: "Empowering children through quality education, national integration, and innovative pedagogy.",
    managedBy: {
      name:        "Vijay Kumar",
      designation: "HM",
      kvName:      "PM SHRI KV Suranussi",
      show:        true
    },
    vision:            "Kendriya Vidyalaya Sangathan envisions itself as a pioneering institution dedicated to educational excellence, inspiring learners to strive for intellectual growth and character development. The vision is to provide students with a stimulating learning environment that encourages critical thinking, creativity, and ethical values, preparing them to become responsible global citizens.",
    mission:           "To cater to the educational needs of children of transferable Central Government employees including defense and paramilitary personnel by providing a common program of education; to pursue excellence and set the pace in the field of school education; to initiate and promote experimentation and innovations in education in collaboration with CBSE and NCERT; and to develop the spirit of national integration and create a sense of 'Indianness' among children.",
    history:           "Kendriya Vidyalaya Suranussi, established in 1979, has grown to be a beacon of quality education and a reputed institution in the region. Initially starting its journey in humble barracks as an Army Regimental School, it was taken over by Kendriya Vidyalaya Sangathan (KVS) in the same year, marking the beginning of its transformation into a premier educational institution. In 1995, the school moved to its newly constructed building, reflecting its commitment to providing a conducive environment for learning. In 2023, the school was designated as a PM SHRI Kendriya Vidyalaya."
  },

  principalMessage: {
    name:       "Dr. Palishah",
    title:      "Principal, PM SHRI KV Suranussi",
    image:      "assets/images/principal.png",
    salutation: "Dear Parents, Students, and Well-Wishers,",
    quote:      "Aristotle says that man is a rational animal and his rationality gets best treatment and development by means of education. Undoubtedly, education raises man from the level of an animal and helps him reach the level of angels.",
    content:    `To raise the level of education it is necessary to initiate and promote experimentation and innovation in education. This is a scientific age and we need to look at everything in a scientific way. Science helps remove superstitious views and makes us understand the logic behind things happening around us.

Present age is the IT (Information Technology) age. It is necessary for everyone to be "informed" and internet is the most powerful tool to come at par with the best in the world because it gives one access to the best resources in the world.

IT and Innovation is very beneficial for us as it:
- Opens up a cornucopia of knowledge for us.
- Helps us connect with each other across oceans and continents, and share ideas and knowledge.
- Encourages the spirit of co-operation.
- And of course, helps make learning fun.

A team of dedicated teachers from different parts of the country are engaged in imparting quality education without discrimination of caste, creed, or other social factors. Although students hail from agricultural backgrounds and face various constraints, they are nurtured, inspired for peak performance, and guided towards all-round personality development.

Students are taken care of in academic pursuits and given intensive training in sports, games, and co-curricular activities. I wish this KV to bloom in its full glory with the co-operation of parents and members of society.`
  },

  announcements: [
    {
      id: "ann-1",
      date: "2025-12-18",
      displayDate: "17.12.2025 - 18.12.2025",
      title: "Two-Days Training Programme for PRTs on 'Toys and Puppets Based Pedagogy'",
      category: "Training",
      isPinned: true,
      badge: "NEW",
      description: "Interactive session focusing on integrating indigenous toy-making, storytelling puppets, and experiential learning into primary foundation stages.",
      linkUrl: "https://drive.google.com/drive/folders/1cAtFqSvnXZW9jD2KzRM0npyqGmpEW7DS?usp=drive_link"
    },
    {
      id: "ann-2",
      date: "2025-12-11",
      displayDate: "11.12.2025",
      title: "One Day Training Programme on 'Preparation of Competency Based Test Items (MCQ)'",
      category: "Workshops",
      isPinned: true,
      badge: "IMPORTANT",
      description: "Faculty development initiative aimed at designing higher-order thinking (HOTs) question banks in alignment with NEP 2020.",
      linkUrl: "#"
    },
    {
      id: "ann-3",
      date: "2025-12-10",
      displayDate: "08.12.2025 - 10.12.2025",
      title: "Three Days Training Programme for PRTs on 'Competency Based Assessment'",
      category: "Pedagogy",
      isPinned: true,
      badge: "FEATURED",
      description: "Hands-on activity demonstrations including 'Talking Trees', 'Railway Station Scene', and student 'Debate Sessions'.",
      linkUrl: "https://drive.google.com/file/d/1Bx-ewGJFJVSJVRjrZrVAiVBWW8-5wh7h/view?usp=sharing"
    },
    {
      id: "ann-4",
      date: "2025-01-31",
      displayDate: "31.01.2025",
      title: "Training Programme on Phonics Methods & Foundational Literacy",
      category: "FLN / NIPUN",
      isPinned: false,
      badge: "",
      description: "Effective Implementation of Phonics Methods and Developing Capacities in Language and Literacy at Foundational Stage.",
      linkUrl: "#"
    },
    {
      id: "ann-5",
      date: "2024-09-29",
      displayDate: "26.09.2024 - 29.09.2024",
      title: "Vidyalaya Level Training on NCF FS 2022, NCF SE 2023 & NMM",
      category: "Curriculum",
      isPinned: false,
      badge: "",
      description: "Comprehensive alignment workshop for primary teachers on National Curriculum Framework for Foundational & Secondary Stage.",
      linkUrl: "#"
    },
    {
      id: "ann-6",
      date: "2024-08-13",
      displayDate: "12.08.2024 - 13.08.2024",
      title: "Rupanatar Programme: PBL, Auroscholar & Project Inclusion Workshop",
      category: "Inclusive Education",
      isPinned: false,
      badge: "",
      description: "Two days training program empowering primary teachers with Project-Based Learning and specialized inclusion methodologies.",
      linkUrl: "#"
    }
  ],

  initiatives: [
    {
      id: "init-1",
      title: "NIPUN Bharat & FLN Mission",
      category: "Foundational Learning",
      icon: "fa-book-reader",
      image: "assets/images/toy_library.png",
      summary: "Universal acquisition of foundational literacy and numeracy skills by Class III.",
      details: "PM SHRI KV Suranussi ensures every child achieves reading fluency and basic math competence through gamified flashcards, story books, and interactive activity corners."
    },
    {
      id: "init-2",
      title: "Toy & Puppet Library",
      category: "Experiential Learning",
      icon: "fa-cubes",
      image: "assets/images/toy_library.png",
      summary: "Integrating indigenous toys, puppets, and puzzles into everyday classroom teaching.",
      details: "A dedicated repository of tactile play equipment that makes concepts in Mathematics, Science, and Environmental Studies engaging and memorable."
    },
    {
      id: "init-3",
      title: "Vidya Pravesh & Balvatika-3",
      category: "Early Childhood",
      icon: "fa-child",
      image: "assets/images/pm_shri.png",
      summary: "3-month play-based school preparation module for Grade 1 and Balvatika entrants.",
      details: "Designed to foster social-emotional readiness, motor skills, self-expression, and joy in entering formal schooling."
    },
    {
      id: "init-4",
      title: "Shiksha Saptah & Pustakophar",
      category: "Book Donation & Reading",
      icon: "fa-book-open",
      image: "assets/images/hero.png",
      summary: "Celebration of learning weeks and book bank sharing among students.",
      details: "Encourages senior students to gift used textbooks to junior batches ('Pustakophar'), fostering sustainability and community bonding."
    },
    {
      id: "init-5",
      title: "Classroom Award Programme",
      category: "Student Recognition",
      icon: "fa-award",
      image: "assets/images/pm_shri.png",
      summary: "Continuous evaluation and motivation for clean, disciplined, and creative classrooms.",
      details: "Monthly rotational trophies for Best Classroom Maintenance, Wall Magazine displays, and Attendance Excellence."
    }
  ],

  staff: [
    { id: "st-1", name: "Dr. Palishah",       designation: "Principal",           department: "Administration",          qualification: "Ph.D., M.Sc., M.Ed.", experience: "25+ Years", email: "principal.suranussi@kvs.gov.in" },
    { id: "st-2", name: "Mrs. Gurpreet Kaur", designation: "Headmistress (HM)",   department: "Primary Section",         qualification: "M.A., B.Ed.",          experience: "18 Years",  email: "hm.primary@kvsuranussi.org" },
    { id: "st-3", name: "Mr. Rajesh Kumar",   designation: "PGT Computer Science", department: "Secondary / Senior Secondary", qualification: "M.Tech (CS), B.Ed.", experience: "14 Years", email: "rajesh.cs@kvsuranussi.org" },
    { id: "st-4", name: "Mrs. Sunita Sharma", designation: "PGT Physics",          department: "Science Faculty",         qualification: "M.Sc. (Physics), B.Ed.", experience: "16 Years", email: "sunita.physics@kvsuranussi.org" },
    { id: "st-5", name: "Mr. Harvinder Singh",designation: "TGT Mathematics",      department: "Secondary",               qualification: "M.Sc. (Maths), B.Ed.", experience: "12 Years",  email: "harvinder.maths@kvsuranussi.org" },
    { id: "st-6", name: "Mrs. Anita Verma",   designation: "PRT (Primary Teacher)", department: "FLN & Balvatika",        qualification: "B.A., D.El.Ed., CTET",  experience: "9 Years",  email: "anita.prt@kvsuranussi.org" }
  ],

  gallery: [
    {
      id: "gal-1",
      title:    "PM SHRI Smart Classroom Demonstration",
      category: "PM SHRI",
      type:     "photo",
      srcUrl:   "assets/images/pm_shri.png",
      caption:  "Students interacting with modern digital learning boards."
    },
    {
      id: "gal-2",
      title:    "Toy Library & Puppet Pedagogy Workshop",
      category: "FLN & Activities",
      type:     "photo",
      srcUrl:   "assets/images/toy_library.png",
      caption:  "Primary teachers demonstrating puppet-based storytelling."
    },
    {
      id: "gal-3",
      title:    "Main Academic Block & Green Campus",
      category: "Campus",
      type:     "photo",
      srcUrl:   "assets/images/hero.png",
      caption:  "Beautiful panoramic view of PM SHRI KV Suranussi premises."
    },
    {
      id: "gal-4",
      title:    "Principal Dr. Palishah Addressing Assembly",
      category: "Events",
      type:     "photo",
      srcUrl:   "assets/images/principal.png",
      caption:  "Inspiring words during morning assembly on IT and innovation."
    }
  ],

  resources: [
    {
      id:       "res-1",
      title:    "NCF Foundational Stage Guidelines 2022-23",
      category: "Curriculum",
      fileType: "PDF Document",
      size:     "2.4 MB",
      date:     "2024-09-20",
      srcUrl:   "#"
    },
    {
      id:       "res-2",
      title:    "FLN Competency Based Question Bank (Class I - V)",
      category: "Question Banks",
      fileType: "PDF Document",
      size:     "4.1 MB",
      date:     "2025-12-10",
      srcUrl:   "#"
    },
    {
      id:       "res-3",
      title:    "Quarterly School Newsletter 'Samagam 2025'",
      category: "Newsletters",
      fileType: "PDF Gazette",
      size:     "5.8 MB",
      date:     "2025-10-15",
      srcUrl:   "#"
    },
    {
      id:       "res-4",
      title:    "KVS Admission Guidelines & Age Eligibility Chart",
      category: "Admissions",
      fileType: "PDF Document",
      size:     "1.2 MB",
      date:     "2026-02-01",
      srcUrl:   "#"
    }
  ],

  inquiries: [
    {
      id:      "inq-101",
      name:    "Ramesh Sharma",
      email:   "ramesh.sharma@example.com",
      phone:   "+91 98765 43210",
      subject: "Class 1 Balvatika Admission Inquiry",
      message: "Respected Principal, I am a central government employee transferred to Jalandhar. Kindly share the admission schedule for Balvatika-3.",
      date:    "2026-08-20",
      status:  "New"
    },
    {
      id:      "inq-102",
      name:    "Pooja Verma",
      email:   "pooja.v@example.com",
      phone:   "+91 98123 45678",
      subject: "Toy Library & FLN Workshop details",
      message: "Greetings! I would like to know if visitors are allowed during the open day to observe the toy library models.",
      date:    "2026-08-22",
      status:  "Responded"
    }
  ]
};
