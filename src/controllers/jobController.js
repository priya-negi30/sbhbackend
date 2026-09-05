const { Job, JobApplication } = require('../models');
const { toAbsoluteUrl } = require('../utils/helpers');
const makeUploader = require('../middleware/upload');
const { sendJobApplicationEmail } = require('../utils/mailer');

// Instantiate the resume uploader helper instance (uploads to Vercel Blob under uploads/resumes/)
const resumeUploader = makeUploader('resumes', { allowDocs: true });

// Public: GET /api/jobs (only "open" by default; ?all=true for admin)
exports.list = async (req, res, next) => {
  try {
    const where = req.query.all === 'true' ? {} : { status: 'open' };
    const jobs = await Job.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    next(err);
  }
};

// Admin: POST /api/jobs
exports.create = async (req, res, next) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
};

// Admin: PUT /api/jobs/:id
exports.update = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    await job.update(req.body);
    res.json(job);
  } catch (err) {
    next(err);
  }
};

// Admin: DELETE /api/jobs/:id
exports.remove = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    await job.destroy();
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Public: POST /api/jobs/:id/apply  (multipart form, field "resume")
exports.apply = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (!req.file) return res.status(400).json({ message: 'Resume file is required' });

    const body = req.body;

    // Upload resume to Vercel Blob (uploads/resumes/...) and store the public URL
    const resumeUrl = await resumeUploader.uploadToBlob(req.file);

    const application = await JobApplication.create({
      job_id: job.id,
      job_title: job.title,
      fname: body.fname,
      gender: body.gender,
      current_location: body.currentLocation,
      address: body.address,
      current_company: body.currentCompany,
      current_designation: body.currentDesignation,
      current_ctc: body.currentCTC,
      contact_no: body.contactNo,
      marital_status: body.maritalStatus,
      email: body.email,
      qualification: body.qualification,
      notice_period: body.noticePeriod,
      resume_path: resumeUrl,
    });

    // Notify HR by email. Failure to send email should not fail the application
    // submission itself, since the application is already safely stored in the DB.
    try {
      await sendJobApplicationEmail({ application: application.toJSON(), resumeUrl });
    } catch (mailErr) {
      console.error('Failed to send HR notification email:', mailErr.message);
    }

    res.status(201).json({ message: 'Application submitted successfully', id: application.id });
  } catch (err) {
    next(err);
  }
};

// Admin: GET /api/jobs/:id/applications
exports.listApplications = async (req, res, next) => {
  try {
    const applications = await JobApplication.findAll({
      where: { job_id: req.params.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(applications.map((a) => {
      const j = a.toJSON();
      j.resume_path = toAbsoluteUrl(req, j.resume_path);
      return j;
    }));
  } catch (err) {
    next(err);
  }
};

// Admin: GET /api/applications (all applications across jobs)
exports.listAllApplications = async (req, res, next) => {
  try {
    const applications = await JobApplication.findAll({
      include: [{ model: Job, as: 'job', attributes: ['id', 'title', 'location'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(applications.map((a) => {
      const j = a.toJSON();
      j.resume_path = toAbsoluteUrl(req, j.resume_path);
      return j;
    }));
  } catch (err) {
    next(err);
  }
};

// Admin: PATCH /api/applications/:id/status
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await JobApplication.findByPk(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    application.status = req.body.status;
    await application.save();
    res.json(application);
  } catch (err) {
    next(err);
  }
};