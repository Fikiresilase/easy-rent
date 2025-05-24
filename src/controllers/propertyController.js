const Property = require('../models/Property');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});


const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpeg, jpg, png, gif) are allowed'));
};


const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter,
}).single('images'); 


const createProperty = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer Error:', err);
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }

    try {
      
      console.log('Request Body:', req.body);
      console.log('Uploaded File:', req.file);

      
      if (!req.body.data) {
        console.error('Missing data field in FormData');
        return res.status(400).json({ message: 'Missing data field in FormData' });
      }

      
      let data;
      try {
        data = JSON.parse(req.body.data);
        console.log('Parsed Data:', data);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        return res.status(400).json({ message: 'Invalid JSON format in data field', error: parseError.message });
      }

      
      const requiredFields = ['title', 'description', 'type', 'price', 'floors', 'specifications', 'location'];
      const missingFields = requiredFields.filter((field) => !data[field]);
      if (missingFields.length > 0) {
        console.error('Missing fields:', missingFields);
        return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
      }

      
      if (!data.specifications || !data.specifications.bedrooms || !data.specifications.bathrooms || !data.specifications.area) {
        console.error('Missing specifications fields');
        return res.status(400).json({
          message: 'Missing required specifications: bedrooms, bathrooms, area',
        });
      }

      
      if (!data.location.address || !data.location.city) {
        console.error('Missing location fields');
        return res.status(400).json({
          message: 'Missing required location fields: address, city',
        });
      }

      
      const numericFields = [
        { key: 'price', value: data.price },
        { key: 'floors', value: data.floors },
        { key: 'specifications.bedrooms', value: data.specifications.bedrooms },
        { key: 'specifications.bathrooms', value: data.specifications.bathrooms },
        { key: 'specifications.area', value: data.specifications.area },
      ];
      const invalidNumericFields = numericFields.filter(({ key, value }) => isNaN(Number(value)) || Number(value) < 0);
      if (invalidNumericFields.length > 0) {
        console.error('Invalid numeric fields:', invalidNumericFields);
        return res.status(400).json({
          message: `Invalid numeric fields: ${invalidNumericFields.map(f => f.key).join(', ')}`,
        });
      }

      
      const images = req.file ? [{ url: req.file.path.replace(/\\/g, '/') }] : [];

      
      const property = new Property({
        ...data,
        images, 
      });

      
      await property.save();
      console.log('Property Created:', property);
      res.status(201).json(property);
    } catch (error) {
      console.error('Error creating property:', {
        body: req.body,
        file: req.file,
        error: error.message,
      });
      res.status(400).json({ message: 'Error creating property', error: error.message });
    }
  });
};


const getProperties = async (req, res) => {
  try {
    const {
      type,
      minPrice,
      maxPrice,
      location,
      floors,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ownerOnly,
      ownerId,
    } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (location) {
      filter['location.city'] = new RegExp(location, 'i');
    }
    if (floors) filter.floors = Number(floors);
    if (ownerOnly === 'true' && req.user) {
      filter.ownerId = req.user._id;
    }
    if (ownerId) {
      console.log(ownerId, 'OWNER ID IS');
      filter.ownerId = ownerId;
    }

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const properties = await Property.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('ownerId', 'email profile');

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProperties: total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
};


const getProperty = async (req, res) => {
  console.log('property', 'smkm');
  try {
    const property = await Property.findById(req.params.id).populate('ownerId', 'email profile');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching property', error: error.message });
  }
};


const updateProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'price', 'location', 'floors', 'amenities', 'status', 'specifications'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach((update) => (property[update] = req.body[update]));
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(400).json({ message: 'Error updating property', error: error.message });
  }
};


const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting property', error: error.message });
  }
};


const searchProperties = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const properties = await Property.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(Number(limit))
      .populate('ownerId', 'email profile');

    const total = await Property.countDocuments({ $text: { $search: query } });

    res.json({
      properties,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProperties: total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error searching properties', error: error.message });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
};