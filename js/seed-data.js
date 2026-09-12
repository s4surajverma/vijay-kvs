/**
 * vijaysirkvs.com - Vijay Kumar (Headmaster) Portfolio Seed Data
 */

const DEFAULT_SEED_DATA = {

  heroSection: {
    kicker: "LEARN | LEAD | INSPIRE",
    name: "VIJAY KUMAR",
    role: "Headmaster",
    school: "PM SHRI Kendriya Vidyalaya Suranussi, Jalandhar",
    stage: "Foundational & Preparatory Stage",
    motto: "Education for a Brighter Tomorrow",
    image: "assets/images/hero_banner_full.png"
  },

  menus: [
    { id: "home", label: "Home", href: "#/", defaultLabel: "Home", cardTitle: "Home", cardDesc: "Portal Homepage" },
    { id: "about", label: "About Me", href: "#/about", defaultLabel: "About Me", cardTitle: "About Me", cardDesc: "Personal Bio, Philosophy & Journey" },
    { id: "leadership", label: "Academic Leadership", href: "#/leadership", defaultLabel: "Academic Leadership", cardTitle: "Academic Leadership", cardDesc: "FLN | NIPUN | Foundational & Preparatory Stage" },
    { id: "resources", label: "Resources", href: "#/resources", defaultLabel: "Resources", cardTitle: "Teaching Resources", cardDesc: "Worksheets, Lesson Plans, CCT/HOTS, Assessment Tools" },
    { id: "training", label: "Training & CPD", href: "#/training", defaultLabel: "Training & CPD", cardTitle: "Training & CPD", cardDesc: "Workshops, Presentations, Professional Development" },
    { id: "innovations", label: "Innovations", href: "#/innovations", defaultLabel: "Innovations", cardTitle: "Innovations & Activities", cardDesc: "Vidyavani, TLM, Projects, Student Engagement" },
    { id: "gallery", label: "Gallery", href: "#/gallery", defaultLabel: "Gallery", cardTitle: "Gallery & Achievements", cardDesc: "Events, Certificates, Memorable Moments" },
    { id: "contact", label: "Contact", href: "#/contact", defaultLabel: "Contact", cardTitle: "Contact Information", cardDesc: "Official communication channels and inquiries" }
  ],

  profile: {
    name: "Vijay Kumar",
    role: "Headmaster",
    school: "PM SHRI Kendriya Vidyalaya Suranussi, Jalandhar",
    stage: "Foundational & Preparatory Stage",
    motto: "Education for a Brighter Tomorrow",
    bio: "I am Vijay Kumar, a passionate educator and dedicated school leader, currently serving as Headmaster at PM SHRI Kendriya Vidyalaya Suranussi, Jalandhar. I believe in creating a joyful, inclusive and stimulating learning environment where every child can learn, grow and realise their potential.",
    quote: "Every child is a promise and every classroom is a possibility.",
    email: "vijaykumar.edu@gmail.com",
    phone: "+91 181 267 1234",
    address: "PM SHRI Kendriya Vidyalaya Suranussi, GT Road, Jalandhar, Punjab - 144027",
    website: "www.vijaysirkvs.com",
    qualifications: "M.A., B.Ed., PG Diploma in School Leadership, Certified NIPUN FLN & Toy Pedagogy Mentor",
    journey: "Dedicated career in Kendriya Vidyalaya Sangathan (KVS) championing primary foundational learning, activity-based pedagogy, higher-order thinking skills (HOTS), and teacher continuous professional development (CPD).",
    vision: "To cultivate joyful, child-centric learning environments where every foundational learner builds strong cognitive foundations and thrives with curiosity, empathy, and national pride.",
    responsibilities: "Headmaster leading foundational and preparatory stage academic operations, teacher training workshops, TLM innovations, toy libraries, and community engagement.",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    instagram: "https://instagram.com"
  },

  announcements: [
    {
      id: "ann-v1",
      date: "2026-08-28",
      displayDate: "28 Aug",
      title: "FLN Assessment – Reminder for all Subjects",
      category: "Assessment",
      isPinned: true,
      badge: "REMINDER",
      description: "Periodic foundational literacy and numeracy assessment reminder for primary classes.",
      linkUrl: "#resources"
    },
    {
      id: "ann-v2",
      date: "2026-08-25",
      displayDate: "25 Aug",
      title: "CPD Workshop – Bloom's Taxonomy Session Materials",
      category: "Training & CPD",
      isPinned: true,
      badge: "WORKSHOP",
      description: "Session PPT and pedagogical guide on applying Revised Bloom's Taxonomy in primary classroom teaching.",
      linkUrl: "#training-cpd"
    },
    {
      id: "ann-v3",
      date: "2026-08-20",
      displayDate: "20 Aug",
      title: "New Resources – CCT & HOTS Question Bank (Class 4)",
      category: "Resources",
      isPinned: false,
      badge: "NEW",
      description: "Critical and Creative Thinking (CCT) question bank designed for primary students.",
      linkUrl: "#resources"
    },
    {
      id: "ann-v4",
      date: "2026-08-15",
      displayDate: "15 Aug",
      title: "Independence Day Celebrations at School",
      category: "Events",
      isPinned: false,
      badge: "CELEBRATION",
      description: "Patriotic presentations, cultural dance, and student speech showcases at KV campus.",
      linkUrl: "#gallery"
    },
    {
      id: "ann-v5",
      date: "2026-08-05",
      displayDate: "05 Aug",
      title: "Teaching Resources – Updated Worksheets",
      category: "Resources",
      isPinned: false,
      badge: "UPDATED",
      description: "Updated printable activity sheets for English, Hindi, Mathematics, and EVS.",
      linkUrl: "#resources"
    },
    {
      id: "ann-v6",
      date: "2025-12-18",
      displayDate: "18 Dec",
      title: "Training Programme for PRTs on 'Toys and Puppets Based Pedagogy'",
      category: "Training & CPD",
      isPinned: false,
      badge: "FEATURED",
      description: "Hands-on workshop integrating indigenous toy-making and puppets into primary stage teaching.",
      linkUrl: "https://drive.google.com/drive/folders/1cAtFqSvnXZW9jD2KzRM0npyqGmpEW7DS?usp=drive_link"
    }
  ],

  resources: [
    {
      id: "res-1",
      title: "CCT & HOTS Question Bank (Class 4 & 5)",
      category: "Question Banks",
      fileType: "PDF Document",
      size: "3.2 MB",
      date: "2026-08-20",
      srcUrl: "#"
    },
    {
      id: "res-2",
      title: "Foundational Literacy & Phonics Activity Worksheets",
      category: "Worksheets",
      fileType: "PDF Document",
      size: "2.8 MB",
      date: "2026-08-05",
      srcUrl: "#"
    },
    {
      id: "res-3",
      title: "Toy-Based Pedagogy Lesson Plan Templates",
      category: "Lesson Plans",
      fileType: "PDF Document",
      size: "1.9 MB",
      date: "2026-07-15",
      srcUrl: "#"
    },
    {
      id: "res-4",
      title: "NCF Foundational Stage Rubrics & Assessment Guide",
      category: "Assessment Tools",
      fileType: "PDF Document",
      size: "4.5 MB",
      date: "2026-06-10",
      srcUrl: "#"
    }
  ],

  initiatives: [
    {
      id: "init-1",
      title: "NIPUN Bharat & FLN Mission",
      category: "Academic Leadership",
      icon: "fa-book-reader",
      image: "assets/images/toy_library.png",
      summary: "Universal acquisition of foundational literacy and numeracy skills by Class III.",
      details: "Championing joyful reading corners, story sessions, and numeracy games under NIPUN Bharat guidelines."
    },
    {
      id: "init-2",
      title: "Toy-Based & Puppet Pedagogy",
      category: "Innovations",
      icon: "fa-cubes",
      image: "assets/images/toy_library.png",
      summary: "Integrating indigenous toys, puppets, and tactile learning into everyday lessons.",
      details: "Empowering primary teachers to use hands-on materials to make abstract concepts concrete and delightful."
    },
    {
      id: "init-3",
      title: "Vidya Pravesh & Balvatika Readiness",
      category: "Foundational Stage",
      icon: "fa-child",
      image: "assets/images/pm_shri.png",
      summary: "Play-based school preparation module for young entrants.",
      details: "Focusing on social-emotional bonding, communication, fine motor skills, and joyful school entry."
    },
    {
      id: "init-4",
      title: "Continuous Professional Development (CPD)",
      category: "Training & CPD",
      icon: "fa-chalkboard-teacher",
      image: "assets/images/hero.png",
      summary: "Regular peer workshops on Bloom's Taxonomy, experiential pedagogy, and competency assessment.",
      details: "Facilitating interactive faculty training modules and collaborative lesson design sessions."
    }
  ],

  gallery: [
    {
      id: "gal-1",
      title: "Classroom Interaction with Students",
      category: "Classroom Moments",
      type: "photo",
      srcUrl: "assets/images/children_globe_hd.png",
      caption: "Inspiring foundational learners with hands-on geography and globe exploration."
    },
    {
      id: "gal-2",
      title: "Toy-Based Pedagogy Workshop",
      category: "Training & CPD",
      type: "photo",
      srcUrl: "assets/images/toy_library.png",
      caption: "Mentoring educators on indigenous toy-making and storytelling puppets."
    },
    {
      id: "gal-3",
      title: "Vijay Kumar, Headmaster in Office",
      category: "Leadership",
      type: "photo",
      srcUrl: "assets/images/vijay_kumar_desk_hd.png",
      caption: "Academic leadership and curriculum planning for foundational & preparatory stage."
    },
    {
      id: "gal-4",
      title: "Independence Day & Cultural Events",
      category: "Events",
      type: "photo",
      srcUrl: "assets/images/pm_shri.png",
      caption: "Fostering national integration, unity, and joyful cultural presentations."
    }
  ],

  inquiries: []
};
