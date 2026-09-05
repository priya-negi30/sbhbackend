const { Doctor } = require('../models');
const { toAbsoluteUrl, parseMaybeJson } = require('../utils/helpers');
const { del } = require('@vercel/blob');
const makeUploader = require('../middleware/upload'); // Import your uploader middleware

// Instantiate the doctor uploader helper instance
const doctorUploader = makeUploader('doctors');

function serialize(req, doctor) {
  const d = doctor.toJSON();
  // If d.image is already a full Vercel Blob URL (http/https), keep it as is;
  // otherwise, fall back to toAbsoluteUrl for relative legacy paths.
  if (d.image && !d.image.startsWith('http://') && !d.image.startsWith('https://')) {
    d.image = toAbsoluteUrl(req, d.image);
  }
  return d;
}

// Public: GET /api/doctors (only active by default, supports ?all=true for admin views)
exports.list = async (req, res, next) => {
  try {
    const where = req.query.all === 'true' ? {} : { status: 'active' };
    const doctors = await Doctor.findAll({
      where,
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
    });
    res.json(doctors.map((d) => serialize(req, d)));
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(serialize(req, doctor));
  } catch (err) {
    next(err);
  }
};

// Admin: POST /api/doctors
exports.create = async (req, res, next) => {
  try {
    const body = req.body;

    // Handle image upload to Vercel Blob if a file was provided
    let imageUrl = body.image || null;
    if (req.file) {
      imageUrl = await doctorUploader.uploadToBlob(req.file);
    }

    const doctor = await Doctor.create({
      name: body.name,
      specialities: parseMaybeJson(body.specialities, []),
      clinics: parseMaybeJson(body.clinics, []),
      degree: body.degree,
      location: body.location,
      rating: body.rating || 5,
      available: body.available === 'false' ? false : Boolean(body.available ?? true),
      languages: parseMaybeJson(body.languages, []),
      like_percentage: body.like_percentage,
      votes: body.votes,
      experience: body.experience || 0,
      fees: body.fees || 0,
      next_available: body.next_available,
      status: body.status || 'active',
      sort_order: body.sort_order || 0,
      image: imageUrl,
    });

    res.status(201).json(serialize(req, doctor));
  } catch (err) {
    next(err);
  }
};

// Admin: PUT /api/doctors/:id
exports.update = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const body = req.body;

    const fields = ['name', 'degree', 'location', 'rating', 'like_percentage', 'votes',
      'experience', 'fees', 'next_available', 'status', 'sort_order'];
    fields.forEach((f) => {
      if (body[f] !== undefined) doctor[f] = body[f];
    });

    if (body.available !== undefined) doctor.available = body.available === 'false' ? false : Boolean(body.available);
    if (body.specialities !== undefined) doctor.specialities = parseMaybeJson(body.specialities, doctor.specialities);
    if (body.clinics !== undefined) doctor.clinics = parseMaybeJson(body.clinics, doctor.clinics);
    if (body.languages !== undefined) doctor.languages = parseMaybeJson(body.languages, doctor.languages);

    if (req.file) {
      // Remove old Vercel Blob image if it exists
      if (doctor.image && (doctor.image.includes('vercel-storage.com') || doctor.image.startsWith('http'))) {
        try {
          await del(doctor.image);
        } catch (delErr) {
          console.error('Failed to delete old blob:', delErr.message);
        }
      }

      // Upload new image to Vercel Blob
      doctor.image = await doctorUploader.uploadToBlob(req.file);
    }

    await doctor.save();
    res.json(serialize(req, doctor));
  } catch (err) {
    next(err);
  }
};

// Admin: DELETE /api/doctors/:id
exports.remove = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Remove Vercel Blob image if it exists
    if (doctor.image && (doctor.image.includes('vercel-storage.com') || doctor.image.startsWith('http'))) {
      try {
        await del(doctor.image);
      } catch (delErr) {
        console.error('Failed to delete blob on removal:', delErr.message);
      }
    }

    await doctor.destroy();
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    next(err);
  }
};