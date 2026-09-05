require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Admin, Doctor, GalleryImage, Job, Blog } = require('../models');
const BLOG_POSTS_SEED = require('./blogSeedData');

const DOCTORS_SEED = [
  { name: "Dr. Ashish Mahobia", specialities: ["Ophthalmology"], clinics: ["Sai Baba Eye Hospital"], degree: "MBBS, MS (Mumbai), FNB (Retina), MRCS (UK), EVRT (Germany)", location: "Raipur", rating: 4.8, available: true, languages: ["English"], like_percentage: "98%", votes: "252 / 287 Votes", experience: 20, fees: 600, next_available: "10:00 AM - 15 Oct, Tue", sort_order: 1 },
  { name: "Dr. Swati Mahobia", specialities: ["Gynecology"], clinics: ["Sai Baba Women's Hospital"], degree: "M.B.B.S, MD Obst & Gynec. (KEM & WADIA Hospital Mumbai)", location: "Raipur", rating: 4.3, available: false, languages: ["English"], like_percentage: "92%", votes: "270 / 300 Votes", experience: 20, fees: 450, next_available: "11.00 AM - 19 Oct, Sat", sort_order: 2 },
  { name: "Dr. Shamali Kohade", specialities: ["Ophthalmology"], clinics: ["Sai Baba Eye Hospital"], degree: "MBBS, MS (RIO, BHOPAL), Fellow in Glaucoma (LVPEI, Hyderabad)", location: "Raipur", rating: 4.7, available: true, languages: ["English"], like_percentage: "94%", votes: "268 / 312 Votes", experience: 10, fees: 700, next_available: "10.30 AM - 29 Oct, Tue", sort_order: 3 },
  { name: "Dr. Ashik R.", specialities: ["Ophthalmology"], clinics: ["Sai Baba Eye Hospital"], degree: "MD (AIIMS) Phaco & Oculoplasty Surgeon", location: "Raipur", rating: 4.7, available: true, languages: ["English"], like_percentage: "94%", votes: "268 / 312 Votes", experience: 3, fees: 700, next_available: "10.30 AM - 29 Oct, Tue", sort_order: 4 },
  { name: "Dr. Madhu Lata Pardeshi", specialities: ["Ophthalmology"], clinics: ["Sai Baba Eye Hospital"], degree: "MBBS, MS, Ex Glaucoma Fellow (Sankara Eye Hospital, Banglore)", location: "Raipur", rating: 4.7, available: false, languages: ["English"], like_percentage: "94%", votes: "268 / 312 Votes", experience: 10, fees: 700, next_available: "10.30 AM - 29 Oct, Tue", sort_order: 5 },
  { name: "Dr. Stuti Tiwari", specialities: ["Ophthalmology"], clinics: ["Sai Baba Eye Hospital"], degree: "MBBS, MS (Ophthalmology) Fellowship in Cornea & Referactive Surgery", location: "Raipur", rating: 4.7, available: true, languages: ["English"], like_percentage: "94%", votes: "268 / 312 Votes", experience: 3, fees: 700, next_available: "10.30 AM - 29 Oct, Tue", sort_order: 6 },
  { name: "Dr. Hemali Tekani Ruprela", specialities: ["Gynecology"], clinics: ["Sai Baba Women's Hospital"], degree: "MBBS, DGO, DNB, MNAMS, FMAS", location: "Raipur", rating: 4.7, available: true, languages: ["English"], like_percentage: "94%", votes: "268 / 312 Votes", experience: 10, fees: 700, next_available: "10.30 AM - 29 Oct, Tue", sort_order: 7 },
  { name: "Dr. Neha Nupur Gupta", specialities: ["Gynecology"], clinics: ["Sai Baba Women's Hospital"], degree: "MBBS, MS, DNB, FMAS, CIMP", location: "Raipur", rating: 4.7, available: true, languages: ["English"], like_percentage: "94%", votes: "268 / 312 Votes", experience: 10, fees: 700, next_available: "10.30 AM - 29 Oct, Tue", sort_order: 8 },
  { name: "Dr. Minakshi Mandhare", specialities: ["Gynecology"], clinics: ["Sai Baba Women's Hospital"], degree: "MBBS, DGO", location: "Raipur", rating: 4.7, available: true, languages: ["English"], like_percentage: "94%", votes: "268 / 312 Votes", experience: 10, fees: 700, next_available: "10.30 AM - 29 Oct, Tue", sort_order: 9 },
  { name: "Dr. Richa Choubey", specialities: ["Gynecology"], clinics: ["Sai Baba Women's Hospital"], degree: "MBBS, MD Obs & Gynae. DMAS", location: "Raipur", rating: 4.7, available: true, languages: ["English"], like_percentage: "94%", votes: "268 / 312 Votes", experience: 10, fees: 700, next_available: "10.30 AM - 29 Oct, Tue", sort_order: 10 },
];

const JOBS_SEED = [
  { title: "CEO (Chief Executive Officer)", location: "Raipur", category: "Administration", type: "Full Time", date: "02-02-2026", experience: "12 to 15+ years", qualification: "", note: "Only male candidates preferred", link: "mailto:hr@sbhhospital.com" },
  { title: "Pharmacist (Female)", location: "Raipur", category: "Medical", type: "Full Time", date: "02-02-2026", experience: "2+ years", qualification: "B Pharmacy", note: "", link: "mailto:hr@sbhhospital.com" },
  { title: "Manager - Marketing (IVF Unit)", location: "Raipur", category: "Marketing", type: "Full Time", date: "02-02-2026", experience: "8+ years in IVF marketing", qualification: "Graduation & above", note: "", link: "mailto:hr@sbhhospital.com" },
  { title: "Manager - Marketing (Eye Unit)", location: "Raipur", category: "Marketing", type: "Full Time", date: "02-02-2026", experience: "8+ years in Health care marketing", qualification: "Graduation & above", note: "", link: "mailto:hr@sbhhospital.com" },
  { title: "Female Counselor (OBS & Gyneac Unit)", location: "Raipur", category: "Medical", type: "Full Time", date: "02-02-2026", experience: "3+ years from Hospital industry", qualification: "Graduation & above", note: "", link: "mailto:hr@sbhhospital.com" },
];

const GALLERY_SEED = [
  ...Array.from({ length: 8 }, (_, i) => ({ title: `Image ${i + 1}`, category: 'Innogration', url: `/uploads/gallery/placeholder-innogration-${i + 1}.jpg` })),
  ...[9,10,11,12,13,14,15,16,17,20].map((n) => ({ title: `Image ${n}`, category: 'Hospital', url: `/uploads/gallery/placeholder-hospital-${n}.jpg` })),
];

async function runSeed() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const summary = {};

  // 1. Admin user
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@sbhhospital.com';
  const existingAdmin = await Admin.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123', 10);
    await Admin.create({
      name: process.env.DEFAULT_ADMIN_NAME || 'Super Admin',
      email: adminEmail,
      password: hashed,
    });
    console.log(`✅ Admin created: ${adminEmail}`);
    summary.admin = `created (${adminEmail})`;
  } else {
    console.log('ℹ️  Admin already exists, skipping.');
    summary.admin = 'already existed, skipped';
  }

  // 2. Doctors
  const doctorCount = await Doctor.count();
  if (doctorCount === 0) {
    await Doctor.bulkCreate(DOCTORS_SEED);
    console.log(`✅ Seeded ${DOCTORS_SEED.length} doctors.`);
    summary.doctors = `seeded ${DOCTORS_SEED.length}`;
  } else {
    console.log('ℹ️  Doctors table already has data, skipping.');
    summary.doctors = `already had ${doctorCount}, skipped`;
  }

  // 3. Jobs
  const jobCount = await Job.count();
  if (jobCount === 0) {
    await Job.bulkCreate(JOBS_SEED);
    console.log(`✅ Seeded ${JOBS_SEED.length} job postings.`);
    summary.jobs = `seeded ${JOBS_SEED.length}`;
  } else {
    console.log('ℹ️  Jobs table already has data, skipping.');
    summary.jobs = `already had ${jobCount}, skipped`;
  }

  // 4. Gallery (placeholder rows — replace via admin panel with real uploaded images)
  const galleryCount = await GalleryImage.count();
  if (galleryCount === 0) {
    await GalleryImage.bulkCreate(GALLERY_SEED);
    console.log(`✅ Seeded ${GALLERY_SEED.length} gallery placeholder entries (upload real images via admin panel).`);
    summary.gallery = `seeded ${GALLERY_SEED.length}`;
  } else {
    console.log('ℹ️  Gallery table already has data, skipping.');
    summary.gallery = `already had ${galleryCount}, skipped`;
  }

  // 5. Blogs
  const blogCount = await Blog.count();
  if (blogCount === 0) {
    await Blog.bulkCreate(BLOG_POSTS_SEED.map((p) => ({
      permalink: p.permalink,
      title: p.title,
      category: p.category,
      author: p.author,
      author_role: p.authorRole,
      date: p.date,
      excerpt: p.excerpt,
      image: p.image,
      author_image: p.authorImage,
      tags: p.tags || [],
      meta: p.meta || {},
      content: p.content || [],
      status: 'published',
    })));
    console.log(`✅ Seeded ${BLOG_POSTS_SEED.length} blog posts.`);
    summary.blogs = `seeded ${BLOG_POSTS_SEED.length}`;
  } else {
    console.log('ℹ️  Blogs table already has data, skipping.');
    summary.blogs = `already had ${blogCount}, skipped`;
  }

  console.log('🎉 Seeding complete.');
  return summary;
}

module.exports = runSeed;